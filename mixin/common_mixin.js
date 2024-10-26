let requestTask;
import { setStorage, getStorage, removeStorage } from '@/utils';
import api from '@/api/api';
import config from '@/config/config';
import refreshPageToken from '@/utils/refreshPageToken';
export default {
  data() {
    return {
      domWidth: uni.getSystemInfoSync().screenWidth,
      isAdminRole: this.store.state.isAdmin,
      userInfoList: [],
      themeList: [
        {
          value: 'default',
          name: '默认样式',
          checked: true
        },
        {
          value: 'DarkBlue',
          name: '墨蓝色框',
          checked: false
        }
      ],
      placeholderImg: require('@/static/placeholder.jpg') // 默认图
    };
  },
  computed: {
    isLogin() {
      return this.store.state.isLogin;
    },
    pageStatus() {
      // 页面刷新监测
      return this.store.state.pageStatus;
    },
    roleList() {
      // 权限
      return this.store.state.roleList;
    },
    newErpPrefix() {
      let prefix = getStorage('newErpPrefix');
      return prefix;
    },
    theme() {
      return this.store.state.theme;
    },
  },
  methods: {
    getPermission(name) {
      // 是否有权限
      let v = this;
      if (v.isAdminRole || v.roleList[name]) return true;
    },
    getErpConfig() {
      let v = this;
      const obj = {
        url: api.get_erpConfig,
        type: 'GET'
      };
      return new Promise((resolve) => {
        v.ajaxData(obj).then((response) => {
          if (response.data.code === 0) {
            if (response.data.datas) {
              setStorage('erpConfig', v.erpConfig);
              resolve(response.data.datas);
            }
          }
        });
      });
    },
    getOldErpSinglePageAuth(menuKey, oldErp = false) {
      let v = this;
      const obj = {
        url: api.get_queryAuthOldErpByMenu + '?authOperId=' + menuKey,
        type: 'get'
      };
      v.ajaxData(obj).then(response => {
        if (response.data.datas) {
          let data = data.data.datas.reduce((a, b) => {
            a[b] = true
            return a
          }, {})
          if (oldErp) {
            v.store.commit('roleList', data);
          } else {
            let role = v.store.state.roleList || {};
            v.store.commit('roleList', Object.assign(data, role));
          }
        }
      })
    },
    getSinglePageRoleCommon(menuKey, erpType = '3.0') {
      let v = this;
      return new Promise((resolve, reject) => {
        let obj
        if (erpType === '2.0') {
          obj = {
            url: api.get_queryAuthOldErpByMenu + '?authOperId=' + menuKey,
            type: 'get'
          };
        } else if (erpType === '3.0') {
          obj = {
            url: api.get_queryOperByMenu + menuKey + '?useCache=false',
            type: 'post'
          };
        }
        if (v.store.state.userInfo) {
          v.ajaxData(obj).then((response) => {
            if (response.data.code === 0) {
              let pos = {};
              let data = response.data.datas;
              if (data != null) {
                data.forEach((n, i) => {
                  let obj = { [n]: true };
                  Object.assign(pos, obj);
                });
              }
              v.store.commit('roleList', pos);
              resolve(true);
            }
          });
        } else {
          v.getLoginInfo().then(() => {
            v.ajaxData(obj).then((response) => {
              if (response.data.code === 0) {
                let pos = {};
                let data = response.data.datas;
                if (data != null) {
                  data.forEach((n, i) => {
                    let obj = { [n]: true };
                    Object.assign(pos, obj);
                  });
                }
                v.store.commit('roleList', pos);
                resolve(true);
              }
            });
          });
        }
      });
    },
    repeatArrayObject(arr, key) {
      let obj = {};
      return arr.reduce((i, n) => {
        if (!obj[n[key]]) {
          obj[n[key]] = true;
          i.push(n);
        }
        return i;
      }, []);
    },
    scrollTo(obj) {
      uni.pageScrollTo(obj);
    },
    ajaxData(obj) {
      let v = this;
      let data = obj.hasOwnProperty('data') ? obj.data : null;
      let authTokenInfo = JSON.parse(getStorage(config.DBKey) || '{}');
      let header = {
        'Accept-Language': 'zh-CN',
        'Content-type': 'application/json',
        'Authorization': getStorage('token') || '1',
        'Authorization-DYT': authTokenInfo.access_token || '',//这个必须加上，输入登宇通的登录校验
      }
      return new Promise((resolve) => {
        requestTask = uni.request({
          url: obj.url,
          method: !obj.type ? 'POST' : obj.type,
          header: header,
          sslVerify: false,
          data: data || {},
          success: function (res) {
            //console.log('obj.url :', obj.url.indexOf('wmsWarehouse/list') < 0)
            if ([999998, 991000].includes(res.data.code)) {
              v.store.commit('loginUrl', res.data.others.loginUrl);
              removeStorage('token');
              requestTask.abort();
              refreshPageToken.againLogin();
            } else if (res.data.code === 999999 && obj.url.indexOf('wmsWarehouse/list') < 0 && obj.url.indexOf('common/getProductImagFiex') < 0) {
              uni.showToast({
                icon: 'none',
                title: '系统繁忙，请稍候再试',
                duration: 3000
              });
            }
            resolve(res);
          },
          fail: function (err) {
            console.log('in err');
            console.log(JSON.stringify(err));
          }
        });
      });
    },
    // 跳转登录
    login() {
      uni.reLaunch({
        url: '/pages/login/login'
      });
    },
    // 旧登录
    oldLogin(type) {
      // 根据type做后续操作
      let v = this;
      const url = config.prefixDomain + '/api/app/user/login';
      //#ifdef MP-WEIXIN || APP-PLUS
      uni.navigateTo({
        url: '/components/login/login'
      });
      //#endif
      //#ifdef H5
      let localUrl = window.location.href;
      if (localUrl.indexOf('ticket') > 0) {
        localUrl = window.location.href.replace(/\?.*/, '');
      }
      window.location.href =
        getStorage('lookup').loginUrl + encodeURIComponent(localUrl);
      //#endif
    },
    getQueryString(name) {
      // 获取url里面的参数
      let reg = new RegExp('(^|&?)' + name + '=([^&]*)(&|$)', 'i');
      let r = window.location.href.substr(1).match(reg);
      if (r !== null) {
        return unescape(r[2]);
      } else {
        return null;
      }
    },
    getQueryStringLink(link, name) {
      // 获取url里面的参数
      let reg = new RegExp('(^|&?)' + name + '=([^&]*)(&|$)', 'i');
      let r = link.substr(1).match(reg);
      if (r !== null) {
        return unescape(r[2]);
      } else {
        return null;
      }
    },
    getLoginInfo() {
      // 获取用户信息
      let v = this;
      return new Promise((resolve) => {
        const obj = {
          url: api.get_loginInfo,
          type: 'get'
        };
        v.ajaxData(obj).then((response) => {
          if (response.data.code === 0) {
            v.store.commit('userInfo', response.data.datas);
            v.store.commit('isAdmin', response.data.datas.user.isAdmin === '1');
            let uName = getStorage('userName');
            if (uName && uName !== response.data.datas.user.userName) {
              removeStorage('warehouseList');
              removeStorage('inventorQuery');
              removeStorage('inventorQueryVerification');
              removeStorage('cargoSpaceTransfer');
            }
            setStorage('userName', response.data.datas.user.userName);
            setStorage('userId', response.data.datas.user.userId);
            // setStorage('userInfo', response.data.datas)
            v.$nextTick(function () {
              v.store.commit('isLogin', true);
            });
            if (!v.store.state.userinfoList) {
              v.getAllUserInfo();
            }
            resolve(true);
          } else {
            // v.store.commit('isLogin', false);
            resolve(false);
          }
          uni.hideLoading();
        });
      });
    },
    getAllUserInfo() {
      // 获取所有用户信息
      let v = this;
      return new Promise((resolve) => {
        let obj = {
          url: api.get_allUserInfo,
          type: 'GET'
        };
        v.ajaxData(obj).then((response) => {
          if (response.data.code === 0) {
            v.store.commit('userInfoList', response.data.datas);
            v.userInfoList = response.data.datas;
            resolve();
          }
        });
      });
    },
    gotoPage(path) {
      uni.navigateTo({
        url: path
      });
    },
    getDataToLocalTime(date, type) {
      // 本地时间
      if (!date) return null;
      let b;
      const offset = new Date().getTimezoneOffset(); // 獲取時間差
      if (date.replace) {
        b =
          new Date(Date.parse(date.replace(/-/g, '/'))).getTime() -
          offset * 60 * 1000;
      } else {
        b = new Date(date).getTime() - offset * 60 * 1000;
      }
      let d = new Date(b);
      let year = d.getFullYear();
      let month =
        d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
      let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
      let hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
      let minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
      let seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
      if (type === 'fulltime') {
        return (
          year +
          '-' +
          month +
          '-' +
          day +
          ' ' +
          hours +
          ':' +
          minutes +
          ':' +
          seconds
        );
      } else {
        return year + '-' + month + '-' + day;
      }
    },
    getDateTime(date, type) {
      // 时间格式获取
      let d = new Date(date);
      let year = d.getFullYear();
      let month =
        d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
      let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
      let hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
      let minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
      let seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
      if (type === 'fulltime') {
        return (
          year +
          '-' +
          month +
          '-' +
          day +
          ' ' +
          hours +
          ':' +
          minutes +
          ':' +
          seconds
        );
      } else {
        return year + '-' + month + '-' + day;
      }
    },
    getWarehouseList() {
      // 获取仓库列表
      let v = this;
      return new Promise((resolve) => {
        let warehouseList = getStorage('warehouseList');
        if (!warehouseList) {
          const obj = {
            url: api.get_warehouseList,
            type: 'GET'
          };
          v.ajaxData(obj).then((response) => {
            if (response.data.code === 0) {
              setStorage('warehouseList', response.data.datas);
              setTimeout(function () {
                resolve(true);
              }, 600);
            }
          });
        } else {
          resolve(true);
        }
      });
    },
    getUserName(id) {
      return id && this.userInfoList && this.userInfoList[id] ? this.userInfoList[id].userName || '' : ''
    },
    getShippingMethodList(warehouseId) {
      // 获取邮寄方式
      let v = this;
      const obj = {
        url: api.get_shippingMethod,
        type: 'POST',
        data: {
          warehouseId: warehouseId
        }
      };
      return new Promise((resolve) => {
        v.ajaxData(obj).then((response) => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            v.store.commit('shipList', response.data.datas);
            resolve(data);
          }
        });
      });
    },
    // nocompress 为true时，不需要压缩图片
    setImgPath(path, nocompress) {
      // 设置图片路径
      if (path && (path.includes('https://') || path.includes('http://'))) {
        return path;
      } else if (path) {
        // return this.newErpPrefix + "/thumb" + path;
        return this.newErpPrefix + (nocompress ? '' : '/thumb') + path;
      } else {
        return this.placeholderImg;
      }
    },
    setImgPathOld(path) {
      // 设置图片路径 老erp
      if (path && (path.includes('https://') || path.includes('http://'))) {
        return path;
      } else {
        return this.placeholderImg;
      }
    },
    getWarehouseLocationId(warehouseLocationName, id = '', pickingFlag = 1) {
      /**
       * 通过库位名称找库位id
       * 注意 pickingFlag 1 表示拣货  2 非收货库位
       * @params
       *  warehouseLocationName 库位名称
       * */
      let v = this;
      return new Promise((resolve) => {
        if (!warehouseLocationName) {
          uni.showToast({
            title: '请输入库位',
            icon: 'none',
            duration: 3000
          });
          v.openSound('002');
          resolve(false);
          return;
        }
        const obj = {
          url: api.get_checkStorageName,
          type: 'GET',
          data: {
            warehouseId: getStorage('newErpWarehouse').warehouseId,
            locationName: warehouseLocationName,
            pickingFlag: pickingFlag, //0 收货库位 1 表示拣货 2 异常库位
            warehouseBlockId: id, // 库区id
            warehouseBlockType: pickingFlag === 2 ? '30' : '00,10,11,12,20'
          }
        };
        v.ajaxData(obj).then((response) => {
          if (response.data.code === 0) {
            resolve(response.data.datas);
          } else if (response.data.code === 510001) {
            uni.showToast({
              title: '库位不存在或已经停用',
              icon: 'none',
              duration: 3000
            });
            resolve(false);
          } else if (response.data.code === 510002) {
            uni.showToast({
              title: '库区类型错误',
              icon: 'none',
              duration: 3000
            });
            resolve(false);
          } else {
            uni.showToast({
              title: '查询失败',
              icon: 'none',
              duration: 3000
            });
            resolve(false);
          }
        });
      });
    },
    showToastIcon(note, duration) {
      // 提示
      uni.showToast({
        title: note,
        duration: duration || 2000
      });
    },
    showToast(note, duration) {
      // 提示
      uni.showToast({
        title: note,
        icon: 'none',
        duration: duration || 2000
      });
    },
    redirectTo(path) {
      uni.redirectTo({
        url: path
      });
    },
    openSound(type) {
      /**
       * type 类型
       * String
       * 001 滴   成功
       * 002 滴滴  失败
       * */
      const sound = {
        "001": "/static/sound/di.mp3",
        "002": "/static/sound/didi.mp3",
        "sku_error": "/static/sound/sku_error.mp3",
        "warehouseLocation_error": "/static/sound/warehouseLocation_error.mp3"
      };
      const innerAudioContext = uni.createInnerAudioContext();
      innerAudioContext.autoplay = true;
      innerAudioContext.src = sound[type];
      innerAudioContext.onPlay(() => {
        console.log('开始播放');
      });
      innerAudioContext.onEnded((res) => {
        innerAudioContext.destroy(); // 销毁实例(不销毁实例会导致内存溢出后没有声音)
      });
      innerAudioContext.onError((res) => {
        // console.log(res.errMsg);
        // console.log(res.errCode);
        innerAudioContext.destroy(); // 销毁实例(不销毁实例会导致内存溢出后没有声音)
      });
    }
  }
};
