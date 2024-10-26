<template>
    <div>
      <view class="scanWrap">
        <view class="uni-form-item uni-column">
          <view class="uni-input-wrapper" :class="{themeInput:theme.inputStyle ==='DarkBlue'}">
            <input class="uni-input" v-model.trim="searchValue" :focus="inputFocus" @confirm="search()" placeholder="LAPA包裹号、物流跟踪号、物流商处理号、虚拟跟踪号" />
            <view class="iconfont text-16" @click="scanCode">&#xe612;</view>
          </view>
        </view>
      </view>
      <view v-if="details" class="card-box">
        <p>包裹号：<span>{{details.packageId}}</span></p>
        <p>跟踪号：<span>{{details.trackingNumber}}</span></p>
        <p>邮寄方式：<span>{{details.shippingMethod}}</span></p>
      </view>
      <nodata v-else :text="'请扫描数据'"></nodata>
      <view class="bottomBit" >
        <div style="width: 100%;margin: 5px 10px">
          <u-checkbox v-model="checked" @change="checkChange" >扫描后自动执行发货</u-checkbox>
        </div>
        <div style="width: 100%;" class="d-flex justify-content-center align-items-center" v-if="!checked && details">
          <button class="success"

            type="primary"
            size="mini"
            @click="confirm">标记发货
          </button>
        </div>
      </view>
    </div>
</template>

<script>
import Mixin from '@/mixin/common_mixin'
import api from "@/api/api";
import nodata from "@/components/common/nodata";
import {
  setStorage,
  getStorage
} from '@/utils'
export default {
  name: 'executeShipment',
  mixins: [Mixin],
  components: {
    nodata
  },
  data () {
    return {
      searchValue: '',
      list: [],
      details: null,
      confirmLoading: false,
      inputFocus: true,
      checked: false,
    };
  },
  created () {
    console.log(getStorage('shipmentCheck'));
    this.checked = !!(getStorage('shipmentCheck').value);
  },
  props: {},
  watch: {},
  methods: {
    checkChange (value) {
      setStorage('shipmentCheck',value);
    },
    search () {
      let v = this;
      if (!v.searchValue) {
        v.showToast('请扫描或输入LAPA包裹号、物流跟踪号、物流商处理号、虚拟跟踪号')
        return
      }
      uni.showLoading({
        title: '数据加载中'
      })
      const obj = {
        type: 'get',
        url: api.get_executeShipment_getPackageByRelatedNo + '?relatedNo=' + v.searchValue,
      }
      v.ajaxData(obj).then(response=> {
        uni.hideLoading();
        if (response.data.datas) {
          v.details = response.data.datas;
          v.searchValue = '';
          if (v.checked) {
            v.confirm();
          }
        } else {
          v.showToast(response.data.message)
        }
      }).catch(()=>{uni.hideLoading();})
    },
    confirm () {
      let v = this;
      const obj = {
        url: api.post_executeShipment,
        data: {
          packageId: v.details.packageId
        }
      }
      if (v.confirmLoading) return
      v.confirmLoading = true;
      uni.showLoading({
        title: '数据加载中'
      })
      v.ajaxData(obj).then(response => {
        v.confirmLoading = false;
        uni.hideLoading();
        if (response.data.code === 0) {
          v.showToast('标记发货成功')
          v.details = null;
        } else {
          v.showToast(response.data.message)
        }
      }).catch(()=>{
        v.confirmLoading = false;
        uni.hideLoading();
      })
    },
    scanCode () {
      let v = this
      uni.scanCode({
        success: function (res) {
          v.searchValue = res.result
          v.search()
        },
        fail: function (error) {
          console.log('error:', error)
        }
      })
    }
  }
};
</script>

<style scoped>
.card-box {
  margin: 10px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 5px;
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
</style>
