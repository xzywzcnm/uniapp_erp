<template>
  <view>
    <view v-if="pageType !== 'finishScan'">
      <view class="scanWrap">
        <view class="uni-form-item uni-column">
          <view class="uni-input-wrapper" :class="{themeInput:theme.inputStyle ==='DarkBlue'}">
            <input class="uni-input" v-model.trim="searchValue" :focus="inputFocus" @confirm="scanPack()" placeholder="可扫描出库单号、运单号、物流单号" />
            <view class="iconfont text-16" @click="scanCode">&#xe612;</view>
          </view>
        </view>
      </view>
      <view class="tip-view">今日已打包包裹数量：<text class="color-red">{{finishPackageNumber}}</text></view>
      <view>
        <view class="uni-list" style="padding-bottom: 100px" v-if="goodsList && goodsList.length > 0">
          <view class="uni-list-cell" hover-class="uni-list-cell-hover" v-for="(value, key) in goodsList" :key="key"  >
            <view class="uni-media-list">
              <view  class="col col-3 d-flex justify-content-center">
                <image v-if="!value.goodsUrl" style="width: 100%; height: 92px;" src="/static/placeholder.jpg" mode="aspectFill" class="loadImg " ></image>
                <image v-else :src="setImgPath(value.goodsUrl)" style="width: 100%; height: 92px;" mode="aspectFit" class="loadImg " ></image>
              </view>
              <view class="uni-media-list-package">
                <view>SKU：<span class="text sku">{{value.sku}}</span></view>
                <view>中文描述：<span class="text">{{value.goodsCnDesc}}</span></view>
                <view>英文描述：<span class="text">{{value.goodsEnDesc}}</span></view>
                <view>数量：<span class="text">{{value.quantity}}</span></view>
              </view>
            </view>
          </view>
        </view>
        <noData v-if="!goodsList || goodsList.length === 0"></noData>
      </view>
      <view class="bottomBit d-flex justify-content-center align-items-center" v-if="tobePackage.length > 0">
        <button type="primary" size="mini"  @click="finishScanPackage">已扫描包裹</button>
      </view>
    </view>
    <view v-else>
      <view >
        <view class="card-box"  hover-class="uni-list-cell-hover" v-for="(value, key) in tobePackage" :key="key" >
          <view class="d-flex justify-content-between card-head">
            <text class="phTitle">出库单号：{{value.packageCode}}</text>
            <view class="color-red" @click="deleteMt(key)">移除</view>
          </view>
          <view class="mu-divider"></view>
          <view class="card-content">
            <view>拣货单类型：<span class="text sku">{{packageTypeList[value.packageInfo.packageType]}}</span></view>
            <view>sku数量：<span class="text">{{value.quantity}}</span></view>
            <view>物品数量：<span class="text">{{value.packageInfo.skuQuantity}}</span></view>
          </view>
        </view>
        <view class="bottomBit d-flex justify-content-center align-items-center" v-if="tobePackage.length > 0">
          <button type="primary" size="mini"  @click="batchMarkPackage">批量标记已包装</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/mixin/common_mixin';
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
import noData from "@/components/common/nodata";
export default {
  name: "packageRegistration",
  mixins: [Mixin],
  components: {
    noData
  },
  data () {
    return {
      packageTypeList: {
        SS:'单品单件',
        SM:'单品多件',
        MM:'多品',
      },
      pageType: '',
      searchValue: '',
      warehouseId: '',
      inputFocus: true,
      finishPackageNumber: 0,
      autoMarkPackaged: '0',
      goodsList: [],
      tobePackage: [],
	  packageObj: {}
    }
  },
  methods: {
    getSettingConfigData () {
      let v = this
      const obj = {
        url: api.get_settingConfig,
        type: 'GET'
      }
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          v.autoMarkPackaged = response.data.datas.autoMarkPackaged || '0'
        }
      })
    },
    finishScanPackage () {
      this.pageType = 'finishScan';
    },
    batchMarkPackage () {
      let v = this
      const obj = {
        url: api.modifyPackageStatusByCodeBatch,
        type: 'put',
        data: v.tobePackage.map(i => i.packageCode)
      }
      uni.showLoading();
      v.ajaxData(obj).then(response => {
        uni.hideLoading();
        if (response.data.code === 0) {
          v.showToast('操作成功');
          v.resetData();
          v.getTodayFinishPackage();
        }
      })
    },
    scanPack () {
      // setScanPackaging
      let v = this
      uni.showLoading();
      if (!v.searchValue) {
        v.showToast('请扫描出库单号、运单号、物流单号')
        return
      }
      const obj = {
        url: api.setScanPackaging + v.searchValue + '?warehouseId=' + v.warehouseId,
        type: 'put'
      }
      v.ajaxData(obj).then(response=>{
        uni.hideLoading()
        if (response.data.code === 0) {
            v.searchValue = '';
            v.goodsList = response.data.datas.packageDetails;
            if (!v.goodsList) {
              v.showToast('无数据');
              return
            }
            if (v.autoMarkPackaged === '0') {
              v.showToast(response.data.datas.packageInfo.packageCode + '  已扫描完成');
			  v.packageObj[response.data.datas.packageInfo.packageCode] = response.data.datas;
			  v.tobePackage = [];
			  for (let key in v.packageObj) {
				  v.tobePackage.push({
					  packageCode: key,
					  quantity: v.packageObj[key].packageDetails.reduce((a,b)=>{
						  return a + b.quantity;
					  },0),
					  ...v.packageObj[key]
				  })
			  }
            } else {
              v.showToast(response.data.datas.packageInfo.packageCode + '  已包装完成')
              v.tobePackage = [];
              v.getTodayFinishPackage();
            }
        } else if (response.data.code === 116324) {
          v.showToast('包裹不是已打印状态');
        } else {
          v.showToast('查询失败');
        }
      })
    },
	resetData () {
		let v = this;
		v.pageType = '';
		v.goodsList = [];
		v.tobePackage = [];
		v.packageObj = {};
	},
    onBackPress (obj) {
      if (obj) {
        if (this.pageType === 'finishScan') {
          this.pageType = '';
          return true
        }
      }
    },
    repeatArrayObject (arr,key){
      let obj ={};
      return  arr.reduce((i,n)=>{
        if(!obj[n[key]]){
          obj[n[key]]=true;
          i.push(n);
        }
        return i
      },[])
    },
    scanCode () {
      let v = this
      uni.scanCode({
        success: function (res) {
          v.searchValue = res.result
          v.scanPack()
        },
        fail: function (error) {
          console.log('error:', error)
        }
      })
    },
    deleteMt (index) {
      this.tobePackage.splice(index,1);
      if (this.tobePackage.length === 0) {
        this.pageType = ''
      }
    },
    getTodayFinishPackage (ttt) {
      /**
       * @Description:
       * @author gan
       * @date: 2020/12/9 10:15
       */
      let v = this
      uni.showLoading()
      const obj = {
        url: api.getTodayPackingPackageNumber + '?warehouseId=' + v.warehouseId,
        type: 'get'
      }
      v.ajaxData(obj).then(response=>{
        uni.hideLoading()
        if (response.data.code === 0) {
          v.finishPackageNumber = response.data.datas;
        }
      })
    }
  },
  created() {
    let v = this;
    let loadStoreWarehouse = getStorage('newErpWarehouse')
    if (loadStoreWarehouse) {
      v.warehouseId = loadStoreWarehouse.warehouseId
    }
	this.resetData();
    this.getTodayFinishPackage();
    this.getSettingConfigData();
  }
}
</script>

<style scoped>
.uni-media-list-package {
  padding-left: 10px;
}
.view-img img{
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}
.tip-view {
  padding: 2px 5px 8px 5px;
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
.card-box {
  margin-bottom: 10px;
}
.card-head {
  font-size: 14px;
  padding: 10px;
  background-color: #fff;
}
.card-content {
  background-color: #fff;
  padding: 10px;
}
.purch-img-box {
  border: 1px solid #e5e5e5;
  margin-right: 5px;
}
</style>
