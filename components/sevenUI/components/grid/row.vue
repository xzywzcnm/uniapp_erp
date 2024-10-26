<template>
  <view :class="classes">
    <slot></slot>
  </view>
</template>
<style scoped lang="less">
  @import '../../style/components/grid/grid.less';
</style>
<script>
  const prefixCls = 'seven-grid-row'
	export default {
    name: 'sevenRow',
		data() {
			return {
				
			}
		},
    computed: {
      classes () {
        return `${prefixCls} ${this.gutter ? prefixCls + '-gutter' : prefixCls + '-no-gutter'}`
        // return [
        //   `${prefixCls}`,
        //   this.gutter ? `${prefixCls}-gutter` : `${prefixCls}-no-gutter`
        // ]
      }
    },
    props: {
      gutter: Boolean
    }
	}
</script>
