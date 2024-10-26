<template>
  <view :class="wrap">
    <view class="scanWrap">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="receiptNo" type="text" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
          class="uni-input scanInput" @confirm="getDetails" :focus="packageFocus" placeholder="扫描或输入搜索入库单、采购单号、快递单号" />
      </view>
    </view>
    <view class="mu-divider"></view>
    <view class="head normalPadding" v-if="receiptNoTwo">
      <view class="d-flex justify-content-start align-items-center">
        <text class="blue-color">{{ receiptNoTwo }}</text>
      </view>
      <view class="d-flex justify-content-start align-items-center purchasingAndStorage normalTop text-18">
        <text class="pasTitle">{{ receiptType === '0' ? '采购入库' : receiptType === '1' ? '生产入库' : receiptType === '2' ?
          '调拨入库' : receiptType === '3' ? '退货入库' : receiptType === '4' ? '其他入库' : '' }}</text>
        <view>
          <uni-tag text="部分收货" size="small" type="warning" v-if="statusArr[1] === '1'"></uni-tag>
          <uni-tag text="无源入库" size="small" type="primary" v-if="statusArr[0] === '1'"></uni-tag>
          <uni-tag text="超量收货" size="small" type="error" v-if="statusArr[2] === '1'"></uni-tag>
        </view>
      </view>
    </view>
    <view class="mu-divider"></view>
    <view class="scanSkuLine">
      <view class="normalPadding d-flex justify-content-start align-items-center">
        <input v-model.trim="skuNum" type="text" class="uni-input scanInput"
          :class="{ themeInput: theme.inputStyle === 'DarkBlue' }" @confirm="confirmPack" :focus="skuFocus"
          placeholder="扫描或输入SKU" />
        <view class="model">
          <checkbox value="cb" :checked="cbChecked" @click="getCBValue" /><text class="text-16">{{ cbText }}</text>
        </view>
      </view>
    </view>
    <view class="mu-divider"></view>
    <view>
      <scroll-view class="scroll-view_H goodsList" scroll-y="true" :scroll-top="scrollTop" :style="scrollHeight"
        @scroll="scroll" scroll-left="120">
        <view v-for="(item, index) in list" :key="item">
          <view class="receivingItem d-flex justify-content-between">
            <view class="leftItem">
              <view class="d-flex justify-content-start align-item-stretch">
                <text class="leftTitle">SKU：</text>
                <text class="leftText">{{ item.goodsSku }}</text>
              </view>
              <view class="d-flex justify-content-start align-item-stretch">
                <text class="leftTitle">条码编码：</text>
                <text class="leftText">{{ item.wmsBarCode }}</text>
              </view>
              <view class="d-flex justify-content-start align-item-stretch">
                <text class="leftTitle">中文描述：</text>
                <text class="leftText">{{ item.goodsCnDesc }}</text>
              </view>
              <view class="d-flex justify-content-start align-item-stretch">
                <text class="leftTitle">英文描述：</text>
                <text class="leftText">{{ item.goodsEnDesc }}</text>
              </view>
              <view class="d-flex justify-content-start align-item-stretch">
                <text>预期数量：{{ item.expectedNumber }}</text>
              </view>
              <view class="d-flex justify-content-start align-item-stretch">
                <text>已收货数量：{{ item.doneNumber }}</text>
              </view>
              <view class="d-flex justify-content-start align-item-stretch">
                <text>未收货数量：{{ item.nobatchNumber }}</text>
              </view>
            </view>
            <view class="rightItem d-flex justify-content-center align-items-center">
              <view class="d-flex justify-content-center align-items-center flex-wrap">
                <text class="thisReceivingNum">本次收货数量</text>
                <input type="number" :focus="focusObj[item.goodsSku]"
                  :class="{ themeInput: theme.inputStyle === 'DarkBlue' }" class="receivingNum"
                  v-model="item.currentbatchNumber">
                <!-- <uni-number-box :min="0" :value="numberValue" :step="1" size="small"></uni-number-box> -->
              </view>
            </view>
          </view>
          <view class="mu-divider"></view>
        </view>
        <view style="height: 100upx; background: #fff;"></view>
      </scroll-view>
    </view>
    <view class="bottomBit">
      <view class="d-flex justify-content-start align-items-center selectGoodsWarehouse text-16">
        <view class="inputWrap d-flex justify-content-start align-items-center" style="width: 100%!important;">
          <text style="white-space: nowrap">收货库位：</text>
          <text style="margin-right: 10px">{{ goodsWarehouseObj.warehouseLocationName }}</text>
          <button size="mini" style="white-space: nowrap;color:#fff;" @click="gotoSelectGoodsWarehouse">选择</button>
          <!-- <input v-model.trim="goodsWarehouseObj.warehouseLocationName" type="text" class="uni-input scanInput" @focus="gotoSelectGoodsWarehouse"  /> -->
        </view>
      </view>
      <checkbox-group @change="changeType">
        <view class="d-flex justify-content-between align-items-center text-16 selectType">
          <label>
            <checkbox value="resultFlag" :checked="cbQualityStatus" />收货后需要质检
          </label>
          <label>
            <checkbox value="closeReceipt" :checked="cbStatus" />收货后关闭入库单
          </label>
        </view>
      </checkbox-group>
      <view class="d-flex justify-content-start align-items-center normalPadding doubBit">
        <!-- <view @click="setMaxGoods">
          <sevenButton long size="large" class="buttonFlex" type="default">设置收货数量最大</sevenButton>
        </view> -->
        <button class="bottomButton text-12" @click="setMaxGoods">设置收货数量最大</button>
        <button class="bottomButton text-12" type="primary" @click="confirmReceive">收货确认</button>
        <!--  -->
      </view>
    </view>
  </view>
</template>

<script>
import Mixin from '@/mixin/common_mixin'
import api from '@/api/api'
import { debounce } from '@/common/debounce'
const prefixCls = 'tongtool-newWorkspace-newReceiving'
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
export default {
  mixins: [Mixin],
  data() {
    return {
      selectGoodsFocus: 1,
      receiptType: '',
      scrollTop: 0,
      receiptNoTwo: '',
      cbChecked: true,
      focusObj: {},
      cbQualityStatus: false,
      cbStatus: false,
      confirmReceiveStatus: true,
      receiptNo: '',
      statusArr: [0, 0, 0],
      packageFocus: true,
      skuFocus: false,
      numberValue: 5,
      cb: 0,
      cbText: '逐个扫描',
      skuNum: '',
      goodsWarehouseValue: '',
      apiData: {
        lastId: null,
        limit: 10000,
        receiptNoOrReferenceNo: null,
        warehouseId: getStorage('newErpWarehouse').warehouseId
      },
      list: [],
      resultFlag: false,
      closeReceipt: false,
      goodsWarehouseObj: {
        warehouseLocationName: '',
        warehouseLocationId: null,
        warehouseBlockId: null
      },
      listMapping: [],
    }
  },
  components: {
  },
  computed: {
    wrap() {
      return `${prefixCls}`
    },
    scrollHeight() {
      let screenHeight = uni.getSystemInfoSync().screenHeight
      let val = screenHeight - uni.upx2px(144 + 140 + 126 + 288 + 88 + 20)
      return `
        height: ${val}px
      `
    }
  },
  watch: {
    warehouseLocationName(n, o) {
      // console.log(n)
    }
  },
  methods: {
    setLocation() {
      let goodsData = this.store.state.goodsSaveData;
      let v = this;
      if (goodsData) {
        v.goodsWarehouseObj.warehouseLocationName = goodsData.warehouseLocationName
        v.goodsWarehouseObj.warehouseLocationId = goodsData.warehouseLocationId
        v.goodsWarehouseObj.warehouseBlockId = goodsData.warehouseBlockId
        v.store.commit('goodsSaveData', null);
      }
    },
    setMaxGoods() {
      let v = this
      // console.log('list:', v.list)
      if (v.list.length > 0) {
        v.list.forEach((n, i) => {
          n.currentbatchNumber = n.nobatchNumber
          v.focusObj[n.goodsSku] = n.nobatchNumber
        })
      }
    },
    getCBValue(value) {
      let v = this
      v.cbChecked = !v.cbChecked
      // console.log(v.cbChecked)
    },
    gotoSelectGoodsWarehouse() {
      let v = this
      if (v.selectGoodsFocus === 0) {
        return false
      }
      v.$nextTick(function () {
        v.selectGoodsFocus = false
        uni.navigateTo({
          url: '/pages/workspace/goodsAllocation'
        })
      })

    },
    scroll() {

    },
    getDetails() {
      let v = this
      if (v.receiptNo === '') {
        uni.showToast({
          title: '入库单号不能为空',
          icon: 'none',
          duration: 2000
        })
        v.openSound('002')
        return false
      }
      v.apiData.receiptNoOrReferenceNo = v.receiptNo
      const obj = {
        url: api.get_receiptDetailsQuery,
        data: v.apiData
      }
      uni.showLoading({
        title: '数据加载中'
      })
      v.ajaxData(obj)
        .then(response => {
          uni.hideLoading()
          if (response.data.code === 0) {
            v.openSound('001')
            v.getDefaultStorage()

            v.list = []
            let receipt = response.data.datas.receipt
            v.receiptType = receipt.receiptType
            v.receiptNoTwo = receipt.receiptNo;
            v.listMapping = [];
            response.data.datas.receiptDetails.forEach((n, i) => {
              // v.focusObj[n.goodsSku] = false
              // 存在条码编码则使用编码，为空使用sku
              let item = n.wmsBarCode || n.goodsSku;
              v.listMapping.push(item);
              v.$set(v.focusObj, item, false)
              n.currentbatchNumber = 0
            })
            v.list = response.data.datas.receiptDetails
            // v.goodsWarehouseObj.warehouseLocationName =
            // v.goodsWarehouseObj.warehouseLocationId =
            // v.goodsWarehouseObj.warehouseBlockId =
            if (v.list.length > 0) {
              v.confirmReceiveStatus = false
            }
            if (receipt.abnormalStatus) {
              v.statusArr = receipt.abnormalStatus.split('+')
            }
            v.receiptNo = ''
            v.packageFocus = false
            v.skuFocus = false
            v.$nextTick(function () {
              v.skuFocus = true
            })
          } else if (response.data.code === 110111) {
            v.openSound('002')
            uni.showToast({
              icon: 'none',
              title: '当前仓库不存在该入库单号',
              duration: 3000
            })
            v.receiptNo = ''
            v.packageFocus = false
            v.$nextTick(function () {
              v.packageFocus = true
            })
          } else if (response.data.code === 110112) {
            v.openSound('002')
            uni.showToast({
              icon: 'none',
              title: '当前入库单已关闭',
              duration: 3000
            })
            v.receiptNo = ''
            v.packageFocus = false
            v.$nextTick(function () {
              v.packageFocus = true
            })
          } else {
            v.openSound('002');
          }
        })
    },
    getDefaultStorage() {
      let v = this
      let loadStoreWarehouse = getStorage('newErpWarehouse')
      const obj = {
        url: api.get_defaultStorage,
        type: 'GET',
        data: {
          warehouseId: loadStoreWarehouse.warehouseId
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas
            v.goodsWarehouseObj.warehouseLocationName = data.warehouseLocationName
            v.goodsWarehouseObj.warehouseLocationId = data.warehouseLocationId
            v.goodsWarehouseObj.warehouseBlockId = data.warehouseBlockId
          }
        })
    },
    scanCode() {
      let v = this
      uni.scanCode({
        success: function (res) {
          v.receiptNo = res.result
          // console.log('reNo:', v.receiptNo)
          v.getDetails()
        },
        fail: function (error) {
          // console.log('error:', error)
        }
      })
    },
    confirmPack() {
      let v = this
      let index = v.listMapping.indexOf(v.skuNum);
      if (index >= 0) {
        this.scrollTop = 118 * (index - 1)
        // v.focusObj[v.skuNum] = false
        // setTimeout(function () {
        //   v.focusObj[v.skuNum] = true
        // }, 300)
        v.inRecevingFocus(index)
        v.openSound('001')
        setTimeout(function () {
          v.skuNum = ''
        }, 500)
      } else {
        v.openSound('002')
        uni.showToast({
          icon: 'none',
          title: '{' + v.skuNum + '}不存在入库单中，请核对'
        })
        setTimeout(function () {
          v.skuNum = ''
        }, 500)
        v.skuFocus = false
        v.$nextTick(function () {
          v.skuFocus = true
        })
      }
    },
    inRecevingFocus(value) {
      let v = this
      // console.log('value:', value)
      if (v.cbChecked) {
        if (v.list[value].currentbatchNumber < 0) {
          v.list[value].currentbatchNumber = 1
        } else {
          v.list[value].currentbatchNumber++
        }
        v.skuFocus = false
        v.$nextTick(function () {
          v.skuFocus = true
        })
      } else {
        if (v.list[value].nobatchNumber < 0) {
          v.list[value].currentbatchNumber = 0
        } else {
          v.list[value].currentbatchNumber = v.list[value].nobatchNumber
        }
        v.skuFocus = false
        v.$nextTick(function () {
          v.skuFocus = true
        })
      }
    },
    confirmReceive: debounce(function () {
      let v = this
      // console.log('------------')
      if (v.list.length < 1) {
        return false
      }
      if (v.goodsWarehouseObj.warehouseLocationName === '') {
        uni.showToast({
          title: '请选择库位',
          icon: 'none',
          duration: 2000
        })
        return false
      }
      let listArr = []
      v.list.forEach((n, i) => {
        if (n.currentbatchNumber !== 0) {
          n.warehouseLocationName = v.goodsWarehouseObj.warehouseLocationName
          listArr.push(n)
        }
      })
      if (listArr.length === 0) {
        uni.showToast({
          title: '没有可以提交的数据，或者本次收货数量都为0',
          duration: 3000,
          icon: 'none'
        })
        return false
      }
      const dataObj = {
        closeReceipt: v.closeReceipt ? '1' : '0',
        receiptNo: v.receiptNoTwo,
        resultFlag: v.resultFlag ? 'Q' : 'S',
        receiptBatch: listArr,
        warehouseLocationId: v.goodsWarehouseObj.warehouseLocationId,
        warehouseLocationName: v.goodsWarehouseObj.warehouseLocationName,
        warehouseId: getStorage('newErpWarehouse').warehouseId,
        warehouseBlockId: v.goodsWarehouseObj.warehouseBlockId
      }
      const obj = {
        url: api.set_createReceiptBatch,
        data: dataObj
      }
      uni.showLoading({
        title: '数据提交中',
        mask: true
      })
      v.ajaxData(obj)
        .then(response => {
          uni.hideLoading()
          if (response.data.code === 0) {
            uni.showToast({
              title: '操作成功',
              icon: 'none'
            })
            v.receiptType = ''
            v.receiptNoTwo = ''
            v.receiptNo = ''
            v.list = []
            v.apiData.receiptNoOrReferenceNo = ''
            v.apiData.lastId = null
            v.statusArr = [0, 0, 0]
            v.skuNum = ''
            v.goodsWarehouseObj.warehouseLocationName = ''
            v.goodsWarehouseObj.warehouseLocationId = null
            v.goodsWarehouseObj.warehouseBlockId = null
            let pages = getCurrentPages()
            let currPage = pages[pages.length - 1]
            currPage.setData({ 'id': '' })
            setTimeout(function () {
              v.cbStatus = false
              v.cbQualityStatus = false
            }, 1000)
          } else if (response.data.code === 554135) {
            v.showToast('不允许超量收货')
          } else {
            v.showToast('收货失败')
          }
        })
    }, 1000),
    changeType(e) {
      let v = this
      let detail = e.detail.value
      if (detail.includes('closeReceipt')) {
        v.closeReceipt = true
        v.cbStatus = true
      } else {
        v.closeReceipt = false
        v.cbStatus = false
      }
      if (detail.includes('resultFlag')) {
        v.resultFlag = true
        v.cbQualityStatus = true
      } else {
        v.resultFlag = false
        v.cbQualityStatus = false
      }
    }
  },
  onLoad() {
    let v = this
    let loadStoreWarehouse = getStorage('newErpWarehouse')
    v.warehouseName = loadStoreWarehouse.warehouseName
    uni.setNavigationBarTitle({
      title: `收货(${v.warehouseName})`
    })
  },
  onShow() {
    let v = this
    v.setLocation();
    v.selectGoodsFocus = 1;
  }
}
</script>
<style scoped>
.bottomButton {
  color: #ffffff
}

.tongtool-newWorkspace-newReceiving .scanWrap {
  height: 65px;
  box-sizing: content-box;
}

.tongtool-newWorkspace-newReceiving .head {
  height: 68px;
}
</style>
