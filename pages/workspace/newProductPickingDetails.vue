<template>
  <view :class="wrap" v-if="pickingResult">
    <view class="d-flex normalPadding justify-content-start headTitle">
      <text><text>货品名称:</text> {{ pickingResult.goodsCnDesc }}</text>
    </view>
    <view class="d-flex" style="padding: 10px 10px 0 10px; background-color: #fff">
      产品类型：
      <text :style="assembleShow ? 'color:red;' : ''">
        {{ assembleShow ? "组合产品" : "普通产品" }}
      </text>
    </view>
    <view class="scanWrap cargospaceWrap">
      <view class="d-flex justify-content-between">
        <view class="cargospaceTitle"
          >货位：{{ pickingResult.warehouseLocationName }}</view
        >
        <view>
          <text v-if="cargospaceStatus" style="margin-right: 5px">校验货位</text>
          <text v-else style="margin-right: 5px">不校验货位</text>
        </view>
      </view>
      <view
        class="d-flex justify-content-start align-items-center scanCargospace"
        v-if="cargospaceStatus"
      >
        <view class="scan" @click="scanCargospace">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input
          v-model.trim="cargoSpaceId"
          type="text"
          :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
          class="uni-input scanInput"
          @confirm="cargoSpaceblur"
          :focus="cargospaceFocus"
          placeholder="请扫描货位"
        />
      </view>
    </view>
    <view class="scanWrap">
      <view class="d-flex justify-content-between align-content-between skuName">
        <view>
          <text>SKU：{{ pickingResult.goodsSku }}</text>
        </view>
        <view :class="modeStatusStyle">
          <view v-if="modeStatus">逐个扫描</view>
          <view v-else>普通扫描</view>
        </view>
      </view>
      <view
        class="d-flex justify-content-start item"
        v-if="
          pickingResult.barCode &&
          ['O12', 'O14', 'O15', 'O16'].includes(pickingResult.pickingType)
        "
      >
        条码编码：<view class="flexOne">{{ pickingResult.barCode }}</view>
      </view>
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanSku">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input
          v-model.trim="skuNo"
          type="text"
          :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
          class="uni-input scanInput"
          @confirm="skuBlur"
          :focus="skuFocus"
          placeholder="SKU条码"
        />
      </view>
      <view class="row no-gutters normalPadding pickingStatus">
        <view class="col col-6">
          <!-- 待拣： <text>{{ pickingResult.expectedNumber }}</text> -->
          待拣： <text>{{ pickingResult.showExpectedNumber }}</text>
        </view>
        <view class="col col-6">
          已拣： <text>{{ pickingResult.pickingQuantity }}</text>
        </view>
      </view>
    </view>
    <view class="d-flex justify-content-center normalPadding align-items-center picArea">
      <image :src="newErpPrefix + pickingResult.goodsUrl"></image>
    </view>
    <view class="bottomBit row no-gutters">
      <view class="col d-flex justify-content-center align-tiems-center" v-if="useBasket">
        <button type="default" class="yellow" size="mini" @click="changePackage">
          换篮子
        </button>
      </view>
      <view
        class="col col-6 d-flex justify-content-center align-tiems-center"
        :class="useBasket ? 'col-6' : 'col-12'"
      >
        <button type="primary" class="primary" size="mini" @click="goNextSku(1)">
          下一个
        </button>
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
      useBasket: true,
      pickingGoodsNo: null,
      index: null,
      warehouseId: null,
      pickingGoodsId: null,
      cargospaceFocus: false,
      skuFocus: false,
      cargospaceStatus: true,
      modeStatus: true,
      cacheData: null,
      pickingResult: null,
      cargoSpaceId: null,
      cargoSpaceAuthStatus: false,
      skuNo: "",
      markStatus: false,
      pageOption: {},
      positionList: [],
      isPositionChange: false,
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
          v.cargoSpaceId = res.result ? res.result.trim() : "";
          v.cargoSpaceblur();
          // console.log('条码类型：' + res.scanType)
          // console.log('条码内容：' + res.result)
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
          // console.log('条码类型x：' + res.scanType)
          // console.log('条码内容x：' + res.result)
          v.skuNo = res.result ? res.result.trim() : "";
          // console.log(v.skuNo)
          v.$nextTick(function () {
            v.skuBlur();
          });
        },
        fail: function (error) {
          console.log("error:", error);
        },
      });
    },
    getPickinglist(type) {
      this.pickingResult = null;
      this.$nextTick(() => {
        let onlyId = this.positionList[this.index];
        this.cacheData.forEach((k, key) => {
          if (onlyId === k.onlyId) this.pickingResult = k;
        });
      });
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
          v.cargoSpaceAuthStatus = false;
          v.cargoSpaceId = "";
          v.openSound("002");
          v.cargospaceFocus = false;
          v.$nextTick(function () {
            v.cargospaceFocus = true;
          });
          return;
        }
      }
      if (v.cargoSpaceId === v.pickingResult.warehouseLocationName) {
        v.openSound("001");
        v.cargoSpaceAuthStatus = true;
        v.cargospaceFocus = false;
        v.skuFocus = false;
        v.$nextTick(function () {
          v.skuFocus = true;
        });
      } else {
        v.openSound("002");
        if (v.cargoSpaceId) {
          uni.showToast({
            icon: "none",
            title: "货位不匹配",
            duration: 1500,
          });
          v.cargoSpaceAuthStatus = false;
          v.cargoSpaceId = "";
        } else {
          uni.showToast({
            icon: "none",
            title: "请输入货位",
            duration: 1500,
          });
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
      // 原来写的太乱了，还是加上备注，下次不用重新看的那么辛苦了（yyy）
      let fun = {
        // 验证
        validate() {
          if (!v.skuNo) {
            v.openSound("002"); //播放声音
            return false;
          }
          let pickingResult = v.pickingResult;
          // 扫描的条码等于“条码编码”或等于“SKU”，都可以识别拣货
          let barCodeList = pickingResult.barCode ? pickingResult.barCode.split(",") : [];
          if (!(v.skuNo === pickingResult.goodsSku || barCodeList.includes(v.skuNo))) {
            v.openSound("002");
            uni.showToast({
              title: "SKU不匹配",
              icon: "none",
              duration: 1500,
            });
            return false;
          }
          return true;
        },
        // 普通扫描
        unmodeStatusFun() {
          let cargoSpaceAuthStatus =
            !v.pickingResult.warehouseLocationName ||
            (v.pickingResult.warehouseLocationName && !v.cargospaceStatus);
          v.cargoSpaceAuthStatus = !cargoSpaceAuthStatus; // 货位

          // 需要货位校验
          if (v.cargoSpaceAuthStatus) {
            if (v.cargoSpaceId === v.pickingResult.warehouseLocationName) {
              // this.isCombinationProducts();
              v.openSound("001");
              v.pickingResult.pickingQuantity = v.pickingResult.expectedNumber;
              v.pickingResult.showExpectedNumber = 0;
              v.setStorageData(); // 更新缓存数据
            } else {
              v.openSound("002");
              uni.showToast({
                icon: "none",
                title: "货位未校验",
                duration: 1500,
              });
            }
            return;
          }
          // this.isCombinationProducts();
          v.openSound("001");
          uni.showToast({
            icon: "none",
            title: "校验通过",
            duration: 1500,
          });
          v.pickingResult.pickingQuantity = v.pickingResult.expectedNumber;
        },
        // 逐步扫描
        modeStatusFun() {
          // pickingQuantity扫描次数 expectedNumbersku数量
          if (v.pickingResult.pickingQuantity === v.pickingResult.expectedNumber) return;
          let cargoSpaceAuthStatus =
            !v.pickingResult.warehouseLocationName ||
            (v.pickingResult.warehouseLocationName && !v.cargospaceStatus);
          v.cargoSpaceAuthStatus = !cargoSpaceAuthStatus;
          // 货位校验
          if (v.cargoSpaceAuthStatus) {
            if (v.cargoSpaceId === v.pickingResult.warehouseLocationName) {
              // this.isCombinationProducts();
              v.skuNo = "";
              // v.pickingResult.pickingQuantity++;
              v.openSound("001");
              if (v.pickingResult.pickingQuantity < v.pickingResult.expectedNumber) {
                v.pickingResult.pickingQuantity++;
                v.pickingResult.showExpectedNumber--;
                v.setStorageData(); // 更新缓存数据
                // 同一个货位下有多个sku时
                if (v.pickingResult.pickingQuantity < v.pickingResult.expectedNumber) {
                  v.$nextTick(function () {
                    v.skuFocus = false;
                    v.$nextTick(function () {
                      v.skuFocus = true;
                    });
                  });
                }
              }
            } else {
              v.openSound("002");
              // v.skuNo = '';
              uni.showToast({
                icon: "none",
                title: "货位未校验",
                duration: 1500,
              });
            }
          } else {
            // v.pickingResult.pickingQuantity++;
            if (v.pickingResult.pickingQuantity < v.pickingResult.expectedNumber) {
              v.pickingResult.pickingQuantity++;
              v.pickingResult.showExpectedNumber--;
              v.setStorageData(); // 更新缓存数据
            }
            // this.isCombinationProducts();
            v.openSound("001");
            uni.showToast({
              icon: "none",
              title: "校验通过",
              duration: 500,
            });
            v.skuNo = "";
            v.$nextTick(function () {
              v.skuFocus = false;
              v.$nextTick(function () {
                v.skuFocus = true;
              });
            });
          }
        },
        // // 是否组合产品
        // isCombinationProducts () {
        //   uni.showToast({
        //     title: '该SKU为组合产品',
        //     icon: 'none',
        //     duration: 1000,
        //   })
        // }
      };
      let validate = fun.validate();
      if (!validate) {
        v.skuNo = "";
        v.$nextTick(function () {
          v.skuFocus = false;
          v.$nextTick(function () {
            v.skuFocus = true;
          });
        });
        return;
      }
      if (v.modeStatus) {
        fun.modeStatusFun();
      } else {
        fun.unmodeStatusFun();
      }
      // 满足数量，下一个
      if (v.pickingResult.pickingQuantity === v.pickingResult.expectedNumber) {
        v.goNextSku();
      }
    },
    goNextSku() {
      let v = this;
      let list = v.cacheData || [];
      if (list.every((i) => i.pickingQuantity >= i.expectedNumber)) {
        return v.markPickingFinish();
      }

      v.nextIndex();
      v.cargoSpaceId = null;
      v.skuNo = null;
      if (v.cargospaceStatus) {
        v.skuFocus = false;
        v.cargospaceFocus = false;
        v.$nextTick(function () {
          v.cargospaceFocus = true;
        });
      } else {
        v.skuFocus = false;
        v.cargospaceFocus = false;
        v.$nextTick(function () {
          v.skuFocus = true;
        });
      }
      v.getPickinglist();
    },
    init() {
      let v = this;
      let pickingSettings = getStorage("settingsConfigObj");
      if (!pickingSettings) {
        v.cargospaceStatus = true;
        v.modeStatus = true;
      } else {
        if (pickingSettings.scanMode === "2") {
          v.modeStatus = true;
        } else {
          v.modeStatus = false;
        }
        if (pickingSettings.checkCargo === "1") {
          v.cargoSpaceId = "";
          v.cargospaceStatus = true;
          v.cargospaceFocus = false;
          v.$nextTick(function () {
            v.cargospaceFocus = true;
          });
        } else {
          v.cargospaceStatus = false;
          v.skuNo = "";
          v.skuFocus = true;
          v.$nextTick(function () {
            v.skuFocus = true;
          });
        }
      }
      v.$nextTick(function () {
        v.getPickinglist();
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
            let params = v.cacheData
              .filter((i) => {
                if (i.expectedNumber != i.pickingQuantity) {
                  return i;
                }
              })
              .map((i) => {
                return {
                  notPickingGoodsNumber: i.expectedNumber - i.pickingQuantity, // 未拣货数量 , ,
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
                  // console.log('picking_wmsWarehouse_' + v.warehouseId + '_waitList')
                  // console.log('pickingNoStorage:', pickingNoStorage)
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
    setStorageData() {
      // 更新缓存
      let v = this;
      // let index = v.index;
      let index = v.positionIndex;
      if (v.cacheData[index].expectedNumber === v.cacheData[index].pickingQuantity) {
        let pickingNo = Number(getStorage("newPdl_" + v.pickingGoodsId + "_pickingNo"));
        if (pickingNo < v.cacheData.length) {
          setStorage("newPdl_" + v.pickingGoodsId + "_pickingNo", pickingNo + 1);
        }
        setStorage("newPdl_" + v.pickingGoodsId, v.cacheData);
      } else {
        setStorage("newPdl_" + v.pickingGoodsId, v.cacheData);
      }
    },
    // 下一个index
    nextIndex() {
      if (this.isPositionChange) {
        this.isPositionChange = false;
        return;
      }
      let list = this.positionList;
      if (this.index >= list.length - 1) {
        this.index = 0;
      } else {
        this.index++;
      }
    },
    // 根据存在待拣货数据优先重新排序
    stockPosition() {
      let [allList, positionList] = [this.cacheData, this.positionList];
      const firstIndex = !positionList.length;
      // 找出当前所在的sku的位置
      let index = null;
      if (firstIndex) {
        index = this.pageOption.index - 0;
      } else {
        index = this.positionIndex;
      }
      // 以所在位置进行往后至前，优先未拣货，后从前往后排已拣货顺序
      let [halfList, halfedList, beforeList, beforedList] = [[], [], [], []];
      allList.forEach((k, i) => {
        if (i >= index) {
          if (k.pickingQuantity < k.expectedNumber) {
            halfList.push(k);
          } else {
            halfedList.push(k);
          }
        } else {
          if (k.pickingQuantity < k.expectedNumber) {
            beforeList.push(k);
          } else {
            beforedList.push(k);
          }
        }
      });
      let list = [...halfList, ...beforeList, ...beforedList, ...halfedList];
      // console.log(halfList.map((k) => k.onlyId));
      // console.log(beforeList.map((k) => k.onlyId));
      // console.log(list.map((k) => k.onlyId));
      this.positionList = list.map((k) => k.onlyId);
      // 最开始进来
      if (firstIndex) {
        let item = allList[index];
        // 防止进来存在已拣货
        if (item.pickingQuantity >= item.expectedNumber) {
          this.index = 0;
        } else {
          let _index = this.positionList.indexOf(item.onlyId);
          this.index = _index < 0 ? 0 : _index;
        }
      } else {
        this.index = 0;
        this.isPositionChange = true;
      }
      // console.log(this.index);
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
    assembleShow() {
      // pickingQuantity(已检) expectedNumber(待检) assembleCount(组合数量)
      let { pickingQuantity = 0, assembleCount = 0, expectedNumber = 0 } =
        this.pickingResult || {};
      let surplusNum = expectedNumber - pickingQuantity; // 待检数量
      surplusNum = surplusNum < 0 ? 0 : surplusNum; //防止数量出现负数
      return assembleCount > 0 && surplusNum <= assembleCount;
    },
    // 返回当前sku所在列表的位置
    positionIndex() {
      let index = null;
      let onlyId = this.positionList[this.index];
      this.cacheData.forEach((k, key) => {
        if (onlyId === k.onlyId) index = key;
      });
      return index;
    },
  },
  watch: {
    cacheData: {
      handler(nval, oval) {
        if (!Array.isArray(nval)) return;
        // this.$nextTick(() => {
        this.stockPosition();
        // });
      },
      deep: true,
    },
  },
  onLoad(options) {
    let v = this;
    v.pageOption = options;
    v.pickingGoodsNo = options.pickingGoodsNo;
    // v.index = options.index;
    v.warehouseId = options.warehouseId;
    v.pickingGoodsId = options.pickingGoodsId;
    // v.cacheData = getStorage("newPdl_" + options.pickingGoodsId);

    let list = getStorage("newPdl_" + options.pickingGoodsId);
    v.cacheData = list.map((k, i) => {
      k.onlyId = k.goodsSku + i; //用来记住位置
      return k;
    });
    // 判断是否拣货完成
    if ((v.cacheData || []).every((i) => i.pickingQuantity >= i.expectedNumber)) {
      v.markPickingFinish();
    } else {
      // let item = v.cacheData[options.index];
      // if (item.pickingQuantity >= item.expectedNumber) {
      //   v.nextIndex();
      // }
    }
    let pickingSettings = getStorage("settingsConfigObj");
    if (pickingSettings.useBasket !== "1") {
      v.useBasket = false;
    }
    v.init();
  },
};
</script>
