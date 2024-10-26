<template>
  <view :class="wrap">
    <view class="d-flex justify-content-start normalPadding headLine">
      盘点单：<text>{{stockTakingCode}}</text>
    </view>
    <view class="mu-divider"></view>
    <view class="scanWrap">
      <view class="d-flex justify-content-start align-items-center" v-if="isMoreGoodsShelf === '1'">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="apiData.goodsShelfCode" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" type="text" class="uni-input scanInput" @confirm="scanOriginCagospace" :focus="cargospaceFocus" placeholder="请输入或扫描货位" />
      </view>
      <view class="d-flex justify-content-start align-items-center normal-margin-top">
        <view class="scan" @click="scanSku">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="skuNum" type="text" class="uni-input scanInput" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" @confirm="isMoreGoodsShelf === '1' ? confirmSku() : confirmSingleSku()" :focus="skuFocus" placeholder="SKU条码" />
        <view class="model">
          <checkbox value="cb" :checked="cbChecked" @click="getCBValue" /><text class="text-16">{{cbText}}</text>
        </view>
      </view>
    </view>
    <view class="containerWrap">
      <view class="listWrap">
        <view class="listItem normalPadding" v-for="item in list" :key="item.goodsDetailId">
          <view class="row no-gutters d-flex justify-conent-between align-items-center">
            <image style="width: 200px; height: 200px; background-color: #eeeeee;"  :src="item.goodsImageGroupId" @error="imageError(index)"></image>
          </view>
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
              <text v-if="isMoreGoodsShelf !== '1'">{{item.cargospace}}</text>
              <text v-else>{{item.goodsShelfCode}}</text>
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>货品：</text>
            </view>
            <view class="col col-7">
              <text>{{item.productName}}</text>
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>可用库存：</text>
            </view>
            <view class="col col-8">
              <text>{{item.availableStockQuantity}}</text>
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>待发库存：</text>
            </view>
            <view class="col col-8">
              <text>{{item.waitingShipmentStockQuantity}}</text>
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>可用库存盘点数：</text>
            </view>
            <view class="col col-8">
              <input type="number" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" v-model.trim="item.abNum" @change="updateStorage(item)" class="uni-input changeNum small-uni-input">
            </view>
          </view>
          <view class="row no-gutters  d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>故障品库存：</text>
            </view>
            <view class="col col-8">
              <text>{{item.defectsStockQuantity}}</text>
            </view>
          </view>
          <view class="row no-gutters d-flex justify-conent-between align-items-center">
            <view class="col col-4">
              <text>故障品盘点数：</text>
            </view>
            <view class="col col-8">
              <input type="number" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" v-model.trim="item.dabNum" @change="updateStorage(item)" class="uni-input changeNum small-uni-input">
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
          stockTakingId: null,
          goodsShelfCode: null,
          goodsSku: null
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
      imageError (index) {
        let v = this
        v.list[index].goodsImageGroupId = '../../static/placeholder.jpg'
      },
      checkAllProduct () {
        let v = this
        v.showAllStatus = true
        if (v.isMoreGoodsShelf === '1') {
          v.apiData.goodsShelfCode = ''
        }

        v.skuNum = ''
        v.skuFocus = false
        v.cargospaceFocus = false
        setTimeout(function () {
          if (v.isMoreGoodsShelf === '1') {
            v.cargospaceFocus = true
            v.scanOriginCagospace()
          } else {
            v.skuFocus = true
            v.confirmSingleSku(1)
          }
        }, 500)
      },
      getCBValue (value) {
        let v = this
        v.cbChecked = !v.cbChecked
        console.log(v.cbChecked)
      },
      scanCode () {
        let v = this
        uni.scanCode({
          success: function (res) {
            v.apiData.goodsShelfCode = res.result
            v.$nextTick(function () {
              v.scanOriginCagospace()
            })
          },
          fail: function (error) {
            console.log('error:', error)
          }
        })
      },
      scanSku () {
        let v = this
        uni.scanCode({
          success: function (res) {
            v.skuNum = res.result
            v.$nextTick(function () {
              v.isMoreGoodsShelf === '1' ? v.confirmSku() : v.confirmSingleSku()
            })
          },
          fail: function (error) {
            console.log('error:', error)
          }
        })
      },
      confirmPack () {
        let v = this
        console.log('focusObj:', v.focusObj)
        if (v.focusObj.hasOwnProperty(v.skuNum)) {
          v.focusObj[v.skuNum] = false
          setTimeout(function () {
            v.focusObj[v.skuNum] = true
          }, 300)
          setTimeout(function () {
              v.skuNum = ''
          }, 500)
        }
      },
      inABFocus (index) {
        let v = this
        if (v.cbChecked) {
          if (v.list[index].abNum < 0) {
            v.list[index].abNum = 1
          } else {
            v.list[index].abNum++
          }
        } else {
          if (v.list[index].availableStockQuantity < 0) {
            v.list[index].abNum = 0
          } else {
            v.list[index].abNum = v.list[index].availableStockQuantity
          }
        }

      },
      confirmSingleSku (type) {
        let v = this
        // if (v.skuNum === '') {
        //   uni.showToast({
        //     icon: 'none',
        //     title: '请输入SKU',
        //     duration: 2000
        //   })
        //   v.apiData.goodsSku = ''
        //   v.cargospaceFocus = false
        //   v.skuFocus = false
        //   v.$nextTick(function () {
        //     v.skuFocus = true
        //   })
        //   return false
        // }
        v.apiData.goodsSku = v.skuNum
        v.apiData.lastId = null
        v.list = []
        v.getDetails(type)
      },
      confirmSku () {
        let v = this
        if (v.isMoreGoodsShelf === '1' && (v.apiData.goodsShelfCode === '' || !v.apiData.goodsShelfCode)) {
          uni.showToast({
            icon: 'none',
            title: '请输入货位号',
            duration: 2000
          })
          v.skuNum = ''
          v.cargospaceFocus = false
          v.skuFocus = false
          v.$nextTick(function () {
            v.cargospaceFocus = true
          })
          return false
        }
        if (v.skuNum === '') {
          uni.showToast({
            icon: 'none',
            title: '请输入SKU',
            duration: 2000
          })
          v.apiData.goodsSku = ''
          v.cargospaceFocus = false
          v.skuFocus = false
          v.$nextTick(function () {
            v.skuFocus = true
          })
          return false
        }
        v.apiData.goodsSku = v.skuNum
        v.apiData.lastId = null
        v.list = []
        v.getMoreDataDetails(2)
        // v.confirmPack()

      },

      scanOriginCagospace () {
        let v = this
        // if (!v.apiData.goodsShelfCode && v.apiData.goodsShelfCode === '') {
        //   return false
        // }
        v.apiData.lastId = null
        v.list = []
        console.log(v.apiData.goodsShelfCode)
        if (v.apiData.goodsShelfCode === '' || !v.apiData.goodsShelfCode) {
          v.getMoreDataDetails()
        } else {
          v.getMoreDataDetails(1)
        }

      },
      getMoreDataDetails (type) {
        let v = this
        let params
        if (!type) {
           params = Object.assign({}, v.apiData)
           if (!params.lastId) {
             v.cargospaceFocus = false
             setTimeout(function () {
              v.cargospaceFocus = true
             }, 500)
           }

           delete params.goodsShelfCode
        } else {
          params = Object.assign({}, v.apiData)

        }
        v.loadingType = 1
        const obj = {
          url: api.get_stockGoodsListBySidM,
          data: params
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas

              v.skuNum = ''

              if (data.length > 0) {
                if (v.apiData.goodsShelfCode !== '' && v.apiData.goodsShelfCode) {
                  v.skuFocus = false
                  v.cargospaceFocus = false
                  setTimeout(function () {
                    v.skuFocus = true
                  }, 500)
                  v.showAllStatus = false
                }
                data.forEach((n, i ) => {
                  let storageData = getStorage('inventoryDetails_' + v.apiData.stockTakingId)
                  if (params.goodsSku !== '' && params.goodsSku && !v.cbChecked) { // 非逐个扫描时候，单个SKU逻辑
                   v.showAllStatus = false
                    if (storageData) {
                      let g = false
                      storageData.forEach((m, t) => {
                        if (m.stockTakingDetailId === n.stockTakingDetailId && m.goodsShelfCode === n.goodsShelfCode) {
                          g = true
                          n.abNum = m.availableStockTakingQuantity
                          n.dabNum = m.defectsStockTakingQuantity
                        }
                      })
                      if (!g) {
                        n.abNum = n.availableStockTakingQuantity
                        n.dabNum = n.defectsStockTakingQuantity
                        storageData.push(
                          {
                            goodsShelfCode: n.goodsShelfCode,
                            stockTakingDetailId: n.stockTakingDetailId,
                            availableStockTakingQuantity: n.availableStockTakingQuantity,
                            defectsStockTakingQuantity: n.defectsStockTakingQuantity
                          }
                        )
                      }
                    } else {
                      n.abNum = n.availableStockTakingQuantity
                      n.dabNum = n.defectsStockTakingQuantity
                      storageData = [{
                        goodsShelfCode: n.goodsShelfCode,
                        stockTakingDetailId: n.stockTakingDetailId,
                        availableStockTakingQuantity: n.availableStockTakingQuantity,
                        defectsStockTakingQuantity: n.defectsStockTakingQuantity
                      }]
                    }

                    setStorage('inventoryDetails_' + v.apiData.stockTakingId, storageData)
                  } else if (params.goodsSku !== '' && params.goodsSku && v.cbChecked) { // 逐个扫描
                    if (storageData) {
                      let g = false
                      storageData.forEach((m, t) => {
                        if (m.stockTakingDetailId === n.stockTakingDetailId  && m.goodsShelfCode === n.goodsShelfCode) { // 如果有存储内容，则加1
                          g = true
                          n.abNum = m.availableStockTakingQuantity + 1
                          n.dabNum = m.defectsStockTakingQuantity
                          m.availableStockTakingQuantity = m.availableStockTakingQuantity + 1
                        }
                      })
                      if (!g) {
                        storageData.push(
                          {
                            goodsShelfCode: n.goodsShelfCode,
                            stockTakingDetailId: n.stockTakingDetailId,
                            availableStockTakingQuantity: 1,
                            defectsStockTakingQuantity: n.defectsStockTakingQuantity
                          }
                        )
                      }
                    } else {
                      storageData = [{
                        goodsShelfCode: n.goodsShelfCode,
                        stockTakingDetailId: n.stockTakingDetailId,
                        availableStockTakingQuantity: 1,
                        defectsStockTakingQuantity: n.defectsStockTakingQuantity
                      }]
                    }
                    setStorage('inventoryDetails_' + v.apiData.stockTakingId, storageData)
                  } else { // 如果没有到SKU的逻辑处理
                    if (storageData) {
                      n.abNum = n.availableStockTakingQuantity
                      n.dabNum = n.defectsStockTakingQuantity
                      storageData.forEach((m, t) => {

                        if (m.stockTakingDetailId === n.stockTakingDetailId && m.goodsShelfCode === n.goodsShelfCode) {
                           console.log('~~~')
                           n.abNum = m.availableStockTakingQuantity
                           n.dabNum = m.defectsStockTakingQuantity
                        }
                      })
                    } else {
                      n.abNum = n.availableStockTakingQuantity
                      n.dabNum = n.defectsStockTakingQuantity
                    }
                  }
                })
                v.list = v.list.concat(data)
                v.apiData.lastId = response.data.others.lastId
                v.loadingType = 0

                if (data.length < 10) {
                  v.loadingType = 2
                }
              } else {
                v.showAllStatus = false
                if (v.apiData.goodsSku) {
                  uni.showToast({
                    title: '扫描的sku在该货位不存在',
                    icon: 'none',
                    duration: 2000
                  })
                  v.skuFocus = false
                  v.cargospaceFocus = false
                  // v.apiData.goodsShelfCode = ''
                  setTimeout(function () {
                    v.skuFocus = true
                  }, 500)
                  v.loadingType = 2
                } else {
                  console.log('in in')
                  if (v.list.length === 0) {
                     uni.showToast({
                      title: '该盘点单没有此货位',
                      icon: 'none',
                      duration: 2000
                    })
                    v.skuFocus = false
                    v.cargospaceFocus = false
                    setTimeout(function () {
                      v.cargospaceFocus = true
                    }, 500)
                    v.apiData.goodsShelfCode = ''
                  }


                  v.loadingType = 2
                }

              }
            }
          })
      },
      updateStorage (item) {
        let v = this
        item.abNum = Number(item.abNum)
        item.dabNum = Number(item.dabNum)
        if (v.isMoreGoodsShelf === '1') {
          let storageData = getStorage('inventoryDetails_' + v.apiData.stockTakingId)
          if (storageData) {
            let result = false
            storageData.forEach((n, i) => {
              if (n.stockTakingDetailId === item.stockTakingDetailId && n.goodsShelfCode === item.goodsShelfCode) {
                result = true
                n.defectsStockTakingQuantity = item.dabNum
                n.availableStockTakingQuantity = item.abNum
              }
            })
            if (!result) {
              storageData.push({
                goodsShelfCode: item.goodsShelfCode,
                stockTakingDetailId: item.stockTakingDetailId,
                availableStockTakingQuantity: item.abNum,
                defectsStockTakingQuantity: item.dabNum
              })
            }
            setStorage('inventoryDetails_' + v.apiData.stockTakingId, storageData)
          } else {
            let arr = [
              {
                goodsShelfCode: item.goodsShelfCode,
                stockTakingDetailId: item.stockTakingDetailId,
                availableStockTakingQuantity: item.abNum,
                defectsStockTakingQuantity: item.dabNum
              }
            ]
            setStorage('inventoryDetails_' + v.apiData.stockTakingId, arr)
          }
        } else {
          let storageData = getStorage('inventoryDetails_' + v.apiData.stockTakingId)
          if (storageData) {
            console.log('in one')
            let result = false
            storageData.forEach((n, i) => {
              if (n.stockTakingDetailId === item.stockTakingDetailId) {
                result = true
                n.defectsStockTakingQuantity = item.dabNum
                n.availableStockTakingQuantity = item.abNum
              }
            })
            if (!result) {
              storageData.push({
                stockTakingDetailId: item.stockTakingDetailId,
                availableStockTakingQuantity: item.abNum,
                defectsStockTakingQuantity: item.dabNum
              })
            }
            setStorage('inventoryDetails_' + v.apiData.stockTakingId, storageData)
          } else {
            console.log('in two')
            let arr = [
              {
                stockTakingDetailId: item.stockTakingDetailId,
                availableStockTakingQuantity: item.abNum,
                defectsStockTakingQuantity: item.dabNum
              }
            ]
            setStorage('inventoryDetails_' + v.apiData.stockTakingId, arr)
          }
        }
      },
      getDetails(type) {
        let v = this
        v.loadingType = 1
        let params = Object.assign({}, v.apiData)
        if (params.hasOwnProperty('goodsShelfCode')) {
          delete params.goodsShelfCode
        }
        const obj = {
          url: api.get_stockGoodsListBySid,
          data: params
        }
        v.skuNum = ''
        v.skuFocus = false
        setTimeout(function () {
          v.skuFocus = true
        }, 500)
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas
              if (data.length === 0) {
                uni.showToast({
                  title: '该盘点单上没有此SKU',
                  icon: 'none',
                  duration: 2000
                })
                v.loadingType = 2
                return false
              }
              if (params.goodsSku !== '' && params.goodsSku) {
                v.showAllStatus = false
              }
              data.forEach((n, i) => {
                let storageData = getStorage('inventoryDetails_' + v.apiData.stockTakingId)
                if (!v.cbChecked) { // 非逐个扫描时候，单个SKU逻辑
                  if (storageData) {
                    console.log('in two')
                    let g = false
                    storageData.forEach((m, t) => {
                      if (m.stockTakingDetailId === n.stockTakingDetailId) {

                        g = true
                        n.abNum = m.availableStockTakingQuantity
                        n.dabNum = m.defectsStockTakingQuantity
                      }
                    })
                    if (!g) {
                      n.abNum = n.availableStockQuantity
                      n.dabNum = n.defectsStockQuantity
                      storageData.push(
                        {
                          stockTakingDetailId: n.stockTakingDetailId,
                          availableStockTakingQuantity: n.availableStockQuantity,
                          defectsStockTakingQuantity: n.defectsStockQuantity
                        }
                      )
                    }
                  } else {
                    console.log('in this')
                    n.abNum = n.availableStockQuantity
                    n.dabNum = n.defectsStockQuantity
                    storageData = [{
                      stockTakingDetailId: n.stockTakingDetailId,
                      availableStockTakingQuantity: n.availableStockQuantity,
                      defectsStockTakingQuantity: n.defectsStockQuantity
                    }]
                  }

                  setStorage('inventoryDetails_' + v.apiData.stockTakingId, storageData) //
                } else if (v.cbChecked) { // 逐个扫描
                  if (storageData) {
                    let g = false
                    storageData.forEach((m, t) => {
                      if (m.stockTakingDetailId === n.stockTakingDetailId) { // 如果有存储内容，则加1
                        g = true
                        if (type !== 1) {
                          n.abNum = m.availableStockTakingQuantity + 1
                          n.dabNum = m.defectsStockTakingQuantity
                          m.availableStockTakingQuantity = m.availableStockTakingQuantity + 1
                          m.defectsStockTakingQuantity = m.defectsStockTakingQuantity
                        } else {
                          n.abNum = m.availableStockTakingQuantity
                          n.dabNum = m.defectsStockTakingQuantity
                        }

                      }
                    })
                    if (!g && type !== 1) {
                      storageData.push(
                        {
                          stockTakingDetailId: n.stockTakingDetailId,
                          availableStockTakingQuantity: 1,
                          defectsStockTakingQuantity: n.defectsStockTakingQuantity
                        }
                      )
                    }
                    setStorage('inventoryDetails_' + v.apiData.stockTakingId, storageData)
                  } else {
                    if (type !== 1) {
                      storageData = [{
                        stockTakingDetailId: n.stockTakingDetailId,
                        availableStockTakingQuantity: 1,
                        defectsStockTakingQuantity: n.defectsStockTakingQuantity
                      }]
                      setStorage('inventoryDetails_' + v.apiData.stockTakingId, storageData)
                    }

                  }

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
        let storage = getStorage('inventoryDetails_' + v.apiData.stockTakingId)
        if (storage && storage.length > 0) {
          const obj = {
            url: api.set_stockSave,
            data: {
              stockTakingId: v.apiData.stockTakingId,
              datas: JSON.stringify(storage)
            }
          }
          uni.showLoading()
          v.ajaxData(obj)
            .then(response => {
              uni.hideLoading()
              if (response.data.code === 0) {
                uni.showToast({
                  icon: 'none',
                  title: '提交成功',
                  mask: false,
                  duration: 1500
                })
                v.list = []
                removeStorage('inventoryDetails_' + v.apiData.stockTakingId)
                setTimeout(function (){
                  uni.navigateBack()
                }, 1000)
              } else {
                uni.showToast({
                  title: response.data.message,
                  icon: 'none',
                  duration: 1500
                })
              }
            })
        } else {
          let newArr = []
          v.list.forEach((n, i) => {
            newArr.push({
              stockTakingDetailId: n.stockTakingDetailId,
              availableStockTakingQuantity: n.availableStockTakingQuantity,
              defectsStockTakingQuantity: n.defectsStockTakingQuantity
            })
          })
          const obj = {
            url: api.set_stockSave,
            data: {
              stockTakingId: v.apiData.stockTakingId,
              datas: JSON.stringify(newArr)
            }
          }
          uni.showLoading()
          v.ajaxData(obj)
            .then(response => {
              uni.hideLoading()
              if (response.data.code === 0) {
                uni.showToast({
                  icon: 'none',
                  title: '提交成功',
                  mask: false,
                  duration: 1500
                })
                v.list = []
                setTimeout(function (){
                  uni.navigateBack()
                }, 1000)
              } else {
                uni.showToast({
                  title: response.data.message,
                  icon: 'none',
                  duration: 1500
                })
              }
            })
        }
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
      let v = this
      // let storage = getStorage('inventoryDetails_' + v.apiData.stockTakingId)
      // if (v.list.length > 0 && storage && storage.length > 0) {
      //   v.list.forEach((n, i) => {
      //     storage.forEach((m, t) => {
      //       if (n.stockTakingDetailId === m.stockTakingDetailId) {
      //         n.availableStockTakingQuantity = m.availableStockTakingQuantity
      //         n.defectsStockTakingQuantity = m.defectsStockTakingQuantity
      //       }
      //     })
      //   })
      // }
    },
    onLoad(options) {
      let v = this
      let loadStoreWarehouse = getStorage('inventorQueryVerification')
      if (loadStoreWarehouse) {
        v.isMoreGoodsShelf = loadStoreWarehouse.isMoreGoodsShelf
      }
      // options = {stockTakingId: "0001000557201805280029820712", stockTakingStatus: "1", stockTakingCode: "IS00000048", randomUuid: "IS00000048", warehouseId: "0001000557201606160000105310"},
      v.apiData.stockTakingId = options.stockTakingId
      v.stockTakingStatus = options.stockTakingStatus
      v.stockTakingCode = options.stockTakingCode
      v.randomUuid = options.randomUuid
      v.warehouseId = options.warehouseId
      if (v.isMoreGoodsShelf === '1') {
        v.getMoreDataDetails()
      } else {
        v.getDetails()
      }

    },
    onReady() {

    },
		onReachBottom () {
      let v = this
			if (v.loadingType !== 0) {
				return
			}

      if (v.isMoreGoodsShelf === '1') {
        if (v.apiData.goodsShelfCode === '' || !v.apiData.goodsShelfCode) {
          v.getMoreDataDetails()
        } else {
          v.getMoreDataDetails(1)
        }
      } else {
        v.getDetails()
      }
		}
  }
</script>

