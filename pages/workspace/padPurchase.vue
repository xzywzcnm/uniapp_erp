<template>
  <view :class="wrap">
    <view class="d-flex justify-content-between warehouseHeadline">
      <view class="headTitle">
        <text>{{warehouseName}}</text>
      </view>
      <picker @change="warehouseChange" @click="warehouseClick" :value="warehouseIndex" range-key="warehouseName" :range="warehouseArr">
        <view class="selectWarehouse">
          <text class="icon iconfont">&#xe615;</text>
          <text>选择仓库</text>
        </view>
      </picker>
    </view>
    <view class="divider"></view>
    <view class="scanWrap">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <view class="row no-gutters">
          <view class="col col-8">
            <input v-model.trim="skuNum" type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input scanInput" @confirm="isMoreGoodsShelf === '1' ? scanMoreStorageSku() : scanSku() "
              :focus="skuFocus" placeholder="SKU条码" />
          </view>
          <view class="col col-1 jg">*</view>
          <view class="col col-3">
            <input v-model.trim="quantity" type="number" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input scanInputTwo" @blur="quantityBlue" :focus="quantityFocus"
              placeholder="数量">
          </view>
        </view>
      </view>
    </view>
    <view class="mu-divider"></view>
    <view class="scanWrap normalPadding">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCargospace">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="newCargospace" type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input scanInput" @confirm="confirmCargospace" :focus="cargospaceFocus"
          placeholder="新货位" />
      </view>
    </view>
    <view class="d-flex errorText justify-content-center align-items-center normalPadding" v-if="hasError">
      <text>{{errorText}}</text>
    </view>
    <view class="mu-divider"></view>
    <view class="d-flex justify-content-between align-items-center controlLine" v-if="goodsArr.length > 0">
      <text class="icon iconfont" @click="turnLeft">&#xe952;</text>
      <text>{{current + 1}}/{{goodsArr.length}}</text>
      <text class="icon iconfont" @click="turnRight">&#xe655;</text>
    </view>
    <view class="row no-gutters normalPadding goods-box" v-if="goodsArr.length > 0">
      <view class="col col-4 skuImage">
        <image :src="goodsArr[current].imageGroupId" style="width: 200upx;height: 200upx; margin: 10upx"></image>
      </view>
      <view class="col col-8 skuDetails">
        <view class="d-flex justify-content-start">
          <text class="pickingListCode">{{goodsArr[current].purchaseOrderCode}}</text>
        </view>
        <view class="d-flex justify-content-start">
          <text class="supplierName">{{goodsArr[current].supplierName}}</text>
        </view>
        <view class="d-flex justify-content-start">
          SKU: {{goodsArr[current].goodsSku}}
        </view>
        <view class="d-flex justify-content-start">
          名称: {{goodsArr[current].productName}}
        </view>
        <view class="d-flex justify-content-start">
          已入库数/应入库数: {{goodsArr[current].stockedQuantity}}/{{goodsArr[current].qualifiedQuantity}}
        </view>
        <view class="d-flex justify-content-start" v-if="isMoreGoodsShelf !== '1'">
          当前货位: {{goodsArr[current].cargoSpace}}
        </view>
        <view class="d-flex justify-content-start" v-if="isMoreGoodsShelf !== '1'">
          当前库存: {{goodsArr[current].availableStockQuantity + goodsArr[current].defectsStockQuantity}}
        </view>
      </view>
      <view class="normal-margin-top inWarehouseList" v-if="moreArr.length > 0">
        <view class="inWarehouseItem d-flex justify-content-between align-items-center" v-for="item in moreArr" :key="item">
          <text>货位：{{item.goodsShelfCode}}</text>
          <text>库存：{{item.availableStockQuantity}}</text>
        </view>
        <view class="inWarehouseItem d-flex justify-content-end align-items-center">
          <text>总计：{{totalSum}}</text>
        </view>
      </view>
    </view>
    <view class="bottomBit d-flex justify-content-center align-items-center">
      <button type="primary" size="mini" @click="isMoreGoodsShelf === '1' ? confirmMCargospace(): confirmCargospace()">提交</button>
    </view>
  </view>
</template>

<script>
  import Mixin from '@/mixin/common_mixin'
  import api from '@/api/api'
  const prefixCls = 'tongtool-workspace-cargoSpaceTransfer'
  import {
    setStorage,
    getStorage,
    removeStorage
  } from '@/utils'
  export default {
    mixins: [Mixin],
    data() {
      return {
        current: 0,
        quantityFocus: false,
        quantity: null,
        noData: false,
        errorText: '',
        hasError: false,
        originCargospace: '未定义',
        skuNum: null,
        warehouseName: '选择仓库',
        warehouseIndex: 0,
        warehouseArr: ['选择仓库'],
        skuFocus: true,
        cargospaceFocus: false,
        warehouseId: null,
        skuDetails: null,
        newCargospace: null,
        goodsArr: [],
        isMoreGoodsShelf: null,
        moreArr: [],
        totalSum: 0
      }
    },
    computed: {
      wrap() {
        return `${prefixCls}`
      }
    },
    methods: {
      warehouseClick () {
        let v = this
        // #ifdef APP-PLUS
        let system = uni.getSystemInfoSync().system.toLowerCase()
        if (system.includes('ios')) {
          v.skuFocus = false
        }
        // #endif
      },
      warehouseChange(e) {
        let v = this
        let obj = v.warehouseArr[e.target.value]
        setStorage('padPurchase', obj)
        v.warehouseId = obj.warehouseId
        v.warehouseName = obj.warehouseName
        v.isMoreGoodsShelf = obj.isMoreGoodsShelf
        v.skuNum = ''
        v.quantity = 0
        v.newCargospace = ''
        v.goodsArr = []
        v.moreArr = []
        v.skuFocus = false
        setTimeout(function () {
          v.skuFocus = true
        }, 1000)
      },
      scanCode() {
        let v = this
        uni.scanCode({
          success: function(res) {
            v.skuNum = res.result
            v.$nextTick(function() {
              v.isMoreGoodsShelf === '1' ? v.scanMoreStorageSku() : v.scanSku()
            })
          },
          fail: function(error) {
            console.log('error:', error)
          }
        })
      },
      turnLeft() {
        let v = this
        if (v.current === 0) {
          return false
        } else {
          v.current--
        }
        v.quantity = v.goodsArr[v.current].qualifiedQuantity - v.goodsArr[v.current].stockedQuantity
      },
      turnRight() {
        let v = this
        if (v.current === v.goodsArr.length - 1) {
          return false
        } else {
          v.current++
        }
        v.quantity = v.goodsArr[v.current].qualifiedQuantity - v.goodsArr[v.current].stockedQuantity
      },
      scanMoreStorageSku () {
        let v = this
        if (!v.skuNum || v.skuNum === '') {
          // #ifdef APP-PLUS
          let system = uni.getSystemInfoSync().system.toLowerCase()
          if (system.includes('ios')) {
            v.$nextTick(function () {
              v.skuFocus = false
            })
          } else {
            v.skuFocus = false
            v.$nextTick(function () {
              v.skuFocus = true
            })
          }
          // #endif
          // #ifndef APP-PLUS
          v.skuFocus = false
          v.$nextTick(function () {
            v.skuFocus = true
          })
          //#endif
          return false
        }
        if (!v.warehouseId) {
          uni.showToast({
            icon: 'none',
            title: '请先选择仓库',
            duration: 1500
          })
           // #ifdef APP-PLUS
          let system = uni.getSystemInfoSync().system.toLowerCase()
          if (system.includes('ios')) {
            v.$nextTick(function () {
              v.skuFocus = false
            })
          } else {
            v.skuFocus = false
            v.$nextTick(function () {
              v.skuFocus = true
            })
          }
          // #endif
          // #ifndef APP-PLUS
          v.skuFocus = false
          v.$nextTick(function () {
            v.skuFocus = true
          })
          //#endif
          return false
        }
        const obj = {
          url: api.get_queryStockByGoodsSkuM,
          data: {
            warehouseId: v.warehouseId,
            goodsSku: v.skuNum
          }
        }
        console.log('obj:', obj)
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              let moreData = response.data.datas
              if (!moreData || moreData.length === 0) {
                uni.showToast({
                  title: '没有查到相关的SKU',
                  duration: 3000,
                  icon: 'none'
                })
                return false
              }
              v.totalSum = moreData[0].availableStockQuantitySum
              let arr = []
              moreData.forEach((n, i) => {
                arr.push({
                  goodsShelfCode: n.goodsShelfCode,
                  availableStockQuantity: n.availableStockQuantity,
                  defectsStockQuantity: n.defectsStockQuantity
                })
              })
              console.log('moreData:', moreData)
              v.moreArr = arr

              const subObj = {
                url: api.get_purchaseEnterWarehouseList,
                data: {
                  warehouseId: v.warehouseId,
                  searchKey: moreData[0].goodsSku
                }
              }
              v.ajaxData(subObj)
                .then(res => {
                  if (res.data.code === 0) {
                    let subData = res.data.datas
                    v.goodsArr = subData
                    if (subData.length > 0) {
                      v.quantity = v.goodsArr[v.current].qualifiedQuantity - v.goodsArr[v.current].stockedQuantity
                      console.log(v.quantity)
                      v.skuFocus = false
                      v.$nextTick(function() {
                        v.cargospaceFocus = true
                      })
                    } else if (subData.length === 0) {
                      uni.showToast({
                        title: '没有查询到等待入库的数据',
                        duration: 2000,
                        icon: 'none'
                      })
                      return false
                    }
                  } else {
                    uni.showToast({
                      icon: 'none',
                      title: res.data.message,
                      duration: 1500
                    })
                  }
                })


            }
          })
      },
      scanSku() {
        let v = this
        if (!v.skuNum || v.skuNum === '') {
          // #ifdef APP-PLUS
          let system = uni.getSystemInfoSync().system.toLowerCase()
          if (system.includes('ios')) {
            v.$nextTick(function () {
              v.skuFocus = false
            })
          } else {
            v.skuFocus = false
            v.$nextTick(function () {
              v.skuFocus = true
            })
          }
          // #endif
          // #ifndef APP-PLUS
          v.skuFocus = false
          v.$nextTick(function () {
            v.skuFocus = true
          })
          //#endif
          return false
        }
        if (!v.warehouseId) {
          uni.showToast({
            icon: 'none',
            title: '请先选择仓库',
            duration: 1500
          })
           // #ifdef APP-PLUS
          let system = uni.getSystemInfoSync().system.toLowerCase()
          if (system.includes('ios')) {
            v.$nextTick(function () {
              v.skuFocus = false
            })
          } else {
            v.skuFocus = false
            v.$nextTick(function () {
              v.skuFocus = true
            })
          }
          // #endif
          // #ifndef APP-PLUS
          v.skuFocus = false
          v.$nextTick(function () {
            v.skuFocus = true
          })
          //#endif
          return false
        }
        const obj = {
          url: api.get_skuForStockTalking,
          type: 'GET',
          data: {
            warehouseId: v.warehouseId,
            goodsSku: v.skuNum
          }
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              v.skuDetails = response.data.datas
              let data = response.data.datas
              const subObj = {
                url: api.get_purchaseEnterWarehouseList,
                data: {
                  warehouseId: v.warehouseId,
                  searchKey: data.goodsSku
                }
              }
              v.ajaxData(subObj)
                .then(res => {
                  if (res.data.code === 0) {
                    let subData = res.data.datas
                    v.goodsArr = subData
                    if (subData.length > 0) {
                      v.quantity = v.goodsArr[v.current].qualifiedQuantity - v.goodsArr[v.current].stockedQuantity
                      console.log(v.quantity)
                      v.skuFocus = false
                      v.$nextTick(function() {
                        v.cargospaceFocus = true
                      })
                    }
                  } else {
                    uni.showToast({
                      icon: 'none',
                      title: res.data.message,
                      duration: 1500
                    })
                  }
                })
            } else {
              uni.showToast({
                icon: 'none',
                title: response.data.message,
                duration: 1500
              })
            }
          })
      },
      scanCargospace() {
        let v = this
        uni.scanCode({
          success: function(res) {
            v.newCargospace = res.result
            v.$nextTick(function() {
              v.confirmCargospace()
            })
          },
          fail: function(error) {
            console.log('error:', error)
          }
        })
      },
      quantityBlue() {

      },
      confirmMCargospace () {
        let v = this
        if (!v.warehouseId) {
          uni.showToast({
            icon: 'none',
            title: '请先选择仓库',
            duration: 1500
          })
          v.skuFocus = false
          v.$nextTick(function() {
            v.skuFocus = true
          })
          return false
        }
        if (!v.skuNum || v.skuNum === '') {
          uni.showToast({
            icon: 'none',
            title: '请先输入SKU',
            duration: 1500
          })
          v.skuFocus = false
          v.$nextTick(function() {
            v.skuFocus = true
          })
          return false
        }
        if (!v.goodsArr[v.current]) {
          uni.showToast({
            icon: 'none',
            title: '请先进行SKU查询',
            duration: 1500
          })
          v.skuFocus = false
          v.$nextTick(function() {
            v.skuFocus = true
          })
          return false
        }
        if (!v.quantity && v.quantity === 0) {
          uni.showToast({
            icon: 'none',
            title: '数量不能为空并且不能为0',
            duration: 1500
          })
          v.cargospaceFocus = false
          v.skuFocus = false
          v.quantityFocus = false
          v.$nextTick(function() {
            v.quantityFocus = true
          })
          return false
        }
        if (!v.newCargospace || v.newCargospace === '') {
          uni.showToast({
            icon: 'none',
            title: '请输入新货位信息',
            duration: 1500
          })
          v.cargospaceFocus = false
          v.$nextTick(function() {
            v.cargospaceFocus = true
          })
          return false
        }

        console.log('goodsArr:', v.goodsArr[v.current])
        const obj = {
          url: api.set_MInStorage,
          data: {
            cargoSpace: v.newCargospace,
            goodsSku: v.goodsArr[v.current].goodsSku,
            qualityControlId: v.goodsArr[v.current].qualityControlId,
            quantity: v.quantity,
            warehouseId: v.warehouseId
          }
        }
        uni.showLoading()
        v.ajaxData(obj)
          .then(response => {
            uni.hideLoading()
            if (response.data.code === 0) {
               uni.showToast({
                  title: '操作成功',
                  duration: 1500
                })
                v.newCargospace = ''
                v.skuNum = ''
                v.quantity = null
                v.quantityFocus = false
                v.cargospaceFocus = false
                v.skuDetails = null
                v.goodsArr = []
                v.skuFocus = true
            } else if (response.data.code === 400001) {
              uni.showToast({
                title: '质检单号不能为空',
                icon: 'none',
                duration: 3000
              })
              return false
            } else if (response.data.code === 400002) {
              uni.showToast({
                title: '货位不能为空',
                icon: 'none',
                duration: 3000
              })
              return false
            } else if (response.data.code === 400004) {
              uni.showToast({
                title: '本次入库数与已入库数之和不能超过应入库数',
                icon: 'none',
                duration: 3000
              })
              return false
            } else if (response.data.code === 400003) {
              uni.showToast({
                title: '入库数量不能为空',
                icon: 'none',
                duration: 3000
              })
              return false
            } else if (response.data.code === 400006) {
              uni.showToast({
                title: '所选货位不存在或未启用',
                icon: 'none',
                duration: 3000
              })
              return false
            } else if (response.data.code === 400007) {
              uni.showToast({
                title: '当前SKU在当前货位上未初始化货位库存',
                icon: 'none',
                duration: 3000
              })
              return false
            } else if (response.data.code === 400008) {
              uni.showToast({
                title: '当前货位正在盘点中，请稍后再试',
                icon: 'none',
                duration: 3000
              })
              return false
            }
          })
        console.log(5555)
      },
      confirmCargospace(type) {
        let v = this
        if (!v.warehouseId) {
          uni.showToast({
            icon: 'none',
            title: '请先选择仓库',
            duration: 1500
          })
          v.skuFocus = false
          v.$nextTick(function() {
            v.skuFocus = true
          })
          return false
        }
        if (!v.skuNum || v.skuNum === '') {
          uni.showToast({
            icon: 'none',
            title: '请先输入SKU',
            duration: 1500
          })
          v.skuFocus = false
          v.$nextTick(function() {
            v.skuFocus = true
          })
          return false
        }
        if (!v.newCargospace || v.newCargospace === '') {
          uni.showToast({
            icon: 'none',
            title: '请输入新货位信息',
            duration: 1500
          })
          v.cargospaceFocus = false
          v.$nextTick(function() {
            v.cargospaceFocus = true
          })
          return false
        }
        if (!v.quantity && v.quantity === 0) {
          uni.showToast({
            icon: 'none',
            title: '数量不能为空并且不能为0',
            duration: 1500
          })
          v.cargospaceFocus = false
          v.skuFocus = false
          v.quantityFocus = false
          v.$nextTick(function() {
            v.quantityFocus = true
          })
          return false
        }
        if (v.goodsArr.length === 0) {
          uni.showToast({
            icon: 'none',
            title: 'sku没有数据,请重新扫描'
          })
          return false
        }
        // if (v.skuDetails.cargoSpace === v.newCargospace) {
        //   uni.showToast({
        //     icon: 'none',
        //     title: '不是有效货位'
        //   })
        //   v.newCargospace = ''
        //   return false
        // }
        let params = {
          type: '01',
          cargoSpace: v.newCargospace,
          goodsSku: v.skuNum,
          goodsDetailId: v.skuDetails.goodsDetailId,
          warehouseId: v.warehouseId,
          qualityControlId: v.goodsArr[v.current].qualityControlId,
          quantity: v.quantity
        }
        console.log('type:', type)
        if (type === 1) {
          params.bound = true
        }
        const obj = {
          url: api.set_newCargoSpace,
          data: params
        }
        uni.showLoading()
        v.ajaxData(obj)
          .then(response => {
            uni.hideLoading()
            if (response.data.code === 0) {
              uni.showToast({
                title: '操作成功',
                duration: 1500
              })
              v.newCargospace = ''
              v.skuNum = ''
              v.quantity = null
              v.quantityFocus = false
              v.cargospaceFocus = false
              v.skuDetails = null
              v.goodsArr = []
              v.skuFocus = true
            } else if (response.data.code < 10) {
              let mes = ''
              let code = response.data.code
              let space = response.data.datas.cargoSpace
              let goodsSku = response.data.datas.goodsSku
              let waitingShipmentStockQuantity = response.data.datas.waitingShipmentStockQuantity || 0;
              code === 1 ? mes = `当前货位已被${space}绑定，是否覆盖` :
                 code === 2 ? mes = `当前货位被(${goodsSku})占用,不允许上架` :
                  code === 3 ? mes = `已经绑定${space}货位,但是原货位上库存为0,待发库存${waitingShipmentStockQuantity},是否覆盖` :
                   code === 4 ? mes = `已绑定${space}货位,请上架到${space}货位` :
                    code === 5 ? mes = `已经绑定${space}货位,但是原货位上库存为0,待发库存${waitingShipmentStockQuantity},是否覆盖` :
                     code === 6 ? mes = `已绑定${space}货位,请上架到${space}货位` :
                      code === 7 ? mes = `当前货位被(${goodsSku})占用,不允许上架` :
                       code === 8 ? mes = `当前货位已被${space}绑定，是否覆盖` :
                        code === 9 ? mes = `当前货位被(${goodsSku})占用,不允许上架` : ``
              if (code === 1 || code === 3 || code === 5 || code === 8) {
                uni.showModal({
                  title: '提示',
                  content: mes,
                  success: function (res) {
                    if (res.confirm) {
                      v.confirmCargospace(1)
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              } else {
                uni.showToast({
                  icon: 'none',
                  title: mes,
                  duration: 2000
                })
              }


            } else {
              uni.showToast({
                icon: 'none',
                title: response.data.message,
                duration: 2500
              })
            }
          })
      }
    },
    onLoad() {
      let v = this
      let loadStoreWarehouse = getStorage('padPurchase')
      if (loadStoreWarehouse) {
        v.warehouseName = loadStoreWarehouse.warehouseName
        v.warehouseId = loadStoreWarehouse.warehouseId
        v.isMoreGoodsShelf = loadStoreWarehouse.isMoreGoodsShelf
      }
      v.getWarehouseList()
        .then(result => {
          if (result) {
            v.$nextTick(function() {
              v.warehouseArr = getStorage('warehouseList')
              if (!v.warehouseId) {
                if (v.warehouseArr.length > 0) {
                  v.warehouseName = v.warehouseArr[0].warehouseName
                  v.warehouseId = v.warehouseArr[0].warehouseId
                  v.isMoreGoodsShelf = v.warehouseArr[0].isMoreGoodsShelf
                } else {
                  uni.showToast({
                    icon: 'none',
                    title: '没有仓库数据',
                    duration: 1500
                  })
                }
              }
            })
          }
        })
    }
  }
</script>

<style scoped>
.goods-box {
  overflow-y: scroll;
  padding-bottom: 50px;
}
.goods-box .d-flex{
  font-size: 12px;
}
</style >
