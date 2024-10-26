<template>
    <view class="binning">
        <view class="d-flex header" v-if="transitBoxId">
          <view class="col-6">箱号：{{boxCode}}</view>
          <view class="col-6">货品种类：{{skuList.length}}</view>
        </view>
        <view class="scanWrap">
          <view class="uni-form-item uni-column">
            <view class="uni-input-wrapper" :class="{themeInput:theme.inputStyle ==='DarkBlue'}">
              <input class="uni-input" v-model.trim="goodsSku" :focus="inputFocus" @confirm="getDetails()"  placeholder="扫描SKU" />
              <view class="iconfont text-16" @click="scanCode">&#xe612;</view>
            </view>
          </view>
        </view>
      <view class="form">
        <view class="d-flex form-item">
          <view class="form-item-label">箱子尺寸(cm)</view>
          <view class="form-content"><input v-model.trim="boxSize"></view>
        </view>
        <view class="d-flex form-item">
          <view class="form-item-label">毛重(kg)</view>
          <view class="form-content"><input v-model.trim="totalWeight"></view>
        </view>
      </view>
      <view class="goods">
        <view class="item" v-for="(item,index) in skuList">
          <view class="d-flex">
            <view>
              <image :src="setImgPathOld(item.imageGroupId)" :mode="'aspectFit'" style="width: 60px;height: 60px;"  />
            </view>
            <view style="margin-left: 10px;margin-top: -4px;">
              <view class="d-flex">
                <view class="item-label">SKU:</view>
                <view>{{item.goodsSku}}</view>
              </view>
              <view class="d-flex">
                <view class="item-label">未装箱数量:</view>
                <view>{{item.pickQuantity}}</view>
              </view>
              <view class="d-flex">
                <view class="item-label">名称:</view>
                <view>{{item.productName}}</view>
              </view>
              <view class="d-flex">
                <view class="item-label">装箱数量：</view>
                <view><u-number-box  v-model="inputNumberList[index]" :min="0" :max="item.pickQuantity+item.boxNumber" @change="valChange(index)"></u-number-box></view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="bottomBit d-flex justify-content-center align-items-center">
        <button type="primary" style="background-color: #ff9500!important;color: #ffffff" size="mini"  @click="saveBinning('2')">结束装箱</button>
        <button type="primary" size="mini" @click="saveBinning('1')">保存装箱</button>
      </view>
    </view>
</template>

<script>
import Mixin from '@/mixin/common_mixin';
import api from "@/api/api";
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
export default {
  name: "binning",
  mixins: [Mixin],
  data() {
    return {
      boxCode: '',
      boxSize: '',
      totalWeight: '',
      goodsSku: '',
      transitBoxId: null,
      inputFocus: true,
      appropriationTransitplanDeliveryId: '',
      list: [],
      skuList: [],
      inputNumberList:[]
    };
  },
  created() {

  },
  onLoad (option) {

    if (option) {
      this.appropriationTransitplanDeliveryId = option.appropriationTransitplanDeliveryId;
      if (option.transitBoxId) {
        this.transitBoxId = option.transitBoxId
        this.getBoxDetail();
      } else {
        this.transitBoxId = null;
      }
    }
  },
  props: {},
  watch: {},
  methods: {
    /**
     * @date: 2021/3/17 15:40
     * @param boxStatus 0 未装箱 1 部分装箱 2 装箱完成
     */
    saveBinning (boxStatus) {
      let v = this;
      let invoiceListItem = getStorage('invoiceListItem');
      let detailItem = getStorage('detailItem');
      if (!v.saveValid()) return;

      const obj = {
        url: api.post_transitplanDelivery_save,
        data: {
          "appropriationTransitplanDeliveryId": v.appropriationTransitplanDeliveryId,
          "boxSize": v.boxSize,
          "boxStatus": boxStatus,
          "countryCode": invoiceListItem.countryCode,
          "goodsDetailId": v.skuList.map(i=>i.goodsDetailId),
          "isFba": detailItem.isFba,
          "quantity": v.inputNumberList,
          "shipmentPlanId": detailItem.shipmentPlanId,
          "totalWeight": v.totalWeight,
          "transitBoxId": v.transitBoxId
        }
      }
      v.ajaxData(obj).then(response=>{
        if(response.data.code === 0) {
          v.showToast('保存成功');
          uni.navigateBack();
          /*uni.redirectTo({
            url: '/pages/workspace/transferDeliverGoods/invoiceDetails?appropriationTransitplanDeliveryId=' + v.appropriationTransitplanDeliveryId
          });*/
        } else {
          v.showToast(response.data.message);
        }
      })
    },
    saveValid () {
      if (!this.boxSize) {
        this.showToast('请填写箱子尺寸')
        return false
      } else if (!this.totalWeight) {
        this.showToast('请填写箱子毛重')
        return false
      } else if (!this.skuList || this.skuList.length === 0) {
        this.showToast('请扫描sku')
        return false
      } else {
        return true;
      }
    },
    getBoxDetail () {
      let v = this;
      const obj = {
        url: api.post_transitplanDelivery_getBoxDetail,
        data: {
          transitBoxId: v.transitBoxId
        }
      }
      v.ajaxData(obj).then(response=>{
        if (response.data.code === 0) {
          v.skuList =response.data.datas.map(i=>{
            v.inputNumberList.push(i.boxNumber)
             return i
          });
          v.boxCode = v.skuList[0].boxCode;
          v.boxSize = v.skuList[0].boxSize;
          v.totalWeight = v.skuList[0].totalWeight;
        }
      })
    },
    getDetails() {
      let v = this
      v.loadingType = 1
      const obj = {
        url: api.post_transitplanDelivery_getDetail,
        data: {
          lastId: v.lastId,
          limit: 10,
          appropriationTransitplanDeliveryId: v.appropriationTransitplanDeliveryId,
          goodsSku: v.goodsSku
        }
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0 && response.data.datas.length > 0) {
            let datas = response.data.datas[0];
            let hasSku = false;
            v.skuList.forEach((i,index)=>{
              if (i.goodsSku === datas.goodsSku) {
                if (v.inputNumberList[index] < i.pickQuantity) {
                  v.inputNumberList[index]++
                } else {
                  v.showToast('sku:' + v.goodsSku + '已装箱完成')
                }
                hasSku = true
              }
            })
            if (!hasSku) {
              v.skuList.push(datas);
              v.inputNumberList.push(1);
            }
            v.goodsSku = '';
          } else {
            v.showToast('查询sku:'+v.goodsSku+'错误');
            v.goodsSku = '';
          }
          v.inputFocus = true;
        })
    },
    endBinning () {},
    confirmBlock () {},
    scanCode () {
      let v = this
      uni.scanCode({
        success: function (res) {
          v.goodsSku = res.result
          v.getDetails()
        },
        fail: function (error) {
          console.log('error:', error)
        }
      })
    },
    valChange(index) {

    }
  }
};
</script>

<style scoped lang="less">
  .binning {
      .header {
        padding: 10px 5px;
        font-size: 16px;
        background-color: #ffffff;
      }
      .form {
        background-color: #ffffff;
        padding: 6px 5px;
        .form-item {
          margin-bottom: 10px;
        }
        .form-item:last-child{
          margin-bottom: 0px;
        }
        .form-item-label {
          font-size: 13px;
          white-space: nowrap;
          width: 80px;
          flex: 0 0 80px;
        }
        .form-content {
          width: 100%;
          border: 1px solid #ddd;
          input {
            text-indent: 5px;
          }
        }
      }
    .goods {
      margin-top: 10px;
      padding-bottom: 60px;
      .item {
        padding: 10px;
        background-color: #ffffff;
        margin-bottom: 10px;
      }
      .item-label {
        padding-right: 10px;
        white-space: nowrap;
      }
    }

  }


  .scanWrap .uni-icon {
    margin-top: 2px;
  }

  .uni-input-wrapper {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    width: auto;
    padding: 8px 13px;
    flex-direction: row;
    flex-wrap: nowrap;
    background-color: #FFFFFF;
  }

  .uni-input {
    height: 28px;
    line-height: 28px;
    font-size: 15px;
    padding: 0px;
    flex: 1;
    background-color: #FFFFFF;
  }
</style>
