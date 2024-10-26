<template>
  <view :class="wrap">
    <view class="scanWrap scan-content">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="inStorageNum" type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}"
          class="uni-input scanInput" @confirm="confirmData" :focus="storageFocus" placeholder="扫描或输入搜索入库单" />
      </view>
    </view>
    <view class="filter">
      <view class="mu-divider"></view>
      <view class="d-flex justify-content-between align-items-center normalPadding">
        <text class="text-16">{{selectFilterValue}}</text>
        <sevenButton type="primary" @click="showActionCondition">选择搜索条件</sevenButton>
      </view>
      <view class="mu-divider"></view>
    </view>
    <view class="qualityList" v-for="(item, index) in list" :key="item.receiptNo">
      <view class="qulityTitle">
        <checkbox :value="item.receiptNo" @click="displayAndHide(item.receiptNo, item.totalCheckStatus, index)"
          :checked="item.totalCheckStatus" v-if="bitStatus" />
        <text>{{item.receiptNo}}</text>
      </view>
      <view class="qulityItemList">
        <view class="qulityItem d-flex justify-content-start align-items-center"
          v-if="item.queryBatchCheckResultList && item.queryBatchCheckResultList.length > 0"
          v-for="(subItem, subIndex) in cacheList[index]" :key="subItem.receiptBatchCheckId"
          @click="gotoDetails(subItem)">
          <checkbox :value="subItem.goodsSku" @click="subDisplayAndHide(index, subIndex)"
            :checked="subItem.checkboxStatus" v-if="bitStatus" />
          <view class="rightItem">
            <view class="d-flex justify-content-between align-items-center smallItem">
              <view class="siItem">
                <text>待质检SKU：</text>
                <text>{{subItem.goodsSku}}</text>
              </view>
            </view>
            <view class="d-flex justify-content-start align-items-center smallItem">
              <text>质检状态：</text>
              <text class="status" :class="{greenColor:  subItem.checkStatus === '2'}">
                {{
                subItem.checkStatus === '0' ? '待质检'
                : subItem.checkStatus === '1' ? '部分质检'
                : subItem.checkStatus === '2' ? '完成质检'
                : ''
                }}
              </text>
            </view>
            <view class="d-flex justify-content-between align-items-center smallItem">
              <view class="siItem">
                <text>批次号：</text>
                <text>{{subItem.receiptBatchNo}}</text>
              </view>
            </view>
            <view class="row no-gutters d-flex justify-content-between align-items-center smallItem flex-wrap">
              <view class="col col-6">
                <text>送检数量：</text>
                <text>{{subItem.expectedCheckNumber}} </text>
              </view>
              <view class="col col-6">
                <text>已质检合格数：</text>
                <text>{{subItem.passCheckNumber}} </text>
              </view>
            </view>
            <view class="row no-gutters d-flex justify-content-between align-items-center smallItem flex-wrap">
              <view class="col col-6">
                <text>已质检问题数：</text>
                <text>{{subItem.problemCheckNumber}} </text>
              </view>
              <view class="col col-6">
                <text>待质检数量：</text>
                <text>{{subItem.waitCheckNumber}} </text>
              </view>
            </view>
            <view class="row no-gutters smallItem" v-if="bitStatus">
              <view class="col col-6">
                <view class="d-flex justify-content-start align-items-center">
                  <view class="text">质检合格数量</view>
                  <input type="number" v-model.trim="subItem.newPassCheckNum"
                    :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input">
                </view>
              </view>
              <view class="col col-6">
                <view class=" d-flex justify-content-start align-items-center">
                  <view class="text">质检问题数量</view>
                  <input type="number" :class="{themeInput:theme.inputStyle ==='DarkBlue'}"
                    v-model.trim="subItem.newProCheckNum" class="uni-input">
                </view>
              </view>
            </view>
          </view>
        </view>
        <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
      </view>
    </view>
    <view class="bottomBit">
      <view class="d-flex justify-content-between align-items-center normalPadding doubBit" v-if="bitStatus">
        <!-- <sevenButton long size="large" class="buttonFlex" type="primary" @click="submitData">提交质检结果</sevenButton>
        <sevenButton long size="large" class="buttonFlex" type="default" @click="bitStatus = !bitStatus">取消</sevenButton> -->
        <button type="primary" class="halfButtonBit" @click="submitData">提交质检结果</button>
        <button class="halfButtonBit" @click="bitStatus = !bitStatus">取消</button>
      </view>
      <view class="d-flex justify-content-start align-items-center normalPadding" v-if="!bitStatus">
        <sevenButton long size="large" class="buttonFlex" type="primary" @click="bitStatus = !bitStatus">批量质检
        </sevenButton>
      </view>
    </view>
  </view>
</template>

<script>
import Mixin from '@/mixin/common_mixin'
import api from '@/api/api'
import { debounce } from '@/common/debounce'
const prefixCls = 'tongtool-newWorkspace-qualityTestingList'
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
export default {
  mixins: [Mixin],
  data() {
    return {
      bitStatus: false,
      numberValue: 0,
      cb: '',
      selectFilterValue: '入库单',
      inStorageNum: '',
      storageFocus: true,
      apiData: {
        lastId: null,
        limit: 10,
        warehouseId: getStorage('newErpWarehouse').warehouseId
      },
      loadingType: 0,
      contentText: {
        contentdown: '上拉显示更多',
        contentrefresh: '正在加载...',
        contentnomore: '没有更多数据了'
      },
      list: [],
      cacheList: []
    }
  },
  components: {},
  computed: {
    wrap() {
      return `${prefixCls}`
    }
  },
  methods: {
    gotoDetails(data) {
      let v = this
      if (v.bitStatus) {
        return
      }
      let type = 0 // 入库单
      if (v.selectFilterValue = 'SKU号') {
        type = 1
      } else if (v.selectFilterValue === '批次号') {
        type = 2
      }
      // console.log('receiptBatchCheckNo:', receiptBatchCheckNo)
      uni.navigateTo({
        url: '/pages/workspace/qualityTestingDetails' + '?merchantId=' + data.merchantId + '&receiptBatchCheckNo=' + data.receiptBatchCheckNo + '&receiptNo=' + data.receiptNo + '&receiptBatchNo=' + data.receiptBatchNo + '&warehouseLocationId=' + data.warehouseLocationId + '&productGoodsId=' + data.goodsSku + '&receiptBatchCheckId=' + data.receiptBatchCheckId + '&type=' + type + '&goodsSku=' + data.goodsSku + '&realproductGoodsId=' + data.productGoodsId
      })
    },
    displayAndHide(receiptNo, totalCheckStatus, index) {
      let v = this
      v.list[index].totalCheckStatus = !totalCheckStatus
      if (totalCheckStatus) {
        v.cacheList[index].forEach((n, i) => {
          n.checkboxStatus = false
        })
      } else {
        v.cacheList[index].forEach((n, i) => {
          n.checkboxStatus = true
        })
      }
    },
    subDisplayAndHide(index, subIndex) {
      let v = this
      v.cacheList[index][subIndex].checkboxStatus = !v.cacheList[index][subIndex].checkboxStatus
    },
    scanCode() {
      let v = this
      uni.scanCode({
        success: function (res) {
          v.inStorageNum = res.result
          v.confirmData()
        },
        fail: function (error) {
          console.log('error:', error)
        }
      })
    },
    confirmData() {
      let v = this
      if (v.inStorageNum === '') {
        uni.showToast({
          icon: 'none',
          title: '搜索内容不能为空',
          duration: 2000
        })
        v.openSound('002')
        return false
      }
      v.list = []
      v.cacheList = []
      v.apiData.lastId = null
      v.getList()
    },
    getList() {
      let v = this
      v.loadingType = 1
      uni.showLoading({
        title: '数据加载中'
      })
      let dataObj = Object.assign({}, v.apiData)
      if (v.selectFilterValue === '入库单') {
        dataObj.receiptNo = v.inStorageNum
      } else if (v.selectFilterValue === '批次号') {
        dataObj.receiptBatchNo = v.inStorageNum
      } else {
        dataObj.sku = v.inStorageNum
      }
      const obj = {
        url: api.get_qualityList,
        data: dataObj
      }
      v.ajaxData(obj)
        .then(response => {
          uni.hideLoading()
          console.log(response.data.code)
          if (response.data.code === 0) {
            v.openSound('001')
            let data = response.data.datas
            if (data.length === 0 && v.list.length === 0) {
              uni.showToast({
                title: '没有查到相关数据',
                icon: 'none',
                duration: 2000
              })
              return false
            }
            if (data.length > 0) {
              let arr = []
              data.forEach((n, i) => {
                n.totalCheckStatus = true
                n.queryBatchCheckResultList.forEach((m, t) => {
                  m.newPassCheckNum = m.waitCheckNumber
                  m.newProCheckNum = 0
                  m.checkboxStatus = true
                })
                arr.push(n.queryBatchCheckResultList)
              })
              v.cacheList = arr
              v.list = v.list.concat(data)
              v.apiData.lastId = response.data.others.lastId
              v.loadingType = 0
              if (data.length < 10) {
                v.loadingType = 2
              }
            } else {
              v.loadingType = 2
            }
          } else if (response.data.code === 553806) {
            v.openSound('002')
            uni.showToast({
              title: 'sku不存在',
              duration: 3000,
              icon: 'none'
            })
            v.inStorageNum = ''
          } else if (response.data.code === 553408) {
            v.openSound('002')
            uni.showToast({
              title: '不存在未质检的质检单',
              duration: 3000,
              icon: 'none'
            })
            v.inStorageNum = ''
          } else {
            v.openSound('002')
          }
        })
    },
    showActionCondition() {
      let v = this
      uni.showActionSheet({
        itemList: ['SKU号', '入库单', '批次号'],
        success: function (res) {
          let index = res.tapIndex
          if (index === 0) {
            v.selectFilterValue = 'SKU号'
          } else if (index === 1) {
            v.selectFilterValue = '入库单'
          } else if (index === 2) {
            v.selectFilterValue = '批次号'
          }
        }
      })
    },
    submitData: debounce(function () {
      let v = this
      if (v.cacheList.length < 1) {
        return false
      }
      uni.showLoading({
        title: '数据提交中',
        mask: true
      })
      let arr = []
      let newArr = []
      v.cacheList.forEach((n, i) => {
        arr = arr.concat(n)
      })
      arr.forEach((n, i) => {
        n.passCheckNumber = n.newPassCheckNum;
        n.problemCheckNumber = n.newProCheckNum;
        n.goodsId = n.productGoodsId;// 货品id
        if (n.checkboxStatus) {
          newArr.push(n)
        }
      })
      const obj = {
        url: api.set_receiptCheckSubmitBatch,
        data: newArr
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            uni.hideLoading()
            uni.showToast({
              title: '提交质检结果成功',
              icon: 'none',
              duration: 2500
            })
            v.bitStatus = false
            v.list = []
            v.apiData.lastId = null
            v.cacheList = []
            v.inStorageNum = ''
            v.storageFocus = false
            v.$nextTick(function () {
              v.storageFocus = true
            })
          }
        })
    }, 1000),
  },
  onReachBottom() {
    let v = this
    if (v.loadingType !== 0) {
      return
    }
    v.getList()
  },
  onLoad(options) {
    let v = this
    let loadStoreWarehouse = getStorage('newErpWarehouse')
    v.warehouseName = loadStoreWarehouse.warehouseName
    if (options.receiptNo) {
      v.inStorageNum = options.receiptNo
      v.confirmData()
    } else if (options.receiptBatchNo) {
      v.inStorageNum = options.receiptBatchNo
      v.selectFilterValue = '批次号'
      v.confirmData()
    } else if (options.goodsSku) {
      v.inStorageNum = options.goodsSku
      v.selectFilterValue = 'SKU号'
      v.confirmData()
    }
    uni.setNavigationBarTitle({
      title: `质检(${v.warehouseName})`
    })
  }
}
</script>
<style scoped>
.tongtool-newWorkspace-qualityTestingList .scan-content {
  height: auto;
}
</style >
