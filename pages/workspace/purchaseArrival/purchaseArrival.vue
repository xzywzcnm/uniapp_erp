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

    <view class="scanWrapBox">
      <view class="uni-form-item uni-column">
        <view class="uni-input-wrapper" >
          <input class="uni-input" v-model.trim="searchValue" :focus="inputFocus"  @confirm="search()" placeholder="请输入采购单号、跟踪号、供货商名称" />
          <view class="iconfont text-16" @click="scanCode">&#xe612;</view>
        </view>
      </view>
    </view>

    <view class="containerWrap">
      <view class="listWrap">
        <view class="listItem" v-for="(item, index) in list" :key="index" @click="gotoDetails(item.purchaseOrderCode, item.purchaseOrderId)">
          <view class="subList">
            <view class="d-flex justify-content-start">
              采购单号：<text>{{item.purchaseOrderCode}}</text>
            </view>
            <view class="d-flex justify-content-start">
              供货商：<text>{{item.corporationFullname}}</text>
            </view>
            <view class="d-flex justify-content-start">
              数量：<text>{{item.quantity }}</text>
            </view>
            <view class="d-flex justify-content-start">
              采购日期：<text>{{item.purchaseDate}}</text>
            </view>
            <view class="d-flex justify-content-start">
              采购状态：<text class="color-red">{{item.status}}</text>
            </view>
            <view class="positionView">
              <text class="icon iconfont">&#xe636;</text>
            </view>
          </view>
        </view>
        <!--<view class="alert-info">仅支持部分到货等待剩余、等待到货两种状态的采购单</view>-->

      </view>
      <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
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
      purchaseStatus: ['等待到货','部分到货等待剩余'],
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
      searchValue: '',
      inputFocus: true,
      apiData: {
        "clearingForm": null, // 可传：1货到付款，2款到发货，4快递代收，5定期结算 ,
        "lastId": null, // 上一页最后记录 ,
        "limit": 10,
        "purchaseDateFrom": null, // 采购日期开始,格式：yyyy-MM-dd
        "purchaseDateTo": null, // 采购日期结束,格式：yyyy-MM-dd
        "purchaseOrderCode": "", // 单号 可传：采购单号，跟踪号，供应商名称
        "status": null, //  状态 可传：0等待到货，1部分到货等待剩余 ,
        "warehouseId": "" // 仓库id
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
    resetParams () {
      let v = this;
      v.list = [];
      for (let key in v.apiData) {
        v.apiData[key] = null;
      }
      v.apiData.limit = 10;
      // v.apiData.status = "0,1";
      v.apiData.warehouseId = v.warehouseId;
    },
    search () {
      let v = this;
      v.resetParams();
      v.apiData.purchaseOrderCode = v.searchValue;
      v.getPurchaseList();
    },
    scanCode () {
      let v = this;
      uni.scanCode({
        success: function (res) {
          v.searchValue = res.result
          v.$nextTick(function () {
            v.search()
          })
        },
        fail: function (error) {
          console.log('error:', error)
        }
      })
    },
    getPurchaseList () {
      let v = this
      v.loadingType = 1
      let obj = {
        url: api.set_purchaseOrderList,
        data: v.apiData
      }
      uni.showLoading({
        title: '数据加载中'
      })
      v.ajaxData(obj)
      .then(response => {
        uni.hideLoading();
        if (response.data.code === 0) {
          let data = response.data.datas
          /*data.forEach((n, i) => {
            n.purchaseDate = new Date(n.purchaseDate).toLocaleString()
          })*/
          v.providerCount = response.data.others.totalSupplier
          v.goodsCount = response.data.others.totalGoods
          v.totalCount = response.data.others.totalAmount
          if (data.length > 0) {
            v.list = v.list.concat(data)
            v.apiData.lastId = data[data.length - 1].purchaseOrderId
            v.loadingType = 0
            if (data.length < 10) {
              v.loadingType = 2
            }
          } else {
            v.loadingType = 2
          }
        }
      })
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
    gotoDetails(purchaseOrderCode, purchaseOrderId) {
      let v = this
      // 传采购单号 采购单号id
      uni.navigateTo({
        url: '/pages/workspace/purchaseArrival/purchaseDetail?purchaseOrderCode='+purchaseOrderCode + '&purchaseOrderId='+ purchaseOrderId
      })
    },
    onReachBottom () {
      let v = this
      if (v.loadingType !== 0) {
        return
      }
      v.getPurchaseList()
    }

  },
  computed: {
    wrap() {
      return `${prefixCls}`
    },
    pageBackStatus () {
      return this.store.state.pageBackStatus
    }
  },
  onLoad(option) {
    let v = this
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
              console.log(option);
              if (option.type && option.type === '1') {

                v.apiData.purchaseOrderCode = option.searchKey;
                if (option.orderStatus === '') {
                  v.apiData.status = null
                } else {
                  v.apiData.status = option.orderStatus + ''
                }
                v.apiData.purchaseDateFrom = option.purchaseDateFrom
                v.apiData.purchaseDateTo = option.purchaseDateTo
                v.apiData.clearingForm = option.clearingForm
                v.$nextTick(()=>{
                  v.searchValue = option.searchKey;
                })
              }
              v.apiData.warehouseId = v.warehouseId
              console.log(v.apiData);
              v.getPurchaseList()
            } else {
              uni.showToast({
                icon: 'none',
                title: '没有仓库数据',
                duration: 1500
              })
            }

          }


        })
      }
    })
  },
  onPullDownRefresh() {
    let v = this
    v.list = [];
    v.lastId = null;
    v.getPurchaseList()
    setTimeout(function () {
      uni.stopPullDownRefresh()
    }, 2000)
  },
  onNavigationBarButtonTap(obj) {
    let v = this
    uni.redirectTo({
      url: '/pages/workspace/purchaseArrival/searchPurchase'
    })
  },
  onShow(option) {
    console.log(option)
  }
}
</script>
<style scoped>
.scanWrapBox .uni-icon {
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
  background-color: #FFFFFF;
}
.uni-input {
  height: 28px;
  line-height: 28px;
  font-size: 15px;
  padding: 0px;
  flex: 1;
  background-color: #FFFFFF;
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
