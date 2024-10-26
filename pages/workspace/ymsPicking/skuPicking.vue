<template>
  <view class="skuPicking_box">
    <view class="mt10" v-if="Object.keys(detailData).length>0">
      <!--校验库位-->
      <view class="white-bg-color skuPicking_box_item">
        <view class="font-weight">校验库位</view>
        <view>{{ "库位：" + pickingDetails.ymsWarehouseLocationCode }}</view>
        <u-col span="12" class="inputStyles">
          <u-input v-model="ymsWarehouseLocationCode" placeholder="请扫描库位条码" :focus="locationFocus" @confirm="scanCarriage"/>
          <view class="iconfont text-18 mr10 ml10 blue-color" @click="scanCode('ymsWarehouseLocationCode')">&#xe612;</view>
        </u-col>
      </view>
      <!--扫描SKU-->
      <view class="white-bg-color skuPicking_box_item">
        <view class="font-weight">扫描SKU</view>
        <view>{{ "SKU：" + pickingDetails.ymsSku }}</view>
        <view class="flex">
          <view style="flex: 1;">
            <text>{{ "待拣数量：" }}</text>
            <text class="color-red">{{ pickingDetails.goodsQuantity }}</text>
          </view>
          <view style="flex: 1;">
            <text>{{ "已拣数量：" }}</text>
            <text class="color-red">{{ pickingDetails.goodsPickedQuantity }}</text>
          </view>
        </view>
        <u-col span="12" class="inputStyles">
          <u-input v-model="sku" placeholder="请扫描SKU条码" :focus="skuFocus" @confirm="scanCarriage"/>
          <view class="iconfont text-18 mr10 ml10 blue-color" @click="scanCode('sku')">&#xe612;</view>
        </u-col>
      </view>
      <!--商品信息-->
      <view class="white-bg-color skuPicking_box_item">
        <view class="font-weight mb10">{{ "商品名称：" + pickingDetails.cnName }}</view>
        <u-image width="220rpx" height="220rpx" :src="pickingDetails.primaryImage"></u-image>
      </view>
    </view>
    <!--操作按钮-->
    <view class="white-bg-color p30 btnStyle">
      <u-button type="primary" size="medium" :custom-style="{width: '45%'}" @click="replaceContainerModal = true">更换容器</u-button>
      <u-button type="warning" size="medium" :custom-style="{width: '45%'}" @click="markAsCompletedModal = true">标记为已完成</u-button>
    </view>
    <!--标记完成提醒-->
    <u-modal
      v-model="markAsCompletedModal"
      :show-cancel-button="true"
      :title-style="{fontSize: '32rpx', fontWeight: 'bold'}"
      :cancel-style="{borderRight: '2rpx solid #F4F6F8'}"
      confirm-text="标记完成"
      confirm-color="#49A9F0"
      title="标记完成提醒"
      content="是否标记该SKU拣货完成"
      @confirm="markAsPickedBtn('all')">
    </u-modal>
    <!--更换容器提醒-->
    <u-modal
      v-model="replaceContainerModal"
      :show-cancel-button="true"
      :title-style="{fontSize: '32rpx', fontWeight: 'bold'}"
      :cancel-style="{borderRight: '2rpx solid #F4F6F8'}"
      confirm-text="更换容器"
      confirm-color="#49A9F0"
      title="更换容器提醒"
      content="更换容器将标识容器为完拣状态，请确认是否更换容器？"
      @confirm="replaceContainerBtn">
    </u-modal>
  </view>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/mixin/common_mixin";
import {getStorage} from "@/utils";

export default {
  name: "skuPicking",
  mixins: [Mixin],
  data() {
    return {
      ymsWarehouseLocationCode: "",
      sku: "",
      markAsCompletedModal: false,
      pageParams: {},
      replaceContainerModal: false,
      currentTalg: false,
      pickingDetails: {},
      detailData: {},
      locationFocus: true, // 库位焦点
      skuFocus: false, // sku焦点
      originalData: [],
      verificationTalg: false
    };
  },
  onLoad(option) {
    let v = this;
    const obj = JSON.parse(decodeURIComponent(option.obj));
    v.pageParams = obj;
    uni.setNavigationBarTitle({
      title: `${v.pageParams.code}`
    });
  },
  onShow() {
    let v = this;
    v.getFocus('locationFocus');
    v.getPickingDetails();
  },
  methods: {
    // 获取拣货单详情的数据
    getPickingDetails() {
      let v = this;
      v.ymsWarehouseLocationCode = "";
      v.sku = "";
      v.currentTalg = false;
      v.pickingDetails = {};
      const obj = {
        url: api.get_ymsPickingOrder_app_getPickingInfo + `${v.pageParams.ymsPickingOrderId}`,
        type: "GET"
      };
      uni.showLoading({
        title: "数据加载中"
      });
      v.ajaxData(obj).then((response) => {
        uni.hideLoading();
        if (response.data.code === 0) {
          let datas = response.data.datas;
          v.detailData = datas;
          if (datas) {
            let list = datas.queryPickingOrderGoodsPickingResultBos || [];
            let newList = list.filter((item) => {
              if (item.goodsQuantity !== item.goodsPickedQuantity) {
                return item;
              }
            });
            if (newList.length <= 0) {
              v.toBack();
              return false;
            } else {
              v.originalData = JSON.parse(JSON.stringify(newList));
              newList.map((item) => {
                item.code = v.pageParams.code;
                if (item.ymsSku === v.pageParams.ymsSku && item.ymsWarehouseLocationId === v.pageParams.ymsWarehouseLocationId) {
                  v.pickingDetails = item;
                }
              });
              v.locationFocus = false;
              v.$nextTick(() => {
                v.locationFocus = true;
              });
            }
            if (list.length > 0) {
              list.map((item) => {
                item.code = v.pageParams.code;
                if (item.ymsSku === v.pageParams.ymsSku && item.ymsWarehouseLocationId === v.pageParams.ymsWarehouseLocationId) {
                  if (item.goodsQuantity === item.goodsPickedQuantity) {
                    v.currentTalg = true;
                  }
                }
              });
            }
          }
        }
      });
    },
    // 扫一扫
    scanCode(type) {
      let v = this;
      uni.scanCode({
        success: function (res) {
          v[type] = res.result;
          v.markAsPickedBtn("single");
        },
        fail: function (error) {
          console.log("error:", error);
        }
      });
    },
    // 回车键
    scanCarriage() {
      let v = this;
      v.markAsPickedBtn("single");
    },
    // 更换容器
    replaceContainerBtn() {
      let v = this;
      const obj = {
        url: api.put_ymsContainerStatus_app_closeContainerSorting + `?ymsContainerStatusId=${v.detailData.ymsContainerStatusId}`,
        type: "PUT"
      };
      uni.showLoading({
        title: "处理中..."
      });
      v.ajaxData(obj).then((response) => {
        uni.hideLoading();
        if (response.data.code === 0) {
          v.showToastIcon("操作成功！");
          let obj = {
            code: v.pageParams.code,
            ymsPickingOrderId: v.pageParams.ymsPickingOrderId,
            isBindContainerCode: v.detailData.isBindContainerCode
          };
          v.gotoReturnBack('pages/workspace/ymsPicking/bindingContainer', obj);
          // uni.navigateTo({
          //   url: `/pages/workspace/ymsPicking/bindingContainer?obj=${encodeURIComponent(JSON.stringify(obj))}`
          // });
        } else {
          v.abnormalPrompt(response.data.code)
        }
      });
    },
    // 库位、sku的校验
    verificationParams() {
      let v = this;
      v.verificationTalg = true;
      //库位为空时
      if (!v.ymsWarehouseLocationCode) {
        v.showToast("请扫描或输入库位条码");
        v.locationFocus = false;
        v.$nextTick(() => {
          v.locationFocus = true;
        });
        v.verificationTalg = false;
        return false;
      } else {
        if (v.pickingDetails.ymsWarehouseLocationCode !== v.ymsWarehouseLocationCode) {
          v.openSound('warehouseLocation_error');
          v.showToast("库位错误，请检查后重试。");
          v.ymsWarehouseLocationCode = '';
          v.locationFocus = false;
          v.$nextTick(() => {
            v.locationFocus = true;
          });
          v.verificationTalg = false;
          return false;
        }
      }
      // sku为空时
      if (!v.sku) {
        v.showToast("请扫描或输入SKU条码");
        v.skuFocus = false;
        v.$nextTick(() => {
          v.skuFocus = true;
        });
        v.verificationTalg = false;
        return false;
      } else {
        if (v.pickingDetails.ymsSku !== v.sku) {
          v.openSound('sku_error');
          v.showToast("SKU错误，请检查后重试。");
          v.sku = '';
          v.skuFocus = false;
          v.$nextTick(() => {
            v.skuFocus = true;
          });
          v.verificationTalg = false;
          return false;
        }
      }
    },
    //标记完成
    markAsPickedBtn(type) {
      let v = this;
      let url = "";
      let method = "";
      if (type === "single") {
        url = api.post_ymsPickingOrderPicking_app_savePickingGoods;
        method = "POST";
      } else {
        url = api.put_ymsPickingOrder_app_markGoodsPicking;
        method = "PUT";
        v.ymsWarehouseLocationCode = v.pickingDetails.ymsWarehouseLocationCode;
        v.sku = v.pickingDetails.ymsSku;
      }
      v.verificationParams();
      if (v.verificationTalg) {
        const obj = {
          url: url,
          type: method,
          data: {
            quantity: 1,
            sku: v.sku,
            ymsContainerStatusId: v.detailData.ymsContainerStatusId,
            ymsPickingOrderId: v.pageParams.ymsPickingOrderId,
            ymsWarehouseLocationCode: v.ymsWarehouseLocationCode
          }
        };
        uni.showLoading({
          title: "处理中..."
        });
        v.ajaxData(obj).then((response) => {
          uni.hideLoading();
          if (response.data.code === 0) {
            v.showToastIcon("操作成功");
            setTimeout(() => {
              if (type === "single") {
                v.getPickingDetails();
              } else {
                v.toBack();
              }
            }, 300)
          } else {
            v.abnormalPrompt(response.data.code)
          }
        });
      }
    },
    // 返回列表页
    toBack() {
      let v = this;
      v.showToastIcon("已经全部拣货完成");
      setTimeout(() => {
        let obj = {
          code: v.pageParams.code,
          ymsPickingOrderId: v.pageParams.ymsPickingOrderId
        };
        v.gotoReturnBack('pages/workspace/ymsPicking/pickingListDetails', obj);
        // uni.navigateTo({
        //   url: `/pages/workspace/ymsPicking/pickingListDetails?code=${v.pageParams.code}&ymsPickingOrderId=${v.pageParams.ymsPickingOrderId}`
        // });
      }, 2000);
    },
    // 返回指定页面处理方法
    gotoReturnBack(path, obj) {
      let v = this;
      let pages = getCurrentPages();
      let num = pages.length
      let backnum
      let routeList = [
        'pages/workspace/ymsPicking/bindingContainer',
        'pages/workspace/ymsPicking/pickingListDetails'
      ];
      for (let i = 0; i < num; i++) {
        if (pages[i].route == path) {
          backnum = num - i - 1;
        }

      }
      if (routeList.includes(path)) {
        let prevPage = null;
        if (path === 'pages/workspace/ymsPicking/bindingContainer') {
          prevPage = pages[num - 3];
        } else {
          prevPage = pages[num - 2];
        }
        prevPage.$vm.parameterFun(path, obj);
      }
      if (backnum == undefined) {
        v.gotoReturnBack('pages/workspace/ymsPicking/pickingList');
      } else {
        uni.navigateBack({
          delta: backnum
        });
      }
    }
  },
  watch: {
    currentTalg: {
      handler(value) {
        let v = this;
        if (value) {
          let data = getStorage('pickingInfos');
          if (data) {
            if (v.originalData.length > 0) {
              let ymsPickingOrderIds = {
                ymsPickingOrderId: data.ymsPickingOrderId,
                code: data.code
              };
              v.pageParams = Object.assign({}, v.originalData[0], ymsPickingOrderIds);
              v.getPickingDetails();
            } else {
              v.toBack();
            }
          }
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
.skuPicking_box {
  padding-top: 12rpx;

  .skuPicking_box_item {
    padding: 16rpx 30rpx 30rpx 30rpx;
    border-bottom: 2rpx solid #E8E8E8;
  }

  .inputStyles {
    border: 2rpx solid #D9D9D9;
    border-radius: 10rpx;
    background-color: #fff;
    display: flex;
    align-items: center;
    margin: 12rpx 0 0 0;
  }

  .btnStyle {
    z-index: 1000;
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
