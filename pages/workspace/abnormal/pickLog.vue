<template >
  <view class="pick-box">
    <view class="pickingItem" v-for="(details,j) in list" :key="j">
      <view class="d-flex justify-content-between pickingHead">
        <text class="phTitle">补拣出库单号：{{details.detailRelateRsList[0].packageCode}}</text>
      </view>
      <view class="mu-divider"></view>
      <view class="pickingItemContent"  v-for="(item,index) in details.detailRelateRsList" :key="index">
        <view class="img-box">
          <image class="img-item" mode="aspectFit" :src="setImgPath(item.goodsUrl)"/>
        </view>
        <view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">SKU：</text>
            <text>{{item.goodsSku}}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">货品：</text>
            <text>{{item.goodsCnDesc}}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">货位：</text>
            <text>{{item.warehouseLocationCode}}</text>
          </view>
          <view class="d-flex justify-content-start pItem" >
            <view>补拣数量：{{item.expectPickingNumber}}</view>
            <view class="jg">|</view>
            <view>已处理：{{item.donePickingNumber}}</view>
          </view>
        </view>
        <view class="goToPicking">
          <text style="color: green" v-if="item.expectPickingNumber === item.donePickingNumber">完成</text>
        </view>
      </view>
      <view class="bottomBit  d-flex justify-content-center align-items-center">
        <button type="primary"
                size="mini"
                @click="submitResult">
          <text>提交补拣结果</text>
        </button>
      </view>
    </view>
  </view>
</template >

<script >
import api from '@/api/api';
import Mixin from '@/mixin/common_mixin';

export default {
  name: 'pickLog',
  mixins: [Mixin],
  data () {
    return {
      list: null
    };
  },
  created () {

  },
  onShow () {
    this.getPickDetails();
  },
  props: {},
  watch: {},
  methods: {
    submitResult () {
      /**
       * @Description: 提交补拣记录
       * @author gan
       * @date: 2020/9/25 15:41
       * @params:
      */
      let v = this;
      const obj = {
        url: api.appSubmitSupplementResult + v.store.state.supplementPickingId,
        type: 'POST'
      }
      v.ajaxData(obj).then(response=>{
        if (response.data.code === 0) {
          v.showToastIcon('操作成功');
          setTimeout(()=>{
            uni.navigateBack({
              delta: 2
            })
          },300)
        } else {
          v.showToast(response.data.message);
        }

      })
    },
    getPickDetails () {
      /**
       * @Description: 补拣单获取包裹库位级别的详情
       * @author gan
       * @date: 2020/9/9 19:47
       * @params: 442889532267036709
      */
      let v = this;
      const obj = {
        url: api.queryPackageSupplementPickingDetail,
        type: 'POST',
        data: [v.store.state.supplementPickingId]
      }
      v.ajaxData(obj).then(response=>{
        if (response.data.code === 0) {
           v.list = response.data.datas;
        }
      })
    }
  }
};
</script >

<style >
.bottomBit span {
  color: #fff;
}
</style >
<style scoped >
  .pick-box {
    padding-bottom: 100px;
  }
  .img-box {
    width: 120rpx;
    padding: 10rpx;
    flex-shrink: 0;
  }
  .img-box .img-item {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .pickingItem {
    margin-bottom: 15px;
  }
  .goToPicking {
    position: absolute;
    right: 20upx;
    top: 30%;
    z-index: 1;
    font-size: 30upx;
    color: #333333;
    background-color: rgba(255,255,255,0.6);
  }
  .pickingHead {
    font-size: 28rpx;
    padding: 20rpx;
    background-color: #fff;
  }
  .phTitle {
    font-weight: bold;
  }
  .pickingItemContent {
    background-color: #fff;
    font-size: 12px;
    padding: 5px 10px;
    position: relative;
    display: flex;
    border-bottom: 1px solid #dddddd;
  }
  .pickingItemContent .jg {
    padding: 0 5px;
  }
  .pItemTitle {
    white-space: nowrap;
  }
</style >
