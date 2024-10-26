<template>
  <view :class="wrap">
    <view class="scanWrap">
      <view class="d-flex justify-content-start align-items-center">
        <view class="scan" @click="scanPackage">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="packageNum" type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input scanInput" @confirm="getPackageList" :focus="packageFocus" placeholder="识别号:LAPA包裹号" />
      </view>
      <view class="d-flex justify-content-start align-items-center normal-margin-top">
        <view class="scan" @click="scanCode">
          <view class="icon iconfont scanIcon">&#xe612;</view>
          <view class="scanText">扫一扫</view>
        </view>
        <input v-model.trim="skuNum" type="text" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" class="uni-input scanInput" @confirm="scanSku" :focus="skuFocus" placeholder="SKU/SKU识别名" />
      </view>
    </view>
    <view class="packageList">
      <view class="packageItem" v-for="(item, itemIndex) in list" :key="item.packageDetailId">
        <view class="d-flex justify-content-center">
          <view class="imgItem">
            <image style="" :src="item.imageGroupId" mode="scaleToFill center"></image>
          </view>
        </view>
        <view class="d-flex justify-content-start item">
          <text class="itemTitle">SKU：</text>
          <text>{{item.goodsSku}}</text>
        </view>
        <view class="d-flex justify-content-start item">
          <text class="itemTitle">货品：</text>
          <text v-if="item.productName">{{item.productName}}</text>
        </view>
        <view class="d-flex justify-content-start item">
          <text class="itemTitle">备注：</text>
          <text v-if="item.productRemark">{{item.productRemark}}</text>
        </view>
        <view class="d-flex justify-content-start item">
          <text class="itemTitle">应发数量：</text>
          <text>{{item.quantity}}</text>

        </view>
        <view class="d-flex justify-content-start align-items-center item">
          <text class="itemTitle">已扫描数量：</text>
          <input type="number" v-model="item.scanQuantity" :class="{themeInput:theme.inputStyle ==='DarkBlue'}" :focus="focusObj[item.goodsSku]" @input="changeScanNum(item, itemIndex)" class="scanNumInput">
          <text class="errorText" v-if="item.quantity - Number(item.scanQuantity) > 0">缺{{item.quantity - item.scanQuantity}}个</text>
          <text class="successText icon iconfont" v-if="item.quantity === Number(item.scanQuantity)">
            &#xe601;
          </text>
          <view class="checkboxItem">
            <checkbox :checked="item.neglect" @click="setNeglect(item, itemIndex)" />忽略
          </view>
        </view>
      </view>
    </view>
    <view class="bottomBit d-flex justify-content-center align-items-center">
      <button type="primary" size="mini" @click.stop="verifyPackage">标记包裹校验正确</button>
    </view>
  </view>
</template>

<script>
  import Mixin from '@/mixin/common_mixin'
  import api from '@/api/api'
  const prefixCls = 'tongtool-workspace-packageVerify'
  let innerAudioContext
  export default {
    mixins: [ Mixin ],
    data () {
      return {
        packageFocus: true,
        skuFocus: false,
        packageNum: '',
        skuNum: '',
        list: [],
        focusObj: {}
      }
    },
    computed: {
      wrap () {
        return `${prefixCls}`
      }
    },
    methods: {
      scanPackage () {
        let v = this
        uni.scanCode({
          success: function (res) {
            v.packageNum = res.result
            v.getPackageList()
          },
          fail: function (error) {
            console.log('error:', error)
          }
        })
      },
      scanCode () {
        let v = this
        uni.scanCode({
          success: function (res) {
            v.skuNum = res.result
            v.packageFocus = false
            v.$nextTick(function(){
              v.skuFocus = true
              v.scanSku()
            })
          },
          fail: function (error) {
            console.log('error:', error)
          }
        })
      },
      scanSku () {
        let v = this
        if (v.list.length > 0) {
          let index = v.list.findIndex(n => {
            let skuLabel = [];
            if (n.skuLabel) {
              skuLabel = n.skuLabel.split('\n');
            }
            return (skuLabel.length && skuLabel.includes(v.skuNum)) || (n.skuLabel === v.skuNum)
          })
          if (index >= 0) {
            if (v.list[index].scanQuantity < v.list[index].quantity) {
              v.skuNum = ''
              v.skuFocus = false
              v.$nextTick(function () {
                console.log('~~~~')
                v.focusObj[v.list[index].goodsSku] = true
                v.list[index].scanQuantity++
                setTimeout(function () {
                  v.focusObj[v.list[index].goodsSku] = false
                  v.$nextTick(function(){
                    v.skuFocus = true
                  })
                }, 1000)
              })
            } else if (v.list[index].scanQuantity === v.list[index].quantity) {
              v.skuNum = ''
              uni.showToast({
                icon: 'none',
                title: '该SKU扫描数量已经等于应发数量'
              })
              return false
            }
          } else {
            uni.showToast({
              icon: 'none',
              title: '包裹中不存在该SKU'
            })
            return false
          }
        } else if (v.packageNum === '') {
          uni.showToast({
            icon: 'none',
            title: '请先扫描包裹'
          })
          v.skuFocus = false
          setTimeout(function () {
            v.packageFocus = true
          }, 1000)
          return false
        }
      },
      changeScanNum (item, itemIndex) { // 扫描数量限制
        let v = this
        if (Number(item.scanQuantity) > item.quantity) {
          v.$nextTick(function () {
            v.$set(v.list[itemIndex], 'scanQuantity', item.quantity)
          })
        }
      },
      setNeglect (item, itemIndex) { // 设置忽略
        console.log('item:', item)
        let v = this
        v.$set(v.list[itemIndex], 'neglect', !item.neglect)
        console.log('list:', v.list)
      },
      authPackage () {
        let v = this
        return new Promise(resolve => {
          let status = true
          v.list.forEach(n => {
            if (Number(n.scanQuantity) !== n.quantity && !n.neglect) {
              status = false
            }
          })
          resolve(status)
        })
      },
      verifyPackage () {
        let v = this
        if (v.packageNum === '' && v.list.length === 0) {
          uni.showToast({
            icon: 'none',
            title: '请扫描包裹'
          })
          return false
        }
        v.authPackage()
          .then(result => {
            if (result) {
              const obj = {
                url: api.set_updatePackageStatus,
                data: {
                  isChecked: 'Y',
                  packageId: v.packageNum
                }
              }
              v.ajaxData(obj)
                .then(response => {
                  if (response.data.code === 0) {
                    uni.showToast({
                      icon: 'none',
                      title: '包裹校验成功'
                    })
                    setTimeout(function () {
                      v.resetPackage()
                    }, 1000)
                  }
                })
            } else {
              uni.showToast({
                icon: 'none',
                title: '包裹校验不成功'
              })
            }
          })
      },
      startMusic () {
        innerAudioContext = uni.createInnerAudioContext();
        innerAudioContext.autoplay = true;
        innerAudioContext.src = '/static/failure.wav';
        innerAudioContext.onPlay(() => {
          console.log('开始播放');
        });
        innerAudioContext.onEnded((res) => {
          innerAudioContext.destroy(); // 销毁实例(不销毁实例会导致内存溢出后没有声音)
        });
        innerAudioContext.onError((res) => {
          console.log(res.errMsg);
          console.log(res.errCode);
          innerAudioContext.destroy(); // 销毁实例(不销毁实例会导致内存溢出后没有声音)
        });
      },
      stopMusic () {
        innerAudioContext.destroy()
      },
      resetPackage () {
        let v = this
        v.list = []
        v.skuFocus = false
        v.skuNum = ''
        v.packageNum = ''
        v.$nextTick(function () {
          v.packageFocus = true
        })
      },
      getPackageList () {
        let v = this
        var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？↵\r\n]")
        console.log(pattern.test(v.packageNum))
        if (v.packageNum === '') {
          uni.showToast({
            icon: 'none',
            title: '包裹号不能为空'
          })
          v.packageNum = ''
          return false
        } else if (pattern.test(v.packageNum)) {
          uni.showToast({
            icon: 'none',
            title: '包裹号格式不正确'
          })
          v.packageNum = ''
          return false
         }
        if (innerAudioContext) {
          console.log('12321')
          v.stopMusic()
        }
        const obj = {
          url: api.get_packageList + '?packageId=' + v.packageNum,
          type: 'get'
        }
        console.log('OBK:', JSON.stringify(obj))
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              v.packageFocus = false
              v.$nextTick(function () {
                v.skuFocus = true
              })
              let data = response.data.datas
              data.forEach(n => {
                n.neglect = false
                v.focusObj[n.goodsSku] = false
                if (!n.hasOwnProperty('scanQuantity')) {
                  n.scanQuantity = 0
                }
              })
              v.list = data
            } else if (response.data.code === 400000) {
              v.packageNum = ''
              v.packageFocus = false
              v.skuFocus = false
              v.$nextTick(function () {
                v.packageFocus = true
              })
              uni.showToast({
                icon: 'none',
                title: response.data.message
              })
              v.startMusic()
            }
          })
      }
    }
  }
</script>

<style>
</style>
