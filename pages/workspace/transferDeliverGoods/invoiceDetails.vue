<template>
    <view class="invoice-detail">
        <view class="header">
          <text class="u-font-14">发货单号：</text>
          <text class="u-font-14">{{details.deliveryCode}}</text>
        </view>
        <view class="tabs d-flex">
          <view class="col-6 tab-item" @click="changeTabs('0')" :class="tabActive === '0' ? 'active': ''">未装箱货品</view>
          <view class="col-6 tab-item" @click="changeTabs('1')" :class="tabActive === '1' ? 'active': ''">箱子列表</view>
        </view>
        <view class="unpacked-goods" v-if="tabActive === '0'">
          <view class="item" v-for="item in skuList">
            <view class="d-flex">
              <view>
                <image :src="setImgPathOld(item.imageGroupId)" :mode="'aspectFit'" style="width: 60px;height: 60px;"  />
              </view>
              <view style="margin-left: 10px;margin-top: -4px;">
                <view class="d-flex">
                  <view class="item-label">SKU:</view>
                  <view>{{item.goodsSku}}</view>
                </view>
                <view class="d-flex">
                  <view class="item-label">未装箱数量:</view>
                  <view>{{item.pickQuantity}}</view>
                </view>
                <view class="d-flex">
                  <view class="item-label">名称:</view>
                  <view>{{item.productName}}</view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="box-list" v-if="tabActive === '1'">
            <view class="item d-flex" v-for="item in list" @click="gotoBinningPage(item.boxStatus, item.transitBoxId)">
                <view class="col-4 text-center">{{item.boxCode}}</view>
                <view class="col-6 text-center">状态：
                  <text v-if="item.boxStatus ==='0'">未装箱</text>
                  <text v-if="item.boxStatus ==='1'" class="red">部分装箱</text>
                  <text v-if="item.boxStatus ==='2'" class="green">结束装箱</text>
                </view>
                <view class="position-view">
                  <text class="icon iconfont">&#xe636;</text>
                </view>
            </view>
        </view>
        <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
        <view class="bottomBit row no-gutters">
          <button type="primary" style="width: 100%" size="mini" @click="addBox">
            <text>新增箱子</text>
          </button>
        </view>
    </view>
</template>

<script>
/**
 * 中转发货-发货单明细
 * @author gan
 * @date: 2021/2/25 10:05
 */
import Mixin from '@/mixin/common_mixin';
import api from "@/api/api";
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
export default {
  name: "InvoiceDetails",
  mixins: [Mixin],
  data () {
    return {
      /*imagePlaceholder: require("../../static/placeholder.jpg")*/
      tabActive: '0',
      status: '1',
      appropriationTransitplanDeliveryId: '',
      details: null,
      skuList: [],
      list: [],
      lastId: 0,
      loadingType: 0,
      goodsSku: '',
      contentText: {
        contentdown: '上拉显示更多',
        contentrefresh: '正在加载...',
        contentnomore: '没有更多数据了'
      },
    };
  },
  created () {

  },
  props: {},
  onLoad (option) {
    this.reset('deep');
    if (option) {
        this.appropriationTransitplanDeliveryId = option.appropriationTransitplanDeliveryId;
        this.details = getStorage('invoiceListItem');
        setStorage('appropriationTransitplanDeliveryId', option.appropriationTransitplanDeliveryId)
        if (option.box) {
          setStorage('transferBox', option.box)
        }
        if (option.sku) {
          setStorage('transferSku', option.sku)
        }
    }
  },
  onShow() {
    this.reset();
    if (getStorage("appropriationTransitplanDeliveryId")) {
      this.appropriationTransitplanDeliveryId = getStorage("appropriationTransitplanDeliveryId");
    }
    if (getStorage('transferBox')) {
      this.boxCode = getStorage('transferBox');
      this.tabActive = '1';
      this.getBoxList();
      return
    }
    if (getStorage('transferSku')) {
      this.goodsSku = getStorage('transferSku');
    }
    this.tabActive = '0';
    this.lastId = 0;
    this.getDetails();

  },
  onReachBottom () {
    let v = this;
    if (v.loadingType !== 0 || v.tabActive !== '0') {
      return;
    }
    v.getList();
  },
  methods: {
    addBox () {
      uni.navigateTo({
        url: '/pages/workspace/transferDeliverGoods/binning?appropriationTransitplanDeliveryId=' + this.appropriationTransitplanDeliveryId
      })
    },
    changeTabs (type) {
      this.tabActive = type;
      this.lastId = 0;
      this.reset();
      if (type === '0') {
        this.skuList = [];
        this.getDetails();
      } else {
        this.list = [];
        this.getBoxList()
      }
    },
    reset (type) {
      this.goodsSku = '';
      this.boxCode = '';
      this.skuList = [];
      this.list = [];
      if (type === 'deep') {
        removeStorage('appropriationTransitplanDeliveryId');
        removeStorage('transferBox');
        removeStorage('transferSku');
      }
    },
    getBoxList () {
      let v = this;
      const obj = {
        url: api.post_transitplanDelivery_getBoxList,
        data: {
          lastId: v.lastId,
          limit: 10,
          appropriationTransitplanDeliveryId: v.appropriationTransitplanDeliveryId,
          boxCode : v.boxCode
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            let datas = response.data.datas
            if (datas.length > 0) {
              v.lastId = response.data.others.lastId
              v.list = v.list.concat(datas);
              v.loadingType = 0
              if (datas.length < 10) {
                v.loadingType = 2
              }
            } else {
              v.loadingType = 2
            }
          } else {
            if (response.data.code === 110001) {
              v.showToast('箱子列表不存在')
            }
            v.loadingType = 2
          }
        })
    },
    getDetails() {
      let v = this
      v.loadingType = 1
      const obj = {
        url: api.post_transitplanDelivery_getDetail,
        data: {
          lastId: v.lastId,
          limit: 10,
          appropriationTransitplanDeliveryId: v.appropriationTransitplanDeliveryId,
          goodsSku: v.goodsSku
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            let datas = response.data.datas.filter(i=>i.pickQuantity > 0)
            if (datas.length > 0) {
              v.lastId = response.data.others.lastId
              v.skuList = v.skuList.concat(datas);
              setStorage('detailItem',v.skuList[0])
              v.loadingType = 0
              if (datas.length < 10) {
                v.loadingType = 2
              }
            } else {
              v.loadingType = 2
            }
          } else {
            v.loadingType = 2
          }
        })
    },
    gotoBinningPage (status,transitBoxId) {
      let v = this;
      if (status === '0') {
        uni.navigateTo({
          url: '/pages/workspace/transferDeliverGoods/binning?transitBoxId=' + transitBoxId + '&appropriationTransitplanDeliveryId=' + v.appropriationTransitplanDeliveryId
        })
      } else if (status === '1') {
        uni.navigateTo({
          url: '/pages/workspace/transferDeliverGoods/binning?transitBoxId=' + transitBoxId + '&appropriationTransitplanDeliveryId=' + v.appropriationTransitplanDeliveryId
        })
      } else if (status === '2') {
        uni.navigateTo({
          url: '/pages/workspace/transferDeliverGoods/unpacking?transitBoxId=' + transitBoxId + '&appropriationTransitplanDeliveryId=' + v.appropriationTransitplanDeliveryId
        })
      }

    }
  },
  onNavigationBarButtonTap (obj) {
    if (obj.index === 0) {
      let type = this.tabActive === '0' ? 'sku' : 'box';
      uni.redirectTo({
        url:'/pages/workspace/transferDeliverGoods/invoiceDetailsSearch' + '?type=' + type + '&appropriationTransitplanDeliveryId=' + this.appropriationTransitplanDeliveryId
      })
    }
  }
};
</script>

<style scoped lang="less">
 .invoice-detail {
   padding-bottom: 50px;
   .header {
     padding: 10px 5px;
     font-size: 16px;
     border-bottom: 1px solid #e5e5e5;
     background-color: #ffffff;
   }
   .tabs {
     background-color: #ffffff;
     .tab-item {
       text-align: center;
       font-size: 14px;
       border-bottom: 1px solid #e5e5e5;
       padding: 10px;
     }
     .active {
       border-bottom: 1px solid #2196f3;
       color: #2196f3;
     }
   }
   .unpacked-goods {
     .item {
       padding: 10px;
       background-color: #ffffff;
       margin-bottom: 10px;
     }
     .item-label {
       padding-right: 10px;
       white-space: nowrap;
     }
   }
   .box-list {
     .item {
       position: relative;
       padding: 10px 6px;
       background-color: #ffffff;
     }
     .red {
       color: red;
     }
     .green {
       color: green;
     }
     .default-color {
       color: #303133;
     }
     .position-view{
       position: absolute;
       right: 3%;
       top: 12%;
       .icon {
         font-size: 20px;
       }
     }
   }
 }
</style>
