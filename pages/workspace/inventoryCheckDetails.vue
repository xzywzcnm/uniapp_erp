<template>
  <view class="inventoryCheckDetailsPage">
    <view v-if="details">
      <view class="box-first">
        <view class="d-flex justify-content-between head">
          <text class="title">盘点单号：{{ details.inventoryCheckNo }}</text>
          <text
            class="note"
            :class="inventoryStatus === '1' ? 'orange-color' : 'blue-color'"
            >{{
              inventoryStatus === "1"
                ? "盘点中"
                : inventoryStatus === "2"
                ? "已完成"
                : "待盘点"
            }}
          </text>
        </view>
      </view>
      <view v-if="inventoryStatus === '1'">
        <view class="uni-list">
          <view class="uni-list-cell">
            <view class="uni-list-cell-left"> 盘亏/盘盈： </view>
            <view class="uni-list-cell-db">
              <picker
                @change="bindPicker1Change"
                :value="searchIndex1"
                :range="array1"
                range-key="name"
              >
                <view class="uni-input">{{ array1[searchIndex1].name }}</view>
              </picker>
            </view>
          </view>
          <view class="uni-list-cell">
            <view
              class="uni-input-wrappers"
              :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
            >
              <view class="uni-icon" @click="scanCode">&#xe612;</view>
              <input
                class="flexOne locationStyle"
                v-model.trim="searchValue"
                :focus="inputFocus"
                @confirm="search"
                placeholder="输入/扫描库位"
              />
            </view>
          </view>
        </view>
      </view>
      <view class="pb-box" v-if="list && list.length > 0">
        <uniPagination
          class="pt10"
          :current="pageParams.pageNum"
          :total="total"
          title="标题文字"
          :show-icon="true"
          @change="pageChange"
        ></uniPagination>
        <view
          class="example-body package-list-card mt10"
          v-for="(value, cIndex) in list"
          :key="cIndex"
        >
          <view class="uni-list">
            <view class="uni-list-cell" hover-class="uni-list-cell-hover">
              <view class="uni-media-list">
                <view class="uni-media-list-body uni-media-list-package">
                  <view
                    >货位：<span class="text">{{
                      value.warehouseLocationCode
                    }}</span></view
                  >
                  <view
                    >待盘点数量：<span class="text errorTips">{{
                      value.totalAwaitCheckedInventoryNumber
                    }}</span></view
                  >
                  <view
                    >已盘点数量：<span class="text errorTips">{{
                      value.totalCheckedInventoryNumber
                    }}</span></view
                  >
                </view>
              </view>
            </view>
          </view>
        </view>
        <uniPagination
          v-if="list && list.length > 4"
          class="mt10"
          :current="pageParams.pageNum"
          :total="total"
          title="标题文字"
          :show-icon="true"
          @change="pageChange"
        ></uniPagination>
      </view>
      <view v-else style="text-align: center"> 无搜索结果 </view>
      <view
        class="bottomBit d-flex justify-content-center align-items-center"
        v-if="inventoryStatus === '0'"
      >
        <button type="warn" size="mini" @click="startInventory">
          开始盘点
        </button>
      </view>
      <view class="bottomBit" v-if="inventoryStatus === '1'">
        <view class="d-flex justify-content-center align-items-center">
          <button
            type="primary"
            size="mini"
            style="background-color: #00c853 !important"
            @click="confirmFinish = true"
          >
            提交盘点数据
          </button>
        </view>
      </view>
    </view>
    <view v-else></view>
    <u-modal
      v-model="confirmFinish"
      content="提交后盘点工作结束，在PDA不可修改，是否确认提交？"
      @confirm="saveMt"
      ref="uModal"
      :async-close="true"
      :show-cancel-button="true"
      title="提交盘点数据"
    ></u-modal>
  </view>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/mixin/common_mixin";
import { getStorage } from "@/utils";
const prefixCls = "tongtool-workspace-inventoryCheck";
export default {
  name: "inventoryCheckDetail",
  mixins: [Mixin],
  components: {},
  data() {
    return {
      total: 0,
      inventoryCheckNo: null,
      pageParams: {
        pageNum: 1,
        pageSize: 10,
      },
      // 盘点时临时数据(保存为 transitShipmentList 时用到)
      temporaryList: [],
      // 盘点时保存的数据(做为中转，保存和提交时用到)
      transitShipmentList: [],
      list: [],
      createAdjustBol: false,
      inventoryStatus: "0", // 0 待盘点列表 1 盘点列表 2 盘点操作页
      details: null,
      searchValue: "", // 库位
      inputFocus: false,
      searchIndex1: 0,
      array1: [{ name: "全部" }, { name: "盘盈" }, { name: "盘亏" }],
      confirmFinish: false,
    };
  },
  created() {},
  computed: {
    wrap() {
      return `${prefixCls}`;
    },
  },
  onLoad(option) {
    this.inventoryStatus = option.inventoryStatus;
    this.inventoryCheckNo = option.inventoryCheckNo;
    this.getDetails();

    // 监听事件
    uni.$on("refreshList", () => {
      console.log("refreshList");
      this.getDetails();
    });
  },
  onShow() {
    this.autoFocus();
  },
  onUnload() {
    // 移除监听事件
    uni.$off("refreshList");
  },
  methods: {
    // 开始盘点
    startInventory() {
      let v = this;
      const obj = {
        url: api.set_checkStart,
        type: "post",
        data: {
          inventoryCheckNo: v.details.inventoryCheckNo,
          warehouseId: getStorage("newErpWarehouse").warehouseId,
        },
      };
      uni.showLoading({
        title: "数据加载中",
      });
      v.ajaxData(obj)
        .then((response) => {
          if (response.data.code === 0) {
            v.inventoryStatus = "1";
            v.list = [];
            v.getDetails();
          } else if (response.data.code === 554133) {
            v.showToast(
              "存在包含当前sku,且在盘点中的盘点单.请先完成盘点后再开始这个盘点单"
            );
          } else if (response.data.code === 999993) {
            v.showToast(response.data.message);
          } else {
            v.showToast("操作失败");
          }
        })
        .finally(() => {
          uni.hideLoading();
        });
    },
    // 保存
    saveMt() {
      this.getAllList().then((res) => {
        let list = [];
        Object.keys(res).forEach((k) => list.push(...res[k].skuList));
        // 保存盘点
        let data = list.map((i) => {
          return {
            // 已盘点
            checkedInventoryNumber: i.checkedInventoryNumber,
            // 盘点明细ID
            inventoryCheckDetailId: i.inventoryCheckDetailId,
            actualPickingNumber: i.actualPickingNumber, //  实际拣货数量(完成判断是的快照)
            inventoryCheckNo: i.inventoryCheckNo, // 盘点单编号
            oriTotalNumber: i.oriTotalNumber, // 原库存总数量(包含已分配、冻结)
            productGoodsId: i.productGoodsId, //  货品id
            warehouseLocationId: i.warehouseLocationId, // 库位id
            isCommit: 1, //提交加isCommit = 1 ,保存不用
          };
        });
        const obj = {
          url: api.set_updateCheckDetail,
          type: "post",
          data: data,
        };
        this.ajaxData(obj)
          .then((response) => {
            let str = null;
            if (response.data.code === 0) {
              str = "保存成功";
              uni.navigateBack({
                delta: 1,
              });
            } else if (response.data.code === 999993) {
              str = response.data.message;
            } else {
              str = "保存失败";
            }
            uni.showToast({
              title: str,
              icon: "none",
              duration: 2000,
            });
          })
          .finally(() => {
            this.confirmFinish = false;
          });
      });
    },
    // 页码切换
    pageChange(e) {
      this.pageParams.pageNum = e.current;
      this.getDetails();
    },
    // 获取列表(type:location为库位查询)
    getDetails(type) {
      let v = this;
      return new Promise((resolve) => {
        let checkQuantityStatus = v.searchIndex1;
        if (v.searchIndex1 === 2) checkQuantityStatus = 3;
        let location = this.searchValue ? this.searchValue.trim() : null;
        const obj = {
          url: api.get_wmsInventoryCheckDetail,
          type: "post",
          data: {
            checkQuantityStatus: checkQuantityStatus, // 0 全部 1 盘盈 2 盘平 3 盘亏
            inventoryCheckNo: this.inventoryCheckNo, // 盘点编号
            warehouseId: getStorage("newErpWarehouse").warehouseId,
            pageNum: v.pageParams.pageNum,
            pageSize: v.pageParams.pageSize,
            isPage: 0, //  是否分页处理（0分页1不分页）
            isPda: 1, //  是否是pda:1:是
            warehouseLocationCodeOrName: location || null, // 查询库位
          },
        };
        uni.showLoading({
          title: "数据加载中",
        });
        v.ajaxData(obj)
          .then((response) => {
            let temp = response.data || {};
            if (temp.code === 0) {
              let tableData =
                temp.datas.warehouseLocationCheckDetailResultPage || {};
              resolve(tableData.list || []);
              // 库位查询
              if (["location"].includes(type)) return;
              // 正常列表查询
              v.details = temp.datas;
              v.openSound("001");
              v.scrollTo({
                scrollTop: 0,
                duration: 10,
              });
              v.total = tableData.total || 0;
              v.list = tableData.list || [];
            } else {
              resolve([]);
              if (["location"].includes(type)) return;
              v.openSound("002");
            }
          })
          .finally(() => {
            uni.hideLoading();
          })
          .catch(() => {
            resolve([]);
          });
      });
    },
    // 获取全部列表
    getAllList() {
      return new Promise((resolve) => {
        const obj = {
          url: api.get_wmsInventoryCheckDetail,
          type: "post",
          data: {
            checkQuantityStatus: 0, // 0 全部 1 盘盈 2 盘平 3 盘亏
            inventoryCheckNo: this.inventoryCheckNo, // 盘点编号
            warehouseId: getStorage("newErpWarehouse").warehouseId,
            isPage: 1, //  是否分页处理（0分页1不分页）
            isPda: 1, //  是否是pda:1:是
          },
        };
        this.ajaxData(obj)
          .then(({ data }) => {
            if (data && data.code === 0) {
              let dataTotal = data.datas || {};
              let invenSkuList = dataTotal.inventoryCheckDetailResultPage || {};
              // 计算全部库位下的盘点数据和sku列表数据
              let temp = {};
              (invenSkuList.list || []).forEach((sk) => {
                const code = sk.warehouseLocationCode;
                if (temp[code]) {
                  temp[code].skuList.push(sk);
                } else {
                  temp[code] = {};
                  temp[code].skuList = [sk];
                }
              });
              resolve(temp);
            } else {
              resolve({});
            }
          })
          .catch(() => {
            resolve({});
          });
      });
    },
    // 盘亏/盘盈
    bindPicker1Change(e) {
      this.searchIndex1 = +e.detail.value;
      this.pageParams.pageNum = 1;
      this.getDetails();
    },
    autoFocus() {
      this.inputFocus = false;
      this.$nextTick(() => {
        this.inputFocus = true;
        this.searchValue = "";
      });
    },
    // 搜索
    search(e) {
      const location = e.detail.value ? e.detail.value.trim() : null;
      if (!location) {
        uni.showToast({
          title: "库位为空!",
          icon: "none",
          duration: 2000,
        });
        this.autoFocus();
        return;
      }
      this.pageParams.pageNum = 1;
      this.getDetails("location").then((list) => {
        if (!list.length) {
          uni.showToast({
            title: "该盘点单下不存在此库位!",
            icon: "none",
            duration: 2000,
          });
          this.autoFocus();
          return;
        }
        this.searchValue = "";
        this.gotoPage(
          `/pages/workspace/inventoryCheckOperation?inventoryCheckNo=${this.inventoryCheckNo}&location=${location}`,
          ""
        );
      });
    },
    // 扫一扫
    scanCode() {
      let v = this;
      uni.scanCode({
        success: function (res) {
          v.search({
            detail: {
              value: res.result,
            },
          });
        },
        fail: function (error) {
          console.log("error:", error);
        },
      });
    },
  },
};
</script>

<style lang="less" scope>
.inventoryCheckDetailsPage {
  &,
  .locationStyle,
  uni-view {
    font-size: 36rpx;
  }
  .pb-box {
    padding-bottom: 132rpx;
  }
  .box-first {
    margin-bottom: 20rpx;
    .head {
      padding: 20rpx;
      background-color: #fff;
    }
    .title {
      font-weight: bold;
    }
  }

  .uni-input-wrappers {
    display: flex;
    width: 100%;
    padding: 20rpx;
    background-color: #ffffff;
    .flexOne {
      flex: 1;
      overflow: hidden;
      margin-left: 20rpx;
    }

    .uni-icon {
      font-size: 52rpx;
      width: 52rpx;
      height: 52rpx;
      color: #999999;
    }
  }

  .uni-input {
    height: 28px;
    line-height: 28px;
  }

  .uni-list-cell-left {
    padding: 0 20rpx;
  }

  .example-body {
    flex-wrap: wrap;
    justify-content: center;
    padding: 0;
  }

  .uni-media-list-package {
    .text {
      color: #666666;
    }
    .errorTips {
      color: #f44336;
    }
  }

  .uni-media-list-body {
    height: auto;
    justify-content: space-around;
  }
}
</style>
