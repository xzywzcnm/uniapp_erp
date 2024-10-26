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
        <input v-model.trim="goodsShelfCode" type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input scanInput" @confirm="scanOriginCagospace" :focus="cargospaceFocus" placeholder="请输入或扫描货位" />
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
        <view class="listItem normalPadding" v-for="(item, index) in list" :key="item.goodsDetailId" @click="changeItem(item)" :class="{bgCur: item.goodsSku === skuNum && item.goodsShelfCode === goodsShelfCode}">
        <!-- <view class="listItem normalPadding" v-for="item in list" :key="item.goodsDetailId" @click="gotoIVFDetails(item.goodsSku, item.stockTakingStatus, item.productName, item.availableStockQuantity, item.defectsStockQuantity, item.stockTakingDetailId, item.availableStockTakingQuantity, item.defectsStockTakingQuantity)"> -->
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
              <input type="number" v-model.trim="item.abNum" :class="{themeInput:theme.inputStyle ==='DarkBlue'}"  @change="updateStorage(item)" :focus="focusObj[item.goodsSku]" @click.stop="inFocusObj(index)" :selection-start="start" :selection-end="end"  class="uni-input changeNum small-uni-input">
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
              <input type="number" v-model.trim="item.dabNum" :class="{themeInput:theme.inputStyle ==='DarkBlue'}"  @change="updateStorage(item)" @click.stop="inFocusObj(index, 'dabnum')" :selection-start="start" :selection-end="end" class="uni-input changeNum small-uni-input">
            </view>
          </view>

        </view>
      <!--  <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more> -->
      </view>
    </view>
    <view class="bottomBit d-flex">
      <view class="col col-7 d-flex justify-content-center align-tiems-center">
        <button type="default" class="yellow" size="mini" @click="isMoreGoodsShelf === '1' ? uploadResult() : uploadSingleResult()">
          <text>上传盘点结果</text>
        </button>
      </view>
      <view class="col col-5 d-flex justify-content-center align-tiems-center">
        <button type="primary" class="primary" size="mini" @click="setNext">
          <text>盘点下一个</text>
        </button>
      </view>
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
        start: -1,
        end: -1,
        randomId: null,
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
        goodsShelfCode: null,
        randomUuid: null,
        lastId: null,
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
    methods: {
      imageError (index) {
        let v = this
        v.list[index].goodsImageGroupId = '../../static/placeholder.jpg'
      },
      getCBValue (value) {
        let v = this
        v.cbChecked = !v.cbChecked
        console.log(v.cbChecked)
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
          v.$set(v.focusObj, v.skuNum, false)
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
      changeItem (item) {
        let v = this
        v.cargospaceFocus = false
        v.skuFocus = false
        v.goodsShelfCode = item.goodsShelfCode
        v.skuNum = item.goodsSku
        setTimeout(function () {
          v.skuFocus = true
        }, 500)
      },
      updateStorage (item) {
        let v = this
        item.abNum = Number(item.abNum)
        item.dabNum = Number(item.dabNum)
        setStorage('purchaseRandomResult_' + v.randomId, v.list)
      },
      confirmSingleSku () {
        let v = this
        if (v.skuNum === '') {
          uni.showToast({
            icon: 'none',
            title: '请输入SKU',
            duration: 2000
          })
          // v.skuNum = ''
          v.cargospaceFocus = false
          v.skuFocus = false
          // v.$nextTick(function () {
          //   v.skuFocus = true
          // })
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
            uni.hideLoading()
            if (response.data.code === 0) {
              let data = response.data.datas
              if (v.list.length === 0) {
                let userInfo = v.store.state.userInfo
                let item = {
                  stockTakingCode: v.randomId,
                  goodsNum: null,
                  createName: userInfo ? userInfo.user.userId : '',
                  stockTakingCreatedTime: v.getDateTime(new Date(), 'fulltime'),
                  stockTakingStartTime: v.getDateTime(new Date(), 'fulltime'),
                  stockTakingStatus: '3'
                }
                let warehouesRandomList = getStorage('warehouseRadomList_' + v.warehouseId)
                if (!warehouesRandomList) {
                  setStorage('warehouseRadomList_' + v.warehouseId, [item])
                }
                if (data) {
                  data.dabNum = data.defectsStockQuantity
                  let subItem = data.goodsSku
                  v.$set(v.focusObj, subItem, false)
                  if (!v.cbChecked) {
                    data.abNum = data.availableStockQuantity
                    v.$set(v.focusObj, v.skuNum, false)
                    setTimeout(function () {
                      v.focusObj[v.skuNum] = true

                      v.skuNum = ''
                    }, 500)
                  } else {
                    data.abNum = 1

                    v.skuFocus = false
                    v.$set(v.focusObj, v.skuNum, false)
                    setTimeout(function () {
                      v.skuFocus = true
                      v.skuNum = ''
                    }, 500)
                  }
                  v.list = [data]
                  setStorage('purchaseRandomResult_' + v.randomId, v.list)
                  setStorage('randomId_' + v.warehouseId, v.randomId)

                }
              } else {
                console.log('css')
                if (data) {
                  console.log('ined')
                  let result = false
                  let findIndex
                  v.list.forEach((n, i) => {
                    if (n.goodsSku === data.goodsSku) {
                      result = true
                      if (v.cbChecked) {
                        n.abNum = n.abNum + 1
                        v.$set(v.focusObj, v.skuNum, false)
                        v.skuFocus = false
                        setTimeout(function () {
                          v.skuFocus = true
                          v.skuNum = ''
                        }, 500)
                        findIndex = i
                      } else {
                        n.abNum = n.abNum
                        v.$set(v.focusObj, v.skuNum, false)
                        setTimeout(function () {
                          v.focusObj[v.skuNum] = true
                          v.skuNum = ''
                        }, 500)
                      }
                    }
                  })
                  if (!result) {
                    data.dabNum = data.defectsStockQuantity
                    if (!v.cbChecked) {
                      data.abNum = data.availableStockQuantity
                    } else {
                      data.abNum = 1
                    }
                    v.list.unshift(data)
                    v.$set(v.focusObj, v.skuNum, false)
                    setTimeout(function () {
                      v.focusObj[v.skuNum] = true

                      v.skuNum = ''
                    }, 500)
                  }
                  if (findIndex) {
                    v.list = v.swapArr(v.list, 0, findIndex)
                  }
                  setStorage('purchaseRandomResult_' + v.randomId, v.list)
                }
              }

            } else {
              uni.showToast({
                icon: 'none',
                title: response.data.message,
                duration: 1500
              })
            }
          })
      },
      swapArr (arr, index1, index2) {
          arr[index1] = arr.splice(index2, 1, arr[index1])[0];
          return arr;
      },
      confirmSku () {
        let v = this
        if (v.isMoreGoodsShelf === '1' && (v.goodsShelfCode === '' || !v.goodsShelfCode)) {
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
          // v.skuNum = ''
          v.cargospaceFocus = false
          v.skuFocus = false
          v.$nextTick(function () {
            v.skuFocus = true
          })
          return false
        }
        const obj = {
          url: api.get_checkGoodsShelfAndSku,
          data: {
            goodsShelfCode: v.goodsShelfCode,
            goodsSku: v.skuNum,
            warehouseId: v.warehouseId
          }
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              v.checkMStatus()

            } else if (response.data.code === 400000) {
              uni.showToast({
                title: 'SKU未绑定此货位',
                icon: 'none',
                duration: 2000
              })
              v.skuNum = ''
              return false
            }
          })

      },
      checkMStatus () {
        let v = this
        const obj = {
          url: api.get_checkSkuForStockTakingForM,
          type: 'GET',
          data: {
            goodsShelfCode: v.goodsShelfCode,
            goodsSku: v.skuNum,
            warehouseId: v.warehouseId
          }
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              v.getMSkuDetails()
            } else if (response.data.code === 400004) {
              uni.showToast({
                title: `SKU ${v.skuNum} 不存在此仓库中`,
                icon: 'none',
                duration: 2000
              })
              return false
            } else if (response.data.code === 400005) {
              uni.showToast({
                title: `SKU ${v.skuNum} 已删除`,
                icon: 'none',
                duration: 2000
              })
              return false
            } else if (response.data.code === 400006) {
              uni.showToast({
                title: `SKU ${v.skuNum} 正在盘点库存`,
                icon: 'none',
                duration: 2000
              })
              return false
            }
          })
      },
      getMSkuDetails () {
        let v = this
        const obj = {
          url: api.get_queryStockByGoodsShelfM,
          data: {
            cargoSpace: v.goodsShelfCode,
            goodsSku: v.skuNum,
            warehouseId: v.warehouseId
          }
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas
              if (v.list.length === 0 && data.length > 0) { // 新随机盘点单初始设置
                let userInfo = v.store.state.userInfo
                let item = {
                  stockTakingCode: v.randomId,
                  goodsNum: null,
                  createName: userInfo ? userInfo.user.userId : '',
                  stockTakingCreatedTime: v.getDateTime(new Date(), 'fulltime'),
                  stockTakingStartTime: v.getDateTime(new Date(), 'fulltime'),
                  stockTakingStatus: '3'
                }
                let warehouesRandomList = getStorage('warehouseRadomList_' + v.warehouseId)
                if (!warehouesRandomList) {
                  setStorage('warehouseRadomList_' + v.warehouseId, [item])
                }
                data.forEach((n, i) => {
                  n.dabNum = n.defectsStockQuantity
                  let subItem = n.goodsSku
                  v.$set(v.focusObj, subItem, false)
                  if (!v.cbChecked) {
                    n.abNum = n.availableStockQuantity
                  } else {
                    n.abNum = 1
                  }
                })
                v.list = data
                setStorage('purchaseRandomResult_' + v.randomId, v.list)
                setStorage('randomId_' + v.warehouseId, v.randomId)
              } else if (v.list.length > 0 && data.length > 0) {
                let result = false
                let findIndex
                v.list.forEach((n, i) => {
                  data.forEach((m, t) => {
                    if (n.goodsShelfCode === m.goodsShelfCode && n.goodsSku === m.goodsSku) {
                      result = true
                      if (!v.cbChecked && !n.abNum) {
                        n.abNum = n.availableStockQuantity
                      } else {
                        findIndex = i
                        n.abNum = n.abNum + 1
                      }
                    }
                  })
                })
                if (!result) {
                  data.forEach((n, i) => {
                    n.dabNum = n.defectsStockQuantity
                    let subItem = n.goodsSku
                    v.$set(v.focusObj, subItem, false)
                    if (!v.cbChecked) {
                      n.abNum = n.availableStockQuantity
                    } else {
                      n.abNum = 1
                    }
                  })
                  v.list = data.concat(v.list)
                }
                if (findIndex) {
                  v.list = v.swapArr(v.list, 0, findIndex)
                }
                setStorage('purchaseRandomResult_' + v.randomId, v.list)
              }
              v.$set(v.focusObj, v.skuNum, false)
              if (v.cbChecked) {
                v.skuFocus = false
                setTimeout(function () {
                  v.skuFocus = true
                  v.skuNum = ''
                }, 500)
              } else {
                v.skuFocus = false
                setTimeout(function () {
                  v.focusObj[v.skuNum] = true

                  v.skuNum = ''
                }, 500)
              }




              // setTimeout(function () {
              //   v.skuFocus = true
              // }, 500)
            }
          })
      },
      inFocusObj (index, dabnum) {
        let v = this
        console.log('index:', index)
        v.start = 0
        v.$nextTick(function () {
          if (dabnum) {
            v.end = v.list[index].dabnum.toString().length
          } else {
            console.log(v.list[index].abNum.toString())
            v.end = v.list[index].abNum.toString().length
          }
          setTimeout(function () {
            v.focusObj[v.list[index].goodsSku] = false
          })
        })
      },
      uploadSingleResult () {
        let v = this
        if (v.list.length === 0) {
          uni.showToast({
            title: '没有可以提交的数据',
            icon: 'none',
            duration: 2000
          })
          return false
        }
        let arr = []
        v.list.forEach((n, i) =>{
          arr.push({
            goodsSku: n.goodsSku,
            availableStockTakingQuantity: n.abNum,
            defectsStockTakingQuantity: n.dabNum
          })
        })
        const obj = {
          url: api.set_submitRandomForM,
          data: {
            datas: JSON.stringify(arr),
            warehouseId: v.warehouseId
          }
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              uni.showToast({
                icon: 'none',
              	title: '上传成功',
                duration: 1500
              })
              removeStorage('purchaseRandomResult_' + v.randomId)
              removeStorage('randomId_' + v.warehouseId)
              uni.redirectTo({
              	url: '/pages/workspace/inventoryVerification'
              })
            }  else if (response.data.code === 400005) {
              uni.showToast({
                title: response.data.message,
                icon: 'none',
                duration: 2000
              })
              return false
            } else if (response.data.code === 400006) {
              uni.showToast({
                title: response.data.message,
                icon: 'none',
                duration: 2000
              })
              return false
            }
          })
      },
      uploadResult () {
        let v = this
        if (v.list.length === 0) {
          uni.showToast({
            title: '没有可以提交的数据',
            icon: 'none',
            duration: 2000
          })
          return false
        }
        let arr = []
        v.list.forEach((n, i) =>{
          arr.push({
            goodsShelfCode: n.goodsShelfCode,
            goodsSku: n.goodsSku,
            availableStockTakingQuantity: n.abNum,
            defectsStockTakingQuantity: n.dabNum
          })
        })
        const obj = {
          url: api.set_submitRandomForM,
          data: {
            datas: JSON.stringify(arr),
            warehouseId: v.warehouseId
          }
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              uni.showToast({
                icon: 'none',
              	title: '上传成功',
                duration: 1500
              })
              removeStorage('purchaseRandomResult_' + v.randomId)
              removeStorage('randomId_' + v.warehouseId)
              uni.redirectTo({
              	url: '/pages/workspace/inventoryVerification'
              })
            }  else if (response.data.code === 400005) {
              uni.showToast({
                title: response.data.message,
                icon: 'none',
                duration: 2000
              })
              return false
            } else if (response.data.code === 400006) {
              uni.showToast({
                title: response.data.message,
                icon: 'none',
                duration: 2000
              })
              return false
            }
          })
      },
      submitList () {
        let v = this
        let arr = []
        if (v.list && v.list.length > 0) {
          v.list.forEach((n, i) => {
            arr.push({
              goodsSku: n.goodsSku,
              availableStockTakingQuantity: n.availableStockTakingQuantity,
              defectsStockTakingQuantity: n.defectsStockTakingQuantity
            })
          })
          const obj = {
            url: api.set_submitRandomForM,
            data: {
              datas: JSON.stringify(arr),
              warehouseId: v.warehouseId
            }
          }
          uni.showLoading()
          v.ajaxData(obj)
            .then(response => {
              uni.hideLoading()
              if (response.data.code === 0) {
                uni.showToast({
                  icon: 'none',
                	title: '上传成功',
                  duration: 1500
                })
                removeStorage('purchaseRandomResult_' + this.randomId)
                removeStorage('randomId_' + v.warehouseId)
                removeStorage('warehouseRadomList_' + v.warehouseId)
                uni.redirectTo({
                	url: '/pages/workspace/inventoryVerification'
                })
              }
            })
        } else {
          uni.showToast({
          	icon: 'none',
            title: '没有盘点数据'
          })
        }


      },
      setNext () {
        let v = this
        v.skuNum = ''
        v.goodsShelfCode = ''
        v.cargospaceFocus = false
        v.skuFocus = false
        setTimeout(function () {
          if (v.isMoreGoodsShelf === '1') {
            v.cargospaceFocus = true
          } else {
            v.skuFocus = true
          }

        })
      },
      scanCode () {
        let v = this
        uni.scanCode({
          success: function (res) {
            v.goodsShelfCode = res.result
            v.cargospaceFocus = false
            v.skuFocus = false
            v.$nextTick(function () {
              v.skuFocus = true
            })
          },
          fail: function (error) {
            console.log('error:', error)
          }
        })
      },
      scanOriginCagospace () {
        let v = this
        v.cargospaceFocus =false
        v.skuFocus = false
        setTimeout(function () {
          v.skuFocus = true
        }, 500)
      },
      getMoreDataDetails (type) {
        let v = this

      },
      getDetails() {
        let v = this

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

      },
      gotoIVFDetails(goodsSku, stockTakingStatus, productName, availableStockQuantity, defectsStockQuantity,
        stockTakingDetailId, availableStockTakingQuantity, defectsStockTakingQuantity) { // 去往SKU盘点

      }
    },
    computed: {
      wrap() {
        return `${prefixCls} ${prefixCls}-randomResult`
      }
    },
    onShow() {

    },
    onLoad(options) {
      let v = this
      let loadStoreWarehouse = getStorage('inventorQueryVerification')
      if (loadStoreWarehouse) {
        v.isMoreGoodsShelf = loadStoreWarehouse.isMoreGoodsShelf
        v.warehouseId = loadStoreWarehouse.warehouseId
        if (v.isMoreGoodsShelf === '1') {
          v.cargospaceFocus = false
          v.skuFocus = false
          setTimeout(function () {
            v.cargospaceFocus = true
          }, 500)
        } else {
          v.cargospaceFocus = false
          v.skuFocus = false
          setTimeout(function () {
            v.skuFocus = true
          }, 500)
        }
      }
      v.getLoginInfo()
      let randomId = getStorage('randomId_' + v.warehouseId)
      if (randomId) {
        v.randomId = randomId.toString()
        v.list = getStorage('purchaseRandomResult_' + randomId)
        v.stockTakingCode = randomId
      } else {
        let date = new Date().getTime().toString()
        v.stockTakingCode = date
        v.randomId = date

      }

    },
    onReady() {

    }
  }
</script>
