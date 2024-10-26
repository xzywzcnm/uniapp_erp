<template>
  <view>
    <view :class="workspaceWrap" v-if="showPage">
      <view class="item" v-if="oldErpShow && getPermission('app_work_purchase')">
        <view class="title text-16">采购管理</view>
        <view class="itemList">
          <view class="row">
            <view class="col col-4">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPage('/pages/workspace/purchaseList')">
                  <view class="iconWrap orange d-flex justify-content-center align-items-center">
                    <i class="iconfont">&#xe70a;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">掌中采购</view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="item normal-margin-top" v-if="oldErpShow">
        <view class="title text-16">仓库管理</view>
        <view class="itemList">
          <view class="row">
            <view class="col col-4" v-if="getPermission('app_work_stockQuery')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPage('/pages/workspace/inventorQuery')">
                  <view class="iconWrap blue d-flex justify-content-center align-items-center">
                    <i class="iconfont">&#xe670;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">库存查询</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_work_stockInventory')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPage('/pages/workspace/inventoryVerification')">
                  <view class="iconWrap tintGreen d-flex justify-content-center align-items-center">
                    <i class="iconfont">&#xe65e;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">库存盘点</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_work_stockTransfer')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPage('/pages/workspace/cargoSpaceTransfer')">
                  <view class="iconWrap orange d-flex justify-content-center align-items-center">
                    <i class="iconfont">&#xe669;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">库存转移</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_work_purchaseArrival')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPage('/pages/workspace/purchaseArrival/purchaseArrival')">
                  <view class="iconWrap d-flex justify-content-center align-items-center" style="background-color: #2196f3">
                    <i class="iconfont">&#xe70a;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">采购到货</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_work_stockIn')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPage('/pages/workspace/padPurchase')">
                  <view class="iconWrap tintPink d-flex justify-content-center align-items-center">
                    <i class="iconfont">&#xe640;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">入库上架</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_work_picking')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPage('/pages/workspace/pickingList')">
                  <view class="iconWrap lidigo d-flex justify-content-center align-items-center">
                    <i class="iconfont">&#xe6c2;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">手机拣货</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_work_packageCheck')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPage('/pages/workspace/packageVerify')">
                  <view class="iconWrap packageAuth d-flex justify-content-center align-items-center">
                    <i class="iconfont">&#xe649;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">包裹校验</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_work_special')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPage('/pages/workspace/otherWarehousing')">
                  <view class="iconWrap packageAuth d-flex justify-content-center align-items-center" style="background-color: #ff5722">
                    <i class="iconfont">&#xe640;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">其他入库</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="oldAuth.transferDeliver && getPermission('app_work_transferBox')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPage('/pages/workspace/transferDeliverGoods/list')">
                  <view class="iconWrap packageAuth d-flex justify-content-center align-items-center" style="background-color: #4b75ff">
                    <i class="iconfont">&#xe628;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">中转发货</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_work_shipment')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPage('/pages/workspace/executeShipment')">
                  <view class="iconWrap packageAuth d-flex justify-content-center align-items-center" style="background-color: #6BBA40">
                    <i class="iconfont">&#xe62f;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">执行发货</view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="item" v-if="newErpShow" :class="{'normal-margin-top': oldErpShow}">
        <view class="title text-16">新仓库管理</view>
        <view class="mu-divider"></view>
        <view class="d-flex justify-content-between warehouseHeadline">
          <view class="headTitle">
            <text>当前仓库:{{warehouseName}}</text>
          </view>
          <picker @change="warehouseChange" :value="warehouseIndex" range-key="warehouseName" :range="warehouseArr">
            <view class="selectWarehouse">
              <text class="icon iconfont">&#xe615;</text>
              <text>选择新ERP仓库</text>
            </view>
          </picker>
        </view>
        <view class="mu-divider"></view>
        <view class="itemList">
          <view class="row">
            <view class="col col-4" v-if="getPermission('app_receipt')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoNewErpPage('/pages/workspace/newReceiving')">
                  <view class="iconWrap d-flex justify-content-center align-items-center" style="background-color: #F66336">
                    <i class="iconfont">&#xe62e;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">收货</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_quality_inspection')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoNewErpPage('/pages/workspace/qualityTestingList')">
                  <view class="iconWrap tintPink d-flex justify-content-center align-items-center" style="background-color: #24A9FB">
                    <i class="iconfont">&#xe631;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">质检</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_inventory_inquiry')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoNewErpPage('/pages/workspace/newInventoryQuery')">
                  <view class="iconWrap blue d-flex justify-content-center align-items-center" style="background-color: #F3C642">
                    <i class="iconfont">&#xe670;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">库存查询</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_put_on_shelf')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoNewErpPage('/pages/workspace/putaway?openType=0')">
                  <view class="iconWrap d-flex justify-content-center align-items-center" style="background-color: #F93676">
                    <i class="iconfont">&#xe6e5;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">上架</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_picking')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPickPage">
                  <view class="iconWrap lidigo d-flex justify-content-center align-items-center" style="background-color: #49CACF">
                    <i class="iconfont">&#xe6c2;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">拣货</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_package_query')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoNewErpPage('/pages/workspace/packageList')">
                  <view class="iconWrap lidigo d-flex justify-content-center align-items-center" style="background-color: #FF4F4F">
                    <i class="iconfont">&#xe628;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">包裹查询</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_inventory_movement')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoNewErpPage('/pages/workspace/inventoryMovement')">
                  <view class="iconWrap lidigo d-flex justify-content-center align-items-center" style="background-color: #7B7AD7">
                    <i class="iconfont">&#xe635;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">库存移动</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_inventory_check')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoNewErpPage('/pages/workspace/inventoryCheck')">
                  <view class="iconWrap packageAuth d-flex justify-content-center align-items-center" style="background-color: #D19782">
                    <i class="iconfont">&#xe965;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">库存盘点</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_return_list')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoNewErpPage('/pages/workspace/stockReturn')">
                  <view class="iconWrap packageAuth d-flex justify-content-center align-items-center" style="background-color: #15B87B">
                    <i class="iconfont">&#xe6f3;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">归库单</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_workspace_abnormal')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoNewErpPage('/pages/workspace/abnormal/abnormal')">
                  <view class="iconWrap packageAuth d-flex justify-content-center align-items-center" style="background-color: #ff4b4b;">
                    <i class="iconfont">&#xe633;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">拣货异常处理</view>
                </view>
              </view>
            </view>
            <view class="col col-4" v-if="getPermission('app_workspace_packageRegistration')">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoNewErpPage('/pages/workspace/packageRegistration/operation')">
                  <view class="iconWrap packageAuth d-flex justify-content-center align-items-center" style="background-color: #4b75ff;">
                    <i class="iconfont">&#xe60a;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">打包登记</view>
                </view>
              </view>
            </view>
            <view class="col col-4">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoPage('/pages/workspace/collect')">
                  <view class="iconWrap packageAuth d-flex justify-content-center align-items-center" style="background-color: #99CC00;">
                    <i class="iconfont">&#xe662;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">揽收</view>
                </view>
              </view>
            </view>
            <!-- <view class="col col-4" v-if="getPermission('app_workspace_arrivalSignIn')"> -->
            <view class="col col-4">
              <view class="d-flex justify-content-center">
                <view class="itemWrap" @click="gotoNewErpPage('/pages/workspace/warehouseSignFor')">
                  <view class="iconWrap packageAuth d-flex justify-content-center align-items-center" style="background-color: #3fc75c;">
                    <i class="iconfont">&#xe60b;</i>
                  </view>
                  <view class="itemName text-14 d-flex justify-content-center">到仓签收</view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<style lang="less">
@import "../../style/workspace.less";
</style>
<script>
const prefixCls = 'tongtool-workspace'
import api from '@/api/api'
import Mixin from '@/mixin/common_mixin'
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
export default {
  mixins: [Mixin],
  data () {
    return {
      warehouseName: '',
      warehouseIndex: 0,
      warehouseArr: ['选择新ERP仓库'],
      showPage: false,
      newErpShow: false,
      oldErpShow: true,
      oldAuth: {
        transferDeliver: false
      }
    };
  },
  computed: {
    workspaceWrap () {
      return `${prefixCls}`
    }
  },
  methods: {
    gotoPickPage () {
      let v = this;
      if (!v.warehouseName) {
        uni.showToast({
          title: '请选择仓库',
          icon: 'none',
          duration: 3000
        })
        return false
      }
      const obj = {
        url: api.get_wmsPickingGoods,
        data: {
          warehouseId: getStorage('newErpWarehouse').warehouseId
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            if (data && data.warehouseId) {
              v.gotoPage('/pages/workspace/newPickingList')
            } else {
              v.gotoPage('/pages/workspace/checkNewPickingOrder?warehouseId=' + getStorage('newErpWarehouse').warehouseId)
            }
          }
        })
    },
    getOldAuth () {
      let v = this;
      const obj = {
        url: api.get_transitplanDelivery_queryAuth + '?authName=storageM_transitShipmentOrder',
        type: 'GET'
      }
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          v.oldAuth.transferDeliver = response.data.datas;
        }
      })
    },
    getErpConfig () {
      let v = this
      const obj = {
        url: api.get_erpConfig,
        type: 'GET'
      }
      return new Promise(resolve => {
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              if (response.data.datas) {
                let storage = response.data.datas;
                if (storage.newErp) {
                  v.newErpShow = true;
                  let selectStorage = getStorage('newErpWarehouse');
                  if (selectStorage) {
                    v.warehouseName = selectStorage.warehouseName
                  }
                  v.getNewErpWarehouseList()
                  v.getNewErpPrefix()
                } else {
                  v.newErpShow = false
                }
                if (storage.oldErp) {
                  v.oldErpShow = true;
                } else {
                  v.oldErpShow = false
                }
                resolve(storage);
              }
            }
          })
      })

    },
    warehouseChange (e) {
      let v = this
      let obj = v.warehouseArr[e.target.value]
      v.warehouseName = obj.warehouseName
      setStorage('newErpWarehouse', obj)
    },
    gotoNewErpPage (path) {
      let v = this
      if (v.warehouseName === '') {
        uni.showToast({
          title: '请选择仓库',
          icon: 'none',
          duration: 3000
        })
        return false
      }
      uni.navigateTo({
        url: path
      })
    },
    getNewErpWarehouseList () {
      let v = this
      uni.showLoading({
        title: '数据加载中'
      })
      const obj = {
        url: api.get_newWmsWarehouseList,
        type: 'GET'
      }
      v.ajaxData(obj)
        .then(response => {
          uni.hideLoading()
          if (response.data.code === 0) {
            v.warehouseArr = response.data.datas
            setStorage('newErpWarehouseList', response.data.datas)
          }
        })
    },
    getNewErpPrefix () {
      let v = this
      const obj = {
        url: api.get_prefix,
        type: 'GET'
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            setStorage('newErpPrefix', response.data.datas.filenodeViewTargetUrl)
          }
        })
    }
  },
  onLoad (options) {
    let v = this
    // console.log('options:', options)
    // if (options.toPage && options.toPage === 'pickingList') {
    //   uni.navigateTo({
    //     url: '/pages/workspace/pickingList'
    //   })
    // }
    uni.showLoading()
    let storage = getStorage('erpConfig');
    if (storage && storage.newErp) {
      let selectStorage = getStorage('newErpWarehouse')
      if (selectStorage) {
        v.warehouseName = selectStorage.warehouseName
      }
    }
    v.showPage = true
  },
  onShow () {
    let v = this;
    v.getErpConfig().then(data => {
      if (data.newErp && data.oldErp) {
        v.getSinglePageRoleCommon('pda_workspace', '3.0').then(() => {
          v.getOldErpSinglePageAuth('pda_workspace').then(() => {
            if (v.getPermission('app_work_transferBox')) {
              v.getOldAuth();
            }
          });
        })
      } else {
        if (data.newErp) {
          v.getSinglePageRoleCommon('pda_workspace', '3.0')
        } else {
          v.getSinglePageRoleCommon('pda_workspace', '2.0').then(() => {
            if (v.getPermission('app_work_transferBox')) {
              v.getOldAuth();
            }
          })
        }
      }
    });
  },
  onReady () {
    uni.hideLoading()
  }
}
</script>
