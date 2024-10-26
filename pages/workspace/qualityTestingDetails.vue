<template>
  <view :class="wrap">
    <view class="swiperWrap" v-if="gooodDetails">
      <swiper :indicator-dots="indicatorDots" :autoplay="autoplay" :interval="interval" :duration="duration"
        class="bannerItem">
        <swiper-item v-for="(item, index) in skuPicList" :key="index">
          <img class="fade_in" :src="newErpPrefix + item.imageurl" style="width: 100%">
        </swiper-item>
        <!-- <img-load ref="imgLoad"></img-load> -->
      </swiper>
    </view>
    <view class="scrollContainer" v-if="gooodDetails">
      <scroll-view class="scroll-view_H goodsList" scroll-y="true" :style="scrollHeight" @scroll="scroll"
        scroll-left="120">
        <view class="wrapItem">
          <view class="wrapTitle">
            <text>商品信息</text>
          </view>
          <view class="mu-divider"></view>
          <view class="wrapContainer">
            <view class="d-flex justify-content-start align-items-center">
              <text class="subTitle">SKU：</text>
              <text>{{params.productGoodsId}}</text>
            </view>
            <view class="d-flex justify-content-start align-items-center">
              <text class="subTitle">中文描述：</text>
              <text>{{gooodDetails.goodsCnDesc}}</text>
            </view>
            <view class="d-flex justify-content-start align-items-center">
              <text class="subTitle">英文描述：</text>
              <text>{{gooodDetails.goodsEnDesc}}</text>
            </view>
            <view class="d-flex justify-content-start align-items-center">
              <text class="subTitle">SKU属性：</text>
              <text>{{gooodDetails.goodsAttributes}}</text>
            </view>
            <view class="d-flex justify-content-between align-items-center">
              <view>
                <text class="subTitle">重量：</text>
                <text>{{gooodDetails.goodsWeight}}g</text>
              </view>
              <view>
                <text class="subTitle">长宽高：</text>
                <text>{{gooodDetails.goodsLength}}cm*{{gooodDetails.goodsWidth}}cm*{{gooodDetails.goodsHeight}}cm</text>
              </view>
            </view>
          </view>
        </view>
        <view class="wrapItem">
          <view class="wrapTitle">
            <text>收货信息</text>
          </view>
          <view class="mu-divider"></view>
          <view class="wrapContainer">
            <view class="d-flex justify-content-start align-items-center">
              <text class="subTitle">入库单号：</text>
              <text>{{params.receiptNo}}</text>
            </view>
            <view class="d-flex justify-content-start align-items-center">
              <text class="subTitle">收货批次号：</text>
              <text>{{params.receiptBatchNo}}</text>
            </view>
            <view class="d-flex justify-content-between align-items-center">
              <view>
                <text class="subTitle">收货库区：</text>
                <text>收货库区</text>
              </view>
              <view>
                <text class="subTitle">收货库位：</text>
                <text>{{gooodDetails.warehouseLocationName}}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="wrapItem">
          <view class="item">
            <view class="wrapTitle">
              <text>质检标准</text>
            </view>
            <view class="mu-divider"></view>
            <view class="wrapContainer" v-if="productQualityMeasureJsonMessage"
              v-for="subItem in productQualityMeasureJsonMessage" :key="subItem">
              <view class="itemTitle">
                <text>{{subItem}}</text>
              </view>
              <view class="d-flex justify-content-between align-items-center"
                v-for="(childItem, childIndex) in productQualityMeasureJsonMessageObj[subItem]" :key="childIndex">
                <text>
                  {{childItem[0]}}
                </text>
                <text>
                  {{childItem[1]}}
                </text>
              </view>
              <!-- <view class="d-flex justify-content-between align-items-center">
                <text>
                  外壳
                </text>
                <text>
                  不能有刮花
                </text>
              </view> -->
            </view>
          </view>
          <!-- <view class="item">
            <view class="itemTitle">
              <text>操作系统</text>
            </view>
            <view class="d-flex justify-content-between align-items-center">
              <text>
                接缝
              </text>
              <text>
                场均小于22.5min
              </text>
            </view>
            <view class="d-flex justify-content-between align-items-center">
              <text>
                外壳
              </text>
              <text>
                不能有刮花
              </text>
            </view>
          </view> -->
        </view>
        <view class="wrapItem">
          <view class="wrapTitle">
            <text>质检图片</text>
          </view>
          <view class="d-flex justify-content-start align-items-center flex-wrap" v-if="checkAttachment">
            <Image v-for="(checkItem, checkIndex) in checkAttachment" :key="checkIndex" :src="checkItem"
              style="width: 160upx; height: 160upx"></Image>

            <view class="uploadButton d-flex justify-content-center align-items-center">
              <image src="../../static/img/33603.png" style="width: 100upx; height: 100upx" @click="uploadQualityPic">
              </image>
            </view>
          </view>
        </view>
        <view style="height: 80upx; background: #efeff4;"></view>
      </scroll-view>
    </view>
    <view class="bottomBit">
      <view class="d-flex justify-content-end align-items-center buttonWrap">
        <view class="smallUploadButton">
          <image src="../../static/img/33603.png" style="width: 60upx; height: 60upx" @click="uploadQualityPic"></image>
        </view>
      </view>
      <view class="bottomWrap" v-if="gooodDetails">
        <view class="d-flex justify-content-between align-items-center">
          <view>
            <text>送检数量：</text>
            <text>{{gooodDetails.expectedCheckNumber}}</text>
          </view>
          <view>
            <text>已检数量：</text>
            <text>{{gooodDetails.checkedNumber}}</text>
          </view>
          <view>
            <text>待检数量：</text>
            <text>{{gooodDetails.expectedCheckNumber - gooodDetails.checkedNumber}}</text>
          </view>
        </view>
        <view class="d-flex justify-content-between align-items-center normal-margin-top inputText">
          <view class="d-flex justify-content-start align-items-center numInputWrap">
            <text>良品数量：</text>
            <input type="number" v-model.trim="goodProductNum" :class="{themeInput:theme.inputStyle ==='DarkBlue'}"
              class="smallNumInput">
            <!-- <uni-number-box :min="0" :value="numberValue" :step="1" size="small"></uni-number-box> -->
          </view>
          <view class="d-flex justify-content-start align-items-center numInputWrap">
            <text>不良品数量：</text>
            <input type="number" v-model.trim="badProductNum" :class="{themeInput:theme.inputStyle ==='DarkBlue'}"
              class="smallNumInput">
          </view>
        </view>
        <view class="d-flex justify-content- align-items-center normalPadding">
          <!-- <sevenButton long size="large" class="buttonFlex" @click="submitData">提交质检结果</sevenButton> -->
          <button class="fullButton" type="primary" @click="submitData">提交质检结果</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Mixin from '@/mixin/common_mixin'
import api from '@/api/api'
// import imgLoad from 'mpvue-img-load'
const prefixCls = 'tongtool-newWorkspace-qualityTestingDetails'
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
export default {
  mixins: [Mixin],
  data() {
    return {
      goodProductNum: null,
      badProductNum: null,
      numberValue: 0,
      skuPicList: [],
      indicatorDots: false,
      autoplay: true,
      interval: 5000,
      duration: 300,
      params: null,
      gooodDetails: null,
      productQualityMeasureJsonMessage: null,
      productQualityMeasureJsonMessageObj: null,
      checkAttachment: [],
      uploadImgStorage: []
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
      let val = screenHeight - uni.upx2px(782)
      return `
        height: ${val}px
      `
    }
  },
  methods: {
    uploadQualityPic() { // 上传质检图片
      let v = this
      uni.chooseImage({
        success: (chooseImageRes) => {
          const tempFilePaths = chooseImageRes.tempFilePaths;
          console.log('tempFilePaths:', tempFilePaths)
          tempFilePaths.forEach((n, i) => {
            uni.uploadFile({
              url: api.set_uploadQualityPic, //仅为示例，非真实的接口地址
              filePath: tempFilePaths[i],
              name: 'files',
              header: {
                'Authorization': getStorage('token')
              },
              formData: {
                merchantId: v.params.merchantId
              },
              success: (uploadFileRes) => {
                if (i === tempFilePaths.length - 1) {
                  uni.showToast({
                    title: '上传成功',
                    duration: 2000
                  })
                }
                let data = JSON.parse(uploadFileRes.data)
                if (v.checkAttachment) {
                  v.checkAttachment.push(data.datas)
                } else {
                  v.checkAttachment = [data.datas]
                }
                v.uploadImgStorage.push(data.datas)
              }
            });
          })
        }
      })
    },
    submitData() {
      let v = this
      if (!v.gooodDetails) {
        return false
      }
      uni.showLoading({
        title: '数据提交中',
        mask: true
      })
      let loadStoreWarehouse = getStorage('newErpWarehouse')
      const obj = {
        url: api.set_receiptCheckSubmit,
        data: {
          checkAttachment: v.uploadImgStorage.toString(),
          checkStatus: v.gooodDetails.checkStatus,
          expectedCheckNumber: v.gooodDetails.expectedCheckNumber,
          passCheckNumber: v.goodProductNum,
          problemCheckNumber: v.badProductNum,
          goodsSku: v.params.productGoodsId,
          productGoodsId: v.params.productGoodsId,
          receiptBatchCheckId: v.params.receiptBatchCheckId,
          receiptBatchCheckNo: v.params.receiptBatchCheckNo,
          receiptBatchNo: v.params.receiptBatchNo,
          receiptNo: v.params.receiptNo,
          remark: '',
          waitCheckNumber: v.gooodDetails.expectedCheckNumber - v.gooodDetails.checkedNumber,
          warehouseId: loadStoreWarehouse.warehouseId,
          warehouseLocationId: v.params.warehouseLocationId,
          warehouseName: loadStoreWarehouse.warehouseName,
          goodsId: v.params.realproductGoodsId,// 货品id
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            uni.hideLoading()
            uni.showToast({
              title: '提交成功',
              duration: 2000
            })
            setTimeout(function () {
              let url = '/pages/workspace/qualityTestingList?receiptNo=' + v.params.receiptNo
              if (v.params.type === '1') {
                url = '/pages/workspace/qualityTestingList?goodsSku=' + v.params.goodsSku
              } else if (v.params.type === '2') {
                url = '/pages/workspace/qualityTestingList?receiptBatchNo=' + v.params.receiptBatchNo
              }
              uni.redirectTo({
                url: url
              })
            }, 2000)
          } else if (response.data.code === 552000) {
            uni.showToast({
              title: '质检数量不能超过待质检数量',
              duration: 2000,
              icon: 'none'
            })
          } else {
            uni.showToast({
              title: '操作报错，请重新尝试',
              duration: 2000,
              icon: 'none'
            })
          }
        })
    },
    scroll() {

    },
    getDetails() {
      let v = this
      uni.showLoading({
        title: '数据加载中'
      })
      const obj = {
        url: api.get_singleReceiptDetails,
        data: v.params
      }
      v.ajaxData(obj)
        .then(response => {
          uni.hideLoading()
          if (response.data.code === 0) {
            console.log('res:', response)
            v.gooodDetails = response.data.datas
            if (v.gooodDetails.expectedCheckNumber && v.gooodDetails.checkedNumber) {
              v.goodProductNum = v.gooodDetails.expectedCheckNumber - v.gooodDetails.checkedNumber
            } else if (v.gooodDetails.expectedCheckNumber) {
              v.goodProductNum = v.gooodDetails.expectedCheckNumber
            }
            if (v.gooodDetails.receiptBatchCheckDetailList && v.gooodDetails.receiptBatchCheckDetailList.length > 0) {
              let arr = []
              v.gooodDetails.receiptBatchCheckDetailList.forEach(n => {
                arr = arr.concat(n.checkAttachment.split(','))
              })
              v.checkAttachment = arr
            }

            if (v.gooodDetails.goodsUrl) {
              v.skuPicList = [{ imageurl: v.gooodDetails.goodsUrl, loaded: true }]
            }
            if (v.gooodDetails.productQualityMeasureJsonMessage) {
              let standard = JSON.parse(v.gooodDetails.productQualityMeasureJsonMessage)
              let subObj = {}
              standard.forEach((n, i) => {
                if (subObj[n.measureName]) {
                  subObj[n.measureName].push([n.itemName, n.itemValue])
                } else[
                  subObj[n.measureName] = [[n.itemName, n.itemValue]]
                ]
              })
              v.productQualityMeasureJsonMessageObj = subObj
              console.log(subObj)
              v.productQualityMeasureJsonMessage = Object.keys(subObj)
            }

          }
        })
    }
  },
  onLoad(option) {
    let v = this
    console.log('option:', option)
    v.params = Object.assign({}, option)
    v.getDetails()
  }
}
</script>

<style>

</style>
