<template>
    <view>
      <view class="purchase-detail-code">采购单号：{{purchaseOrderCode}}</view>
      <view class="purchase-list-item">
        <u-button :type="!type ? 'text' : 'primary'" size="mini" class="ml10" @click="setClearing">一键清零</u-button>
        <u-button :type="type ? 'text' : 'primary'" size="mini" class="ml10" @click="setArrival">剩余全部到货</u-button>
      </view>
      <view>
        <view class="purchase-list"  v-for="(item,index) in list" :key="index">
          <view class="row-flex list-item">
            <view  class="col col-3 purch-img-box">
              <img v-if="!item.goodsImageGroupId" src="/static/placeholder.jpg" class="loadImg" >
              <img v-else :src="item.goodsImageGroupId" class="loadImg" >
            </view>
            <view class="col col-9">
              <view class="d-flex">
                <view class="white-space-nowrap">货品：</view>
                <view>{{item.productName}}</view>
              </view>
              <view class="d-flex">
                <view class="white-space-nowrap">SKU：</view>
                <view>{{item.goodsSku}}</view>
              </view>
              <view class="row-flex">
                <view class="col col-6">
                  <span class="white-space-nowrap">采购数量：</span>
                  <span>{{item.quantity}}</span>
                </view>
                <view class="col col-6">
                  <span class="white-space-nowrap">已到货数量：</span>
                  <span>{{item.arrivalQuantity}}</span>
                </view>
              </view>
              <view class="d-flex">
                <view class="white-space-nowrap">本次到货数量：</view>
                <input class="formInput" @change="updateStorage(item)"  v-model.trim="item.currentArrivalQuantity" />
              </view>
            </view>
          </view>
        </view>
      </view>
      <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
      <!--<view class="alert-info">
        <view>1、一键清零:本次到货数量全部填0</view>
        <view>2、剩余全部到货:本次到货数量=采购数量-已到货数量</view>
        <view>3、已经全部到货的SKU不在此显示</view>
        <view>4、有SKU输入本次到货数量<采购数量-已到货数量时，默认显示[部分到货，等待剩余] checkbox并勾选;反之则不显示该选项</view>
      </view>-->
      <view class="bottomBit">
        <view class="bottom-checkbox" v-if="showCheckbox">
          <u-checkbox v-model="checked"><span class="color-red">部分到货，剩余等待</span></u-checkbox>
        </view>
        <view class="d-flex justify-content-center align-tiems: center">
          <button type="default" class="green" size="mini" @click="submitAllList">
            <text class="color-fff">确认到货</text>
          </button>
        </view>
      </view>
    </view>
</template>

<script>
import Mixin from '@/mixin/common_mixin'
import api from '@/api/api'
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
export default {
  name: "purchaseDetail",
  mixins: [Mixin],
  data () {
    return {
      type: false,
      showCheckbox: false,
      purchaseOrderCode: '',
      list: [],
      checked: true,
      loadingType: 0,
      contentText: {
        contentdown: '上拉显示更多',
        contentrefresh: '正在加载...',
        contentnomore: '没有更多数据了'
      },
      apiData: {
        "lastId": null,
        "limit": 10,
        "purchaseOrderId": ""
      }
    }
  },
  methods:{
    setClearing () {
      /**
       * @Description: 一键清零
       * @author gan
       * @date: 2020/11/23 11:33
      */
      let v = this;
      uni.showModal({
        content: '当前临时保存货品数会被清空,所有货品的本次到货数量会重置为0',
        success: (res) => {
          if (res.confirm) {
            removeStorage('purchaseOrderDetail_' + v.apiData.purchaseOrderId)
            v.$nextTick(()=>{
              v.type = true;
              v.showCheckbox = false;
              v.list.forEach(i=>{
                i.currentArrivalQuantity = 0;
              })
            })
          }
        }
      })


    },
    setArrival () {
      /**
       * @Description: 剩余全部到货
       * @author gan
       * @date: 2020/11/23 11:36
      */
      let v = this;
      uni.showModal({
        content: '当前临时保存货品数会被清空,所有商品本次到货数量默认为采购数量减已到货数量',
        success: (res) => {
          if (res.confirm) {
            removeStorage('purchaseOrderDetail_' + v.apiData.purchaseOrderId)
            v.$nextTick(()=>{
              v.type = false;
              v.showCheckbox = false;
              v.list.forEach(i=>{
                let number = i.quantity - i.arrivalQuantity;
                i.currentArrivalQuantity = number > 0 ? number : 0
              })
            })

          }
        }
      })

    },
    changeCheckStatus (data) {
      // 判断是否展示checkbox
      let v = this;
      let currentArrivalQuantity = data.reduce((i,j)=>{
         i += j.currentArrivalQuantity
         return i
      },0);
      let notYetQuantity = data.reduce((i,j)=>{
         i += (j.quantity - j.arrivalQuantity)
        return i;
      },0);
      if (currentArrivalQuantity !== 0 && currentArrivalQuantity !== notYetQuantity) {
        v.$nextTick(()=>{
          v.showCheckbox = true;
          v.checked = true;
        })
      } else {
        v.$nextTick(()=>{
          v.showCheckbox = false;
          v.checked = false;
        })
      }
    },
    getDetails() {
      let v = this
      v.loadingType = 1
      let params = Object.assign({}, v.apiData)
      const obj = {
        url: api.set_purchaseOrderDetail,
        data: params
      }
      v.ajaxData(obj)
      .then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas.filter(i=> i.quantity - i.arrivalQuantity > 0);
          if (data.length === 0) {
            v.loadingType = 2
            return false
          }
          if (data.length > 0) {
            v.list = v.list.concat(data.map(i=>{
              if (!i.currentArrivalQuantity) {
                if (v.type) {
                  i.currentArrivalQuantity = 0;
                } else {
                  i.currentArrivalQuantity = i.quantity - i.arrivalQuantity
                }
              }
              return i
            }));
            setStorage('purchaseOrderDetail_' + v.apiData.purchaseOrderId, v.list) //
            v.changeCheckStatus(v.list);
            v.apiData.lastId = response.data.others.lastId
            v.loadingType = 0
            if (data.length < 10) {
              v.loadingType = 2
            }
          } else {
            v.loadingType = 2
          }
        } else if (response.data.code === 110001) {
          v.showToast('未找到其它入库单明细信息')
        } else if (response.data.code === 400005) {
          v.showToast('请求ERP系统超时，请稍后再试')
        } else {
          v.showToast(response.data.message)
          v.loadingType = 2
        }
      })
    },
    search () {
      this.apiData.lastId = null;
      this.list = [];
      this.getDetails();
    },
    updateStorage (item) {
      let v = this;
      item.currentArrivalQuantity = isNaN(Number(item.currentArrivalQuantity)) ? 0 : Number(item.currentArrivalQuantity)
      let storageData = getStorage('purchaseOrderDetail_' + v.apiData.purchaseOrderId)
      if (storageData) {
        let result = false
        storageData.forEach((n, i) => {
          if (n.goodsDetailId === item.goodsDetailId) {
            result = true
            n.currentArrivalQuantity = item.currentArrivalQuantity
          }
        })
        if (!result) {
          storageData.push({
            "currentArrivalQuantity": item.currentArrivalQuantity,
            "goodsDetailId": item.goodsDetailId,
            quantity: item.quantity,
            arrivalQuantity: item.arrivalQuantity
          })
        }
        v.changeCheckStatus(storageData);// 判断是否展示checkbox
        v.setAllSpecialStockinIdLocal(v.apiData.purchaseOrderId)
        setStorage('purchaseOrderDetail_' + v.apiData.purchaseOrderId, storageData)




      } else {
        console.log('in two')
        let arr = [
          {
            "currentArrivalQuantity": item.currentArrivalQuantity,
            "goodsDetailId": item.goodsDetailId,
            quantity: item.quantity,
            arrivalQuantity: item.arrivalQuantity
          }
        ]
        v.changeCheckStatus(arr);// 判断是否展示checkbox
        v.setAllSpecialStockinIdLocal(v.apiData.purchaseOrderId)
        setStorage('purchaseOrderDetail_' + v.apiData.purchaseOrderId, arr)
      }


    },
    setAllSpecialStockinIdLocal (id) {
      // 用于删除数据
      let data = getStorage('purchaseOrderDetail_allPurchaseOrderId');
      if (data) {
        data = [...new Set([...data,id])]
      } else {
        data = [id];
      }
      setStorage('purchaseOrderDetail_allPurchaseOrderId',data);
    },
    submitAllList() {
      let v = this
      if (this.type) {
        // 一键清零
        let storage = getStorage('purchaseOrderDetail_' + v.apiData.purchaseOrderId)
        if (storage && storage.length > 0) {
          let data = storage.filter(i=>i.currentArrivalQuantity > 0);
          if (data && data.length > 0) {
            v.submitData();
          } else {
            v.showToast('请输入本次到货数量')
          }
        } else {
          v.showToast('请输入本次到货数量')
        }
      } else {
        // 剩余全部到货
        v.submitData();
      }
    },
    submitData () {
      let v = this;
      let storage = getStorage('purchaseOrderDetail_' + v.apiData.purchaseOrderId)
      let data = storage && storage.length > 0 ? storage : null;
      uni.showModal({
        content: '确定提交?',
        success: (res) => {
          if (res.confirm) {
            v.saveAjax(data)
          }
        }
      })

    },
    saveAjax (details) {
      let v = this;
      const obj = {
        url: api.set_purchaseOrderSave,
        data: {
          "purchaseOrderDetails": details,
          "purchaseOrderId": v.apiData.purchaseOrderId, // 采购单id ,
          "waitSurplus": v.checked ? '1' : '0', // 是否等待剩余
          remainingArrival: v.type ? '0' : '1' // 0-清零1-剩余到货
        }
      }
      console.log(obj);
      uni.showLoading()
      v.ajaxData(obj)
      .then(response => {
        uni.hideLoading()
        if (response.data.code === 0) {
          v.showToast('提交成功')
          v.list = []
          removeStorage('purchaseOrderDetail_' + v.apiData.purchaseOrderId)
          v.store.commit('pageBackStatus',new Date().getTime())
          setTimeout(function (){
           uni.navigateBack()
           }, 1000)
        } else if (response.data.code === 110001) {
          v.showToast('未找到其它入库单明细信息')
        } else if (response.data.code === 400005) {
          v.showToast('请求ERP系统超时，请稍后再试')
        } else {
          v.showToast(response.data.message)
        }
      }).catch(()=>{
        uni.hideLoading()
      })
    }
  },
  onLoad (option) {
    if (option) {
      this.purchaseOrderCode = option.purchaseOrderCode;
      this.apiData.purchaseOrderId = option.purchaseOrderId;
      this.search();
    }

  }
}
</script>

<style scoped>
.loadImg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.purchase-detail-code {
  height: 42px;
  line-height: 42px;
  background-color: #ffffff;
  padding: 0 10px;
}
.purchase-list-item {
  padding: 6px 0;
}
.purchase-list {
  padding-bottom: 50px;

}
.list-item {
  margin-bottom: 6px;
  padding: 4px;
  background-color: #ffffff;
}
.formInput {
  border: 1px solid #9E9E9E;
  width: 100px;
}
.bottom-checkbox {
  margin: 0 10px;
  padding-top: 5px;
}
.purch-img-box {
  padding: 6px;
}
</style>
