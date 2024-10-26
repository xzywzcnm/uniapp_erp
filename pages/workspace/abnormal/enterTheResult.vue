<template >
  <view>
    <view class="content-title">选择需处理的补拣记录</view>
    <view class="d-flex justify-content-between align-items-center pick-result" @click="gotoEnterResult">
      <view>
        <view class="title">qweqwqw</view>
        <view class="note">qweqwqw</view>
      </view>
      <view>
        <view class="icon iconfont arrow">&#xe636;</view>
      </view>
    </view>
  </view>
</template >

<script >
import api from '@/api/api';
import Mixin from '@/mixin/common_mixin'
export default {
  name: 'enterTheResult',
  mixins: [Mixin],
  data () {
    return {
      pickLog: [{
        title:'123',
        note:'12414241'
      }]
    };
  },
  components: {},
  created () {

  },
  props: {},
  watch: {},
  methods: {
    gotoEnterResult () {
        this.gotoPage('/pages/workspace/abnormal/enterResult')
    }
  }
};
</script >

<style scoped >
  .pick-result:last-child{
    border-bottom: 1px solid #ddd;
  }
  .pick-result {
    background-color: #ffffff;
    border-top: 1px solid #ddd;
    padding: 0 5px;
  }
  .pick-result .arrow {
    font-size: 24px;
  }
  .pick-result .title {
    color: #333333;
    font-size: 16px;
  }
  .pick-result .note {
    color: #999999;
  }
  .content-title {
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    padding: 0 10px 0 15px;
    height: 50px;
    position: relative;
    background-color: #f8f8f8;
    font-weight: 400;
  }
  .content-title:before {
    position: absolute;
    left: 5px;
    top: 16px;
    width: 2px;
    height: 20px;
    display: inline-block;
    content: '';
    background-color: #868686;
  }

  .uni-icon {
    font-family: uniicons;
    font-size: 24px;
    font-weight: normal;
    font-style: normal;
    width: 24px;
    height: 24px;
    line-height: 24px;
    color: #999999;
    margin-top: 2px;
  }
</style >
