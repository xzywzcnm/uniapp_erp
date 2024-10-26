<template>
  <view>
    <view class="scanWrap">
      <view class="uni-form-item uni-column">
        <view class="uni-input-wrapper" :class="{themeInput:theme.inputStyle ==='DarkBlue'}">
          <input class="uni-input" v-model.trim="searchValue" :focus="inputFocus" @confirm="search()" placeholder="扫描或输入等待提单号" />
          <view class="iconfont text-16" @click="scanCode">&#xe612;</view>
        </view>
      </view>
    </view>

    <view class="collect-content">
      <view class="collect-item" v-for="item in list">
        <view>提单号：{{item.supplierPickupOrderNumber}}</view>
        <view>出库单数量：{{item.packageQuantity}}</view>
      </view>
    </view>
    <nodata v-if="list.length === 0"></nodata>
    <view class="bottomBit d-flex justify-content-center align-items-center" v-if="list.length > 0">
      <button class="success"
        type="primary"
        size="mini"
        @click="confirm">确认揽收
      </button>
    </view>
  </view>
</template>

<script>
import Mixin from '@/mixin/common_mixin';
import api from "@/api/api";
import nodata from "@/components/common/nodata";

export default {
  name: "collect",
  mixins: [Mixin],
  components: {
    nodata
  },
  data() {
    return {
      loading:false,
      searchValue: '',
      inputFocus: true,
      list: [],
    };
  },
  created() {

  },
  onShow() {
    this.list = []
  },
  props: {},
  watch: {},
  methods: {
    search () {
      let v = this;
      if (!this.searchValue) {
        this.showToast('请扫描扫描或输入等待提单号')
      }
      const obj = {
        type: 'get',
        url: api.get_ymsPickupOrder_scanPickupOrder + this.searchValue
      }
      v.ajaxData(obj).then(response=>{
        if (response.data.code === 0) {
			if (response.data.datas.status === 1) {
				v.list.push(response.data.datas);
				v.inputFocus = false;
				v.inputFocus = true;
			} else {
				v.showToast('提单状态需为等待揽收')
			}
            v.searchValue = '';
        } else if (response.data.code === 122008) {
          v.showToast('提单不存在')
        } else if (response.data.code === 122016) {
          v.showToast('提单状态需为已揽收或分拣中')
        } else {
          v.showToast(response.data.message)
        }
      })
    },
    confirm () {
      let v = this;
      const obj = {
        url: api.post_ymsPickupOrder_batchDelivery,
        data:v.list.map(i=>i.ymsPickupOrderId)
      }
      v.ajaxData(obj).then(response=>{
        if (response.data.code === 0) {
          v.showToastIcon('操作成功');
          v.list = [];
          v.searchValue = '';
        } else if (response.data.code === 122008) {
          v.showToast('提单不存在')
        } else if (response.data.code === 122009) {
          v.showToast('存在非等待揽收状态')
        } else if (response.data.code === 122014) {
          v.showToast('存在非已出库状态包裹')
        } else {
          v.showToast(response.data.message)
        }
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
    },

  }
};
</script>

<style scoped>
.collect-content {
  padding-bottom: 50px;
}

.collect-item {
  padding: 5px 15px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #dddddd;
}
.collect-item:first-child{
  margin-top: 10px;
}

.collect-item:last-child{
  border-bottom: 0;
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
</style>
