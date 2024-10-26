<template>
  <view>
    <view class="scanWrap">
      <view class="uni-form-item uni-column">
        <view class="uni-input-wrapper" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }">
          <input class="uni-input" v-model.trim="searchValue" :focus="inputFocus" @confirm="scanPack()"
            placeholder="请扫描需归库的SKU" />
          <view class="iconfont text-16" @click="scanCode">&#xe612; </view>
        </view>
      </view>
    </view>
    <view class="operation-progress" v-if="items.length > 0">
      <div class="text">操作进度</div>
      <div class="progress-box">
        <div class="progress-background"></div>
        <div class="progress-progress" :style="{ width: progressStyle }"></div>
      </div>
      <span class="text1">{{ operationProgress }}</span>
    </view>
    <view class="pd-box pb50">
      <view class="uni-list">
        <view class="uni-list-cell" hover-class="uni-list-cell-hover" v-for="(value, key) in items" :key="key">
          <view class="uni-media-list" @click="gotoStockReturnDetails(value)">
            <image class="uni-media-list-logo" :src="setImgPath(value.goodsUrl)"></image>
            <view class="uni-media-list-body uni-media-list-package">
              <view class="text-box">SKU：<span class="text sku">{{ value.goodsSku }}</span></view>
              <view class="text-box" v-if="value.barCode &&
                ['O12', 'O14', 'O15', 'O16'].includes(value.pickingType)
                ">
                条码编码：
                <span class="text sku">{{ value.barCode }}</span>
              </view>
              <view class="text-box">货品：<span class="text sku">{{ value.goodsCnDesc }}</span></view>
              <view class="text-box">库区：<span class="text sku">{{ warehouseBlockName(value) }}</span>
              </view>
              <view class="text-box">库位：<span class="text sku">{{
                value.warehouseLocationName
              }}</span></view>
              <view class="text-box">批次号：<span class="text">{{ value.receiptBatchNo }}</span></view>
              <view class="text-box">归库数量：<span class="text">{{ value.quantity }}</span></view>
              <view class="text-box" v-if="value.scannedQuantity && value.scannedQuantity > 0">已归库数量：<span class="text">{{
                value.scannedQuantity }}</span></view>
            </view>
            <view class="right-box">
              <i class="iconfont" v-if="value._CHECKED" style="
                  position: absolute;
                  right: 0;
                  top: -7px;
                  font-size: 20px;
                  color: #00acc1;
                ">&#xe61d;</i>
              <text v-else class="icon iconfont"> &#xe655; </text>
            </view>
          </view>
        </view>
      </view>
      <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
    </view>
    <view class="bottomBit d-flex justify-content-center align-items-center">
      <button class="success" type="primary" size="mini" @click="markFinish">
        标记归库完成
      </button>
    </view>
  </view>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/mixin/common_mixin";
import { setStorage, getStorage, removeStorage } from "@/utils";

export default {
  name: "startStockReturn",
  mixins: [Mixin],
  data() {
    return {
      items: [],
      cacheData: [], // 缓存数据
      searchValue: "",
      inputFocus: true,
      loadingType: 0,
      contentText: {
        contentdown: "上拉显示更多",
        contentrefresh: "正在加载...",
        contentnomore: "没有更多数据了",
      },
    };
  },
  created() { },
  components: {},
  computed: {
    operationProgress() {
      return (
        this.cacheData.reduce((i, j) => {
          return i + (j._CHECKED ? 1 : 0);
        }, 0) +
        "/" +
        this.cacheData.length
      );
    },
    progressStyle() {
      let number =
        (this.cacheData.reduce((i, j) => {
          return i + (j._CHECKED ? 1 : 0);
        }, 0) /
          this.cacheData.length) *
        100;
      if (number > 0) {
        return number + "%";
      } else {
        return 0;
      }
    },
  },
  props: {},
  watch: {},
  methods: {
    gotoStockReturnDetails(value) {
      /**
       * params
       * packageRegressProductId 标识
       * */
      if (value._CHECKED) return;
      this.gotoPage(
        "/pages/workspace/stockReturnDetailsProcess?packageRegressProductId=" +
        value.packageRegressProductId
      );
    },
    warehouseBlockName(item) {
      return item.warehouseBlockNames != null
        ? item.warehouseBlockNames.join(",")
        : item.warehouseBlockName;
    },
    markFinish() {
      /**
       * 标记归库完成
       * desc 标记归库和扫描sku没关系，只是在前端走个流程
       * */
      let valid = this.cacheData.some((i) => !i._CHECKED); // 是否存在未扫描sku
      let v = this;
      uni.showModal({
        title: "提示",
        content: valid ? "存在归库单未拣完，是否仍要标记归库完成" : "是否标记归库完成",
        success: function (res) {
          if (res.confirm) {
            const obj = {
              url: api.get_packageRegressProductEditStatus, // 标记归库完成
              type: "post",
              data: [v.cacheData[0].regressProductNumber],
            };
            uni.showLoading();
            v.ajaxData(obj).then((response) => {
              uni.hideLoading();
              if (response.data.code === 0) {
                uni.showToast({
                  icon: "none",
                  title: "标记成功",
                  duration: 1500,
                });
                removeStorage("stockReturn__" + v.cacheData[0].regressProductNumber); // 清除归库缓
                uni.navigateBack();
              } else if (response.data.code === 554131) {
                uni.showToast({
                  title: "库位正在盘点中",
                  icon: "none",
                  duration: 2000,
                });
              } else {
                uni.showToast({
                  icon: "none",
                  title: "标记失败",
                  duration: 1500,
                });
              }
            });
          }
        },
      });
    },
    scanPack() {
      let v = this;
      let packageRegressProductId = null;
      this.cacheData.forEach((i) => {
        // 扫描的条码等于“条码编码”或等于“SKU”，都可以识别拣货
        let barCodeList = i.barCode ? i.barCode.split(",") : [];
        if (i.goodsSku === v.searchValue || barCodeList.includes(v.searchValue)) {
          packageRegressProductId = i.packageRegressProductId;
        }
      });
      if (packageRegressProductId) {
        v.openSound("001");
        v.gotoPage(
          "/pages/workspace/stockReturnDetailsProcess?packageRegressProductId=" +
          packageRegressProductId
        );
      } else {
        v.openSound("002");
        v.showToast("没有找到相关SKU");
      }
    },
    scanCode() {
      // 扫一扫
      let v = this;
      uni.scanCode({
        success: function (res) {
          v.searchValue = res.result;
          v.scanPack();
        },
        fail: function (error) {
          console.log("error:", error);
        },
      });
    },
    onReachBottom() {
      let v = this;
      if (v.loadingType !== 0) {
        return;
      }
      v.getList();
    },
    getList() {
      if (
        getStorage(
          "stockReturn__" + this.store.state.stockReturnList[0].regressProductNumber
        )
      ) {
        // 如果存在归库缓存
        let data = JSON.parse(
          getStorage(
            "stockReturn__" + this.store.state.stockReturnList[0].regressProductNumber
          )
        );
        this.cacheData = this.store.state.stockReturnList.map((i) => {
          data.forEach((j) => {
            if (i.packageRegressProductId === j.packageRegressProductId) {
              i.scannedQuantity = j.scannedQuantity;
              i._CHECKED = j._CHECKED;
            }
          });
          return i;
        });
      } else {
        this.cacheData = JSON.parse(JSON.stringify(this.store.state.stockReturnList));
      }
      this.loadingType = 1;
      let limit = 10;
      if (this.items.length + limit >= this.cacheData.length) {
        this.items = this.cacheData.map((i) => i);
        this.loadingType = 2;
      } else {
        this.items = [
          ...this.items,
          ...this.cacheData.slice(this.items.length, this.items.length + limit),
        ];
        this.loadingType = 0;
      }
    },
  },
  onShow() {
    let v = this;
    v.inputFocus = true;
    v.getList();
    uni.setNavigationBarTitle({
      title: `${v.store.state.stockReturnList[0].regressProductNumber}`,
    });
  },
};
</script>

<style scoped>
/* 进度 */
.right-box {
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-box {
  width: 100%;
  height: 15px;
  position: relative;
}

.progress-background {
  height: 100%;
  width: 100%;
  background-color: #999999;
}

.progress-progress {
  position: absolute;
  left: 0;
  top: 0;
  transition: 0.3s ease-in;
  height: 100%;
  width: 0%;
  background-color: #00acc1;
}

/* end */
.operation-progress .text {
  flex-shrink: 0;
  padding: 0 6px;
}

.operation-progress .text1 {
  flex-shrink: 0;
  padding-left: 6px;
  font-weight: bold;
}

.operation-progress {
  margin-bottom: 5px;
  margin-right: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.operation-progress span {
  color: #0a98d5;
}

.scanWrap .uni-icon {
  margin-top: 2px;
}

.uni-input-wrapper {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  width: auto;
  padding: 8px 13px;
  flex-direction: row;
  flex-wrap: nowrap;
  background-color: #ffffff;
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

.pd-box .uni-icon {
  margin-top: 2px;
}

.inventory-operation-content .checkbox-group {
  width: auto;
}

.del-icon {
  position: absolute;
  right: 5px;
  top: 5px;
}

.success {
  background-color: #00c853;
}

.inventory-operation-content {
  margin: 12px;
  background-color: #fff;
}

.pd-box {
  margin: 0 0 12px 0 !important;
}

.p5 {
  padding: 5px;
}

.uni-media-list-logo {
  width: 180 rpx;
  height: 140 rpx;
  margin-top: 10 rpx;
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
}

.in-input {
  font-size: 22 rpx;
  padding: 0px;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
}

.input-label {
  line-height: 22px;
  padding-right: 0;
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

.uni-media-list-body .row {
  margin-left: 0;
  margin-right: 0;
}

.uni-media-list-package .text-box {
  font-size: 22 upx;
  width: 450 rpx;
  display: line-block;
}

.uni-media-list-package .child-text {
  font-size: 22 upx;
}

.uni-media-list-package .text {
  color: #666666;
}

.pd-box {
  margin: 12px;
}

.uni-media-list-logo {
  width: 180 rpx;
  height: 140 rpx;
  margin-top: 10 rpx;
}

.uni-media-list-body {
  height: auto;
  justify-content: space-around;
}
</style>
