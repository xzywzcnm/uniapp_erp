<template>
	<view>
    <web-view :src="loadPage"></web-view>
	</view>
</template>
<script>
  import config from '@/config/config'
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
      let link = config.prefixDomain + '/htApp/pageLogout.html'
      this.loadPage = option.url + '?u=' + encodeURIComponent(link)
      uni.showLoading({
        title: '退出登录中,请稍等'
      })
    },
    onReady () {
      setTimeout(function () {
        uni.hideLoading()
      }, 2000)
    }
	}
</script>


