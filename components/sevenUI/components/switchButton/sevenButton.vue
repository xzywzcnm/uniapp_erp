<template>
  <view
      :class="classes"
      :disabled="disabled"
      @click.exact="handleClickLink($event, false)"
      @click.ctrl="handleClickLink($event, true)"
      @click.meta="handleClickLink($event, true)">
      <span v-if="showSlot" ref="slot"><slot></slot></span>
  </view>
</template>
<style scoped lang="less">
  @import '../../style/components/switchButton/index.less';
</style>
<script>
  import { oneOf, findComponentUpward } from '../../utils/assist'
  const prefixCls = 'seven-btn'
  export default {
    name: 'sevenButton',
    data () {
      return {
        showSlot: true,
        sbStatus: false,
        sbGroupType: this.type,
        parentLong: false
      }
    },
    watch: {
      sbStatus: {
        handler (n, o) {
          let parent = findComponentUpward(this, 'switchButton')
          if (parent) {
            this.parentLong = parent.long
            if (!n) {
              this.sbGroupType = this.type
            } else {
              this.sbGroupType = parent.groupType
            }
          }
        },
        immediate: true
      }
    },
    computed: {
      classes () {
        let v = this
        return `
          ${prefixCls} ${prefixCls}-${v.sbGroupType} ${this.long || this.parentLong ? prefixCls + '-long' : ''} ${!!this.shape ?  prefixCls + '-' + this.shape : ''} ${ this.size !== 'default' ? prefixCls + '-' + this.size : ''} ${ this.loading !== null && this.loading ? prefixCls + '-loading' : ''} ${this.ghost ? prefixCls + '-ghost' : ''} ${this.disabled ? prefixCls + '-disabled' : ''}
        `
      }
    },
    props: {
      name: {
        type: String,
        default: '1'
      },
      type: {
        validator (value) {
          return oneOf(value, ['default', 'primary', 'dashed', 'text', 'info', 'success', 'warning', 'error']);
        },
        default: 'default'
      },
      shape: {
        validator (value) {
          return oneOf(value, ['circle', 'circle-outline']);
        }
      },
      size: {
        validator (value) {
          return oneOf(value, ['small', 'large', 'default']);
        },
        default () {
          return 'default'
        }
      },
      loading: Boolean,
      disabled: Boolean,
      long: {
        type: Boolean,
        default: false
      },
      ghost: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      handleClickLink (event) {
        let parent = findComponentUpward(this, 'switchButton')
        console.log('parent:', parent)
        if (parent) {
          parent.curValue = this.name
          console.log(parent)
          parent.clickStatus = true
          this.sbGroupType = parent.groupType
        } else {
          this.$emit('click', event)
        }
      }
    }
  } 
</script>
