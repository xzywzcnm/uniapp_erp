<template>
	<view :class="formWrap">
    <form @submit="formSubmit" @reset="formReset">
      <view class="formItem">
        <view class="title">原始密码</view>
        <input class="formInput" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" v-model.trim="passwordObj.oldPassword" :password='pwOranginalStatus' name="input" placeholder="请输入原始密码" />
        <i class="icon iconfont eyes" @click="showOranginPassword">
          <text v-if="showOranginPasswordTxt === 'visibility'">&#xe608;</text>
          <text v-else>&#xe619;</text>
        </i>
      </view>
      <view class="formItem">
        <view class="title">新密码</view>
        <input class="formInput" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" v-model.trim="passwordObj.newPassword" :password='pwStatus' name="input" placeholder="请输入新密码" />
        <i class="icon iconfont eyes" @click="showPassword">
          <text v-if="showPasswordTxt === 'visibility'">&#xe608;</text>
          <text v-else>&#xe619;</text>
        </i>
      </view>
      <view class="saveButton d-flex">
        <sevenButton type="primary" class="buttonFlex" long @click="savePassword">保存</sevenButton>
      </view>
    </form>
	</view>
</template>

<script>
  import api from '@/api/api'
  import Mixin from '@/mixin/common_mixin'
  const prefixCls = 'tongtool-account-password'
	export default {
    mixins: [Mixin],
    components: {},
		data() {
			return {
        pwStatus: true,
        pwOranginalStatus: true,
				showPasswordTxt: 'visibility',
        showOranginPasswordTxt: 'visibility',
        passwordObj: {
          oldPassword: null,
          newPassword: null
        }
			}
		},
    methods: {
      formSubmit (e) {
        console.log('form发生了submit事件，携带数据为：' + JSON.stringify(e.detail.value))
      },
      formReset () {
        console.log('form发生了reset事件')
      },
      showPassword () {
        if (this.showPasswordTxt === 'visibility') {
          this.pwStatus = false
          this.showPasswordTxt = 'visibility_off'
        } else {
          this.pwStatus = true
          this.showPasswordTxt = 'visibility'
        }
      },
      showOranginPassword () {
        if (this.showOranginPasswordTxt === 'visibility') {
          this.pwOranginalStatus = false
          this.showOranginPasswordTxt = 'visibility_off'
        } else {
          this.pwOranginalStatus = true
          this.showOranginPasswordTxt = 'visibility'
        }
      },
      savePassword () {
        let v = this
        if (!v.passwordObj.oldPassword || v.passwordObj.oldPassword === '') {
          uni.showToast({
          	icon: 'none',
            title: '旧密码不能为空',
            duration: 1500
          })
          return false
        } else if (!v.passwordObj.newPassword || v.passwordObj.newPassword === '') {
          uni.showToast({
          	icon: 'none',
            title: '新密码不能为空',
            duration: 1500
          })
          return false
        }
        const obj = {
          url: api.change_password,
          data: {
            newPassword: v.passwordObj.newPassword,
            newPassword2: v.passwordObj.newPassword,
            oldPassword: v.passwordObj.oldPassword
          }
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              uni.showToast({
                title: '密码修改成功',
                duration: 1500
              })
              setTimeout(function () {
                uni.navigateBack()
              }, 500)
            } else {
              uni.showToast({
                title: '密码修改失败',
                duration: 1500
              })
            }
          })
        console.log(33232)
      }
    },
    computed: {
      formWrap () {
        return `${prefixCls}`
      }
    }
	}
</script>
