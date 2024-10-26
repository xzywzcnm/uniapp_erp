<template>
	<view>
    <web-view :src="loadPage"></web-view>
	</view>
</template>
<script>
  import {
    setStorage,
    getStorage
  } from '@/utils'
	export default {
		data () {
      return {
        loadPage: null,
        webViewStyle: {
          progress: {
            color: '#FF3333'
          }
        }
      }
    },
    onLoad (option) {
      this.loadPage = option.url
      uni.showLoading({
        title: '加载中'
      })
    },
    onReady () {
      setTimeout(function () {
        uni.hideLoading()
      }, 2000)
    }
	}
</script>


