<template>
  <view :class="wrap">
    <view class="d-flex justify-content-between warehouseHeadline">
      <view class="headTitle">
        <text>{{warehouseName}}</text>
      </view>
      <picker @change="warehouseChange" :value="warehouseIndex" range-key="warehouseName" :range="warehouseArr">
        <view class="selectWarehouse">
          <text class="icon iconfont">&#xe615;</text>
          <text>选择仓库</text>
        </view>
      </picker>
    </view>
    <view class="mu-divider"></view>
    <!-- #ifdef MP-WEIXIN -->
    <view class="wechatFilter d-flex justify-content-end align-items-end">
    	<text class="icon iconfont wechatSort" @click="showSortList">&#xe75b;</text>
      <text class="icon iconfont wechatSearch" @click="gotoSearch">&#xe64c;</text>
    </view>
    <!-- #endif -->
    <view class="containerWrap">
      <view class="listWrap">
        <view class="listItem" v-for="(item, index) in list" :key="index" @click="gotoDetails(item.stockTakingId, item.stockTakingStatus, item.stockTakingCode, item.stockTakingStatus)">
          <view class="subList">
            <view class="d-flex justify-content-start">
              盘点单号：<text>{{item.stockTakingCode}}</text>
            </view>
            <view class="d-flex justify-content-start">
              <view>货品种类：<text>{{item.goodsNum}}</text></view>
              <view style="margin-left: 20px" v-if="isMoreGoodsShelf === '1'">
                货位总数：<text>{{item.goodsShelfNum}}</text>
              </view>
            </view>
            <view class="d-flex justify-content-start">
              创建人：<text>{{item.createName}}</text>
            </view>
            <view class="d-flex justify-content-start">
              创建日期：<text>{{item.stockTakingCreatedTime}}</text>
            </view>
            <view class="d-flex justify-content-start">
              开始日期：<text>{{item.stockTakingStartTime}}</text>
            </view>
            <view class="d-flex justify-content-start">
              盘点状态：<text v-if="!item.stockTakingStatus || item.stockTakingStatus === '0'">未开始</text>
              <text v-if="item.stockTakingStatus === '1'" class="orange-color">正在盘点...</text>
              <text v-if="item.stockTakingStatus === '2'" class="green-color">完成</text>
              <text v-if="item.stockTakingStatus === '3'" class="green-color">随机盘点</text>
            </view>
            <view class="positionView">
              <text class="icon iconfont">&#xe636;</text>
            </view>
          </view>
        </view>
        <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
      </view>
    </view>
    <view class="bottomBit row no-gutters">
      <view class="col col-7 d-flex justify-content-center align-tiems-center">
        <button type="default" class="yellow" size="mini" @click="syncInventory">
          <text class="icon iconfont">&#xe605;</text>
          <text>下载/同步盘点单</text>
        </button>
      </view>
      <view class="col col-5 d-flex justify-content-center align-tiems-center">
        <button type="primary" class="primary" size="mini" @click="shuffleInventory">
          <text class="icon iconfont">&#xe7b8;</text>
          <text>随机盘点</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
  import Mixin from '@/mixin/common_mixin'
  import api from '@/api/api'
  const prefixCls = 'tongtool-workspace-inventorQueryVerification'
  import {
    setStorage,
    getStorage,
    removeStorage
  } from '@/utils'
  export default {
    mixins: [Mixin],
    data() {
      return {
        isMoreGoodsShelf: null,
        list: [],
        loadingType: 0,
        contentText: {
          contentdown: '上拉显示更多',
          contentrefresh: '正在加载...',
          contentnomore: '没有更多数据了'
        },
        warehouseName: '选择仓库',
        warehouseIndex: 0,
        warehouseId: null,
        warehouseArr: ['选择仓库'],
        lastId: null,
        orderField: 'stockTakingId',
        sortType: 'DESC',
        changeStatus: false,
        showStatus: false
      }
    },
    components: {},
    watch: {
      changeStatus(n, o) {
        let v = this
        if (n) {
          v.lastId = null
          v.list = []
          v.$nextTick(function() {
            v.getList()
            v.changeStatus = false
          })
        }
      }
    },
    methods: {
      syncInventory() {
        let v = this
        uni.showModal({
          content: '当前临时盘点数会被覆盖？',
          success: (res) => {
            if (res.confirm) {
              let randomId = getStorage('randomId_' + v.warehouseId)
              if (randomId) {
                removeStorage('randomId_' + v.warehouseId)
                removeStorage('purchaseRandomResult_' + randomId)
                removeStorage('warehouseRadomList_' + v.warehouseId)
              }
              v.list = []
              v.lastId = null
              v.$nextTick(function() {
                v.getList()
              })
            }
          }
        })
      },
      shuffleInventory() {
        let v = this
        if (!v.warehouseId) {
          uni.showToast({
            icon: 'none',
            title: '仓库数据丢失，请重新选择仓库',
            duration: 2000
          })
          return;
        }
        setStorage('inventorQueryVerification',{
          warehouseId : v.warehouseId,
          warehouseName : v.warehouseName,
          isMoreGoodsShelf : v.isMoreGoodsShelf
        })
        uni.navigateTo({
          url: '/pages/workspace/purchaseRandomResult'
        })
        // uni.scanCode({
        //   success: (res) => {
        //     uni.showLoading({
        //       title: '查询中'
        //     })
        //     v.getSkuForStockTalking(res.result)
        //     console.log('条码类型：' + res.scanType);
        //     console.log('条码内容：' + res.result);
        //   }
        // })
      },
      getSkuForStockTalking(skuNum) {
        let v = this
        console.log('---------------------')
        console.log(skuNum)
        const obj = {
          url: api.get_skuForStockTalking,
          type: 'GET',
          data: {
            warehouseId: v.warehouseId,
            goodsSku: skuNum
          }
        }
        v.ajaxData(obj)
          .then(response => {
            uni.hideLoading()
            if (response.data.code === 0) {
              let data = response.data.datas
              console.log('data:')
              console.log(data)
              uni.navigateTo({
                url: '/pages/workspace/purchaseRandomResult' + '?goodsSku=' + data.goodsSku + '&productName=' +
                  data.productName + '&goodsDetailId=' + data.goodsDetailId + '&warehouseId=' + v.warehouseId +
                  '&goodsImageGroupId=' + data.goodsImageGroupId + '&availableStockQuantity=' + data.availableStockQuantity +
                  '&defectsStockQuantity=' + data.defectsStockQuantity
              })
              console.log(JSON.stringify(response.data.datas))
            } else {
              uni.showToast({
                icon: 'none',
                title: response.data.message,
                duration: 1500
              })
            }
          })
      },
      warehouseChange(e) {
        let v = this
        let obj = v.warehouseArr[e.target.value]
        setStorage('inventorQueryVerification', obj)
        v.warehouseId = obj.warehouseId
        v.warehouseName = obj.warehouseName
        v.isMoreGoodsShelf = obj.isMoreGoodsShelf
        v.lastId = null
        v.list = []
        v.$nextTick(function() {
          v.getList()
        })
      },
      getUserName(id) {
        let v = this;
        if (v.userInfoList && v.userInfoList[id]) {
          return v.userInfoList[id].username;
        } else {
          return ''
        }
      },
      gotoDetails(stockTakingId, stockTakingStatus, stockTakingCode, status) {
        let v = this
        if (status === '3') {
          uni.navigateTo({
            url: '/pages/workspace/purchaseRandomResult'
          })
        } else {
          uni.navigateTo({
            url: '/pages/workspace/inventoryVerificationDetails' + '?stockTakingId=' + stockTakingId +
              '&stockTakingStatus=' + stockTakingStatus + '&stockTakingCode=' + stockTakingCode + '&randomUuid=' +
              stockTakingCode + '&warehouseId=' + v.warehouseId
          })
        }
      },
      showSortList () {
        let v = this
        uni.showActionSheet({
          itemList: ['创建日期倒序', '创建日期升序', '盘点单号倒叙', '盘点单号升序', 'sku数量倒叙', 'sku数量升序'],
          success: function(res) {
            console.log('选中了第' + (res.tapIndex + 1) + '个按钮');
            console.log(typeof res.tapIndex)
            let index = res.tapIndex
            if (index === 0) {
              console.log(1)
              v.orderField = 'stockTakingCreatedTime'
              v.sortType = 'DESC'
            } else if (index === 1) {
              console.log(13)
              v.orderField = 'stockTakingCreatedTime'
              v.sortType = 'ESC'
            } else if (index === 2) {
              v.orderField = 'stockTakingId'
              v.sortType = 'DESC'
            } else if (index === 3) {
              v.orderField = 'stockTakingId'
              v.sortType = 'ESC'
            } else if (index === 4) {
              v.orderField = 'goodsNum'
              v.sortType = 'DESC'
            } else if (index === 5) {
              v.orderField = 'goodsNum'
              v.sortType = 'ESC'
            }
            v.changeStatus = true
          }
        })
      },
      gotoSearch () {
        let v = this
        uni.redirectTo({
        	url: '/pages/workspace/inventorySearch' + '?warehouseId=' + v.warehouseId
        })
      },
      getList() {
        let v = this
        v.loadingType = 1
        let url
        if (v.isMoreGoodsShelf === '1') {
          url = api.get_stocktakingListByWidForM
        } else {
          url = api.get_stockTakingListByWarehouseId
        }
        console.log('url:', url)
        const obj = {
          url: url,
          data: {
            lastId: v.lastId,
            limit: 10,
            orderDirection: v.sortType,
            orderField: v.orderField,
            stockTakingCode: null,
            warehouseId: v.warehouseId
          }
        }
        console.log(JSON.stringify(obj))
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              console.log(response.data.datas.length)
              let data = response.data.datas
              if (!v.lastId) {
                let randomId = getStorage('randomId_' + v.warehouseId)
                if (randomId) {
                  let storageArr = getStorage('warehouseRadomList_' + v.warehouseId)
                  if (storageArr) {

                    v.list.unshift(storageArr[0])
                  }
                }
              }
              v.lastId = response.data.others.lastId
              console.log('data:', data)
              if (data.length > 0) {
                data.forEach((n, i) => {
                  console.log(n.createdBy)
                  n.createName = v.getUserName(n.createdBy)
                })
                v.list = v.list.concat(data)
              }
              v.loadingType = 0
              if (data.length < 10) {
                v.loadingType = 2
              }
              if (!data || data.length === 0) {
                v.loadingType = 2
              }
            } else {
              v.loadingType = 2
            }
          })
      },
    },
    computed: {
      wrap() {
        return `${prefixCls}`
      },
      userInfoList() {
        return this.store.state.userInfoList
      }
    },
    onLoad() {
      let v = this
      uni.showLoading({
        title: '数据加载中'
      })
      v.getWarehouseList()
        .then(result => {
          if (result) {
            v.$nextTick(function() {
              v.warehouseArr = getStorage('warehouseList')
              if (v.warehouseArr.length > 0) {
                let loadStoreWarehouse = getStorage('inventorQueryVerification')
                if (loadStoreWarehouse) {
                  v.warehouseName = loadStoreWarehouse.warehouseName
                  v.warehouseId = loadStoreWarehouse.warehouseId
                  v.isMoreGoodsShelf = loadStoreWarehouse.isMoreGoodsShelf
                } else {
                  v.warehouseName = v.warehouseArr[0].warehouseName
                  v.warehouseId = v.warehouseArr[0].warehouseId
                  v.isMoreGoodsShelf = v.warehouseArr[0].isMoreGoodsShelf
                }
              } else {
                uni.showToast({
                  icon: 'none',
                  title: '没有仓库数据',
                  duration: 1500
                })
              }
              v.getList()
              v.showStatus = true
            })
          }
        })
    },
    onReady() {
      uni.hideLoading()
    },
    onPullDownRefresh() {
      let v = this
      v.list = []
      v.lastId = null
      console.log('pulldown')
      v.getList()
      setTimeout(function () {
        uni.stopPullDownRefresh()
      }, 2000)
    },
    onShow() {
      let v = this
      if(v.showStatus) {
        v.list = []
        v.lastId = null
        v.getList()
      }
    },
    onNavigationBarButtonTap(obj) {
      let v = this
      if (obj.index === 0) {
        uni.redirectTo({
        	url: '/pages/workspace/inventorySearch' + '?warehouseId=' + v.warehouseId
        })
      } else if (obj.index === 1) {
        uni.showActionSheet({
          itemList: ['创建日期倒序', '创建日期升序', '盘点单号倒叙', '盘点单号升序', 'sku数量倒叙', 'sku数量升序'],
          success: function(res) {
            console.log('选中了第' + (res.tapIndex + 1) + '个按钮');
            console.log(typeof res.tapIndex)
            let index = res.tapIndex
            if (index === 0) {
              console.log(1)
              v.orderField = 'stockTakingCreatedTime'
              v.sortType = 'DESC'
            } else if (index === 1) {
              console.log(13)
              v.orderField = 'stockTakingCreatedTime'
              v.sortType = 'ESC'
            } else if (index === 2) {
              v.orderField = 'stockTakingId'
              v.sortType = 'DESC'
            } else if (index === 3) {
              v.orderField = 'stockTakingId'
              v.sortType = 'ESC'
            } else if (index === 4) {
              v.orderField = 'goodsNum'
              v.sortType = 'DESC'
            } else if (index === 5) {
              v.orderField = 'goodsNum'
              v.sortType = 'ESC'
            }
            v.changeStatus = true
          }
        })
      }
    }
  }
</script>
