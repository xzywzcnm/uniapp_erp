<template>
  <view :class="wrap">
    <view class="scanWrap">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="skuNum" type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input scanInput" @confirm="scanSku" @blue="scanSku" :focus="pdSkuFock"
          placeholder="SKU条码" />
      </view>
      <view class="d-flex justify-content-end headEndLine" v-if="useBasket">
        <text>当前篮子编号: {{packageNum}}</text>
      </view>
      <view class="d-flex justify-content-end headEndLine">
        <text>拣货进度: {{pickingNo}}/{{total}}</text>
      </view>
    </view>
    <view class="mu-divider"></view>
    <view class="listContent">
      <view class="listItem" v-for="(item, index) in list" :key="item.goodsDetailId" @click="gotoProductPickingDetails(index)">
        <view class="d-flex justify-content-start item">
          SKU：<text>{{item.goodsSku}}</text>
        </view>
        <view class="d-flex justify-content-start item">
          货品：<text>{{item.productName}}</text>
        </view>
        <view class="d-flex justify-content-start item">
          货位：<text>{{item.cargoSpace}}</text>
        </view>
        <view class="row no-gutters item">
          <view class="col col-6">
            待拣货数量：<text>{{item.quantity}}</text>
          </view>
          <view class="col col-6">
            已拣货数量：<text>{{item.pickingQuantity}}</text>
          </view>
        </view>
        <view class="alreadyPicking">
          <text v-if="item.quantity === item.pickingQuantity">{{item.quantity === item.pickingQuantity ? '拣货完成' : ''}}</text>
          <text v-else class="icon iconfont">
            &#xe655;
          </text>
        </view>
      </view>
    </view>
    <view class="bottomBit row no-gutters">
      <view class="col d-flex justify-content-center align-tiems-center" :class="useBasket ? 'col-6' : 'col-12'">
        <button type="default" class="yellow" size="mini" @click="markPickingFinish">标记拣货完成</button>
      </view>
      <view class="col col-6 d-flex justify-content-center align-tiems-center" v-if="useBasket">
        <button type="primary" class="primary" size="mini" @click="changePackage">换篮子</button>
      </view>
    </view>
  </view>
</template>

<script>
  import Mixin from '@/mixin/common_mixin'
  import api from '@/api/api'
  const prefixCls = 'tongtool-workspace-pickingDetails'
  import {
    setStorage,
    getStorage,
    removeStorage
  } from '@/utils'
  export default {
    mixins: [Mixin],
    data() {
      return {
        useBasket: true,
        packageNum: null,
        pickingListCode: null,
        pickingListId: null,
        warehouseId: null,
        pdSkuFock: true,
        skuNum: null,
        pickingNo: 0,
        list: [],
        total: 0,
        markStatus: false
      }
    },
    methods: {
      scanCode() {
        let v = this
        uni.scanCode({
          success: function(res) {
            v.skuNum = res.result
            v.gotoPickingDetails()
            console.log('条码类型：' + res.scanType)
            console.log('条码内容：' + res.result)
          },
          fail: function(error) {
            console.log('error:', error)
          }
        })
      },
      scanSku() {
        let v = this
        if (!v.skuNum || v.skuNum === '') {
          return false
        }
        v.gotoPickingDetails()
      },
      gotoPickingDetails() {
        let v = this
        let list = getStorage('pdl_' + v.pickingListId)
        if (list && list.length > 0) {
          let result = list.findIndex((n, i) => {
            let skuLabel = [];
            if (n.skuLabel) {
              skuLabel = n.skuLabel.split('\n');
            }
            return (skuLabel.length && skuLabel.includes(v.skuNum)) || (n.goodsSku === v.skuNum);
          })
          console.log(result)
          if (result >= 0) {
            v.gotoProductPickingDetails(result)
          } else {
            uni.showToast({
              icon: 'none',
              title: '没有找到相关SKU',
              duration: 1500
            })
            v.pdSkuFock = false
            v.skuNum = ''
            v.$nextTick(function() {
              v.pdSkuFock = true
            })
          }
        }
      },
      changePackage() {
        let v = this
        uni.redirectTo({
          url: '/pages/workspace/scanPackage' + '?pickingListId=' + v.pickingListId + '&pickingListCode=' + v.pickingListCode +
            '&warehouseId=' + v.warehouseId
        })
      },
      markPickingFinish() { // 标记拣货完成
        let v = this
        if (v.markStatus) {
          return false
        }
        uni.showLoading({
          title: '数据提交中',
          mask: true
        })
        v.markStatus = true
        const obj = {
          url: api.set_markFinished,
          type: 'GET',
          data: {
            pickingListId: v.pickingListId
          }
        }
        v.ajaxData(obj)
          .then(response => {
            uni.hideLoading();
            v.markStatus = false;
            if (response.data.code === 0) {
              uni.showToast({
                icon: 'none',
                title: '标记成功',
                duration: 1500
              })
              let pickingNoStorage = getStorage('picking_warehouse_' + v.warehouseId + '_waitList')
              console.log('picking_warehouse_' + v.warehouseId + '_waitList')
              console.log('pickingNoStorage:', pickingNoStorage)
              if (!pickingNoStorage) {
                uni.redirectTo({
                  url: '/pages/workspace/pickingList'
                })
              } else {
                pickingNoStorage.forEach((n, i) => {
                  if (n.pickingListCode === v.pickingListCode) {
                    let hasBeenPickingList = getStorage('picking_warehouse_' + v.warehouseId + '_alreadyList')
                    if (hasBeenPickingList) {
                      hasBeenPickingList.push(n)
                    } else {
                      hasBeenPickingList = [n]
                    }
                    setStorage('picking_warehouse_' + v.warehouseId + '_alreadyList', hasBeenPickingList)
                    uni.redirectTo({
                      url: '/pages/workspace/pickingList'
                    })
                  }
                })
              }
            }
          }).catch(() => {
            v.markStatus = false;
          })
      },
      getList() {
        let v = this
        let skuList = getStorage('pdl_' + v.pickingListId)
        if (skuList) { // 如果当前拣货单已经有缓存
          v.list = []
          v.$nextTick(function(){
            v.list = skuList
            v.total = skuList.length
            v.pickingNo = Number(getStorage('pdl_' + v.pickingListId + '_pickingNo'))
          })
          uni.hideLoading()
        } else {
          const obj = {
            url: api.get_skuListByPickingListId,
            type: 'GET',
            data: {
              pickingListId: v.pickingListId
            }
          }
          v.ajaxData(obj)
            .then(response => {
              if (response.data.code === 0) {
                let data = response.data.datas
                data.forEach((n, i) => {
                  n.status = false
                  n.pickingQuantity = 0
                })
                v.list = data
                v.total = data.length
                setStorage('pdl_' + v.pickingListId, data)
                setStorage('thispickingListId', v.pickingListId) // 当前进行的拣货单
                setStorage('pdl_' + v.pickingListId + '_pickingNo', v.pickingNo)
                uni.hideLoading()
              }
            })
        }
      },
      gotoProductPickingDetails(index) {

        let v = this
        console.log('v.list[index]:', v.list[index])
        console.log('index:', index)
        if (v.list[index].quantity !== v.list[index].pickingQuantity) {
          uni.navigateTo({
            url: '/pages/workspace/productPickingDetails' + '?index=' + index + '&pickingListCode=' + v.pickingListCode +
              '&pickingListId=' + v.pickingListId + '&warehouseId=' + v.warehouseId
          })
        } else if (v.list[index].quantity === v.list[index].pickingQuantity) {
          uni.showToast({
            icon: 'none',
            title: '该SKU已经拣货完成'
          })
        }

      }
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
      v.pickingListCode = options.pickingListCode
      v.pickingListId = options.pickingListId
      v.warehouseId = options.warehouseId
      uni.setNavigationBarTitle({
        title: options.pickingListCode
      })
      let pickingSettings = getStorage('settingsConfigObj')
      if (pickingSettings.useBasket !== '1') {
        v.useBasket = false
      }
      setTimeout(function() {
        v.packageNum = options.packageNum
        console.log(v.packageNum)
      }, 500)
      v.getList()
    },
    onShow() {
      let v = this
      if (v.list.length > 0) {
        v.getList()
      }
    }
  }
</script>

<style>
</style>
