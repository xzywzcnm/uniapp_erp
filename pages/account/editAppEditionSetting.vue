<template>
    <view>
      <uni-section title="修改APP版本设置" type="line"></uni-section>
      <view class="uni-list">
        <radio-group @change="radioChange">
          <label class="uni-list-cell uni-list-cell-pd" v-for="(item, index) in items" :key="item.value">
            <view>
              <radio :value="item.value" :checked="item.checked" />
            </view>
            <view>{{item.name}}</view>
          </label>
        </radio-group>
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
        components: {},
        data() {
            return {
                current: 0,
                settingsConfigObj: {
                    checkCargo: '1', // 是否校验库位 1 0
                    scanMode: '1', // 扫描模式 1普通扫描 2 逐个扫描
                    useBasket: '1', // 是否使用拣货篮 1 0
                    versionType: '1' // 版本 1 手机版 2 PDA
                },
                items: [{
                    value: '1',
                    name: '使用手机版',
                    checked: false
                },
                {
                    value: '2',
                    name: '使用PDA',
                    checked: false
                }]
            };
        },
        created() {

        },
        onShow () {
           // console.log(this.erpConfig)
        },
        onLoad (option) {
            this.settingsConfigObj = JSON.parse(option.erpConfig);
            if (this.settingsConfigObj.versionType === '1') {
                this.items[0].checked = true
            } else {
                this.items[1].checked = true
            }
        },
        watch: {},
        methods: {
            radioChange (e) {
                let v = this;
                v.settingsConfigObj.versionType = e.detail.value;
                setStorage('settingsConfigObj', v.settingsConfigObj);
                let obj = {
                    url: api.set_settingConfig,
                    data: v.settingsConfigObj
                };
                v.ajaxData(obj)
                    .then(response => {
                        console.log('r:', response)
                    })
            }
        }
    }
</script>

<style>
  .uni-list-cell {
    justify-content: flex-start
  }
</style>
