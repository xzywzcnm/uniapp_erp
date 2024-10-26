<template>
	<view>
    <view class="uni-list chose-box" v-if="mergeList.length > 0">
      <checkbox-group @change="checkboxChange">
        <view class="ni-list-cell-pd list-item" v-for="item in mergeList" :key="item.value">
          <view class="receipt-text">
            {{item.receiptNo}}
          </view>
          <view v-for="it in item.children">
            <view class="d-flex child-box">
              <view class="item-checkbox">
                <checkbox :value="it.receiptBatchNo" :checked="it.checked" />
              </view>
              <view class="item-content-box">
                <view>批次号：{{it.receiptBatchNo}}</view>
                <view>收货库位：{{it.warehouseLocationName}}</view>
                <view>质检记录号：{{it.receiptBatchCheckNo}}</view>
                <view>良品：{{it.qcResult === 0 ? '良品' : '不良品'}}</view>
                <view class="d-flex justify-content-between align-content-center">
                  <view>需上架总数：{{Number(it.shelveStatus) + Number(it.waitShelveNumber)}}</view>
                  <view>已上架数：{{it.shelveStatus}}</view>
                  <view>待上架数：{{it.waitShelveNumber}}</view>
                </view>
              </view>
            </view>
            <view class="line"></view>
          </view>
        </view>
      </checkbox-group>
    </view>
    <view v-if="mergeList.length === 0">
      <nodata></nodata>
    </view>
    <view class="bottomBit" v-if="mergeList.length > 0">
      <view class="d-flex justify-content- align-items-center">
        <button class="fullButton" type="primary" @click="submitData">提交</button>
      </view>
    </view>
	</view>
</template>

<script>
  import nodata from '../../components/common/nodata';
	export default {
	  components: {
      nodata
    },
		data() {
			return {
          mergeList: [],
          choseValue: []
			}
		},
		methods: {
        submitData(e) {
          let v= this;
          this.mergeList.forEach(i=>{
              i.children.forEach(j=>{
                  if(v.choseValue.includes(j.receiptBatchNo)) {
                      j.checked = true
                  } else {
                      j.checked = false
                  }
              })
          });
          this.store.commit('choseOnShelf',this.mergeList);
          uni.navigateBack();
        },
        checkboxChange(e) {
            this.choseValue = e.detail.value;
        },
		},
     onShow() {
        this.mergeList = this.store.state.choseOnShelf || [];
         this.choseValue = [];
         this.mergeList.forEach(i=>{
            i.children.forEach(j=>{
                if (j.checked) this.choseValue.push(j.receiptBatchNo)
            })
        })
     },
	}
</script>
<style>

</style>
<style scoped>
  .bottom-button {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 10rpx;
  }
  .uni-list-cell {
    justify-content: flex-start
  }
  .chose-box {
    background-color: #EFEFF4;
    padding-bottom: 80rpx;
  }
  .chose-box .list-item {
    background-color: #ffffff;
    margin-bottom: 10rpx!important;
  }
  .item-content-box {
    width: 100%!important;
  }
  .chose-box .item-checkbox {
    margin-left: 10rpx!important;
    display: flex;
    align-items: center;
  }
  .receipt-text {
    padding: 15rpx;
    font-size: 30upx;
    color: #00acc1;
    border-bottom: 1px solid #888888;
  }
  .child-box {
    padding: 15rpx;
  }
  .chose-box .line {
    width: 680rpx;
    height: 1upx;
    background-color: #e5e5e5;
    margin: 0 auto;
  }
</style>
