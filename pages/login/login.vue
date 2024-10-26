<template>
  <view class="login-container-page page-main">
    <view class="page-main__container">
      <view class="page-main__container__main">
        <view class="login_logoInfo">
          <view class="login_logoInfo__main">
            <view class="login_cover-image"></view>
            <text>欢迎登录</text>
          </view>
        </view>
        <view class="login_main">
          <u-form :model="form" ref="uForm" class="login_form" :error-type="['toast']">
            <u-form-item label="" prop="username">
              <u-input v-model="form.username" placeholder="请输入用户名" trim :focus="true" />
              <text class="right-content" v-if="!form.username.includes('@')">@lapa.com</text>
            </u-form-item>
            <u-form-item label="" prop="password">
              <u-input v-model="form.password" type="password" placeholder="请输入密码" trim />
            </u-form-item>
            <u-button @tap="submit" :loading="loading" :ripple="true" type="primary" class="login_btn">登录</u-button>
          </u-form>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import config from '@/config/config';
import { getStorage } from '@/utils';
import refreshPageToken from '@/utils/refreshPageToken';
export default {
  name: 'Login',
  data () {
    return {
      form: {
        username: '',
        password: '',
        // username: 'xyh@163.com',
        // password: 'ceshi111',
      },
      rules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: ['blur'],
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: ['blur'],
          }
        ]
      },
      loading: false,
    };
  },
  methods: {
    submit () {
      this.$refs.uForm.validate(valid => {
        if (!valid) return;
        let temp = this.handleParams();
        // let params = {};
        // params.url = config.prefixAuth + '/dyt-cloud-auth-admin/common/token';// 请求token
        // params.type = 'POST';// 请求方式
        // params.data = temp;
        this.loading = true;
        // refreshPageToken.ajaxRequest(params).then((data) => {
        refreshPageToken.goLogin(temp).then((data) => {
          // 存储登宇通token
          refreshPageToken.tokenHand(data || {}, {
            info: temp
          }).then(() => {
            // 根据token拿到通途ticket 
            refreshPageToken.getTicket().then((res) => {
              refreshPageToken.getTongtuToken(res).then((res) => {
                refreshPageToken.againRefresh();
                refreshPageToken.setErpConfig();
                // return;
                uni.showToast({
                  icon: 'none',
                  title: '登录成功',
                  duration: 1000,
                });
                let pages = getCurrentPages(); //当前页面栈
                // 大于1，说明从别的页面跳转过来
                if (pages > 1) {
                  history.back();
                } else {
                  // 否则跳回首页
                  uni.switchTab({
                    url: '/pages/index/index'
                  });
                }
              }).finally(() => {
                this.loading = false;
              }).catch(err => {
                refreshPageToken.removeInfo(true);
              })
            }).catch(err => {
              this.loading = false;
              refreshPageToken.removeInfo(true);
            })
          })
        }).catch(err => {
          this.loading = false;
        })
      });
    },
    // 准备传参
    handleParams () {
      let formData = JSON.parse(JSON.stringify(this.form));
      const newVal = formData.username.split('@');
      if (newVal.length === 1 || (newVal.length === 2 && newVal[1].length === 0)) {
        formData.username = `${newVal[0]}@lapa.com`;
      }
      const reqParams = refreshPageToken.encryption({
        data: {
          password: formData.password
        },
        key: 'auths.dyt.com.hk',
        param: ['password']
      });
      return { ...reqParams, username: formData.username }
    },
  },
  // 必须要在onReady生命周期，因为onLoad生命周期组件可能尚未创建完毕
  onReady () {
    this.$refs.uForm.setRules(this.rules);
  },
  onLoad () {
    // 处于登录页面存在token信息时应跳过该页面
    let authTokenInfo = getStorage(config.DBKey);
    if (!authTokenInfo || authTokenInfo == '{}') return;
    uni.switchTab({
      url: '/pages/index/index'
    });
  },
};
</script>
<style lang="less">
.page-main {
  height: 100vh;
  background-color: #fff;
  .page-main__container {
    height: inherit;
    .page-main__container__main {
      height: inherit;
      position: relative;
    }
    .right-content {
      padding-left: 20rpx;
    }
  }
  .login_main {
    position: absolute;
    top: 376rpx;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    min-height: 300rpx;
    background-color: #fff;
    border-radius: 40rpx 40rpx 0 0;
    .login_form {
      height: 100%;
      padding: 0 80rpx;
    }
    .login_btn {
      margin-top: 60rpx;
      border-color: #409eff;
      background-color: #409eff;
    }
  }
  .login_logoInfo {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 416rpx;
    background-image: url("@/static/img/login/login_back.png");
    background-repeat: no-repeat;
    background-position: 50%;
    background-size: cover;
    .login_logoInfo__main {
      width: 100%;
      height: inherit;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: 80rpx;
      color: #fff;
      font-size: 32rpx;
      .login_cover-image {
        width: 112rpx;
        height: 44rpx;
        background-image: url("@/static/img/login/lapa_logo.png");
        background-repeat: no-repeat;
        background-position: 50%;
        background-size: cover;
        margin-bottom: 40rpx;
      }
    }
  }
}
</style>