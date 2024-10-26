<template>
  <view>
    <view v-if="details">
      <view class="pickingItem">
        <view class="d-flex justify-content-between pickingHead">
          <text class="phTitle">补拣任务号：{{ details.supplementPickingNo }}</text>
        </view>
        <view v-for="(item, index) in details.supplementPickingDetailBoList" :key="index">
          <view class="mu-divider"></view>
          <view class="pickingItemContent" @click="startPicking(item)">
            <view class="d-flex justify-content-start pItem">
              <text class="pItemTitle">SKU：</text>
              <text>{{ item.goodsSku }}</text>
            </view>
            <view
              class="d-flex justify-content-start pItem"
              v-if="item.barCode && !['S1'].includes(item.pickingType)"
            >
              <text class="pItemTitle">条码编码：</text>
              <text class="flexOne" style="padding-right: 70px">{{ item.barCode }}</text>
            </view>
            <view class="d-flex justify-content-start pItem">
              <text class="pItemTitle">货品：</text>
              <text>{{ item.goodsCnDesc }}</text>
            </view>
            <view class="d-flex justify-content-start pItem">
              <text class="pItemTitle">货位：</text>
              <text>{{ item.warehouseLocationCode }}</text>
            </view>
            <view class="d-flex justify-content-start pItem">
              <view>待拣货数量：{{ item.expectPickingNumber }}</view>
              <view class="jg">|</view>
              <view>已拣货数量：{{ item.donePickingNumber }}</view>
            </view>
            <view class="goToPicking">
              <text v-if="item.donePickingNumber === 0">开始拣货</text>
              <text
                style="color: #ff6a00"
                v-else-if="item.expectPickingNumber > item.donePickingNumber"
                >部分拣货</text
              >
              <text
                style="color: green"
                v-else-if="item.expectPickingNumber === item.donePickingNumber"
                >拣货完成</text
              >
              <text
                v-if="item.expectPickingNumber !== item.donePickingNumber"
                class="icon iconfont"
                >&#xe636;</text
              >
            </view>
          </view>
        </view>
      </view>
      <view class="bottomBit row no-gutters">
        <view
          class="d-flex justify-content-center align-tiems-center"
          style="width: 100%"
        >
          <button type="primary" size="mini" @click="completePickup">完成补拣</button>
        </view>
      </view>
    </view>
    <no-data v-else :text="'无数据'" class="mt10"></no-data>
  </view>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/mixin/common_mixin";
import barcodeList_mixin from "@/mixin/barcodeList_mixin";
import noData from "../../../components/common/nodata";
import { getStorage } from "@/utils";
export default {
  name: "myPickUpTask",
  mixins: [Mixin, barcodeList_mixin],
  components: {
    noData,
  },
  data() {
    return {
      details: null,
    };
  },
  created() {},
  onShow() {
    this.getPickUpList(this.store.state.supplementPickingId);
  },
  props: {},
  watch: {},
  methods: {
    completePickup() {
      /**
       * @Description: 完成补拣
       * @author gan
       * @date: 2020/9/9 15:50
       * @params:
       */
      let v = this;
      const obj = {
        url: api.finishSupplementPicking,
        type: "PUT",
        data: {
          supplementPickingId: v.details.supplementPickingId,
        },
      };
      uni.showLoading({
        title: "请等待...",
      });
      v.ajaxData(obj)
        .then((response) => {
          if (response.data.code === 0) {
            v.showToastIcon("操作成功");
            uni.navigateBack();
          } else if (response.data.code === 116318) {
            v.showToast("只有补拣中的可以修改");
          } else {
            v.showToastIcon("操作失败");
          }
        })
        .finally(() => {
          uni.hideLoading();
        });
    },
    getPickUpList(id) {
      let v = this;
      const obj = {
        url: api.detailSupplementPicking + id,
        type: "GET",
      };
      uni.showLoading({
        title: "数据加载中",
      });
      v.ajaxData(obj)
        .then(async (response) => {
          if (response.data.code === 0) {
            let dataResult = response.data.datas || {};
            let list = dataResult.supplementPickingDetailBoList || [];
            let barcodeList = list.filter((k) => k.barCode);
            if (!barcodeList.length) {
              await v.getBarcodeBeSku(list);
              list.forEach((k) => (k.pickingType = "S1"));
            }
            v.details = dataResult;
            uni.hideLoading();
          } else {
            uni.hideLoading();
          }
        })
        .catch(() => {
          uni.hideLoading();
        });
    },
    startPicking(item) {
      if (item.expectPickingNumber > 0) {
        this.store.commit("chosePickData", item);
        this.gotoPage("/pages/workspace/abnormal/picking");
      }
    },
  },
};
</script>

<style scoped>
.pickingItem {
  margin-bottom: 15px;
}
.goToPicking {
  position: absolute;
  right: 20upx;
  top: 30%;
  z-index: 1;
  font-size: 30upx;
  color: #333333;
  background-color: rgba(255, 255, 255, 0.6);
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
</style>
