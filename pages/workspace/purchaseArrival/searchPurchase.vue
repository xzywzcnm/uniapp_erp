<template>
  <view :class="wrap">
    <view class="normalPadding">
      <view>
        <view class="uni-form-item uni-column">
          <view class="title">关键字</view>
          <input class="uni-input"  focus v-model.trim="searchKeyName" placeholder="请输入采购单号、跟踪号、供应商名称" />
        </view>
      </view>
      <view class="normal-margin-top">
        <view class="uni-form-item uni-column">
          <view class="title">采购状态</view>
          <view class="uni-list">
            <view class="uni-list-cell">
              <view class="uni-list-cell-left">
                当前选择
              </view>
              <view class="uni-list-cell-db">
                <picker @change="bindPickerChange" :value="index" :range="array">
                  <view class="uni-input">{{array[index]}}</view>
                </picker>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="normal-margin-top">
        <view class="uni-form-item uni-column">
          <view class="title">采购日期</view>
          <view class="row no-gutters">
            <view class="col col-5">
              <picker mode="date" :value="date" :start="startDate" :end="endDate" @change="bindDateChange">
                <view class="uni-input">{{date}}</view>
              </picker>
            </view>
            <view class="col col-1">
              <view class="d-flex justify-content-center align-items-center jg">
                -
              </view>
            </view>
            <view class="col col-5">
              <picker mode="date" :value="lastDate" :start="startDate" :end="endDate" @change="bindLastDateChange">
                <view class="uni-input">{{lastDate}}</view>
              </picker>
            </view>
          </view>
        </view>
      </view>
      <view class="normal-margin-top">
        <view class="uni-form-item uni-column">
          <view class="title">结算方式</view>
          <view class="uni-list">
            <view class="uni-list-cell">
              <view class="uni-list-cell-left">
                当前选择
              </view>
              <view class="uni-list-cell-db">
                <picker @change="bindCleaningPickerChange" :value="cleanIndex" :range="cleaningArray">
                  <view class="uni-input">{{cleaningArray[cleanIndex]}}</view>
                </picker>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="bottomBit">
      <view class="d-flex justify-content-center align-tiems: center">
        <button type="default" class="green" size="mini" @click="search">
          <text class="color-fff">查询</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
const prefixCls = 'tongtool-workspace-purchase'
export default {
 name: "searchPurchase",
  data () {
    return {
      searchKeyName: '',
      date: '起始日期',
      lastDate: '结束日期',
      array: ['全部','等待到货', '部分到货等待剩余'],
      index: 0,
      cleanIndex: 0,
      cleaningArray: ['全部', '货到付款', '款到发货', '快递代收', '定期结算']
    }
  },
  computed: {
    wrap () {
      return `${prefixCls}`
    },
    startDate() {
      return this.getDate('start');
    },
    endDate() {
      return this.getDate('end');
    }
  },
  methods: {
    search () {
      let v = this
      let index = ''

      let indexStr = v.index + ''
      if (indexStr === '0') {
        index = ''
      } else if (indexStr === '1') {
        index = '0'
      } else if (indexStr === '2') {
        index = '1'
      }
      let date = ''
      let lastDate = ''
      if (v.date === '起始日期') {
        date = ''
      } else {
        date = v.date
      }
      if (v.lastDate === '结束日期') {
        lastDate = ''
      } else {
        lastDate = v.lastDate
      }
      let cleanIndex = ''
      let cleanIndexStr = v.cleanIndex + ''
      if (cleanIndexStr === '3') {
        cleanIndex = 4
      } else if (cleanIndexStr === '4') {
        cleanIndex = 5
      } else if (cleanIndexStr === '0') {
        cleanIndex = ''
      } else {
        cleanIndex = v.cleanIndex
      }
      uni.redirectTo({
        url: '/pages/workspace/purchaseArrival/purchaseArrival' + '?type=' + '1' + '&searchKey=' + v.searchKeyName + '&orderStatus=' + index + '&purchaseDateFrom=' + date + '&purchaseDateTo=' + lastDate + '&clearingForm=' + cleanIndex
      })
    },
    bindDateChange: function(e) {
      this.date = e.target.value
    },
    bindLastDateChange: function(e) {
      this.lastDate = e.target.value
    },
    bindPickerChange (e) {
      this.index = e.target.value
    },
    bindCleaningPickerChange (e) {
      this.cleanIndex = e.target.value
    },
    getDate(type) {
      const date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      if (type === 'start') {
        year = year - 60;
      } else if (type === 'end') {
        year = year + 2;
      }
      month = month > 9 ? month : '0' + month;;
      day = day > 9 ? day : '0' + day;
      return `${year}-${month}-${day}`;
    }
  }
}
</script>

<style scoped>
.uni-list {
  background-color: #FFFFFF;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.uni-list:after {
  position: absolute;
  z-index: 10;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1upx;
  content: '';
  -webkit-transform: scaleY(.5);
  transform: scaleY(.5);
  background-color: #c8c7cc;
}
.uni-form-item{
  display:flex;
  width:100%;
  padding:10upx 0;
}
.uni-form-item .title{
  padding:10upx 25upx;
  font-size: 28upx;
}
.uni-column {
  flex-direction: column;
}
.uni-label {
  width: 210upx;
  word-wrap: break-word;
  word-break: break-all;
  text-indent:20upx;
}
.uni-list-cell {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.uni-list-cell-hover {
  background-color: #eee;
}
.uni-list-cell-pd {
  padding: 22upx 30upx;
}
.uni-list-cell-left {
  font-size:28upx;
  padding: 0 30upx;
}
.uni-list-cell-db,
.uni-list-cell-right {
  flex: 1;
}
.uni-list-cell:after {
  position: absolute;
  z-index: 3;
  right: 0;
  bottom: 0;
  left: 30upx;
  height: 1upx;
  content: '';
  -webkit-transform: scaleY(.5);
  transform: scaleY(.5);
  background-color: #c8c7cc;
}
</style>
