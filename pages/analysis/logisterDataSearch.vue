<template>
	<view>
    <web-view :src="loadPage" @message="getMessage"></web-view>
	</view>
</template>

<script>
  import {
    setStorage,
    getStorage
  } from '@/utils'
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
    methods: {
      getMessage () {
        
      }
    },
    onLoad (option) {
      let prefix
      // #ifdef APP-PLUS
         prefix  = '/hybrid/html/index.html#/'
      // #endif
      // #ifndef APP-PLUS
         prefix = config.prefixDomain + '/htApp/index.html#/'
         // 'http://10.0.0.95:8080/htApp/index.html#/'
      // #endif
      console.log(prefix)
      this.loadPage = prefix + 'logisterDataSearch?carrierId=' + option.carrierId + '&startTime='+ option.startTime + '&endTime=' + option.endTime + 
'&token=' + getStorage('token')
      console.log(this.loadPage)
      uni.showLoading({
        title: '加载中'
      })
    },
    onShow () {
      let v = this
      let login = v.store.state.isLogin
      if (!login) {
        v.login()
      }
    },
    onReady () {
      setTimeout(function () {
        uni.hideLoading()
      }, 2000)
    }
	}
</script>


