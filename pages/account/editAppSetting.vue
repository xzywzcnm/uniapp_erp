<template>
  <view>
    <uni-section title="修改ERP配置" type="line"></uni-section>
    <view class="uni-list">
      <checkbox-group @change="changeErpConfig">
        <label class="uni-list-cell uni-list-cell-pd" v-for="item in items" :key="item.value">
          <view>
            <checkbox :value="item.value" :checked="item.checked" :disabled="item.disabled" />
          </view>
          <view>{{item.name}}</view>
        </label>
      </checkbox-group>
    </view>
  </view>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/mixin/common_mixin';
import {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage
} from '@/utils'
export default {
  name: "editAppSetting",
  mixins: [Mixin],
  components: {
  },
  data () {
    return {
      current: 0,
      erpConfig: {
        newErp: false,
        oldErp: false
      },
      items: [{
        value: '1',
        name: '使用新ERP配置',
        disabled: false
      },
      {
        value: '2',
        name: '使用老ERP配置',
        disabled: true
      }]
    };
  },
  created () {

  },
  onShow () {
    // console.log(this.erpConfig)
  },
  onLoad (option) {
    this.erpConfig = JSON.parse(option.erpConfig);
    if (this.erpConfig.newErp) {
      this.items[0].checked = true
    }
    if (this.erpConfig.oldErp) {
      this.items[1].checked = true
    }
  },
  watch: {},
  methods: {
    changeErpConfig (e) {
      let v = this
      let arr = e.detail.value;
      let erpConfig = {
        newErp: false,
        oldErp: false
      }
      if (arr.includes('1')) {
        erpConfig.newErp = true
      } else {
        erpConfig.newErp = false
      }
      if (arr.includes('2')) {
        erpConfig.oldErp = true
      } else {
        erpConfig.oldErp = false
      }
      setStorage('erpConfig', erpConfig)
      const obj = {
        url: api.set_erpConfig,
        data: erpConfig
      }
      v.ajaxData(obj)
        .then(response => {
          if (response.data.code === 0) {
            console.log('ok')
          }
        })
    }
  }
}
</script>

<style>
.uni-list-cell {
  justify-content: flex-start;
}
</style>
