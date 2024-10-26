<template>
	<view :class="wrap">
    <view class="pickinglistWrap">
      <view class="mu-divider"></view>
      <view class="pickinglist">
        <view class="pickingItem" v-for="item in alreadyList" :key="item.pickingListId">
          <view class="d-flex justify-content-between pickingHead">
            <text class="phTitle">捡货单号：{{item.pickingGoodsNo}}</text>
            <text class="phStatus">已拣货</text>
          </view>
          <view class="mu-divider"></view>
          <view class="pickingItemContent">
            <view class="d-flex justify-content-start pItem">
              <text class="pItemTitle">拣货单类型：</text>
              <text>
                {{
                  item.packageGoodsType === 'SS'  ? '单品' :
                    item.packageGoodsType === 'MM' ? '多品' : ''
                }}
              </text>
            </view>
            <view class="d-flex justify-content-start pItem">
              <text class="pItemTitle">创建人：</text>
              <text>{{item.createdByName}}</text>
            </view>
            <view class="d-flex justify-content-start pItem">
              <text class="pItemTitle">拣货人：</text>
              <text  v-if="item.finishUserName">{{item.finishUserName}}</text>
            </view>
            <view class="d-flex justify-content-start pItem">
              <text class="pItemTitle">创建日期：</text>
              <text>{{getDataToLocalTime(item.createdTime,'fulltime')}}</text>
            </view>
            <view class="d-flex justify-content-start pItem">
              <view>出库单数：{{item.pickingNumber}}</view>
              <view class="jg">|</view>
              <view>SKU数：{{item.goodsSkuNumber}}</view>
              <view class="jg">|</view>
              <view>货品数：{{item.goodsQuantityNumber}}</view>
            </view>
          </view>
        </view>
        <no-data v-if="noAlreadyData" :text="'无已拣货数据'" class="mt10"></no-data>
      </view>
    </view>
  </view>
</template>
<script>
  import Mixin from '@/mixin/common_mixin'
  import noData from '@/components/common/nodata';
  const prefixCls = 'tongtool-workspace-pickingList'
  import {
  		setStorage,
  		getStorage,
      removeStorage
  	} from '@/utils'
  export default {
    mixins: [ Mixin ],
    components: {
      noData
    },
    data () {
      return {
        alreadyList: [],
        noAlreadyData: false
      }
    },
    computed: {
      wrap () {
        return `${prefixCls}`
      }
    },
    watch: {

    },
    methods: {
      alreadyPicking () {
        let v = this
        v.noAlreadyData = false
        v.alreadyList = []
        let warehouseId = getStorage('newErpWarehouse').warehouseId
        let aPickingList = getStorage('picking_wmsWarehouse_' + warehouseId + '_alreadyList')
        if (!aPickingList || aPickingList.length === 0) {
          v.noAlreadyData = true
        }
        v.alreadyList = aPickingList
      },
    },
    onShow () {
      this.alreadyPicking();
    },
    onLoad (option) {

    },
    onPullDownRefresh () {

    }
  }
</script>

