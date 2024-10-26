import config from '@/config/config';
import newErpApi from './newErpApi.js';

const prefix = config.prefixDomain;
// const prefix = 'http://10.0.7.2:8087'
// const prefix = 'http://mobile.tongtool.com:8080'

let api = {
  ...newErpApi,
  get_newVersion: "/api/app/v2/account/merchant/getLastVersionDetailNew",
  get_erpConfig: "/api/app/v2/account/merchant/queryUserErpType",
  set_erpConfig: "/api/app/v2/account/merchant/setUserErpType",
  get_version: "/api/app/v2/account/merchant/getLastVersionDetail", // 获取版本信息
  get_statisticsList: "/api/app/v2/stats/workloadDetail", // 工作量查询
  set_version: "/api/app/v2/account/merchant/setLastVersionDetail",
  get_commonLookUP: "/api/app/v2/common/lookup?env=test",
  get_adList: "/api/app/v2/homePage/advs", // 获取轮换广告
  get_rangeAdList: "/api/app/v2/homePage/banners", // 首页首屏广告o
  get_totalSalesCountMes: "/api/app/v2/stats/totalByDateRange", // 获取销售额数据
  get_settingConfig: "/api/app/v2/account/getUserEnv", // 设置中心配置
  set_settingConfig: "/api/app/v2/account/updateUserEnv", // 设置中心配置提交
  get_skyDetails: "/api/app/work/getGoodsDetailBySKU", // 开始拣货
  get_skuInWarehoseStatus: "/api/app/work/checkSkuForStockTaking", // 检查SKU在仓库中的状态
  set_pickingUser: "/api/app/work/beginPickingByPid", // 录入拣货人
  get_wmsPickingGoodsAbnormal: "/api/app/v2/wmsPickingGoodsAbnormal/query", // 拣货异常列表
  get_wmsWarehouseBlockGroup: "/api/app/v2/wmsWarehouseBlockGroup/query", // 库区组列表
  get_wmsPickingGoods: "/api/app/v2/wmsPickingGoods/query", // 未拣货列表
  set_bindPickingGoods: "/api/app/v2/wmsPickingGoods/bindPickingGoods", // 接单
  set_modifyToPickingGoodsAbnormal: "/api/app/v2/wmsPickingGoodsAbnormal", // 移除拣货异常
  get_loginInfo: "/api/app/v2/account/user/myinfo", // 用户登录用户信息
  set_logout: "/api/app/v2/user/logout", // 退出登录
  get_token: "/api/app/v2/auth/ticketToToken/", // ticket 拿token
  get_allUserInfo: "/api/app/v2/account/merchant/getUserInfos", // 获取所有用户信息
  get_coupons: "/api/app/v2/account/merchant/coupons", // 优惠券
  get_settlements: "/api/app/v2/account/merchant/settlements",
  change_password: "/api/app/v2/account/user/changepassword", // 修改密码
  get_userinfoList: "/api/app/v2/account/merchant/getUserInfos", // 获取当前商户所有用户信息
  // workspace
  get_purchaseList: '/api/app/v2/work/getPurchaseOrderList', // 获取采购单列表
  get_purchaseDetailsList:
    '/api/app/v2/work/getPurchaseOrderDetailByPid', // 根据ID获取采购单详情列表
  get_purchaseDetailsListOperateHistory:
    '/api/app/v2/work/getPurchaseOrderLogByPid', // 采购详情操作记录
  get_workloadByUserId: '/api/app/v2/stats/workloadByUserId', // 工作统计
  get_warehouseList: '/api/app/v2/work/getWarehouseList', // 获取仓库列表
  get_queryStockByGoodsSku: '/api/app/v2/work/queryStockByGoodsSku', // 根据货品SKU查询库存
  get_queryStockByCargoSpace:
    '/api/app/v2/work/queryStockByCargoSpace', // 根据货位查询库存
  get_waitPickingList: '/api/app/v2/work/getWaitPickingList', // 获取等待拣货列表
  set_beginPickingByPid: '/api/app/v2/work/beginPickingByPid', // 开始拣货
  get_pickingBasketListByPid: '/api/app/v2/work/getPickingBasketListByPid', // 根据拣货单ID查询拣货篮列表
  set_newPickingBasket: '/api/app/v2/work/addPickingBasket', // 添加新篮子
  get_skuListByPickingListId: '/api/app/v2/work/getSkuListByPid', // 根据拣货单查询SKU列表
  set_markFinished: '/api/app/v2/work/endPickingByPid', // 标记拣货完成
  get_goodsDetailBySKU: '/api/app/v2/work/getGoodsDetailBySKU',
  get_skuForStockTalking: '/api/app/v2/work/checkSkuForStockTaking', // 扫描SKU时校验该SKU在仓库中的状态
  set_newCargoSpace: '/api/app/v2/work/checkCargoSpace', // 库位校验及绑定/解绑库位
  get_purchaseEnterWarehouseList: '/api/app/v2/work/getPurchaseEnterWarehouseList', // 查询所有等待入库的采购入库数据
  get_stockTakingListByWarehouseId: '/api/app/v2/work/getStocktakingListByWid', // 根据仓库查询盘点单列表
  get_stockGoodsListBySid: '/api/app/v2/work/getStockGoodsListBySid', // 根据盘点单查询sku列表
  set_randStockTaking: '/api/app/v2/work/randStockTaking', // 随机盘点
  set_stockSave: '/api/app/v2/work/saveStocks', // 批量提交盘点单
  get_shippingMethodList: '/api/app/v2/work/getShippingMethodList', // 获取物流方式
  // 多货位
  get_queryStockByGoodsSkuM: '/api/app/v2/work/queryStockByGoodsSkuM', // 根据货品SKU查询库存(多货位)
  get_queryStockByGoodsShelfM: '/api/app/v2/work/queryStockByGoodsShelfM', // 根据货位查询库存
  set_moreStorageTransfer: '/api/app/v2/work/submitStockMove', // 多货位提交库存转移
  set_MInStorage: '/api/app/v2/work/purchaseStockForM', // 新增到货入库（多货位）
  get_stockGoodsListBySidM: '/api/app/v2/work/getStockGoodsListBySidM', // 根据盘点单查询sku列表(多货位)
  get_checkGoodsShelfAndSku: '/api/app/v2/work/checkGoodsShelfAndSku', // 校验当前货位上是否已绑定当前SKU（多货位）
  get_checkSkuForStockTakingForM: '/api/app/v2/work/checkSkuForStockTakingForM', // 扫描SKU时校验该SKU在仓库中的状态(多货位)
  set_submitRandomForM: '/api/app/v2/work/randStockTakingForM', // 多货位随机盘点提交
  get_stocktakingListByWidForM: '/api/app/v2/work/getStocktakingListByWidForM', // 查询盘点单，多货位
  // 包裹校验
  get_packageList: '/api/app/v2/work/getPackageGoodsInfo', // 查看包裹列表
  set_updatePackageStatus: '/api/app/v2/work/updatePackageIsChecked', // 更新包裹状态
  // 其他入库
  get_specialStockIn: '/api/app/v2/specialStockIn/getList', //查询其它入库列表
  set_specialStockInSave: '/api/app/v2/specialStockIn/save', //保存其他入库
  get_specialStockInDetails: '/api/app/v2/specialStockIn/getDetail', //查询其它入库明细
  // 采购单管理
  set_purchaseOrderDetail: '/api/app/v2/purchaseOrder/getDetail', //采购单明细查询
  set_purchaseOrderList: '/api/app/v2/purchaseOrder/getList', //采购单列表查询
  set_purchaseOrderSave: '/api/app/v2/purchaseOrder/save', //采购单采购到货
  // 中转装箱
  post_transitplanDelivery_getBoxList: '/api/app/v2/transitplanDelivery/getBoxList', // 中转箱子列表
  post_transitplanDelivery_delBox: '/api/app/v2/transitplanDelivery/delBox', // 中转发货单拆箱
  post_transitplanDelivery_getBoxDetail: '/api/app/v2/transitplanDelivery/getBoxDetail', // 中转发货单箱子明细
  post_transitplanDelivery_getDetail: '/api/app/v2/transitplanDelivery/getDetail', // 中转发货单SKU明细
  post_transitplanDelivery_getList: '/api/app/v2/transitplanDelivery/getList', // 中转发货单列表查询
  post_transitplanDelivery_save: '/api/app/v2/transitplanDelivery/save', // 保存/结束装箱
  get_transitplanDelivery_queryAuth: '/api/app/v2/transitplanDelivery/queryAuth', //中转发货单权限查询
  // 执行发货
  post_executeShipment: '/api/app/v2/executeShipment', // 执行发货
  get_executeShipment_getPackageByRelatedNo: '/api/app/v2/executeShipment/getPackageByRelatedNo', // 根据识别号查询包裹信息
  queryPickingGoodsTypes: '/api/app/v2/wmsPicking/queryPickingGoodsTypes', // 海外仓出库单拣货类型取值
};

for (let key in api) {
  api[key] = prefix + api[key];
}

export default api;
