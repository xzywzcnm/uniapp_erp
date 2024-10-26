<template>
  <view>
    <web-view :webview-styles="webviewStyles" :src="loadPage" @message="getMessage"></web-view>
  </view>
</template>

<script>
  import {
    setStorage,
    getStorage
  } from '@/utils'
  import api from '@/api/api'
  import Mixin from '@/mixin/common_mixin'
  import config from '@/config/config'
  export default {
    mixins: [Mixin],
    data() {
      return {
        loadPage: null,
        webviewStyles: {
          progress: {
            color: '#FF3333'
          }
        }
      }
    },
    watch: {
      loadPage(n, o) {
        console.log(n)
      }
    },
    methods: {
      webLoad(n) {
        console.log('~~')
        console.log(n)
      },
      getMessage(value) {
        let v = this
        uni.showLoading({
          title: '登录中...'
        })
        setStorage('token', value.detail.data[0].action)
        v.store.commit('isLogin', true)
      }
    },
    onLoad () {
      let pageArr = getCurrentPages();
      console.log(pageArr)
      if (pageArr.length > 0) {
        this.loadPage = getStorage('lookup').loginUrl + config.prefixDomain + '/htApp/ticket.html?page=' + pageArr[0].route
      }
      console.log(getCurrentPages())
    }
  }
</script>
