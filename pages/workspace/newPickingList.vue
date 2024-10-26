<template>
  <view :class="wrap">
    <!-- #ifdef MP-WEIXIN -->
    <view class="wechatFilter d-flex justify-content-end align-items-end">
      <text class="icon iconfont wechatSearch" @click="gotoHistory">&#xe604;</text>
    </view>
    <!-- #endif -->
    <view class="pickinglistWrap">
      <uni-segmented-control
        :current="current"
        :values="tabArr"
        @clickItem="onClickItem"
        bgColor="#FFFFFF"
        activeColor="#1976d2"
        style-type="text"
      ></uni-segmented-control>
      <view class="mu-divider"></view>
      <view class="pickinglist">
        <view v-if="current === 0">
          <view
            class="pickingItem"
            v-for="(item, index) in waitPickingList"
            :key="item.pickingGoodsId"
            @click="
              gotoPickingDetails(
                item.pickingGoodsId,
                item.pickingGoodsNo,
                item.pickingGoodsBasketList,
                index,
                item.packageGoodsType
              )
            "
          >
            <view class="d-flex justify-content-between pickingHead">
              <text class="phTitle">捡货单号：{{ item.pickingGoodsNo }}</text>
              <text class="phStatus" v-if="item.packageGoodsStatus === '0'">待拣货</text>
              <text class="phStatus" v-if="item.packageGoodsStatus === '2'"
                >部分拣货</text
              >
            </view>
            <view class="mu-divider"></view>
            <view class="pickingItemContent">
              <view class="d-flex justify-content-start pItem" v-if="showNum">
                <text class="pItemTitle">拣货单类型：</text>
                <text>
                  {{
                    item.packageGoodsType === "SS"
                      ? "单品"
                      : item.packageGoodsType === "MM"
                      ? "多品"
                      : ""
                  }}
                </text>
              </view>
              <view class="d-flex justify-content-start pItem">
                <text class="pItemTitle">创建人：</text>
                <text>{{ item.createdByName }}</text>
              </view>
              <view class="d-flex justify-content-start pItem">
                <text class="pItemTitle">拣货人：</text>
                <text v-if="item.finishUserName">{{ item.finishUserName }}</text>
              </view>
              <view class="d-flex justify-content-start pItem">
                <text class="pItemTitle">创建日期：</text>
                <text>{{ getDataToLocalTime(item.createdTime, "fulltime") }}</text>
              </view>
              <view class="d-flex justify-content-start pItem" v-if="showNum">
                <view>出库单数：{{ item.pickingNumber }}</view>
                <view class="jg">|</view>
                <view>SKU数：{{ item.goodsSkuNumber }}</view>
                <view class="jg">|</view>
                <view>货品数：{{ item.goodsQuantityNumber }}</view>
              </view>

              <view class="d-flex justify-content-start pItem">
                <text class="pItemTitle" style="flex-shrink: 0">拣货提醒：</text>
                <text>{{ item.remark ? item.remark : "" }}</text>
              </view>
              <view class="d-flex justify-content-start pItem">
                <text class="pItemTitle" style="flex-shrink: 0">物流渠道：</text>
                <view v-if="item.shippingMethodResults">
                  <view
                    v-for="(it, itIndex) in item.shippingMethodResults"
                    :key="it.itIndex"
                  >
                    <text v-if="itIndex < 3"
                      >{{ it.carrierName }}>>{{ it.shippingMethodName }}
                      <text v-if="itIndex == 2 && item.shippingMethodResults.length > 3"
                        >...等</text
                      >
                    </text>
                  </view>
                </view>
                <view v-else>无</view>
              </view>
              <view class="d-flex justify-content-start pItem">
                <text class="pItemTitle" style="flex-shrink: 0">产品类型：</text>
                <template v-if="productTypeList[item.pickingGoodsProductType]">
                  <text :style="productTypeList[item.pickingGoodsProductType].style">{{
                    productTypeList[item.pickingGoodsProductType].label
                  }}</text>
                </template>
              </view>
              <view class="goToPicking">
                <text>开始拣货</text>
                <text class="icon iconfont">&#xe636;</text>
              </view>
            </view>
          </view>
        </view>
        <view v-if="current === 1" class="abnormal">
          <view
            class="d-flex justify-content-center normalPadding"
            v-if="abnormalList.length === 0"
          >
            暂无数据
          </view>
          <u-checkbox-group>
            <view
              class="pickingItem"
              v-for="item in abnormalList"
              :key="item.pickingListId"
            >
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
                  <view
                    >待拣货数量：<span>{{
                      Number(item.pickingGoodsNumber) + Number(item.notPickingGoodsNumber)
                    }}</span>
                  </view>
                  <view class="jg">|</view>
                  <view>已拣货数量：{{ item.pickingGoodsNumber }}</view>
                </view>
              </view>
            </view>
          </u-checkbox-group>
          <uni-load-more
            v-if="abnormalList.length"
            :loadingType="loadingType"
            :contentText="contentText"
          >
          </uni-load-more>
        </view>
      </view>
    </view>
    <view
      v-if="current === 1 && waitPickingList && waitPickingList.length"
      class="bottomBit d-flex justify-content-center align-items-center"
    >
      <button size="mini" @click="checkAll" class="color-fff">全选</button>
      <button class="success" type="primary" size="mini" @click="removeAbnormal">
        移除记录
      </button>
    </view>
  </view>
</template>
<script>
import Mixin from "@/mixin/common_mixin";
import api from "@/api/api";
const prefixCls = "tongtool-workspace-pickingList";
import { setStorage, getStorage, removeStorage } from "@/utils";

export default {
  mixins: [Mixin],
  components: {},
  data() {
    return {
      noAlreadyData: false,
      noData: false,
      showNum: false,
      tabArr: ["等待拣货", "拣货异常"],
      current: 0,
      waitPickingList: [],
      abnormalList: [],
      loadingType: 0,
      contentText: {
        contentdown: "上拉显示更多",
        contentrefresh: "正在加载...",
        contentnomore: "没有更多数据了",
      },
      params: null,
      searchParams: null,
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
      productTypeList: {
        0: { label: "普通产品", value: 0 },
        1: { label: "组合产品", value: 1, style: "color:red;" },
        2: { label: "混合产品", value: 2 },
      },
    };
  },
  computed: {
    wrap() {
      return `${prefixCls}`;
    },
    userInfoLists() {
      //有坑，跟mixin定义的变量混用了（害我找了好久）
      return this.store.state.userInfoList;
    },
  },
  watch: {
    current(n, o) {
      if (n === 1) {
        this.abnormalParams.lastId = null;
        this.getWmsPickingGoodsAbnormal();
        this.abnormalList = [];
      } else if (n === 0) {
        this.getWaitingList();
      }
    },
    userInfoLists(val) {
      this.userInfoList = val;
    },
  },
  methods: {
    /**
     * 移除记录
     */
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
    /**
     * 获取异常列表
     * @date: 2021/6/1 9:33
     */
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
    /**
     * 全选
     * */
    checkAll() {
      let v = this;
      let checkStatus = v.abnormalList.every((i) => i.checked);
      v.abnormalList.forEach((i) => {
        v.$set(i, "checked", !checkStatus);
      });
    },
    getSettingsConfigObj() {
      let v = this;
      const obj = {
        url: api.get_settingConfig,
        type: "GET",
      };
      v.ajaxData(obj).then((response) => {
        if (response.data.code === 0) {
          v.showNum = response.data.datas.showNum === "1";
          setStorage("settingsConfigObj", response.data.datas);
        }
      });
    },
    gotoPickingDetails(
      pickingGoodsId,
      pickingGoodsNo,
      pickingGoodsBasketList,
      index,
      packageGoodsType
    ) {
      let v = this;
      let pickingSettings = getStorage("settingsConfigObj");
      if (v.store.state.userInfo) {
        v.$set(
          v.waitPickingList[index],
          "finishUserName",
          v.store.state.userInfo.user.userName
        );
      }
      let warehouseKey = "picking_wmsWarehouse_" + v.warehouseId + "_waitList";
      setStorage(warehouseKey, v.waitPickingList);
      if (pickingSettings) {
        // "useBasket": "是否使用拣货篮'1':是'0':否", dataType = "String")
        if (pickingSettings.useBasket !== "1") {
          uni.navigateTo({
            url:
              "/pages/workspace/newPickingDetails" +
              "?packageNum=" +
              "" +
              "&pickingGoodsNo=" +
              pickingGoodsNo +
              "&pickingGoodsId=" +
              pickingGoodsId +
              "&warehouseId=" +
              v.warehouseId,
          });
        } else {
          if (pickingGoodsBasketList) {
            setStorage("newScanPackage", pickingGoodsBasketList);
          } else {
            removeStorage("newScanPackage");
          }
          uni.navigateTo({
            url:
              "/pages/workspace/newScanPackage" +
              "?pickingGoodsId=" +
              pickingGoodsId +
              "&pickingGoodsNo=" +
              pickingGoodsNo +
              "&warehouseId=" +
              v.warehouseId +
              "&packageGoodsType=" +
              packageGoodsType,
          });
        }
      } else {
        uni.navigateTo({
          url:
            "/pages/workspace/newPickingDetails" +
            "?packageNum=" +
            "" +
            "&pickingGoodsNo=" +
            pickingGoodsNo +
            "&pickingGoodsId=" +
            pickingGoodsId +
            "&warehouseId=" +
            v.warehouseId,
        });
      }
    },
    getUserName(id) {
      let v = this;
      if (v.userInfoList && v.userInfoList[id]) {
        return v.userInfoList[id].username;
      } else {
        return "";
      }
    },
    onClickItem(index) {
      if (this.current !== index) {
        this.current = index;
      }
    },
    getWaitingList() {
      let v = this;
      const obj = {
        url: api.get_wmsPickingGoods,
        data: {
          warehouseId: v.warehouseId,
        },
      };
      uni.showLoading({
        title: "数据加载中",
      });
      v.ajaxData(obj).then((response) => {
        uni.hideLoading();
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data && data.warehouseId) {
            v.waitPickingList = [data];
          }
        }
      });
    },
    gotoHistory() {
      let v = this;
      uni.navigateTo({
        url: "/pages/workspace/newPickingHistoryList" + "?warehouseId=" + v.warehouseId,
      });
    },
  },
  onUnload() {},
  onShow() {
    // this.store.commit('newPickBackStatus', false);
    this.getSettingsConfigObj();
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
  onLoad(option) {
    let v = this;
    let loadStoreWarehouse = getStorage("newErpWarehouse");
    if (loadStoreWarehouse) {
      v.warehouseName = loadStoreWarehouse.warehouseName;
      v.warehouseId = loadStoreWarehouse.warehouseId;
    }
    v.getWaitingList();
  },
  onPullDownRefresh() {
    let v = this;
    if (v.current === 0) {
      v.getWaitingList();
    } else if (v.current === 1) {
      v.abnormalParams.lastId = null;
      v.getWmsPickingGoodsAbnormal();
    }

    setTimeout(function () {
      uni.stopPullDownRefresh();
    }, 2000);
  },
  onNavigationBarButtonTap(obj) {
    let v = this;
    if (obj.index === 0) {
      v.gotoHistory();
    }
  },
};
</script>
<style scoped>
.abnormal {
  padding-bottom: 50px;
}

.abnormal .pickingItem {
  width: 100%;
}
</style>
