<template>
  <view>
    <view class="pd-box pb50">
      <view class="uni-form-item uni-column">
        <view class="uni-input-wrapper" :class="{themeInput:theme.inputStyle ==='DarkBlue'}">
          <input class="uni-input"  v-model.trim="searchValue" @confirm="scanPack()" :focus="inputFocus" placeholder="库位" />
          <view class="iconfont text-16" @click="scanCode">&#xe612;</view>
        </view>
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
    export default {
        name: "batchEditWarehouseLocation",
        mixins: [Mixin],
        data() {
            return {
                searchValue: '',
                inputFocus: true,
                warehouseLocationId: ''
            };
        },
        created() {

        },
        props: {},
        watch: {},
        methods: {
            gotoDetail (data) {
                let v = this;
                if (data) {
                    v.warehouseLocationId = data.warehouseLocationId;
                    let mapData = v.store.state.inventoryList.map(i=>{
                        if (i.checked) {
                            i.toWarehouseLocationId = data.warehouseLocationId;
                            i.moveWarehouseLocationName = v.searchValue;
                        }
                        return i
                    });
                    v.store.commit('inventoryList',mapData)
                    uni.showToast({
                        title: '设置成功',
                        duration: 2000
                    });
                    v.redirectTo('/pages/workspace/inventoryMoveDetail')
                } else {
                    v.warehouseLocationId = '';
                    v.inputFocus = true;
                }
            },
            scanPack () {
                let v = this;
                this.getWarehouseLocationId(v.searchValue).then((data)=>{
                    v.gotoDetail(data);
                });
            },
            scanCode () {
                // 扫一扫
                let v = this
                uni.scanCode({
                    success: function (res) {
                        v.getWarehouseLocationId(res.result).then((data)=>{
                            v.gotoDetail(data);
                        });
                    },
                    fail: function (error) {
                        console.log('error:', error)
                    }
                })
            },
        },
        onShow(){
            this.inputFocus = true;
        }
    }
</script>

<style scoped>
  .pd-box .uni-icon {
    margin-top: 2px;
  }
  .pd-box {
    margin: 12px;
  }
  .uni-input-wrapper {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
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
