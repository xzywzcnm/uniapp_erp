<template>
  <view :class="wrap">
    <view class="d-flex justify-content-between warehouseHeadline">
      <view class="headTitle">
        <text>{{warehouseName}}</text>
      </view>
      <picker @change="warehouseChange" @click="warehouseClick" :value="warehouseIndex" mode="selector" range-key="warehouseName" :range="warehouseArr">
        <view class="selectWarehouse">
          <text class="icon iconfont">&#xe615;</text>
          <text>选择仓库 </text>
        </view>
      </picker>
    </view>
    <view class="mu-divider"></view>
    <view class="scanWrap">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <view class="selectType">
           <view class="d-flex justify-content-between align-items-center" @click="selectSearchType">
            <view class="uni-input">{{value}}</view>
            <text class="icon iconfont">&#xe61c;</text>
          </view>
        </view>
        <input v-model.trim="skuValue" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" type="text" class="uni-input scanInput" :focus="skuFocus" @confirm="showSkuValue" :placeholder="skuPlaceholder" />
      </view>
    </view>
    <view class="mu-divider"></view>
    <!-- <view class="normalPadding errorSquare d-flex justify-content-center align-items-center">
      <text>{{errorText}}</text>
    </view> -->
    <view class="d-flex justify-content-between align-items-center controlLine" v-if="productMes && productMes.length > 0 && showProduct">
      <text class="icon iconfont" @click="turnLeft">&#xe952;</text>
      <text>{{current + 1}}/{{productMes.length}}</text>
      <text class="icon iconfont" @click="turnRight">&#xe655;</text>
    </view>
    <view class="productContainer" v-if="showProduct && productMes && productMes.length > 0">
      <view class="d-flex justify-content-center align-items-center" v-if="showProduct">
        <image :src="productMes[current].goodsImageGroupId"></image>
      </view>
    </view>
    <view v-if="showProduct" class="fix-card">
      <view class="row no-gutters">
        <view class="col col-12">SKU: <text class="fontWeight">{{productMes[current].goodsSku}}</text></view>
      </view>
      <view class="row no-gutters">
        <view class="col col-12" v-if="isMoreGoodsShelf !== '1' && productMes[current].cargoSpace">货位: <text class="fontWeight">{{productMes[current].cargoSpace}}</text></view>
      </view>
      <view class="d-flex ">
        <view>货品名称: <text class="fontWeight">{{productMes[current].productName}}</text></view>
      </view>
      <view class="row no-gutters">
        <view class="col col-6">可用库存: <text class="fontWeight">{{productMes[current].availableStockQuantitySum || productMes[current].availableStockQuantity}}</text></view>
        <view class="col col-6">在途库存: <text class="fontWeight">{{productMes[current].intransitStockQuantitySum || productMes[current].intransitStockQuantity}}</text></view>
      </view>
      <view class="row no-gutters">
        <view class="col col-6">待发库存: <text class="fontWeight">{{productMes[current].waitingShipmentStockQuantitySum || productMes[current].waitingShipmentStockQuantity}}</text></view>
        <view class="col col-6">故障品库存: <text class="fontWeight">{{productMes[current].defectsStockQuantitySum || productMes[current].defectsStockQuantity}}</text></view>
      </view>
      <view class="enbaleWarehouseList">
        <view class="enableWarehouseItem" v-for="item in productMes[current].moreStorage" :key="item">
          <view class="d-flex justify-content-start align-items-center warehouseStorage">
            货位：{{item.goodsShelfCode}}
          </view>
          <view class="d-flex justify-content-between align-items-center warehouseEnableStorage">
            <text>
              可用库存：{{item.availableStockQuantity}}
            </text>
            <text>
              故障品库存： {{item.defectsStockQuantity}}
            </text>
          </view>
          <view class="mu-divider"></view>
        </view>
      </view>
    </view>
    <view class="bottomBit">
      <view v-if="showProduct" class="fix-card">
        <view class="row no-gutters">
          <view class="col col-12">SKU: <text class="fontWeight">{{productMes[current].goodsSku}}</text></view>
        </view>
        <view class="row no-gutters">
          <view class="col col-12" v-if="isMoreGoodsShelf !== '1' && productMes[current].cargoSpace">货位: <text class="fontWeight">{{productMes[current].cargoSpace}}</text></view>
        </view>
        <view class="d-flex ">
          <view>货品名称: <text class="fontWeight">{{productMes[current].productName}}</text></view>
        </view>
        <view class="row no-gutters">
          <view class="col col-6">可用库存: <text class="fontWeight">{{productMes[current].availableStockQuantitySum || productMes[current].availableStockQuantity}}</text></view>
          <view class="col col-6">在途库存: <text class="fontWeight">{{productMes[current].intransitStockQuantitySum || productMes[current].intransitStockQuantity}}</text></view>
        </view>
        <view class="row no-gutters">
          <view class="col col-6">待发库存: <text class="fontWeight">{{productMes[current].waitingShipmentStockQuantitySum || productMes[current].waitingShipmentStockQuantity}}</text></view>
          <view class="col col-6">故障品库存: <text class="fontWeight">{{productMes[current].defectsStockQuantitySum || productMes[current].defectsStockQuantity}}</text></view>
        </view>
        <view class="enbaleWarehouseList">
          <view class="enableWarehouseItem" v-for="item in productMes[current].moreStorage" :key="item">
            <view class="d-flex justify-content-start align-items-center warehouseStorage">
              货位：{{item.goodsShelfCode}}
            </view>
            <view class="d-flex justify-content-between align-items-center warehouseEnableStorage">
              <text>
                可用库存：{{item.availableStockQuantity}}
              </text>
              <text>
                故障品库存： {{item.defectsStockQuantity}}
              </text>
            </view>
            <view class="mu-divider"></view>
          </view>
        </view>
      </view>
      <view class="d-flex justify-content-center align-items-center">
        <button type="primary" size="mini" @click="showSkuValue">查询</button>
      </view>
    </view>
    <!-- <imgLoad ref="imgLoad"></imgLoad> -->
  </view>
</template>
<style>
  picker-view {
    width: 100%;
    height: 600upx;
    margin-top:20upx;
  }

  .item {
    line-height: 100upx;
    text-align: center;
  }
  .fontWeight {
    font-weight: bold;
  }
  .fix-card {
    padding: 0 15px;
  }
</style>
<script>
  import Mixin from '@/mixin/common_mixin'
  import api from '@/api/api'
  // import imgLoad from 'mpvue-img-load'
  const prefixCls = 'tongtool-workspace-inventorQuery'
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
        value: 'SKU',
        visible: false,
        skuFocus: true,
        errorText: '请输入SKU',
        productSrc: null,
        showProduct: false,
        skuIndex: 0,
        warehouseIndex: 0,
        warehouseName: '选择仓库',
        skuArray: ['SKU', '货位'],
        skuValue: '',
        warehouseArr: ['选择仓库'],
        productMes: [],
        skuPlaceholder: '输入SKU',
        isMoreGoodsShelf: null
      }
    },
    // components: {
    //   imgLoad
    // },
    computed: {
      wrap() {
        return `${prefixCls}`
      }
    },
    watch: {
      skuIndex(n, o) {
        let v = this
        console.log('typeof:' + typeof n)
        console.log('n:' + n)
        if (n === 0) {
          v.value = 'SKU'
          v.errorText = '请输入SKU'
          v.skuPlaceholder = '请输入SKU'
        } else if (n === 1) {
          v.value = '货位'
          v.errorText = '请输入货位'
          v.skuPlaceholder = '请输入货位'
        }
      }
    },
    methods: {
      // makeDataImg (data) { // 处理图片是否能加载
      //   let v = this
      //   console.log('data1:', data)
      //   return new Promise(resolve => {
      //     data.forEach((item, index, list) => {
      //       item.loaded = false
      //       console.log('~~~~~')
      //       console.log(v.$refs.imgLoad)
      //     	v.$refs.imgLoad.load(item.goodsImageGroupId, (err, imgData) => {
      //         console.log(err)
      //         if (!err) {
      //           item.loaded = true
      //         } else {
      //           item.goodsImageGroupId = '/static/placeholder.jpg'
      //         }
      //         console.log('index:', index)
      //         if (index === data.length - 1) {
      //           resolve(data)
      //         }
      //     	})
      //     })
      //   })
      // },
      selectSearchType () {
        let v = this
        uni.showActionSheet({
          itemList: v.skuArray,
          success: function(res) {
            v.skuIndex = res.tapIndex
          }
        })
      },
      showSkuValue() {
        let v = this
        console.log('~~~')
        // let selectWarehouse = getStorage('inventorQuery')
        // if (!selectWarehouse) {
        //   console.log('`')
        //   v.errorText = '请先选择仓库'
        //   return false
        // }
        if (v.skuValue === '' || !v.skuValue) {
          uni.showToast({
            title: v.skuIndex === 0 ? 'SKU不能为空' : '货位不能为空',
            icon: 'none',
            duration: 2000
          })
          // console.log('skuIndex:', typeof v.skuIndex)
          // console.log('skuIndex:', v.skuIndex)
          // v.errorText = v.skuIndex === 0 ? 'SKU不能为空' : '货位不能为空'
          return false
        }

        uni.showLoading({
          title: '查询中'
        })
        let url
        if (v.isMoreGoodsShelf === '1' && v.skuIndex === 0) {
          url = api.get_queryStockByGoodsSkuM
        } else if (v.isMoreGoodsShelf === '1' && v.skuIndex !== 0) {
          url = api.get_queryStockByGoodsShelfM
        } else {
          url = v.skuIndex === 0 ? api.get_queryStockByGoodsSku : api.get_queryStockByCargoSpace
        }
        console.log('url:', url)
        let parmasData = null
        if (v.skuIndex === 0) {
          parmasData = {
            goodsSku: v.skuValue,
            warehouseId: v.warehouseId
          }
        } else {
          parmasData = {
            cargoSpace: v.skuValue,
            warehouseId: v.warehouseId
          }
        }
        const obj = {
          url: url,
          data: parmasData
        }
        v.productMes = []
        v.ajaxData(obj)
          .then(response => {
            uni.hideLoading()
            if (response.data.code === 0) {
              if (!response.data.datas || response.data.datas.length === 0) {
                uni.showToast({
                  title: '没有查询到相关数据',
                  icon: 'none',
                  duration: 2000
                })
                return false
              }
              let data
              if (v.isMoreGoodsShelf === '1' && v.skuIndex === 0) {
                let moreData = response.data.datas
                let goodsObj
                goodsObj = Object.assign({}, moreData[0])
                goodsObj.moreStorage = []
                moreData.forEach((n, i) => {
                  goodsObj.moreStorage.push({
                    goodsShelfCode: n.goodsShelfCode,
                    availableStockQuantity: n.availableStockQuantity,
                    defectsStockQuantity: n.defectsStockQuantity
                  })
                })
                console.log(goodsObj)
                data = [Object.assign({}, goodsObj)]
              } else if (v.isMoreGoodsShelf === '1' && v.skuIndex === 1) {
                data = response.data.datas
                data.forEach((n, i) => {
                  n.moreStorage = [
                    {
                      goodsShelfCode: n.cargoSpace,
                      availableStockQuantity: n.availableStockQuantity,
                      defectsStockQuantity: n.defectsStockQuantity
                    }
                  ]
                })
                console.log(data)
              } else if (v.isMoreGoodsShelf !== '1' && v.skuIndex === 0) {
                v.errorText = '请输入SKU'
                if (response.data.datas.length) {
                  data = response.data.datas
                } else {
                  data = [response.data.datas]
                }

              } else if (v.isMoreGoodsShelf !== '1' && v.skuIndex === 0) {
                data = [response.data.datas]
              } else {
                v.errorText = '请输入货位'
                data = response.data.datas
              }


              // if (v.skuIndex === 0) {
              //   v.errorText = '请输入SKU'
              //   data = [response.data.datas]
              // } else {
              //   v.errorText = '请输入货位'
              //   data = response.data.datas
              // }
              console.log('data:', data)
              v.skuValue = ''
              v.productMes = data
              console.log(v.productMes)
              if (!response.data.datas || response.data.datas.length === 0) {
                v.showProduct = false
                uni.showToast({
                  icon: 'none',
                  title: '没有查到相关数据',
                  duration: 3500
                })
              } else {
                v.showProduct = true
                console.log('in')
              }
              v.skuFocus = false
              v.$nextTick(function() {
                v.skuFocus = true
              })
            }
          })
      },
      skuChange(e) {
        this.skuIndex = Number(e.target.value)
      },
      turnLeft() {
        let v = this
        if (v.current === 0) {
          return false
        } else {
          v.current--
        }
      },
      turnRight() {
        let v = this
        if (v.current === v.productMes.length - 1) {
          return false
        } else {
          v.current++
        }
      },
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
        setStorage('inventorQuery', obj)
        v.warehouseName = obj.warehouseName
        v.warehouseId = obj.warehouseId
        v.isMoreGoodsShelf = obj.isMoreGoodsShelf
      },
      scanCode() {
        console.log('in')
        let v = this
        uni.scanCode({
          success: function(res) {
            v.skuValue = res.result
            v.$nextTick(function () {
              v.showSkuValue()
            })
//             console.log('条码类型：' + res.scanType);
//             console.log('条码内容：' + res.result);
          },
          fail: function(error) {
            console.log('error:', error)
          }
        })
      }
    },
    onLoad() {
      let v = this
      let loadStoreWarehouse = getStorage('inventorQuery')
      if (loadStoreWarehouse) {
        v.warehouseName = loadStoreWarehouse.warehouseName
        v.isMoreGoodsShelf =loadStoreWarehouse.isMoreGoodsShelf
      }

      v.getWarehouseList()
        .then(result => {
          if (result) {
            v.warehouseArr = []
            v.$nextTick(function () {
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
