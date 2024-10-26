<template>
  <uni-indexed-list :options="list"
                    @click="bindClick"/>
</template>
<script>
    import api from '@/api/api';
    import Mixin from '@/mixin/common_mixin';
    import pinyinUniCode from '@/static/pinyin/'
    import {
        setStorage,
        getStorage,
        removeStorage
    } from '@/utils'
    export default {
        name: "choseShip",
        mixins: [Mixin],
        data() {
            return {
                list: [],
                listAZ: {} // 存已有字母
            };
        },
        components: {},
        created() {

        },
        onShow() {

        },
        onLoad (option) {
            let v = this;
            this.store.commit('choseShip',null)
            v.getShippingMethodList(getStorage('newErpWarehouse').warehouseId).then(data=>{
                if(data) {
                    let datas = data.map(i=> {
                        return {
                            name:i.carrierName + '>>' + i.carrierShippingMethodName,
                            value: [i.carrierId,i.shippingMethodId]
                        }
                    });
                    datas.forEach(i=>{
                        v.convertPinyin(i);
                    });
                    v.list = v.list.sort(v.compare('letter'));
                }
            });// 获取邮寄方式
        },
        props: {},
        watch: {},
        methods: {
            bindClick(value) {
                let data = value.item;
                this.store.commit('choseShip',data);
                uni.navigateBack('/pages/workspace/checkNewPickingOrder')
            },
            fixData(text,value) {
                // 组装数据
                let v = this;
                if (v.listAZ[text]) {
                    // 如果已存在
                    v.list.forEach(i => {
                        if (i.letter === text) {
                            i.data.push(value)
                        }
                    })
                } else {
                    v.listAZ[text] = true;
                    v.list.push({
                        letter: text,
                        data: [value]
                    })
                }
            },
            convertPinyin(value) {
                let v = this;
                let text = value.name[0].toLocaleUpperCase(); // 首字大写
                let reg = new RegExp('[A-Z]');
                if (reg.test(text[0])) {
                    v.fixData(text, value);
                } else {
                    let AB = 'Z'; // 默认在最后;
                    for (let name in pinyinUniCode) {
                        if (pinyinUniCode[name].indexOf(text) != -1) {
                            AB = name[0].toLocaleUpperCase()
                        }
                    }
                    v.fixData(AB, value);
                }
            },
            compare (prop) {
                // 排序
                return function (obj1, obj2) {
                    let val1 = obj1[prop];
                    let val2 = obj2[prop];
                    if (val1 < val2) {
                        return -1;
                    } else if (val1 > val2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
</script>

<style scoped>

</style>
