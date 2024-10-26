<template>
	<view :class="purchaseDetailsLogWrap">
		<view class="containerWrap">
		  <view class="listWrap">
		    <view class="listItem" v-for="(item,index) in list" :key="index">
          <view class="subList row no-gutters">
            <text class="col col-3">操作时间：</text>
            <text class="col col-9">{{item.operatetime}}</text>
          </view>
          <view class="subList row no-gutters">
            <text class="col col-3">操作人：</text>
            <text class="col col-9">{{item.uName}}</text>
          </view>
          <view class="subList row no-gutters">
            <text class="col col-3">操作内容：</text>
            <text class="col col-9">{{item.operatecontent}}</text>
          </view>
          <view class="subList row no-gutters">
            <text class="col col-3">操作状态：</text>
            <text class="col col-9 itemStatus">
              <text v-if="item.status === '0'">下单</text>
              <text v-else-if="item.status === '1'">修改</text>
              <text v-else-if="item.status === '2'">到货</text>
              <text v-else-if="item.status === '3'">申请付款</text>
              <text v-else-if="item.status === '4'">作废</text>
              <text v-else-if="item.status === '5'">质检分派</text>
              <text v-else-if="item.status === '6'">开始质检</text>
              <text v-else-if="item.status === '7'">完成质检</text>
              <text v-else-if="item.status === '8'">采购入库</text>
              <text v-else-if="item.status === '9'">采购付款</text>
              <text v-else-if="item.status === '10'">取消剩余未到货</text>
              <text v-else-if="item.status === '11'">取消付款</text>
              <text v-else-if="item.status === '12'">创建</text>
              <text v-else-if="item.status === '13'">取消到货</text>
            </text>
          </view>
        </view>
      </view>
    </view>
	</view>
</template>

<script>
  import api from '@/api/api'
  import Mixin from '@/mixin/common_mixin'
  const prefixCls = 'tongtool-workspace-purchaseDetailsLog'

	export default {
    mixins: [Mixin],
    components: {

    },
    computed: {
      purchaseDetailsLogWrap () {
        return [
          `${prefixCls}`
        ]
      },
      userInfoList () {
        return this.store.state.userInfoList;
      }
    },
		data() {
			return {
				apiData: {
				  lastId: null,
				  limit: 10,
				  purchaseOrderId: null
				},
				list: [],
				loadingType: 0,
				contentText: {
					contentdown: '上拉显示更多',
					contentrefresh: '正在加载...',
					contentnomore: '没有更多数据了'
				},
				historyList: null
			}
		},
    methods: {
      getUserName (id) {
        let v = this;
        if (v.userInfoList && v.userInfoList[id]) {
          return v.userInfoList[id].username;
        } else {
          return '管理员'
        }
      },
      getList () {
        let v = this
        let obj = {
          url: api.get_purchaseDetailsListOperateHistory,
          data: v.apiData
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas
              data.forEach((n, i) => {
                n.uName = v.getUserName(n.operatorid)
              })
              v.$nextTick(function () {
                v.list = data
              })
              setTimeout(function () {
                uni.stopPullDownRefresh()
              }, 1000)
            }
          })
      }
    },
    onLoad (option) {
      let v = this
      v.apiData.purchaseOrderId = option.purchaseOrderId
      uni.startPullDownRefresh()
    },
    onPullDownRefresh() {
      let v = this
      v.list = []
      v.apiData.lastId = null
      v.getList()
    },
		onReachBottom () {
      let v = this
			if (v.loadingType !== 0) {
				return
			}
      v.getList()
		}
	}
</script>
