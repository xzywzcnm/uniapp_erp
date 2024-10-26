<template>
  <div :class="classes">
    <slot></slot>
  </div>
</template>
<style scoped lang="less">
  @import '../../style/components/switchButton/index.less';
</style>
<script>
  import { oneOf, findComponentsDownward } from '../../utils/assist'
  const prefixCls = 'seven-btn-group'
  export default {
    name: 'switchButton',
    data () {
      return {
        curValue: this.value,
        clickStatus: false
      }
    },
    props: {
      value: {
        type: [String, Object],
        default: '1'
      },
      long: {
        type: Boolean,
        default: false
      },
      size: {
        validator (value) {
          return oneOf(value, ['small', 'large', 'default'])
        },
        default () {
          return 'default'
        }
      },
      shape: {
        validator (value) {
          return oneOf(value, ['circle', 'circle-outline'])
        }
      },
      vertical: {
        type: Boolean,
        default: false
      },
      groupType: {
        type: String,
        default: 'primary'
      }
    },
    computed: {
      classes () {
        return `${prefixCls} ${this.long ? prefixCls + '-long' : ''} ${!!this.size ? prefixCls + this.size : ''} ${!!this.shape ? prefixCls + this.shape : ''} ${this.vertical  ? prefixCls + '-vertical' : ''}`
      }
    },
    watch: {
      curValue (n, o) {
        console.log('curValue:')
        console.log(n)
        this.$emit('input', n)
        this.updateValue()
      },
      clickStatus (n, o) {
        if (n) {
          console.log(this.curValue)
          this.$emit('on-change', this.curValue)
          this.clickStatus = false
        }
      }
    },
    mounted () {
      this.curValue = this.value
      this.updateValue()
    },
    updated () {
      this.curValue = this.value
    },
    methods: {
      updateValue () {
        this.childrens = findComponentsDownward(this, 'sevenButton')
        if (this.childrens) {
          this.childrens.forEach(child => {
            child.sbStatus = this.curValue === child.name
          })
        }
      }
    }
  };
</script>
