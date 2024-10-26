<template>
  <view :class="wrap">
    <view class="listItem" v-for="(item, index) in cacheData" :key="item.goodsDetailId">
      <view class="d-flex justify-content-between align-items-center item">
        <view class="leftItem">
          <view class="d-flex justify-conent-start align-items-center">
            货位： {{item.goodsSku}}
          </view>
          <view class="d-flex justify-conent-between align-items-center keepPicking">
            <view>待拣: <text class="orange-color">{{item.quantity}}</text></view>
            <view>已拣：<text>{{item.pickingQuantity}}</text></view>
          </view>
        </view>
        <view class="rightItem">
          <button type="default" size="mini" @click="backPage(index)">选择</button>
        </view>
      </view>
      <view class="mu-divider"></view>
    </view>
  </view>
</template>

<script>
  const prefixCls = 'tongtool-workspace-selectStorage'
  import {
    getStorage
  } from '@/utils'
  export default  {
    data () {
      return {
        cacheData: []
      }
    },
    onLoad (options) {
      let v = this
      v.cacheData = getStorage('pdl_' + options.pickingListId)
    },
    methods: {
      backPage (index) {
        let v = this
        let pages = getCurrentPages()
        pages = pages[pages.length - 2]
        pages.setData({'id': JSON.stringify(v.cacheData[index])})
        uni.navigateBack()
      }
    },
    computed: {
      wrap() {
        return `${prefixCls}`
      }
    }
  }
</script>
