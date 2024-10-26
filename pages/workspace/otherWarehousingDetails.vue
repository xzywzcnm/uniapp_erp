<template>
  <view :class="wrap">
    <view class="d-flex justify-content-start normalPadding headLine">
      入库单号：<text>{{specialStockinCode}}</text>
    </view>
    <view class="mu-divider"></view>
    <view class="scanWrap">
      <view class="uni-form-item uni-column">
        <view class="uni-input-wrapper" >
          <input class="uni-input" v-model.trim="apiData.goodsSku" :focus="inputFocus"  @confirm="search()" placeholder="扫描SKU" />
          <view class="iconfont text-16" @click="scanCode">&#xe612;</view>
        </view>
      </view>
      <!--多货位仓库 或者 需要检验库位-->
      <view class="uni-form-item uni-column" v-if="isMoreGoodsShelf === '1' || apiData.isMoreGoodsShelf === '1'">
        <view class="uni-input-wrapper" >
          <input class="uni-input" :focus="inputFocus1" v-model.trim="apiData.goodsShelfCode" @confirm="search()" placeholder="扫描货位" />
          <view class="iconfont text-16" @click="scanLocation">&#xe612;</view>
        </view>
      </view>
    </view>
    <view class="containerWrap">
      <view class="listWrap">
        <view class="listItem normalPadding" v-for="item in list" :key="item.goodsDetailId">
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>sku：</text>
            </view>
            <view class="col col-7">
              <text>{{item.goodsSku}}</text>
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>货位：</text>
            </view>
            <view class="col col-7">
              <text>{{item.cargoSpace}}</text>
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>名称：</text>
            </view>
            <view class="col col-7">
              <text>{{item.productName}}</text>
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>可用库存：</text>
            </view>
            <view class="col col-7">
              <text>{{item.availableStockQuantity}}</text>
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>入库数量：</text>
            </view>
            <view class="col col-8">
              <input type="number" v-model.trim="item.quantity" @change="updateStorage(item)" class="uni-input changeNum small-uni-input">
            </view>
          </view>
        </view>
        <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
      </view>
    </view>
    <view class="bottomBit d-flex">
      <button type="default" class="yellow" size="mini" @click="submitAllList" v-if="showAllStatus">
        <text class="icon iconfont">&#xe67f;</text>全部提交
      </button>
      <button type="default" class="yellow" size="mini" @click="checkAllProduct" v-if="!showAllStatus">
        查看所有货品
      </button>
    </view>
  </view>
</template>

<script>
  import Mixin from '@/mixin/common_mixin'
  import api from '@/api/api'
  const prefixCls = 'tongtool-workspace-inventoryVerificationDetails'
  import {
    setStorage,
    getStorage,
    removeStorage
  } from '@/utils'
  export default {
    mixins: [Mixin],
    data() {
      return {
        inputFocus: true,
        inputFocus1: false,
        checkCargo: '0',
        searchValue: '',
        searchLocation: '',
        specialStockinCode: '',
        showAllStatus: true,
        cbChecked: false,
        isMoreGoodsShelf: null,
        cbText: '逐个扫描',
        skuFocus: false,
        skuNum: '',
        focusObj: {},
        cargospaceFocus: false,
        cargospaceNum: '',
        stockTakingCode: null,
        warehouseId: null,
        stockTakingStatus: null,
        apiData: {
          lastId: null,
          limit: 10,
          warehouseId: null,
          specialStockinId: null,
          goodsSku: "",
          isMoreGoodsShelf: '0',
          "goodsShelfCode": ""
        },
        randomUuid: null,
        list: [],
        loadingType: 0,
        contentText: {
          contentdown: '上拉显示更多',
          contentrefresh: '正在加载...',
          contentnomore: '没有更多数据了'
        }
      }
    },
    components: {},
    watch: {
      skuNum (n, o) {
        this.apiData.goodsSku = n
      }
    },
    methods: {
      getSettingConfigData() {
        let v = this;
        return new Promise(resolve => {
          if (getStorage('settingsConfigObj')) {
            resolve(getStorage('settingsConfigObj').checkCargo)
          } else {
            const obj = {
              url: api.get_settingConfig,
              type: 'GET'
            }
            v.ajaxData(obj)
            .then(response => {
              if (response.data.code === 0) {
                v.$nextTick(function() {
                  setStorage('settingsConfigObj',  Object.assign({}, response.data.datas))
                })
                resolve(response.data.datas.checkCargo)
              }
            })
          }
        })


      },
      checkAllProduct () {
        let v = this;
        if (v.isMoreGoodsShelf === '1' || v.apiData.isMoreGoodsShelf === '1') {
          v.apiData.goodsShelfCode = ''
        }
        v.apiData.goodsSku = ''
        v.skuFocus = false
        v.cargospaceFocus = false
        v.apiData.lastId = null
        v.list = []
        v.getDetails()
        setTimeout(()=>{
          v.showAllStatus = true
        },300)
      },
      scanCode () {
        let v = this;
        uni.scanCode({
          success: function (res) {
            v.apiData.goodsSku = res.result
            v.$nextTick(function () {
              v.search()
            })
          },
          fail: function (error) {
            console.log('error:', error)
          }
        })
      },
      scanLocation () {
        let v = this;
        uni.scanCode({
          success: function (res) {
            v.apiData.goodsShelfCode = res.result
            v.$nextTick(function () {
              v.search()
            })
          },
          fail: function (error) {
            console.log('error:', error)
          }
        })
      },
      search () {
        let v = this;
        // 设置需要验证货位 或者 是多货位仓库
        if (v.isMoreGoodsShelf === '1' || v.apiData.isMoreGoodsShelf === '1') {
          if (!v.apiData.goodsSku) {
            v.inputFocus = true;
            return ;
          } else if (!v.apiData.goodsShelfCode) {
            v.inputFocus1 = true;
            return ;
          }
        } else {
          v.apiData.goodsShelfCode = null;
        }
        v.showAllStatus = false;
        v.apiData.lastId = null
        v.list = []
        v.getDetails()
      },
      updateStorage (item) {
        let v = this
        item.quantity = Number(item.quantity)
        let storageData = getStorage('otherWarehousing_' + v.apiData.specialStockinId)
        if (storageData) {
          let result = false
          storageData.forEach((n, i) => {
            if (n.specialStockinDetailsId === item.specialStockinDetailsId) {
              result = true
              n.quantity = item.quantity
            }
          })
          if (!result) {
            storageData.push({
              specialStockinDetailsId: item.specialStockinDetailsId,
              quantity: item.quantity,
              goodsDetailId: item.goodsDetailId,
              warehouseGoodsShelfStockId: item.warehouseGoodsShelfStockId
            })
          }
          v.setAllSpecialStockinIdLocal(v.apiData.specialStockinId)
          setStorage('otherWarehousing_' + v.apiData.specialStockinId, storageData)
        } else {
          console.log('in two')
          let arr = [
            {
              specialStockinDetailsId: item.specialStockinDetailsId,
              quantity: item.quantity,
              goodsDetailId: item.goodsDetailId,
              warehouseGoodsShelfStockId: item.warehouseGoodsShelfStockId
            }
          ]
          v.setAllSpecialStockinIdLocal(v.apiData.specialStockinId)
          setStorage('otherWarehousing_' + v.apiData.specialStockinId, arr)
        }
      },
      setAllSpecialStockinIdLocal (id) {
        // 用于删除数据
        let data = getStorage('otherWarehouseing_allSpecialStockinId');
        if (data) {
          data = [...new Set([...data,id])]
        } else {
          data = [id];
        }
        setStorage('otherWarehouseing_allSpecialStockinId',data);
      },
      getDetails() {
        let v = this
        v.loadingType = 1
        let params = Object.assign({}, v.apiData)
        const obj = {
          url: api.get_specialStockInDetails,
          data: params
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              if (data.length === 0) {
                uni.showToast({
                  title: '该入库单上没有此SKU',
                  icon: 'none',
                  duration: 2000
                })
                v.loadingType = 2
                return false
              }
              data.forEach((n, i) => {
                let storageData = getStorage('otherWarehousing_' + v.apiData.specialStockinId)
                if (storageData) {
                  if (storageData) {
                    let g = false
                    storageData.forEach((m, t) => {
                      if (m.specialStockinDetailsId === n.specialStockinDetailsId) {
                        g = true
                        n.quantity = m.quantity
                      }
                    })
                    if (!g) {
                      storageData.push(
                          {
                            specialStockinDetailsId: n.specialStockinDetailsId,
                            quantity: n.quantity
                          }
                      )
                    }
                  } else {
                    console.log('in this')
                    n.quantity = n.quantity
                    n.specialStockinDetailsId = n.specialStockinDetailsId
                    storageData = [ {
                      specialStockinDetailsId: n.specialStockinDetailsId,
                      quantity: n.quantity
                    }]
                  }

                  setStorage('inventoryDetails_' + v.apiData.stockTakingId, storageData) //
                }
              })
              if (data.length > 0) {

                v.list = v.list.concat(data)
                v.apiData.lastId = response.data.others.lastId
                v.loadingType = 0
                if (data.length < 10) {
                  v.loadingType = 2
                }
              } else {
                v.loadingType = 2
              }
            } else if (response.data.code === 110001) {
              v.showToast('货位或者SKU不在入库单明细中')
            } else if (response.data.code === 400005) {
              v.showToast('请求ERP系统超时，请稍后再试')
            } else {
              v.showToast(response.data.message)
              v.loadingType = 2
            }
          })
      },
      submitAllList() {
        let v = this
        uni.showModal({
          content: '确定全部提交?',
          success: (res) => {
            if (res.confirm) {
              v.submitData()
            }
          }
        })
      },
      submitData() {
        let v = this
        let storage = getStorage('otherWarehousing_' + v.apiData.specialStockinId)
        if (storage && storage.length > 0) {
          let data = storage.filter(i=>i.quantity > 0);
          if (data && data.length > 0) {
            v.saveAjax(storage);
          } else {
            v.saveAjax(null);
          }
        } else {
          v.saveAjax(null);
        }
      },
      saveAjax (details) {
        let v = this;
        const obj = {
          url: api.set_specialStockInSave,
          data: {
            specialStockinId: v.apiData.specialStockinId,
            specialStockinDetails: details
          }
        }
        uni.showLoading()
        v.ajaxData(obj)
        .then(response => {
          uni.hideLoading()
          if (response.data.code === 0) {
            v.showToast('提交成功')
            v.list = []
            removeStorage('otherWarehousing_' + v.apiData.specialStockinId);
            v.store.commit('pageBackStatus',new Date().getTime())
            setTimeout(function (){
              uni.navigateBack()
            }, 1000)
          } else if (response.data.code === 110001) {
            v.showToast('未找到其它入库单明细信息')
          } else if (response.data.code === 400005) {
            v.showToast('请求ERP系统超时，请稍后再试')
          } else {
            v.showToast(response.data.message)
          }
        }).catch(()=>{
          uni.hideLoading()
        })
      },
      gotoIVFDetails(goodsSku, stockTakingStatus, productName, availableStockQuantity, defectsStockQuantity,
        stockTakingDetailId, availableStockTakingQuantity, defectsStockTakingQuantity) { // 去往SKU盘点
        let v = this
        uni.navigateTo({
          url: '/pages/workspace/inventoryDetails' + '?goodsSku=' + goodsSku + '&stockTalkingId=' + v.apiData.stockTakingId +
            '&stockTakingStatus=' + stockTakingStatus + '&productName=' + productName + '&availableStockQuantity=' +
            availableStockQuantity + '&defectsStockQuantity=' + defectsStockQuantity + '&warehouseId=' + v.warehouseId +
            '&stockTakingCode=' + v.stockTakingCode + '&stockTakingDetailId=' + stockTakingDetailId +
            '&availableStockTakingQuantity=' + availableStockTakingQuantity + '&defectsStockTakingQuantity=' +
            defectsStockTakingQuantity
        })
      }
    },
    computed: {
      wrap() {
        return `${prefixCls}`
      }
    },
    onShow() {
      let v = this;
      v.getSettingConfigData().then(data=>{
        v.isMoreGoodsShelf = data; // 是否检验库位
      })
    },
    onLoad(options) {
      let v = this
      if (options) {
        v.apiData.specialStockinId = options.specialStockinId;
        v.apiData.warehouseId = options.warehouseId;
        v.apiData.isMoreGoodsShelf = options.isMoreGoodsShelf;
        v.specialStockinCode = options.specialStockinCode;

      }
      v.getDetails();
    },
    onReady() {

    },
		onReachBottom () {
      let v = this
			if (v.loadingType !== 0) {
				return
			}
      v.getDetails()
		}
  }
</script>

<style scoped>
.tongtool-workspace-inventoryVerificationDetails .scanWrap {
  padding: 6px;
}
.scanWrap .uni-icon {
  margin-top: 2px;
}

.uni-input-wrapper {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  width: auto;
  padding: 8px 13px;
  flex-direction: row;
  flex-wrap: nowrap;
  background-color: #FFFFFF;
}
.uni-input {
  height: 28px;
  line-height: 28px;
  font-size: 15px;
  padding: 0px;
  flex: 1;
  background-color: #FFFFFF;
}

.uni-icon {
  font-family: uniicons;
  font-size: 24px;
  font-weight: normal;
  font-style: normal;
  width: 24px;
  height: 24px;
  line-height: 24px;
  color: #999999;
}
.listWrap {
  padding-bottom: 50px;
}
.tongtool-workspace-inventoryVerificationDetails .containerWrap .listWrap .listItem .changeNum {
  margin-left: 0;
}
</style >
