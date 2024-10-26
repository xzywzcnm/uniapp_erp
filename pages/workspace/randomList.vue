<template>
	<view :class="wrap">
    <view class="d-flex justify-content-start normalPadding headLine">
      盘点单：<text>{{randomId}}</text>
    </view>
    <view class="mu-divider"></view>
    <view class="containerWrap">
      <view class="listWrap">
        <view class="listItem normalPadding" v-for="item in list" :key="item.goodsDetailId" @click="goRandomResult(item.goodsSku, item.productName, item.goodsDetailId, item.goodsImageGroupId, item.warehouseId, item.availableStockQuantity, item.defectsStockQuantity, item.availableStockTakingQuantity, item.defectsStockTakingQuantity)">
          <view class="row no-gutters">
            <view class="col col-4">
              <text>sku：</text>
            </view>
            <view class="col col-7">
              <text>{{item.goodsSku}}</text>
            </view>
          </view>
          <view class="row no-gutters">
            <view class="col col-4">
              <text>货品：</text>
            </view>
            <view class="col col-7">
              <text>{{item.productName}}</text>
            </view>
          </view>
          <view class="row no-gutters">
            <view class="col col-4">
              <text>可用库存盘点数：</text>
            </view>
            <view class="col col-8">
              <text>{{item.availableStockTakingQuantity}}</text>
            </view>
          </view>
          <view class="row no-gutters">
            <view class="col col-4">
              <text>故障品库存盘点数：</text>
            </view>
            <view class="col col-8">
              <text>{{item.defectsStockTakingQuantity}}</text>
            </view>
          </view>
          <view class="arrow">
            <text class="icon iconfont">&#xe636;</text>
          </view>
        </view>
      </view>
    </view>
    <view class="bottomBit row no-gutters">
      <view class="col col-6 d-flex justify-content-center align-tiems: center">
        <button type="default" class="green" size="mini" @click="gotoNext">
          <text>继续盘点</text>
        </button>
      </view>
      <view class="col col-6 d-flex justify-content-center align-tiems: center">
        <button type="primary" class="yellow" size="mini" @click="submitList">
          <text>上传盘点结果</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
  import api from '@/api/api'
  import Mixin from '@/mixin/common_mixin'
  const prefixCls = 'tongtool-workspace-randomList'
  import {
    setStorage,
    getStorage,
    removeStorage
  } from '@/utils'
  export default {
    mixins: [ Mixin ],
    data () {
      return {
        randomId: getStorage('randomId'),
        warehouseId: null
      }
    },
    computed: {
      wrap () {
        return `${prefixCls}`
      },
      list () {
        return getStorage('purchaseRandomResult_' + this.randomId)
      }
    },
    methods: {
      gotoNext () {
        let v = this
        uni.scanCode({
          success: (res) => {
            uni.showLoading({
              title: '查询中'
            })
            v.getSkuForStockTalking(res.result)
            console.log('条码类型：' + res.scanType);
            console.log('条码内容：' + res.result);
          }
        })

      },
      getSkuForStockTalking(skuNum) {
        let v = this
        console.log('---------------------')
        console.log(skuNum)
        const obj = {
          url: api.get_skuForStockTalking,
          type: 'GET',
          data: {
            warehouseId: v.warehouseId,
            goodsSku: skuNum
          }
        }
        v.ajaxData(obj)
          .then(response => {
            uni.hideLoading()
            if (response.data.code === 0) {
              let data = response.data.datas
              console.log('data:')
              console.log(data)
              uni.navigateTo({
                url: '/pages/workspace/purchaseRandomResult' + '?goodsSku=' + data.goodsSku + '&productName=' +
                  data.productName + '&goodsDetailId=' + data.goodsDetailId + '&warehouseId=' + v.warehouseId +
                  '&goodsImageGroupId=' + data.goodsImageGroupId + '&availableStockQuantity=' + data.availableStockQuantity +
                  '&defectsStockQuantity=' + data.defectsStockQuantity
              })
              console.log(JSON.stringify(response.data.datas))
            } else {
              uni.showToast({
                icon: 'none',
                title: response.data.message,
                duration: 1500
              })
            }
          })
      },
      submitList () {
        let v = this
        let arr = []
        if (v.list && v.list.length > 0) {
          v.list.forEach((n, i) => {
            arr.push({
              goodsSku: n.goodsSku,
              availableStockTakingQuantity: n.availableStockTakingQuantity,
              defectsStockTakingQuantity: n.defectsStockTakingQuantity
            })
          })
          const obj = {
            url: api.set_submitRandomForM,
            data: {
              datas: JSON.stringify(arr),
              warehouseId: v.warehouseId
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
                	title: '上传成功',
                  duration: 1500
                })
                removeStorage('purchaseRandomResult_' + this.randomId)
                removeStorage('randomId')
                uni.redirectTo({
                	url: '/pages/workspace/inventoryVerification'
                })
              }
            })
        } else {
          uni.showToast({
          	icon: 'none',
            title: '没有盘点数据'
          })
        }


      },
      goRandomResult (goodsSku, productName, goodsDetailId, warehouseId, goodsImageGroupId, availableStockQuantity, defectsStockQuantity, availableStockTakingQuantity, defectsStockTakingQuantity) { // 进入随机盘点单详情
        uni.navigateTo({
          url: '/pages/workspace/purchaseRandomResult' + '?goodsSku=' + goodsSku + '&productName=' + productName + '&goodsDetailId=' + goodsDetailId + '&warehouseId=' + warehouseId + '&goodsImageGroupId=' + goodsImageGroupId + '&availableStockQuantity=' + availableStockQuantity + '&defectsStockQuantity=' + defectsStockQuantity
        })
      }
    },
    onLoad (options) {
      this.warehouseId = options.warehouseId
    },
    onReady () {

    }
  }
</script>
