<template>
    <view>
      <uni-section title="修改库存信息权限" type="line"></uni-section>
      <view class="uni-list">
        <radio-group @change="radioChange">
					<label class="uni-list-cell uni-list-cell-pd">
						
					</label>
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
        setStorage
    } from '@/utils'
    export default {
        name: "editAppSetting",
        mixins: [Mixin],
        components: {
        },
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
                    name: '普通扫描',
                    checked: false
                },
                {
                    value: '2',
                    name: '逐个扫描',
                    checked: false
                }],
								authList: [{
									value: '0',
									name: '收货数量',
									checked: true
								},
								{
									value: '1',
									name: '不良品数量',
									checked: true
								},
								{
									value: '2',
									name: '待归库数量',
									checked: true
								},
								{
									value: '3',
									name: '异常拣货数量',
									checked: true
								},
								{
									value: '4',
									name: '分配数量',
									checked: true
								},
								{
									value: '5',
									name: '冻结数量',
									checked: true
								},
								{
									value: '6',
									name: '可用数量',
									checked: true
								},
								{
									value: '7',
									name: '安全库存',
									checked: true
								}],
								
            };
        },
        created() {

        },
        onShow () {

        },
        onLoad (option) {
            this.settingsConfigObj = JSON.parse(option.erpConfig);
            if (this.settingsConfigObj.scanMode === '1') {
                this.items[0].checked = true
            } else {
                this.items[1].checked = true
            }
        },
        watch: {},
        methods: {
            radioChange (e) {
                // change 事件
                let v = this;
                v.settingsConfigObj.scanMode = e.detail.value;
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
