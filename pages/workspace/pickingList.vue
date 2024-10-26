<template >
  <view :class="wrap" >
    <view class="d-flex justify-content-between warehouseHeadline" >
      <view class="headTitle" >
        <text >{{ warehouseName }}</text >
      </view >
      <picker @change="warehouseChange" :value="warehouseIndex" range-key="warehouseName" :range="warehouseArr" >
        <view class="selectWarehouse" >
          <text class="icon iconfont" >&#xe615;</text >
          <text >选择仓库</text >
        </view >
      </picker >
    </view >
    <view class="pickinglistWrap" >
      <uni-segmented-control
          :current="current"
          :values="tabArr"
          @clickItem="onClickItem"
          bgColor="#FFFFFF"
          activeColor="#1976d2"
          style-type="text" ></uni-segmented-control >
      <view class="mu-divider" ></view >
      <view class="pickinglist" >
        <view v-if="current === 0" >
          <view class="d-flex justify-content-center normalPadding" v-if="noData" >
            暂无数据
          </view >
          <view
              class="pickingItem"
              v-for="item in waitPickingList"
              :key="item.pickingListId"
              @click="gotoPickingDetails(item.pickingListId, item.pickingListCode)" >
            <view class="d-flex justify-content-between pickingHead align-items-center" >
              <text class="phTitle " >捡货单号：<text>{{ item.pickingListCode }}</text></text >
              <text class="phStatus" v-if="item.pickingStatus === '0'" >待拣货</text >
            </view >
            <view class="mu-divider" ></view >
            <view class="pickingItemContent" >
              <view class="d-flex justify-content-start pItem" >
                <text class="pItemTitle" >拣货单类型：</text >
                <text >
                  {{
                    item.listType === '0' ? '单品单件' : item.listType === '1' ? '单品多件' : item.listType === '2'
                                                                                      ? '单品'
                                                                                      : item.listType === '3'
                                                                                        ? '多品多件'
                                                                                        : item.listType === '4'
                                                                                          ? '含货品备注'
                                                                                          : ''
                  }}
                </text >
              </view >
              <view class="d-flex justify-content-start pItem" >
                <text class="pItemTitle" >创建人：</text >
                <text >{{ item.createName }}</text >
              </view >
              <view class="d-flex justify-content-start pItem" >
                <text class="pItemTitle" >拣货人：</text >
                <text >{{ item.pickingName }}</text >
              </view >
              <view class="d-flex justify-content-start pItem" >
                <text class="pItemTitle" >创建日期：</text >
                <text >{{ item.createDate }}</text >
              </view >
              <view class="d-flex justify-content-start pItem" >
                <view >包裹数：{{ item.packageCount }}</view >
                <view class="jg" >|</view >
                <view >SKU数：{{ item.skuCount }}</view >
                <view class="jg" >|</view >
                <view >货品数：{{ item.quantity }}</view >
              </view >
              <view class="d-flex justify-content-start pItem" >
                <text class="pItemTitle" >邮寄方式：</text >
                <text >{{ item.shippingName}}</text >
              </view >
              <view class="goToPicking" >
                <text >开始拣货</text >
                <text class="icon iconfont" >&#xe636;</text >
              </view >
            </view >
          </view >
        </view >
        <view v-if="current === 1" >
          <view class="d-flex justify-content-center normalPadding" v-if="noAlreadyData" >
            暂无数据
          </view >
          <view class="pickingItem" v-for="item in alreadyList" :key="item.pickingListId" >
            <view class="d-flex justify-content-between pickingHead" >
              <text class="phTitle" >捡货单号：{{ item.pickingListCode }}</text >
              <text class="phStatus" >已拣货</text >
            </view >
            <view class="mu-divider" ></view >
            <view class="pickingItemContent" >
              <view class="d-flex justify-content-start pItem" >
                <text class="pItemTitle" >拣货单类型：</text >
                <text >
                  {{
                    item.listType === '0' ? '单品单件' : item.listType === '1' ? '单品多件' : item.listType === '2'
                                                                                      ? '单品'
                                                                                      : item.listType === '3'
                                                                                        ? '多品多件'
                                                                                        : item.listType === '4'
                                                                                          ? '含货品备注'
                                                                                          : ''
                  }}
                </text >
              </view >
              <view class="d-flex justify-content-start pItem" >
                <text class="pItemTitle" >创建人：</text >
                <text >{{ item.createName }}</text >
              </view >
              <view class="d-flex justify-content-start pItem" >
                <text class="pItemTitle" >拣货人：</text >
                <text >{{ item.pickingName }}</text >
              </view >
              <view class="d-flex justify-content-start pItem" >
                <text class="pItemTitle" >创建日期：</text >
                <text >{{ item.createDate }}</text >
              </view >
              <view class="d-flex justify-content-start pItem" >
                <view >包裹数：{{ item.packageCount }}</view >
                <view class="jg" >|</view >
                <view >SKU数：{{ item.skuCount }}</view >
                <view class="jg" >|</view >
                <view >货品数：{{ item.quantity }}</view >
              </view >
              <view class="d-flex justify-content-start pItem" >
                <text class="pItemTitle" >邮寄方式：</text >
                <text >{{ item.shippingName }}</text >
              </view >
            </view >
          </view >
        </view >
      </view >
    </view >
  </view >
</template >
<script >
import Mixin from '@/mixin/common_mixin';
import api from '@/api/api';

const prefixCls = 'tongtool-workspace-pickingList';

import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils';

export default {
  mixins: [Mixin],
  components: {},
  data () {
    return {
      noAlreadyData: false,
      noData: false,
      warehouseName: '选择仓库',
      warehouseIndex: 0,
      warehouseArr: ['选择仓库'],
      tabArr: ['等待拣货', '已拣货'],
      current: 0,
      waitPickingList: [],
      alreadyList: []
    };
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    },
    userInfoList () {
      return this.store.state.userInfoList;
    }
  },
  watch: {
    //       warehouseName (n, o) {
    //         let v = this
    //         if (n !== o) {
    //           v.current = 0
    //           v.$nextTick(function () {
    //             v.getWaitingList()
    //           })
    //         }
    //       },
    current (n, o) {
      if (n === 1) {
        this.alreadyPicking();
      }
    }
  },
  methods: {
    gotoPickingDetails (pickingListId, pickingListCode) {
      let v = this;
      let loadStoreWarehouse = getStorage('inventorQuery');
      let pickingSettings = getStorage('settingsConfigObj');
      const obj = {
        url: api.set_beginPickingByPid,
        type: 'GET',
        data: {
          warehouseId: v.warehouseId,
          pickingListId: pickingListId
        }
      };
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          if (pickingSettings) {
            if (pickingSettings.useBasket !== '1') {
              uni.navigateTo({
                url: '/pages/workspace/pickingDetails' + '?packageNum=' + '' + '&pickingListCode=' + pickingListCode + '&pickingListId=' + pickingListId + '&warehouseId=' + v.warehouseId
              });
            } else {
              uni.navigateTo({
                url: '/pages/workspace/scanPackage' + '?pickingListId=' + pickingListId + '&pickingListCode=' + pickingListCode + '&warehouseId=' + v.warehouseId
              });
            }
          } else {
            uni.navigateTo({
              url: '/pages/workspace/pickingDetails' + '?packageNum=' + '' + '&pickingListCode=' + pickingListCode + '&pickingListId=' + pickingListId + '&warehouseId=' + v.warehouseId
            });
          }
        } else {
          uni.showToast({
            icon: 'none',
            title: response.data.errMsg,
            duration: 1000
          });
        }
      });
    },
    getUserName (id) {
      let v = this;
      if (v.userInfoList && v.userInfoList[id]) {
        return v.userInfoList[id].username;
      } else {
        return '';
      }
    },
    warehouseChange (e) {
      let v = this;
      let obj = v.warehouseArr[e.target.value];
      setStorage('inventorQuery', obj);
      v.warehouseName = obj.warehouseName;
      v.warehouseId = obj.warehouseId;
      v.$nextTick(() => {
        v.getWaitingList();
      });
    },
    onClickItem (index) {
      if (this.current !== index) {
        this.current = index;
      }
    },
    alreadyPicking () {
      let v = this;
      v.noAlreadyData = false;
      v.alreadyList = [];
      let loadStoreWarehouse = getStorage('inventorQuery');
      let aPickingList = getStorage('picking_warehouse_' + v.warehouseId + '_alreadyList');
      if (!aPickingList || aPickingList.length === 0) {
        v.noAlreadyData = true;
      }
      v.alreadyList = aPickingList;
    },
    getWaitingList (listType, merchantCarrierId, pickingListCode, shippingMethodId) {
      let v = this;
      console.log('pickingListCode:', pickingListCode);
      v.noData = false;
      v.waitPickingList = [];
      if (v.warehouseName === '选择仓库') {
        uni.showToast({
          icon: 'none',
          title: '请选择仓库',
          duration: 2000
        });
        v.noData = true;
        return false;
      }
      v.loadingType = 1;
      let loadStoreWarehouse = getStorage('inventorQuery');
      const obj = {
        url: api.get_waitPickingList,
        data: {
          listType: listType || null,
          merchantCarrierId: merchantCarrierId || null,
          pickingListCode: pickingListCode || null,
          shippingMethodId: shippingMethodId || null,
          warehouseId: v.warehouseId
        }
      };
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          uni.hideLoading();
          if (!data || data.length === 0) {
            v.noData = true;
            return false;
          }
          data.forEach((n, i) => {
            n.createName = v.getUserName(n.createBy);
            n.pickingName = v.getUserName(n.printBy);
          });
          v.waitPickingList = data;
          let warehouseKey = 'picking_warehouse_' + v.warehouseId + '_waitList';
          setStorage(warehouseKey, data);

        }
      });
    }
  },
  onLoad (option) {
    let v = this;
    uni.showLoading({
      title: '数据加载中'
    });
    let loadStoreWarehouse = getStorage('inventorQuery');
    if (loadStoreWarehouse) {
      v.warehouseName = loadStoreWarehouse.warehouseName;
    }
    v.getWarehouseList().then(result => {
      if (result) {
        v.$nextTick(function () {
          v.warehouseArr = getStorage('warehouseList');
          if (!v.warehouseId) {
            if (v.warehouseArr.length > 0) {
              v.warehouseName = v.warehouseArr[0].warehouseName;
              v.warehouseId = v.warehouseArr[0].warehouseId;
              v.isMoreGoodsShelf = v.warehouseArr[0].isMoreGoodsShelf;
            } else {
              uni.showToast({
                icon: 'none',
                title: '没有仓库数据',
                duration: 1500
              });
            }
          }
          if (option) {
            v.getWaitingList(option.listType, option.merchantCarrierId, option.pickingListCode, option.shippingMethodId);
          } else {
            v.getWaitingList();
          }
        });
      }
    });
  },
  onPullDownRefresh () {
    let v = this;
    v.getWaitingList();
    setTimeout(function () {
      uni.stopPullDownRefresh();
    }, 2000);
  },
  onNavigationBarButtonTap (obj) {
    let v = this;
    if (obj.index === 0) {
      let loadStoreWarehouse = getStorage('inventorQuery');
      uni.navigateTo({
        url: '/pages/workspace/checkPickingOrder' + '?warehouseId=' + v.warehouseId
      });
    }
  }
};
</script >
<style scoped>
.pItemTitle {white-space: nowrap}
</style >
