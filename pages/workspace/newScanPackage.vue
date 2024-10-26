<template>
  <view :class="wrap">
    <view class="scanWrap">
      <view>拣货单：{{ pickingGoodsNo }}</view>
      <view>拣货单类型：{{ packageGoodsType === 'SS' ? '单品' : '多品' }}</view>
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="packageNum" type="text" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
          class="uni-input scanInput" @confirm="scanPack" :focus="skuFocus" placeholder="请扫描或输入篮子编号" />
      </view>
    </view>
    <view class="mu-divider"></view>
    <view class="d-flex errorText justify-content-center align-items-center normalPadding" v-if="hasError">
      <text>{{ errorText }}</text>
    </view>
    <view class="d-flex normalPadding">
      <text class="rules">* 拣货篮编号格式规则为： “PB” + 8位数字，如PB00000001</text>
    </view>
    <view class="normalPadding basketContent">
      <view>
        当前已绑定
        <text class="redColor">{{ basketListLength }}</text>
        个拣货篮：
      </view>
      <view class="baseketList">
        {{ basketList }}
      </view>
    </view>
    <view class="bottomBit d-flex justify-content-center align-items-center">
      <button type="primary" size="mini" @click="scanPack">查询</button>
    </view>
  </view>
</template>

<script>
import Mixin from '@/mixin/common_mixin'
import api from '@/api/api'

const prefixCls = 'tongtool-workspace-scanPackage'
// import {
//   setStorage,
//   getStorage,
//   removeStorage
// } from '@/utils'

export default {
  mixins: [Mixin],
  data() {
    return {
      basketListLength: 0,
      hasError: false,
      packageNum: '',
      skuFocus: true,
      pickingGoodsId: null,
      warehouseId: null,
      pickingGoodsNo: null,
      errorText: null,
      packageGoodsType: null,
      basketList: ''
    }
  },
  computed: {
    wrap() {
      return `${prefixCls}`
    }
  },
  methods: {
    scanCode() {
      let v = this
      uni.scanCode({
        success: function (res) {
          v.packageNum = res.result
          v.gotoPickingDetails()
          console.log('条码类型：' + res.scanType)
          console.log('条码内容：' + res.result)
        },
        fail: function (error) {
          console.log('error:', error)
        }
      })
    },
    scanPack(event) {
      let v = this
      v.gotoPickingDetails()
    },
    gotoPickingDetails() {
      let v = this
      const reg = new RegExp(/PB{1}\d{8}$/)
      if (!v.packageNum || v.packageNum === '') {
        v.hasError = true
        v.errorText = '请输入篮子编号'
        v.skuFocus = false
        v.$nextTick(function () {
          v.skuFocus = true
        })
        v.openSound('002')
        return false
      } else if (!v.packageNum.match(reg)) {
        v.hasError = true
        v.packageNum = ''
        v.errorText = '篮子编号不符合规范, 请重新输入'
        v.skuFocus = false
        v.$nextTick(function () {
          v.skuFocus = true
        })
        v.openSound('002')
        return false
      } else {
        v.errorText = ''
      }
      const obj = {
        url: api.set_bindPickingGoodsBasket + '?pickingGoodsBasket=' + v.packageNum + '&pickingGoodsNo=' + v.pickingGoodsNo + '&warehouseId=' + v.warehouseId,
        type: 'put'
      }
      uni.showLoading({
        title: '数据提交中',
        mask: true
      })
      v.ajaxData(obj)
        .then(response => {
          uni.hideLoading()
          if (response.data.code === 0) {
            v.openSound('001')
            v.hasError = false
            let pickingCode = v.packageNum
            v.packageNum = ''
            uni.navigateTo({
              url: '/pages/workspace/newPickingDetails' + '?packageNum=' + pickingCode + '&pickingGoodsNo=' + v.pickingGoodsNo +
                '&pickingGoodsId=' + v.pickingGoodsId + '&warehouseId=' + v.warehouseId,
              success() {
                console.log('s')
              },
              fail() {
                console.log('failed')
              }
            })
          } else if (response.data.code === 111168) {
            v.openSound('002')
            v.packageNum = ''
            uni.showToast({
              icon: 'none',
              title: '当前篮子编号已经被使用',
              duration: 2500
            })
          } else {
            v.openSound('002')
          }
        })
    },
    getBasketList() {
      let v = this
      const obj = {
        url: api.get_bindingBasket,
        type: 'GET',
        data: {
          pickingGoodsNo: v.pickingGoodsNo
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas || [];
            v.$nextTick(function () {
              v.basketListLength = data.length;
              v.basketList = data.toString()
            })
          }
        })

    }
  },
  onLoad(options) {
    let v = this
    v.pickingGoodsId = options.pickingGoodsId
    v.pickingGoodsNo = options.pickingGoodsNo
    v.packageGoodsType = options.packageGoodsType
    v.warehouseId = options.warehouseId
    uni.setNavigationBarTitle({
      title: v.pickingGoodsNo + '扫描篮子'
    })
    v.getBasketList() // 获取篮子数据
  }
}
</script>
