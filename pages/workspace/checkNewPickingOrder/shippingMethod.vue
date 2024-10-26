<template>
  <div class="shipping-method">
    <u-popup v-model="shippingDialog.isShow" mode="center" border-radius="6" :mask-close-able="false" :closeable="false" width="80%" height="50%">
      <view class="shipping__flex">
        <view style="margin-bottom: 40px;">
          <view>提示</view>
          <view>当前邮寄方式已无待拣拣货单</view>
        </view>
        <view>
          <view>
            <u-button type="success" size="medium" :custom-style="customStyle" @click="goonGetorder(1)">继续领取拣货单</u-button>
          </view>
          <view>
            <u-button type="primary" size="medium" :custom-style="customStyle" @click="goonGetorder(2)">返回重新设置邮寄方式</u-button>
          </view>
        </view>
      </view>
    </u-popup>
  </div>
</template>

<script>
export default {
  name: 'shippingMethod',
  data () {
    return {
      show: true,
      customStyle: {
        marginBottom: '20px',
        width: '80%'
      }
    };
  },
  props: {
    shippingDialog: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  watch: {},
  methods: {
    // 1:继续领取拣货单/2:返回重新设置邮寄方式
    goonGetorder (type) {
      this.shippingDialog.isShow = false;
      this.$emit('shippingMethodOpen', type);
    },
  }
};
</script>

<style scoped>
.shipping-method {
  text-align: center;
}
.shipping__flex {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
