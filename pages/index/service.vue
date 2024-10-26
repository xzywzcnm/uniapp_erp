<template>
	<view class="privacyWrap">
		<view class="d-flex justify-content-center align-items-center logoImg">
      <img src="../../static/logo.png" mode="">
    </view>
    <view class="d-flex justify-content-center align-items-center grayFont">
      欢迎使用
    </view>
    <view class="d-flex justify-content-center align-items-center title">
      掌上LAPA
    </view>
    <view class="scrollWrap">
      <scroll-view class="scroll-view_H" scroll-x="true" @scroll="scroll" scroll-left="120">
        <text class="text-18">用户协议</text>
        <view class="text-16 normal-margin-top">在使用本软件注册的时候，我们会收集一些相关的个人信息，而这些信息在您的保存后会存入我们的服务器，上述数据会在中华人民共和国国境内保存。</view>
        <view class="text-16 normal-margin-top">本应用在退出后，不会在后台中执行，也不会收集额外的其他信息</view>
        <view class="text-16 normal-margin-top">在使用本应用过程中，我们将在您授权后使用相机权限执行相关功能操作， 在联系客服的时候，我们会使用电话相关的权限。</view>
        <view class="text-16 normal-margin-top">如果您不同意相关权限，可以卸载本应用或在个人设置-APP相关权限操作中，屏蔽本应用权限</view>
      </scroll-view>
    </view>
	</view>
</template>

<script>
  import {
  	setStorage,
    getStorage
  } from '@/utils'
  import Mixin from '@/mixin/common_mixin'
	export default {
    mixins: [Mixin],
		data() {
			return {}
		}
	}
</script>

<style lang="less">
 .privacyWrap {
   & .logoImg {
     margin-top: 30upx;
     & img {
       width: 140upx;
       height: 140upx;
       border-radius: 4upx;
     }
   }
   & .grayFont {
     margin-top: 20upx;
     font-size: 24upx;
     color: #666666;
   }
   & .title {
     margin-top: 20upx;
     font-size: 48upx;
   }
   & .scrollWrap {
     margin: 20upx;
     & .privacyText {
       & text {
         color: ;
       }
     } 
   }
 }
</style>
