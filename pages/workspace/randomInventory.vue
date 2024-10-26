<template>
  <view :class="wrap">
    <view class="d-flex justify-content-start normalPadding headLine">
      盘点单：<text>{{stockTakingCode}}</text>
    </view>
    <view class="mu-divider"></view>
    <view class="scanWrap">
      <view class="d-flex justify-content-start align-items-center" v-if="isMoreGoodsShelf === '1'">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="cargospaceNum" type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input scanInput" @confirm="scanOriginCagospace" :focus="cargospaceFocus" placeholder="请输入或扫描货位" />
      </view>
      <view class="d-flex justify-content-start align-items-center normal-margin-top">
        <view class="scan" @click="scanSku">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="skuNum" type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input scanInput" @confirm="confirmSku" :focus="skuFocus" placeholder="SKU条码" />
        <view class="model">
          <checkbox value="cb" :checked="cbChecked" @click="getCBValue" /><text class="text-16">{{cbText}}</text>
        </view>
      </view>
    </view>
    <view class="containerWrap">
      <view class="listWrap">
        <view class="listItem normalPadding" v-for="item in list" :key="item.goodsDetailId">
        <!-- <view class="listItem normalPadding" v-for="item in list" :key="item.goodsDetailId" @click="gotoIVFDetails(item.goodsSku, item.stockTakingStatus, item.productName, item.availableStockQuantity, item.defectsStockQuantity, item.stockTakingDetailId, item.availableStockTakingQuantity, item.defectsStockTakingQuantity)"> -->
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>sku：</text>
            </view>
            <view class="col col-7">
              <text>{{item.goodsSku}}</text>
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>货位：</text>
            </view>
            <view class="col col-7">
              <text>{{item.cargospace}}</text>
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>货品：</text>
            </view>
            <view class="col col-7">
              <text>{{item.productName}}</text>
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>可用库存：</text>
            </view>
            <view class="col col-8">
              <text>{{item.availableStockQuantity}}</text>
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>可用库存盘点数：</text>
            </view>
            <view class="col col-8">
              <input type="number" v-model.trim="availableStockQuantity" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input changeNum small-uni-input">
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>故障品库存：</text>
            </view>
            <view class="col col-8">
              <text>{{item.defectsStockQuantity}}</text>
            </view>
          </view>
          <view class="row no-gutters d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>故障品盘点数：</text>
            </view>
            <view class="col col-8">
              <input type="number" v-model.trim="defectsStockQuantity" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input changeNum small-uni-input">
            </view>
          </view>

        </view>
        <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
      </view>
    </view>
    <view class="bottomBit d-flex">
      <button type="default" class="yellow" size="mini" @click="submitAllList">
        <text class="icon iconfont">&#xe67f;</text>全部提交
      </button>
    </view>
  </view>
</template>

<script>
  import Mixin from '@/mixin/common_mixin'
  import api from '@/api/api'
  const prefixCls = 'tongtool-workspace-inventoryVerificationDetails'
  import {
    setStorage,
    getStorage,
    removeStorage
  } from '@/utils'
  export default {
    mixins: [Mixin],
    data() {
      return {
        cbChecked: false,
        isMoreGoodsShelf: null,
        cbText: '逐个扫描',
        skuFocus: false,
        skuNum: '',
        cargospaceFocus: false,
        cargospaceNum: '',
        stockTakingCode: null,
        warehouseId: null,
        stockTakingStatus: null,
        apiData: {
          lastId: null,
          limit: 10,
          stockTakingId: null
        },
        randomUuid: null,
        lastId: null,
        list: [],
        loadingType: 0,
        contentText: {
          contentdown: '上拉显示更多',
          contentrefresh: '正在加载...',
          contentnomore: '没有更多数据了'
        }
      }
    },
    components: {},
    methods: {
      getCBValue (value) {
        let v = this
        v.cbChecked = !v.cbChecked
        console.log(v.cbChecked)
      },
      scanSku () {
        let v = this
        uni.scanCode({
          success: function (res) {
            v.skuNum = res.result
            v.$nextTick(function () {
              v.confirmSku()
            })
          },
          fail: function (error) {
            console.log('error:', error)
          }
        })
      },
      confirmSku () {
        let v = this
        if (v.isMoreGoodsShelf === '1' && v.cargospaceNum === '') {
          uni.showToast({
            icon: 'none',
            title: '请输入货位号',
            duration: 2000
          })
          v.cargospaceFocus = false
          v.skuFocus = false
          v.$nextTick(function () {
            v.cargospaceFocus = true
          })
          return false
        }
        if (v.skuNum === '') {
          uni.showToast({
            icon: 'none',
            title: '请输入SKU',
            duration: 2000
          })
          v.cargospaceFocus = false
          v.skuFocus = false
          v.$nextTick(function () {
            v.skuFocus = true
          })
          return false
        }

      },
      scanCode () {
        let v = this
        uni.scanCode({
          success: function (res) {
            v.skuNum = res.result
            v.$nextTick(function () {
              v.confirmSku()
            })
          },
          fail: function (error) {
            console.log('error:', error)
          }
        })
      },
      scanOriginCagospace () {

      },
      getDetails() {
        let v = this
        v.loadingType = 1
        const obj = {
          url: api.get_stockGoodsListBySid,
          data: v.apiData
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas
              if (data.length > 0) {
                v.list = v.list.concat(data)
                v.lastId = response.data.others.lastId
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
      submitAllList() {
        let v = this
        uni.showModal({
          content: '确定全部提交?',
          success: (res) => {
            if (res.confirm) {
              v.submitData()
            }
          }
        })
      },
      submitData() {
        let v = this
        let storage = getStorage('inventoryDetails_' + v.apiData.stockTakingId)
        if (storage && storage.length > 0) {
          const obj = {
            url: api.set_stockSave,
            data: {
              stockTakingId: v.apiData.stockTakingId,
              datas: JSON.stringify(storage)
            }
          }
          uni.showLoading({
            title: '数据提交中',
            mask: true
          })
          v.ajaxData(obj)
            .then(response => {
              uni.hideLoading()
              if (response.data.code === 0) {
                uni.showToast({
                  icon: 'none',
                  title: '提交成功',
                  mask: false,
                  duration: 1500
                })
                v.list = []
                removeStorage('inventoryDetails_' + v.apiData.stockTakingId)
                setTimeout(function (){
                  uni.navigateBack()
                }, 1000)
              } else {
                uni.showToast({
                  title: response.data.message,
                  icon: 'none',
                  duration: 1500
                })
              }
            })
        } else {
          let newArr = []
          v.list.forEach((n, i) => {
            newArr.push({
              stockTakingDetailId: n.stockTakingDetailId,
              availableStockTakingQuantity: n.availableStockTakingQuantity,
              defectsStockTakingQuantity: n.defectsStockTakingQuantity
            })
          })
          const obj = {
            url: api.set_stockSave,
            data: {
              stockTakingId: v.apiData.stockTakingId,
              datas: JSON.stringify(newArr)
            }
          }
          uni.showLoading()
          v.ajaxData(obj)
            .then(response => {
              uni.hideLoading()
              if (response.data.code === 0) {
                uni.showToast({
                  icon: 'none',
                  title: '提交成功',
                  mask: false,
                  duration: 1500
                })
                v.list = []
                setTimeout(function (){
                  uni.navigateBack()
                }, 1000)
              } else {
                uni.showToast({
                  title: response.data.message,
                  icon: 'none',
                  duration: 1500
                })
              }
            })
        }
      },
      gotoIVFDetails(goodsSku, stockTakingStatus, productName, availableStockQuantity, defectsStockQuantity,
        stockTakingDetailId, availableStockTakingQuantity, defectsStockTakingQuantity) { // 去往SKU盘点
        let v = this
        uni.navigateTo({
          url: '/pages/workspace/inventoryDetails' + '?goodsSku=' + goodsSku + '&stockTalkingId=' + v.apiData.stockTakingId +
            '&stockTakingStatus=' + stockTakingStatus + '&productName=' + productName + '&availableStockQuantity=' +
            availableStockQuantity + '&defectsStockQuantity=' + defectsStockQuantity + '&warehouseId=' + v.warehouseId +
            '&stockTakingCode=' + v.stockTakingCode + '&stockTakingDetailId=' + stockTakingDetailId +
            '&availableStockTakingQuantity=' + availableStockTakingQuantity + '&defectsStockTakingQuantity=' +
            defectsStockTakingQuantity
        })
      }
    },
    computed: {
      wrap() {
        return `${prefixCls}`
      }
    },
    onShow() {
      let v = this
      let storage = getStorage('inventoryDetails_' + v.apiData.stockTakingId)
      if (v.list.length > 0 && storage && storage.length > 0) {
        v.list.forEach((n, i) => {
          storage.forEach((m, t) => {
            if (n.stockTakingDetailId === m.stockTakingDetailId) {
              n.availableStockTakingQuantity = m.availableStockTakingQuantity
              n.defectsStockTakingQuantity = m.defectsStockTakingQuantity
            }
          })
        })
      }
    },
    onLoad(options) {
      let v = this
      let loadStoreWarehouse = getStorage('inventorQueryVerification')
      if (loadStoreWarehouse) {
        v.isMoreGoodsShelf = loadStoreWarehouse.isMoreGoodsShelf
      }
      // options = {stockTakingId: "0001000557201805280029820712", stockTakingStatus: "1", stockTakingCode: "IS00000048", randomUuid: "IS00000048", warehouseId: "0001000557201606160000105310"},
      v.apiData.stockTakingId = options.stockTakingId
      v.stockTakingStatus = options.stockTakingStatus
      v.stockTakingCode = options.stockTakingCode
      v.randomUuid = options.randomUuid
      v.warehouseId = options.warehouseId
      v.getDetails()
    },
    onReady() {

    }
  }
</script>
