<template>
  <view :class="wrap">
    <view class="uni-input-wrapper">
      <input class="uni-input" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }" v-model.trim="locationName"
        @confirm="confirmLocation" autofocus placeholder="扫描或输入搜索库位" />
    </view>
    <!--<view class="scanWrap">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe642;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="goodsAllocation" type="text" class="uni-input scanInput" @confirm="confirmGoods" :focus="goodsFocus" placeholder="扫描或输入搜索库位" />
      </view>
    </view>
    <view class="mu-divider"></view>
    <view class="page" v-if="lists.length > 0">
    	<scroll-view class="scrollList" scroll-y :scroll-into-view="scrollViewId" :style="{height:winHeight + 'px'}">
    		<view class="uni-list">
    			<block v-for="(list, index) in lists" :key="index">
    				<block v-if="list.wmsWarehouseLocationList && list.wmsWarehouseLocationList.length">
    					<view class="uni-list-cell-divider" :id="list.warehouseBlockCode">
    						{{list.warehouseBlockCode}}
    					</view>
    					<view class="uni-list-cell" hover-class="uni-list-cell-hover" v-for="(item,subIndex) in list.wmsWarehouseLocationList" :key="subIndex" :class="list.wmsWarehouseLocationList.length -1 == subIndex ? 'uni-list-cell-last' : ''" @click="backPage(index, subIndex)">
    						<view class="uni-list-cell-navigate">
    							{{item.warehouseLocationName}}
    						</view>
    					</view>
    				</block>
    			</block>
    		</view>
    	</scroll-view>
    	&lt;!&ndash; <view class="uni-indexed-list-bar" :class="touchmove ? 'active' : ''" @touchstart="touchStart" @touchmove="touchMove"
    	 @touchend="touchEnd" @touchcancel="touchCancel" :style="{height:winHeight + 'px'}">
    		<text v-for="(list,index) in lists" :key="index" class="uni-indexed-list-text" :class="touchmoveIndex == index ? 'active' : ''"
    		 :style="{height:itemHeight + 'px',lineHeight:itemHeight + 'px'}">{{list.warehouseBlockCode}}</text>
    	</view>
    	<view class="uni-indexed-list-alert" v-if="touchmove">
    		{{lists[touchmoveIndex].warehouseBlockCode}}
    	</view> &ndash;&gt;
    </view>-->
  </view>
</template>

<script>
import Mixin from '@/mixin/common_mixin'
import api from '@/api/api'
const prefixCls = 'tongtool-newWorkspace-goodsAllocation'
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
export default {
  mixins: [Mixin],
  data() {
    return {
      locationName: '',
      goodsAllocation: '',
      goodsFocus: true,
      title: 'grid',
      lists: [],
      touchmove: false,
      touchmoveIndex: -1,
      itemHeight: 0,
      winHeight: 0,
      scrollViewId: "A",
      titleHeight: 0
    }
  },
  computed: {
    wrap() {
      return `${prefixCls}`
    }
  },
  onLoad() {
    let v = this
    v.getList()
  },
  methods: {
    confirmLocation(e) {
      // enter事件
      let value = e.detail.value.trim();
      this.getWarehouseLocationId(value, '', 0).then(data => {
        if (data) {
          let obj = {
            warehouseLocationName: data.warehouseLocationName,
            warehouseLocationId: data.warehouseLocationId,
            warehouseBlockId: data.warehouseBlockId
          }
          this.store.commit('goodsSaveData', obj)
          uni.navigateBack({})
        }
      })
    },
    getList() {
      let v = this
      const obj = {
        url: api.get_warehouseBlock,
        type: 'GET',
        data: {
          warehouseId: getStorage('newErpWarehouse').warehouseId,
          warehouseBlockTypes: '00,10'
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas
            let arr = []
            v.lists = data
            v.$nextTick(() => {
              let winHeight = uni.getSystemInfoSync().windowHeight
              console.log(winHeight)
              v.itemHeight = winHeight / data.length
              v.winHeight = winHeight
            })
          }
        })
    },
    confirmGoods() {
      let v = this
      if (v.goodsAllocation === '') {
        return false
      }
      v.lists.forEach((n, i) => {
        if (n.wmsWarehouseLocationList) {
          n.wmsWarehouseLocationList.forEach((m, t) => {
            if (m.warehouseLocationName === v.goodsAllocation) {
              v.backPage(i, t)
            }
          })
        }
      })
    },
    scanCode() {
      let v = this
      uni.scanCode({
        success: function (res) {
          v.goodsAllocation = res.result
          v.confirmGoods()
        },
        fail: function (error) {
          console.log('error:', error)
        }
      })
    },
    touchStart(e) {
      this.touchmove = true;
      let pageY = e.touches[0].pageY;
      console.log('pageY:', this.titleHeight)
      let index = Math.floor((pageY - this.titleHeight) / this.itemHeight);
      let item = this.lists[index];
      console.log('index:', index)
      if (item) {
        this.scrollViewId = item.warehouseBlockCode;
        console.log('index:', index)
        this.touchmoveIndex = index;
      }
    },
    touchMove(e) {
      let pageY = e.touches[0].pageY;
      let index = Math.floor((pageY - this.titleHeight) / this.itemHeight);
      let item = this.lists[index];
      if (item) {
        this.scrollViewId = item.warehouseBlockCode;
        console.log('index:', index)
        this.touchmoveIndex = index;
      }
    },
    touchEnd() {
      this.touchmove = false;
      this.touchmoveIndex = -1;
    },
    touchCancel() {
      this.touchmove = false;
      this.touchmoveIndex = -1;
    },
    backPage(index, subIndex) {
      console.log(index)
      let v = this
      console.log(v.lists[index])
      let obj = {
        warehouseLocationName: v.lists[index].wmsWarehouseLocationList[subIndex].warehouseLocationName,
        warehouseLocationId: v.lists[index].wmsWarehouseLocationList[subIndex].warehouseLocationId,
        warehouseBlockId: v.lists[index].warehouseBlockId
      }
      let pages = getCurrentPages()
      pages = pages[pages.length - 2]
      //pages.data.warehouseLocationName = '123'
      pages.setData({ 'id': JSON.stringify(obj) })
      console.log(pages)
      uni.navigateBack({

      })
    }
  }
}
</script>

<style>
.page {
  display: flex;
  flex-direction: row;
}

.scrollList {
  flex: 1;
  height: 100vh;
}

.uni-indexed-list-bar {
  width: 46upx;
  height: 100vh;
  background-color: lightgrey;
  display: flex;
  flex-direction: column;
}

.uni-scroll-view {
  position: relative;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  height: 100%;
  max-height: inherit;
}

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

.uni-list:before {
  position: absolute;
  z-index: 10;
  right: 0;
  top: 0;
  left: 0;
  height: 1upx;
  content: '';
  -webkit-transform: scaleY(.5);
  transform: scaleY(.5);
  background-color: #c8c7cc;
}

.uni-list-cell {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
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

.uni-list-cell-hover {
  background-color: #eee;
}

.uni-indexed-list-bar.active {
  background-color: rgb(200, 200, 200);
}

.uni-indexed-list-text {
  color: #aaa;
  font-size: 22upx;
  text-align: center;
}

.uni-indexed-list-bar.active .uni-indexed-list-text {
  color: #333;
}

.uni-indexed-list-text.active,
.uni-indexed-list-bar.active .uni-indexed-list-text.active {
  color: #007AFF;
}

.uni-indexed-list-alert {
  position: absolute;
  z-index: 20;
  width: 160upx;
  height: 160upx;
  left: 50%;
  top: 50%;
  margin-left: -80upx;
  margin-top: -80upx;
  border-radius: 80upx;
  text-align: center;
  line-height: 160upx;
  font-size: 70upx;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
}

.uni-list-cell-divider {
  position: relative;
  display: flex;
  color: #999;
  background-color: #f7f7f7;
  padding: 15upx 20upx;
}

.uni-list-cell-divider:before {
  position: absolute;
  right: 0;
  top: 0;
  left: 0upx;
  height: 1upx;
  content: '';
  -webkit-transform: scaleY(.5);
  transform: scaleY(.5);
  background-color: #c8c7cc;
}

.uni-list-cell-divider:after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0upx;
  height: 1upx;
  content: '';
  -webkit-transform: scaleY(.5);
  transform: scaleY(.5);
  background-color: #c8c7cc;
}

.uni-list-cell-navigate.uni-navigate-right:after {
  font-family: uniicons;
  content: '\e583';
  position: absolute;
  right: 24upx;
  top: 50%;
  color: #bbb;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
}

.uni-list-cell-navigate.uni-navigate-bottom:after {
  font-family: uniicons;
  content: '\e581';
  position: absolute;
  right: 24upx;
  top: 50%;
  color: #bbb;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
}

.uni-list-cell-navigate.uni-navigate-bottom.uni-active:after {
  font-family: uniicons;
  content: '\e580';
  position: absolute;
  right: 24upx;
  top: 50%;
  color: #bbb;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
}
</style>
