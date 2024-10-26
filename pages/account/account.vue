<template>
  <view>
    <view :class="accountHeader">
      <view class="row no-gutters">
        <view class="col col-3">
          <image :src="userImg" class="accountUserImg"></image>
        </view>
        <view class="col col-5">
          <view class="iconImg">
            <view>{{userDetails.userName}}</view>
            <view class="iconImgTop d-flex" v-if="userDetails.mobile">
              <i class="icon iconfont topPhone">
                &#xe643;
              </i>
              <view class="accountLen">
                {{userDetails.mobile}}
              </view>
            </view>
          </view>
        </view>
        <view class="col col-4">
          <view style="display:flex;align-items: center;text-align: right;height: 100%;justify-content:right">
            <button :size="defaultSize" @click="openEditView">修改密码</button>
          </view>
        </view>
      </view>
    </view>
    <uni-section title="用户信息" type="line"></uni-section>
    <uni-list>
      <uni-list-item v-for="(item,index) in userListInfo" :key="index" :thumb="item.thumb" :show-arrow="false" @click="userListClickMt(item.value)" :title="item.title">
        <template v-slot:right="">
          <span class="color-666" v-if="item.value === 0">{{merchant.merchantId}}</span>
          <span class="color-666" v-else-if="item.value === 1">{{merchant.corporationName}}</span>
          <span class="color-666" v-else-if="item.value === 2">{{userDetails.email}}</span>
          <span class="color-666" v-else-if="item.value === 3">{{coupons}}</span>
          <span class="color-666" v-else-if="item.value === 4">{{billNum}}</span>
          <span class="color-666" v-else-if="item.value === 5">{{merchant.accountBalance}}</span>
          <span class="color-666" v-else-if="item.value === 6">{{merchant.customerManager !== '' ? merchant.customerManager.customerManagerName : ''}}<i class="icon iconfont phone-icon">&#xe792;</i></span>
        </template>
      </uni-list-item>
    </uni-list>
    <uni-section class="uni-mt10" title="APP配置" type="line"></uni-section>
    <uni-list>
      <uni-list-item v-for="(item,index) in appSetting" :key="index" :title="item.title" :thumb="item.thumb" @click="goAppSetting(item.value)">
        <template v-slot:right="">
          <span class="color-666">{{item.rightText}}</span>
        </template>
      </uni-list-item>
    </uni-list>
    <uni-section class="uni-mt10" title="拣货设置" type="line"></uni-section>
    <uni-list>
      <uni-list-item :show-switch="true" :show-arrow="false" :disabled="!getPermission('app_modify_picking_settings')" title="是否使用拣货篮" :switchChecked="settingsConfigObj.useBasket === '1'" thumb="../../static/img/account/8.png" @switchChange="setType('useBasket',$event)" />
      <uni-list-item :show-switch="true" :show-arrow="false" :disabled="!getPermission('app_modify_picking_settings')" :switchChecked="settingsConfigObj.checkCargo === '1'" title="是否校验库位" thumb="../../static/img/account/9.png" @switchChange="setType('checkCargo',$event)" />
      <uni-list-item title="扫描模式" :disabled="!getPermission('app_modify_picking_settings')" thumb="../../static/img/account/11.png" @click="goScanSetting">
        <template v-slot:right="">
          <span class="color-666">{{scanRightText}}</span>
        </template>
      </uni-list-item>
      <uni-list-item :show-switch="true" :show-arrow="false" title="是否显示单据信息" :disabled="!getPermission('app_modify_picking_settings')" :switchChecked="settingsConfigObj.showNum === '1'" thumb="../../static/img/account/13.png" @switchChange="setType('showNum',$event);" />
      <uni-list-item :show-switch="true" :show-arrow="false" :disabled="!getPermission('app_modify_picking_settings')" title="是否允许多领单" :switchChecked="settingsConfigObj.allowMultiPick === '1'" thumb="../../static/img/account/14.png" @switchChange="setType('allowMultiPick',$event);" />
      <uni-list-item :show-switch="true" :show-arrow="false" title="自动标记已打包" :switchChecked="settingsConfigObj.autoMarkPackaged === '1'" thumb="../../static/img/account/16.png" @switchChange="setType('autoMarkPackaged',$event);" />
    </uni-list>
    <button type="warn" class="mt20 out-btn" @click="logout">退出登录</button>

    <view class="d-flex justify-content-center text-14 normalPadding">
      <text class="blue-color" @click="gotoPage('/pages/index/service')">用户协议</text>
      <text style="margin: 0 20upx">|</text>
      <text class="blue-color" @click="gotoPage('/pages/index/privacy')">隐私政策</text>
      <text style="margin: 0 20upx">|</text>
      <text class="blue-color" @click="checkUpdate(2)">检查更新</text>
    </view>
    <view class="d-flex justify-content-center text-10 normalPadding">
      版本号 {{version}}
    </view>
    <min-modal ref="minModal">
      <view>
        当前有最新版本，是否去更新？
      </view>
    </min-modal>
  </view>
</template>
<script>
const prefixCls = 'tongtool-account'
import Mixin from '@/mixin/common_mixin'
import api from '@/api/api'
import config from '@/config/config'
import {
  setStorage,
  getStorage,
  removeStorage,
} from '@/utils'
import refreshPageToken from '@/utils/refreshPageToken';
export default {
  mixins: [Mixin],
  components: {
  },
  data () {
    let v = this;
    return {
      scanRightText: '', // 扫描模式 文字
      userListInfo: [{
        thumb: '../../static/img/account/1.png',
        title: '客户编码',
        value: 0
      }, {
        thumb: '../../static/img/account/2.png',
        title: '公司名称',
        value: 1
      }, {
        thumb: '../../static/img/account/12.png',
        title: '专属客服',
        value: 6
      }, {
        thumb: '../../static/img/account/3.png',
        title: '邮箱地址',
        value: 2
      }, {
        thumb: '../../static/img/account/4.png',
        title: '优惠券',
        value: 3
      }, {
        thumb: '../../static/img/account/5.png',
        title: '账单',
        value: 4
      }, {
        thumb: '../../static/img/account/6.png',
        title: '余额',
        value: 5
      }],
      appSetting: [{
        thumb: '../../static/img/account/10.png',
        title: 'APP版本',
        value: 0,
        rightText: ''
      }, {
        thumb: '../../static/img/account/7.png',
        title: 'ERP配置',
        value: 1,
        rightText: ''
      }, {
        thumb: '../../static/img/account/15.png',
        title: '输入框样式修改',
        value: 2,
        rightText: '默认样式'
      }],
      fileSizeString: 0,
      version: config.version,
      erpConfig: {
        newErp: false,
        oldErp: true
      },
      cb: '',
      coupons: '',
      billNum: '',
      showPage: false,
      settingsConfigObj: {
        checkCargo: '1',
        scanMode: '1',
        useBasket: '1',
        versionType: '1',
        showNum: '0',
        allowMultiPick: '0',
        autoMarkPackaged: '0'
      },
      defaultSize: 'mini',
      userImg: '../../static/img/accountBg.png',
      userDetails: {
        userName: '',
        email: '',
        mobile: ''
      },
      merchant: {
        accountBalance: '',
        merchantId: '',
        customerManager: '',
        corporationName: ''
      },
      url: 'http://download.tongtool.com/mobile/app/'
    }
  },
  computed: {
    account () {
      return `${prefixCls}`
    },
    accountHeader () {
      return `${prefixCls}-header`
    },
    bill () {
      return `${prefixCls}-bill`
    },
    userMes () {
      return `${prefixCls}-userMes`
    }
  },
  watch: {
    pageStatus (n, o) {
      let v = this
      if (n) {
        console.log('k--------------')
        this.getLoginInfo()
          .then(result => {
            if (result) {
              v.loadPage()
            }
          })
      }
    }
  },
  methods: {
    setErpConfig (data) {
      /**
       * @Description:设置ERP配置
       * @author gan
       * @date: 2020/12/14 11:22
       */
      let v = this;
      let userInfo = v.store.state.userInfo
      if (userInfo && userInfo.merchant.ierpStauts === '1') {
        // 设置默认值
        v.erpConfig.newErp = true;
        v.erpConfig.oldErp = false;
      }
      v.erpConfig = Object.assign({}, data);
      let text = '';
      if (v.erpConfig.newErp) {
        text = '新ERP配置'
      }
      if (v.erpConfig.oldErp) {
        if (text) {
          text += '和老ERP配置'
        } else {
          text = '老ERP配置'
        }
        v.getCoupons()
        v.getSettlements()
        v.checkUpdate(1)
      }
      v.appSetting.forEach(i => {
        if (i.value === 1) {
          i.rightText = text;
        }
      })
    },
    userListClickMt (type) {
      if (type === 6) {
        // 专属客服
        this.phoneCustomer();
      }
    },
    goScanSetting () {
      let data = JSON.stringify(this.settingsConfigObj);
      uni.navigateTo({
        url: '/pages/account/editScanningSetting?erpConfig=' + data
      })
    },
    goAppSetting (type) {
      if (type === 0) {
        // 编辑App版本设置
        let data = JSON.stringify(this.settingsConfigObj);
        uni.navigateTo({
          url: '/pages/account/editAppEditionSetting?erpConfig=' + data
        })
      } else if (type === 1) {
        // 编辑AppERP配置设置
        let data = JSON.stringify(this.erpConfig);
        uni.navigateTo({
          url: '/pages/account/editAppSetting?erpConfig=' + data
        })
      } else if (type === 2) {
        uni.navigateTo({
          url: '/pages/account/editAppThemeSetting'
        })
      }

    },
    setView () {
      // 赋值到页面
      let v = this;
      let text = '';
      if (v.settingsConfigObj.versionType === '1') {
        text = '手机版'
      } else if (v.settingsConfigObj.versionType === '2') {
        text = 'PDA'
      }
      v.appSetting.forEach(i => {
        if (i.value === 0) {
          i.rightText = text;
        }
      });
      if (v.settingsConfigObj.scanMode === '1') {
        v.scanRightText = '普通扫描'
      } else {
        v.scanRightText = '逐个扫描'
      }
    },
    getTheme () {
      this.themeList.forEach(i => {
        if (i.value === this.store.state.theme.inputStyle) {
          this.appSetting.forEach(j => {
            if (j.value === 2) {
              j.rightText = i.name
            }
          })
        }
      })
    },
    formatSize () {
      let v = this;
      window.plus && plus.cache.calculate(function (size) {
        let sizeCache = parseInt(size);
        console.log('size:', sizeCache)
        if (sizeCache == 0) {
          v.fileSizeString = '0B';
        } else if (sizeCache < 1024) {
          v.fileSizeString = sizeCache + 'B'
        } else if (sizeCache < 1048576) {
          v.fileSizeString = (sizeCache / 1024).toFixed(2) + 'KB'
        } else if (sizeCache < 1073741824) {
          v.fileSizeString = (sizeCache / 1048576).toFixed(2) + 'MB'
        } else {
          v.fileSizeString = (sizeCache / 1073741824).toFixed(2) + 'GB'
        }
        console.log('f:', v.fileSizeString)
      })

    },
    checkUpdate (value) {
      let v = this
      let version = config.versionNum
      let sys = uni.getSystemInfoSync().system.toLocaleLowerCase()
      let typeSys
      if (sys.includes('ios')) {
        typeSys = 'ios'
      } else {
        typeSys = 'android'
      }
      const obj = {
        url: api.get_newVersion,
        type: 'post',
        data: {
          type: typeSys
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            let newVersion = response.data.datas.newVersion
            debugger
            if (Number(version) < newVersion && typeSys === 'android') {
              v.$refs.minModal.handleShow({
                title: '提示',
                actions: [{
                  name: '关闭'
                }, {
                  name: '去更新'
                }],
                success: (res) => {
                  switch (res.id) {
                    // 代表选项一按钮
                    case 0:
                      // v.outApp()
                      break
                    // 代表选项二按钮
                    case 1:
                      window.plus && plus.runtime.openURL(response.data.datas.updateUrl, function (res) {

                      })
                      break
                  }
                }
              })
            } else if (Number(version) < newVersion && typeSys === 'ios') {
              v.$refs.minModal.handleShow({
                title: '提示',
                actions: [{
                  name: '关闭'
                }, {
                  name: '去更新'
                }],
                success: (res) => {
                  switch (res.id) {
                    // 代表选项一按钮
                    case 0:
                      // v.outApp()
                      break
                    // 代表选项二按钮
                    case 1:
                      window.plus && plus.runtime.openURL('https://apps.apple.com/us/app/%E6%8E%8C%E4%B8%8A%E9%80%9A%E9%80%94/id1397364901?l=zh&ls=1', function (res) {

                      })
                      break
                  }
                }
              })
            } else {
              if (value === 2) {
                uni.showToast({
                  icon: 'none',
                  title: '暂无更新'
                })
              }
            }
          }
        })
    },
    setType (uType, value) {
      let v = this
      v.settingsConfigObj[uType] = value.value ? '1' : '0';
      v.$nextTick(function () {
        v.setSettingConfigData()
      })
    },
    openEditView () {
      uni.navigateTo({
        url: '/pages/account/editPassword'
      })
    },
    getVersionTypeValue (value) {
      this.setSettingConfigData()
    },
    getCheckCargoTypeValue (value) {
      this.setSettingConfigData()
    },
    getScanModeTypeValue (value) {
      this.setSettingConfigData()
    },
    getUseBasketTypeValue (value) {
      this.setSettingConfigData()
    },
    setSettingConfigData () {
      let v = this;
      setStorage('settingsConfigObj', v.settingsConfigObj)
      let obj = {
        url: api.set_settingConfig,
        data: v.settingsConfigObj
      }
      v.ajaxData(obj)
        .then(response => {
          console.log('r:', response)
        })
    },
    loadPage () {
      let v = this
      let userInfo = v.store.state.userInfo;
      return new Promise(resolve => {
        if (!userInfo) {
          v.getLoginInfo()
            .then(result => {
              if (result) {
                let userInfo = v.store.state.userInfo
                v.userDetails = userInfo.user
                v.merchant = userInfo.merchant
                v.merchant.accountBalance = Number(v.merchant.accountBalance).toFixed(2);
                resolve();
              }
            })
        } else {
          v.userDetails = userInfo.user
          v.merchant = userInfo.merchant
          v.merchant.accountBalance = Number(v.merchant.accountBalance).toFixed(2)
          resolve();
        }
      })

    },
    getCoupons () {
      let v = this
      const obj = {
        url: api.get_coupons,
        type: 'GET'
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            v.coupons = response.data.others.couponTotal
          }
        })
    },
    getSettlements () {
      let v = this
      const obj = {
        url: api.get_settlements,
        type: 'POST',
        data: {
          fromDate: '',
          toDate: ''
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            v.billNum = response.data.others.unpaidNum
          }
        })
    },
    phoneCustomer (num) {
      let v = this;
      if (!v.store.state.isLogin) {
        v.login()
        return false
      }
      uni.makePhoneCall({
        phoneNumber: v.merchant.customerManager.mobile
      })
    },
    logout () {
      let v = this
      uni.showModal({
        title: '提示',
        content: '退出登录？',
        success: function (res) {
          if (res.confirm) {
            uni.showLoading({
              title: '退出登录中，请稍等',
              mask: true
            })
            setTimeout(() => {
              uni.hideLoading()
              refreshPageToken.removeInfo();
            }, 500)
            return;
            const obj = {
              url: api.set_logout + '?token=' + getStorage('token'),
              data: {
                token: getStorage('token')
              }
            }
            v.ajaxData(obj)
              .then(response => {
                removeStorage('settingsConfigObj')
                removeStorage('token')
                removeStorage('warehouseList')
                removeStorage('inventorQuery')
                removeStorage('newErpWarehouseList')
                removeStorage('inventorQueryVerification')
                removeStorage('cargoSpaceTransfer')
                v.store.commit('userInfo', null)
                v.store.commit('isLogin', false)
                refreshPageToken.removeInfo();
                uni.hideLoading()
                v.$nextTick(function () {
                  uni.redirectTo({
                    url: '/pages/index/logout' + '?url=' + response.data.others.logOutUrl
                  })
                })
              })
          }
        }
      })
    },
    getSettingConfigData () {
      let v = this
      const obj = {
        url: api.get_settingConfig,
        type: 'GET'
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            v.$nextTick(function () {
              let data = response.data.datas
              if (data.versionType && (data.versionType !== '1' || data.versionType !== '2')) {
                for (let key in response.data.datas) {
                  if (response.data.datas[key] === null) {
                    response.data.datas[key] = '0'
                  }
                }
                v.settingsConfigObj = Object.assign({}, response.data.datas);
                v.setView(); // 赋值到页面
              }
              setStorage('settingsConfigObj', v.settingsConfigObj)
            })
          }
        })
    },
    changeErpConfig (e) {
      let v = this
      let arr = e.detail.value
      if (arr.includes('1')) {
        v.erpConfig.newErp = true
      } else {
        v.erpConfig.newErp = false
      }
      if (arr.includes('2')) {
        v.erpConfig.oldErp = true
      } else {
        v.erpConfig.oldErp = false
      }
      setStorage('erpConfig', v.erpConfig)
      const obj = {
        url: api.set_erpConfig,
        data: v.erpConfig
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            console.log('ok')
          }
        })
    }
  },
  onLoad () {
    let v = this
    v.formatSize()
    v.loadPage()
    uni.showLoading()
  },
  onShow () {
    let v = this

    v.getTheme();
    let login = v.store.state.isLogin;
    //#ifdef H5
    if (getStorage('token')) {
      v.getLoginInfo().then(() => {
        v.loadPage().then(() => {
          v.getErpConfig().then((data) => {
            if (data.newErp && data.oldErp) {
              v.getSinglePageRoleCommon('pda_account', '3.0').then(() => {
                v.getOldErpSinglePageAuth('pda_account')
              })
            } else {
              if (data.newErp) {
                v.getSinglePageRoleCommon('pda_account', '3.0')
              } else {
                v.getSinglePageRoleCommon('pda_account', '2.0')
              }
            }
            v.setErpConfig(data);
          })
        })
      });
      v.getSettingConfigData()
    } else {
      v.coupons = '';
      v.billNume = '';
      v.showPage = false;
      v.settingsConfigObj = {
        checkCargo: '1',
        scanMode: '1',
        useBasket: '1',
        versionType: '1'
      };
      v.userImg = '../../static/img/accountBg.png';
      v.userDetails = {
        uesr: '',
        email: '',
        mobile: ''
      };
      v.merchant = {
        accountBalance: '',
        merchantId: '',
        customerManager: '',
        corporationName: ''
      }
      v.login()
    }
    return
    //#endif
    if (!login) {
      v.coupons = '';
      v.billNume = '';
      v.showPage = false;
      v.settingsConfigObj = {
        checkCargo: '1',
        scanMode: '1',
        useBasket: '1',
        versionType: '1'
      };
      v.userImg = '../../static/img/accountBg.png';
      v.userDetails = {
        uesr: '',
        email: '',
        mobile: ''
      };
      v.merchant = {
        accountBalance: '',
        merchantId: '',
        customerManager: '',
        corporationName: ''
      }
      v.login()
    } else {

      v.getLoginInfo().then(() => {
        v.loadPage().then(() => {
          v.getErpConfig().then((data) => {
            if (data.newErp && data.oldErp) {
              v.getSinglePageRoleCommon('pda_account', '3.0').then(() => {
                v.getOldErpSinglePageAuth('pda_account')
              })
            } else {
              if (data.newErp) {
                v.getSinglePageRoleCommon('pda_account', '3.0')
              } else {
                v.getSinglePageRoleCommon('pda_account', '2.0')
              }
            }
            v.setErpConfig(data);
          })
        })
      });
      v.getSettingConfigData()



    }
  },
  onReady () {
    let v = this
    v.showPage = true
    uni.hideLoading()
  }
}
</script>
<style scoped>
.out-btn {
  margin: 10px;
}
</style >
