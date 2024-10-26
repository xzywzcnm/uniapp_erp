<template>
	<view :class="wrap">
    <view class="normalPadding">
      <view>
      	<view class="uni-form-item uni-column">
      		<view class="title">拣货单号</view>
          <view class="d-flex justify-content-start align-content-center scanWrap">
            <view class="scan" @click="scanCode">
              <view class="icon iconfont scanIcon">&#xe612;</view>
              <view class="scanText">扫一扫</view>
            </view>
            <input class="uni-input" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" focus v-model.trim="searchKeyName" placeholder="请扫描或输入拣货单号" />
          </view>
      	</view>
      </view>
      <view class="normal-margin-top">
      	<view class="uni-form-item uni-column">
      		<view class="title">邮寄方式</view>
          <view class="uni-list">
            <view class="uni-list-cell">
              <view class="uni-list-cell-left">
                当前选择
              </view>
              <view class="uni-list-cell-db">
                <picker @change="bindPickerChange" :value="index" :range="array">
                  <view class="uni-input">{{array[index]}}</view>
                </picker>
              </view>
            </view>
          </view>
      	</view>
      </view>
      <view class="normal-margin-top">
      	<view class="uni-form-item uni-column">
      		<view class="title">拣货单类型</view>
      		<view class="uni-list">
      		  <view class="uni-list-cell">
      		    <view class="uni-list-cell-left">
      		      当前选择
      		    </view>
      		    <view class="uni-list-cell-db">
      		      <picker @change="bindCleaningPickerChange" :value="cleanIndex" :range="typeArray">
      		        <view class="uni-input">{{typeArray[cleanIndex]}}</view>
      		      </picker>
      		    </view>
      		  </view>
      		</view>
      	</view>
      </view>
    </view>
    <view class="bottomBit">
      <view class="d-flex justify-content-center align-tiems: center">
        <button type="default" class="green" size="mini" @click="search">
          <text>查询</text>
        </button>
      </view>
    </view>
  </view>
</template>
<style>
  .uni-list {
  	background-color: #FFFFFF;
  	position: relative;
  	width: 100%;
  	display: flex;
  	flex-direction: column;
  }
  .uni-list:after {
  	position: absolute;
  	z-index: 10;
  	right: 0;
  	bottom: 0;
  	left: 0;
  	height: 1upx;
  	content: '';
  	-webkit-transform: scaleY(.5);
  	transform: scaleY(.5);
  	background-color: #c8c7cc;
  }
  .uni-form-item{
  	display:flex;
  	width:100%;
  	padding:10upx 0;
  }
  .uni-form-item .title{
  	padding:10upx 25upx;
    font-size: 28upx;
  }
  .uni-column {
  	flex-direction: column;
  }
  .uni-label {
  	width: 210upx;
  	word-wrap: break-word;
  	word-break: break-all;
  	text-indent:20upx;
  }
  .uni-list-cell {
  	position: relative;
  	display: flex;
  	flex-direction: row;
  	justify-content: space-between;
  	align-items: center;
  }
  .uni-list-cell-hover {
  	background-color: #eee;
  }
  .uni-list-cell-pd {
  	padding: 22upx 30upx;
  }
  .uni-list-cell-left {
  	font-size:28upx;
  	padding: 0 30upx;
  }
  .uni-list-cell-db,
  .uni-list-cell-right {
  	flex: 1;
  }
  .uni-list-cell:after {
  	position: absolute;
    z-index: 3;
  	right: 0;
  	bottom: 0;
  	left: 30upx;
  	height: 1upx;
  	content: '';
  	-webkit-transform: scaleY(.5);
  	transform: scaleY(.5);
  	background-color: #c8c7cc;
  }
</style>
<script>
import Mixin from '@/mixin/common_mixin'
import api from '@/api/api'
const prefixCls = 'tongtool-workspace-checkPurchaseOrder'
export default {
  mixins: [ Mixin ],
  data () {
    return {
      searchKeyName: '',
      array: [],
      index: 0,
      cleanIndex: 0,
      typeArray: ['全部', '单品单件', '单品多件', '单品', '多品多件'],
      shippingArr: []
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
        success: function(res) {
          v.skuValue = res.searchKeyName
        },
        fail: function(error) {
          console.log('error:', error)
        }
      })
    },
    search () {
      let v = this
      let listType = v.cleanIndex === 0 ? '' : v.cleanIndex - 1
      console.log('indexxx:' + typeof v.index)
      let merchantCarrierId = v.index === 0 ? '' : v.shippingArr[v.index - 1].merchantCarrierId
      let shippingMethodId = v.index === 0 ? '' : v.shippingArr[v.index - 1].shippingMethodId
      console.log('searchKeyName:', v.searchKeyName)
      uni.redirectTo({
      	url: '/pages/workspace/pickingList' + '?listType=' + listType + '&merchantCarrierId=' + merchantCarrierId + '&shippingMethodId=' + shippingMethodId + '&pickingListCode=' + v.searchKeyName
      })
    },
    bindPickerChange (e) {
    	this.index = Number(e.target.value)
    },
    bindCleaningPickerChange (e) {
      this.cleanIndex = Number(e.target.value)
    },

    getShippingMethodList (warehouseId) {
      let v = this
      const obj =　{
        url: api.get_shippingMethodList,
        type: 'GET',
        data: {
          warehouseId: warehouseId
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas
            v.shippingArr = data
            let arr = ['全部']
            data.forEach((n, i) => {
              arr.push(n.merchantShippingMethodShortname)
            })
            v.array = arr
          }
        })
    }
  },

  onLoad (option) {
    let v = this
    console.log(JSON.stringify(option))
    v.getShippingMethodList(option.warehouseId)
  }
}
</script>
