<template>
  <view :class="wrap">
    <view v-if="inventoryList && inventoryList.length > 0">
      <view
        class="box-first"
        v-for="item in inventoryList"
        :key="item.pickingListId"
      >
        <view class="d-flex justify-content-between head">
          <text class="title">盘点单号：{{ item.inventoryCheckNo }}</text>
          <text
            class="note"
            :class="item.checkStatus === '1' ? 'orange-color' : 'blue-color'"
            >{{
              item.checkStatus === "1"
                ? "盘点中"
                : item.checkStatus === "2"
                ? "已完成"
                : "待盘点"
            }}
          </text>
        </view>
        <view class="mu-divider"></view>
        <view class="contont">
          <view class="d-flex justify-content-start p-item">
            <text class="p-item-title">数量：</text>
            <text>
              {{ item.checkSkuNum || "" }}
            </text>
          </view>
          <view class="d-flex justify-content-start p-item">
            <text class="p-item-title">创建人：</text>
            <text>{{ getUserName(item.createdBy) }}</text>
          </view>
          <view class="d-flex justify-content-start p-item">
            <text class="p-item-title">创建日期：</text>
            <text>{{ getDataToLocalTime(item.createdTime, "fulltime") }}</text>
          </view>
          <view class="d-flex justify-content-start p-item">
            <text class="p-item-title">盘点人：</text>
            <text>{{ getUserName(item.checkUserId) }}</text>
          </view>
          <view class="d-flex justify-content-start p-item">
            <text class="p-item-title">开始日期：</text>
            <text v-if="item.checkStartTime">{{
              getDataToLocalTime(item.checkStartTime, "fulltime")
            }}</text>
            <text v-else></text>
          </view>
          <view class="d-flex justify-content-start p-item">
            <text class="p-item-title">结束日期：</text>
            <text v-if="item.checkEndTime">{{
              getDataToLocalTime(item.checkEndTime, "fulltime")
            }}</text>
            <text v-else></text>
          </view>
          <view class="operation">
            <text
              v-if="item.checkStatus === '0'"
              @click="
                gotoPage(
                  '/pages/workspace/inventoryCheckDetails?inventoryCheckNo=' +
                    item.inventoryCheckNo +
                    '&inventoryStatus=0',
                  '0'
                )
              "
              >开始盘点</text
            >
            <text
              v-if="item.checkStatus === '1'"
              @click="
                gotoPage(
                  '/pages/workspace/inventoryCheckDetails?inventoryCheckNo=' +
                    item.inventoryCheckNo +
                    '&inventoryStatus=1',
                  '1'
                )
              "
              >完成盘点</text
            >
            <text class="icon iconfont">&#xe636;</text>
          </view>
        </view>
      </view>
      <uni-load-more
        :loadingType="loadingType"
        :contentText="contentText"
      ></uni-load-more>
    </view>
    <view v-else>
      <no-data></no-data>
    </view>
    <view class="bottomBit d-flex justify-content-center align-items-center">
      <button
        type="primary"
        style="
          background-color: green !important;
          font-size: 34rpx;
          margin: 16rpx 8rpx;
        "
        @click="downMt"
      >
        下载/同步盘点单
      </button>
      <button
        type="primary"
        @click="addTask"
        style="font-size: 34rpx; margin: 16rpx 8rpx"
      >
        新建盘点任务
      </button>
    </view>
  </view>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/mixin/common_mixin";
import noData from "@/components/common/nodata";
const prefixCls = "tongtool-workspace-inventoryCheck";
import { setStorage, getStorage, removeStorage } from "@/utils";

export default {
  name: "inventoryCheck",
  mixins: [Mixin],
  components: {
    noData,
  },
  data() {
    return {
      inventoryList: [], // 盘点列表
      lastId: null,
      loadingType: 0,
      contentText: {
        contentdown: "上拉显示更多",
        contentrefresh: "正在加载...",
        contentnomore: "没有更多数据了",
      },
    };
  },
  created() {},
  computed: {
    wrap() {
      return `${prefixCls}`;
    },
    // userInfoList() {
    //     return this.store.state.userInfoList
    // }
  },
  props: {},
  watch: {},
  onLoad(option) {
    let v = this;
    let loadStoreWarehouse = getStorage("newErpWarehouse");
    if (loadStoreWarehouse) {
      v.warehouseName = loadStoreWarehouse.warehouseName;
      v.warehouseId = loadStoreWarehouse.warehouseId;
    }
    uni.setNavigationBarTitle({
      title: `库存盘点(${v.warehouseName})`,
    });
  },
  onShow() {
    let v = this;
    v.lastId = null;
    v.inventoryList = [];
    if (v.store.state.userInfoList && v.store.state.userInfoList.length > 0) {
      v.getList();
    } else {
      v.getAllUserInfo().then(() => {
        v.getList();
      });
    }
  },
  methods: {
    addTask() {
      this.gotoPage("/pages/workspace/InventoryCheckCreate");
    },
    downMt() {
      this.lastId = null;
      this.inventoryList = [];
      // 领取任务 isGetTask:1
      this.getList({ isGetTask: 1 });
    },
    getList(option) {
      let v = this;
      v.loadingType = 1;
      let temp = {
        checkStatusList: ["0", "1"], // 盘点状态(0待盘点1盘点中2已完成) 前端传["0","1"],
        inventoryCheckNo: null, // 盘点编号
        lastId: v.lastId,
        limit: 10,
        warehouseId: getStorage("newErpWarehouse").warehouseId,
        isPda: 1,
      };
      if (option) {
        temp = Object.assign(temp, option);
      }
      const obj = {
        url: api.get_wmsInventoryCheckList,
        type: "post",
        data: temp,
      };
      uni.showLoading({
        title: "数据加载中",
      });
      v.ajaxData(obj).then((response) => {
        uni.hideLoading();
        if (response.data.code === 0) {
          let datas = response.data.datas;
          if (datas.length > 0) {
            v.lastId = response.data.others.lastId;
            v.inventoryList = v.inventoryList.concat(datas);
            v.loadingType = 0;
            if (datas.length < 10) {
              v.loadingType = 2;
            }
          } else {
            v.loadingType = 2;
          }
        }
      });
    },
  },
  onReachBottom() {
    let v = this;
    if (v.loadingType !== 0) {
      return;
    }
    v.getList();
  },
};
</script>

<style lang="less" scoped>
.box-first {
  margin-bottom: 20rpx;
  &,
  uni-view {
    font-size: 36rpx;
  }
  .head {
    padding: 20rpx;
    background-color: #fff;
  }
  .title {
    font-weight: bold;
  }
  .contont {
    background-color: #fff;
    font-size: 38rpx;
    padding: 10rpx 0;
    position: relative;
  }
  .contont .p-item {
    padding: 5rpx 20rpx;
  }
  .operation {
    position: absolute;
    right: 0;
    top: 50%;
    margin-top: -28rpx;
    z-index: 1;
    font-size: 38rpx;
    color: #1976d2;
  }
}
</style>
