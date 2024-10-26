<template>
  <view>
    <view class="img-box" v-if="details.goodsUrl">
      <image class="img-item" mode="aspectFit" :src="setImgPath(details.goodsUrl)" />
    </view>
    <view class="normalPadding headTitle">
      <view>
        <text><text>货品名称：</text> {{ details.goodsCnDesc }}</text>
      </view>
    </view>
    <view class="scanWrapStock cargospaceWrap">
      <view class="d-flex justify-content-between align-items-center box-top">
        <view class="cargospaceTitle"><text class="label-width" style="margin-top: -2px">货位：</text>{{
          details.warehouseLocationCode }}</view>
      </view>
      <view class="d-flex justify-content-start align-items-center box-top">
        <view class="uni-form-item uni-column">
          <view class="uni-input-wrapper" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }">
            <input class="uni-input" v-model.trim="cargoSpaceId" :focus="cargospaceFocus" @confirm="cargoSpaceblur"
              placeholder="库位条码" />
            <view class="iconfont text-16" @click="scanCode('1')">&#xe612; </view>
          </view>
        </view>
      </view>
    </view>
    <view class="scanWrapStock pb20">
      <view class="box-top">
        <view>
          <text class="label-width">SKU： </text>
          <text>{{ details.goodsSku }}</text>
        </view>
        <view class="d-flex justify-content-start pItem" v-if="details.barCode && !['S1'].includes(details.pickingType)">
          <text class="pItemTitle">条码编码：</text>
          <text class="flexOne">{{ details.barCode }}</text>
        </view>
      </view>
      <view class="d-flex justify-content-start align-items-center box-top">
        <view class="uni-form-item uni-column">
          <view class="uni-input-wrapper" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }">
            <input class="uni-input" v-model.trim="skuNo" :focus="skuFocus" @confirm="skuConfirm" placeholder="SKU条码" />
            <view class="iconfont text-16" @click="scanCode('2')">&#xe612; </view>
          </view>
        </view>
      </view>
      <view class="d-flex justify-content-between align-items-center box-top box-bottom">
        <view>
          <text class="label-width">需补拣数量： </text>
          <text>{{ details.expectPickingNumber }}</text>
        </view>
        <view>
          <text class="label-width">已补拣数量：</text>
          <text class="stock-ing">{{ details.donePickingNumber }}</text>
        </view>
      </view>
      <view class="d-flex align-items-center">
        <text>本次补拣数量：</text>
        <input class="input-u" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }" v-model.trim="pickNumber" />
      </view>
    </view>
    <view class="d-flex justify-content-center normalPadding align-items-center picArea">
      <!--<image :src="newErpPrefix + stockReturnResult.goodsUrl"></image>-->
    </view>
    <view class="bottomBit row no-gutters">
      <view class="d-flex justify-content-center align-tiems-center" style="width: 100%">
        <button type="primary" size="mini" @click="save()">保存</button>
      </view>
    </view>
  </view>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/mixin/common_mixin";

export default {
  name: "picking",
  mixins: [Mixin],
  data() {
    return {
      cargoSpaceId: "",
      cargospaceFocus: true,
      isLocation: false,
      isSku: false,
      skuNo: "",
      pickNumber: "",
      skuFocus: false,
      details: null,
    };
  },
  created() {
    this.details = this.store.state.chosePickData;
    this.pickNumber =
      this.details.expectPickingNumber - this.details.donePickingNumber;
  },
  props: {},
  watch: {},
  methods: {
    setLocation(name) {
      name = name ? name.trim() : name;
      if (!name) {
        this.showToast("内容为空！");
        return;
      }
      /**
       * 设置库位
       * @params
       * name 库位名称
       * */
      this.isLocation = false;
      let v = this;
      this.getWarehouseLocationId(name).then((data) => {
        if (data) {
          if (data.warehouseLocationId === this.details.warehouseLocationId) {
            this.isLocation = true;
            this.skuFocus = true;
            v.openSound("001");
            this.showToastIcon("匹配成功");
          } else {
            v.openSound("002");
            this.showToast("匹配失败");
            this.abnormalLocation = "";
            this.cargospaceFocus = true;
            this.isLocation = false;
          }
        } else {
          v.openSound("002");
          this.isLocation = false;
          this.abnormalLocation = "";
          this.cargospaceFocus = true;
          this.showToast("无匹配库位");
        }
      });
    },
    skuConfirm(e) {
      /**
       * @Description: 验证sku
       * @author gan
       * @date: 2020/9/9 14:56
       * @params:
       */
      let v = this;
      let sku = e.target.value;
      sku = sku ? sku.trim() : sku;
      if (!sku) {
        v.showToast("内容为空！");
        return;
      }
      // 扫描的条码等于“条码编码”或等于“SKU”，都可以识别拣货
      let barCodeList = v.details.barCode ? v.details.barCode.split(",") : [];
      if (sku === v.details.goodsSku || barCodeList.includes(sku)) {
        v.isSku = true;
        v.openSound("001");
        this.showToastIcon("匹配成功");
      } else {
        v.openSound("002");
        this.showToast("匹配失败");
        v.isSku = false;
        v.skuNo = "";
      }
    },
    cargoSpaceblur(e) {
      let name = e.target.value;
      this.setLocation(name);
    },
    scanCode(type) {
      /**
       * @Description: 扫一扫
       * @author gan
       * @date: 2020/9/9 14:54
       * @params:
       * type 0 货位
       * type 1 SKU
       */
      let v = this;
      uni.scanCode({
        success: function (res) {
          if (type === "0") {
            v.cargoSpaceId = res.result;
            v.setLocation(res.result);
          } else if (type === "1") {
            v.skuNo = res.result;
            v.setLocation(res.result);
          }
        },
        fail: function (error) {
          console.log("error:", error);
        },
      });
    },
    save() {
      /**
       * @Description: 更新拣货数量
       * @author gan
       * @date: 2020/9/9 14:32
       * @params:
       */
      let v = this;

      if (v.isSku && v.isLocation) {
        let reg = /^[0-9]+$/;
        if (!reg.test(v.pickNumber)) {
          v.showToast("请输入正确的补拣数量");
          return;
        }

        if (v.pickNumber > v.details.expectPickingNumber) {
          v.showToast("本次补拣数量大于需补拣数量");
          return;
        }
        const obj = {
          url: api.updateSupplementPickingDetail,
          type: "PUT",
          data: {
            supplementPickingDetailBoList: [
              {
                donePickingNumber:
                  Number(v.pickNumber) + Number(v.details.donePickingNumber),
                supplementPickingDetailId: v.details.supplementPickingDetailId,
              },
            ],
            supplementPickingId: v.details.supplementPickingId,
          },
        };
        v.ajaxData(obj).then((response) => {
          if (response.data.code === 0) {
            v.showToastIcon("操作成功");
            uni.navigateBack();
          } else if (response.data.code === 116318) {
            v.showToast("只有补拣中的可以修改");
          } else {
            v.showToast("操作失败");
          }
        });
      } else {
        v.showToast("请验证库位和sku");
      }
    },
    scanSku() { },
  },
};
</script>
<style>
.uni-form-item {
  padding: 5rpx 0;
}
</style>
<style scoped>
.uni-image {
  max-height: 166px;
}

.pb20 {
  padding-bottom: 50px !important;
}

.input-u {
  width: 60px;
  border: 1px solid #dddddd;
  line-height: 26px;
}

.box-top {
  padding-top: 18rpx;
}

.box-bottom {
  padding-bottom: 15rpx;
}

.stock-ing {
  width: 130rpx;
  display: inline-block;
}

.scanWrapStock {
  padding: 0 15rpx;
  background-color: #ffffff;
}

.scanWrapStock .uni-icon {
  margin-top: 2px;
}

.label-width {
  display: inline-block;
}

.uni-input-wrapper {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  border: 1px solid #dddddd;
  width: auto;
  padding: 4px 13px;
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
</style>
