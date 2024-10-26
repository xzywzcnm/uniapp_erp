<template>
  <view :class="wrap">
    <!-- #ifdef APP-PLUS -->
    <web-view :src="loadPage1" @message="getMessage"></web-view>
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN || MP-BAIDU -->
    <view>
      <camera device-position="back" flash="off" @error="error" mode="scanCode" @scancode="getCode" style="width: 100%; height: 300px;"></camera>
    </view>
    <uni-segmented-control :current="current" :values="tabArr" @clickItem="onClickItem" bgColor="#FFFFFF" activeColor="#1976d2"
      style-type="text"></uni-segmented-control>
    <view class="mu-divider"></view>
    <view class="normalPadding skuDetails" v-if="current === 0">
      <view class="d-flex justify-content-start">SKU: {{goodsSku}}</view>
      <view class="d-flex justify-content-start">{{productName}}</view>
      <view class="normal-margin-top">
        <uni-number-box :min="0" :value="newEnableCheck" :step="1" @change="getEnableCheck" size="large"></uni-number-box>
      </view>
    </view>
    <view class="normalPadding skuDetails" v-if="current === 1">
      <view class="d-flex justify-content-start">SKU: {{goodsSku}}</view>
      <view class="d-flex justify-content-start">{{productName}}</view>
      <view class="normal-margin-top">
        <uni-number-box :min="0" :value="newDisableCheck" :step="1" @change="getDisableCheck" size="large"></uni-number-box>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>
<script>
  import Mixin from '@/mixin/common_mixin'
  import api from '@/api/api'
  const prefixCls = 'tongtool-workspace-inventoryDetails'
  var throttle = require('throttleit')
  import {
    setStorage,
    getStorage,
    removeStorage
  } from '@/utils'
  export default {
    mixins: [Mixin],
    data() {
      return {
        loadPage1: null,
        newEnableCheck: 0, // 扫描盘点数
        newDisableCheck: 0,
        current: 0,
        enableCheck: 0, // 可用库存
        disableCheck: 0,
        goodsSku: null,
        warehouseId: null,
        stockTakingCode: null,
        productName: null,
        cacheEnableNum: 0, // 缓存盘点数
        cacheDisableNum: 0,
        stockTakingDetailId: null,
        storageArr: [], // 提交修改sku集合
        hasEnableCheck: 0, // 已用库存
        hasDisableCheck: 0,
        stockTalkingId: null,
      }
    },
    //     watch: {
    //       newEnableCheck (n) {
    //         let v = this
    //         if (n > v.enableCheck) {
    //           uni.showToast({
    //             icon: 'none',
    //           	title: '数量不能超过可用库存',
    //             duration: 2000
    //           })
    //           v.$nextTick(function () {
    //             v.newEnableCheck = v.enableCheck
    //           })
    //         }
    //       },
    //       newDisableCheck (n) {
    //         let v = this
    //         if (n > v.disableCheck) {
    //           uni.showToast({
    //             icon: 'none',
    //           	title: '数量不能超过故障品可用库存',
    //             duration: 2000
    //           })
    //           v.$nextTick(function () {
    //             v.newDisableCheck = v.disableCheck
    //           })
    //         }
    //       }
    //     },
    computed: {
      wrap() {
        return `${prefixCls}`
      },
      tabArr() {
        let v = this
        return [`可用库存(${v.enableCheck})`, `故障品库存(${v.disableCheck})`]
      }
    },
    components: {},
    methods: {
      getCode: throttle(function(ev) { // 小程序扫码
        let v = this
        console.log('value', ev)
        let value = ev.detail.result
        value = value.replace(/\n/g, '')
        if (value !== v.goodsSku) {
          uni.showToast({
            icon: 'none',
            title: '条形码不匹配',
            duration: 2000
          })
          return false
        } else {
          if (v.current === 0) {
            v.newEnableCheck++
          } else {
            v.newDisableCheck++
          }
          v.setInventoryStorage()
        }
      }, 3000),
      getEnableCheck(value) {
        let v = this
        if (!value) {
          v.newEnableCheck = v.cacheEnableNum
          return
        } else {
          v.cacheEnableNum = value
          v.newEnableCheck = value
        }
        v.setInventoryStorage()
      },
      getDisableCheck(value) {
        let v = this
        if (!value) {
          v.newDisableCheck = v.cacheDisableNum
        } else {
          v.cacheDisableNum = value
          v.newDisableCheck = value
        }
        v.setInventoryStorage()
      },
      onClickItem(index) {
        if (this.current !== index) {
          this.current = index
        }
      },
      setInventoryStorage() {
        let v = this
        let arr = v.storageArr
        console.log(v.goodsSku)
        if (arr.length > 0) {
          let status = false
          let newArr = []
          arr.forEach((n, i) => {
            if (n.stockTakingDetailId === v.stockTakingDetailId) {
              n.availableStockTakingQuantity = v.newEnableCheck
              n.defectsStockTakingQuantity = v.newDisableCheck
              status = true
            }
          })
          console.log('status:', status)
          if (!status) {
            newArr = [{
              stockTakingDetailId: v.stockTakingDetailId,
              availableStockTakingQuantity: v.newEnableCheck,
              defectsStockTakingQuantity: v.newDisableCheck
            }]
            arr = arr.concat(newArr)
          }
        } else {
          arr = [{
            stockTakingDetailId: v.stockTakingDetailId,
            availableStockTakingQuantity: v.newEnableCheck,
            defectsStockTakingQuantity: v.newDisableCheck
          }]
        }
        console.log('arr:', arr)
        setStorage('inventoryDetails_' + v.stockTalkingId, arr)
      },
      getMessage(obj) {
        let v = this
        if (obj.detail.data.length > 0) {
          let data = obj.detail.data[obj.detail.data.length - 1]
          let datas = data.datas
          console.log(datas)
          let stockTalkingId = data.stockTalkingId
          setStorage('inventoryDetails_' + stockTalkingId, datas)
        }
        console.log('obj:----1')
        console.log(JSON.stringify(obj))
      }
    },
    onLoad(options) {
      let v = this
      console.log(JSON.stringify(options))
      //       options = {
      //           "goodsSku":"QL00009",
      //           "stockTalkingId":"0001000557201805280029820712",
      //           "stockTakStatusId":"undefined",
      //           "productName":"擒龙组装商品3",
      //           "availableStockQuantity":"8",
      //           "defectsStockQuantity":"0",
      //           "warehouseId":"0001000557201606160000105310",
      //           "stockTakingCode":"IS00000048",
      //           "stockTakingDetailId":"0001000557201805280029820713",
      //           "availableStockTakingQuantity":"8",
      //           "defectsStockTakingQuantity":"0"
      //       }
      v.enableCheck = options.availableStockQuantity // 可用库存
      v.disableCheck = options.defectsStockQuantity // 可用故障库存
      v.newEnableCheck = options.availableStockTakingQuantity // 已用库存盘点数
      v.newDisableCheck = options.defectsStockTakingQuantity // 已用故障库存盘点数
      v.goodsSku = options.goodsSku
      v.warehouseId = options.warehouseId
      v.stockTakingCode = options.stockTakingCode
      v.productName = options.productName
      v.stockTakingDetailId = options.stockTakingDetailId
      v.stockTalkingId = options.stockTalkingId
      // #ifdef APP-PLUS
      uni.showLoading({
        title: '加载中'
      })
      v.loadPage1 = '/hybrid/html/index.html#/inventoryDetails' + '?token=' + getStorage('token') +
        '&enableCheck=' +
        options.availableStockQuantity + '&disableCheck=' + options.defectsStockQuantity + '&hasEnableCheck=' + options
        .availableStockTakingQuantity + '&hasDisableCheck=' + options.defectsStockTakingQuantity + '&goodsSku=' +
        encodeURI(options.goodsSku) + '&warehouseId=' + options.warehouseId + '&stockTakingCode=' + options.stockTakingCode +
        '&productName=' + encodeURI(options.productName) + '&stockTakingDetailId=' + options.stockTakingDetailId +
        '&stockTalkingId=' + options.stockTalkingId
      // #endif
      // #ifndef APP-PLUS
      let stockTalkingIdArr = getStorage('inventoryDetails_' + options.stockTalkingId)
      if (stockTalkingIdArr) {
        v.storageArr = stockTalkingIdArr
        console.log('-------');
        stockTalkingIdArr.forEach((n, i) => { // 如果有缓存，更新缓存数据
          if (n.stockTakingDetailId === v.stockTakingDetailId) {
            v.newEnableCheck = n.availableStockTakingQuantity
            v.newDisableCheck = n.defectsStockTakingQuantity
          }
        })
      }
      uni.setNavigationBarTitle({
        title: 'SKU盘点'
      })
      // #endif
    },
    onReady() {
      // #ifdef APP-PLUS
      setTimeout(function() {
        uni.hideLoading()
      }, 3000)
      // #endif
    }
  }
</script>
