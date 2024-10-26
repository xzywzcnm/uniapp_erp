<template>
  <view :class="wrap">
    <view class="d-flex normalPadding justify-content-start headTitle">
      <text v-if="stockReturnResult"
        ><text>货品名称：</text> {{ stockReturnResult.goodsCnDesc }}</text
      >
    </view>
    <view class="scanWrapStock cargospaceWrap">
      <view class="d-flex justify-content-between align-items-center box-top">
        <view class="cargospaceTitle" v-if="stockReturnResult"
          ><text class="label-width" style="margin-top: -2px">货位：</text
          >{{ stockReturnResult.warehouseLocationName }}</view
        >
        <view>
          <text class="label-width">校验货位：</text>
          <switch :checked="cargospaceStatus" @change="switchChange" />
        </view>
      </view>
      <view
        class="d-flex justify-content-start align-items-center box-top"
        v-if="cargospaceStatus"
      >
        <view class="uni-form-item uni-column">
          <view
            class="uni-input-wrapper"
            :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
          >
            <input
              class="uni-input"
              v-model.trim="cargoSpaceId"
              :focus="cargospaceFocus"
              @confirm="cargoSpaceblur()"
              placeholder="库位条码"
            />
            <view class="iconfont text-16" @click="scanCargospace">&#xe612; </view>
          </view>
        </view>

        <!--
        <view class="scan" @click="scanCargospace">
          <view class="icon iconfont scanIcon">&#xe642;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="cargoSpaceId" type="text" class="uni-input scanInput" @confirm="cargoSpaceblur"
               :focus="cargospaceFocus" placeholder="请扫描货位" />-->
      </view>
    </view>
    <view class="scanWrapStock">
      <view class="d-flex justify-content-between align-items-start box-top">
        <view>
          <view>
            <text class="label-width">SKU： </text>
            <text v-if="stockReturnResult">{{ stockReturnResult.goodsSku }}</text>
          </view>
          <view
            v-if="
              stockReturnResult.barCode &&
              ['O12', 'O14', 'O15', 'O16'].includes(stockReturnResult.pickingType)
            "
          >
            <text class="label-width">条码编码： </text>
            <text v-if="stockReturnResult">{{ stockReturnResult.barCode }}</text>
          </view>
        </view>
        <view :class="modeStatusStyle" style="display: flex; justify-content: center">
          <button type="primary" size="mini" @click="changeModeStatus">
            {{ modeStatus ? "切换到逐个扫描" : "切换普通扫描" }}
          </button>
        </view>
      </view>
      <view class="d-flex justify-content-start align-items-center box-top">
        <view class="uni-form-item uni-column">
          <view
            class="uni-input-wrapper"
            :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
          >
            <input
              class="uni-input"
              v-model.trim="skuNo"
              :focus="skuFocus"
              @confirm="skuBlur()"
              placeholder="SKU条码"
            />
            <view class="iconfont text-16" @click="scanSku">&#xe612; </view>
          </view>
        </view>
      </view>
      <view class="d-flex justify-content-between align-items-center box-top box-bottom">
        <view>
          <text class="label-width">归库总数： </text>
          <text v-if="stockReturnResult">{{ stockReturnResult.quantity }}</text>
        </view>
        <view>
          <text class="label-width">已扫数量：</text>
          <text v-if="stockReturnResult" class="stock-ing">{{
            stockReturnResult.scannedQuantity
          }}</text>
        </view>
      </view>
    </view>
    <view
      class="d-flex justify-content-center normalPadding align-items-center picArea"
      v-if="stockReturnResult"
    >
      <image :src="newErpPrefix + stockReturnResult.goodsUrl"></image>
    </view>
    <view class="bottomBit row no-gutters">
      <view class="d-flex justify-content-center align-tiems-center" style="width: 100%">
        <button type="primary" size="mini" @click="goNextSku()">下一个</button>
      </view>
    </view>
  </view>
</template>

<script>
import Mixin from "@/mixin/common_mixin";
import api from "@/api/api";
const prefixCls = "tongtool-workspace-productPickingDetails";
import { setStorage, getStorage, removeStorage } from "@/utils";
export default {
  mixins: [Mixin],
  data() {
    return {
      dataAll: [],
      stockReturnResult: null,
      cargospaceFocus: false,

      useBasket: true,
      pickingGoodsNo: null,
      index: null,
      warehouseId: null,
      pickingGoodsId: null,

      skuFocus: false,
      cargospaceStatus: true,
      modeStatus: true,
      cacheData: null,

      cargoSpaceId: null,
      cargoSpaceAuthStatus: false,
      skuNo: "",
      markStatus: false,
    };
  },
  methods: {
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
    scanCargospace() {
      let v = this;
      uni.scanCode({
        success: function (res) {
          v.cargoSpaceId = res.result;
          v.cargoSpaceblur();
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
      uni.scanCode({
        success: function (res) {
          console.log("条码类型x：" + res.scanType);
          console.log("条码内容x：" + res.result);
          v.skuNo = res.result;
          console.log(v.skuNo);
          v.$nextTick(function () {
            v.skuBlur();
          });
        },
        fail: function (error) {
          console.log("error:", error);
        },
      });
    },
    switchChange(e) {
      this.cargospaceStatus = e.target.value;
    },
    changeModeStatus() {
      let v = this; //
      v.cargospaceFocus = false;
      v.skuFocus = false;
      if (v.modeStatus) {
        uni.showModal({
          title: "",
          content: "是否切换到逐个扫描",
          confirmText: "确定",
          success: function (res) {
            if (res.confirm) {
              v.modeStatus = false;
              console.log("--------");
              if (v.cargospaceStatus) {
                v.cargoSpaceId = "";
                v.skuNo = "";
                v.$nextTick(function () {
                  v.cargospaceFocus = true;
                });
              } else {
                v.skuNo = "";
                v.$nextTick(function () {
                  v.skuFocus = true;
                });
              }
            }
          },
        });
      } else {
        uni.showModal({
          title: "",
          content: "是否切换为普通扫描，切换后已拣数将会清零",
          confirmText: "确定",
          success: function (res) {
            if (res.confirm) {
              v.modeStatus = true;
              v.stockReturnResult.scannedQuantity = 0;
              v.setStorageData();
              if (v.cargospaceStatus) {
                v.cargoSpaceId = "";
                v.skuNo = "";
                v.$nextTick(function () {
                  v.cargospaceFocus = true;
                });
              } else {
                v.skuNo = "";
                v.$nextTick(function () {
                  v.skuFocus = true;
                });
              }
            }
          },
        });
      }
    },
    getPickinglist(type) {
      let v = this;
      v.stockReturnResult = null;
      v.stockReturnResult = v.cacheData[v.index];
    },
    cargoSpaceblur() {
      let v = this;
      if (v.cargoSpaceId) {
        if (!/^[A-Za-z0-9_\-/.#()\[\]]{1,30}$/.test(v.cargoSpaceId)) {
          uni.showToast({
            icon: "none",
            title: "货位不匹配",
            duration: 1500,
          });
          v.openSound("002");
          v.cargoSpaceAuthStatus = false;
          return;
        }
      }
      if (v.cargoSpaceId === v.stockReturnResult.warehouseLocationName) {
        v.openSound("001");
        v.cargoSpaceAuthStatus = true;
        v.cargospaceFocus = false;
        v.skuFocus = false;
        v.$nextTick(function () {
          v.skuFocus = true;
        });
      } else {
        if (v.cargoSpaceId) {
          uni.showToast({
            icon: "none",
            title: "货位不匹配",
            duration: 1500,
          });
          v.openSound("002");
          v.cargoSpaceAuthStatus = false;
          v.cargoSpaceId = "";
        } else {
          uni.showToast({
            icon: "none",
            title: "请输入货位",
            duration: 1500,
          });
          v.openSound("002");
        }
        v.cargoSpaceAuthStatus = false;
        v.cargospaceFocus = false;
        v.$nextTick(function () {
          v.cargospaceFocus = true;
        });
      }
    },
    skuBlur() {
      let v = this;
      if (!v.skuNo) {
        return false;
      }
      // 扫描的条码等于“条码编码”或等于“SKU”，都可以识别拣货
      let barCodeList = v.stockReturnResult.barCode
        ? v.stockReturnResult.barCode.split(",")
        : [];
      if (v.skuNo === v.stockReturnResult.goodsSku || barCodeList.includes(v.skuNo)) {
        if (v.modeStatus) {
          if (!v.stockReturnResult.warehouseLocationName || !v.cargospaceStatus) {
            v.cargoSpaceAuthStatus = false;
          } else {
            v.cargoSpaceAuthStatus = true;
          }
          if (v.cargoSpaceAuthStatus) {
            // 货位校验
            if (v.cargoSpaceId === v.stockReturnResult.warehouseLocationName) {
              v.openSound("001");
              v.stockReturnResult.scannedQuantity = v.stockReturnResult.quantity;
            } else {
              v.openSound("002");
              uni.showToast({
                icon: "none",
                title: "货位未校验",
                duration: 1500,
              });
            }
          } else {
            v.openSound("001");
            uni.showToast({
              icon: "none",
              title: "校验通过",
              duration: 1500,
            });
            v.stockReturnResult.scannedQuantity = v.stockReturnResult.quantity;
          }
        } else {
          if (v.stockReturnResult.scannedQuantity !== v.stockReturnResult.quantity) {
            if (!v.stockReturnResult.warehouseLocationName || !v.cargospaceStatus) {
              v.cargoSpaceAuthStatus = false;
            } else {
              v.cargoSpaceAuthStatus = true;
            }
            if (v.cargoSpaceAuthStatus) {
              // 货位校验
              if (v.cargoSpaceId === v.stockReturnResult.warehouseLocationName) {
                v.skuNo = "";
                v.stockReturnResult.scannedQuantity++;
                v.openSound("001");
                if (v.stockReturnResult.scannedQuantity < v.stockReturnResult.quantity) {
                  v.$nextTick(function () {
                    v.skuFocus = false;
                    setTimeout(function () {
                      v.skuFocus = true;
                    }, 1000);
                  });
                  v.setStorageData(); // 更新缓存数据
                }
              } else {
                v.openSound("002");
                uni.showToast({
                  icon: "none",
                  title: "货位未校验",
                  duration: 1500,
                });
              }
            } else {
              v.stockReturnResult.scannedQuantity++;
              if (v.stockReturnResult.scannedQuantity < v.stockReturnResult.quantity) {
                v.setStorageData(); // 更新缓存数据
              }
              v.openSound("001");
              uni.showToast({
                icon: "none",
                title: "校验通过",
                duration: 500,
              });
              v.skuNo = "";
              v.$nextTick(function () {
                v.skuFocus = false;
                setTimeout(function () {
                  v.skuFocus = true;
                }, 1000);
              });
            }
          }
        }
        if (v.stockReturnResult.quantity === v.stockReturnResult.scannedQuantity) {
          v.skuNo = null;
          v.cargoSpaceId = null;
          v.goNextSku();
        }
      } else {
        v.openSound("002");
        uni.showToast({
          title: "SKU不匹配",
          icon: "none",
          duration: 1500,
        });
        v.skuNo = "";
        v.$nextTick(function () {
          v.skuFocus = false;
          setTimeout(function () {
            v.skuFocus = true;
          }, 1000);
        });
      }
    },
    goNextSku() {
      // type 区别调用来源
      let v = this;
      let arr = v.dataAll.filter((i) => i.quantity !== i.scannedQuantity);
      v.setStorageData();
      if (arr && arr.length === 0) {
        uni.showModal({
          title: "",
          content: "当前归库单已经完成，是否标记已完成",
          success: (res) => {
            if (res.confirm) {
              v.markPickingFinish();
            }
          },
        });
      } else if (arr.length === 1) {
        if (
          arr[0].packageRegressProductId === v.stockReturnResult.packageRegressProductId
        ) {
          uni.showToast({
            icon: "none",
            title: "已经没有下个sku了",
            duration: 1500,
          });
        } else {
          v.stockReturnResult = arr[0];
        }
      } else {
        v.stockReturnResult = arr[0];
      }

      /*console.log('-----------')
            v.cargoSpaceId = null
            v.skuNo = null
            if (v.cargospaceStatus) {
                v.skuFocus = false
                v.cargospaceFocus = false
                v.$nextTick(function () {
                    v.cargospaceFocus = true
                })
            } else {
                v.skuFocus = false
                v.cargospaceFocus = false
                v.$nextTick(function () {
                    v.skuFocus = true
                })
            }
            let index = v.index
            if (type) {
                index = index - 1
            }
            if (index < v.cacheData.length - 1) {
                let nextIndex = v.cacheData.findIndex((n, i) => {
                    if (i > index && n.quantity !== n.scannedQuantity) {
                        return n
                    }
                })
                if (nextIndex > 0) {
                    v.index = nextIndex
                    v.init()
                } else {
                    v.checkAllSku(type)
                }
            } else {
                v.checkAllSku(type)
            }*/
    },
    init() {
      let v = this;
      let pickingSettings = getStorage("settingsConfigObj");
      if (!pickingSettings) {
        v.cargospaceStatus = true;
        v.modeStatus = true;
      } else {
        if (pickingSettings.scanMode === "1") {
          v.modeStatus = true;
        } else {
          v.modeStatus = false;
        }
        if (pickingSettings.checkCargo === "1") {
          v.cargospaceStatus = true;
          v.cargospaceFocus = false;
          v.$nextTick(function () {
            v.cargospaceFocus = true;
          });
        } else {
          v.cargospaceStatus = false;
          v.$nextTick(function () {
            v.skuFocus = true;
          });
        }
      }
    },
    checkAllSku(type) {
      let v = this;
      let nextIndex = v.checkSkuStatus();
      if (
        nextIndex >= 0 &&
        ((nextIndex !== v.index && !type) || type) &&
        v.cacheData.length > 1
      ) {
        v.index = nextIndex;
        v.init();
      } else {
        uni.showToast({
          icon: "none",
          title: "已经没有下个sku了",
          duration: 1500,
        });
      }
    },
    markPickingFinish() {
      // 标记拣货完成
      let v = this;
      if (v.markStatus) {
        return false;
      }
      uni.showModal({
        title: "提示",
        content: "是否标记归库完成",
        success: function (res) {
          if (res.confirm) {
            v.markStatus = true;
            const obj = {
              url: api.get_packageRegressProductEditStatus,
              type: "post",
              data: [v.dataAll[0].regressProductNumber],
            };
            uni.showLoading();
            v.ajaxData(obj)
              .then((response) => {
                uni.hideLoading();
                v.markStatus = false;
                if (response.data.code === 0) {
                  uni.showToast({
                    icon: "none",
                    title: "标记成功",
                    duration: 1500,
                  });
                  removeStorage("stockReturn__" + v.dataAll[0].regressProductNumber); // 清除归库缓存
                  uni.navigateBack({
                    delta: 2,
                  });
                } else if (response.data.code === 554131) {
                  uni.showToast({
                    title: "库位正在盘点中",
                    icon: "none",
                    duration: 2000,
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
    checkSkuStatus() {
      let v = this;
    },
    setStorageData() {
      // 更新缓存
      let v = this;
      v.dataAll.forEach((i, index) => {
        if (i.packageRegressProductId === v.stockReturnResult.packageRegressProductId) {
          v.$set(
            v.dataAll[index],
            "scannedQuantity",
            v.stockReturnResult.scannedQuantity
          );
        }
        if (i.quantity === i.scannedQuantity) {
          i._CHECKED = true;
        } else {
          i._CHECKED = false;
        }
      });
      setStorage(
        "stockReturn__" + v.dataAll[0].regressProductNumber,
        JSON.stringify(v.dataAll)
      );
      v.store.commit("stockReturnList", v.dataAll);
    },
  },
  computed: {
    wrap() {
      return `${prefixCls}`;
    },
    modeStatusStyle() {
      if (this.modeStatus) {
        return "modeStatus";
      } else {
        return "";
      }
    },
  },
  onLoad(options) {
    let v = this;
    v.init();
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
      v.dataAll = this.store.state.stockReturnList.map((i) => {
        data.forEach((j) => {
          if (i.packageRegressProductId === j.packageRegressProductId) {
            i.scannedQuantity = j.scannedQuantity;
            i._CHECKED = j._CHECKED;
          }
        });
        return i;
      });
    } else {
      v.dataAll = this.store.state.stockReturnList.map((i) => {
        if (!i.scannedQuantity) i.scannedQuantity = 0;
        return i;
      });
    }
    if (options.packageRegressProductId) {
      // 批次号
      v.stockReturnResult = v.dataAll.filter((i) => {
        return i.packageRegressProductId === options.packageRegressProductId;
      })[0];
    }
  },
};
</script>
<style>
.uni-form-item {
  padding: 5rpx 0;
}
</style>
<style>
.box-top {
  padding-top: 30rpx;
}

.box-bottom {
  padding-bottom: 15rpx;
}

.stock-ing {
  width: 130rpx;
  display: inline-block;
}

.scanWrapStock {
  padding: 0 15rpx;
  background-color: #ffffff;
}

.scanWrapStock .uni-icon {
  margin-top: 2px;
}

.label-width {
  display: inline-block;
}

.uni-input-wrapper {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  border: 1px solid #dddddd;
  width: auto;
  padding: 4px 13px;
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
</style>
