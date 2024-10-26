<template>
  <view class="tongtool-workspace-productPickingDetails view-main-body">
    <view class="scanWrap">
      <view class="d-flex justify-content-between">
        <view> 货位：{{ searchValue }}</view>
        <view></view>
      </view>
      <view class="d-flex justify-content-start align-items-center scanCargospace mb10">
        <view class="scan" @click="scanLocation">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="locationId" type="text" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
          class="uni-input scanInput" @confirm="locationBlur" :focus="locationFocus" placeholder="请扫描货位" />
      </view>
      <view v-if="locatItem.totalLocation">
        <view class="mb10">待盘点数量：<text class="errorTips">{{
          locatItem.totalLocation.totalAwaitCheckedInventoryNumber
        }}</text></view>
        <view class="mb10">已盘点数量：<text class="errorTips">{{
          locatItem.totalLocation.totalCheckedInventoryNumber
        }}</text></view>
      </view>
    </view>
    <view class="scanWrap">
      <view class="d-flex justify-content-between align-content-between skuName">
        <view>
          <text>SKU：{{ goodsSku }}</text>
        </view>
        <view></view>
      </view>
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanSku">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="skuNo" type="text" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
          class="uni-input scanInput" @confirm="skuBlur" :focus="skuFocus" placeholder="SKU条码" />
        <!--  inputmode="none" @focus="closeKeyboard" -->
      </view>
      <view class="tips errorTips">待盘点数量=可用库存-已拣数量-待归库数量,实际以仓库盘点数量为准</view>
    </view>
    <view class="bottomBit row no-gutters">
      <view class="col d-flex justify-content-center align-tiems-center">
        <button type="default" class="orange-btn com-btn" size="mini" @click="getDetails">
          清空当前数据
        </button>
      </view>
      <view class="col d-flex justify-content-center align-tiems-center">
        <button type="primary" class="blur-btn com-btn" size="mini" @click="nextLocation">
          下个库位
        </button>
      </view>
      <view class="col d-flex justify-content-center align-tiems-center">
        <button type="primary" class="green-btn com-btn" size="mini" @click="saveMt">
          保存
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/mixin/common_mixin";
import { getStorage } from "@/utils";
import barcodeList_mixin from "@/mixin/barcodeList_mixin";
export default {
  name: "inventoryCheckOperation",
  mixins: [Mixin, barcodeList_mixin],
  data() {
    return {
      skuNo: "",
      locationId: "",
      skuFocus: false,
      locationFocus: false,

      searchValue: "",
      goodsSku: "",
      totalLocation: {},
      skuList: [],
      option: {}, //url传参

      allLocationList: {}, //全部库位数据
      // index: 0,
      isChange: false, //是否有改动
      // canFocus: false, //是否可以使用软键盘
    };
  },
  computed: {
    theme() {
      return this.store.state.theme;
    },
    locatItem() {
      return this.allLocationList[this.searchValue] || {};
    },
    stockPosition() {
      // 先不要删
      // // 根据存在带盘点数据优先重新排序
      // let allList = Object.keys(this.allLocationList).map((k) => this.allLocationList[k]);
      // let halfList = [];
      // let beforeList = [];
      // allList.forEach((k, i) => {
      //   let waitNum = k.totalLocation.totalAwaitCheckedInventoryNumber || 0;
      //   if (waitNum > 0) {
      //     halfList.push(k);
      //   } else {
      //     beforeList.push(k);
      //   }
      // });
      // let list = [...halfList, ...beforeList];
      // return list.map((k) => k.wareName);
      return Object.keys(this.allLocationList);
    },
  },
  onLoad(option) {
    this.option = option;
    // this.getPower();
    this.getDetails().then(() => {
      this.locationId = option.location;
      let result = this.validLocation(option.location);
      if (result) this.skuFocusFun("skuFocus");
    });
  },
  // 返回上一页
  onBackPress() {
    if (!this.isChange) return false;
    uni.$emit("refreshList");
  },
  // 先不要删
  watch: {
    // stockPosition: {
    //   handler(nval, oval) {
    //     let location = this.option.location || this.searchValue;
    //     if (!location) {
    //       return;
    //     }
    //     let index = nval.indexOf(location);
    //     this.index = index < 0 ? 0 : index + 1;
    //   },
    //   deep: true,
    // },
  },
  methods: {
    // closeKeyboard() {
    //   !this.canFocus && uni.hideKeyboard();
    // },
    // getPower() {
    //   this.ajaxData({
    //     url: api.wms_inventoryScan,
    //     type: "post",
    //   }).then(({ data }) => {
    //     let flag = false;
    //     if (data.code === 0) {
    //       let list = data.datas || [];
    //       if (list.includes("wmsInventoryCheck_pdaInput")) {
    //         flag = true;
    //       }
    //     }
    //     this.canFocus = flag;
    //   });
    // },
    skuFocusFun(type) {
      this[type] = false;
      this.$nextTick(() => {
        this[type] = true;
      });
      if (type === "locationFocus") {
        this.locationId = "";
      }
      if (type === "skuFocus") {
        this.skuNo = "";
      }
    },
    scanLocation() {
      uni.scanCode({
        success: function (res) {
          console.log("条码类型x：" + res.scanType);
          console.log("条码内容x：" + res.result);
          this.locationId = res.result;
          this.$nextTick(function () {
            this.locationBlur();
          });
        },
        fail: function (error) {
          console.log("error:", error);
        },
      });
    },
    scanSku() {
      uni.scanCode({
        success: function (res) {
          this.skuNo = res.result;
          console.log("条码类型x：" + res.scanType);
          console.log("条码内容x：" + res.result);
          this.$nextTick(function () {
            this.skuBlur();
          });
        },
        fail: function (error) {
          console.log("error:", error);
        },
      });
    },
    // 验证库位
    validLocation(location) {
      if (!location) {
        this.errorToast("库位为空!");
        this.skuFocusFun("locationFocus");
        return false;
      }
      let data = this.allLocationList[location];
      if (!data) {
        this.errorToast("该库位不存在于盘点单!");
        this.skuFocusFun("locationFocus");
        return false;
      }
      this.searchValue = location;
      this.locationId = "";
      return true;
    },
    // 库位失焦
    locationBlur() {
      const location = this.locationId ? this.locationId.trim() : null;
      if (!this.validLocation(location)) return;
      let skuList = this.allLocationList[location].skuList || [];
      if (!skuList.length) {
        this.errorToast("该库位下没有要盘点的sku数据!");
        this.skuFocusFun("locationFocus");
        return;
      }
      this.skuFocusFun("skuFocus");
    },
    // sku失焦
    skuBlur() {
      if (!this.validLocation(this.searchValue)) return;
      const skuNo = this.skuNo ? this.skuNo.trim() : null;
      let skuList = this.locatItem.skuList || [];
      let [index, item] = [null, null];
      skuList.forEach((k, key) => {
        // 扫描的条码等于“条码编码”或等于“SKU”，都可以识别
        let barCodeList = k.barCode ? k.barCode.split(",") : [];
        if (k.goodsSku === skuNo || barCodeList.includes(skuNo)) {
          index = key;
          item = k;
        }
      });
      if (!item) {
        this.errorToast("注意该sku不存在盘点单内!");
        this.skuFocusFun("skuFocus");
        return;
      }
      const searchValue = this.searchValue;
      const totalLocation = this.allLocationList[searchValue].totalLocation;
      // sku盘点数加一
      this.$set(
        this.allLocationList[searchValue].skuList[index],
        "checkedInventoryNumber",
        (item.checkedInventoryNumber || 0) - 0 + 1
      );
      // 已盘点数量加一
      this.$set(
        this.allLocationList[searchValue].totalLocation,
        "totalCheckedInventoryNumber",
        (totalLocation.totalCheckedInventoryNumber || 0) - 0 + 1
      );
      this.openSound("001");
      // // 待盘点数减一
      // this.$set(
      //   this.allLocationList[searchValue].totalLocation,
      //   "totalAwaitCheckedInventoryNumber",
      //   totalLocation.totalAwaitCheckedInventoryNumber > 0
      //     ? totalLocation.totalAwaitCheckedInventoryNumber - 1
      //     : 0
      // );
      this.goodsSku = item.goodsSku;
      this.skuFocusFun("skuFocus");
    },
    // 获取列表
    getDetails() {
      return new Promise((resolve) => {
        const obj = {
          url: api.get_wmsInventoryCheckDetail,
          type: "post",
          data: {
            checkQuantityStatus: 0, // 0 全部 1 盘盈 2 盘平 3 盘亏
            inventoryCheckNo: this.option.inventoryCheckNo, // 盘点编号
            warehouseId: getStorage("newErpWarehouse").warehouseId,
            isPage: 1, //  是否分页处理（0分页1不分页）
            isPda: 1, //  是否是pda:1:是
          },
        };
        uni.showLoading({
          title: "数据加载中",
        });
        this.ajaxData(obj)
          .then(async (response) => {
            let data = response.data && response.data.datas ? response.data.datas : {};
            let invenList = data.warehouseLocationCheckDetailResultPage || {};
            let invenSkuList = data.inventoryCheckDetailResultPage || {};
            await this.getBarcodeBeSku(invenSkuList.list);
            // 计算全部库位下的盘点数据和sku列表数据
            let temp = {};
            (invenSkuList.list || []).forEach((sk) => {
              sk.deCheckedInventoryNumber = sk.checkedInventoryNumber; //用于保存比较
              const code = sk.warehouseLocationCode;
              if (temp[code]) {
                temp[code].skuList.push(sk);
              } else {
                temp[code] = {};
                temp[code].wareName = code;
                temp[code].skuList = [sk];
                temp[code].totalLocation = {};
              }
              (invenList.list || []).forEach((ik) => {
                if (code === ik.warehouseLocationCode) {
                  temp[code].totalLocation = ik;
                }
              });
            });
            // console.log(temp);
            this.allLocationList = temp;
          })
          .finally(() => {
            uni.hideLoading();
            resolve();
          });
      });
    },
    // 下个库位
    nextLocation() {
      let stockPosition = this.stockPosition;
      let subscript = stockPosition.indexOf(this.searchValue);
      let index = null;
      if (subscript < 0 || subscript >= stockPosition.length - 1) {
        index = 0;
      } else {
        index = subscript + 1;
      }
      this.searchValue = stockPosition[index];
      this.goodsSku = "";
      this.skuFocusFun("skuFocus");
    },
    // 保存
    saveMt() {
      let list = [];
      Object.keys(this.allLocationList).forEach((k) => {
        this.allLocationList[k].skuList.forEach((i) => {
          if (i.deCheckedInventoryNumber === i.checkedInventoryNumber) return;
          list.push({
            checkedInventoryNumber: i.checkedInventoryNumber, // 已盘点
            inventoryCheckDetailId: i.inventoryCheckDetailId, // 盘点明细ID
            actualPickingNumber: i.actualPickingNumber, //  实际拣货数量(完成判断是的快照)
            inventoryCheckNo: i.inventoryCheckNo, // 盘点单编号
            oriTotalNumber: i.oriTotalNumber, // 原库存总数量(包含已分配、冻结)
            productGoodsId: i.productGoodsId, // 货品id
            warehouseLocationId: i.warehouseLocationId, // 库位id
          });
        });
      });
      if (!list.length) {
        this.commonToast("无改动!");
        return;
      }
      const obj = {
        url: api.set_updateCheckDetail,
        type: "post",
        data: list,
      };
      uni.showLoading({
        title: "数据加载中",
      });
      this.ajaxData(obj)
        .then((response) => {
          let str = null;
          if (response.data.code === 0) {
            str = "保存成功";
            this.getDetails();
            this.isChange = true;
          } else if (response.data.code === 999993) {
            str = response.data.message;
          } else {
            str = "保存失败";
          }
          this.commonToast(str);
        })
        .finally(() => {
          uni.hideLoading();
        });
    },
    errorToast(msg) {
      this.commonToast(msg);
      this.openSound("002");
    },
    commonToast(msg) {
      uni.showToast({
        title: msg || "错误提示",
        icon: "none",
        duration: 2000,
      });
    },
  },
};
</script>

<style lang="less">
.view-main-body {

  uni-view,
  .scanInput {
    font-size: 40rpx;
  }

  padding: 20rpx 0;
  background: #fff;

  .com-btn {
    padding: 8rpx 0;
    color: #fff;
  }

  .scanWrap {
    padding: 0 20rpx;
  }

  .scanIcon {
    height: 80rpx;
  }

  .mb10 {
    margin-bottom: 20rpx;
  }

  .orange-btn {
    background: #ec663c;
  }

  .green-btn {
    background: #008001;
  }

  .errorTips {
    color: #f44336;
  }

  .tips {
    font-size: 24rpx;
    margin-top: 40rpx;
  }
}
</style>
