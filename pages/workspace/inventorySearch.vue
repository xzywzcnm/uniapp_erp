<template>
  <view :class="wrap">
    <view class="row no-gutters headSearch">
      <view class="col col-9">
        <view class="normalPadding">
        	<input type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" v-model.trim="stockTakingCode" @confirm="getList" class="uni-input" placeholder="请输入盘点单号">
        </view>
      </view>
      <view class="col col-3">
        <view class="d-flex justify-content-start align-items-center normalpadding">
          <button type="primary" @click="getList">搜索</button>
        </view>
      </view>
    </view>
    <view class="mu-divider"></view>
    <view class="containerWrap">
      <view class="listWrap">
        <view class="listItem" v-for="(item, index) in list" :key="index" @click="gotoDetails(item.stockTakingId, item.stockTakingStatus, item.stockTakingCode, item.stockTakingStatus)">
          <view class="subList">
            <view class="d-flex justify-content-start">
              盘点单号：<text>{{item.stockTakingCode}}</text>
            </view>
            <view class="d-flex justify-content-start">
              货品种类：<text>{{item.goodsNum}}</text>
            </view>
            <view class="d-flex justify-content-start">
              创建人：<text>{{item.createName}}</text>
            </view>
            <view class="d-flex justify-content-start">
              创建日期：<text>{{item.stockTakingCreatedTime}}</text>
            </view>
            <view class="d-flex justify-content-start">
              开始日期：<text>{{item.stockTakingStartTime}}</text>
            </view>
            <view class="d-flex justify-content-start">
              盘点状态：<text v-if="!item.stockTakingStatus || item.stockTakingStatus === '0'">未开始</text>
              <text v-if="item.stockTakingStatus === '1'" class="orange-color">正在盘点...</text>
              <text v-if="item.stockTakingStatus === '2'" class="green-color">完成</text>
              <text v-if="item.stockTakingStatus === '3'" class="green-color">随机盘点</text>
            </view>
            <view class="positionView">
              <text class="icon iconfont">&#xe636;</text>
            </view>
          </view>
        </view>
      </view>
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
        stockTakingCode: null,
        list: [],
        warehouseId: null,
        lastId: null,
        orderField: 'stockTakingCreatedTime',
        sortType: 'ESC'
      }
    },
    methods: {
      getUserName(id) {
        let v = this;
        if (v.userInfoList && v.userInfoList[id]) {
          return v.userInfoList[id].username;
        } else {
          return ''
        }
      },
      gotoDetails(stockTakingId, stockTakingStatus, stockTakingCode, status) {
        let v = this
        if (status === '3') {
          uni.navigateTo({
            url: '/pages/workspace/randomList' + '?warehouseId=' + v.warehouseId
          })
        } else {
          uni.navigateTo({
            url: '/pages/workspace/inventoryVerificationDetails' + '?stockTakingId=' + stockTakingId +
              '&stockTakingStatus=' + stockTakingStatus + '&stockTakingCode=' + stockTakingCode + '&randomUuid=' +
              stockTakingCode + '&warehouseId=' + v.warehouseId
          })
        }
      },
      getList() {
        let v = this
        if (!v.stockTakingCode || v.stockTakingCode === '') {
          uni.showToast({
          	icon: 'none',
            title: '请输入盘点单号',
            duration: 1500
          })
          return false
        }
        uni.showLoading({
        	title: '搜索中...'
        })
        const obj = {
          url: api.get_stockTakingListByWarehouseId,
          data: {
            lastId: v.lastId,
            limit: 1000,
            orderDirection: v.sortType,
            orderField: v.orderField,
            stockTakingCode: v.stockTakingCode,
            warehouseId: v.warehouseId
          }
        }
        v.list = []
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas
              data.forEach((n, i) => {
                console.log(n.createdBy)
                n.createName = v.getUserName(n.createdBy)
              })
              v.list = data
              uni.hideLoading()
            }
          })
      },
    },
    computed: {
      wrap() {
        return `${prefixCls}`
      },
      userInfoList() {
        return this.store.state.userInfoList
      }
    },
    onLoad(options) {
      let v = this
      uni.showLoading({
        title: '数据加载中'
      })
      v.warehouseId = options.warehouseId
    },
    onReady() {
      uni.hideLoading()
    },
    onPullDownRefresh() {
      let v = this
      v.list = []
      v.lastId = null
      v.getList()
    }
  }
</script>
