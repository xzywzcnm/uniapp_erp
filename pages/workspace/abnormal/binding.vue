<template >
  <div>
    <view class="pd-box">
      <view class="uni-form-item uni-column inventory-move">
        <view
          class="uni-input-wrapper"
          :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
        >
          <input
            class="uni-input"
            v-model.trim="orderNo"
            @confirm="confirmNext"
            :focus="inputFocus"
            placeholder="出库单号"
          />
          <view class="iconfont text-16" @click="scanCode('1')">&#xe612;</view>
        </view>
        <view
          class="uni-input-wrapper"
          :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
        >
          <input
            class="uni-input"
            v-model.trim="abnormalLocation"
            @confirm="confirmSLocation"
            :focus="inputFocus1"
            placeholder="异常处理库位"
          />
          <view class="iconfont text-16" @click="scanCode('2')">&#xe612;</view>
        </view>
      </view>
    </view>
    <view class="pd-box">
      <view class="pickingItem" v-if="details">
        <view class="pickingHead">
          <view class="phTitle">捡货单号：{{ details.packageCode }}</view>
          <view
            >拣货单类型：{{ details.skuQuantity > 1 ? "多品" : "单品" }}</view
          >
          <view
            >物流方式：{{ details.carrierName }}>>>{{
              details.carrierShippingMethodName
            }}</view
          >
        </view>
        <view class="mu-divider"></view>
        <view
          class="pickingItemContent"
          v-for="(item, index) in details.goodsList"
          :key="index"
        >
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">SKU：</text>
            <text>{{ item.sku }}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">中文描述：</text>
            <text>{{ item.goodsCnDesc }}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">英文描述：</text>
            <text>{{ item.goodsEnDesc }}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <view>分配数量：{{ item.doneAssignedNumber }}</view>
            <view class="jg">|</view>
            <view>已拣货数量：{{ item.actualPickingNumber }}</view>
            <view class="jg">|</view>
            <view
              >未拣货数量：{{
                item.doneAssignedNumber - item.actualPickingNumber
              }}</view
            >
          </view>
        </view>
      </view>
      <no-data v-else :text="'无数据，请扫描出库单号'" class="mt10"></no-data>
    </view>
    <view
      class="bottomBit d-flex justify-content-center align-items-center"
      v-if="warehouseLocationId"
    >
      <button class="success" type="primary" size="mini" @click="bindLocation">
        提交
      </button>
    </view>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/mixin/common_mixin";
import noData from "../../../components/common/nodata";
import { getStorage } from "@/utils";
export default {
  name: "binding",
  mixins: [Mixin],
  components: {
    noData,
  },
  data() {
    return {
      orderNo: "",
      abnormalLocation: "",
      warehouseLocationId: "",
      inputFocus: true,
      inputFocus1: false,
      details: null,
      load: false,
    };
  },
  created() {},
  props: {},
  watch: {},
  methods: {
    // 设置库位
    confirmSLocation() {
      this.setLocation(this.abnormalLocation);
    },
    setLocation(name) {
      /**
       * 设置库位
       * @params
       * name 库位名称
       * */
      let v = this;
      name = name ? name.trim() : name;
      if (!name) {
        v.showToast("内容为空！");
        return;
      }
      this.getWarehouseLocationId(name, "", 2).then((data) => {
        if (data) {
          this.warehouseLocationId = data.warehouseLocationId;
          v.openSound("001");
          uni.showToast({
            title: "设置成功",
            duration: 2000,
          });
        } else {
          this.abnormalLocation = "";
          this.warehouseLocationId = "";
          v.openSound("002");
          uni.showToast({
            title: "无匹配库位",
            icon: "none",
            duration: 2000,
          });
        }
      });
    },
    confirmNext() {
      if (!this.orderNo) {
        this.showToast("请扫描出库单号！");
        return;
      }
      this.getList();
    },
    bindLocation() {
      /**
       * @Description: 绑定异常库位
       * @author gan
       * @date: 2020/9/8 17:48
       * @params:
       */
      let v = this;
      if (!v.details) {
        v.showToast("请扫描出库单");
        return;
      }
      if (v.load) return;
      v.load = true;
      uni.showLoading({
        title: "数据加载中",
      });
      const obj = {
        url: api.bind_packageExceptionHandLocation,
        type: "POST",
        data: {
          packageCodeList: [], // 包裹编号列表
          packageIdList: v.details.goodsList.map((i) => i.packageId), // 包裹id列表
          warehouseId: getStorage("newErpWarehouse").warehouseId,
          warehouseLocationId: v.warehouseLocationId,
        },
      };
      v.ajaxData(obj).then((response) => {
        v.load = false;
        uni.hideLoading();
        if (response.data.code === 0) {
          v.resetData();
          v.showToastIcon("绑定成功");
        } else if (response.data.code === 510001) {
          v.showToast("库位不存在或已停用");
        } else if (response.data.code === 510003) {
          v.showToast("库位不是异常处理库位");
        } else {
          v.showToast("绑定失败");
        }
      });
    },
    resetData() {
      /**
       * @Description: 清空数据
       * @author gan
       * @date: 2020/9/9 10:31
       * @params:
       */
      let v = this;
      v.orderNo = "";
      v.abnormalLocation = "";
      v.warehouseLocationId = "";
      v.details = null;
      v.inputFocus = true;
    },
    getList() {
      /**
       * @Description: 查询包裹
       * @author gan
       * @date: 2020/9/8 17:49
       * @params:
       */
      let v = this;
      const obj = {
        url: api.queryPackageByPackageCode,
        type: "POST",
        data: {
          packageCode: v.orderNo,
          pickingOutStatus: 2, // 拣货出库状态(1:正常 2:异常 默认1) ,
          warehouseId: getStorage("newErpWarehouse").warehouseId,
        },
      };
      v.ajaxData(obj).then((response) => {
        if (response.data.code === 0 && response.data.datas) {
          v.openSound("001");
          v.showToastIcon("操作成功");
          v.details = response.data.datas;
          v.inputFocus1 = true;
        } else if (response.data.code === 111123) {
          v.openSound("002");
          v.showToast("包裹已作废");
          v.details = null;
        } else {
          v.openSound("002");
          v.showToast("查询失败");
          v.details = null;
        }
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
    scanCode(type) {
      /**
       * 扫一扫
       * type 0 出库单号
       * type 1异常处理库位
       * */
      let v = this;
      uni.scanCode({
        success: function (res) {
          if (type === "0") {
            v.orderNo = res.result;
            v.getList();
          } else if (type === "1") {
            v.abnormalLocation = res.result;
            v.setLocation(res.result);
          }
        },
        fail: function (error) {
          console.log("error:", error);
        },
      });
    },
  },
};
</script>

<style scoped>
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
.pd-box .uni-icon {
  margin-top: 2px;
}
.bottom-button-fix {
  position: fixed;
  bottom: 0;
  width: 100%;
  left: 0;
  z-index: 999;
  background-color: #fff;
}
.bottom-button-fix button {
  width: 100%;
}
.pd-box {
}
.uni-media-list-logo {
  width: 180rpx;
  height: 140rpx;
  margin-top: 10rpx;
}

.uni-media-list-body {
  height: auto;
  justify-content: space-around;
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
}
</style>
