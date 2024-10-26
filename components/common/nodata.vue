<template>
  <view>
    <view  class="d-flex justify-content-center align-items-center">
      <image src="/static/noData.png" class="no-data"></image>
    </view>
    <view class="text-center no-data-text">{{text}}</view>
  </view>
</template>

<script>
    export default {
        name: "nodata",
        data() {
            return {};
        },
        created() {

        },
        props: {
            text: {
                type: String,
                default: '暂无数据'
            }
        },
        watch: {},
        methods: {}
    }
</script>

<style scoped>
.no-data{
  width: 600rpx;
  height: 600rpx;
}
  .no-data-text {
    text-align: center;
    color: #666666;
    margin-top: -66px;
  }
</style>
