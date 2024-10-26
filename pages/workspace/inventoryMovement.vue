<template>
  <view>
    <view class="pd-box">
      <view class="uni-form-item uni-column inventory-move">
        <view class="uni-input-wrapper" :class="{themeInput:theme.inputStyle ==='DarkBlue'}">
          <input class="uni-input"  v-model.trim="searchValue" @confirm='confirmNext' :focus="inputFocus" placeholder="库位" />
          <view class="iconfont text-16" @click="scanCode">&#xe612;</view>
        </view>
        <view class="uni-input-wrapper" :class="{themeInput:theme.inputStyle ==='DarkBlue'}">
          <input class="uni-input"  v-model.trim="searchSku" @confirm='search' placeholder="SKU" />
          <view class="iconfont text-16" @click="scanSKU">&#xe612;</view>
        </view>
        <view class="uni-common-mt">
          <button type="primary" @click="search">查询</button>
        </view>
      </view>
    </view>
    <no-data v-if="items.length === 0" :text="'无数据，请扫描库位或SKU'" class="mt10"></no-data>
    <view v-else class="pd-box pb100">
      <view class="uni-list">
        <checkbox-group  @change="checkboxChange">
          <view class="uni-list-cell" hover-class="uni-list-cell-hover" v-for="(value, key) in items" :key="key" >
            <view class="uni-media-list">
              <checkbox :value="value.value" :checked="value.checked" />
              <image class="uni-media-list-logo" :src="value.goodsUrl"></image>
              <view class="uni-media-list-body uni-media-list-package">
                <view>SKU：<span class="text sku">{{value.goodsSku}}</span></view>
                <view>库位：<span class="text sku">{{value.warehouseLocationName }}</span></view>
                <view>批次号：<span class="text">{{value.receiptBatchNo}}</span></view>
                <view>中文描述：<span class="text">{{value.goodsCnDesc}}</span></view>
                <view>英文描述：<span class="text">{{value.goodsEnDesc}}</span></view>
                <view>不良品数量：<span class="text">{{value.defectiveNumber || 0}}</span></view>
                <view class="row">
                  <view class="col col-6">库存数量：<span class="text">{{value.inventoryNumber}}</span></view>
                  <view class="col col-6">分配数量：<span class="text">{{value.allottedNumber}}</span></view>
                </view>
                <view class="row">
                  <view class="col col-6">冻结数量：<span class="text">{{value.frozenNumber}}</span></view>
                  <view class="col col-6">可用数量：<span class="text color-333">{{value.availableNumber}}</span></view>
                </view>
              </view>
            </view>
          </view>
        </checkbox-group>
      </view>
    </view>
    <view class="bottom-button-fix" v-if="items && items.length > 0">
        <view class="row d-flex justify-content-between padding-l-r-20">
          <view class="col col-5">
            <button type="primary" size="mini"  @click="checkAll">全选</button>
          </view>
          <view class="col col-5">
            <button type="warn" size="mini"  @click="clearCheckAll">清除</button>
          </view>
        </view>
        <view>
        <view class="d-flex justify-content-center align-items-center">
          <button class="chose-button" size="mini" @click="choseDataMt">已选(<span>{{checkedNumber}}</span>)</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
    import api from '@/api/api';
    import Mixin from '@/mixin/common_mixin';
    import noData from "@/components/common/nodata";
    import {
        setStorage,
        getStorage,
        removeStorage
    } from '@/utils'
    /*库存移动*/
    export default {
        name: "inventoryMovement",
        mixins: [Mixin],
        components: {
            noData
        },
        data() {
            return {
                inputFocus: true,
                inputFocusTwo: false,
                items: [],
                searchValue: '',
                searchSku: ''
            };
        },
        created() {
        },
        props: {},
        watch: {
          'pageBackStatus' (newVal,oldVal) {
            if (newVal && newVal !== oldVal) {
              this.resetPage();
            }
          }
        },
        computed:{
            pageBackStatus () {
              return this.store.state.pageBackStatus
            },
            checkedNumber () {
                if (this.items && this.items.length > 0) {
                    return this.items.filter(i=>i.checked).length
                } else {
                    return 0
                }
            }
        },
        methods: {
            resetPage() {
              this.searchValue = '';
              this.searchSku = '';
              this.items = [];
            },
            confirmNext() {
                this.inputFocusTwo = true;
                this.search();
            },
            choseDataMt () {
                let v = this;
                if (v.checkedNumber === 0) {
                    v.showToast('请选择数据');
                    return;
                }
                v.store.commit('inventoryList',this.items.filter(i=>i.checked).map(i=>{
                    if (i.defectiveNumber && i.defectiveNumber > 0) {
                      i.moveInventoryNumber = i.defectiveNumber
                    } else {
                      i.moveInventoryNumber = i.availableNumber // 移动数量等于可用数量
                    }
                    i.toWarehouseLocationId = '' // To 库位
                    return i
                }));
                v.gotoPage('/pages/workspace/inventoryMoveDetail')
            },
            search () {
                // 查询
                let v = this;
                if (!v.searchValue && !v.searchSku) {
                    v.openSound('002');
                    v.showToast('请输入库位或者SKU');
                    return;
                }
                uni.showLoading({
                    title: '数据提交中',
                    mask: true
                });
                const obj = {
                    url: api.post_wmsInventoryList,
                    method: 'POST',
                    data: {
                        "goodsSku": v.searchSku,
                        "pickingFlag": "1,3",  // 拣货的意思 写死
                        "queryParamType": "3", // /1按产品查询 / 2按产品,库位查询 /3按产品,库位,批次查询 /默认是1 , 写死
                        "warehouseLocationName": v.searchValue,
                        warehouseId: getStorage('newErpWarehouse').warehouseId
                    }
                };
              v.items = [];
                v.ajaxData(obj)
                    .then(response => {
                        uni.hideLoading();
                        if (response.data.code === 0) {
                            if (response.data.datas && response.data.datas.length > 0) {

                                let data = response.data.datas.filter(i=>i.availableNumber>0 || i.defectiveNumber > 0); // 可用数量大于0 或者不良品数量大于0
                                if (data.length > 0) {
                                  v.openSound('001');
                                    data.forEach((i,ind)=>{
                                        i.checked = false;
                                        i.value = ind + '';
                                        i.goodsUrl = v.setImgPath(i.goodsUrl)
                                    });
                                    v.items = v.repeatArrayObject([...v.items,...data],'inventoryId'); // 去重
                                } else {
                                  v.openSound('002');
                                    v.showToast('无数据');
                                }
                            } else {
                               v.openSound('002');
                                v.showToast('无数据');
                            }
                        } else {
                          v.openSound('002');
                            v.showToast('查询失败');
                        }
                    })
            },
            checkboxChange: function (e) {
                // check事件
                var items = this.items,
                    values = e.detail.value;
                for (var i = 0, lenI = items.length; i < lenI; ++i) {
                    const item = items[i]
                    if(values.indexOf(item.value) >= 0){
                        this.$set(item,'checked',true)
                    }else{
                        this.$set(item,'checked',false)
                    }
                }
            },
            checkAll () {
                // 全选
                this.items.forEach(i=> {
                    this.$nextTick(()=>{
                        i.checked = true
                    })
                })
            },
            clearCheckAll () {
                // 清除
                this.items = [];
                this.searchValue = '';
                this.searchSku = '';
            },
            scanCode() {
                // 扫一扫
                let v = this
                uni.scanCode({
                    success: function (res) {
                        v.searchValue = res.result;
                        v.search();
                    },
                    fail: function (error) {
                        console.log('error:', error)
                    }
                })
            },
            scanSKU() {
                // 扫一扫
                let v = this
                uni.scanCode({
                    success: function (res) {
                        v.searchSku = res.result;
                        v.search();
                    },
                    fail: function (error) {
                        console.log('error:', error)
                    }
                })
            }
        },
        onShow () {
            this.inputFocus = true;
            this.items = [];
            this.searchValue = '';
            this.searchSku = '';
        },
        onLoad () {
            let v = this;
            let loadStoreWarehouse = getStorage('newErpWarehouse');
            v.items = [];
            v.warehouseName = loadStoreWarehouse.warehouseName;
            // 设置头部
            uni.setNavigationBarTitle({
                title: `库存移动(${v.warehouseName})`
            })
        }
    }
</script>


<style scoped>
  .inventory-move .uni-input-wrapper{
    width: auto;
  }
  .pd-box .uni-icon {
    margin-top: 2px;
  }
  .bottom-button-fix {
    position: fixed;
    bottom: 0;
    width: 100%;
    left: 0;
    z-index: 999;
    background-color: #fff;
  }
  .bottom-button-fix button {
    width: 100%;
  }
  .chose-button {
    background-color: #00c853;
    color: #ffffff;
    padding: 0;
    margin: 0 12px 5px 12px;
  }
  .padding-l-r-20 {
    padding: 0 20px;
  }
  .uni-media-list-body .row {
    margin-left: 0;
    margin-right: 0;
  }

  .uni-media-list-package view{
    font-size: 22upx;
    width: 450rpx;
    display: line-block;
  }

  .uni-media-list-package .text{
    color: #666666;
  }

  .pd-box {
    margin: 12px;
  }
  .uni-media-list-logo {
    width: 180rpx;
    height: 140rpx;
    margin-top: 10rpx;
  }

  .uni-media-list-body {
    height: auto;
    justify-content: space-around;
  }

  .uni-input-wrapper {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    padding: 8px 13px;
    flex-direction: row;
    flex-wrap: nowrap;
    background-color: #FFFFFF;
    border-bottom: 1px solid #dddddd;
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
  .uni-input-wrapper:last-child{
    border-bottom: 0;
  }
</style>
