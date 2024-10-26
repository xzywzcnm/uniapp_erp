import Vue from 'vue';
import App from './App';
import store from '@/store/store';

Vue.config.productionTip = false;
App.mpType = 'app';
Vue.prototype.store = store;
import uView from 'uview-ui';

Vue.use(uView);
import {getStorage, setStorage, removeStorage, clearStorage} from '@/utils';

let version = '2.5.69';
let oldVersion = getStorage('version');
if (version !== oldVersion) {
  removeStorage('newErpWarehouseList');
  setStorage('version', version);
}
const app = new Vue({
  ...App
});
app.$mount();
