<template>
    <view>
      <view class="normal-margin-top">
        <view class="uni-form-item uni-column">
          <view class="title">发货单号</view>
          <input class="uni-input" :class="{themeInput:theme.inputStyle ==='DarkBlue'}"
            focus
            v-model.trim="deliveryCode"
            placeholder="发货单号"/>
        </view>
        <view class="uni-form-item uni-column">
          <view class="title">shipmentID</view>
          <input class="uni-input" :class="{themeInput:theme.inputStyle ==='DarkBlue'}"
            v-model.trim="shipmentId"
            placeholder="shipmentID"/>
        </view>
        <view class="uni-form-item uni-column">
          <view class="title">箱号</view>
          <input class="uni-input" :class="{themeInput:theme.inputStyle ==='DarkBlue'}"
            v-model.trim="boxCode"
            placeholder="箱号"/>
        </view>
      </view>
      <view class="bottomBit">
        <view class="d-flex justify-content-center align-tiems: center">
          <button type="primary"
            size="mini"
            @click="search">
            <text>查询</text>
          </button>
        </view>
      </view>
    </view>
</template>

<script>
import Mixin from '@/mixin/common_mixin';

export default {
  name: "transferDeliverGoodsSearch",
  mixins: [Mixin],
  data() {
    return {
      searchKeyName: '',
      deliveryCode: '',
      shipmentId: '',
      boxCode : ''
    };
  },
  created() {

  },
  props: {},
  watch: {},
  methods: {
    search () {
      let v = this;
      uni.redirectTo({
        url: '/pages/workspace/transferDeliverGoods/list?deliveryCode=' + v.deliveryCode + '&shipmentId=' + v.shipmentId + '&boxCode=' + v.boxCode
      })
    }
  }
};
</script>

<style scoped>

</style>
