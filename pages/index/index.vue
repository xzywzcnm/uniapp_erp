<template>
  <view>
    <view :class="bannerWrap">
      <swiper :indicator-dots="indicatorDots" :autoplay="autoplay" :interval="interval" :duration="duration" :class="bannerItem">
        <swiper-item v-for="(item, index) in adList" :key="index">
          <img class="fade_in" :src="item.imageurl">
        </swiper-item>
      </swiper>
    </view>
    <view class="d-flex" :class="regAndLogin">
      <span v-if="!isLogin" class="text-12">注册即享强大ERP功能</span>
      <view v-if="!isLogin" class="reg">
        <button :size="defaultSize" :loading="loading" @tap="register" class="regButton"> {{regTitle}} </button>
        <button type="primary" :size="defaultSize" :loading="loading" class="regButton" @tap="login">
          {{loginTitle}}
        </button>
      </view>
      <view v-if="isLogin" class="d-flex justify-content-end align-items-center normalPadding hasLogin">
        <span class="text-14" v-if="userInfo">欢迎您，{{userInfo.user.userName}}</span>
        <button :size="defaultSize" :loading="loading" type="warn" @tap="logout" class="regButton"> 退出登录
        </button>
      </view>
    </view>
    <view class="normal-margin-top" v-if="(has_erp_version && isLogin && getPermission('app_view_sales') ||
		getPermission('app_view_sales_trends') || getPermission('app_view_job_statistics')) || (userInfo && userInfo.merchant && userInfo.merchant.merchantId === '000007')">
      <!--有时间把这sb 组件改了-->
      <uni-segmented-control :current="current" :values="tabArr" @clickItem="onClickItem" bgColor="#FFFFFF" activeColor="#1976d2" style-type="text">
      </uni-segmented-control>
      <view class="white-bg-color" :class="tabWrap">
        <view v-show="currentId === 0 && (getPermission('app_view_sales') || (userInfo && userInfo.merchant && userInfo.merchant.merchantId === '000007'))">
          <view class="gridlist-inline-demo" v-if="salesList.length > 0">
            <view class="wrap" v-for="item in salesList" :key="item.date">
              <view class="salesDate">
                <span class="text-12" :class="{priBg: item.date === '今天'}">{{item.date}}</span>
                <view class="mu-divider"></view>
              </view>
              <view class="row salesContent text-12">
                <view class="col" :class="'col-' + salesContentLeft">订单量：</view>
                <view class="col" :class="'col-' + salesContentRight">{{item.orderNumPerDay}}</view>
              </view>
              <view class="row salesContent text-12">
                <view class="col" :class="'col-' + salesContentLeft">销售额：</view>
                <view class="col" :class="'col-' + salesContentRight">
                  <view v-for="(subItem, index2) in item.amountList" :key="index2">
                    {{subItem.currencyCode}} {{subItem.amount}}</view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-show="currentId === 1 && getPermission('app_view_sales_trends')">
          <view class="canvasView">
            <view class="d-flex justify-content-center orange-color normalPadding">
              <view class="qiun-title-dot-light">销售额趋势图</view>
            </view>
            <!-- <canvas canvas-id="canvasLineA" id="canvasLineA" class="charts" @touchstart="touchLineA"></canvas> -->
            <canvas canvas-id="canvasLineA" id="canvasLineA" class="charts" disable-scroll=true @touchstart="touchLineA" @touchmove="moveLineA" @touchend="touchEndLineA"></canvas>
            <!-- <mpvue-echarts :echarts="echarts" :onInit="lineInit" lazyLoad canvasId="line" ref="lineChart" /> -->
          </view>
        </view>
        <view v-show="(currentId === 2) && getPermission('app_view_job_statistics')">
          <view class="row no-gutters">
            <view class="col col-5">
              <view class="todayTotal wrap">
                <view class="salesDate">
                  <span class="text-12">本日累计</span>
                  <view class="mu-divider"></view>
                </view>
                <view class="d-flex justify-content-start text-12 todayItem">
                  <view>到货入库：</view>
                  <view>{{todayInsertTime}}</view>
                </view>
                <view class="d-flex justify-content-start text-12 todayItem">
                  <view>库存转移：</view>
                  <view>{{todayTransferTime}}</view>
                </view>
                <view class="d-flex justify-content-center text-12 align-items-center detailsItem" @click="gotoPage('/pages/index/statistics?type=1')">
                  <text>查看详情</text>
                </view>
              </view>
            </view>
            <view class="col col-5 offset-1">
              <view class="todayTotal wrap">
                <view class="salesDate">
                  <span class="text-12">{{month}}月累计</span>
                  <view class="mu-divider"></view>
                </view>
                <view class="d-flex justify-conent-start text-12 todayItem">
                  <view>到货入库：</view>
                  <view>{{mInsertTime}}</view>
                </view>
                <view class="d-flex justify-conent-start text-12 todayItem">
                  <view>库存转移：</view>
                  <view>{{mTransferTime}}</view>
                </view>
                <view class="d-flex justify-content-center text-12 align-items-center detailsItem" @click="gotoPage('/pages/index/statistics?type=2')">
                  <text>查看详情</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="has_erp_version" :class="bannerWrap" class="normal-margin-top white-bg-color">
      <swiper :indicator-dots="indicatorDots" :indicator-color="indicatorColor" :indicator-active-color="indicatorActiveColor" :autoplay="autoplay" :interval="interval2" :duration="duration" :circular="circular" :previous-margin="'88rpx'" :next-margin="'88rpx'" @change="swiperChange" :display-multiple-items="1" :style="{width: '100vw', height: '260rpx'}">
        <swiper-item v-for="(item, bannerIndex) in adRangList" :key="bannerIndex" @click="gotoUrl(item.url)">
          <div :style="{
            boxSizing: 'border-box',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItem: 'center',
            justifyContent: currentIndex === 0 ? ((bannerIndex === adList.length - 1) ? 'flex-end' : (bannerIndex === 1 ? 'flex-start' : 'center')) : (currentIndex === adList.length - 1 ? (bannerIndex === 0 ? 'flex-start' : (bannerIndex === adList.length - 2 ? 'flex-end' : 'center')) : (bannerIndex === currentIndex - 1 ? 'flex-end' : (bannerIndex === currentIndex + 1 ? 'flex-start' : 'center'))),
            padding: currentIndex === 0
              ? ((bannerIndex === adList.length - 1)
                ? '56rpx 0rpx 0 0' : (bannerIndex === 1 ? '56rpx 0 0 0rpx' : '56rpx 0 0 0')) : (currentIndex === adList.length - 1
                    ? (bannerIndex === 0 ? '56rpx 0 0 0rpx' : (bannerIndex === adList.length - 2
                      ? '56rpx 0rpx 0 0' : '56rpx 0 0 0')) : (bannerIndex === currentIndex - 1
                        ? '56rpx 0rpx 0 0' : (bannerIndex === currentIndex + 1
                          ? '56rpx 0 0 26rpx' : '56rpx 0 0 0')))
          }">
            <image :src="item.imageurl" class="slide-image fade_in" :style="{
                transform: currentIndex === bannerIndex ? 'scale(' + scaleX + ',' + scaleY + ')' : 'scale(1, 1)',
                transitionDuration: '.3s',
                transitionTimingFunction: 'ease',
                width: currentIndex !== bannerIndex ? item.width + 'rpx' : '450rpx',
                height:  currentIndex !== bannerIndex ? item.height + 'rpx' : (450 / (item.width / item.height)) + 'rpx'
              }"></image>
          </div>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>
<style>
.canvasView {
  width: 90vw;
  height: 500upx;
}
</style>
<style scoped>
@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.fade_in {
  animation: fadeIn 1s both;
}

.slide-image {
  width: 450upx;
  height: 160upx;
  z-index: 200;
  border-radius: 16upx;
}

.gridlist-inline-demo {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}
</style>
<script>
import Mixin from '@/mixin/common_mixin'
import {
  setStorage,
  getStorage,
  removeStorage,
} from '@/utils'
import api from '@/api/api'
import uCharts from '@/components/u-charts/u-charts.js'
import refreshPageToken from '@/utils/refreshPageToken';
const prefixCls = 'tongtool-home'
var _self
let canvaLineA = null
export default {
  mixins: [Mixin],
  data () {
    return {
      tabArr: [],
      has_erp_version: false,
      currentId: null,
      chartData: {
        categories: ['2012', '2013', '2014', '2015', '2016', '2017'],
        series: [{
          name: '成交量A',
          data: [35, 20, 25, 37, 4, 20],
          color: '#000000'
        }, {
          name: '成交量B',
          data: [70, 40, 65, 100, 44, 68]
        }, {
          name: '成交量C',
          data: [100, 80, 95, 150, 112, 132]
        }]
      },
      cWidth: '',
      cHeight: '',
      pixelRatio: 1,
      isAdmin: '0',
      lineOpt: null,
      // echarts: echarts,
      salesList: [],
      current: 0,
      defaultSize: 'mini',
      primarySize: 'default',
      warnSize: 'default',
      indicatorColor: 'rgba(255, 255, 255, .4)',
      indicatorActiveColor: 'rgba(255, 255, 255, 1)',
      currentIndex: 0,
      animationIndex: 0,
      circular: true,
      scaleX: 1.1527,
      scaleY: 1.1524,
      duration: 300,
      loading: false,
      active1: 0,
      adList: [],
      adRangList: [],
      indicatorDots: false,
      autoplay: true,
      interval: 5000,
      interval2: 3000,
      totalSalesMes: [],
      todayInsertTime: 1, // 当天入库
      todayTransferTime: 1, // 当天转移
      mInsertTime: 1, // 一年入库
      mTransferTime: 1 // 一年转移
    }
  },
  computed: {
    month () {
      let date = new Date()
      return date.getMonth() + 1
    },
    lookup () {
      return getStorage('lookup')
    },
    bannerWrap () {
      return `${prefixCls}`
    },
    bannerItem () {
      return `${prefixCls}-firstscreen`
    },
    regAndLogin () {
      return `${prefixCls}-regAndLogin ${!this.isLogin ? 'justify-content-between' : 'justify-content-end'}`
    },
    rangeAdList () {
      return `${prefixCls}-rangeAdList`
    },
    tabWrap () {
      return `${prefixCls}-tabWrap`
    },
    salesContentLeft () {
      let v = this
      if (v.domWidth < 360) {
        return 5
      } else {
        return 4
      }
    },
    salesContentRight () {
      let v = this
      if (v.domWidth < 360) {
        return 7
      } else {
        return 8
      }
    },
    regTitle () {
      let v = this
      if (v.domWidth < 340) {
        return '注册'
      } else {
        return '免费开通'
      }
    },
    loginTitle () {
      let v = this
      if (v.domWidth < 340) {
        return '登录'
      } else {
        return '已有帐号，登录'
      }
    },
    userInfo () {
      return this.store.state.userInfo
    }
  },
  watch: {
    currentId: {
      handler (n, o) {
        let v = this;
        if (n === 0 && v.isLogin) {
          this.$nextTick(function () {
            v.getSignInMes();
          })
        } else if (n === 1 && v.isLogin) {
          this.$nextTick(function () {
            v.makeOption()
          })
        } else if (n === 2 && v.isLogin) {
          v.getWorkloadByUserID('01')
          v.getWorkloadByUserID('02')
          v.getWorkloadByUserID('01', 1)
          v.getWorkloadByUserID('02', 1)
        }
      },
      immediate: true
    },
    pageStatus (n, o) {
      if (n) {
        this.getLoginInfo()
      }
    }
  },
  methods: {
    showLineA (canvasId, chartData) {
      canvaLineA = new uCharts({
        $this: _self,
        canvasId: canvasId,
        type: 'line',
        fontSize: 11,
        legend: {
          show: true,
        },
        dataLabel: true,
        dataPointShape: true,
        background: '#FFFFFF',
        pixelRatio: _self.pixelRatio,
        categories: chartData.categories,
        series: chartData.series,
        animation: false,
        enableScroll: true, //开启图表拖拽功能
        xAxis: {
          disableGrid: false,
          type: 'grid',
          gridType: 'dash',
          itemCount: 4,
          scrollShow: true,
          scrollAlign: 'left',
          scrollBackgroundColor: '#F7F7FF',
          scrollColor: '#DEE7F7',
        },
        yAxis: {
          gridType: 'dash',
          splitNumber: 8,
          min: 10,
          max: 180,
          format: (val) => {
            return (val / 10000).toFixed(2) + '(万)'
          }
        },
        width: _self.cWidth * _self.pixelRatio,
        height: _self.cHeight * _self.pixelRatio,
        padding: [10, 20, 30, 10],
        extra: {
          line: {
            type: 'straight'
          }
          // tooltip:{
          //   showBox: false,//是否显示半透明黑色的提示区域
          //   bgColor: '#000000',//主体背景颜色
          //   bgOpacity: 0.7,//背景颜色透明度
          //   gridType: 'dash',//辅助线类型（虚线）
          //   dashLength: 5,//虚线单段长度
          //   gridColor: '#1890ff',//辅助线颜色
          //   fontColor: '#FFFFFF',//主体文字颜色
          //   horizentalLine: true,//是否显示横向辅助线
          //   xAxisLabel: true,//是否显示X轴辅助标签
          //   yAxisLabel: true,//是否显示Y轴辅助标签
          //   labelBgColor: '#DFE8FF',//标签背景颜色
          //   labelBgOpacity: 0.95,//背景颜色透明度
          //   labelFontColor: '#666666'//标签文字颜色
          // }
        }
      })
    },
    // touchLineA (e) {
    //   canvaLineA.showToolTip(e, {
    //     format: function (item, category) {
    //       return category + ' ' + item.name + ':' + item.data + '(元)'
    //     }
    //   })
    // },
    touchEndLineA (e) {
      canvaLineA.scrollEnd(e)
      //下面是toolTip事件，如果滚动后不需要显示，可不填写
      canvaLineA.touchLegend(e)
      canvaLineA.showToolTip(e, {
        format: function (item, category) {
          return category + ' ' + item.name + ':' + item.data
        }
      })
    },
    touchLineA (e) {
      // canvaLineA.showToolTip(e, {
      //   format: function (item, category) {
      //     return category + ' ' + item.name + ':' + item.data + '(元)'
      //   }
      // })
      canvaLineA.scrollStart(e)
    },
    moveLineA (e) {
      canvaLineA.scroll(e)
    },
    getWorkloadByUserID (bussType, type) {
      let v = this
      let fromDate;
      let toDate;
      let today = new Date()
      if (!type) {
        toDate = v.getDateTime(today.getTime() + 24 * 60 * 60 * 1000)
        // let dDay = new Date(today.getTime() - 24 * 60 * 60 *1000)
        fromDate = v.getDateTime(today)
      } else {
        toDate = v.getDateTime(today.getTime() + 24 * 60 * 60 * 1000)
        let day = today.getDate() - 1
        let mDate = new Date(today.getTime() - day * 24 * 60 * 60 * 1000)
        fromDate = v.getDateTime(mDate)
      }
      const obj = {
        url: api.get_workloadByUserId,
        data: {
          fromDate: fromDate,
          toDate: toDate,
          bussType: bussType
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            if (bussType === '01' && !type) {
              v.todayInsertTime = response.data.datas
            } else if (bussType === '02' && !type) {
              v.todayTransferTime = response.data.datas
            } else if (bussType === '01' && type) {
              v.mInsertTime = response.data.datas
            } else if (bussType === '02' && type) {
              v.mTransferTime = response.data.datas
            }
          }
        })
    },
    makeOption () {
      let v = this
      let result = {}
      let keyData = []
      let keyCount = []
      let keyValue = []
      let sumsList = {}
      let toalMes = v.totalSalesMes.concat([])
      let tsData = toalMes
      let LineA = {
        categories: [],
        series: [],
      }
      tsData.forEach((n, i) => {
        keyData.push(n.date)
        n.amountList.forEach((m, t) => {
          if (sumsList.hasOwnProperty(m.currencyCode)) {
            sumsList[m.currencyCode].push(m.amount)
          } else {
            sumsList[m.currencyCode] = [m.amount]
          }
        })
      })
      LineA.categories = keyData
      console.log('keyData:', keyData)

      for (let item in sumsList) {
        let dataCount = {
          name: item,
          type: 'line',
          smooth: true,
          areaStyle: {
            normal: {},
          },
          data: sumsList[item],
        }
        keyCount.push(dataCount)
        keyValue.push(item)
      }
      LineA.series = keyCount.sort()
      _self.showLineA("canvasLineA", LineA);
      console.log('keyCount:', keyCount)
      console.log('keyValue:', keyValue)

    },
    lineInit (canvas, width, height) {
      console.log('width:')
      console.log(width)
      let lineChart = echarts.init(canvas, null, {
        width: width,
        height: height
      })
      canvas.setChart(lineChart)

      lineChart.setOption(this.lineOpt)
      return lineChart
    },
    onClickItem (index) {
      if (this.tabArr[index] === '销售额') {
        this.currentId = 0;
      } else if (this.tabArr[index] === '趋势') {
        this.currentId = 1;
      } else if (this.tabArr[index] === '工作统计') {
        this.currentId = 2;
      }
      if (this.current !== index) {
        this.current = index;
      }
    },
    swiperChange (e) {
      this.currentIndex = e.mp.detail.current
      this.scaleX = 1.1527
      this.scaleY = 1.1524
    },
    getadList () { // first screen ad list request
      let v = this
      const obj = {
        url: api.get_rangeAdList,
        type: 'GET'
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            v.adList = response.data.datas
          }
        })
    },
    getRangeList () { // range ad list
      let v = this
      const obj = {
        url: api.get_adList,
        type: 'GET'
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            v.adRangList = response.data.datas
          }
        })
    },
    getCommonLookUP () {
      let v = this
      return new Promise(resolve => {
        if (v.lookup) {
          resolve(true)
        }
        const obj = {
          url: api.get_commonLookUP,
          type: 'GET'
        }
        v.ajaxData(obj)
          .then(response => {
            setStorage('lookup', response.data.datas)
            // v.store.commit('lookup', response.data.datas)
            let isLogin = v.store.state.isLogin
            if (isLogin) {
              v.getSettingConfigData()
            }
            resolve(true)
          })
      })
    },
    getSignInMes () { // 获取登录后的数据获取
      let v = this;
      !(async () => {
        const result = await v.getTotalSalesMes()
        if (result) {
          let user = v.store.state.userInfo.user
          v.isAdmin = user.isAdmin
          console.log('finish')
          // await v.getTrendData()
        }
      })()
    },
    getTotalSalesMes () {
      let v = this
      let today = new Date()
      let fromDate = v.getDateTime(today)
      let mDate = new Date(today.getTime() - 2592000000)
      let toDate = v.getDateTime(mDate)
      let userInfo = v.store.state.userInfo
      if (!v.has_erp_version && userInfo && userInfo.merchant && userInfo.merchant.merchantId !== "000007") return
      const obj = {
        url: api.get_totalSalesCountMes,
        data: {
          fromDate: toDate,
          toDate: fromDate
        }
      }
      return new Promise(resolve => {
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas
              v.totalSalesMes = v.objDeepCopy(data)
              if (data.length > 0) { // 处理销售额过程
                let salesArr = []
                if (data.length > 2) {
                  salesArr = salesArr.concat(data.slice(0, 3))
                } else {
                  salesArr = salesArr.concat(data)
                }
                v.makeSalesList(salesArr)
              }
              resolve(true)
            }
          })
      })
    },
    objDeepCopy (source) {
      let v = this
      let sourceCopy = source instanceof Array ? [] : {};
      for (let item in source) {
        sourceCopy[item] = typeof source[item] === 'object' ? v.objDeepCopy(source[item]) : source[item];
      }
      return sourceCopy;
    },
    makeSalesList (arr) { // 整合销售额数据
      let v = this
      arr.forEach((n, i) => {
        n.date = v.compareDate(n.date)

      })
      v.salesList = arr
    },
    compareDate (dataDate) {
      let v = this
      let today = v.getDateTime(new Date())
      today = new Date(today).getTime()
      let newDataDate = new Date(dataDate).getTime()
      if (today === newDataDate) {
        return '今天'
      } else if (newDataDate + 86400000 * 1 === today) {
        return '昨天'
      } else if (newDataDate + 86400000 * 2 === today) {
        return '前天'
      } else {
        return dataDate
      }
    },
    register () {
      let v = this
      uni.navigateTo({
        url: '/pages/index/ad' + '?url=' + v.lookup.registerUrl
      })
    },
    gotoUrl (url) {
      let v = this
      // #ifndef MP-WEIXIN
      uni.navigateTo({
        url: '/pages/index/ad' + '?url=' + url
      })
      // #endif
    },
    logout () {
      let v = this
      uni.showModal({
        title: '提示',
        content: '退出登录？',
        success: function (res) {
          if (res.confirm) {
            uni.showLoading({
              title: '退出登录中，请稍等',
              mask: true
            })
            setTimeout(() => {
              uni.hideLoading()
              refreshPageToken.removeInfo();
            }, 500)
            return;
            const obj = {
              url: api.set_logout + '?token=' + getStorage('token')
            }
            v.ajaxData(obj)
              .then(response => {
                if (response.data.code === 0) {
                  removeStorage('settingsConfigObj')
                  removeStorage('token')
                  removeStorage('warehouseList')
                  removeStorage('newErpWarehouseList')
                  removeStorage('inventorQuery')
                  removeStorage('inventorQueryVerification')
                  removeStorage('cargoSpaceTransfer')
                  v.store.commit('userInfo', null)
                  v.store.commit('isLogin', false)
                  uni.hideLoading()
                  refreshPageToken.removeInfo();
                  v.$nextTick(function () {
                    uni.redirectTo({
                      url: '/pages/index/logout' + '?url=' +
                        response.data.others.logOutUrl
                    })
                  })
                }
              })
          }
        }
      })
    },
    getSettingConfigData () {
      let v = this
      const obj = {
        url: api.get_settingConfig,
        type: 'GET'
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            v.$nextTick(function () {
              v.settingsConfigObj = Object.assign({}, response.data.datas)
              setStorage('settingsConfigObj', v.settingsConfigObj)
            })
          }
        })
    },
    downWgt (url) {
      let v = this
      plus.nativeUI.showWaiting('正在下载最新资源文件...');
      plus.downloader.createDownload(url, {
        filename: '_doc/update/'
      }, function (d, status) {
        if (status === 200) {
          console.log('下载资源成功：' + d.filename)
          v.installWgt(d.filename) // 安装wgt包
        } else {
          console.log('下载资源失败！')
          plus.nativeUI.alert('下载资源失败！')
        }
        plus.nativeUI.closeWaiting()
      }).start()
    },
    installWgt (path) {
      plus.nativeUI.showWaiting('安装最新资源文件...')
      plus.runtime.install(path, {}, function () {
        plus.nativeUI.closeWaiting()
        console.log('安装最新资源文件成功！')
        plus.nativeUI.alert('应用资源更新完成！', function () {
          plus.runtime.restart();
        })
      }, function (e) {
        plus.nativeUI.closeWaiting()
        console.log('安装wgt文件失败[' + e.code + ']：' + e.message)
        plus.nativeUI.alert('安装wgt文件失败[' + e.code + ']：' + e.message)
      })
    },
    outApp () {
      plus.runtime.quit()
    },
    agree () {
      setStorage('privacy1', 1)
    }
  },
  onLoad (options) {
    let v = this;
    _self = this
    v.cWidth = uni.upx2px(750)
    v.cHeight = uni.upx2px(500)
    // v.getServerData();
    uni.showLoading();
    !(async () => {
      const result = await v.getCommonLookUP()
      if (result) {
        v.getadList(); // 首页首屏广告
        v.getRangeList(); // /api/app/v2/homePage/advs
        if (getStorage('token') && !this.store.state.isLogin) {
          v.getLoginInfo().then(result => {
            if (result) {
              setStorage('userName', v.store.state.userInfo.user);
              let user = v.store.state.userInfo.user
              let userInfo = v.store.state.userInfo
              v.isAdmin = user.isAdmin
              v.getErpConfig().then(data => {
                if (data.oldErp || userInfo.merchant.merchantId === "000007") {
                  v.has_erp_version = true;
                  v.getSinglePageRoleCommon('pda_index', '2.0').then(() => {
                    v.tabArr = []
                    if (v.getPermission('app_view_sales')) {
                      v.tabArr.push('销售额')
                    }
                    if (v.getPermission(
                      'app_view_sales_trends')) {
                      v.tabArr.push('趋势')
                    }
                    if (v.getPermission(
                      'app_view_job_statistics')) {
                      v.tabArr.push('工作统计')
                    };
                    if (v.tabArr.length > 0) {
                      v.onClickItem(0)
                    }
                    v.getTotalSalesMes()
                  });
                } else {
                  v.has_erp_version = false
                }
              })
            }
          })
        }
      }
    })()

  },
  onShow () {
    let v = this
    let isLogin = v.store.state.isLogin
    let userInfo = v.store.state.userInfo;

    if (!isLogin && !getStorage('token')) {
      v.store.commit('isLogin', false)
    }
    if (isLogin) {
      v.getLoginInfo()
        .then(result => {
          if (result) {
            setStorage('userName', v.store.state.userInfo.user);
            let user = v.store.state.userInfo.user
            let userInfo = v.store.state.userInfo
            v.isAdmin = user.isAdmin
            v.getErpConfig().then(data => {
              if (data.oldErp || userInfo.merchant.merchantId === "000007") {
                v.has_erp_version = true;
                v.getSinglePageRoleCommon('pda_index', '2.0').then(() => {
                  v.tabArr = []
                  if (v.getPermission('app_view_sales')) {
                    v.tabArr.push('销售额')
                  }
                  if (v.getPermission('app_view_sales_trends')) {
                    v.tabArr.push('趋势')
                  }
                  if (v.getPermission('app_view_job_statistics')) {
                    v.tabArr.push('工作统计')
                  };
                  if (v.tabArr.length > 0) {
                    v.onClickItem(0)
                  }
                  v.getTotalSalesMes()
                });
              } else {
                v.has_erp_version = false
              }
            })
          }
        })
    }
  },
  onReady () {
    uni.hideLoading()
  },
  onPullDownRefresh () {
    setTimeout(function () {
      uni.stopPullDownRefresh()
    }, 1000)
  }
}
</script>
<style>
/*样式的width和height一定要与定义的cWidth和cHeight相对应*/
.qiun-charts {
  width: 750upx;
  height: 500upx;
  background-color: #ffffff;
}

.charts {
  width: 750upx;
  height: 500upx;
  background-color: #ffffff;
}
</style>
