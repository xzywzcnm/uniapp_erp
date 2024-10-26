<template>
  <view :class="wrap">
    <view class="d-flex justify-content-between warehouseHeadline">
      <view class="headTitle">
        <text>{{warehouseName}}</text>
      </view>
      <picker @change="warehouseChange" :value="warehouseIndex" range-key="warehouseName" :range="warehouseArr">
        <view class="selectWarehouse">
          <text class="icon iconfont">&#xe615;</text>
          <text>选择仓库</text>
        </view>
      </picker>
    </view>
    <view class="mu-divider"></view>
    <view class="containerWrap">
      <view class="listWrap">
        <view class="listItem" v-for="(item, index) in list" :key="index" @click="gotoDetails(item.appropriationTransitplanDeliveryId,item)">
          <view class="subList">
            <view class="d-flex justify-content-start">
              发货单号：<text>{{item.deliveryCode}}</text>
            </view>
            <view class="d-flex justify-content-start">
              目的仓库：<text>{{item.stockInWarehouseName}}</text>
            </view>
            <view class="d-flex justify-content-start">
              SHIPMENTID：<text>{{item.shipmentId || ''}}</text>
            </view>
            <view class="d-flex justify-content-start">
              创建人：<text>{{item.createdByName}}</text>
            </view>
            <view class="d-flex justify-content-start">
              创建时间：<text>{{item.createdDate}}</text>
            </view>
            <view class="d-flex justify-content-start">
              装箱状态：<text :class="item.deliveryBoxStatus === '0' ? 'red': ''">{{item.deliveryBoxStatusName}}</text>
            </view>
            <view class="positionView">
              <text class="icon iconfont">&#xe636;</text>
            </view>
          </view>
        </view>
        <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
      </view>
    </view>
    <view class="bottomBit row no-gutters"  >
      <button type="default" class="yellow" style="width: 100%" size="mini" @click="syncInventory">
        <text class="icon iconfont">&#xe605;</text>
        <text>下载/同步发货单</text>
      </button>
    </view>
  </view>
</template>

<script>
import Mixin from '@/mixin/common_mixin'
import api from '@/api/api'
const prefixCls = 'tongtool-workspace-inventorQueryVerification'
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
export default {
  mixins: [Mixin],
  data() {
    return {
      isMoreGoodsShelf: null,
      list: [],
      loadingType: 0,
      contentText: {
        contentdown: '上拉显示更多',
        contentrefresh: '正在加载...',
        contentnomore: '没有更多数据了'
      },
      warehouseName: '选择仓库',
      warehouseIndex: 0,
      warehouseId: null,
      warehouseArr: ['选择仓库'],
      lastId: null,
      formData : {
        deliveryCode: '',
        shipmentId: '',
        boxCode: '',
      }
    }
  },
  components: {},
  watch: {
    'pageBackStatus' (newVal,oldVal) {
      if (newVal && newVal !== oldVal) {
        this.search();
      }
    }
  },
  methods: {
    syncInventory() {
      let v = this
      uni.showModal({
        content: '当前临时保存货品数会被覆盖？',
        success: (res) => {
          if (res.confirm) {
            let data = getStorage('otherWarehouseing_allSpecialStockinId');

            if (data && data.length > 0) {
              data.forEach(i=>{
                removeStorage('otherWarehousing_' + i)
              })
            }
            removeStorage('otherWarehouseing_allSpecialStockinId')
            v.search();
          }
        }
      })
    },
    getUserAll () {
      let v = this;
      return new Promise(resolve => {
        if (v.store.state.userInfoList && v.store.state.userInfoList.length > 0) {
          resolve();
        } else {
          v.getAllUserInfo().then(() => {
            resolve();
          })
        }
      })
    },
    search () {
      let v = this;
      v.lastId = null;
      v.list = [];
      for(let key in v.formData) {
        v.formData[key] = ''
      }
      v.getList();
    },
    warehouseChange(e) {
      let v = this
      let obj = v.warehouseArr[e.target.value]
      setStorage('inventorQueryVerification', obj)
      v.warehouseId = obj.warehouseId
      v.warehouseName = obj.warehouseName
      v.isMoreGoodsShelf = obj.isMoreGoodsShelf
      v.search();
    },
    getUserName(id) {
      let v = this;
      if (v.userInfoListPage && v.userInfoListPage[id]) {
        return v.userInfoListPage[id].username;
      } else {
        return ''
      }
    },
    gotoDetails(appropriationTransitplanDeliveryId,item) {
      let v = this;
      setStorage('invoiceListItem',item)
      uni.navigateTo({
        url: '/pages/workspace/transferDeliverGoods/invoiceDetails?appropriationTransitplanDeliveryId=' + appropriationTransitplanDeliveryId
      })
    },
    getList() {
      let v = this
      v.loadingType = 1
      const obj = {
        url: api.post_transitplanDelivery_getList,
        data: {
          lastId: v.lastId,
          limit: 10,
          stockoutWarehouseId : v.warehouseId,
          ...v.formData
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            let datas = response.data.datas.map(n=>{
              n.createName = v.getUserName(n.createdBy);
              return n
            });
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
            v.loadingType = 2
          }
        })
    },
  },
  computed: {
    wrap() {
      return `${prefixCls}`
    },
    userInfoListPage() {
      return this.store.state.userInfoList
    },
    pageBackStatus () {
      return this.store.state.pageBackStatus
    }
  },
  onLoad (option) {
    let v = this
    uni.showLoading({
      title: '数据加载中'
    })
    v.getUserAll().then(()=>{
      v.getWarehouseList()
        .then(result => {
          if (result) {
            v.$nextTick(function() {
              v.warehouseArr = getStorage('warehouseList')
              if (!v.warehouseId) {
                if (v.warehouseArr.length > 0) {
                  let loadStoreWarehouse = getStorage('inventorQueryVerification')
                  if (loadStoreWarehouse) {
                    v.warehouseName = loadStoreWarehouse.warehouseName
                    v.warehouseId = loadStoreWarehouse.warehouseId
                    v.isMoreGoodsShelf = loadStoreWarehouse.isMoreGoodsShelf
                  } else {
                    v.warehouseName = v.warehouseArr[0].warehouseName
                    v.warehouseId = v.warehouseArr[0].warehouseId
                    v.isMoreGoodsShelf = v.warehouseArr[0].isMoreGoodsShelf
                  }
                } else {
                  uni.showToast({
                    icon: 'none',
                    title: '没有仓库数据',
                    duration: 1500
                  })
                }
              }

              if (option) {
                v.formData.deliveryCode = option.deliveryCode;
                v.formData.shipmentId = option.shipmentId;
                v.formData.boxCode = option.boxCode;
              }
              v.getList()
            })
          }
        })
    })

  },
  onReady() {
    uni.hideLoading()
  },
  onNavigationBarButtonTap(obj) {
    let v = this
    if (obj.index === 0) {
      uni.navigateTo({
        url: '/pages/workspace/transferDeliverGoods/search' + '?warehouseId=' + v.warehouseId
      })
    }
  },
  onReachBottom () {
    let v = this;
    if (v.loadingType !== 0) {
      return;
    }
    v.getList();
  },
  onPullDownRefresh() {
    let v = this
    v.list = []
    v.lastId = null
    v.getList()
    setTimeout(function () {
      uni.stopPullDownRefresh()
    }, 2000)
  },
  onShow() {
  }
}
</script>
<style scoped>
.red {color: red}
</style>
