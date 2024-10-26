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
      <view class="d-flex justify-content-start align-items-center" v-if="isMoreGoodsShelf === '1'">
        <view class="scan" @click="scanOldCargospace">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="originCargospaceNum" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" type="text" class="uni-input scanInput" @confirm="scanOriginCagospace" :focus="originCargospaceFocus" placeholder="请输入或扫描货位" />
        <u-button v-if="skuArr.length > 1" @click="show = true" style="margin-left: 5px;">选择商品</u-button>
      </view>
      <view class="d-flex justify-content-start align-items-center normal-margin-top">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="skuNum" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" type="text" class="uni-input scanInput" @confirm="scanSku" :focus="skuFocus" placeholder="SKU条码" />
      </view>
      <view class="d-flex justify-content-start align-items-center headEndLine">
        <view v-if="isMoreGoodsShelf !== '1'" style="margin-right:10px">
          <text>原货位: </text>
          <text v-if="skuDetails">{{skuDetails.cargoSpace}}</text>
        </view>
        <text>转移数量: </text>
        <input type="number" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" v-model.trim="availableStockQuantity" v-if="isMoreGoodsShelf === '1'" :selection-start="start" :selection-end="end" :focus="quantityFocus" class="uni-input changeNum">
        <text v-if="isMoreGoodsShelf !== '1' && availableStockQuantity > 0">{{availableStockQuantity}}</text>
      </view>
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCargospace">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="newCargospace" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" type="text" class="uni-input scanInput" :focus="cargospaceFocus" placeholder="新货位" />
      </view>
    </view>
    <view class="d-flex errorText justify-content-center align-items-center normalPadding" v-if="hasError">
      <text>{{errorText}}</text>
    </view>
    <view class="row no-gutters normalPadding" v-if="skuDetails">
      <view class="col col-4">
        <image :src="skuDetails.goodsImageGroupId" style="width: 200upx;height: 200upx; padding: 10upx"></image>
      </view>
      <view class="col col-8 skuDetails">
        <view class="d-flex justify-content-start">
          SKU: {{skuDetails.goodsSku}}
        </view>
        <view class="d-flex justify-content-start">
          名称: {{skuDetails.productName}}
        </view>
        <view class="d-flex justify-content-between align-items-center">
          <view>当前货位: {{skuDetails.cargoSpace}}</view>
          <view>当前库存: {{skuDetails.availableStockQuantity}}</view>
        </view>
      </view>
    </view>
   <u-popup v-model="show" mode="bottom">
     <scroll-view scroll-y="true" style="max-height: 400rpx;">
       <view v-for="(item,index) in actionList" @click="actionHandel(index)" class="popup-view">
         <view class="title">SKU:{{item.goodsSku}}</view>
         <view class="name">名称:{{item.productName}}</view>
       </view>
     </scroll-view>
     <view class="confrim-btn">
       <u-button @click="show = false;">取消</u-button>
     </view>
   </u-popup>
   <!--<u-action-sheet :list="actionList" v-model="show" @click="actionHandel"></u-action-sheet>-->
    <view class="bottomBit d-flex justify-content-center align-items-center">
      <button type="primary" size="mini" @click="isMoreGoodsShelf === '1' ? confirmCargospace () : confirmIsCargospace()">提交</button>
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
    mixins: [ Mixin ],
    data () {
      return {
        show: false,
        start: -1,
        end: -1,
        quantityFocus: false,
        availableStockQuantity: 0,
        originCargospaceNum: '',
        originCargospaceFocus: true,
        cargospaceFocus: false,
        skuFocus: false,
        noData: false,
        errorText: '',
        hasError: false,
        originCargospace: '未定义',
        skuNum: null,
        warehouseName: '选择仓库',
        warehouseIndex: 0,
        warehouseArr: ['选择仓库'],
        warehouseId: null,
        skuDetails: null,
        newCargospace: null,
        isMoreGoodsShelf: null,
        skuArr: [],
        cargospaceData: []
      }
    },
    computed: {
      wrap () {
        return `${prefixCls}`
      },
      actionList () {
        return this.cargospaceData.map(i=>{
          i.text = 'SKU：' + i.goodsSku;
          i.subText = '名称：' + i.productName
          i.fontSize = '32'
          return i
        })
      }
    },
    methods: {
      setDataToView (data) {
        let v = this;
        v.skuDetails = data;
        v.availableStockQuantity = v.skuDetails.availableStockQuantity
        v.skuFocus = false
        v.originCargospaceFocus = false
        v.quantityFocus = false
        v.cargospaceFocus = false
        setTimeout(function(){
          if (v.isMoreGoodsShelf === '1') {
            v.quantityFocus = true
            v.start = 0
            v.$nextTick(function () {
              v.end = v.availableStockQuantity.toString().length
            })
          } else {
            v.cargospaceFocus = true
          }

          v.skuNum = v.skuDetails.goodsSku
        }, 500)
      },
      actionHandel (index) {
        this.show = false;
        this.setDataToView(this.cargospaceData[index])
      },
      scanOriginCagospace () {
        let v = this
        v.skuNum = ''
        v.availableStockQuantity = 0
        v.newCargospace = ''
        v.skuDetails = null
        if (!v.warehouseId) {
          uni.showToast({
            icon: 'none',
          	title: '请先选择仓库',
            duration: 1500
          })
          v.originCargospaceFocus = false
          v.$nextTick(function () {
            v.originCargospaceFocus = true
          })
          return false
        }
        // uni.showToast({
        //   title: v.originCargospaceNum,
        //   duration: 2000
        // })
        if (v.originCargospaceNum === '') return false
        let url = api.get_queryStockByCargoSpace
        if (v.isMoreGoodsShelf === '1') {
          url = api.get_queryStockByGoodsShelfM
        }
        const obj = {
          url: url,
          data: {
            cargoSpace: v.originCargospaceNum,
            warehouseId: v.warehouseId
          }
        }
        v.skuArr = []
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              console.log(response.data.datas)
              let data = response.data.datas
              v.cargospaceData = data
              if (!data) {
                uni.showToast({
                  title: '没有查到相关数据',
                  icon: 'none',
                  duration: 2000
                })
                return false
              }
              let arr = []
              data.forEach((n, i) => {
                if (!arr.includes(n.goodsSku)) {
                  arr.push(n.goodsSku)
                }
              })
              if (arr.length === 1) {
                v.setDataToView(data[0])
              } else if (arr.length > 1) {
                data.forEach((n, i) => {
                  if (n.skuLabel) {
                    n.skuLabel.split('\n').forEach(j => {
                      if (!arr.includes(j)) {
                        arr.push(j);
                      }
                    })
                  }
                })
                /* v.skuNum = ''
                 uni.showToast({
                   title: '该货位存在多个SKU，请扫描SKU',
                   icon: 'none',
                   duration: 4000
                 })*/
                v.skuArr = arr
                v.skuFocus = false
                v.originCargospaceFocus = false
                setTimeout(function(){
                  v.skuFocus = true
                }, 500)
              } else if (arr.length === 0) {
                uni.showToast({
                  title: '该货位不存在SKU信息',
                  icon: 'none',
                  duration: 3000
                })
                v.skuFocus = false
                v.originCargospaceFocus = false
                v.$nextTick(function(){
                  v.originCargospaceNum = ''
                  v.originCargospaceFocus = true
                })
                return false
              }
            }
          })
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
      warehouseChange (e) {
        let v = this
        let obj = v.warehouseArr[e.target.value]
        console.log('obj:', obj)
        setStorage('cargoSpaceTransfer', obj)
        v.warehouseId = obj.warehouseId
        v.warehouseName = obj.warehouseName
        v.isMoreGoodsShelf = obj.isMoreGoodsShelf
        if (v.isMoreGoodsShelf !== '1') {
          console.log('a1')
          v.originCargospaceFocus = false
          v.cargospaceFocus = false
          v.skuFocus = false
          v.$nextTick(function () {
            setTimeout(function () {
              v.skuFocus = true
            }, 3500)
          })

        } else {
          console.log('a2')
          v.skuFocus = false
          v.cargospaceFocus = false
          v.originCargospaceFocus = false
          v.$nextTick(function () {
            setTimeout(function () {
              v.originCargospaceFocus = true
            }, 3500)
          })
        }
      },
      scanCode () {
        let v = this
        uni.scanCode({
          success: function (res) {
            v.skuNum = res.result
            v.$nextTick(function () {
              v.scanSku()
            })
          },
          fail: function (error) {
            console.log('error:', error)
          }
        })
      },
      scanSku () {
        let v = this
        if (v.isMoreGoodsShelf === '1') {
          if (!v.skuArr.includes(v.skuNum)) {
            uni.showToast({
              title: '当前货位不存在该SKU',
              duration: 3000,
              icon: 'none'
            })
            return false
          }
          v.cargospaceData.forEach((n, i) => {
            let skuLabel = [];
            if (n.skuLabel) {
              skuLabel = n.skuLabel.split('\n');
            }
            if ((skuLabel.length && skuLabel.includes(v.skuNum)) || (n.goodsSku === v.skuNum)) {
              v.skuDetails = n
              v.availableStockQuantity = v.skuDetails.availableStockQuantity
              v.skuFocus = false
              v.quantityFocus = false
              v.cargospaceFocus = false
              if (v.isMoreGoodsShelf === '1') {

                setTimeout(function () {
                  v.quantityFocus = true
                  v.start = 0
                  v.$nextTick(function () {
                    v.end = v.availableStockQuantity.toString().length
                  })
                }, 500)
              } else {
                setTimeout(function () {
                  v.cargospaceFocus = true
                }, 500)
              }
            }
          })
        } else {
            v.scanSkuTwo()
        }
      },
      scanSkuTwo () {
        let v = this
        // uni.showToast({
        //   title: v.skuNum,
        //   icon: 'none',
        //   duration: 5000
        // })
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
          v.skuFocus = false
          v.$nextTick(function () {
            v.skuFocus = true
          })
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
        uni.showLoading({
          title: '加载SKU信息中'
        })
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              console.log('rdc:', response)
              v.skuDetails = response.data.datas
              v.availableStockQuantity = v.skuDetails.availableStockQuantity
              v.cargospaceFocus = true
            } else {
              uni.showToast({
                icon: 'none',
                title: response.data.message,
                duration: 1500
              })
            }
            uni.hideLoading()
          })
      },
      scanOldCargospace () {
        let v = this
        uni.scanCode({
          success: function (res) {
            v.originCargospaceNum = res.result
            v.$nextTick(function () {
              v.scanOriginCagospace()
            })
          },
          fail: function (error) {
            console.log('error:', error)
          }
        })
      },
      scanCargospace () {
        let v = this
        uni.scanCode({
          success: function (res) {
            v.newCargospace = res.result
            v.$nextTick(function () {
              if (v.isMoreGoodsShelf === '1') {
                v.confirmCargospace()
              } else {
                v.confirmIsCargospace()
              }

            })
          },
          fail: function (error) {
            console.log('error:', error)
          }
        })
      },
      confirmIsCargospace () {
        let v = this
        if (!v.warehouseId) {
          uni.showToast({
            icon: 'none',
            title: '请先选择仓库',
            duration: 1500
          })
          v.skuFocus = false
          v.$nextTick(function () {
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
          v.$nextTick(function () {
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
          v.$nextTick(function () {
            v.cargospaceFocus = true
          })
          return false
        }
        if (v.availableStockQuantity === '0' || v.availableStockQuantity === 0) {
          uni.showToast({
            icon: 'none',
          	title: '库存数量为0不能转移',
            duration: 1500
          })
          v.quantityFocus = false
          v.$nextTick(function () {
            v.quantityFocus = true
          })
          return false
        }
        if (v.newCargospace === v.skuDetails.cargoSpace) {
          uni.showToast({
            icon: 'none',
            title: '旧货位和新货位不能相同',
            duration: 1500
          })
          v.cargospaceFocus = false
          v.$nextTick(function() {
            v.cargospaceFocus = true
          })
          return false
        }
        if (!(/^[A-Za-z0-9_\-/.#()\[\]]{1,30}$/.test(v.newCargospace))) {
          uni.showToast({
            icon: 'none',
          	title: '新货位校验不通过',
            duration: 1500
          })
          v.cargospaceFocus = false
          v.$nextTick(function () {
            v.cargospaceFocus = true
          })
          return false
        }
        const obj = {
          url: api.set_newCargoSpace,
          data: {
            bound: 'true',
            type: '02',
            cargoSpace: v.newCargospace,
            goodsSku: v.skuNum,
            goodsDetailId: v.skuDetails.goodsDetailId,
            warehouseId: v.warehouseId
          }
        }
        uni.showLoading()
        v.ajaxData(obj)
          .then(response => {
            uni.hideLoading()
            if (response.data.code === 0) {
              uni.showToast({
                title: '操作成功'
              })
              v.newCargospace = ''
              v.skuNum = ''
              v.cargospaceFocus = false
              v.skuDetails = null
              v.skuFocus = true
              v.availableStockQuantity = 0
            } else if (response.data.code < 10) {
              let mes = ''
              let code = response.data.code
              let space = response.data.datas.cargoSpace
              code === 1 ? mes = `当前货位已被${space}绑定，是否覆盖` :
                 code === 2 ? mes = `当前货位被(${goodsSku})占用,不允许上架` :
                  code === 3 ? mes = `已经绑定${space}货位,但是原货位上库存为0,是否覆盖` :
                   code === 4 ? mes = `已绑定${space}货位,请上架到${space}货位` :
                    code === 5 ? mes = `已经绑定${space}货位,但是原货位上库存为0,是否覆盖` :
                     code === 6 ? mes = `已绑定${space}货位,请上架到${space}货位` :
                      code === 7 ? mes = `当前货位被(${goodsSku})占用,不允许上架` :
                       code === 8 ? mes = `当前货位已被${space}绑定，是否覆盖` :
                        code === 9 ? mes = `当前货位被(${goodsSku})占用,不允许上架` : ``
              uni.showToast({
                icon: 'none',
                title: mes,
                duration: 2000
              })
            } else {
              uni.showToast({
                icon: 'none',
                title: response.data.message,
                duration: 2500
              })
            }
          })
      },
      confirmCargospace () {
        let v = this
        if (!v.originCargospaceNum || v.originCargospaceNum === '') {
          uni.showToast({
            icon: 'none',
          	title: '请先进行货位查询',
            duration: 1500
          })
          v.originCargospaceFocus = false
          v.$nextTick(function () {
            v.originCargospaceFocus = true
          })
          return false
        }

        if (!v.skuNum || v.skuNum === '') {

          return false
        }

        if (!v.newCargospace || v.newCargospace === '') {
          uni.showToast({
            icon: 'none',
          	title: '请输入新货位信息',
            duration: 1500
          })
          v.cargospaceFocus = false
          v.$nextTick(function () {
            v.cargospaceFocus = true
          })
          return false
        }
        if (v.availableStockQuantity === '') {
          uni.showToast({
            icon: 'none',
          	title: '请输入转移数量',
            duration: 1500
          })
          v.quantityFocus = false
          v.$nextTick(function () {
            v.quantityFocus = true
          })
          return false
        }
        if (v.availableStockQuantity === '0' || v.availableStockQuantity === 0) {
          uni.showToast({
            icon: 'none',
          	title: '库存数量为0不能转移',
            duration: 1500
          })
          v.quantityFocus = false
          v.$nextTick(function () {
            v.quantityFocus = true
          })
          return false
        }
        if (v.newCargospace === v.originCargospaceNum) {
          uni.showToast({
            icon: 'none',
            title: '旧货位和新货位不能相同',
            duration: 1500
          })
          v.cargospaceFocus = false
          v.$nextTick(function() {
            v.cargospaceFocus = true
          })
          return false
        }
        if (!(/^[A-Za-z0-9_\-/.#()\[\]]{1,30}$/.test(v.newCargospace))) {
          uni.showToast({
            icon: 'none',
          	title: '新货位校验不通过',
            duration: 1500
          })
          v.cargospaceFocus = false
          v.$nextTick(function () {
            v.cargospaceFocus = true
          })
          return false
        }

        const obj = {
          url: api.set_moreStorageTransfer,
          data: {
            newGoodsShelf: v.newCargospace,
            oldGoodsShelf: v.originCargospaceNum,
            quantity: v.availableStockQuantity,
            goodsSku: v.skuNum,
            warehouseId: v.warehouseId
          }
        }
        uni.showLoading()
        v.ajaxData(obj)
          .then(response => {
            uni.hideLoading()
            if (response.data.code === 0) {
              uni.showToast({
              	title: '操作成功'
              })
              v.originCargospaceNum = ''
              v.newCargospace = ''
              v.skuNum = ''
              v.availableStockQuantity = 0
              v.cargospaceFocus = false
              v.skuDetails = null
              v.originCargospace = true
            } else if (response.data.code === 400000) {
              uni.showToast({
              	title: '仓库不能为空',
                icon: 'none',
                duration: 3000
              })
            } else if (response.data.code === 400001) {
              uni.showToast({
              	title: 'SKU不能为空',
                icon: 'none',
                duration: 3000
              })
            } else if (response.data.code === 400002) {
              uni.showToast({
              	title: '原货位不能为空',
                icon: 'none',
                duration: 3000
              })
            } else if (response.data.code === 400003) {
              uni.showToast({
              	title: '新货位不能为空',
                icon: 'none',
                duration: 3000
              })
            } else if (response.data.code === 400004) {
              uni.showToast({
              	title: '转移数量不能为空',
                icon: 'none',
                duration: 3000
              })
            } else if (response.data.code === 400005) {
              uni.showToast({
              	title: '该仓库中当前货位不存在此SKU',
                icon: 'none',
                duration: 3000
              })
            } else if (response.data.code === 400006) {
              uni.showToast({
              	title: '当前货位不存在或未启用',
                icon: 'none',
                duration: 3000
              })
            } else if (response.data.code === 400007) {
              uni.showToast({
              	title: '新货位不存在或未启用',
                icon: 'none',
                duration: 3000
              })
            }
          })
      }
    },
    onReady () {
      let v = this
      let loadStoreWarehouse = getStorage('cargoSpaceTransfer')
      console.log('loadStoreWarehouse:', loadStoreWarehouse)
      if (loadStoreWarehouse) {
        v.warehouseName = loadStoreWarehouse.warehouseName
        v.warehouseId = loadStoreWarehouse.warehouseId
        v.isMoreGoodsShelf =loadStoreWarehouse.isMoreGoodsShelf
        if (v.isMoreGoodsShelf !== '1') {
          v.originCargospaceFocus = false
          v.$nextTick(function () {
            v.skuFocus = true
          })
        }
      } else {
        console.log(12321321)
        v.originCargospaceFocus = false
        v.skuFocus = false
        v.$nextTick(function () {
          v.skuFocus = true
          console.log('skuFocus:', v.skuFocus)
        })
      }
      v.getWarehouseList()
        .then(result => {
          if (result) {
            v.$nextTick(function () {
              v.warehouseArr = getStorage('warehouseList')
              if (!v.warehouseId) {
                if (v.warehouseArr.length > 0) {
                  v.warehouseName = v.warehouseArr[0].warehouseName
                  v.warehouseId = v.warehouseArr[0].warehouseId
                  v.isMoreGoodsShelf = v.warehouseArr[0].isMoreGoodsShelf
                  setStorage('cargoSpaceTransfer', v.warehouseArr[0])
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
.popup-view {
   padding: 5px;
   text-align: center;

  border-bottom: 1px solid #dddddd;
}
.popup-view .title {
  font-size: 16px;
}
.popup-view .name {
  font-size: 14px;
}
</style>
