<template>
  <view :class="wrap">
    <view class="scanWrap">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="packageNum" type="text" class="uni-input scanInput" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" @confirm="scanPack" :focus="skuFocus" placeholder="请扫描或输入篮子编号" />
      </view>
    </view>
    <view class="mu-divider"></view>
    <view class="d-flex errorText justify-content-center align-items-center normalPadding" v-if="hasError">
      <text>{{errorText}}</text>
    </view>
    <view class="d-flex normalPadding">
      <text class="rules">* 拣货篮编号格式规则为： “PB” + 8位数字，如PB00000001</text>
    </view>
    <view class="normalPadding basketContent">
      <view>
        当前已绑定
        <text class="redColor">{{basketListLength}}</text>个拣货篮：
      </view>
      <view class="baseketList">
        {{basketList}}
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
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
export default {
  mixins: [Mixin],
  data () {
    return {
      basketListLength: 0,
      hasError: false,
      packageNum: '',
      skuFocus: true,
      pickingListId: null,
      warehouseId: null,
      pickingListCode: null,
      errorText: null,
      basketList: null
    }
  },
  computed: {
    wrap () {
      return `${prefixCls}`
    }
  },
  methods: {
    scanCode () {
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
    scanPack (event) {
      let v = this
      v.gotoPickingDetails()
    },
    gotoPickingDetails () {
      let v = this
      const reg = new RegExp(/PB{1}\d{8}$/)
      console.log('packageNum:', v.packageNum)
      if (!v.packageNum || v.packageNum === '') {
        v.hasError = true
        v.errorText = '请输入篮子编号'
        v.skuFocus = false
        v.$nextTick(function () {
          v.skuFocus = true
        })
        return false
      } else if (!v.packageNum.match(reg)) {
        v.hasError = true
        v.packageNum = ''
        v.errorText = '篮子编号不符合规范, 请重新输入'
        v.skuFocus = false
        v.$nextTick(function () {
          v.skuFocus = true
        })
        return false
      } else {
        v.errorText = ''
      }
      const obj = {
        url: api.set_newPickingBasket,
        data: {
          basketCode: v.packageNum,
          pickingListId: v.pickingListId,
          pickingListCode: v.pickingListCode
        }
      }
      uni.showLoading()
      v.ajaxData(obj)
        .then(response => {
          uni.hideLoading()
          if (response.data.code === 0) {
            v.hasError = false
            let pickingCode = v.packageNum
            v.packageNum = ''
            uni.navigateTo({
              url: '/pages/workspace/pickingDetails' + '?packageNum=' + pickingCode + '&pickingListCode=' + v.pickingListCode +
                '&pickingListId=' + v.pickingListId + '&warehouseId=' + v.warehouseId,
              success () {
                console.log('s')
              },
              fail () {
                console.log('failed')
              }
            })
          } else if (response.data.code === 400001) {
            v.packageNum = ''
            uni.showToast({
              icon: 'none',
              title: response.data.message,
              duration: 2500
            })
          }
        })
    },
    getBasketList () {
      let v = this
      const obj = {
        url: api.get_pickingBasketListByPid,
        type: 'GET',
        data: {
          pickingListId: v.pickingListId
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas
            let arr = []
            data.forEach((n, i) => {
              arr.push(n.basketCode)
            })
            v.$nextTick(function () {
              v.basketListLength = arr.length;
              v.basketList = arr.toString()
            })
          }
        })
    }
  },
  onLoad (options) {
    let v = this
    v.pickingListId = options.pickingListId
    v.pickingListCode = options.pickingListCode
    v.warehouseId = options.warehouseId
    //       v.pickingListId = '0001000557201712270029712599'
    //       v.pickingListCode = 'PL00000607'
    //       v.warehouseId = '0001000557201606160000105376'
    uni.setNavigationBarTitle({
      title: v.pickingListCode + '扫描篮子'
    })
    v.getBasketList() // 获取篮子数据
  },
  onReady () {

  }
}
</script>
