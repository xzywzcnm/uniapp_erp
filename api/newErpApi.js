export default {
  get_qualityList: '/api/app/v2/wmsReceiptCheck/list', // 质检管理-获取质检列表信息
  get_recommendStorage:
    '/api/app/v2/wmsWarehouseLocation/queryRecommendedLocation', // 查询推荐库位
  get_receiptDetailsQuery: '/api/app/v2/wmsReceipt/queryDetail', // 入库管理
  get_receiptCheckDetailShelveQuery:
    '/api/app/v2/wmsReceiptCheckDetailShelve/query', // 上架管理-分页查询上架货品信息
  set_receiptCheckDetailShelveCreate:
    '/api/app/v2/wmsReceiptCheckDetailShelve/createShelve', // 上架管理-提交上架结果
  set_receiptCheckDetailBatchCreateShelve:
    '/api/app/v2/wmsReceiptCheckDetailShelve/batchCreateShelve', // 上架管理-提交上架结果
  set_receiptCheckSubmit: '/api/app/v2/wmsReceiptCheck/submit', // 提交质检结果
  set_receiptCheckSubmitBatch:
    '/api/app/v2/wmsReceiptCheck/batchSubmit', // 批量提交质检结果
  set_createReceiptBatch:
    '/api/app/v2/wmsReceiptBatch/createReceiptBatch', // 添加收货批次
  get_warehouseBlock:
    '/api/app/v2/wmsWarehouseBlock/queryDetailByWarehouseId', // 查询收货库位
  get_newErpWaitPickingList: '/api/app/v2/wmsPickingGoods/list', // 新ERP待拣货列表
  get_newWmsWarehouseList: '/api/app/v2/wmsWarehouse/list', // 仓库列表
  set_startBeginPickingWithWms:
    '/api/app/v2/wmsPickingGoods/beginPickingGoods',
  set_bindPickingGoodsBasket:
    '/api/app/v2/wmsPickingGoods/bindPickingGoodsBasket', // 拣货管理-拣货篮绑定到拣货单
  set_markWmsPickingFinish:
    '/api/app/v2/wmsPickingGoods/modifyToPicking', // 标记拣货完成
  get_newWmsProductList: '/api/app/v2/wmsPickingGoods/detail', // 出库管理-拣货单商品详情
  get_singleReceiptDetails: '/api/app/v2/wmsReceiptCheck/query', // 单个质检详情查询
  set_uploadQualityPic: '/api/app/v2/wmsReceiptCheck/upload', // 质检图片上传
  get_prefix: '/wms/common/getProductImagFiex', // 图片前缀获取
  get_defaultStorage:
    '/api/app/v2/wmsWarehouseLocation/queryDefaultLocation', // 查询默认库位
  get_bindingBasket:
    '/api/app/v2/wmsPickingGoods/queryPickingGoodsBasket', // 查询已绑定的拣货篮
  get_checkStorageName:
    '/api/app/v2/wmsWarehouseLocation/queryByLocationName', // 校验库位，获取库位ID
  get_querySearch: '/api/app/v2/wmsInventory/list', // 库存查询
  post_queryPackageByCode:
    '/api/app/v2/packageInfo/queryPackageByCode', // 查询包裹
  post_wmsInventoryList: '/api/app/v2/wmsInventory/list', // 查询库存移动
  post_createAndExec: '/api/app/v2/wmsInventoryMove/createAndExec', // 执行库存移动
  get_shippingMethod:
    '/api/app/v2/carrier/queryShippingMethodsByPicking', // 获取物流方式
  set_checkStart: '/api/app/v2/wmsInventoryCheck/checkStart', // 库存管理-开始库存盘点
  set_wmsInventoryCheckComplete:
    '/api/app/v2/wmsInventoryCheck/complete', // 库存管理-完成库存盘点
  set_wmsInventoryCheckCreate: '/api/app/v2/wmsInventoryCheck/create', // 库存管理-新建库存盘点
  get_wmsInventoryCheckDetail: '/api/app/v2/wmsInventoryCheck/detail', // 库存管理-库存盘点详情
  get_wmsInventoryCheckList: '/api/app/v2/wmsInventoryCheck/list', // 库存管理-库存盘点列表
  set_updateCheckDetail:
    '/api/app/v2/wmsInventoryCheck/updateCheckDetail', // 库存管理-保存库存盘点
  get_listEnableBlocks:
    '/api/app/v2/wmsWarehouseBlock/listEnableBlocks', // 库存管理-盘点TO库区
  get_packageRegressProductQuery:
    '/api/app/v2/packageRegressProduct/query', // 归库单列表
  get_packageRegressProductDetail:
    '/api/app/v2/packageRegressProduct/', // 归库单详情
  get_packageRegressProductEditStatus:
    '/api/app/v2/packageRegressProduct/editStatus', // 标记归库完成
  get_queryOperByMenu: '/api/app/v2/userInfo/queryOperByMenu/', // 获取单页面权限
  get_queryAuthOldErpByMenu: '/api/app/v2/work/getUserAuthOperListById', // 获取单页面权限
  get_queryPackageByCode: '/api/app/v2/packageInfo/queryPackageByCode', // 查询包裹
  bind_packageExceptionHandLocation:
    '/api/app/v2/packageInfo/bindPackageExceptionHandLocation', // 绑定包裹异常处理库位
  queryWaitSupplementPickingPackage:
    '/api/app/v2/packageInfo/queryWaitSupplementPickingPackage', // app通过出库单查询待生成补拣单的包裹
  receiveSupplementPickingAndStart:
    '/api/app/v2/supplementPicking/receiveSupplementPickingAndStart', // 领取任务并且开始补件
  detailSupplementPicking:
    '/api/app/v2/supplementPicking/detailSupplementPicking/', // 补件任务详情
  updateSupplementPickingDetail:
    '/api/app/v2/supplementPicking/updateSupplementPickingDetail', // 更新补件任务拣货信息详情
  querySelfCurSupplementPicking:
    '/api/app/v2/supplementPicking/querySelfCurSupplementPicking/', // 查询用户当前待处理和在处理的补拣任务列表
  startSupplementPicking:
    '/api/app/v2/supplementPicking/startSupplementPicking', // 开始补件任务
  queryPackageByPackageCode:
    '/api/app/v2/packageInfo/queryPackageByPackageCode', // 查询包裹
  finishSupplementPicking:
    '/api/app/v2/supplementPicking/finishSupplementPicking', // 更新补拣状态
  querySelfRunningSupplementPicking:
    '/api/app/v2/supplementPicking/querySelfRunningSupplementPicking/', // 查询录入补拣
  scanInputSupplementResult:
    '/api/app/v2/supplementPicking/scanInputSupplementResult', // 扫描录入补件结果
  submitInputSupplementResult:
    '/api/app/v2/supplementPicking/submitInputSupplementResult', // 提交录入补件结果
  queryPackageSupplementPickingDetail: '/api/app/v2/supplementPicking/queryPackageSupplementPickingDetail', // 补拣单获取包裹库位级别的详情
  appSubmitSupplementResult:
    '/api/app/v2/supplementPicking/appSubmitSupplementResult/', // 提交补拣记录
  getTodayPackingPackageNumber:
    '/api/app/v2/packageInfo/getTodayPackingPackageNumber', // 今日已打包包裹数量
  setScanPackaging: '/api/app/v2/wmsPicking/scanPackaging/', // 扫描打包登记
  modifyPackageStatusByCodeBatch:
    '/api/app/v2/wmsPicking/modifyPackageStatusByCodeBatch', // PDA 批量标记已包装
  post_ymsPickupOrder_batchDelivery: '/api/app/v2/ymsPickupOrder/batchDelivery', //标记已揽收
  get_ymsPickupOrder_scanPickupOrder: '/api/app/v2/ymsPickupOrder/scanPickupOrder/', //扫描提单
  post_api_wmsReceipt_arrivalSignIn: "/api/app/v2/wmsReceipt/arrivalSignIn", //扫描提单
  wms_inventoryScan: "/api/app/v2/userInfo/queryOperByMenu/wms_inventoryScan", //权限调用
  get_querySkuScanCodes: "/api/app/v2/productTag/querySkuScanCodes", //查询sku扫描条码
};
