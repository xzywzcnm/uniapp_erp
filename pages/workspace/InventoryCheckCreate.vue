<template>
  <view class="inventory-create-box inventoryCheckCreatePage">
    <uni-section title="选择库区范围" type="line"></uni-section>
    <view class="uni-textarea">
      <u-cell-group>
        <u-cell-item
          :title="warehouseAreaFrom.text"
          @click="warehouseAreaFrom.modal = true"
        ></u-cell-item>
      </u-cell-group>
      <u-select
        v-model="warehouseAreaFrom.modal"
        :list="warehouseBlockList"
        @confirm="warehouseAreaFromSelect"
        label-name="warehouseBlockName"
        value-name="warehouseBlockId"
      ></u-select>
    </view>
    <view class="uni-textarea mb10">
      <u-cell-group>
        <u-cell-item
          :title="warehouseAreaTo.text"
          @click="warehouseAreaToClick"
        ></u-cell-item>
      </u-cell-group>
      <u-select
        v-model="warehouseAreaTo.modal"
        :list="warehouseBlockToList"
        @confirm="warehouseAreaToSelect"
        label-name="warehouseBlockName"
        value-name="warehouseBlockId"
      ></u-select>
    </view>
    <uni-section title="选择库位范围" type="line"></uni-section>
    <view
      class="uni-input-wrapper"
      :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
    >
      <input
        class="uni-input"
        v-model.trim="fromWarehouseLocationName"
        @confirm="confirmSLocation('0')"
        :focus="inputFocus2"
        placeholder="FORM库位"
      />
    </view>
    <view class="mu-divider"></view>
    <view
      class="uni-input-wrapper mb10"
      :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
    >
      <input
        class="uni-input"
        v-model.trim="toWarehouseLocationName"
        @confirm="confirmSLocation('1')"
        :focus="inputFocus3"
        placeholder="TO库位"
      />
    </view>

    <uni-section title="产品SKU" type="line"></uni-section>
    <view class="uni-textarea mb10">
      <textarea
        :focus="inputFocus4"
        @blur="bindTextAreaBlur"
        :value="goodsSkuList"
      />
    </view>

    <uni-section title="盘点类型" type="line"></uni-section>
    <view class="uni-textarea mb10">
      <u-cell-group>
        <u-cell-item
          :title="typeListText"
          @click="checkTypeModel = true"
        ></u-cell-item>
      </u-cell-group>
      <u-select
        v-model="checkTypeModel"
        :list="typeList"
        @confirm="confirm"
      ></u-select>
    </view>

    <view class="bottomBit">
      <view class="p10">
        <button type="primary" size="mini" :loading="loading" @click="addMt">
          新建盘点单
        </button>
        <!--<button type="warn" style="background-color: red!important;" size="mini" @click="clearMt">清除</button>-->
      </view>
    </view>
  </view>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/mixin/common_mixin";
// const prefixCls = "tongtool-workspace-inventoryCheck";
import { getStorage } from "@/utils";
const warehouseAreaTo = {
  text: "TO库区",
  modal: false,
  chooseItem: null,
};
export default {
  name: "InventoryCheckCreate",
  mixins: [Mixin],
  components: {},
  data() {
    return {
      warehouseAreaFrom: {
        text: "FORM库区",
        modal: false,
        chooseItem: null,
      },
      warehouseAreaTo: {
        text: "TO库区",
        modal: false,
        chooseItem: null,
      },
      typeList: [
        // {
        //   value: "0",
        //   label: "按批次盘点",
        // },
        {
          value: "1",
          label: "按库位盘点",
        },
      ],

      checkTypeModel: false,
      checkType: "1",
      loading: false,
      testValue: "",
      goodsSkuList: "",

      // fromWarehouseBlockId: "",
      // fromWarehouseBlockName: "",
      // toWarehouseBlockId: "",
      // toWarehouseBlockName: "",

      fromWarehouseLocationId: "",
      fromWarehouseLocationName: "",
      toWarehouseLocationId: "",
      toWarehouseLocationName: "",

      // inputFocus: true,
      // inputFocus1: false,
      inputFocus2: false,
      inputFocus3: false,
      inputFocus4: false,

      warehouseBlockList: [],
      warehouseBlockToList: [],
    };
  },
  created() {
    this.getAllWarehouseBlock();
  },
  props: {},
  watch: {},
  methods: {
    warehouseAreaFromSelect(e) {
      let item = e[0] || {};
      this.warehouseAreaFrom.chooseItem = item;
      this.warehouseAreaFrom.text = item.label;
      this.openSound("001");
      Object.keys(this.warehouseAreaTo).forEach((key) => {
        this.warehouseAreaTo[key] = warehouseAreaTo[key];
      });
      this.getToWarehouseBlock(item.value);
    },
    warehouseAreaToClick() {
      if (!this.warehouseAreaFrom.chooseItem) {
        this.openSound("002");
        uni.showToast({
          title: "请先选择FORM库区!",
          icon: "none",
          duration: 2000,
        });
        return;
      }
      this.warehouseAreaTo.modal = true;
    },
    warehouseAreaToSelect(e) {
      let item = e[0] || {};
      this.warehouseAreaTo.chooseItem = item;
      this.warehouseAreaTo.text = item.label;
      this.inputFocus2 = true;
    },
    getToWarehouseBlock(fromWarehouseBlockId) {
      const obj = {
        url: api.get_listEnableBlocks,
        type: "POST",
        data: {
          queryLinkageType: "W", // 联动类型库区
          warehouseId: getStorage("newErpWarehouse").warehouseId,
          fromWarehouseBlockId: fromWarehouseBlockId,
        },
      };
      this.ajaxData(obj).then((response) => {
        if (response.data.code === 0 && response.data.datas) {
          this.warehouseBlockToList = response.data.datas;
        } else {
          uni.showToast({
            title: "TO库区无数据",
            icon: "none",
            duration: 2000,
          });
        }
      });
    },
    confirm(e) {
      this.checkType = e[0].value;
    },
    // clearMt() {
    //   this.goodsSkuList = "";
    //   this.fromWarehouseBlockId = "";
    //   this.fromWarehouseBlockName = "";
    //   this.toWarehouseBlockId = "";
    //   this.toWarehouseBlockName = "";
    //   this.fromWarehouseLocationId = "";
    //   this.fromWarehouseLocationName = "";
    //   this.toWarehouseLocationId = "";
    //   this.toWarehouseLocationName = "";
    // },
    validMt() {
      return new Promise((resolve) => {
        if (!this.warehouseAreaFrom.chooseItem) {
          this.openSound("002");
          resolve({
            valid: false,
            message: "请选择FORM库区!",
          });
          return;
        }
        if (!this.warehouseAreaTo.chooseItem) {
          this.openSound("002");
          resolve({
            valid: false,
            message: "请选择TO库区!",
          });
        }
        resolve({
          valid: true,
        });
      });
    },
    addMt() {
      let v = this;
      if (v.loading) return;
      v.loading = true;
      v.validMt().then((data) => {
        if (data.valid) {
          let warehouseAreaFrom = v.warehouseAreaFrom.chooseItem;
          let chooseItem = v.warehouseAreaTo.chooseItem;
          let goodsSkuList = v.goodsSkuList ? v.goodsSkuList.split("\n") : null;
          let data = {
            goodsSkuList: goodsSkuList,
            fromWarehouseBlockId: warehouseAreaFrom.value,
            toWarehouseBlockId: chooseItem.value,
            fromWarehouseLocationId: v.fromWarehouseLocationId,
            toWarehouseLocationId: v.toWarehouseLocationId,
            beginDate: null,
            endDate: null,
          };
          const obj = {
            url: api.set_wmsInventoryCheckCreate,
            type: "post",
            data: {
              blindFlag: "0", // 盲盘(0非盲盘,1盲盘)
              emptyFlag: "0", // 空库位(0不包含，1包含)
              scopeCondition: JSON.stringify(data),
              scopeFlag: "0", // 盘点范围(0部分盘点，1全盘) 前端不用传，默认为0 ,
              warehouseId: getStorage("newErpWarehouse").warehouseId,
              checkType: v.checkType,
            },
          };
          // console.log(obj, data);
          uni.showLoading({
            title: "数据加载中",
          });
          v.ajaxData(obj)
            .then((response) => {
              if (response.data.code === 0) {
                uni.showToast({
                  title: "操作成功",
                  duration: 2000,
                });
                uni.navigateBack();
              } else if (response.data.code === 553802) {
                uni.showToast({
                  title: "未找到对应库存",
                  icon: "none",
                  duration: 2000,
                });
              } else if (response.data.code === 553806) {
                uni.showToast({
                  title: "sku不存在",
                  icon: "none",
                  duration: 2000,
                });
              } else {
                uni.showToast({
                  title: "操作失败",
                  icon: "none",
                  duration: 2000,
                });
              }
            })
            .finally(() => {
              uni.hideLoading();
              v.loading = false;
            });
        } else {
          v.loading = false;
          uni.showToast({
            title: data.message,
            icon: "none",
            duration: 2000,
          });
        }
      });
    },
    // 获取所有库区
    getAllWarehouseBlock() {
      const obj = {
        url: api.get_warehouseBlock,
        type: "GET",
        data: {
          warehouseId: getStorage("newErpWarehouse").warehouseId,
          warehouseBlockTypes: "00,10,11,12,20", // 00收获区10标准区11良品区12不良区20
        },
      };
      this.ajaxData(obj).then((response) => {
        if (response.data.code === 0) {
          this.warehouseBlockList = response.data.datas || [];
        }
      });
    },
    // 产品SKU
    bindTextAreaBlur(e) {
      this.goodsSkuList = e.detail.value;
    },
    // 设置库位
    confirmSLocation(type) {
      let [name, wareType] = [null, null];
      if (type === "0") {
        name = this.fromWarehouseLocationName;
        wareType = "warehouseAreaFrom";
      } else {
        name = this.toWarehouseLocationName;
        wareType = "warehouseAreaTo";
      }
      name = name ? name.trim() : name;
      let chooseItem = this[wareType].chooseItem || {};
      let pId = chooseItem.value;

      let fun = (msg, type) => {
        this.openSound("002");
        uni.showToast({
          title: msg,
          icon: "none",
          duration: 2000,
        });
        if (type === "0") {
          this.fromWarehouseLocationName = "";
          this.fromWarehouseLocationId = null;
        } else {
          this.toWarehouseLocationName = "";
          this.toWarehouseLocationId = null;
        }
      };
      // console.log(chooseItem, pId);
      if (!pId) {
        let title = type === "0" ? "请选择FORM库区！" : "请选择TO库区！";
        fun(title, type);
        return;
      }
      this.getWarehouseLocationId(name, pId, "0,1,3").then((data) => {
        if (data) {
          this.openSound("001");
          uni.showToast({
            title: "设置成功",
            duration: 2000,
          });
          if (type === "0") {
            // from
            this.inputFocus3 = true;
            this.fromWarehouseLocationId = data.warehouseLocationId; // 库位Id
          } else {
            // to
            this.inputFocus4 = true;
            this.toWarehouseLocationId = data.warehouseLocationId; // 库位Id
          }
        } else {
          fun("无匹配库位", type);
        }
      });
    },
  },
  computed: {
    typeListText() {
      return this.typeList.filter((i) => i.value === this.checkType)[0].label;
    },
  },
};
</script>

<style lang="less">
.inventoryCheckCreatePage {
  padding-bottom: 100rpx;
  .uni-input {
    padding: 32rpx 24rpx;
  }
  .uni-section {
    height: 80rpx;
  }
  .bottomBit button {
    margin: 0 !important;
  }
  .inventory-create-box {
    padding-bottom: 100rpx;
  }
}
</style>
