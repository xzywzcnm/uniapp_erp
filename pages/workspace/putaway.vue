<template>
  <view :class="wrap">
    <view class="d-flex justify-content-between type-box align-items-center">
      <view class="text">{{ typeText }}</view>
      <view>
        <picker @change="typeChange" :value="typeIndex" range-key="label" :range="typeList">
          <view class="select-type">
            <text>切换</text>
          </view>
        </picker>
      </view>
    </view>
    <view class="scanWrap">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCode" style="width: 100upx">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <view class="row no-gutters">
          <view class="col col-8">
            <input ref="confirmRefsSku" v-model.trim="skuNum" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
              type="text" class="uni-input scanInput" @blur="blurSku" @confirm="confirmSku" :focus="skuFocus"
              placeholder="SKU条码" />
          </view>
          <view class="col col-1 jg" v-if="typeValue === '0' || typeValue === '4' || !hasMerge">*</view>
          <view class="col col-3" v-if="typeValue === '0' || typeValue === '4' || !hasMerge">
            <input v-model.trim="quantity" type="number" :class="{ themeInput: theme.inputStyle === 'DarkBlue' }"
              class="uni-input scanInputTwo" @blur="quantityBlue" :focus="quantityFocus" placeholder="数量">
          </view>
        </view>
      </view>
    </view>
    <view class="mu-divider"></view>
    <view class="scanWrap normalPadding">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanCargospace">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input ref="cargospaceRefs" v-model.trim="newCargospace" type="text"
          :class="{ themeInput: theme.inputStyle === 'DarkBlue' }" class="uni-input scanInput"
          @confirm="confirmCargospace" @blur="blurCargospace" :focus="cargospaceFocus" placeholder="新货位" />
      </view>
    </view>
    <view class="d-flex errorText justify-content-center align-items-center normalPadding" v-if="hasError">
      <text>{{ errorText }}</text>
    </view>
    <view class="mu-divider"></view>
    <view v-if="typeValue === '3'">
      <uni-list>
        <uni-list-item :show-switch="true" :show-arrow="false" title="是否合并批次" @switchChange="setType" />
      </uni-list>
      <uni-list v-if="hasMerge">
        <uni-list-item :show-switch="true" :show-arrow="false" title="良品数据/不良品数据" @switchChange="setQcProduct" />
      </uni-list>
      <view class="mu-divider"></view>
      <view v-if="hasMerge">
        <view class="subTitle d-flex justify-content-start align-items-center">
          <view class="square"></view>
          <text>本次上架总计</text>
        </view>
        <view class="d-flex  justify-content-between align-items-center" style="padding: 0 10px 20px 10px;">
          <span>需上架总数：{{ waitShelveNumberAll }}</span>
          <span>已上架数：{{ shelveNumberAll }}</span>
          <span>待上架数：{{ waitShelveNumberAll - shelveNumberAll }}</span>
        </view>
        <view class="mu-divider"></view>
        <view class="subTitle d-flex justify-content-start align-items-center receipt-no-header">
          <view class="square"></view>
          <view class="d-flex justify-content-between align-content-center" @click="gotoChoseShelf" style="width: 100%">
            <view>批次明细</view>
            <view style="margin-top: -2px">编辑<uni-icons type="arrowright" size="16"></uni-icons></view>
          </view>
        </view>
        <view class="mu-divider"></view>
        <view v-for="(item, index) in mergeList">
          <view class="merge-header"><text>{{ item.receiptNo }}</text></view>
          <view v-for="it in item.children" style="padding: 5px 10px 5px 10px;border-bottom: 1px solid #ddd">
            <view v-if="it.checked">
              <view>批次号：{{ it.receiptBatchNo }}</view>
              <view>收货库位：{{ it.warehouseLocationName }}</view>
              <view class="d-flex justify-content-between align-content-center">
                <view>已上架数：{{ it.shelveNumber }}</view>
                <view>待上架数：{{ it.waitShelveNumber - it.shelveNumber }}</view>
              </view>
            </view>
          </view>
        </view>
        <view style="height: 460upx"></view>
      </view>
    </view>
    <view v-if="typeValue === '0' || typeValue === '4' || !hasMerge">
      <view class="d-flex justify-content-between align-items-center controlLine" v-if="goodsArr.length !== 0">
        <text class="icon iconfont" @click="turnLeft">&#xe952;</text>
        <text>
          <text>{{ goodsArr[current].receiptNo }}</text> {{ current + 1 }}/{{ goodsArr.length }}
        </text>
        <text class="icon iconfont" @click="turnRight">&#xe655;</text>
      </view>
      <view class="normalPadding" v-if="goodsArr.length !== 0">
        <view class=" no-gutters row">
          <view class="col col-5">
            <image :src="newErpPrefix + goodsArr[current].goodsUrl" style="width: 260upx; height: 220upx ;margin: 10upx">
            </image>
          </view>
          <view class="col col-7 skuDetails">
            <view class="d-flex justify-content-start">
              <text class="pickingListCode">{{ goodsArr[current].purchaseOrderCode }}</text>
            </view>
            <view class="d-flex justify-content-start">
              <text class="supplierName">{{ goodsArr[current].supplierName }}</text>
            </view>
            <view class="d-flex justify-content-start">
              SKU: {{ goodsArr[current].goodsSku }}
            </view>
            <view class="d-flex justify-content-start">
              条码编码: {{ goodsArr[current].barCode }}
            </view>
            <view class="d-flex justify-content-start">
              中文描述: {{ goodsArr[current].goodsCnDesc }}
            </view>
            <view class="d-flex justify-content-start">
              英文描述: {{ goodsArr[current].goodsEnDesc }}
            </view>
            <view class="d-flex justify-content-start">
              SKU属性: {{ goodsArr[current].goodsAttributes }}
            </view>
          </view>
        </view>
      </view>
      <view class="mu-divider"></view>
      <view class="subTitle d-flex justify-content-start align-items-center">
        <view class="square"></view>
        <text>收货质检数据</text>
      </view>
      <view class="mu-divider"></view>
      <view class="subContainer" v-if="goodsArr.length !== 0">
        <view class="d-flex justify-content-start align-items-center subMarginTop">
          <view>
            <text>批次号：</text>
            <text>{{ goodsArr[current].receiptBatchNo }}</text>
          </view>
        </view>
        <view class="d-flex justify-content-start align-items-center subMarginTop">
          <view>
            <text>收货库位：</text>
            <text>{{ goodsArr[current].warehouseLocationName }}</text>
          </view>
        </view>
        <view class="d-flex justify-content-between align-items-center subMarginTop">
          <view>
            <text>质检记录号：</text>
            <text>{{ goodsArr[current].receiptBatchCheckDetailNo }}</text>
          </view>
          <view class="d-flex justify-content-start align-items-center">
            <text>良品：</text>
            <view class="circle d-flex justify-content-center align-items-center"
              :class="{ 'redBgColor': goodsArr[current].qcResult === 0 }">
              <text class="icon iconfont" v-if="goodsArr[current].qcResult === 1">&#xe60c;</text>
              <text class="icon iconfont" v-else>&#xe60e;</text>
            </view>
          </view>
        </view>
        <view class="d-flex justify-content-between align-items-center subMarginTop">
          <view>
            <text>需上架总数：</text>
            <text>{{ goodsArr[current].waitShelveNumber }}</text>
          </view>
          <view>
            <text>已上架数：</text>
            <text>{{ goodsArr[current].shelveNumber }}</text>
          </view>
          <view>
            <text>待上架数：</text>
            <text>{{ goodsArr[current].waitShelveNumber - goodsArr[current].shelveNumber }}</text>
          </view>
        </view>
      </view>
    </view>
    <!-- <view class="mu-divider"></view> -->
    <view class="bottomBit">
      <view class="subTitle d-flex justify-content-start align-items-center">
        <view class="square"></view>
        <text>推荐上架库位</text>
      </view>
      <view class="mu-divider"></view>
      <view class="storageLocation d-flex justify-content-between align-items-center flex-wrap"
        v-if="goodsArr.length !== 0">
        <view class="slItem" v-for="(subItem, subItemIndex) in goodsArr[current].recommendArr"
          v-if="goodsArr[current].recommendArr" :key="subItem.warehouseLocationId">
          <view>{{ subItem.warehouseLocationName }}</view>
          <text>库存数量：{{ subItem.skuData ? subItem.skuData.inventoryNumber : '暂无数据' }}</text>
        </view>
      </view>
      <view class="d-flex justify-content- align-items-center normalPadding">
        <button class="fullButton" type="primary" @click="submitData">提交</button>
      </view>
    </view>
  </view>
</template>

<script>
import Mixin from '@/mixin/common_mixin'
import api from '@/api/api'
import { debounce } from '@/common/debounce'
const prefixCls = 'tongtool-newWorkspace-putaway'
import {
  setStorage,
  getStorage,
  removeStorage
} from '@/utils'
export default {
  mixins: [Mixin],
  data() {
    return {
      shelveNumberAll: 0,
      waitShelveNumberAll: 0,
      mergeList: [],
      isHandCargospace: true,
      isHandBlur: true,
      hasMerge: false,
      mergeQc: false,
      typeValue: '0',
      typeText: '采购入库',
      typeList: [{
        label: '采购入库',
        value: '0'
      }, {
        label: '退货入库',
        value: '3'
      }, {
        label: '所有入库单类型',
        value: '4'
      }],
      typeIndex: 0,
      cargospaceFocus: false,
      skuFocus: true,
      current: 0,
      skuNum: '',
      quantity: 0,
      quantityFocus: false,
      hasError: false,
      goodsArr: [],
      newCargospace: '',
      newCargospaceObj: null
    }
  },
  components: {
  },
  computed: {
    wrap() {
      return `${prefixCls}`
    }
  },
  methods: {
    setQcProduct(e) {
      this.mergeQc = e.value;
      this.mergeListFn(this.goodsArr);
    },
    gotoChoseShelf() {
      this.gotoPage('/pages/workspace/choseOnShelf');
    },
    mergeListFn(data) {
      let obj = {};
      this.mergeList = [];
      this.shelveNumberAll = 0;
      this.waitShelveNumberAll = 0;
      data.forEach(i => {
        if (!this.mergeQc && i.qcResult === 1) {
          // 良品
          if (!obj[i.receiptNo]) obj[i.receiptNo] = [];
          this.shelveNumberAll = this.shelveNumberAll + i.shelveNumber;
          this.waitShelveNumberAll = this.waitShelveNumberAll + i.waitShelveNumber;
          i.checked = true; // 默认选中
          obj[i.receiptNo].push(i)
        } else if (this.mergeQc && i.qcResult === 0) {
          // 不良品
          if (!obj[i.receiptNo]) obj[i.receiptNo] = [];
          this.shelveNumberAll = this.shelveNumberAll + i.shelveNumber;
          this.waitShelveNumberAll = this.waitShelveNumberAll + i.waitShelveNumber;
          i.checked = true; // 默认选中
          obj[i.receiptNo].push(i)
        }

      });
      for (let key in obj) {
        this.mergeList.push({
          receiptNo: key,
          children: obj[key]
        });
      };
      this.store.commit('choseOnShelf', this.mergeList);
    },
    setType(e) {
      // console.log(e.value);
      this.hasMerge = e.value;
    },
    resetData() {
      // 清空数据
      this.skuNum = '';
      this.quantity = '';
      this.newCargospace = '';
      this.shelveNumberAll = 0;
      this.waitShelveNumberAll = 0;
      this.mergeList = [];
      this.goodsArr = [];
      this.current = 0;
      this.mergeQc = false;
    },
    typeChange(e) {
      // type 改变
      let v = this;
      let obj = v.typeList[e.target.value];
      v.typeValue = obj.value;
      v.typeText = obj.label;
      v.resetData();
    },
    goChoseType() {

    },
    blurCargospace() {
      this.isHandCargospace && this.confirmCargospace()
    },
    confirmCargospace: debounce(function () {
      let v = this
      this.isHandCargospace = false
      if (v.newCargospace === '') {
        this.isHandCargospace = true
        return false
      }
      if (v.goodsArr.length === 0) {
        uni.showToast({
          icon: 'none',
          title: '请先扫描商品信息'
        })
        v.openSound('002')
        this.isHandCargospace = true
        return false
      }
      v.newCargospaceObj = null
      return new Promise(resolve => {
        const obj = {
          url: api.get_checkStorageName,
          type: 'GET',
          data: {
            warehouseId: getStorage('newErpWarehouse').warehouseId,
            locationName: v.newCargospace,
            pickingFlag: '1,3',
            warehouseBlockType: '10,' + (v.goodsArr[v.current].qcResult ? '11' : '12')
          }
        }
        v.ajaxData(obj)
          .then(response => {
            this.isHandCargospace = true
            if (response.data.code === 0) {
              v.openSound('001')
              v.newCargospaceObj = Object.assign({}, response.data.datas)
              resolve(true)
            } else if (response.data.code === 510001) {
              v.openSound('002')
              uni.showToast({
                title: '库位不存在或已经停用',
                icon: 'none',
                duration: 3000
              })
              resolve(false)
              return false
            } else if (response.data.code === 510002) {
              v.openSound('002')
              uni.showToast({
                title: '库区类型错误',
                icon: 'none',
                duration: 3000
              })
              resolve(false)
              return false
            } else {
              v.openSound('002')
              resolve(false)
            }
          }).catch(() => {
            this.isHandCargospace = true
          })
      })
    }, 50),
    scanCode() {
      let v = this
      uni.scanCode({
        success: function (res) {
          v.skuNum = res.result
          v.skuFocus = false
          v.confirmSku()
        },
        fail: function (error) {
          console.log('error:', error)
        }
      })
    },
    scanCargospace() {
      let v = this
      uni.scanCode({
        success: function (res) {
          v.newCargospace = res.result
          v.confirmCargospace()
        },
        fail: function (error) {
          console.log('error:', error)
        }
      })
    },
    getRecommendStorage(sku, warehouseBlockType) {
      let v = this
      if (warehouseBlockType === 1) {
        warehouseBlockType = '11'
      } else {
        warehouseBlockType = '12'
      }
      return new Promise(resolve => {
        const obj = {
          url: api.get_recommendStorage,
          data: {
            warehouseId: getStorage('newErpWarehouse').warehouseId,
            sku: sku,
            warehouseBlockType: warehouseBlockType
          },
          type: 'GET'
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              resolve(response.data.datas)
            }
          })
      })

    },
    submitData: debounce(function () {
      let v = this
      if (v.newCargospace === '') {
        uni.showToast({
          title: '请输入新库位信息',
          icon: 'none',
          duration: 3000
        })
        v.openSound('002')
        return false
      }
      if (!v.newCargospaceObj && v.newCargospace !== '') {
        v.confirmCargospace()
          .then(result => {
            if (result) {
              v.startSubmitData()
            }
          })
      } else if (v.newCargospaceObj && v.newCargospace) {
        v.startSubmitData()
      }
    }, 1000),
    mergeSubmit() {
      let v = this;
      let dataObj = [];
      this.mergeList.forEach(i => {
        i.children.forEach(j => {
          if (j.checked) {
            // 没有被删的
            dataObj.push(j)
          }
        })
      });
      let arr = [];
      if (dataObj.length === 0) {
        v.showToast('请选择上架数据');
        return
      }
      if ((!v.mergeQc && v.newCargospaceObj.pickingFlag !== '3') || (v.mergeQc && v.newCargospaceObj.pickingFlag === '3')) {
        // 不良品只能上架到不良品库位
        v.showToast('不良品只能上架到不良品库位，良品不能上架到不良品库位');
        return
      }
      dataObj.forEach((i) => {
        let obj1 = {
          warehouseLocationId: v.newCargospaceObj.warehouseLocationId,
          changedNum: i.waitShelveNumber - i.shelveNumber,
          productGoodsId: i.productGoodsId,
          receiptBatchNo: i.receiptBatchNo,
          goodsSku: i.goodsSku,
          remainderNum: 0
        };
        let obj = {
          receiptBatchNo: i.receiptBatchNo,
          productGoodsId: i.productGoodsId,
          shelveNumber: i.waitShelveNumber - i.shelveNumber, // 上架数量
          inventoryNumber: Number(i.waitShelveNumber - i.shelveNumber),
          remark: i.remark, // 备注
          warehouseId: i.warehouseId,
          warehouseLocationId: i.warehouseLocationId,
          goodsSku: i.goodsSku,
          passShelveNumber: i.waitShelveNumber - i.shelveNumber, // 本次已上架合格数量
          problemWarehouseLocationId: '', // 选择上架问题库位id
          receiptCheckDetailShelveNo: i.receiptCheckDetailShelveNo,
          receiptNo: i.receiptNo, // 入库单编号
          wmsResponseInventoryLog: [obj1]
        };
        arr.push(obj);
      })
      const obj = {
        url: api.set_receiptCheckDetailBatchCreateShelve,
        data: arr
      };
      uni.showLoading({
        title: '数据提交中',
        mask: true
      });
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          if (response.data.datas.length > 0) {
            let message = response.data.datas.map(i => {
              return i.businessId + ':' + i.message
            }).join(';');
            v.showToast(message, 5000);
          } else {
            v.showToast('提交成功');
            v.store.commit('choseOnShelf', [])
            v.resetData();
          }
        } else {
          v.showToast(response.data.message);
        }
      })
    },
    startSubmitData() {
      let v = this;
      if (v.typeValue === '3' && v.hasMerge) {
        // 合并批次提交
        v.mergeSubmit();
        return;
      }
      if ((v.goodsArr[v.current].qcResult === 0 && v.newCargospaceObj.pickingFlag !== '3') || (v.goodsArr[v.current].qcResult === 1 && v.newCargospaceObj.pickingFlag === '3')) {
        // 不良品只能上架到不良品库位
        v.showToast('不良品只能上架到不良品库位，良品不能上架到不良品库位');
        return
      }


      let dataObj = {
        productGoodsId: v.goodsArr[v.current].productGoodsId,
        receiptBatchNo: v.goodsArr[v.current].receiptBatchNo,
        receiptCheckDetailShelveNo: v.goodsArr[v.current].receiptCheckDetailShelveNo,
        receiptNo: v.goodsArr[v.current].receiptNo,
        shelveNumber: v.quantity,
        goodsSku: v.skuNum,
        warehouseId: v.goodsArr[v.current].warehouseId,
        warehouseLocationId: v.goodsArr[v.current].warehouseLocationId // 原库位ID
      }
      // console.log('newCargospaceObj:', v.newCargospaceObj)
      if (v.newCargospaceObj) {
        dataObj.wmsResponseInventoryLog = [{
          warehouseLocationId: v.newCargospaceObj.warehouseLocationId,
          changedNum: v.quantity,
          productGoodsId: v.goodsArr[v.current].productGoodsId,
          receiptBatchNo: v.goodsArr[v.current].receiptBatchNo
        }]
      }
      const obj = {
        url: api.set_receiptCheckDetailShelveCreate,
        data: dataObj
      }
      uni.showLoading({
        title: '数据提交中',
        mask: true
      })
      v.ajaxData(obj)
        .then(response => {
          uni.hideLoading()
          if (response.data.code === 0) {
            if (response.data.others.datas) {
              // code 554131
              let text = '操作失败:库位正在盘点中(盘点单：' + response.data.others.datas + ')'
              uni.showToast({
                title: text,
                icon: 'none',
                duration: 2000
              })
            } else {
              uni.showToast({
                title: '提交成功',
                icon: 'none',
                duration: 2000
              });
              v.resetData();
              v.skuFocus = false
              v.$nextTick(function () {
                v.skuFocus = true
              })
            }
          } else if (response.data.code === 552000) {
            uni.showToast({
              title: '上架单创建失败,上架数量不能超过待上架数量且上架数量不能小于1',
              icon: 'none',
              duration: 3000
            })
          } else if (response.data.code === 554137) {
            uni.showToast({
              title: '不良品库位只能上架到不良品库位',
              icon: 'none',
              duration: 3000
            })
          }
        })
    },
    blurSku() {
      this.isHandBlur && this.confirmSku('blur')
    },
    confirmSku: debounce(function () {
      let v = this
      v.isHandBlur = false
      if (v.skuNum === '') {
        v.isHandBlur = true
        return false
      }
      v.newCargospaceObj = null;
      let typeValue = v.typeValue === '4' ? null : v.typeValue;
      const obj = {
        url: api.get_receiptCheckDetailShelveQuery,
        data: {
          sku: v.skuNum,
          receiptType: typeValue,
          warehouseId: getStorage('newErpWarehouse').warehouseId
        }
      }
      uni.showLoading({
        title: '数据加载中'
      })
      v.goodsArr = []
      v.current = 0
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas
            if (data && data.length > 0) {
              v.openSound('001')
              v.mergeListFn(data)
              v.getRecommendStorage(data[0].goodsSku, data[0].qcResult)
                .then(result => {
                  // console.log('result:', result)
                  if (result.length > 0) { // 匹配SKU插入数据
                    result.forEach((m, t) => {
                      if (m.locationSkuInventorys) {
                        m.locationSkuInventorys.forEach((n, i) => {
                          if (n.goodsSku === data[0].goodsSku) {
                            m.skuData = n // 把匹配的数据存入一个KEY
                          }
                        })
                      }
                    });
                    data.forEach(n => {
                      n.recommendArr = result
                    })
                    // console.log('data:1', data)
                    // data[0].recommendArr = result
                    v.$nextTick(function () {
                      v.goodsArr = data
                      v.quantity = v.goodsArr[v.current].waitShelveNumber - v.goodsArr[v.current].shelveNumber
                      uni.hideLoading()
                    })
                  } else {
                    data.forEach(n => {
                      n.recommendArr = result
                    })
                    // console.log('data:', data)
                    v.$nextTick(function () {
                      v.goodsArr = data
                      v.quantity = v.goodsArr[v.current].waitShelveNumber - v.goodsArr[v.current].shelveNumber;
                      uni.hideLoading()
                    })
                  }
                  // console.log('-----------')
                  v.skuFocus = false;
                  v.cargospaceFocus = false;
                  setTimeout(function () {
                    v.cargospaceFocus = true
                    v.$nextTick(() => {
                      v.isHandBlur = true
                    })
                    // const dome = v.$refs.cargospaceRefs.$el.querySelector('.uni-input-input')
                    // dome.setAttribute('readonly', true)
                    // setTimeout(() => {
                    //   dome.removeAttribute('readonly')
                    // }, 50)
                  }, 1000)
                  // v.confirmCargospace()
                  // console.log('goodsArr:', v.goodsArr)
                })
              //v.goodsArr = data
            } else {
              v.openSound('002')
              uni.hideLoading()
              uni.showToast({
                title: '没有查询到相关数据',
                icon: 'none',
                duration: 2000
              })
              v.isHandBlur = true
            }
            // console.log('----------:', response.data.datas)
          } else {
            v.openSound('002')
            uni.hideLoading()
            v.isHandBlur = true
          }
        }).catch(function () {
          v.isHandBlur = true
        })
    }, 50),
    turnLeft() {
      let v = this
      if (v.current === 0) {
        return false
      } else {
        v.current--
        if (!v.goodsArr[v.current].hasOwnProperty('recommendArr')) {
          let item = v.goodsArr[v.current]
          v.getRecommendStorage(item.goodsSku, item.qcResult)
            .then(result => {
              if (result.length > 0) {
                result.forEach((m, t) => {
                  if (m.locationSkuInventorys) {
                    m.locationSkuInventorys.forEach((n, i) => {
                      if (n.goodsSku === item.goodsSku) {
                        m.skuData = n
                      }
                    })
                  }
                })
                v.$set(v.goodsArr[v.current], 'recommendArr', result)
                v.quantity = v.goodsArr[v.current].waitShelveNumber
              }

            })
        } else {
          v.quantity = v.goodsArr[v.current].waitShelveNumber
        }
      }
    },
    turnRight() {
      let v = this
      if (v.current === v.goodsArr.length - 1) {
        return false
      } else {
        v.current++
        if (!v.goodsArr[v.current].hasOwnProperty('recommendArr')) {
          let item = v.goodsArr[v.current]
          v.getRecommendStorage(item.goodsSku, item.qcResult)
            .then(result => {
              v.$nextTick(() => {
                if (result.length > 0) {
                  result.forEach((m, t) => {
                    if (m.locationSkuInventorys) {
                      m.locationSkuInventorys.forEach((n, i) => {
                        if (n.goodsSku === item.goodsSku) {
                          m.skuData = n
                        }
                      })
                    }

                  })

                  v.$set(v.goodsArr[v.current], 'recommendArr', result)
                  v.quantity = v.goodsArr[v.current].waitShelveNumber

                }
              })
            })
        } else {
          v.quantity = v.goodsArr[v.current].waitShelveNumber
        }
      }
    }
  },
  onShow(e) {
    if (this.store.state.choseOnShelf) {
      // 从选择页面返回
      this.mergeList = this.store.state.choseOnShelf.filter(i => {
        return i.children.some(j => j.checked)
      });
      // 更新数量
      this.shelveNumberAll = 0;
      this.waitShelveNumberAll = 0;
      this.mergeList.forEach(i => {
        i.children.forEach(j => {
          if (j.checked) {
            this.shelveNumberAll = this.shelveNumberAll + j.shelveNumber;
            this.waitShelveNumberAll = this.waitShelveNumberAll + j.waitShelveNumber;
          }
        })
      })
    }
  },
  onLoad(option) {
    let v = this;
    if (option && option.openType === '0') {
      // 初始化
      this.store.commit('choseOnShelf', null);
    }
    let loadStoreWarehouse = getStorage('newErpWarehouse')
    v.warehouseName = loadStoreWarehouse.warehouseName
    uni.setNavigationBarTitle({
      title: `上架(${v.warehouseName})`
    })
  }
}
</script>

<style scoped>
.receipt-no-header {
  position: relative;
}

.type-box {
  border-bottom: 1px solid #dddddd;
  padding: 5px 10px;
}

.merge-header {
  font-weight: bold;
  padding: 5px 10px;
  color: #2DABF6;
}

.type-box .text {
  font-size: 26upx;
  font-weight: bold;
}

.select-type {
  width: 100rpx;
  float: right;
  text-align: center;
  padding: 6upx 20upx;
  border: 1px solid rgba(0, 0, 0, .12);
  background-color: #f6f6f6;
  border-radius: 8upx;
}
</style>
