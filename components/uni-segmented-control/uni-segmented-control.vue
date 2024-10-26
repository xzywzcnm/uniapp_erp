<template>
	<view :class="warpControl" :style="wrapStyle">
		<view 
      v-for="(item, index) in values"
      class="mu-tab"
      :key="index"
      :style="index === currentIndex ? activeStyle : wrapStyle"
      @click="onClick(index)"
    >
      <view class="mu-tab-wrapper">
        <view class="mu-ripple-wrapper"></view>
        {{item}}
      </view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'segmented-control',
		props: {
			current: {
				type: Number,
				default: 0
			},
			values: {
				type: Array,
				default () {
					return [];
				}
			},
			activeColor: {
				type: String,
				default: '#ff4081'
			},
      textColor: {
        type: String,
        default: 'rgba(0,0,0,.54)'
      },
      bgColor: {
        type: String,
        default: '#FAFAFA'
      },
			styleType: {
				type: String,
				default: 'button'
			},
      center: {
        type: Boolean,
        default: false
      },
      fullWidth: {
        type: Boolean,
        default: false
      },
      indicatorColor: {
        type: Boolean,
        default: true
      }
		},
		data() {
			return {
				currentIndex: this.current
			}
		},
		watch: {
			current(val) {
				if (val !== this.currentIndex) {
					this.currentIndex = val;
				}
			}
		},
		computed: {
      warpControl () {
        if (this.fullWidth) {
          return 'mu-tabs mu-tabs-full-width'
        } else {
          return 'mu-tabs'
        }
      },
			wrapStyle() {
        return `
          color: ${this.textColor};
          background-color: ${this.bgColor}
        `
				/* let styleString = '';
				switch (this.styleType) {
					case 'text':
						styleString = `border:0;`;
						break;
					default:
						styleString = `border-color: ${this.activeColor}`;
						break;
				}
				return styleString; */
			},
			itemStyle() {
				let styleString = '';
				switch (this.styleType) {
					case 'text':
						styleString = `color:#000;border-left:0;`;
						break;
					default:
						styleString = `color:${this.activeColor};border-color:${this.activeColor};`;
						break;
				}
				return styleString;
			},
			activeStyle() {
				let styleString = `color:${this.activeColor};border-left:0;border-bottom:solid; border-width: 2px`;
// 				switch (this.styleType) {
// 					case 'text':
// 						styleString = `color:${this.activeColor};border-left:0;border-bottom-style:solid;`;
// 						break;
// 					default:
// 						styleString = `color:#fff;border-color:${this.activeColor};background-color:${this.activeColor}`;
// 						break;
// 				}
				return styleString;
			}
		},
		methods: {
			onClick(index) {
				if (this.currentIndex !== index) {
					this.currentIndex = index;
					this.$emit('clickItem', index);
				}
			}
		},
	}
</script>

<style>
  .mu-tabs {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    background-color: #2196f3;
    color: hsla(0,0%,100%,.7);
    position: relative;
    z-index: 100;
    width: 100%;
    overflow: hidden;
  }
  .mu-tab {
    font-size: 14px;
    min-width: 72px;
    max-width: 264px;
    background: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    text-decoration: none;
    border: none;
    outline: none;
    color: inherit;
    position: relative;
    line-height: normal;
    -webkit-transition: all .45s cubic-bezier(.445,.05,.55,.95);
    transition: all .45s cubic-bezier(.445,.05,.55,.95);
    cursor: pointer;
  }
  .mu-tab-wrapper {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    min-height: 48px;
    padding: 0 12px;
  }
  .mu-circle-ripple, .mu-ripple-wrapper {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  
	.segmented-control {
		display: flex;
		flex-direction: row;
		justify-content: center;
		width: 75%;
		font-size: 28upx;
		border-radius: 10upx;
		box-sizing: border-box;
		margin: 0 auto;
		overflow: hidden;
	}

	.segmented-control.button {
		border: 2upx solid;
	}

	.segmented-control.text {
		border: 0;
		border-radius: 0upx;
	}


	.segmented-control-item {
		flex: 1;
		text-align: left;
		line-height: 60upx;
		box-sizing: border-box;
	}

	.segmented-control-item.button {
		border-left: 1upx solid;
	}

	.segmented-control-item.text {
		border-left: 0;
	}

	.segmented-control-item:first-child {
		border-left-width: 0;
	}
</style>
