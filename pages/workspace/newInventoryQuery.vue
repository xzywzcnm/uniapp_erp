<template>
  <view :class="wrap">
    <view class="d-flex justify-content-between warehouseHeadline">
      <view class="headTitle">
        <text>{{selectSearchArray[selectCurrent]}}</text>
      </view>
      <picker @change="selectSearchArrayChange" @click="selectSearchArrayClick" :value="selectCurrent" mode="selector"  :range="selectSearchArray">
        <view class="selectWarehouse">
          <text class="icon iconfont">&#xe615;</text>
          <text>{{selectSearchArray[selectCurrent]}} </text>
        </view>
      </picker>
    </view>
    <template v-if='selectCurrent === 1 || selectCurrent === 2'>
      <view class="mu-divider"></view>
      <view class="scanWrap">
        <view class="d-flex justify-content-start align-items-center">
          <view class="scan" @click="goodsLocalCode">
            <view class="icon iconfont scanIcon">&#xe612;</view>
            <view class="scanText">扫一扫</view>
          </view>
          <input v-model.trim="goodsLocalValue" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" type="text" class="uni-input scanInput" :focus="goodsLocalFocus" placeholder="请输入库位" @confirm="nextInput('1')" />
        </view>
      </view>
    </template>
    <view class="mu-divider"></view>
    <view class="scanWrap">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="skuValue" type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input scanInput" :focus="skuFocus" @confirm="nextInput('2')" placeholder="请输入SKU" />
      </view>
    </view>
    <view class="mu-divider"></view>
    <template v-if="selectCurrent === 0">
      <view class="d-flex justify-content-end align-items-center normalPadding">
        <checkbox-group @change="checkboxChange">
          <label>
              <checkbox :value="isInventNumber" checked="true" />显示库存为0的数据
          </label>
        </checkbox-group>
      </view>
    </template>
    <template v-if='selectCurrent === 2'>
      <view class="scanWrap">
        <view class="d-flex justify-content-start align-items-center">
          <view class="scan" @click="recepetCode">
            <view class="icon iconfont scanIcon">&#xe612;</view>
            <view class="scanText">扫一扫</view>
          </view>
          <input v-model.trim="recepetValue" type="text" class="uni-input scanInput" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" :focus="recepetFocus" placeholder="请输入批次号" @confirm="showSkuValue" />
        </view>
      </view>
    </template>

    <view class="bottomBit d-flex justify-content-center align-items-center">
      <button type="primary" size="mini" @click="showSkuValue">查询</button>
    </view>
    <!-- <imgLoad ref="imgLoad"></imgLoad> -->
  </view>
</template>
<style>
  picker-view {
    width: 100%;
    height: 600upx;
    margin-top:20upx;
  }

  .item {
    line-height: 100upx;
    text-align: center;
  }
  .fontWeight {
    font-weight: bold;
  }
</style>
<script>
  import Mixin from '@/mixin/common_mixin'
  import api from '@/api/api'
  // import imgLoad from 'mpvue-img-load'
  const prefixCls = 'tongtool-workspace-inventorQuery'
  import {
    setStorage,
    getStorage,
    removeStorage
  } from '@/utils'
  export default {
    mixins: [Mixin],
    data() {
      return {
        isInventNumber: '1',
        recepetFocus: false,
        goodsLocalFocus: false,
        goodsLocalValue: '',
        recepetValue: '',
        selectSearchArray: ['按产品SKU查询', '按产品/库位查询', '按产品/库位/批次查询'],
        selectCurrent: 0,
        current: 0,
        value: 'SKU',
        visible: false,
        skuFocus: true,
        errorText: '请输入SKU',
        productSrc: null,
        showProduct: false,
        skuIndex: 0,
        warehouseIndex: 0,
        warehouseName: '选择仓库',
        skuArray: ['SKU', '货位'],
        skuValue: '',
        warehouseArr: ['选择仓库'],
        productMes: [],
        skuPlaceholder: '输入SKU',
        isMoreGoodsShelf: null
      }
    },
    // components: {
    //   imgLoad
    // },
    computed: {
      wrap() {
        return `${prefixCls}`
      }
    },
    watch: {
      skuIndex(n, o) {
        let v = this
        console.log('typeof:' + typeof n)
        console.log('n:' + n)
        if (n === 0) {
          v.value = 'SKU'
          v.errorText = '请输入SKU'
          v.skuPlaceholder = '请输入SKU'
        } else if (n === 1) {
          v.value = '货位'
          v.errorText = '请输入货位'
          v.skuPlaceholder = '请输入货位'
        }
      }
    },
    methods: {
      checkboxChange (e) {
        let v = this
        let value = e.detail.value
        if (value.includes('1')) {
          v.isInventNumber = '1'
        } else if (value.length === 0) {
          v.isInventNumber = '0'
          console.log('bbbbbbbbbbbb:', v.isInventNumber)
        } else {
          v.isInventNumber = '1'
        }
        console.log('e:', e)
      },
      selectSearchType () {
        let v = this
        uni.showActionSheet({
          itemList: v.skuArray,
          success: function(res) {
            v.skuIndex = res.tapIndex
          }
        })
      },
      nextInput (val) {
        let v = this
        v.skuFocus = false
        v.goodsLocalFocus = false
        v.recepetFocus = false
        v.$nextTick(function(){
          if (v.selectCurrent === 0) {
            v.showSkuValue()
          } else if (v.selectCurrent === 1 && val === '1') {
            v.skuFocus = true
          } else if (v.selectCurrent === 1 && val === '2') {
            v.showSkuValue()
          }  else if (v.selectCurrent === 2 && val === '1') {
            v.skuFocus = true
          } else if (v.selectCurrent === 2 && val === '2') {
            v.recepetFocus = true
          }
        })
      },
      showSkuValue() {
        let v = this
        console.log('~~~')

        if ((v.skuValue === '' || !v.skuValue) && v.selectCurrent === 0) {
          uni.showToast({
            title: '查询内容不能为空',
            icon: 'none',
            duration: 2000
          })
          v.openSound('002')
          return false
        }
        if (v.selectCurrent === 1 && (v.skuValue === '' || !v.skuValue) && v.goodsLocalValue === '') {
          uni.showToast({
            title: 'SKU或库位不能为空',
            icon: 'none',
            duration: 2000
          })
          v.openSound('002')
          return false
        }
        if (v.selectCurrent === 2 && (v.skuValue === '' || !v.skuValue) && v.goodsLocalValue === '' && v.recepetValue === '') {
          uni.showToast({
            title: 'SKU或库位或批次号不能为空',
            icon: 'none',
            duration: 2000
          })
          v.openSound('002')
          return false
        }
        uni.showLoading({
          title: '查询中'
        })
        let url = api.get_querySearch

        console.log('url:', url)
        let parmasData = null
        if (v.selectCurrent === 0) {
          parmasData = {
            isInventNumber: v.isInventNumber,
            queryParamType: '1',
            goodsSku: v.skuValue,
            warehouseId: v.warehouseId
          }
        } else if (v.selectCurrent === 1) {
          parmasData = {
            queryParamType: '2',
            goodsSku: v.skuValue,
            warehouseLocationName: v.goodsLocalValue,
            warehouseId: v.warehouseId
          }
        } else {
          parmasData = {
            queryParamType: '3',
            goodsSku: v.skuValue,
            receiptBatchNo: v.recepetValue,
            warehouseLocationName: v.goodsLocalValue,
            warehouseId: v.warehouseId
          }
        }
        const obj = {
          url: url,
          data: parmasData
        }
        v.productMes = []
        v.ajaxData(obj)
          .then(response => {
            uni.hideLoading()
            if (response.data.code === 0) {

              if (!response.data.datas || response.data.datas.length === 0) {
                uni.showToast({
                  title: '没有查询到相关数据',
                  icon: 'none',
                  duration: 2000
                })
                v.openSound('002')
                return false
              } else {
                v.openSound('001')
                setStorage('selectCurrent', v.selectCurrent)
                setStorage('newInventoryData', response.data.datas)
                uni.navigateTo({
                  url: '/pages/workspace/newInventoryResult?queryParamType=' + parmasData.queryParamType
                })
              }
            } else {
              v.openSound('002')
            }
          })
      },
      skuChange(e) {
        this.skuIndex = Number(e.target.value)
      },
      turnLeft() {
        let v = this
        if (v.current === 0) {
          return false
        } else {
          v.current--
        }
      },
      turnRight() {
        let v = this
        if (v.current === v.productMes.length - 1) {
          return false
        } else {
          v.current++
        }
      },
      warehouseClick () {
        let v = this
        // #ifdef APP-PLUS
        let system = uni.getSystemInfoSync().system.toLowerCase()
        if (system.includes('ios')) {
          v.skuFocus = false
        }
        // #endif
      },
      selectSearchArrayClick () {
        let v = this
      },
      selectSearchArrayChange (e) {
        let v = this
        v.selectCurrent = Number(e.target.value)
        v.skuFocus = false
        v.goodsLocalFocus = false
        v.recepetFocus = false
        if (v.selectCurrent === 0) {
          v.skuFocus = true
        } else {
          v.goodsLocalFocus = true
        }
        setStorage('selectCurrent', v.selectCurrent)
        console.log('eTV:', e.target.value)
      },
      warehouseChange(e) {
        let v = this
        let obj = v.warehouseArr[e.target.value]
        setStorage('inventorQuery', obj)
        v.warehouseName = obj.warehouseName
        v.warehouseId = obj.warehouseId
        v.isMoreGoodsShelf = obj.isMoreGoodsShelf
      },
      recepetCode() {
        console.log('in')
        let v = this
        uni.scanCode({
          success: function(res) {
            v.recepetValue = res.result
            v.$nextTick(function () {
              if (v.selectCurrent ===2) {
                v.showSkuValue()
              }
            })
          },
          fail: function(error) {
            console.log('error:', error)
          }
        })
      },
      goodsLocalCode() {
        console.log('in')
        let v = this
        uni.scanCode({
          success: function(res) {
            v.goodsLocalValue = res.result
            v.goodsLocalFocus = false
            v.$nextTick(function () {
              v.skuFocus = true
            })
          },
          fail: function(error) {
            console.log('error:', error)
          }
        })
      },
      scanCode() {
        console.log('in')
        let v = this
        uni.scanCode({
          success: function(res) {
            v.skuValue = res.result
            v.$nextTick(function () {
              if (v.selectCurrent === 0) {
                v.showSkuValue()
              }
            })
          },
          fail: function(error) {
            console.log('error:', error)
          }
        })
      }
    },
    onLoad() {
      let v = this
      // uni.showLoading({
      //   title: '数据加载中'
      // })
      let loadStoreWarehouse = getStorage('newErpWarehouse')
      if (loadStoreWarehouse) {
        v.warehouseName = loadStoreWarehouse.warehouseName
        v.warehouseId = loadStoreWarehouse.warehouseId
      }
      let selectCurrent = getStorage('selectCurrent');
      if (selectCurrent) {
        v.selectCurrent = selectCurrent;
      }
      uni.setNavigationBarTitle({
          title: `库存查询 (${v.warehouseName})`
      })
    }
  }
</script>
