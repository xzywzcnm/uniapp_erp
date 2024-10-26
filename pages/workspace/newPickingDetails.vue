<template>
  <view :class="wrap">
    <view class="scanWrap">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="skuNum" type="text" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
          class="uni-input scanInput" @confirm="scanSku" :focus="pdSkuFock" placeholder="SKU条码" />
      </view>
      <view class="d-flex justify-content-end headEndLine" v-if="useBasket">
        <text>当前篮子编号: {{ packageNum }}</text>
      </view>
      <view class="d-flex justify-content-end headEndLine">
        <text>拣货进度: {{ pickingNo }}/{{ total }}</text>
      </view>
    </view>
    <view class="mu-divider"></view>
    <view class="listContent">
      <view class="listItem" v-for="(item, index) in list" :key="item.productGoodsId + index"
        @click="gotoProductPickingDetails(item._index)">
        <view class="d-flex justify-content-start item">
          SKU：<text>{{ item.goodsSku }}</text>
        </view>
        <view class="d-flex justify-content-start item"
          v-if="item.barCode && ['O12', 'O14', 'O15', 'O16'].includes(item.pickingType)">
          条码编码：<view class="flexOne">{{ item.barCode }}</view>
        </view>
        <view class="d-flex justify-content-start item">
          货品：<text>{{ item.goodsCnDesc }}</text>
        </view>
        <view class="d-flex justify-content-start item">
          货位：<text>{{ item.warehouseLocationName }}</text>
        </view>
        <view class="row no-gutters item">
          <view class="col col-6">
            <!-- 待拣货数量：<text>{{ item.expectedNumber }}</text> -->
            待拣货数量：<text>{{ item.showExpectedNumber }}</text>
          </view>
          <view class="col col-6">
            已拣货数量：<text>{{ item.pickingQuantity }}</text>
          </view>
        </view>
        <view class="alreadyPicking">
          <text v-if="item.expectedNumber === item.pickingQuantity">{{
            item.expectedNumber === item.pickingQuantity ? "拣货完成" : ""
          }}</text>
          <text v-else class="icon iconfont"> &#xe655; </text>
        </view>
      </view>
    </view>
    <view class="bottomBit row no-gutters">
      <view class="col d-flex justify-content-center align-tiems-center" :class="useBasket ? 'col-6' : 'col-12'">
        <button type="default" class="yellow" size="mini" @click="markPickingFinish">
          标记拣货完成
        </button>
      </view>
      <view class="col col-6 d-flex justify-content-center align-tiems-center" v-if="useBasket">
        <button type="primary" class="primary" size="mini" @click="changePackage">
          换篮子
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import Mixin from "@/mixin/common_mixin";
import barcodeList_mixin from "@/mixin/barcodeList_mixin";
import api from "@/api/api";
const prefixCls = "tongtool-workspace-pickingDetails";
import { setStorage, getStorage, removeStorage } from "@/utils";
export default {
  mixins: [Mixin, barcodeList_mixin],
  data() {
    return {
      useBasket: true,
      packageNum: null,
      pickingGoodsNo: null,
      pickingGoodsId: null,
      warehouseId: null,
      pdSkuFock: false,
      skuNum: null,
      pickingNo: 0,
      list: [],
      total: 0,
      markStatus: false,
    };
  },
  methods: {
    scanCode() {
      let v = this;
      uni.scanCode({
        success: function (res) {
          v.skuNum = res.result;
          v.gotoPickingDetails();
          console.log("条码类型：" + res.scanType);
          console.log("条码内容：" + res.result);
        },
        fail: function (error) {
          console.log("error:", error);
        },
      });
    },
    scanSku() {
      let v = this;
      if (!v.skuNum || v.skuNum === "") {
        v.openSound("002");
        return false;
      }
      v.gotoPickingDetails();
    },
    gotoPickingDetails() {
      let v = this;
      let list = getStorage("newPdl_" + v.pickingGoodsId);
      if (list && list.length > 0) {
        let result = list.findIndex((n, i) => {
          // 扫描的条码等于“条码编码”或等于“SKU”，都可以识别拣货
          let barCodeList = n.barCode ? n.barCode.split(",") : [];
          return barCodeList.includes(v.skuNum) || v.skuNum === n.goodsSku;
        });
        if (result >= 0) {
          v.gotoProductPickingDetails(result);
        } else {
          v.openSound("002");
          uni.showToast({
            icon: "none",
            title: "没有找到相关SKU",
            duration: 1500,
          });
          v.pdSkuFock = false;
          v.skuNum = "";
          v.$nextTick(function () {
            v.pdSkuFock = true;
          });
        }
      }
    },
    changePackage() {
      let v = this;
      uni.redirectTo({
        url:
          "/pages/workspace/newScanPackage" +
          "?pickingGoodsId=" +
          v.pickingGoodsId +
          "&pickingGoodsNo=" +
          v.pickingGoodsNo +
          "&warehouseId=" +
          v.warehouseId,
      });
    },
    markPickingFinish() {
      // 标记拣货完成
      let v = this;
      if (v.markStatus) {
        return false;
      }
      uni.showModal({
        title: "提示",
        content: "是否标记拣货完成",
        success: function (res) {
          if (res.confirm) {
            v.markStatus = true;
            let params = v.list
              .filter((i) => {
                if (i.expectedNumber != i.pickingQuantity) {
                  return i;
                }
              })
              .map((i) => {
                return {
                  notPickingGoodsNumber: i.expectedNumber - i.pickingQuantity, // 未拣货数量
                  pickingGoodsId: v.pickingGoodsNo,
                  pickingGoodsNumber: i.pickingQuantity,
                  productGoodsId: i.productGoodsId,
                  warehouseLocationId: i.warehouseLocationId,
                };
              });
            const obj = {
              url: api.set_markWmsPickingFinish,
              data: {
                pickingGoodsNos: [v.pickingGoodsNo],
                wmsPickingGoodsAbnormalList: params.length > 0 ? params : null,
              },
            };
            uni.showLoading();
            v.ajaxData(obj)
              .then((response) => {
                uni.hideLoading();
                v.markStatus = false;
                let arr = {
                  554122: "拣货单不存在或已删除",
                  554147: "无法找到该谷仓账号对应的key",
                  554117: "谷仓SKU不存在或者不是可用状态",
                };

                if (response.data.code === 0) {
                  uni.showToast({
                    icon: "none",
                    title: "标记成功",
                    duration: 1500,
                  });
                  // 完成拣货清空缓存
                  removeStorage("newPdl_" + v.pickingGoodsId);
                  removeStorage("newPdl_" + v.pickingGoodsId + "_pickingNo");

                  let pickingNoStorage = getStorage(
                    "picking_wmsWarehouse_" + v.warehouseId + "_waitList"
                  );
                  if (!pickingNoStorage) {
                    v.gotoPickPage();
                  } else {
                    pickingNoStorage.forEach((n, i) => {
                      if (n.pickingGoodsNo === v.pickingGoodsNo) {
                        let hasBeenPickingList = getStorage(
                          "picking_wmsWarehouse_" + v.warehouseId + "_alreadyList"
                        );
                        if (hasBeenPickingList) {
                          hasBeenPickingList.push(n);
                        } else {
                          hasBeenPickingList = [n];
                        }
                        setStorage(
                          "picking_wmsWarehouse_" + v.warehouseId + "_alreadyList",
                          hasBeenPickingList
                        );
                        v.gotoPickPage();
                      }
                    });
                  }
                } else if (arr[response.data.code]) {
                  uni.showToast({
                    icon: "none",
                    title: arr[response.data.code],
                    duration: 3000,
                  });
                }
              })
              .catch(() => {
                v.markStatus = false;
              });
          }
        },
      });
    },
    gotoPickPage() {
      let v = this;
      const obj = {
        url: api.get_wmsPickingGoods,
        data: {
          warehouseId: getStorage("newErpWarehouse").warehouseId,
        },
      };
      v.ajaxData(obj).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data && data.warehouseId) {
            v.gotoPage("/pages/workspace/newPickingList");
          } else {
            v.gotoPage(
              "/pages/workspace/checkNewPickingOrder?warehouseId=" +
              getStorage("newErpWarehouse").warehouseId
            );
          }
        }
      });
    },
    getList() {
      let v = this;
      let skuList = getStorage("newPdl_" + v.pickingGoodsId);
      if (skuList) {
        // 如果当前拣货单已经有缓存
        v.list = skuList.map((i, j) => {
          i._index = j;
          return i;
        });
        v.total = skuList.length;
        v.pickingNo = Number(getStorage("newPdl_" + v.pickingGoodsId + "_pickingNo"));
        uni.hideLoading();
      } else {
        const obj = {
          url: api.get_newWmsProductList,
          type: "POST",
          data: {
            lastId: null,
            limit: 100000,
            pickingGoodsNo: v.pickingGoodsNo,
          },
        };
        v.ajaxData(obj).then(async (response) => {
          if (response.data.code === 0) {
            let data = response.data.datas || [];
            await v.getBarcode(data);
            data.forEach((n, i) => {
              n.status = false;
              n._index = i;
              n.pickingQuantity = 0;
              n.showExpectedNumber = n.expectedNumber || 0; //已拣货数量
            });
            v.list = data;
            v.total = data.length;
            setStorage("newPdl_" + v.pickingGoodsId, data);
            setStorage("thispickingGoodsId", v.pickingGoodsId); // 当前进行的拣货单
            setStorage("newPdl_" + v.pickingGoodsId + "_pickingNo", v.pickingNo);
            uni.hideLoading();
          }
        });
      }
    },
    // 销售出库根据sku获取条码编码
    getBarcode(list) {
      return new Promise((resolve) => {
        let pickingType = list[0] ? (list[0].pickingType || 'S1') : null;
        if (!["S1"].includes(pickingType)) {
          resolve({});
          return;
        }
        this.getBarcodeBeSku(list).then((res) => {
          resolve(res);
        });
      });
    },
    gotoProductPickingDetails(index) {
      let v = this;
      if (v.list[index].expectedNumber !== v.list[index].pickingQuantity) {
        v.openSound("001");
        uni.navigateTo({
          url:
            "/pages/workspace/newProductPickingDetails" +
            "?index=" +
            index +
            "&pickingGoodsNo=" +
            v.pickingGoodsNo +
            "&pickingGoodsId=" +
            v.pickingGoodsId +
            "&warehouseId=" +
            v.warehouseId,
        });
      } else if (v.list[index].expectedNumber === v.list[index].pickingQuantity) {
        v.openSound("002");
        uni.showToast({
          icon: "none",
          title: "该SKU已经拣货完成",
        });
      }
    },
  },
  computed: {
    wrap() {
      return `${prefixCls}`;
    },
    // userInfoList () {
    //   return this.store.state.userInfoList
    // }
  },
  onLoad(options) {
    let v = this;
    uni.showLoading({
      title: "数据加载中",
    });
    v.packageNum = options.packageNum;
    v.pickingGoodsNo = options.pickingGoodsNo;
    v.pickingGoodsId = options.pickingGoodsId;
    v.warehouseId = options.warehouseId;
    uni.setNavigationBarTitle({
      title: options.pickingGoodsNo,
    });
    let pickingSettings = getStorage("settingsConfigObj");
    if (pickingSettings.useBasket !== "1") {
      v.useBasket = false;
    }
    v.getList();
  },
  onShow() {
    if (this.list.length > 0) {
      this.list.length = 0;
      this.getList();
    }
    this.pdSkuFock = false;
    this.skuNum = "";
    this.$nextTick(() => {
      this.pdSkuFock = true;
      setTimeout(() => {
        this.pdSkuFock = false;
        this.$nextTick(() => {
          this.pdSkuFock = true;
        });
      }, 1000);
    });
  },
  onHide() {
    this.pdSkuFock = false;
  },
};
</script>
