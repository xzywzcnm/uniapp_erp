<template>
  <view :class="wrap">
    <view class="scanWrap">
      <view class="uni-form-item uni-column">
        <view class="uni-input-wrapper" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }">
          <input class="uni-input" v-model.trim="searchValue" :focus="inputFocus" @confirm="scanPack()"
            placeholder="扫描归库单号查询" />
          <view class="iconfont text-16" @click="scanCode">&#xe612;</view>
        </view>
      </view>
    </view>
    <view class="pickinglistWrap">
      <view class="pickinglist">
        <view>
          <view class="d-flex justify-content-center normalPadding" v-if="stockReturn.length === 0">
            暂无数据
          </view>
          <view class="pickingItem" v-for="(item, index) in stockReturn" :key="item.regressProductNumber"
            @click="gotoStockDetails(item)">
            <view class="d-flex justify-content-between pickingHead">
              <text class="phTitle">归库单号：{{ item.regressProductNumber }}</text>
              <text class="phStatus" v-if="item.status === 0">待归库</text>
              <text class="phStatus" v-if="item.status === 1">归库完成</text>
            </view>
            <view class="mu-divider"></view>
            <view class="pickingItemContent">
              <view class="d-flex justify-content-start pItem">
                <text class="pItemTitle">库区：</text>
                <text>
                  {{ warehouseBlockName(item) }}
                </text>
              </view>
              <view class="d-flex justify-content-start pItem">
                <text class="pItemTitle">SKU种类/数量：</text>
                <text>{{ item.skuNumber }}/{{ item.quantity }}</text>
              </view>
              <view class="d-flex justify-content-start pItem">
                <text class="pItemTitle">创建人：</text>
                <text>{{ getUserName(item.createdBy) }}</text>
              </view>
              <view class="d-flex justify-content-start pItem">
                <text class="pItemTitle">创建日期：</text>
                <text>{{ getDataToLocalTime(item.createdTime) }}</text>
              </view>
              <view class="goToPicking">
                <text>开始归库</text>
                <text class="icon iconfont">&#xe636;</text>
              </view>
            </view>
          </view>
          <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/mixin/common_mixin";
import barcodeList_mixin from "@/mixin/barcodeList_mixin";
import { setStorage, getStorage, removeStorage } from "@/utils";
const prefixCls = "tongtool-workspace-pickingList";
export default {
  name: "stockReturn",
  mixins: [Mixin, barcodeList_mixin],
  data() {
    return {
      inputFocus: true,
      searchValue: "",
      stockReturn: [],
      loadingType: 0,
      contentText: {
        contentdown: "上拉显示更多",
        contentrefresh: "正在加载...",
        contentnomore: "没有更多数据了",
      },
      lastId: null,
    };
  },
  components: {},
  onShow() {
    let v = this;
    if (v.store.state.userInfoList && v.store.state.userInfoList.length > 0) {
      v.scanPack();
    } else {
      v.getAllUserInfo().then(() => {
        v.scanPack();
      });
    }
  },
  computed: {
    wrap() {
      return `${prefixCls}`;
    },
  },
  props: {},
  watch: {},
  methods: {
    warehouseBlockName(item) {
      return item.warehouseBlockNames != null
        ? item.warehouseBlockNames.join(",")
        : item.warehouseBlockName;
    },
    gotoStockDetails(row) {
      /**
       * 获取归库单详情
       * */
      let v = this;
      let { regressProductNumber, pickingType } = row;
      pickingType = pickingType || 'S1';
      const obj = {
        url: api.get_packageRegressProductDetail + regressProductNumber,
        type: "get",
      };
      v.ajaxData(obj).then(async (response) => {
        if (response.data.code === 0 && response.data.datas) {
          let list = (response.data.datas || []).map((k) => {
            k.pickingType = pickingType;
            return k;
          });
          // 销售出库则调用
          if (["S1"].includes(pickingType)) await this.getBarcodeBeSku(list);
          v.store.commit("stockReturnList", list);
          v.gotoPage("/pages/workspace/stockReturnDetails");
        } else {
          v.showToast("请求错误");
        }
      });
    },
    scanPack() {
      this.stockReturn = [];
      this.lastId = null;
      this.getList();
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
    getList() {
      let v = this;
      v.loadingType = 1;
      const obj = {
        url: api.get_packageRegressProductQuery,
        type: "post",
        data: {
          limit: 10,
          regressProductNumbers: v.searchValue ? [v.searchValue] : null,
          status: 0, // 归库单状态   0待归库 1 归库完成
          warehouseId: getStorage("newErpWarehouse").warehouseId,
          lastId: v.lastId,
        },
      };
      v.ajaxData(obj).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.length > 0) {
            v.stockReturn = v.stockReturn.concat(data);
            v.loadingType = 0;
            if (data.length < 2) {
              v.loadingType = 2;
            }
          } else {
            v.loadingType = 2;
          }
          v.lastId = response.data.others.lastId;
        }
      });
    },
    onReachBottom() {
      let v = this;
      if (v.loadingType !== 0) {
        return;
      }
      v.getList();
    },
  },
};
</script>

<style scoped>
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
</style>
