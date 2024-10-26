import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    lookup: null,
    isLogin: false,
    userInfo: null,
    loginUrl: null,
    pageStatus: false,
    userInfoList: null,
    authToken: null,
    shipList: null,
    inventoryList: null, // 库存移动数据
    stockReturnList: [], // 归库单详情数据
    roleList: [], // 权限
    choseShip: null, // 选择物流信息
    isAdmin: false, // 是否为管理员
    choseOnShelf: null,
    chosePickData: null,
    supplementPickingId: null,
    choseUser: null,
    theme: {
      inputStyle: "default",
    },
    goodsSaveData: null,
    pageBackStatus: null,
    goodsSaveData: null,
    authTokenInfo: {},// 登宇通token信息
  },
  mutations: {
    roleList (state, obj) {
      state.roleList = obj;
    },
    isAdmin (state, obj) {
      state.isAdmin = obj;
    },
    choseOnShelf (state, obj) {
      state.choseOnShelf = obj;
    },
    choseShip (state, obj) {
      state.choseShip = obj;
    },
    lookup (state, obj) {
      state.lookup = obj;
    },
    isLogin (state, data) {
      state.isLogin = data;
    },
    userInfo (state, data) {
      state.userInfo = data;
    },
    loginUrl (state, data) {
      state.loginUrl = data;
    },
    pageStatus (state, data) {
      state.pageStatus = data;
    },
    userInfoList (state, data) {
      state.userInfoList = data;
    },
    authToken (state, data) {
      state.authToken = data;
    },
    shipList (state, data) {
      state.shipList = data;
    },
    inventoryList (state, data) {
      state.inventoryList = data;
    },
    stockReturnList (state, data) {
      state.stockReturnList = data;
    },
    chosePickData (state, data) {
      state.chosePickData = data;
    },
    supplementPickingId (state, data) {
      state.supplementPickingId = data;
    },
    choseUser (state, data) {
      state.choseUser = data;
    },
    theme (state, data) {
      state.theme = data;
    },
    pageBackStatus (state, data) {
      state.pageBackStatus = data;
    },
    goodsSaveData (state, data) {
      state.goodsSaveData = data;
    },
    // 设置登宇通token信息
    SET_AUTHTOKENINFO (state, data) {
      state.authTokenInfo = data;
    },
  },
  actions: {},
});
