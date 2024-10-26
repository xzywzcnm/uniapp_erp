<template>
  <view :class="purchaseDetailsWrap">
    <view class="containerWrap">
      <view class="listWrap">
        <view class="listItem" v-for="(item,index) in list" :key="index">
          <view class="subList row no-gutters">
            <view class="col col-3">
              <img :src="item.goodsImageUrl" class="loadImg">
            </view>
            <view class="col col-9">
              <view class="d-flex listItemTopic">
                <view class="skuNum">SKU：{{item.goodsSku}}</view>
                <view class="cargoSpace">货位：{{item.cargoSpace}}</view>
              </view>
              <view class="d-flex">货品：{{item.productName}}</view>
              <view class="d-flex">
                {{item.inQuantity === null ? 0 : item.inQuantity}}/{{item.quantity}}
              </view>
            </view>
          </view>
          <view class="totalWrap">
            <view class="d-flex justify-content-between align-items-center" @click="gotoHistory">
              <text class="operateHistoryItem">操作历史</text>
              <view class="operateHistoryItem">
                <text>
                  <text class="redColor">{{logCount}}</text>次
                </text>
                <text class="icon iconfont">
                &#xe655;
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
    </view>
   <!-- <img-load ref="imgLoad"></img-load> -->
  </view>
</template>

<script>
  import api from '@/api/api'
  import Mixin from '@/mixin/common_mixin'
  // import imgLoad from 'mpvue-img-load'
  const prefixCls = 'tongtool-workspace-purchaseDetails'
  export default {
    mixins: [Mixin],
    data () {
      return {
        purchaseOrderCode: null,
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
        historyList: null,
        logCount: 0
      }
    },
    components: {},
    computed: {
      purchaseDetailsWrap () {
        return [
          `${prefixCls}`
        ]
      }
    },
    methods: {
      // makeDataImg (data) { // 处理图片是否能加载
      //   let v = this
      //   return new Promise(resolve => {
      //     data.forEach((item, index, list) => {
      //       item.loaded = false
      //     	v.$refs.imgLoad.load(item.goodsImageUrl, (err, imgData) => {
      //         if (!err) {
      //           item.loaded = true
      //         }
      //         if (index === data.length - 1) {
      //           resolve(data)
      //         }
      //     	})
      //     })
      //   })
      // },
      getList () {
        let v = this
        v.loadingType = 1
        let obj = {
          url: api.get_purchaseDetailsList,
          data: v.apiData
        }
        v.ajaxData(obj)
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas
              if (!v.apiData.lastId) {
                v.logCount = response.data.others.logTotal
              }
			  
              if (data.length > 0) {
				  v.list = v.list.concat(data)
				  v.apiData.lastId = response.data.others.lastId;
				  v.loadingType = 0
				  if (data.length < 10) {
				    v.loadingType = 2
				  }
                // v.makeDataImg(data)
                //   .then(result => {
                //     v.list = v.list.concat(result)
                //     v.apiData.lastId = result[result.length - 1].purchaseOrderDetailId
                //     v.loadingType = 0
                //     if (data.length < 10) {
                //       v.loadingType = 2
                //     }
                //   })
              } else {
                v.loadingType = 2
              }
            }
            setTimeout(function () {
              uni.stopPullDownRefresh()
            }, 1000)
          })
      },
      gotoHistory () {
        let v = this
        uni.navigateTo({
        	url: '/pages/workspace/purchaseDetailsHistoryList?purchaseOrderId=' + v.apiData.purchaseOrderId
        })
      }
    },
    onLoad (option) {
      let v = this
      v.apiData.purchaseOrderId = option.purchaseOrderId
      v.purchaseOrderCode = option.purchaseOrderCode
      uni.setNavigationBarTitle({
        title: v.purchaseOrderCode
      })
      uni.startPullDownRefresh();
	  v.getList()
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

