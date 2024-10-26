<template >
  <view >
    <uni-section title="修改APP输入框样式设置" type="line" ></uni-section >
    <view class="uni-list" >
      <radio-group @change="radioChange" >
        <label class="uni-list-cell uni-list-cell-pd" v-for="(item, index) in themeList" :key="item.value" >
          <view >
            <radio :value="item.value" :checked="item.checked" />
          </view >
          <view >{{ item.name }}</view >
        </label >
      </radio-group >
    </view >
  </view >
</template >

<script >
import api from '@/api/api';
import Mixin from '@/mixin/common_mixin';
import {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage
} from '@/utils';

export default {
  name: 'editAppSetting',
  mixins: [Mixin],
  components: {},
  data () {
    return {
      current: 0,
      themeSetting: 'default'
    };
  },
  created () {

  },
  onShow () {
    // console.log(this.erpConfig)
  },
  onLoad (option) {
    this.themeList.forEach(i => {
      if (i.value === this.store.state.theme.inputStyle) {
        i.checked = true;
      } else {
        i.checked = false;
      }
    });
  },
  watch: {},
  methods: {
    radioChange (e) {
      let v = this;
      v.themeSetting = e.detail.value;
      let obj = {};
      if (getStorage('theme')) {
        obj = getStorage('theme');
      }
      obj.inputStyle = v.themeSetting;
      v.store.commit('theme', obj);
      setStorage('theme', obj);

    }
  }
};
</script >

<style >
.uni-list-cell {
  justify-content: flex-start
}
</style >
