/*
 * @Author: Jaycee 
 * @Date: 2022-02-11 10:44:28 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-03-08 18:19:45
 */
import dayjs from 'dayjs';
import api from "@/api/api";
import store from '@/store/store';
import config from '@/config/config';
import * as CryptoJS from 'crypto-js';
import { getStorage, setStorage } from '@/utils';
const tokenConfig = {
  refreshKey: config.refreshKey,//刷新token时间
  DBKey: config.DBKey,//登宇通token信息
  operation: config.operation,//用户账户
  beforeTime: 60, // 提前刷新Token时间
  intervalTime: 3600, // 刷新 token 时长，单位秒

  refresh: 1, // 刷新次数
  maxRefresh: 3, // 最多刷新次数
  refreshPageTime: null,

  // 加密处理
  encryption (params) {
    let { data, type, param, key } = params;
    const result = JSON.parse(JSON.stringify(data));
    if (type === 'Base64') {
      param.forEach(ele => {
        result[ele] = btoa(result[ele]);
      });
    } else {
      param.forEach(ele => {
        let item = result[ele];
        key = CryptoJS.enc.Latin1.parse(key);
        let iv = key;
        // 加密
        let encrypted = CryptoJS.AES.encrypt(item, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.ZeroPadding
        });
        result[ele] = encrypted.toString();
      });
    }
    return result;
  },
  // 存储 token 处理
  tokenHand (res, userInfo) {
    return new Promise((resolve, reject) => {
      try {
        // 计算token过期时间
        tokenConfig.intervalTime = (res.expires_in && res.expires_in > tokenConfig.beforeTime) ? (res.expires_in - tokenConfig.beforeTime) : 0;

        // 存储登录时间
        setStorage(tokenConfig.refreshKey, JSON.stringify({
          refreshTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          intervalTime: tokenConfig.intervalTime
        }))

        // 存储登 token 信息
        setStorage(tokenConfig.DBKey, JSON.stringify(res));
        store.commit('SET_AUTHTOKENINFO', res);

        // 存储登录人信息信息
        userInfo && setStorage(tokenConfig.operation, JSON.stringify(userInfo.info || {}));
        resolve(true);
      } catch (error) {
        console.error('tokenHand: ', error);
        resolve(false)
      }
    })
  },
  // 获取用户信息
  getUserInfo () {
    let authTokenInfo = JSON.parse(getStorage(tokenConfig.DBKey) || '{}');
    let params = {};
    params.url = config.prefixAuth + '/dyt-cloud-upms-admin/sys/user/getUserInfo';// 请求token
    params.header = {
      'Authorization': `${authTokenInfo.token_type} ${authTokenInfo.access_token}`
    }
    return tokenConfig.ajaxRequest(params);
  },
  // 根据token拿到通途ticket
  getTicket () {
    return new Promise((resolve, reject) => {
      tokenConfig.getUserInfo().then((data) => {
        let authTokenInfo = JSON.parse(getStorage(tokenConfig.DBKey) || '{}');
        let operationInfo = JSON.parse(getStorage(tokenConfig.operation) || '{}');
        let temp = {};
        temp.url = config.prefixAuth + '/dyt-cloud-upms-admin/api/erp/common/getTicket';
        temp.type = 'POST';// 请求方式
        temp.data = {
          account: operationInfo.username,
          userName: data.sysUserVO && data.sysUserVO.name
        }
        temp.header = {
          'Authorization': `${authTokenInfo.token_type} ${authTokenInfo.access_token}`
        }
        tokenConfig.ajaxRequest(temp)
          .then((data) => {
            resolve(data);
          })
          .catch(err => {
            reject(err);
          })
      }).catch(err => {
        reject(err);
      })
    })
  },
  // 根据通途ticket获取通途的token
  getTongtuToken (ticket) {
    return new Promise((resolve, reject) => {
      tokenConfig.ajaxRequest({ url: api.get_token + ticket }).then((res) => {
        // 登录成功
        store.commit('isLogin', true);
        setStorage('token', res.token);
        resolve(res);
      }).catch(err => {
        reject(err);
      })
    })
  },
  // 刷新token
  refreshPageToken () {
    let oldAuth = JSON.parse(getStorage(tokenConfig.DBKey) || '{}');
    if (!oldAuth.access_token) {
      // let operation = getStorage(tokenConfig.operation);
      // if (!operation || operation == '{}') {
      //   // 移除登录人信息以及 token 信息
      //   tokenConfig.removeInfo(true);
      // } else {
      //   tokenConfig.againLogin();
      // }
      tokenConfig.againLogin();
      return;
    }
    let params = {};
    params.url = config.prefixAuth + '/dyt-cloud-auth-admin/common/refreshTokenForTongtoolApp';// 请求token
    params.type = 'POST';// 请求方式
    params.data = {
      refreshToken: oldAuth.refresh_token || ''
    };
    tokenConfig.ajaxRequest(params, true).then((data) => {
      // 存储登宇通token
      tokenConfig.tokenHand(data || {}).then(() => {
        // 根据token拿到通途ticket
        tokenConfig.getTicket().then((res) => {
          tokenConfig.getTongtuToken(res).then((res) => {
            tokenConfig.againRefresh();
            console.log(res, "刷新成功");
          }).catch(res => {
            tokenConfig.againLogin();
          })
        }).catch(err => {
          tokenConfig.againLogin();
        })
      })
    }).catch(err => {
      // token刷新失败
      tokenConfig.removeServiceToken().finally(() => {
        tokenConfig.againLogin();
      })
      // if (tokenConfig.refresh >= tokenConfig.maxRefresh) {
      //   console.warn('刷新 token 失败, 移除登信息');
      //   tokenConfig.removeInfo();
      // } else {
      //   tokenConfig.refresh++;
      //   tokenConfig.refreshPageToken();
      // }
    })
  },
  // token刷新失败通知服务器移除token
  removeServiceToken () {
    let authInfo = getStorage(tokenConfig.DBKey);
    if (!authInfo || authInfo == '{}') return;
    let [temp, auth] = [{}, JSON.parse(authInfo)];
    temp.url = config.prefixAuth + '/dyt-cloud-auth-admin/common/removeToken';
    temp.type = 'POST';// 请求方式
    temp.data = {
      accessToken: auth.access_token || '',
      refreshToken: auth.refresh_token || ''
    }
    return tokenConfig.ajaxRequest(temp);
  },
  // 根据设置时间间隔刷新 token
  againRefresh (skipLogin) {
    let authInfo = getStorage(tokenConfig.DBKey);
    if (!authInfo || authInfo == '{}') {
      // let operation = getStorage(tokenConfig.operation);
      // if (!operation || operation == '{}') {
      //   // 移除登录人信息以及 token 信息
      //   tokenConfig.removeInfo(skipLogin);
      // } else {
      //   tokenConfig.againLogin();
      // }
      tokenConfig.againLogin(skipLogin);
      return;
    }
    // 定时器存在
    if (tokenConfig.refreshPageTime) {
      console.log("存在定时器,跳过");
      return;
    }
    let res = JSON.parse(getStorage(tokenConfig.refreshKey) || '{}');
    let refreshT = tokenConfig.intervalTime;
    if (res.refreshTime && res.intervalTime) {
      const results = dayjs().subtract(res.intervalTime, 'second').isBefore(res.refreshTime);
      if (results) {
        refreshT = res.intervalTime - dayjs().diff(res.refreshTime, 'second');
      } else {
        tokenConfig.refreshPageToken();
        return;
      }
    } else {
      tokenConfig.refreshPageToken();
      return;
    }
    refreshT = refreshT > 0 ? refreshT : 0;
    console.log(`将在${refreshT}秒后(即: ${dayjs().add(refreshT, 'second').format('YYYY-MM-DD HH:mm:ss')})刷新 token,比实际提前${tokenConfig.beforeTime}秒`);
    tokenConfig.refreshPageTime = setTimeout(() => {
      tokenConfig.clearRefresh();
      tokenConfig.refreshPageToken();
    }, 1000 * refreshT);
    // }, 8000);
  },
  // 清除定时器，刷新信息
  clearRefresh () {
    tokenConfig.refresh = 1;
    tokenConfig.refreshPageTime && clearTimeout(tokenConfig.refreshPageTime);
    tokenConfig.refreshPageTime = null;
  },
  // 移除登录人信息以及 token 信息
  removeInfo (skipLogin) {
    return new Promise((resolve, reject) => {
      uni.clearStorageSync();
      store.commit('SET_AUTHTOKENINFO', {});
      tokenConfig.clearRefresh();
      if (!skipLogin) {
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }
      console.log("移除信息");
      resolve();
    })
  },
  // 公用的ajax请求 skipMessage:是否跳开错误提示
  ajaxRequest (params, skipMessage) {
    return new Promise((resolve, reject) => {
      if (!(params || params.url)) {
        tokenConfig.showToastCommon('请求出错，请检查传参是否有误!');
        reject('请求出错，请检查传参是否有误!');
        return;
      }

      let token = getStorage('token');
      let authTokenInfo = JSON.parse(getStorage(tokenConfig.DBKey) || '{}');
      let defaultHeaders = {};
      defaultHeaders['Content-type'] = 'application/json';
      defaultHeaders['Accept-Language'] = 'zh-CN';
      // 若存在登宇通token信息，则写入头部
      if (token) {
        defaultHeaders['Authorization'] = token;
        defaultHeaders['Authorization-DYT'] = authTokenInfo.access_token;//这个必须加上，输入登宇通的登录校验
      }
      // 存在头部信息，则写入默认头
      params.header && Object.keys(params.header).forEach(item => {
        if (!params.header[item]) return;
        defaultHeaders[item] = params.header[item];
      })
      uni.request({
        url: params.url,
        method: params.type || 'GET',//默认请求方式为GET
        header: defaultHeaders,
        data: params.data || '',
        sslVerify: false,
        success: (res) => {
          let data = res.data || {};
          // 这里由于登宇通和通途返回状态码不一致，所以需要加判断处理
          if ('code' in data) {
            if (data.code !== 0) {
              !skipMessage && tokenConfig.showToastCommon(data.message);
              reject(data);
              return;
            }
            resolve(data.datas);
          } else {
            let msg = data.msg;
            // 获取ticket报错时，不具备erp权限，弹出自定义异常提示
            if (params.url.indexOf('/common/getTicket') >= 0) {
              msg = '登录授权失败!';
            }
            if (data.status !== 200) {
              !skipMessage && tokenConfig.showToastCommon(msg);
              reject(data);
              return;
            }
            resolve(data.data);
          }
        },
        fail: (err) => {
          console.log('请求出错', err)
          tokenConfig.showToastCommon(err.errMsg);
          reject(err);
        },
      });
    })
  },
  // 异常错误提示
  showToastCommon (message) {
    uni.showToast({
      icon: 'none',
      title: message || '异常错误!',
      duration: 1000
    });
  },
  // 配置erp版本
  setErpConfig () {
    let authInfo = getStorage(tokenConfig.DBKey);
    if (!authInfo || authInfo == '{}') return;
    let erpConfig = {
      newErp: true,
      oldErp: false,
    }
    const obj = {
      url: api.set_erpConfig,
      type: 'POST',
      data: erpConfig,
    }
    setStorage('erpConfig', erpConfig);
    tokenConfig.ajaxRequest(obj).then(response => { });
  },
  // 账号密码登录
  goLogin (temp) {
    let params = {};
    params.url = config.prefixAuth + '/dyt-cloud-auth-admin/common/tokenForTongtoolApp';// 请求token
    params.type = 'POST';// 请求方式
    params.data = temp;
    return tokenConfig.ajaxRequest(params);
  },
  againLogin (skipLogin) {
    tokenConfig.clearRefresh();
    // uni.showModal({
    //   title: '提示',
    //   content: '登录信息失败，点击确定重新登录',
    //   showCancel: false,
    //   success: function (res) {
    //     uni.showLoading({
    //       title: '登录中...'
    //     });
    let operation = getStorage(tokenConfig.operation);
    if (!operation || operation == '{}') {
      // uni.reLaunch({
      //   url: '/pages/login/login'
      // });
      this.failTips(skipLogin);
      return;
    }
    // 存在账户信息再次登陆，否则跳转登录页面
    let userInfo = JSON.parse(operation);
    tokenConfig.goLogin(userInfo).then((data) => {
      // 存储登宇通token
      tokenConfig.tokenHand(data || {}, {
        info: userInfo
      }).then(() => {
        // 根据token拿到通途ticket 
        tokenConfig.getTicket().then((res) => {
          tokenConfig.getTongtuToken(res).then((res) => {
            // uni.hideLoading();
            tokenConfig.againRefresh();
          }).catch(err => {
            // uni.hideLoading();
            // tokenConfig.removeInfo();
            this.failTips();
          })
        }).catch(err => {
          // uni.hideLoading();
          // tokenConfig.removeInfo();
          this.failTips();
        })
      })
    }).catch(err => {
      // uni.hideLoading();
      // tokenConfig.removeInfo();
      this.failTips();
    })
    // }
    // })
  },
  failTips (skipLogin) {
    // 是否跳过登录
    if (skipLogin) {
      tokenConfig.removeInfo(skipLogin);
      return;
    }
    uni.showModal({
      title: '提示',
      content: '登录信息失效，点击确定重新登录',
      showCancel: false,
      success: function (res) {
        uni.showLoading({
          title: '正在跳转...'
        });
        setTimeout(() => {
          uni.hideLoading();
          tokenConfig.removeInfo();
        }, 500)
      }
    })
  }
}
export default tokenConfig;