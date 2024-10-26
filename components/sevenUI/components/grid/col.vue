<template>
	<view :class="classes">
    <slot></slot>
	</view>
</template>
<style scoped lang="less">
  @import '../../style/components/grid/grid.less';
</style>
<script>
  const prefixCls = 'seven-grid-col'
	export default {
    name: 'sevenCol',
		data () {
			return {
				
			};
		},
    computed: {
      classes () {
        let span = this.span
        return `${prefixCls} ${prefixCls}-${span}`
        // return [
        //   `${prefixCls}`,
        //   `${prefixCls}-${span}`
        // ]
      }
    },
    props: {
      span: {
        type: [String, Number],
        default: ''
      }
    }
	}
</script>

