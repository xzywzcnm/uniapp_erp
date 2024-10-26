<template>
	<view :class="wrap">
		<view class="d-flex justify-content-between align-items-center controlLine inventory-result" v-if="productMes && productMes.length">
		  <text class="icon iconfont" @click="turnLeft">&#xe952;</text>
		  <text>{{current + 1}}/{{productMes.length}}</text>
		  <text class="icon iconfont" @click="turnRight">&#xe655;</text>
		</view>
		<view class="productContainer" v-if="productMes && productMes.length > 0">
		  <view class="d-flex justify-content-center align-items-center">
		    <image :src="productMes[current].goodsUrl"></image>
		  </view>
		  <view class="row no-gutters product-text">
		   <view class="col col-6">SKU: <text class="fontWeight">{{productMes[current].goodsSku}}</text></view>
		   <view class="col col-6" v-if="selectCurrent !== 0">货位: <text class="fontWeight">{{productMes[current].warehouseLocationName}}</text></view>
		  </view>
		  <view class="d-flex justify-content-start product-text">
		    <view>中文描述: <text class="fontWeight">{{productMes[current].goodsCnDesc}}</text></view>
		  </view>
      <view class="d-flex justify-content-start product-text">
        <view>英文描述: <text class="fontWeight">{{productMes[current].goodsEnDesc}}</text></view>
      </view>
      <view class="d-flex justify-content-start product-text"  v-if="selectCurrent !== 0 && selectCurrent !== 1">
        <view>批次号: <text class="fontWeight">{{productMes[current].receiptBatchNo}}</text></view>
      </view>
      <view class="d-flex justify-content-between product-text">
        <view>库存数量: <text class="fontWeight">{{productMes[current].inventoryNumber}}</text></view>
      </view>
		  <view class="d-flex justify-content-between product-text">
		    <view>收货数量: <text class="fontWeight">{{productMes[current].deliveryNumber || 0}}</text></view>
		    <view>不良品数量: <text class="fontWeight">{{productMes[current].defectiveNumber || 0}}</text></view>
		  </view>
		  <view class="d-flex justify-content-between product-text" v-if="queryParamType === '1'">
		    <view>待归库数量: <text class="fontWeight">{{productMes[current].waitComeBackNumber || 0}}</text></view>
		    <view>异常拣货数量: <text class="fontWeight">{{productMes[current].pickingExceptionNumber || 0}}</text></view>
		  </view>
		  <view class="d-flex justify-content-between product-text">
		    <view>分配数量: <text class="fontWeight">{{productMes[current].allottedNumber}}</text></view>
		    <view>冻结数量: <text class="fontWeight">{{productMes[current].frozenNumber}}</text></view>
		  </view>
      <view class="d-flex justify-content-start product-text">
        <view>可用数量: <text class="fontWeight">{{productMes[current].availableNumber}}</text></view>
      </view>
      <view class="d-flex justify-content-start product-text">
        <view>安全库存: <text class="fontWeight">{{productMes[current].safetyInventoryNumber}}</text></view>
      </view>
		</view>
	</view>
</template>
<style>
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
  import {
    setStorage,
    getStorage,
    removeStorage
  } from '@/utils'
  const prefixCls = 'tongtool-workspace-inventorQuery'
	export default {
    mixins: [Mixin],
		data() {
			return {
        selectCurrent: 0,
				productMes: [],
        current: 0,
        queryParamType: null
			}
		},
    computed: {
      wrap() {
        return `${prefixCls}`
      }
    },
		methods: {
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
		},
    onLoad (option) {
      let v = this
      let data = getStorage('newInventoryData')
      let selectCurrent = getStorage('selectCurrent')
      if (option) {
        v.queryParamType = option.queryParamType;
      }
      if (data && data.length > 0) {
        v.productMes = data.map(i=>{
            i.goodsUrl = v.setImgPath(i.goodsUrl,true);
            return i
        })
      }
      if (selectCurrent) {
        v.selectCurrent = Number(selectCurrent)
      }
    }
	}
</script>

<style scoped>
.inventory-result .iconfont {
  font-size: 26px;
  padding: 0 36rpx;
}
</style>
