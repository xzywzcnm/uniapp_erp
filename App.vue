<script>
// import { getAccessToken } from "./utils/user";
import { getStorage, removeStorage } from "./utils/";
import refreshPageToken from "@/utils/refreshPageToken";
// // 不移除该缓存的页面
// const notRemoveLocal = [
//   {
//     storageKey: "inventoryCheckOperation",
//     paths: [
//       "pages/workspace/inventoryCheckOperation",
//       "pages/workspace/inventoryCheckDetails",
//     ],
//   },
//   {
//     storageKey: "storageSearchKey",
//     paths: ["pages/workspace/inventoryCheckOperation"],
//   },
// ];
// const removeLocalHand = (option) => {
//   const removeInfo = notRemoveLocal.filter((item) => {
//     return !item.paths.includes(option.path);
//   });
//   let storageVal = null;
//   if (removeInfo.length > 0) {
//     console.log("移除标记的缓存");
//     removeInfo.forEach((item) => {
//       storageVal = getStorage(item.storageKey);
//       // 移除缓存
//       !!storageVal && removeStorage(item.storageKey);
//     });
//   }
// };
// const getUrlPath = (url) => {
//   let newUrl = url;
//   if (!newUrl) return newUrl;
//   if (newUrl.substring(0, 1) == "/") {
//     newUrl = newUrl.substring(1, newUrl.length);
//   }
//   const pathEndIndex = newUrl.indexOf("?");
//   if (pathEndIndex > -1) {
//     newUrl = newUrl.substring(0, pathEndIndex);
//   }
//   return newUrl;
// };
export default {
  onLaunch: function (option) {
    // removeLocalHand(option);
    //监听跳转
    // uni.addInterceptor("navigateTo", {
    //   invoke(e) {
    //     // console.log(e, getUrlPath(e.url));
    //     removeLocalHand({ path: getUrlPath(e.url) });
    //   },
    // });
    //监听关闭本页面跳转
    // uni.addInterceptor('redirectTo', {
    //   invoke(e) {
    //     console.log(e, e.url);
    //   }
    // })
    // //监听tabBar跳转
    // uni.addInterceptor("switchTab", {
    //   invoke(e) {
    //     removeLocalHand({ path: getUrlPath(e.url) });
    //   },
    // });
    // //监听返回
    // uni.addInterceptor("navigateBack", {
    //   invoke(e) {
    //     removeLocalHand({ path: getUrlPath(e.url) });
    //   },
    // });
    uni.getNetworkType({
      success: function (res) {
        if (
          res.networkType === "2g" ||
          res.networkType === "3g" ||
          res.networkType === "4g"
        ) {
          uni.showToast({
            icon: "none",
            title: "您当前处于流量状态, 请注意流量使用",
            duration: 5000,
          });
        } else if (res.networkType === "none") {
          uni.showToast({
            icon: "none",
            title: "没有网络连接, 请确认网络设置",
            duration: 5000,
          });
        }
        console.log(res.networkType);
      },
    });
  },
  onShow: function () {
    //#ifdef H5
    if (!getStorage("token")) {
      // getAccessToken(window.location.href);
    }
    let theme = getStorage("theme");
    if (theme) {
      this.store.commit("theme", theme);
    }
    //#endif
    // console.log('App Show')
    // 刷新token
    refreshPageToken.againRefresh(true);
  },
  onHide: function () {
    // console.log('App Hide')
  },
};
</script>

<style lang="scss">
/* uni.scss */

@import "./uview-ui/index.scss";
@import "./common/uni.css";
body {
  background-color: #e8e8e8;
}

@font-face {
  font-family: "iconfont";
  /* project id 987764 */
  src: url("~@/static/font/font_2212514_gnogckgilyp/iconfont.ttf") format("truetype");
}

.iconfont {
  font-family: iconfont;
}
$u-main-color: #303133;
$u-content-color: #606266;
$u-tips-color: #909399;
$u-light-color: #c0c4cc;
$u-border-color: #e4e7ed;
$u-bg-color: #f3f4f6;

$u-type-primary: #2979ff;
$u-type-primary-light: #ecf5ff;
$u-type-primary-disabled: #a0cfff;
$u-type-primary-dark: #2b85e4;

$u-type-warning: #ff9900;
$u-type-warning-disabled: #fcbd71;
$u-type-warning-dark: #f29100;
$u-type-warning-light: #fdf6ec;

$u-type-success: #19be6b;
$u-type-success-disabled: #71d5a1;
$u-type-success-dark: #18b566;
$u-type-success-light: #dbf1e1;

$u-type-error: #fa3534;
$u-type-error-disabled: #fab6b6;
$u-type-error-dark: #dd6161;
$u-type-error-light: #fef0f0;

$u-type-info: #909399;
$u-type-info-disabled: #c8c9cc;
$u-type-info-dark: #82848a;
$u-type-info-light: #f4f4f5;

$u-form-item-height: 70rpx;
$u-form-item-border-color: #dcdfe6;
</style>
<style lang="less">
@import url("./style/index.css");
@import url("./components/sevenUI/style/index.less");
</style>
