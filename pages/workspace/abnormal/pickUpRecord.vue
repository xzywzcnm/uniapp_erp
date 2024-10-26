<template >
  <view>
    <view v-if="list && list.length > 0">
      <view v-for="(item,index) in list" class="d-flex justify-content-between align-items-center pick-result" @click="gotoPick(item)">
        <view :key="index">
          <view class="title">{{item.supplementPickingNo}}</view>
          <view class="note">{{getDataToLocalTime(item.createdTime,'fulltime')}}</view>
        </view>
        <view class="d-flex align-content-center align-items-center">
          <span class="icon-text" :class="item.supplementPickingStatus === 0 ? '#333' : item.supplementPickingStatus === 4 ? 'green' : 'red' ">{{getPickingStatus(item.supplementPickingStatus)}}</span>
          <view class="icon iconfont arrow">&#xe636;</view>
        </view>
      </view>
    </view>
    <no-data v-else :text="'无数据'" class="mt10"></no-data>

  </view>
</template >

<script >
import api from '@/api/api';
import Mixin from '@/mixin/common_mixin';
import { getStorage } from '@/utils';
import noData from '../../../components/common/nodata';
export default {
  name: 'pickUpRecord',
  mixins: [Mixin],
  components: {
    noData
  },
  data () {
    return {
      list: []
    };
  },
  onShow () {
    this.getPickRcordList();
  },
  props: {},
  watch: {},
  methods: {
    getPickingStatus (type) {
      /**
       * @Description: 补拣状态
       * @author gan
       * @date: 2020/9/9 11:24
       * @params: type  补拣状态(0待补拣，1正在补，2补完成 3已处理(数量没完全一致的) 4pda已提交) ,
      */
      let arr = ['待处理','处理中','处理中','处理中','补拣完成']
      return arr[type]
    },
    getPickRcordList () {
      /**
       * @Description: 补拣记录
       * @author gan
       * @date: 2020/9/9 10:50
       * @params:
      */
      let v = this;
      const obj = {
        url: api.querySelfCurSupplementPicking + getStorage('newErpWarehouse').warehouseId,
        type: 'GET'
      }
      v.ajaxData(obj).then(response=>{
        if(response.data.code === 0) {
          v.list = response.data.datas;
        }
      })
    },
    gotoPick (item) {
      let v = this;
      if (item.supplementPickingStatus === 4) {
        v.showToast('补拣已完成');
        return
      }
      let supplementPickingId = item.supplementPickingId
      const obj = {
        url: api.startSupplementPicking,
        type: 'POST',
        data: {
          "supplementPickingId": supplementPickingId
        }
      }
      v.ajaxData(obj).then(response=>{
        if (response.data.code === 0) {
          this.store.commit('supplementPickingId',supplementPickingId)
          this.gotoPage('/pages/workspace/abnormal/myPickUpTask')
        } else if (response.data.code === 116317) {
          v.showToast('只能开启属于自己的补拣单且不能同时开启多个')
        } else {
          v.showToast('操作失败')
        }
      })

    }
  }
};
</script >

<style scoped >
  .pick-result:last-child{
    border-bottom: 1px solid #ddd;
  }
  .pick-result {
    background-color: #ffffff;
    border-top: 1px solid #ddd;
    padding: 0 5px;
  }
  .pick-result .arrow {
    font-size: 24px;
  }
  .pick-result .title {
    color: #333333;
    font-size: 16px;
  }
  .pick-result .note {
    color: #999999;
  }
  .icon-text {
    font-size: 12px;
  }
  .red {
    color: red;
  }
  .green {
    color: green;
  }
</style >
