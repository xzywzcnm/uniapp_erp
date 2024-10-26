<template>
    <view>
      <view class="normal-margin-top">
        <view class="uni-form-item uni-column" v-if="type === 'sku'">
          <view class="title">SKU</view>
          <input class="uni-input" :class="{themeInput:theme.inputStyle ==='DarkBlue'}"
            focus
            v-model.trim="searchKeyName"
            placeholder="SKU"/>
        </view>
        <view class="uni-form-item uni-column" v-if="type === 'box'">
          <view class="title">箱号</view>
          <input class="uni-input" :class="{themeInput:theme.inputStyle ==='DarkBlue'}"
            v-model.trim="searchKeyName"
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
      type: 'sku'
    };
  },
  created () {

  },
  onLoad (option) {
    if (option.type) {
        this.type = option.type;
        this.appropriationTransitplanDeliveryId = option.appropriationTransitplanDeliveryId;
    }
  },
  props: {},
  watch: {},
  methods: {
    search () {
      let params = ''
      if (this.type === 'sku') {
        params = '&sku=' + this.searchKeyName;
      } else {
        params = '&box=' + this.searchKeyName;
      }
      uni.redirectTo({
        url: '/pages/workspace/transferDeliverGoods/invoiceDetails?appropriationTransitplanDeliveryId=' + this.appropriationTransitplanDeliveryId + params
      })
    }
  }
};
</script>

<style scoped>

</style>
