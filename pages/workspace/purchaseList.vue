<template>
  <view :class="purchaseWrap">
    <!-- #ifdef MP-WEIXIN -->
    <view class="wechatFilter d-flex justify-content-end align-items-end">
      <text class="icon iconfont wechatSearch" @click="gotoSearch">&#xe64c;</text>
    </view>
    <!-- #endif -->
    <view class="containerWrap">
      <view class="listWrap">
        <view class="listItem" v-for="(item,index) in list" :key="index" @click="gotoPurchasingDetails(item.purchaseOrderId, item.purchaseOrderCode)">
          <view class="subList">
            <view>采购单号：{{item.purchaseOrderCode}}</view>
            <view>供应商： {{item.supplierName}}</view>
            <view>数量/金额：{{item.quantity + '/' + item.amount}}</view>
            <view>采购日期：{{item.purchaseDate}}</view>
            <view>采购状态：<span
                            :class="item.status === '0' || item.status === '1' ? 'purchasingStatus0' : item.status === '2' || item.status === '3' ? 'purchasingStatus1' : 'purchasingStatus2'"
                           >{{
              item.status === '0' ? '等待到货' :
                item.status === '1' ? '部分到货等待剩余' :
                  item.status === '2' ? '部分到货不等待剩余' :
                    item.status === '3' ? '全部到货' :
                      item.status === '4' ? '已作废' : ''
             }}</span>
            </view>
            <text class="icon iconfont">
            &#xe655;
            </text>
          </view>
          <view class="mu-divider"></view>
        </view>
        <view class="totalWrap">
          <sevenRow :gutter="false">
            <sevenCol :span="3">
              <view class="d-flex justify-content-center normal-margin-top orange-color">{{providerCount}}</view>
              <view class="d-flex justify-content-center twTitle">供应商</view>
            </sevenCol>
            <sevenCol :span="3">
              <view class="d-flex justify-content-center normal-margin-top orange-color">{{goodsCount}}</view>
              <view class="d-flex justify-content-center twTitle">货品</view>
            </sevenCol>
            <sevenCol :span="6">
              <view class="d-flex justify-content-center normal-margin-top orange-color">￥ {{totalCount}}</view>
              <view class="d-flex justify-content-center twTitle">金额</view>
            </sevenCol>
          </sevenRow>
        </view>
      </view>
      <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
    </view>
  </view>
</template>
<script>
  import api from '@/api/api'
  import Mixin from '@/mixin/common_mixin'
  const prefixCls = 'tongtool-workspace-purchaseList'
  export default {
    mixins: [Mixin],
    data () {
      return {
        providerCount: null,
        goodsCount: null,
        totalCount: null,
        list: [],
        loadingType: 0,
        contentText: {
        	contentdown: '上拉显示更多',
        	contentrefresh: '正在加载...',
        	contentnomore: '没有更多数据了'
        },
        apiData: {
          clearingform: null,
          lastId: null,
          limit: 10,
          orderStatus: null,
          purchaseDateFrom: null,
          purchaseDateTo: null,
          searchKey: null
        }
      }
    },
    components: {
    },
    computed: {
      purchaseWrap () {
        return [
          `${prefixCls}`
        ]
      }
    },
    methods: {
      getPurchaseList () {
        let v = this
        v.loadingType = 1
        let obj = {
          url: api.get_purchaseList,
          data: v.apiData
        }
        console.log('VAPIDATA:' + JSON.stringify(v.apiData))
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas
              data.forEach((n, i) => {
                n.purchaseDate = new Date(n.purchaseDate).toLocaleString()
              })
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
      gotoSearch () {
        uni.redirectTo({
        	url: '/pages/workspace/checkPurchaseOrder'
        })
      },
      gotoPurchasingDetails (id, code) {
        uni.navigateTo({
        	url: '/pages/workspace/purchaseDetails?purchaseOrderId='+id+'&purchaseOrderCode='+code+''
        })
      }
    },
    onNavigationBarButtonTap (obj) {
      if (obj.index === 0) {
        uni.redirectTo({
        	url: '/pages/workspace/checkPurchaseOrder'
        })
      }
    },
		onLoad (option) {
      let v = this
      console.log(JSON.stringify(option))
      if (option.type && option.type === '1') {
        v.apiData.orderStatus = option.orderStatus
        v.apiData.purchaseDateFrom = option.purchaseDateFrom
        v.apiData.purchaseDateTo = option.purchaseDateTo
        v.apiData.searchKey = option.searchKey
        v.apiData.clearingform = option.clearingform
      }
      uni.showLoading()
      v.getPurchaseList()
		},
    onReady () {
      let v = this
      uni.hideLoading()
    },
		onReachBottom () {
      let v = this
			if (v.loadingType !== 0) {
				return
			}
      v.getPurchaseList()
		}
  }
</script>
