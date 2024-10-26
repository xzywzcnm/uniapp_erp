<template>
  <div>
    <view
      class="uni-input-wrapper"
      :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
    >
      <input
        class="uni-input"
        v-model.trim="orderNo"
        @confirm="confirmNext"
        :focus="inputFocus"
        placeholder="扫描出库单领取"
      />
      <view class="iconfont text-16" @click="scanCode()">&#xe612;</view>
    </view>
    <view class="content-title"
      >待生成补拣任务
      <span class="ml10" v-if="list.length > 0">({{ list.length }})</span></view
    >
    <view class="mu-divider"></view>
    <div class="content-box" v-if="list && list.length > 0">
      <view class="pickingItem" v-for="(item, index) in list" :key="index">
        <view class="d-flex justify-content-between pickingHead">
          <text class="phTitle">出库单号：{{ item.pickingNo }}</text>
          <text class="remove" @click="deletePick(index)">移除</text>
        </view>
        <view class="mu-divider"></view>
        <view class="pickingItemContent">
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">拣货单类型：</text>
            <text>{{ getPackageType(item.packageType) }}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">物流方式：</text>
            <text>{{ item.logisticsDealerName }}{{ item.logisticsMailName }}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">SKU数量：</text>
            <text>{{ item.goodsSkuNumber }}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">物品数量：</text>
            <text>{{ item.goodsQuantityNumber }}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">异常处理库区：</text>
            <text>{{
              item.exceptionHandBlockNames ? item.exceptionHandBlockNames.join(",") : ""
            }}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">异常处理库位：</text>
            <text>{{
              item.exceptionHandLocationNames
                ? item.exceptionHandLocationNames.join(",")
                : ""
            }}</text>
          </view>
        </view>
      </view>
    </div>
    <no-data v-else :text="'无数据，请扫描出库单号'" class="mt10"></no-data>
    <view class="bottomBit d-flex justify-content-center align-items-center">
      <button
        type="primary"
        style="background-color: green !important"
        size="mini"
        :disabled="listTalg"
        @click="startPickUp"
      >
        开始补拣
      </button>
      <button type="primary" size="mini" @click="openPickLog">查看补拣记录</button>
    </view>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/mixin/common_mixin";
import { getStorage } from "@/utils";
import noData from "../../../components/common/nodata";
export default {
  name: "pickUp",
  mixins: [Mixin],
  components: {
    noData,
  },
  data() {
    return {
      inputFocus: true,
      getLoad: false,
      orderNo: "",
      submitLoad: false,
      list: [],
      listTalg: true,
    };
  },
  created() {},
  props: {},
  watch: {},
  methods: {
    deletePick(index) {
      /**
       * @Description: 移除
       * @author gan
       * @date: 2020/9/9 20:55
       * @params:
       */
      this.list.splice(index, 1);
    },
    scanCode() {
      /**
       * 扫一扫
       * type 0 出库单号
       * type 1异常处理库位
       * */
      let v = this;
      uni.scanCode({
        success: function (res) {
          v.orderNo = res.result;
          v.getList();
        },
        fail: function (error) {
          console.log("error:", error);
        },
      });
    },
    getPackageType(type) {
      /**
       * @Description: 拣货类型
       * @author gan
       * @date: 2020/9/8 18:31
       */
      let obj = {
        SS: "单品单件",
        SM: "单品多件",
        MM: "多品多件",
      };
      return obj[type];
    },
    getList() {
      /**
       * @Description: app通过出库单查询待生成补拣单的包裹
       * @author gan
       * @date: 2020/9/8 19:41
       * @params:
       */
      let v = this;
      if (v.getLoad) return;
      v.getLoad = true;
      if (v.list && v.list.some((i) => i.pickingNo === v.orderNo)) {
        v.showToast("出库单已扫描");
        v.getLoad = false;
        return;
      }
      const obj = {
        url: api.queryWaitSupplementPickingPackage,
        type: "POST",
        data: {
          packageCode: v.orderNo,
          warehouseId: getStorage("newErpWarehouse").warehouseId,
        },
      };
      uni.showLoading();
      v.ajaxData(obj).then((response) => {
        uni.hideLoading();
        v.getLoad = false;
        if (response.data.code === 0 && response.data.datas) {
          v.list.push(response.data.datas);
          v.listTalg = false;
          v.openSound("001");
        } else {
          v.openSound("002");
          v.showToast("查询失败");
          v.listTalg = true;
        }
        v.orderNo = "";
      });
    },
    confirmNext() {
      this.getList();
    },
    startPickUp() {
      /**
       * @Description: 开始补拣任务
       * @author gan
       * @date: 2020/9/8 19:59
       * @params:
       */
      let v = this;

      if (!v.list || v.list.length === 0) {
        v.showToast("请扫描出库单");
        return;
      }
      uni.showLoading({
        title: "数据提交中",
      });
      if (v.submitLoad) return;
      v.submitLoad = true;
      const obj = {
        url: api.receiveSupplementPickingAndStart,
        type: "POST",
        data: {
          packageIdList: v.list.map((i) => i.pickingId),
          warehouseId: getStorage("newErpWarehouse").warehouseId,
        },
      };
      v.ajaxData(obj).then((response) => {
        v.submitLoad = false;
        uni.hideLoading();
        if (response.data.code === 0) {
          this.store.commit(
            "supplementPickingId",
            response.data.datas.supplementPickingId
          );
          v.gotoPage("/pages/workspace/abnormal/myPickUpTask");
        } else if (response.data.code === 116317) {
          v.showToast("只能开启属于自己的补拣单且不能同时开启多个");
        } else if (response.data.code === 116319) {
          v.showToast("选择的包裹有已经生成补拣单且未完成的");
        } else {
          v.showToast("操作失败");
        }
      });
    },
    openPickLog() {
      this.gotoPage("/pages/workspace/abnormal/pickUpRecord");
    },
  },
};
</script>

<style scoped>
.content-box {
  padding-bottom: 50px;
}
.footer-btn {
  padding: 10px 20px;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-content: center;
}
.remove {
  color: red;
}
.remove:active {
  color: darkred;
}
.pickingItem {
  margin-bottom: 15px;
}
.pickingHead {
  font-size: 28rpx;
  padding: 20rpx;
  background-color: #fff;
}
.phTitle {
  font-weight: bold;
}
.pickingItemContent {
  background-color: #fff;
  font-size: 12px;
  padding: 5px 10px;
  position: relative;
}
.pickingItemContent .jg {
  padding: 0 5px;
}
.content-title {
  display: flex;
  margin-top: 10px;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -webkit-flex-direction: row;
  flex-direction: row;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  padding: 0 10px 0 15px;
  height: 50px;
  position: relative;
  background-color: #f8f8f8;
  font-weight: 400;
}
.content-title:before {
  position: absolute;
  left: 5px;
  top: 16px;
  width: 2px;
  height: 20px;
  display: inline-block;
  content: "";
  background-color: #868686;
}
.uni-input-wrapper {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  padding: 8px 13px;
  flex-direction: row;
  flex-wrap: nowrap;
  background-color: #ffffff;
  box-sizing: border-box;
  border-bottom: 1px solid #ddd;
}
.uni-input-wrapper:last-child {
  border-bottom: 0;
}
.uni-input {
  height: 28px;
  line-height: 28px;
  font-size: 15px;
  padding: 0px;
  flex: 1;
  background-color: #ffffff;
}

.uni-icon {
  font-family: uniicons;
  font-size: 24px;
  font-weight: normal;
  font-style: normal;
  width: 24px;
  height: 24px;
  line-height: 24px;
  color: #999999;
  margin-top: 2px;
}
</style>
