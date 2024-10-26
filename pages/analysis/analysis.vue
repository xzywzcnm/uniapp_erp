<template>
	<view>
		<view v-if="!loginStatus && count > 0">
			<view class="flex-box flex-center mt20 text-12">请登录后再查阅分析数据</view>
			<view class="flex-box flex-center mt10"><button type="primary" size="mini" class="buttonWidth" @click="login">登录</button></view>
		</view>
		<view v-if="has_erp_version">
			<!-- #ifdef APP-PLUS -->
			<web-view v-if="isAdmin === '1'" :webview-styles="webViewStyle" :src="loadPage" @message="getMessage"></web-view>
			<!-- #endif -->
			<!-- #ifndef APP-PLUS -->
			<web-view v-if="isAdmin === '1'" :webview-styles="webViewStyle" :src="loadPage1" @message="getMessage"></web-view>
			<!-- #endif -->
		</view>
		<view v-else>{{ mes }}</view>
	</view>
</template>
<style lang="less">
@import '../../style/common/flex.less';

.buttonWidth {
	width: 60vw;
}
</style>
<script>
import { setStorage, getStorage } from '@/utils';
import Mixin from '@/mixin/common_mixin';
import config from '@/config/config';
export default {
	mixins: [Mixin],
	data() {
		return {
			loadPage1: config.prefixDomain + '/htApp/index.html#/analysis' + '?token=' + getStorage('token') + '&timestamp=' + new Date().getTime(),
			loadPage: '/hybrid/html/index.html#/analysis' + '?token=' + getStorage('token') + '&timestamp=' + new Date().getTime(),
			// loadPage: '/hybrid/html/test.html',
			webViewStyle: {
				progress: {
					color: '#FF3333'
				}
			},
			isAdmin: '0',
			has_erp_version: false,
			mes: '',
			count: 0,
			loginStatus: false
		};
	},
	onShow () {
		let v = this;
		let login = v.store.state.isLogin;
		v.loginStatus = login
		if (!login && v.count === 0) {
			v.count++;
			return;
		}
	},
	onLoad() {
		let v = this;
		let login = v.store.state.isLogin;
		v.loginStatus = login
		if (!login && v.count === 0) {
			v.login();
			v.count++;
			return;
		}
		uni.showLoading();
		v.getLoginInfo()
			.then(result => {
				if (result) {
					uni.hideLoading();
					let user = v.store.state.userInfo ? v.store.state.userInfo.user : '';
					let userInfo = v.store.state.userInfo;
					if (user) {
						v.isAdmin = user.isAdmin;
					}
					v.getErpConfig().then(data => {
						if (data.oldErp || (userInfo && userInfo.merchant && userInfo.merchant.merchantId === '000007')) {
							v.has_erp_version = true;
							v.getSinglePageRoleCommon('pda_analysis','2.0').then(() => {
								if (v.getPermission('app_view_analysis') && v.isAdmin === '1') {
									// #ifdef APP-PLUS
									v.loadPage = '/hybrid/html/index.html#/analysis' + '?token=' + getStorage('token') + '&timestamp=' + new Date().getTime();
									// #endif
									// #ifndef APP-PLUS
									v.loadPage1 = config.prefixDomain + '/htApp/index.html#/analysis' + '?token=' + getStorage('token') + '&timestamp=' + new Date().getTime();
									// http://10.0.0.95:8080/htApp
									// #endif
								} else {
									uni.showToast({
										title: '你没有权限查看当前页面',
										icon: 'none',
										duration: 3000
									});
								}
							});
						} else {
							v.mes = '正在开发中，敬请期待...';
							v.has_erp_version = false;
						}
					});
				}
			})
			.catch(error => {
				uni.hideLoading();
				v.mes = '正在开发中，敬请期待...';
				v.has_erp_version = false;
			});
	},
	onReady() {
		setTimeout(function() {
			uni.hideLoading();
		}, 2000);
	}
};
</script>
