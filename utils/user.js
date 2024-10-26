// 获取token
import { getQueryString, setStorage } from "./index";
import api from "../api/api";
import store from '@/store/store'

export const getAccessToken = (path) => {
  return new Promise(resolve => {
    if (path.indexOf('ticket') > 0) {
      let ticket = getQueryString('ticket');
      if (ticket.indexOf('#/') > 0) {
        ticket = ticket.replace('#/', '')
      }
      uni.request({
        url: api.get_token + ticket,
        method: 'GET',
        header: {
          'Content-type': 'application/json'
        },
        sslVerify: false,
        success: function (response) {
          setStorage('token', response.data.datas.token);
          store.commit('isLogin', true)
          resolve(true);
        },
        fail: function (err) {

        }
      })
    } else {
      resolve(true);
    }
  });
}



