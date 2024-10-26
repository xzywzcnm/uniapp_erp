<template>
  <view :class="wrap" class="check-new-order">
    <uni-segmented-control :current="current" :values="tabArr" @clickItem="onClickItem" bgColor="#FFFFFF"
      activeColor="#1976d2" style-type="text"></uni-segmented-control>
    <view v-if="current === 0">
      <view class="normalPadding">
        <view>
          <view class="uni-form-item uni-column">
            <view class="title">出库单类型</view>
            <view class="uni-list">
              <view class="uni-list-cell">
                <view class="uni-list-cell-left"> 当前选择 </view>
                <view class="uni-list-cell-db">
                  <picker @change="bindCleaningPickerChange" :value="cleanIndex" :range="pickingTypeList"
                    range-key="pickingName">
                    <view class="uni-input" v-if="pickingTypeList[cleanIndex]">
                      {{ pickingTypeList[cleanIndex].pickingName }}
                    </view>
                  </picker>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="normal-margin-top">
          <view class="uni-form-item uni-column">
            <view class="title">邮寄方式</view>
            <view class="uni-list">
              <view class="uni-list-cell">
                <view class="uni-list-cell-left white-space-nowrap">
                  当前选择
                </view>
                <view class="uni-list-cell-db">
                  <view style="height: 25px; padding: 7px 12px" @click="
                    gotoPage(
                      '/pages/workspace/choseShip?warehouseId=' + warehouseId
                    )
                    ">
                    <span style="
                        font-size: 12px;
                        display: inline-block;
                        width: 97%;
                        line-height: 14px;
                      ">{{ shipName }}</span>
                    <uni-icons style="
                        position: absolute;
                        right: 5px;
                        top: 50%;
                        margin-top: -14px;
                      " type="arrowright" size="16" />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="normal-margin-top">
          <view class="uni-form-item uni-column">
            <view class="title">库区组</view>
            <view class="uni-list">
              <view class="uni-list-cell" @click="show = true">
                <view class="uni-list-cell-left">
                  <span>当前选择</span>
                </view>
                <view class="uni-list-cell-db">
                  <u-picker mode="selector" v-if="reservoirGroupList && reservoirGroupList.length"
                    @confirm="pickerConfirm" v-model="show" :range="reservoirGroupList" range-key="name"></u-picker>
                  <view class="uni-input" v-if="reservoirGroupIndex !== null &&
                    reservoirGroupList &&
                    reservoirGroupList.length
                    ">
                    {{ reservoirGroupList[reservoirGroupIndex].name }}
                  </view>
                  <view class="uni-input" v-else>全部</view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="normal-margin-top">
          <view class="uni-form-item uni-column">
            <view class="title">拣货单号</view>
            <input class="uni-input" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }" focus
              v-model.trim="searchKeyName" placeholder="请输入扫描或输入拣货单号" />
          </view>
        </view>
      </view>
      <view class="bottomBit">
        <view class="d-flex justify-content-center align-tiems: center">
          <button type="default" class="green" size="mini" @click="bindHandel">
            <text>接单</text>
          </button>
          <button type="default" style="color: #ffffff" size="mini" @click="reset">
            <text>重置</text>
          </button>
        </view>
      </view>
    </view>
    <view class="pickinglistWrap mt10">
      <view v-if="current === 1" class="pickinglist">
        <view class="abnormal">
          <view class="d-flex justify-content-center normalPadding" v-if="abnormalList.length === 0">
            暂无数据
          </view>
          <u-checkbox-group>
            <view class="pickingItem" v-for="item in abnormalList" :key="item.pickingListId">
              <view class="d-flex justify-content-between pickingHead">
                <text class="phTitle">捡货篮子号：{{ item.pickingGoodsBasket }}</text>
                <u-checkbox v-model="item.checked"></u-checkbox>
              </view>
              <view class="mu-divider"></view>
              <view class="pickingItemContent">
                <view class="d-flex justify-content-start pItem">
                  <text class="pItemTitle">拣货单单号：</text>
                  <text>
                    {{ item.pickingGoodsId }}
                  </text>
                </view>
                <view class="d-flex justify-content-start pItem">
                  <text class="pItemTitle">SKU：</text>
                  <text>{{ item.goodsSku }}</text>
                </view>
                <view class="d-flex justify-content-start pItem">
                  <text class="pItemTitle">货品：</text>
                  <text>{{ item.cnHsName }}</text>
                </view>
                <view class="d-flex justify-content-start pItem">
                  <text class="pItemTitle">货位：</text>
                  <text>{{ item.warehouseLocationName }}</text>
                </view>
                <view class="d-flex justify-content-start pItem">
                  <view>待拣货数量：<span>{{
                    Number(item.pickingGoodsNumber) +
                    Number(item.notPickingGoodsNumber)
                  }}</span>
                  </view>
                  <view class="jg">|</view>
                  <view>已拣货数量：{{ item.pickingGoodsNumber }}</view>
                </view>
              </view>
            </view>
          </u-checkbox-group>
          <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
        </view>
      </view>
    </view>
    <view v-if="current === 1" class="bottomBit d-flex justify-content-center align-items-center">
      <button size="mini" @click="checkAll" class="color-fff">全选</button>
      <button class="success" type="primary" size="mini" @click="removeAbnormal">
        移除记录
      </button>
    </view>

    <shipping-method :shippingDialog="shippingDialog" @shippingMethodOpen="shippingMethodOpen"></shipping-method>
  </view>
</template>
<style>
.uni-list {
  background-color: #ffffff;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.uni-list:after {
  position: absolute;
  z-index: 10;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1 upx;
  content: "";
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  background-color: #c8c7cc;
}

.uni-form-item {
  display: flex;
  width: 100%;
  padding: 10 upx 0;
}

.uni-form-item .title {
  padding: 10 upx 25 upx;
  font-size: 28 upx;
}

.uni-column {
  flex-direction: column;
}

.uni-label {
  width: 210 upx;
  word-wrap: break-word;
  word-break: break-all;
  text-indent: 20 upx;
}

.uni-list-cell {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.uni-list-cell-hover {
  background-color: #eee;
}

.uni-list-cell-pd {
  padding: 22 upx 30 upx;
}

.uni-list-cell-left {
  font-size: 28 upx;
  padding: 0 30 upx;
}

.uni-list-cell-db,
.uni-list-cell-right {
  flex: 1;
}

.uni-list-cell:after {
  position: absolute;
  z-index: 3;
  right: 0;
  bottom: 0;
  left: 30 upx;
  height: 1 upx;
  content: "";
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  background-color: #c8c7cc;
}
</style>
<style scoped>
.abnormal {
  padding-bottom: 50px;
}

.abnormal .pickingItem {
  width: 100%;
}

.bottomBit .green {
  color: #ffffff;
  background-color: green;
}
</style>
<script>
import { setStorage, getStorage } from "../../utils";
const prefixCls = "tongtool-workspace-pickingList";
import api from "@/api/api";
import commonMixin from "../../mixin/common_mixin";
import shippingMethod from "./checkNewPickingOrder/shippingMethod";
export default {
  data() {
    return {
      tabArr: ["接拣货单", "拣货异常"],
      abnormalList: [],
      loadingType: 0,
      contentText: {
        contentdown: "上拉显示更多",
        contentrefresh: "正在加载...",
        contentnomore: "没有更多数据了",
      },
      current: 0,
      abnormalParams: {
        pickingGoodsAbnormalId: "", // 出库单拣货单异常ID
        merchantId: "", // 商户编号
        pickingGoodsId: "", // 出库单拣货单ID
        pickingGoodsBasket: "", // 拣货篮
        warehouseLocationId: "", // 异常库位流水号
        productGoodsId: "", // 货品信息ID
        lastId: null,
        limit: 10,
      },
      bindLoad: false,
      show: false,
      reservoirGroupList: [], // 库区组List
      reservoirGroupIndex: null, // 库区组Index
      shipName: "全部",
      searchKeyName: "",
      pickingTypeList: [],
      warehouseId: null,
      cleanIndex: 0,
      warehouseBlockGroupId: "",
      merchantCarrierId: "", // 承运人
      merchantShippingMethodId: "", // 邮寄方式
      shippingDialog: {
        isShow: false,
      },
    };
  },
  mixins: [commonMixin],
  computed: {
    wrap() {
      return `${prefixCls}`;
    },
  },
  components: {
    shippingMethod,
  },
  methods: {
    getWmsPickingGoodsAbnormal() {
      let v = this;
      const obj = {
        url: api.get_wmsPickingGoodsAbnormal,
        data: {
          warehouseId: v.warehouseId,
          ...v.abnormalParams,
        },
      };
      uni.showLoading({
        title: "数据加载中",
      });
      v.loadingType = 1;
      v.ajaxData(obj)
        .then((response) => {
          uni.hideLoading();
          if (response.data.code === 0) {
            let data = response.data.datas;
            if (data.length > 0) {
              v.abnormalList = v.abnormalList.concat(data);
              v.abnormalParams.lastId = response.data.others.lastId;
              v.loadingType = 0;
              if (data.length < 10) {
                v.loadingType = 2;
              }
            } else {
              v.loadingType = 2;
            }
          }
        })
        .catch(() => {
          uni.hideLoading();
        });
    },
    checkAll() {
      let v = this;
      let checkStatus = v.abnormalList.every((i) => i.checked);
      v.abnormalList.forEach((i) => {
        v.$set(i, "checked", !checkStatus);
      });
    },
    removeAbnormal() {
      let v = this;
      let ids = v.abnormalList
        .filter((i) => i.checked)
        .map((i) => i.pickingGoodsAbnormalId);
      if (ids.length === 0) {
        v.showToast("未选择数据");
        return;
      }
      const obj = {
        url: api.set_modifyToPickingGoodsAbnormal,
        type: "delete",
        data: {
          pickingGoodsAbnormalIds: ids,
        },
      };
      v.ajaxData(obj).then((response) => {
        if (response.data.code === 0) {
          v.showToast("操作成功");
          v.abnormalList = [];
          v.abnormalParams.lastId = null;
          v.getWmsPickingGoodsAbnormal();
        }
      });
    },
    onClickItem(index) {
      if (this.current !== index) {
        this.current = index;
      }
    },
    gotoHistory() {
      let v = this;
      uni.navigateTo({
        url:
          "/pages/workspace/newPickingHistoryList" +
          "?warehouseId=" +
          v.warehouseId,
      });
    },
    pickerConfirm(arr) {
      this.reservoirGroupIndex = arr[0];
      this.warehouseBlockGroupId =
        this.reservoirGroupList[this.reservoirGroupIndex].warehouseBlockGroupId;
    },
    reset() {
      this.cleanIndex = 0;
      this.reservoirGroupIndex = null;
      this.searchKeyName = "";
      this.shipName = "全部";
      this.merchantCarrierId = "";
      this.warehouseBlockGroupId = "";
      this.merchantShippingMethodId = "";
    },
    setPickingCache() {
      let v = this;
      setStorage("pickingSearchParams", {
        shipName: v.shipName,
        merchantCarrierId: v.merchantCarrierId,
        merchantShippingMethodId: v.merchantShippingMethodId,
        warehouseBlockGroupId: v.warehouseBlockGroupId, // 库区组
        searchKeyName: v.searchKeyName,
        reservoirGroupIndex: v.reservoirGroupIndex, // 库区组
        cleanIndex: v.cleanIndex, // 接货单号
      });
    },
    getPickingCache() {
      let data = getStorage("pickingSearchParams");
      if (data) {
        this.shipName = data.shipName;
        this.merchantCarrierId = data.merchantCarrierId;
        this.merchantShippingMethodId = data.merchantShippingMethodId;
        this.warehouseBlockGroupId = data.warehouseBlockGroupId; // 库区组
        this.reservoirGroupIndex = data.reservoirGroupIndex;
        this.cleanIndex = data.cleanIndex; // 出库单类型
        this.searchKeyName = data.searchKeyName; // 接货单号
      }
    },
    /**
     * 接单
     * */
    bindPickingGoods(params) {
      let v = this;
      if (v.bindLoad) return;
      v.bindLoad = true;
      const obj = {
        url: api.set_bindPickingGoods,
        type: "put",
        data: params,
      };
      uni.showLoading({
        title: "数据加载中",
      });
      v.setPickingCache();
      v.ajaxData(obj)
        .then((response) => {
          v.bindLoad = false;
          uni.hideLoading();
          if (response.data.code === 0) {
            v.showToastIcon("接单成功");
            setTimeout(() => {
              v.redirectTo("/pages/workspace/newPickingList");
            }, 60);
          } else if (response.data.code === 111173) {
            if (params.merchantShippingMethodId) {
              this.shippingDialog.isShow = true;
            } else {
              v.showToast("当前条件没有拣货单");
            }
          } else if (response.data.code === 111172) {
            v.showToast("存在拣货单还没拣货完成");
          }
        })
        .catch(() => {
          v.bindLoad = false;
          uni.hideLoading();
        });
    },
    /**
     * 接单
     * */
    bindHandel() {
      let pickingTypeItem = this.pickingTypeList[this.cleanIndex] || {};
      this.bindPickingGoods({
        warehouseId: this.warehouseId,
        merchantCarrierId: this.merchantCarrierId || null,
        merchantShippingMethodId: this.merchantShippingMethodId || null,
        warehouseBlockGroupId: this.warehouseBlockGroupId || null,
        pickingGoodsNo: this.searchKeyName || null,
        pickingType: pickingTypeItem.pickingCode,
      });
    },
    bindCleaningPickerChange(e) {
      this.cleanIndex = Number(e.target.value);
    },
    bindReservoirGroupChange(e) {
      this.reservoirGroupIndex = Number(e.target.value);
      this.warehouseBlockGroupId =
        this.reservoirGroupList[this.reservoirGroupIndex].warehouseBlockGroupId;
    },
    /**
     * 获取库区组
     * */
    getWarehouseBlockGroup() {
      let v = this;
      const obj = {
        url: api.get_wmsWarehouseBlockGroup,
        type: "get",
        data: {
          warehouseId: v.warehouseId,
        },
      };
      v.ajaxData(obj).then((response) => {
        if (response.data.code === 0) {
          v.reservoirGroupList = response.data.datas;
        }
      });
    },
    /**
     * 海外仓出库单拣货类型取值
     * */
    getpickingTypeList() {
      return this.ajaxData({
        url: api.queryPickingGoodsTypes,
        type: "get",
      }).then((response) => {
        if (response.data.code === 0) {
          this.pickingTypeList = response.data.datas || [];
        }
      });
    },
    // 键盘弹出导致页面不回落
    blurIn() {
      uni.pageScrollTo({
        duration: 100, // 毫秒
        scrollTop: 0, // 位置
      });
    },
    // 弹框返回信息
    shippingMethodOpen(type) {
      if (type === 1) {
        let pickingTypeItem = this.pickingTypeList[this.cleanIndex] || {};
        this.bindPickingGoods({
          warehouseId: this.warehouseId,
          merchantCarrierId: null,
          merchantShippingMethodId: null,
          warehouseBlockGroupId: this.warehouseBlockGroupId || null,
          pickingGoodsNo: this.searchKeyName || null,
          pickingType: pickingTypeItem.pickingCode,
        });
      }
    },
  },
  onNavigationBarButtonTap(obj) {
    let v = this;
    if (obj.index === 0) {
      v.gotoHistory();
    }
  },
  onReachBottom() {
    let v = this;
    if (v.loadingType !== 0) {
      return;
    }
    if (v.current === 1) {
      v.getWmsPickingGoodsAbnormal();
    }
  },
  onPullDownRefresh() {
    let v = this;
    if (v.current === 1) {
      v.abnormalParams.lastId = null;
      v.getWmsPickingGoodsAbnormal();
    }
    setTimeout(function () {
      uni.stopPullDownRefresh();
    }, 2000);
  },
  onShow() {
    this.getPickingCache();
    let option = this.store.state.choseShip;
    if (option && option.name) {
      this.shipName = option.name;
      this.merchantCarrierId = option.value[0];
      this.merchantShippingMethodId = option.value[1];
    } else {
      this.getPickingCache();
    }
    this.getWarehouseBlockGroup();
  },
  watch: {
    current(n, o) {
      if (n === 1) {
        this.abnormalParams.lastId = null;
        this.getWmsPickingGoodsAbnormal();
        this.abnormalList = [];
      }
    },
  },
  async onLoad(option) {
    this.current = 0;
    this.warehouseId = option.warehouseId;
    await this.getpickingTypeList();
    // 有搜索缓存
    if (option.searchPage === "isSearch") {
      this.searchKeyName = option.pickingGoodsNo;
      let cleanIndex = 0;
      this.pickingTypeList.forEach((k, i) => {
        if (k.pickingCode === option.pickingType) cleanIndex = i;
      })
      this.cleanIndex = cleanIndex >= 0 ? cleanIndex : 0;
    }
  },
};
</script>
