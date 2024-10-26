<template>
  <view :class="wrap">
    <view class="d-flex normalPadding justify-content-start headTitle">
      <text v-if="pickingResult"><text>货品名称:</text> {{pickingResult.productName}}</text>
    </view>
    <view class="scanWrap cargospaceWrap">
      <view class="d-flex justify-content-between">
        <view class="cargospaceTitle" v-if="pickingResult">货位：<text class="font-size-big">{{pickingResult.cargoSpace}}</text></view>

        <view>
          <view v-if="isMoreGoodsShelf !== '1'" class="switch d-flex justify-content-end">
            <switch :checked="cargospaceStatus" @change="switchChange" />
          </view>
          <!-- <button v-if="isMoreGoodsShelf === '1'" type="primary" size="mini" @click="selectPicking">选择拣货货位</button> -->
        </view>

      </view>
      <view class="d-flex justify-content-start align-items-center scanCargospace" v-if="cargospaceStatus || isMoreGoodsShelf === '1'">
        <view class="scan" @click="scanCargospace">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="cargoSpaceId" type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input scanInput" @confirm="cargoSpaceblur" :focus="cargospaceFocus" placeholder="请扫描货位" />
      </view>
    </view>
    <view class="scanWrap">
      <view class="d-flex justify-content-between align-items-center align-content-between skuName">
        <view class="skuNameItem">SKU：<text v-if="pickingResult"  class="font-size-big">{{pickingResult.goodsSku}}</text></view>
        <view :class="modeStatusStyle">
          <button type="primary" size="mini" @click="changeModeStatus">
            {{modeStatus ? '切换到逐个扫描' : '切换普通扫描'}}
          </button>
        </view>
      </view>
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanSku">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="skuNo" type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input scanInput" ref="skuRef" @confirm="skuBlur" :focus="skuFocus" placeholder="SKU条码" />
      </view>
      <view class="row no-gutters normalPadding pickingStatus">
        <view class="col col-6">
          待拣： <text v-if="pickingResult"  class="font-size-big">{{pickingResult.quantity}}</text>
        </view>
        <view class="col col-6">
          已拣： <text v-if="pickingResult"  class="font-size-big">{{pickingResult.pickingQuantity}}</text>
        </view>
      </view>
    </view>
    <view class="d-flex justify-content-center normalPadding align-items-center" v-if="pickingResult">
      <image :src="newErpPrefix + pickingResult.goodsImageGroupId"></image>
    </view>
    <view class="bottomBit row no-gutters">
      <view class="col d-flex justify-content-center align-tiems-center" v-if="useBasket" >
        <button type="default" class="yellow" size="mini" @click="changePackage">换篮子</button>
      </view>
      <view class="col d-flex justify-content-center align-tiems-center" :class="useBasket ? 'col-6' : 'col-12'">
        <button type="primary" class="primary" size="mini" @click="goNextSku()">下一个</button>
      </view>
    </view>
  </view>
</template>

<script>
  import Mixin from '@/mixin/common_mixin'
  import api from '@/api/api'
  const prefixCls = 'tongtool-workspace-productPickingDetails'
  import {
    setStorage,
    getStorage,
    removeStorage
  } from '@/utils'
  export default {
    mixins: [Mixin],
    data() {
      return {
        useBasket: true,
        pickingListCode: null,
        index: null,
        warehouseId: null,
        pickingListId: null,
        cargospaceFocus: false,
        skuFocus: false,
        cargospaceStatus: true, // 是否开启货位校验
        modeStatus: false,
        cacheData: null,
        pickingResult: null,
        cargoSpaceId: null,
        cargoSpaceAuthStatus: false,
        skuNo: '',
        isMoreGoodsShelf: null,
        skuDetailsData: null
      }
    },
    methods: {
      selectPicking () {
        let  v = this
        let arr = []
        v.cacheData.forEach((n, i) => {
          arr.push(n.cargoSpace + `(待拣:${n.quantity},已拣:${n.pickingQuantity})`)
        })
        console.log(JSON.stringify(arr))
        uni.showActionSheet({
          itemList: arr,
          success: function (res) {
            let index = res.tapIndex
            v.cargoSpaceId = arr[res.tapIndex].split('(')[0]
            v.pickingResult = Object.assign(v.cacheData[res.tapIndex], v.skuDetailsData)
            // v.getMoreM(v.cargoSpaceId, v.cacheData[res.tapIndex].goodsSku)
            v.skuFocus = false
            v.$nextTick(function () {
              v.skuFocus = true
            })
          }
        })
      },
      getMoreM (cargospace, goodsSku) {
        let v = this
        uni.showLoading()
        const obj = {
          url: api.get_queryStockByGoodsShelfM,
          data: {
            cargoSpace: cargospace,
            goodsSku: goodsSku,
            warehouseId: v.warehouseId
          }
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              console.log('res:', response.data.datas)
            }
          })
      },
      changePackage() {
        let v = this
        uni.redirectTo({
          url: '/pages/workspace/scanPackage' + '?pickingListId=' + v.pickingListId + '&pickingListCode=' + v.pickingListCode +
            '&warehouseId=' + v.warehouseId
        })
      },
      scanCargospace() {
        let v = this
        uni.scanCode({
          success: function(res) {
            v.cargoSpaceId = res.result
            v.cargoSpaceblur()
            console.log('条码类型：' + res.scanType)
            console.log('条码内容：' + res.result)
          },
          fail: function(error) {
            console.log('error:', error)
          }
        })
      },
      scanSku() {
        let v = this
        uni.scanCode({
          success: function(res) {
            console.log('条码类型x：' + res.scanType)
            console.log('条码内容x：' + res.result)
            v.skuNo = res.result
            console.log(v.skuNo)
            v.$nextTick(function() {
              v.skuBlur()
            })
          },
          fail: function(error) {
            console.log('error:', error)
          }
        })
      },
      switchChange(e) {
        this.cargospaceStatus = e.target.value
      },
      changeModeStatus() {
        let v = this //
        if (v.modeStatus) {
          uni.showModal({
            title: '',
            content: '是否切换到逐个扫描',
            confirmText: "确定",
            success: function(res) {
              if (res.confirm) {
                v.modeStatus = false
              }
            }
          })
        } else {
          uni.showModal({
            title: '',
            content: '是否切换为普通扫描，切换后已拣数将会清零',
            confirmText: "确定",
            success: function(res) {
              if (res.confirm) {
                v.modeStatus = true
                v.pickingResult.pickingQuantity = 0
              }
            }
          })
        }
      },
      getPickinglist(type) {
        let v = this
        v.pickingResult = null
        uni.showLoading({
        	title: '数据加载中'
        })
        const obj = {
          url: api.get_goodsDetailBySKU,
          type: 'GET',
          data: {
            goodsSku: encodeURIComponent(v.cacheData[v.index].goodsSku)
          }
        }
        v.ajaxData(obj)
          .then(response => {
            uni.hideLoading()
            if (response.data.code === 0) {
              console.log('--------------')
              console.log(response.data.datas)
              v.skuDetailsData = response.data.datas
              v.pickingResult = Object.assign(v.cacheData[v.index], response.data.datas)
            }
          })
      },
      cargoSpaceblur() {
        let v = this
        return new Promise(resolve => {
          if (!v.cargospaceStatus) {
            resolve(true)
            return false
          }
          if (v.cargoSpaceId) {
            if (!(/^[A-Za-z0-9_\-/.#()\[\]]{1,30}$/.test(v.cargoSpaceId))) {
              uni.showToast({
                icon: 'none',
                title: '货位不匹配',
                duration: 1500
              })
              v.cargoSpaceAuthStatus = false
              v.cargospaceFocus = false
              console.log('~~~~~')
              setTimeout(function() {
                v.cargospaceFocus = true
              }, 1500)
            }
          }
          if (v.cargoSpaceId === v.pickingResult.cargoSpace) {
            v.cargoSpaceAuthStatus = true
            v.cargospaceFocus = false
            uni.showToast({
              icon: 'none',
              title: '货位校验成功',
              duration: 1500
            })
            setTimeout(function() {
              v.skuFocus = true
            }, 1500)

            resolve(true)
          } else {
            if (v.cargoSpaceId) {
              uni.showToast({
                icon: 'none',
                title: '货位不匹配',
                duration: 1500
              })
              v.cargoSpaceId = ''
              v.cargoSpaceAuthStatus = false
              v.cargospaceFocus = false
              v.skuFocus = false
              console.log('gggggggggggggggggg')
              setTimeout(function() {
                v.cargospaceFocus = true
              }, 500)
            } else {
              uni.showToast({
                icon: 'none',
                title: '请输入货位',
                duration: 1500
              })
              v.cargoSpaceAuthStatus = false
              v.cargospaceFocus = false
              setTimeout(function() {
                v.cargospaceFocus = true
              }, 500)
            }

          }
        })

      },
      skuBlur() {
        let v = this
        v.cargoSpaceblur()
          .then(result => {
            if (result) {
              if (!v.skuNo) {
                return false
              }
              console.log(v.pickingResult.goodsSku)
              let skuLabel = [];
              if (v.pickingResult.skuLabel) {
                skuLabel = v.pickingResult.skuLabel.split('\n');
              }
              if (v.skuNo === v.pickingResult.goodsSku || (skuLabel.length && skuLabel.includes(v.skuNo))) {
                console.log('in')
                console.log('v.mode:' + v.modeStatus)
                console.log('cargoSpaceAuthStatus:', v.cargoSpaceAuthStatus)
                if (v.modeStatus) {
                  if (!v.pickingResult.cargoSpace || (v.pickingResult.cargoSpace && !v.cargospaceStatus)) {
                    v.cargoSpaceAuthStatus = false
                  }
                  console.log('cargoSpaceAuthStatus1:', v.cargoSpaceAuthStatus)
                  if (v.cargoSpaceAuthStatus) { // 货位校验
                    if (v.cargoSpaceId === v.pickingResult.cargoSpace) {
                      v.pickingResult.pickingQuantity = v.pickingResult.quantity
                    } else {
                      console.log('2~')
                      uni.showToast({
                        icon: 'none',
                        title: '货位未校验',
                        duration: 1500
                      })
                    }
                  } else {
                    uni.showToast({
                      icon: 'none',
                      title: '校验通过',
                      duration: 1500
                    })
                    v.pickingResult.pickingQuantity = v.pickingResult.quantity
                    v.skuFocus = false
                    setTimeout(function() {
                      v.skuFocus = true
                    }, 2000)
                  }
                } else {
                  console.log('on')
                  if (v.pickingResult.pickingQuantity !== v.pickingResult.quantity) {
                    console.log('on1')
                    console.log(v.cargoSpaceAuthStatus)
                    if (!v.pickingResult.cargoSpace || (v.pickingResult.cargoSpace && !v.cargospaceStatus)) {
                      v.cargoSpaceAuthStatus = false
                    }
                    if (v.cargoSpaceAuthStatus) { // 货位校验
                      if (v.cargoSpaceId === v.pickingResult.cargoSpace) {
                        v.skuNo = ''
                        v.pickingResult.pickingQuantity++;
                        if (v.pickingResult.pickingQuantity < v.pickingResult.quantity) {
                          v.$nextTick(function() {
                            v.skuFocus = false
                            setTimeout(function() {
                              v.skuFocus = true
                            }, 1000)
                          })
                          v.setStorageData() // 更新缓存数据
                        }
                      } else {
                        console.log('1~~')
                        uni.showToast({
                          icon: 'none',
                          title: '货位未校验',
                          duration: 1500
                        })
                      }
                    } else {
                      console.log('xxjkjxk')
                      v.pickingResult.pickingQuantity++;
                      if (v.pickingResult.pickingQuantity < v.pickingResult.quantity) {
                        v.setStorageData(); // 更新缓存数据
                      }
                      uni.showToast({
                        icon: 'none',
                        title: '校验通过',
                        duration: 500
                      })
                      v.skuNo = ''
                      v.$nextTick(function () {
                        v.skuFocus = false
                         setTimeout(function() {
                          v.skuFocus = true
                        }, 1000)
                      })

                    }
                  }
                }
                if (v.pickingResult.pickingQuantity === v.pickingResult.quantity) {
                  v.setStorageData() // 更新缓存数据
                  if (v.checkSkuStatus() < 0) {
                    uni.showModal({
                      title: '',
                      content: '当前拣货单已经完成，是否标记已完成',
                      success: (res) => {
                        if (res.confirm) {
                          v.markPickingFinish()
                        }
                      }
                    })
                  } else { // 进行当前拣货单下一个SKU
                    console.log('bnbb')
                    v.skuNo = ''
                    v.$nextTick(function () {
                      v.goNextSku(1)
                    })
                  }
                }
              } else {
                uni.showToast({
                  title: 'SKU不匹配',
                  icon: 'none',
                  duration: 1500
                })
                v.$nextTick(function() {
                  v.skuFocus = false
                  setTimeout(function() {
                    v.skuFocus = true
                  }, 1000)
                })
              }
            }
          })

      },
      goNextSku(type) { // type 区别调用来源
        let v = this
        v.cargoSpaceId = null
        v.skuNo = null
        let index = v.index
        if (type) {
          index = index - 1
        }
        if (index < v.cacheData.length - 1) {
          let nextIndex = v.cacheData.findIndex((n, i) => {
            if (i > index && n.pickingQuantity !== n.quantity) {
              return n
            }
          })
          if (nextIndex > 0) {
            v.index = nextIndex
            v.init()
          } else {
            v.checkAllSku(type)
          }
        } else {
          v.checkAllSku(type)
        }
      },
      init() {
        let v = this
        console.log('``qq')
        let pickingSettings = getStorage('settingsConfigObj')
        if (!pickingSettings) {
          console.log('a1')
          v.cargospaceStatus = true
          v.modeStatus = true
        } else {
          console.log(123)
          if (pickingSettings.scanMode === '1') {
            v.modeStatus = true
          } else {
            v.modeStatus = false
          }
          console.log('pc:', pickingSettings.checkCargo)
          if (pickingSettings.checkCargo === '1') {
            console.log('a222')
            v.cargospaceStatus = true
            v.cargospaceFocus = false
            v.$nextTick(function() {
              v.cargospaceFocus = true
            })
          } else {
            console.log('23')
            v.cargospaceStatus = false
            v.$nextTick(function() {
              v.skuFocus = true
            })
          }
        }
        v.$nextTick(function() {
          v.getPickinglist()
        })

      },
      checkAllSku(type) {
        let v = this
        let nextIndex = v.checkSkuStatus()
        console.log(nextIndex)
        if (nextIndex >= 0 && ((nextIndex !== v.index && !type) || type)) {
          v.index = nextIndex
          v.init()
        } else {
          uni.showToast({
            icon: 'none',
            title: '已经没有下个sku了',
            duration: 1500
          })
        }
      },
      markPickingFinish() { // 标记拣货完成
        let v = this
        const obj = {
          url: api.set_markFinished,
          type: 'GET',
          data: {
            pickingListId: v.pickingListId
          }
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              uni.showToast({
                icon: 'none',
                title: '标记成功',
                duration: 1500
              })
              let pickingNoStorage = getStorage('picking_warehouse_' + v.warehouseId + '_waitList')
              if (!pickingNoStorage) {
                uni.switchTab({
                  url: '/pages/workspace/workspace?toPage=pickingList'
                })
              } else {
                pickingNoStorage.forEach((n, i) => {
                  if (n.pickingListCode === v.pickingListCode) {
                    let hasBeenPickingList = getStorage('picking_warehouse_' + v.warehouseId + '_alreadyList')
                    if (hasBeenPickingList) {
                      hasBeenPickingList.push(n)
                    } else {
                      hasBeenPickingList = [n]
                    }
                    setStorage('picking_warehouse_' + v.warehouseId + '_alreadyList', hasBeenPickingList)
                    uni.switchTab({
                      url: '/pages/workspace/workspace?toPage=pickingList'
                    })
                  }
                })
              }
            }
          })
      },
      checkSkuStatus() {
        let v = this;
        let nextIndex = v.cacheData.findIndex((n, i) => {
          if (n.pickingQuantity !== n.quantity) {
            return n;
          }
        });
        return nextIndex;
      },
      setStorageData() { // 更新缓存
        let v = this
        let index = v.index
        if (v.cacheData[index].quantity === v.cacheData[index].pickingQuantity) {
          if (v.cacheData.length > 1) {
            let skuItem = Object.assign({}, v.cacheData[index]);
            v.cacheData.splice(index, 1)
            v.cacheData.push(skuItem)
          }
          let pickingNo = Number(getStorage('pdl_' + v.pickingListId + '_pickingNo'))
          if (pickingNo < v.cacheData.length) {
            setStorage('pdl_' + v.pickingListId + '_pickingNo', pickingNo + 1)
          }
          setStorage('pdl_' + v.pickingListId, v.cacheData)
        } else {
          setStorage('pdl_' + v.pickingListId, v.cacheData)
        }
      }
    },
    computed: {
      wrap() {
        return `${prefixCls}`
      },
      modeStatusStyle() {
        if (this.modeStatus) {
          return 'modeStatus'
        } else {
          return ''
        }
      }
    },
    onLoad (options) {
      let v = this
      v.pickingListCode = options.pickingListCode
      v.index = options.index
      v.warehouseId = options.warehouseId
      v.pickingListId = options.pickingListId
      v.cacheData = getStorage('pdl_' + options.pickingListId)
      let loadStoreWarehouse = getStorage('inventorQuery')
      if (loadStoreWarehouse) {
        v.isMoreGoodsShelf =loadStoreWarehouse.isMoreGoodsShelf
      }
      let pickingSettings = getStorage('settingsConfigObj')
      if (pickingSettings.useBasket !== '1') {
        v.useBasket = false
      }
      v.init()
    },
    onShow () {
      let v = this
      let pages = getCurrentPages()
      let currPage = pages[pages.length - 1]
      if (currPage.data.id) {
        console.log('inShow')
        let obj = JSON.parse(currPage.data.id)
        v.cargoSpaceId = obj.cargoSpace
        v.skuFocus = false
        v.$nextTick(function () {
          v.skuFocus = true
        })
      }
    }
  }
</script>
