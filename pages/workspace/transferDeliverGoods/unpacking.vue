<template>
  <view class="unpacking">
    <view class="d-flex header" >
      <view class="col-6">箱号：{{boxCode}}</view>
      <view class="col-6">货品种类：{{skuList.length}}</view>
    </view>

    <view class="goods">
      <view class="item" v-for="(item,index) in skuList">
        <view class="d-flex">
          <view>
            <image :src="setImgPathOld(item.imageGroupId)" :mode="'aspectFit'" style="width: 60px;height: 60px;"  />
          </view>
          <view style="margin-left: 10px;margin-top: -4px;">
            <view class="d-flex">
              <view class="item-label">SKU:</view>
              <view>{{item.goodsSku}}</view>
            </view>
            <view class="d-flex">
              <view class="item-label">装箱数量:</view>
              <view>{{item.boxNumber}}</view>
            </view>
            <view class="d-flex">
              <view class="item-label">名称:</view>
              <view>{{item.productName}}</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <u-modal v-model="show" @confirm="confirm" show-cancel-button  content="拆箱后会删除箱子并将箱内SKU及数量返回到未装箱列表"></u-modal>
    <view class="bottomBit d-flex justify-content-center align-items-center">
      <button type="primary" style="background-color: #ff9500!important;color: #ffffff" size="mini"  @click="unpackingHandel">拆箱</button>
    </view>
  </view>
</template>

<script>
import Mixin from '@/mixin/common_mixin';
import api from "@/api/api";

export default {
  name: "unpacking",
  mixins: [Mixin],
  data() {
    return {
      show: false,
      appropriationTransitplanDeliveryId: '',
      skuList: [],
      boxCode: '',
    };
  },
  created() {

  },
  props: {},
  watch: {},
  onLoad (option) {
    if (option) {
      this.transitBoxId = option.transitBoxId
      this.appropriationTransitplanDeliveryId = option.appropriationTransitplanDeliveryId
      this.getBoxDetail();
    }
  },
  methods: {
    getBoxDetail () {
      let v = this;
      const obj = {
        url: api.post_transitplanDelivery_getBoxDetail,
        data: {
          transitBoxId: v.transitBoxId
        }
      }
      v.ajaxData(obj).then(response=>{
        if (response.data.code === 0) {
          v.skuList = response.data.datas;
          v.boxCode = v.skuList[0].boxCode;
        }
      })
    },
    unpackingHandel () {
        this.show = true
    },
    confirm () {
      let v = this;
      const obj = {
        url: api.post_transitplanDelivery_delBox,
        data: {
          transitBoxId: v.transitBoxId
        }
      }
      v.ajaxData(obj).then(response=>{
        if (response.data.code === 0) {
          v.showToast('操作成功');
          uni.navigateBack();
        } else {
          v.showToast(response.data.message)
        }
      })
    }
  }
};
</script>

<style scoped lang="less">
.unpacking {
  .header {
    padding: 10px 5px;
    font-size: 16px;
    background-color: #ffffff;
  }
  .form {
    background-color: #ffffff;
    padding: 6px 5px;
    .form-item {
      margin-bottom: 10px;
    }
    .form-item:last-child{
      margin-bottom: 0px;
    }
    .form-item-label {
      font-size: 11px;
      white-space: nowrap;
      width: 80px;
      flex: 0 0 80px;
    }
    .form-content {
      width: 100%;
      border: 1px solid #ddd;
      input {
        text-indent: 5px;
      }
    }
  }
  .goods {
    margin-top: 10px;
    padding-bottom: 60px;
    .item {
      padding: 10px;
      background-color: #ffffff;
      margin-bottom: 10px;
    }
    .item-label {
      padding-right: 10px;
      white-space: nowrap;
    }
  }

}
</style>
