<template >
  <uni-list>
    <uni-list-item title="绑定异常处理库位" @click="gotoPage('/pages/workspace/abnormal/binding')"></uni-list-item>
    <uni-list-item title="补拣" @click="gotoPage('/pages/workspace/abnormal/pickUp')"></uni-list-item>
    <uni-list-item title="录入补拣结果" @click="enterThePickingResult"></uni-list-item>
  </uni-list>
</template >

<script >
import api from '@/api/api';
import Mixin from '@/mixin/common_mixin'
import { getStorage } from '@/utils';
export default {
  name: 'abnormal',
  mixins: [Mixin],
  data () {
    return {};
  },
  created () {

  },
  props: {},
  watch: {},
  methods: {
    enterThePickingResult () {
      /**
       * @Description: 录入补拣结果
       * @author gan
       * @date: 2020/9/9 17:27
      */
      let v = this;
      const obj = {
        url: api.querySelfRunningSupplementPicking + getStorage('newErpWarehouse').warehouseId,
        type: 'GET'
      }
      v.ajaxData(obj).then(response=>{
          if (response.data.code === 0 && response.data.datas) {
              v.store.commit('supplementPickingId',response.data.datas.supplementPickingId)
              v.gotoPage('/pages/workspace/abnormal/enterResult')
          } else if (response.data.code === 116320) {
            v.showToast('当前用户没有唯一执行中的补件单')
          } else {
            v.showToast('操作失败')
          }
      })

    },
  }
};
</script >

<style scoped >
  .btn-box {
    margin-top: 50px;
  }
.btn {
   width: 600rpx;
  padding: 15px 0;
  text-align: center;
  border-radius: 5px;
  background-color: #1989FA;
  border: 1px solid #1989FA;
  color: #ffffff;
  margin: 0 auto 20px auto;
}
  .btn:active {
    background-color: #177CE1;
  }
</style >
