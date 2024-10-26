<template>
	<view :class="wrap">
		<view class="row statisticsTab" @click.stop="activeName = 0">
      <view class="col col-6">
        <view class="d-flex justify-content-center align-items-center statisticsItem" :class="{'active': activeName === 0}">
          到货入库
        </view>
      </view>
      <view class="col col-6" @click.stop="activeName = 1">
        <view class="d-flex justify-content-center align-items-center statisticsItem" :class="{'active': activeName === 1}">
          库存移动
        </view>
      </view>
    </view>
    <view class="tableContainer">
      <view class="row header">
        <view class="col col-6">
          <view class="d-flex justify-content-center align-items-center tcItem">
            员工名称
          </view>
        </view>
        <view class="col col-6">
          <view class="d-flex justify-content-center align-items-center tcItem">
            数量
          </view>
        </view>
      </view>
      <view class="row listItem" v-for="(item, itemIndex) in list" :key="itemIndex">
        <view class="col col-6">
          <view class="d-flex justify-content-center align-items-center tcItem">
            {{item.operatorName}}
          </view>
        </view>
        <view class="col col-6">
          <view class="d-flex justify-content-center align-items-center tcItem">
            {{item.operatorNum}}
          </view>
        </view>
      </view>
    </view>
	</view>
</template>

<script>
  import Mixin from '@/mixin/common_mixin'
  import api from '@/api/api'
  const prefixCls = 'tongtool-home-statistics'
	export default {
    mixins: [ Mixin ],
		data() {
			return {
        activeName: 0,
        list: []
			}
		},
    computed: {
      wrap () {
        return `${prefixCls}`
      }
    },
    watch: {
      activeName (n, o) {
        let v = this
        console.log('n:', n)
        if (n  !== o) {
          v.list = []
          let type = '01'
          if (n === 1) {
            type = '02'
          }
          v.getList(type)
        }
      }
    },
		methods: {
			getList (type) {
        let v = this
        let fromDate;
        let toDate;
        let today = new Date()
        if (!type) {
          toDate = v.getDateTime(today.getTime() + 24 * 60 * 60 *1000)
          fromDate = v.getDateTime(today)
        } else {
          toDate = v.getDateTime(today.getTime() + 24 * 60 * 60 *1000)
          let day = today.getDate() - 1
          let mDate = new Date(today.getTime() - day * 24 * 60 * 60 *1000)
          fromDate = v.getDateTime(mDate)
        }
        v.list = []
        const obj = {
          url: api.get_statisticsList,
          data: {
						fromDate: fromDate,
						toDate:  toDate,
            bussType: type
					}
        }
        uni.showLoading({
          title: '数据加载中'
        })
        v.ajaxData(obj)
          .then(response => {
            uni.hideLoading()
            if (response.data.code === 0) {
              v.list = response.data.datas
            }
          })
      }
		},
    onLoad (option) {
      if (option.type) {
        this.type = option.type
        console.log(typeof this.type)
        if (this.type === '1') {
          uni.setNavigationBarTitle({
              title: '本日工作量统计明细'
          })
        } else {
          uni.setNavigationBarTitle({
              title: '本月工作量统计明细'
          })
        }
        this.getList('01')
      }
    }
	}
</script>

<style>

</style>
