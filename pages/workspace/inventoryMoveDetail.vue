<template>
    <view>
      <view class="inventory-operation-content">
        <view class="p5 clearfix">
          <checkbox-group  @change="checkAll" class="fl checkbox-group">
            <checkbox :value="checkAllValue" :checked="checkAllValue"/>
          </checkbox-group>
          <button size="mini" plain="true" class="fr" @click="batchDel" type="warn">批量删除</button>
        </view>
      </view>
      <view class="pd-box pb50">
        <view class="uni-list">
          <checkbox-group  @change="checkboxChange">
            <view class="uni-list-cell" hover-class="uni-list-cell-hover" v-for="(value, key) in items" :key="key" >
              <view class="uni-media-list">
                <checkbox :value="value.value" :checked="value.checked" />
                <image class="uni-media-list-logo" :src="setImgPath(value.goodsUrl)"></image>
                <view class="uni-media-list-body uni-media-list-package">
                  <view class="text-box">SKU：<span class="text sku">{{value.goodsSku}}</span></view>
                  <view class="text-box">库位：<span class="text sku">{{value.warehouseLocationName }}</span></view>
                  <view class="text-box">批次号：<span class="text">{{value.receiptBatchNo}}</span></view>
                  <view class="text-box">中文描述：<span class="text">{{value.goodsCnDesc}}</span></view>
                  <view class="text-box">英文描述：<span class="text">{{value.goodsEnDesc}}</span></view>
                  <view class="text-box">不良品数量：<span class="text">{{value.defectiveNumber || 0}}</span></view>
                  <view class="row text-box">
                    <view class="col col-6 child-text">库存数量：<span class="text">{{value.inventoryNumber}}</span></view>
                    <view class="col col-6 child-text">分配数量：<span class="text">{{value.allottedNumber}}</span></view>
                  </view>
                  <view class="row text-box">
                    <view class="col col-6 child-text">冻结数量：<span class="text">{{value.frozenNumber}}</span></view>
                    <view class="col col-6 child-text">可用数量：<span class="text color-333">{{value.availableNumber}}</span></view>
                  </view>
                  <view class="d-flex text-box"><span class="input-label">移动数量：</span><input class="in-input" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" v-model.trim="value.moveInventoryNumber"></view>
                  <view class="d-flex text-box"><span class="input-label">移动库位：</span><input class="in-input" v-model.trim="value.moveWarehouseLocationName" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" @confirm="confirmSLocation(key)"  :focus="value.inputFocus" placeholder="库位" /></view>
                </view>
                <view class="uni-icon del-icon" @click="del(key)">&#xe434;</view>
              </view>
            </view>
          </checkbox-group>
        </view>
      </view>
      <view class="bottomBit d-flex justify-content-center align-items-center" v-if="items && items.length > 0">
        <button type="primary" size="mini" @click="batchEditWarehouseLocation">批量修改库位</button>
        <button class="success" type="primary" size="mini" @click="implement">执行</button>
      </view>
    </view>
</template>

<script>
    import api from '@/api/api';
    import Mixin from '@/mixin/common_mixin';
    import {
        setStorage,
        getStorage,
        removeStorage
    } from '@/utils'
    export default {
        name: "inventoryMoveDetail",
        components: {},
        mixins: [Mixin],
        data() {
            return {
                checkAllValue: false,
                items: []
            };
        },
        created() {

        },
        props: {},
        watch: {},
        methods: {
            del (index) {
                this.items.splice(index,1)
            },
            imlementValid () {
                let v = this;
                return new Promise(resolve => {
                    let data = v.items.filter(i=>i.checked);
                    if (data.length === 0) {
                        v.showToast('请选择数据');
                        resolve(false)
                    }
                    if (data.some(i=>!i.toWarehouseLocationId)) {
                        v.showToast('请选择库位');
                        resolve(false)
                    }
                    if (data.some(i=>i.moveInventoryNumber === 0 || isNaN(Number(i.moveInventoryNumber)))) {
                        v.showToast('请输入转移数量');
                        resolve(false)
                    }
                    if (data.some(i=>i.moveInventoryNumber > (i.availableNumber + i.defectiveNumber))) {
                        v.showToast('转移数量大于可用数量');
                        resolve(false)
                    }
                    resolve(true)
                })
            },
            implement () {
                // 执行
                let v = this;
                let data = v.items.filter(i=>i.checked);
                v.imlementValid().then(valid => {
                    if (valid) {
                        uni.showLoading({
                            title: '数据提交中',
                            mask: true
                        });
                        let params = data.map(i=>{
                            let obj = {
                                "fromInventoryNumber": i.availableNumber,  // From可用库存数量 ,
                                "fromWarehouseLocationId": i.warehouseLocationId, // From库位ID ,
                                "inventoryId": i.inventoryId, // 库存ID
                                "moveInventoryNumber": Number(i.moveInventoryNumber), // 转移库存数量
                                "toWarehouseLocationId": i.toWarehouseLocationId // To库位ID
                            }
                            return obj
                        });

                        const obj = {
                            url: api.post_createAndExec,
                            method: 'POST',
                            data: {
                                "createInventoryMoveDetailList": params,
                                "warehouseId": getStorage('newErpWarehouse').warehouseId
                            }
                        };
                        v.ajaxData(obj)
                            .then(response => {
                                uni.hideLoading();
                                if (response.data.code === 0) {
                                    if (response.data.others.datas) {
                                        // code 554131
                                        let text = '操作失败:库位正在盘点中(盘点单：' + response.data.others.datas + ')';
                                        v.showToast(text);
                                    } else {
                                        uni.showToast({
                                            title: '操作成功',
                                            duration: 2000
                                        });
                                        v.store.commit('inventoryList',null);
                                        setTimeout(()=>{

                                            uni.navigateBack({
                                              url:'/pages/workspace/inventoryMovement'
                                            })
                                            // v.redirectTo('/pages/workspace/inventoryMovement');
                                        },200)
                                    }
                                } else if (response.data.code === 553701) {
                                    v.showToast('移动单已执行，不能重复执行');
                                } else if (response.data.code === 553702) {
                                    v.showToast('移动库存数量不能大于目的可用库存数量');
                                } else if (response.data.code === 553703) {
                                    v.showToast('移动数量不能为0或负数');
                                } else if (response.data.code === 553704) {
                                    v.showToast('移动库位不能相同');
                                } else if (response.data.code === 553705) {
                                    v.showToast('已经审核');
                                } else if (response.data.code === 553706) {
                                    v.showToast('未找到移动单明细');
                                } else if (response.data.code === 553707) {
                                    v.showToast('操作库存移动单失败');
                                } else if (response.data.code === 553708) {
                                    v.showToast('操作库存移动单失败,库位不能为收货库位');
                                } else if (response.data.code === 553801) {
                                    v.showToast('库存盘点中');
                                } else {
                                    v.showToast('执行失败');
                                }
                            })
                    }
                })

            },
            batchEditWarehouseLocation () {
                // 批量修改库位
                let v = this;
                let data = this.items.filter(i=>i.checked);
                if (data.length === 0) {
                    uni.showToast({
                        title: '未选择数据',
                        icon: 'none',
                        duration: 3000
                    });
                    return;
                }
                v.store.commit('inventoryList',this.items)
                v.gotoPage('/pages/workspace/batchEditWarehouseLocation')
            },
            batchDel () {
                // 批量删除
                let data = this.items.filter(i=>!i.checked);
                if (data.length === this.items.length) {
                    uni.showToast({
                        title: '未选择数据',
                        icon: 'none',
                        duration: 3000
                    });
                    return;
                } else {
                    this.items = data;
                }
            },
            confirmSLocation (index) {
                // 单个设置库位
                 this.getWarehouseLocationId(this.items[index].moveWarehouseLocationName,'','1,3').then((data)=>{
                     if (data) {
                         this.items[index].toWarehouseLocationId = data.warehouseLocationId; // TO 库位Id
                         uni.showToast({
                             title: '设置成功',
                             duration: 2000
                         });
                         if (index < this.items.length) {
                             this.$nextTick(()=>{
                                 this.items[index].inputFocus = false;
                                 this.items[index+1].inputFocus = true;
                             })
                         }
                     } else {
                         this.items[index].moveWarehouseLocationName = '';
                         this.items[index].toWarehouseLocationId = '';
                         this.items[index].inputFocus = true;
                     }
                 });
            },
            scanCode(index) {
                // 扫一扫
                let v = this
                uni.scanCode({
                    success: function (res) {
                        v.items[key];
                       // v.getWarehouseLocationId()
                    },
                    fail: function (error) {
                        console.log('error:', error)
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
                if (this.items.every(i=>i.checked)) {
                    this.$nextTick(()=>{
                        this.checkAllValue = true;
                    })
                } else {
                    this.$nextTick(()=>{
                        this.checkAllValue = false;
                    })
                }
            },
            checkAll (value) {
                // 全选
                this.items.forEach(i=> {
                    this.$nextTick(()=>{
                        this.$set(i,'checked',value.detail.value.length > 0)
                    })
                })
            }
        },
        onShow (){
            let data = this.store.state.inventoryList
            if (data.every(i=>i.checked)) {
                this.$nextTick(()=>{
                    this.checkAllValue = true;
                })
            } else {
                this.$nextTick(()=>{
                    this.checkAllValue = true;
                })
            }
            data[0].inputFocus = true;
            this.items = data
        }
    }
</script>
<style>
  .pd-box .uni-icon {
    margin-top: 2px;
  }

</style>
<style scoped>
  .inventory-operation-content .checkbox-group {
    width: auto;
  }
  .del-icon {
    position: absolute;
    right: 5px;
    top: 5px;
  }
  .success{background-color: #00c853}
  .inventory-operation-content {
    margin: 12px;
    background-color: #fff;
  }
  .pd-box {
    margin: 12px;
  }
  .p5{padding: 5px;}
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
  }

  .in-input {
    font-size: 22rpx;
    padding: 0px;
    background-color: #FFFFFF;
    border: 1px solid #e5e5e5;
  }
  .input-label{
    line-height: 22px;
    padding-right: 0;
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

  .uni-media-list-body .row {
    margin-left: 0;
    margin-right: 0;
  }

  .uni-media-list-package .text-box{
    font-size: 22upx;
    width: 450rpx;
    display: line-block;
  }
  .uni-media-list-package .child-text{font-size: 22upx;}

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
</style>
