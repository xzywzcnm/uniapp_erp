<template>
    <view>
      <view class="scanWrap">
        <view class="uni-form-item uni-column">
          <view class="uni-input-wrapper" :class="{themeInput:theme.inputStyle ==='DarkBlue'}">
            <input class="uni-input" v-model.trim="searchValue" :focus="inputFocus" @confirm="scanPack()" placeholder="请输入出库单号/运单号/物流单号" />
            <view class="iconfont text-16" @click="scanCode">&#xe612;</view>
          </view>
        </view>
      </view>
      <no-data v-if="!packageInfo" :text="'无数据，请扫描包裹'" class="mt10"></no-data>
      <view v-else>
        <view class="example-body package-list-card" v-for="(pack,cIndex) in packageInfo" :key="cIndex">
          <uni-card :title="pack.packageCode">
            <view class="row">
              <view class="col col-2">
                <!--创建-->
                <view class="iconfont text-center" :class="pack.createdTime ? 'iconActive' : ''">&#xe61a;</view>
              </view>
              <view class="col col-4">
                <!--可以先配货也可以先上传物流商-->
                <view v-if="pack.pickingOrGetLabel" class="row">
                  <view class="iconfont text-center col col-6" :class="pack.pickingTime ? 'iconActive' : ''">&#xe91b;</view>
                  <view class="iconfont text-center col col-6" :class="pack.getLabelTime ? 'iconActive' : ''">&#xe64a;</view>
                </view>
                <view v-else  class="row">
                  <view class="iconfont text-center col col-6" :class="pack.getLabelTime ? 'iconActive' : ''">&#xe64a;</view>
                  <view class="iconfont text-center col col-6" :class="pack.pickingTime ? 'iconActive' : ''">&#xe91b;</view>
                </view>
              </view>
              <view class="col col-2">
                <!--拣货-->
                <view class="iconfont text-center" :class="pack.pickingGoodsTime  ? 'iconActive' : ''">&#xe662;</view>
              </view>
              <view class="col col-2">
                <!--打印-->
                <view class="iconfont text-center" :class="pack.printTime ? 'iconActive' : ''">&#xe661;</view>
              </view>
              <view class="col col-2">
                <!--发货-->
                <view class="iconfont text-center" :class="pack.despatchTime ? 'iconActive' : ''">&#xe688;</view>
              </view>
            </view>
            <view class="uni-list">
              <view class="uni-list-cell" hover-class="uni-list-cell-hover" v-for="(value, key) in pack.goodsList" :key="key" >
                <view class="uni-media-list">
                  <image class="uni-media-list-logo" :src="value.pictureUrl"></image>
                  <view class="uni-media-list-body uni-media-list-package">
                    <view>SKU：<span class="text sku">{{value.sku}}</span></view>
                    <view>中文描述：<span class="text">{{value.goodsCnDesc}}</span></view>
                    <view>英文描述：<span class="text">{{value.goodsEnDesc}}</span></view>
                    <view>数量：<span class="text">{{value.quantity}}</span></view>
                  </view>
                </view>
              </view>
            </view>
          </uni-card>
        </view>
      </view>
      <view class="bottomBit d-flex justify-content-center align-items-center">
        <button type="primary" size="mini" @click="scanPack">查询</button>
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
    export default {
        name: "packageList",
        mixins: [Mixin],
        components: {
            noData
        },
        data() {
            return {
                inputFocus: true,
                placeholderImg: '../../static/placeholder.jpg',
                searchValue: '',
                iconActive: [true,false,false,false,false,false], // 控制包裹状态
                packageInfo: null // 包裹数据
            };
        },
        created() {

        },
        methods: {
            scanPack () {
                // 查询
                let v = this;
                if (!v.searchValue) {
                    uni.showToast({
                        title: '请输入出库单号/运单号/物流单号',
                        icon : 'none',
                        duration: 2000
                    });
                    v.openSound('002');
                    return;
                }
                uni.showLoading({
                    title: '数据提交中',
                    mask: true
                });
                const obj = {
                    url: api.post_queryPackageByCode,
                    method: 'POST',
                    data: {
                        code: v.searchValue,
                        warehouseId: getStorage('newErpWarehouse').warehouseId
                    }
                };
                v.ajaxData(obj)
                    .then(response => {
                        uni.hideLoading()
                        if (response.data.code === 0) {
                            if (response.data.datas && response.data.datas.length > 0) {
                               v.openSound('001');
                                v.searchValue = '';
                                let data = response.data.datas;
                                data.forEach(i=>{
                                    // 配货和上传物流商时间判断
                                    if (i.pickingTime === null && i.getLabelTime === null) {
                                        i.pickingOrGetLabel = true
                                    } else if (i.pickingTime === null || i.getLabelTime === null){
                                        if (i.pickingTime) {
                                            i.pickingOrGetLabel = true
                                        } else {
                                            i.pickingOrGetLabel = false
                                        }
                                    } else {
                                        if (new Date(i.pickingTime.replace(/-/g, '/')).getTime() < new Date(i.getLabelTime.replace(/-/g, '/')).getTime()) {
                                            i.pickingOrGetLabel = true
                                        } else {
                                            i.pickingOrGetLabel = false
                                        }
                                    }
                                    i.goodsList.forEach(j=>{
                                        j.pictureUrl = v.setImgPath(j.pictureUrl)
                                    })

                                })
                                v.packageInfo = data;
                            } else {
                                v.openSound('002');
                                uni.showToast({
                                    title: '无数据',
                                    icon : 'none',
                                    duration: 2000
                                });
                            }
                        } else {
                            v.openSound('002');
                            uni.showToast({
                                title: '查询失败',
                                icon : 'none',
                                duration: 2000
                            });
                        }
                    })
            },
            setIConActive (index) {
                // 设置当前包裹状态
                this.iconActive.forEach((i,ind)=>{
                    this.$set(this.iconActive,ind,ind <= index);
                })
            },
            scanCode() {
                // 扫一扫
                let v = this
                uni.scanCode({
                    success: function (res) {
                        v.searchValue = res.result;
                        v.scanPack()
                    },
                    fail: function (error) {
                        console.log('error:', error)
                    }
                })
            },
        },
        onShow () {
            this.inputFocus = true;
        },
        onLoad () {
            let v = this;
            let loadStoreWarehouse = getStorage('newErpWarehouse');
            v.warehouseName = loadStoreWarehouse.warehouseName;
            // 设置头部
            uni.setNavigationBarTitle({
                title: `包裹查询(${v.warehouseName})`
            })
        }
    }
</script>

<style>
  .scanWrap .uni-icon {
    margin-top: 2px;
  }
  .package-list-card .uni-card__header-title-text {
    font-size: 28rpx!important;
    color: #0A98D5;
  }
</style>

<style scoped>

  .scanWrap {
    margin: 12px;
  }

  .iconActive {
    color: #2d8cf0;
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

  .example-body {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0;
    font-size: 14px;
  }

  .uni-media-list-package view{
    font-size: 22upx;
    width: 450rpx;
    display: line-block;
  }
  .uni-media-list-package .text{
    color: #666666;
  }
  .uni-media-list-package .sku {
    color: #3399ff;
  }
</style>
