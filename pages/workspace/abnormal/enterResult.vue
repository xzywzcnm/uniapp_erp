<template >
    <view>
      <view class="uni-form-item uni-column inventory-move">
        <view class="uni-input-wrapper" :class="{themeInput:theme.inputStyle ==='DarkBlue'}">
          <input class="uni-input"  v-model.trim="skuNo" @confirm='confirmNext' :focus="inputFocus" placeholder="扫描SKU" />
          <view class="iconfont text-16" @click="scanCode('1')">&#xe612;</view>
        </view>
        <view class="uni-input-wrapper" :class="{themeInput:theme.inputStyle ==='DarkBlue'}">
          <input class="uni-input"  v-model.trim="locationOrPackageCode"  :focus="inputFocus1" @confirm="confirmCodeNext"  placeholder="扫描异常处理库位或出库单" />
          <view class="iconfont text-16" @click="scanCode('2')">&#xe612;</view>
        </view>
      </view>
      <view class="pickingItem" v-if="details">
        <view class="d-flex er-title">
          <view class="img-box" v-if="details.goodsUrl">
              <image class="img-item" mode="aspectFit" :src="setImgPath(details.goodsUrl)"/>
          </view>
          <view>
            <view> <text >SKU：{{details.wmsGoods.goodsSku}}</text></view>
            <view> <text >货品名称：{{details.wmsGoods.goodsCnDesc}}</text></view>
          </view>
        </view>
        <view class="pickingItemContent" v-for="(item,index) in details.scanInputSupplementResultPackageGoodsRsList" :key="index">
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">异常处理库区：</text>
            <text>{{item.exceptionHandBlockCode }}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">异常处理库位：</text>
            <text>{{item.exceptionHandLocationCode}}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">出库单号：</text>
            <text>{{item.packageCode}}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">物流方式：</text>
            <text>{{item.carrierName}}>>>{{item.carrierShippingMethodName}}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">待拣货数量：</text>
            <text>{{item.expectPickingNumber}}</text>
          </view>
          <view class="d-flex justify-content-start pItem">
            <text class="pItemTitle">已拣货数量：</text>
            <text>{{item.donePickingNumber}}</text>
          </view>
          <view class="d-flex justify-content-start pItem" v-if="details.scanInputSupplementResultPackageGoodsRsList.length === 1">
            <text class="pItemTitle fontBold">本次补拣数量：</text>
            <input class="input-u" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" v-model.trim="pickNumber" />
          </view>
        </view>
      </view>
      <view class="bottomBit row no-gutters">
        <view class=" d-flex justify-content-center align-tiems-center" style="width: 100%">
          <button type="primary" size="mini" :disabled="!details || details.scanInputSupplementResultPackageGoodsRsList.length !== 1" @click="submit">提交</button>
          <button type="primary"  size="mini" @click="lookPickLog()">查看补拣记录明细</button>
        </view>
      </view>
    </view>
</template >

<script >
import api from '@/api/api';
import Mixin from '@/mixin/common_mixin';
import { getStorage } from '@/utils';

export default {
  name: 'enterResult',
  mixins: [Mixin],
  data () {
    return {
      skuNo: '',
      locationOrPackageCode: '',
      productGoodsId: '',
      details: null,
      pickNumber: 1,
      inputFocus: true,
      inputFocus1: false
    };
  },
  created () {

  },
  props: {},
  watch: {},
  methods: {
    submit () {
      /**
       * @Description: 提交数据
       * @author gan
       * @date: 2020/9/9 19:33
       * @params:
      */
      let v = this;
      if (v.pickNumber < 1) {
        v.showToast('拣货数量有误')
        return
      }
      let data = v.details.scanInputSupplementResultPackageGoodsRsList[0]
      const obj = {
        url: api.submitInputSupplementResult,
        type: 'POST',
        data: {
          "addHandledPickingNumber": v.pickNumber,
          "packageGoodsId": data.packageGoodsId,
          "productGoodsId": v.details.wmsGoods.productGoodsId,
          "supplementPickingId": v.store.state.supplementPickingId
        }
      }
      v.ajaxData(obj).then(response=>{
        if(response.data.code === 0) {
          v.skuNo = '';
          v.locationOrPackageCode = '';
          v.details = null;
          v.showToastIcon('操作成功');
        } else if (response.data.code === 116322) {
          v.showToast('提交补录的数量超过可以补录的数量')
        } else {
          v.showToast('操作失败')
        }
      })
    },
    lookPickLog () {
      this.gotoPage('/pages/workspace/abnormal/pickLog')
    },
    getPickDetails (step) {
      /**
       * @Description: 查询补件详情
       * @author gan
       * @date: 2020/9/9 17:35
       * @params: step 0 1 0扫描sku 1 扫描异常处理库位或出库单
      */
      let v = this;
      const obj = {
        url: api.scanInputSupplementResult,
        type: 'POST',
        data: {
          "locationOrPackageCode": v.locationOrPackageCode,
          "productGoodsId": "",
          "sku": v.skuNo,
          "supplementPickingId": v.store.state.supplementPickingId
        }
      }
      v.ajaxData(obj).then(response=>{
        if (response.data.code === 0 && response.data.datas) {
          v.openSound('001');
          v.details = response.data.datas;
          if (v.details.length === 0) {
            v.pickNumber = v.details[0].expectPickingNumber;
            if (v.pickNumber <= 0) {
              v.pickNumber = 0
            }
          }
          if (step === 0) {
            v.inputFocus1 = true;
          }
        } else if (response.data.code === 116321) {
          v.openSound('002');
          v.showToast('sku不存在');
          v.skuNo = '';
          v.locationOrPackageCode = '';
        } else {
          v.openSound('002');
          v.showToast('查询失败');
          v.skuNo = '';
          v.locationOrPackageCode = '';
        }
      })
    },
    confirmCodeNext () {
      /**
       * @Description: 扫描异常库位或出库单
       * @author gan
       * @date: 2020/9/9 19:24
       * @params:
      */
      let v = this;
      if (!v.skuNo) {
        v.showToast('请先扫描sku');
        v.openSound('002');
        v.inputFocus = true;
        return ;
      }
      if (!v.locationOrPackageCode) {
        v.showToast('请扫描异常处理库位或出库单');
        v.openSound('002');
        return ;
      }
      v.getPickDetails(1);
    },
    confirmNext () {
      let v = this;
      if (!v.skuNo) {
        v.openSound('002');
        v.showToast('请扫描sku');
        return ;
      }
      v.locationOrPackageCode = '';
      v.getPickDetails(0);

    },
    scanCode(type) {
      /**
       * 扫一扫
       * type 0 扫描SKU
       * type 1 扫描异常处理库位或出库单
       * */
      let v = this
      uni.scanCode({
        success: function (res) {
          if (type === '0') {
            v.skuNo = res.result;
          } else if (type === '1') {
            v.model1 = res.result;
          }

        },
        fail: function (error) {
          console.log('error:', error)
        }
      })
    },
  }
};
</script >

<style scoped >
.fontBold {
  font-weight: bold;
}
    .input-u {
      width: 60px;
      border: 1px solid #888;
      padding-left: 5px;
      line-height: 26px;
    }
  .er-title {
    padding: 15px 10px;
  }
  .img-box {
    width: 250rpx;
    text-align: center;
  }
  .img-box .img-item {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .pickingItem {
    padding-bottom: 100px;
    margin-bottom: 15px;
    background-color: #ffffff;
  }
  .pickingHead {
    font-size: 28rpx;
    padding: 20rpx;
    background-color: #fff;
  }
  .phTitle {
    font-weight: bold;
  }
  .pickingItemContent {
    background-color: #fff;
    font-size: 12px;
    padding: 5px 10px;
    position: relative;
    border-top: 1px solid #959595;
  }
  .pickingItemContent:last-child {
    border-bottom: 1px solid #959595;
  }
  .pickingItemContent .jg {
    padding: 0 5px;
  }
  .uni-input-wrapper {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    padding: 8px 13px;
    flex-direction: row;
    flex-wrap: nowrap;
    background-color: #FFFFFF;
    box-sizing: border-box;
    border-bottom: 1px solid #dddddd;
  }
  .uni-input-wrapper:last-child{
    border-bottom: 0;
  }

  .uni-input {
    height: 28px;
    line-height: 28px;
    font-size: 15px;
    padding: 0px;
    flex: 1;
    background-color: #FFFFFF;
  }

  .uni-icon {
    font-family: uniicons;
    font-size: 24px;
    font-weight: normal;
    font-style: normal;
    width: 24px;
    height: 24px;
    line-height: 24px;
    color: #999999;
  }
</style >
