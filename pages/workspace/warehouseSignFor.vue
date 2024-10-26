<template>
  <div class="page-box">
    <view class="scanWrap">
      <view class="uni-form-item uni-column">
        <view
          class="uni-input-wrapper"
          :class="{ themeInput: theme.inputStyle === 'DarkBlue' }">
          <input
            class="uni-input"
            v-model.trim="searchValue"
            :focus="focus"
            @confirm="getDetails"
            placeholder="扫描输入参考编号/入库单号"
          />
          <view class="iconfont text-16" @click="scanCode">&#xe612;</view>
        </view>
      </view>
    </view>

    <nodata v-if="list.length === 0"></nodata>
    <div class="information-content" v-else>
      <p class="tip">到仓签收成功</p>
      <div v-for="item in list" class="list-box">
        <p class="item">
          <span class="s-label">入库类型：</span>
          <span class="s-text">{{ receiptType[item.receiptType] }}</span>
        </p>
        <p class="item">
          <span class="s-label">入库单号：</span>
          <span class="s-text">{{item.receiptNo}}</span>
        </p>
        <p class="item">
          <span class="s-label">参考编号：</span>
          <span class="s-text">{{item.referenceNo}}<span v-if="item.referenceNo2">/{{ item.referenceNo2 }}</span><span v-if="item.referenceNo3">/{{ item.referenceNo3 }}</span></span>
        </p>
        <p class="item">
          <span class="s-label">供应商：</span>
          <span class="s-text">{{ item.supplierName }}</span>
        </p>
        <p class="item">
          <span class="s-label">签收人：</span>
          <span class="s-text"> {{ getUserName(item.receivedUserId) }}</span>
        </p>
        <p class="item">
          <span class="s-label">签收时间：</span>
          <span class="s-text">{{ getDataToLocalTime(item.receivedTime, 'fulltime') }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Mixin from "@/mixin/common_mixin";
import nodata from "@/components/common/nodata";
import api from '@/api/api';
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
export default {
  name: "warehouseSignFor",
  mixins: [Mixin],
  components: {
    nodata,
  },
  data() {
    return {
      searchValue: '',
      focus: true,
      warehouseId: '',
      list: [],
      receiptType: [
        "备货入库",
        "生产入库",
        "调拨入库",
        "退货入库",
        "其他入库",
        "急采入库",
      ],
    };
  },
  created () {
    let loadStoreWarehouse = getStorage('newErpWarehouse')
    if (loadStoreWarehouse) {
      this.warehouseId = loadStoreWarehouse.warehouseId
    }
  },
  onShow() {
    this.focus = true;
    this.searchValue = "";
    this.list = [];
    this.getAllUserInfo()
  },
  methods: {
    /**
     * 到货签收
     * @date: 2021/7/20 15:11
     */
    getDetails() {
      let v = this;
      if (!v.searchValue) {
        v.showToast("未扫描输入参考编号/入库单号");
        return;
      }
      uni.showLoading({
        title: "数据加载中",
      });
      // v.axios.post(api.post_api_wmsReceipt_arrivalSignIn, {
      //     referenceNo: v.searchValue,
      //   })
      v.ajaxData({url: api.post_api_wmsReceipt_arrivalSignIn, data: {
          referenceNo: v.searchValue,
          warehouseId: v.warehouseId
        }
      }).then((response) => {
          uni.hideLoading();
          if (response.data.code === 0) {
            v.showToast("操作成功");
            v.searchValue = "";
            v.focus = true;
            v.list = response.data.datas;
          } else if (response.data.code === 111176) {
            v.showToast("当前条件没有入库单");
          } else {
            v.showToast("操作失败");
          }
        }).catch(() => {
          uni.hideLoading();
        });
    },
    scanCode() {
      // 扫一扫
      let v = this;
      uni.scanCode({
        success: function (res) {
          v.searchValue = res.result;
          v.getDetails();
        },
        fail: function (error) {
          console.log("error:", error);
        },
      });
    },
  },
};
</script>

<style scoped>
.page-box {
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
  background-color: #ffffff;
}

.uni-input {
  height: 28px;
  line-height: 28px;
  font-size: 15px;
  padding: 0px;
  flex: 1;
  background-color: #ffffff;
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

.tip {
  color: #2c7413;
  text-align: center;
  font-size: 16px;
}

.tip:after {
  content: "";
  height: 1px;
  width: 80%;
  background-color: #e5e5e5;
  display: block;
  margin: 10px auto;
}

.information-content {
  padding: 10px 15px;
  border-top: 1px solid #ddd;
  font-size: 16px;
  background-color: #ffffff;
}

.information-content .s-label {
  display: inline-block;
  color: #666666;
  float: left;
}

.information-content .s-text {
  float: left;
  word-break: break-all;
}

.information-content .item {
  margin-bottom: 2px;
  word-break: break-all;
}

.information-content .list-box {
  margin: 10px 0;
}

.information-content .list-box:after {
  content: "";
  height: 1px;
  width: 100%;
  margin-top: 10px;
  background-color: #e3e3e3;
  display: block;
}

.information-content .list-box:last-child:after {
  height: 0;
}

.information-content .item:after {
  content: "";
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}
</style>
