/*
 * @Author: w
 * @Date: 2021-02-04 16:45:21
 * @LastEditors: w
 * @LastEditTime: 2021-02-05 14:29:53
 */
const envKey = 'test';
// 通途服务
const serviceIp = {
  'dev': "http://172.20.200.30:9545",
  'test': "http://testing.lapa.com.cn:9545",
  'prod': "https://pda-erp.lapa.com.cn",
}
// 登宇通服务
const authVerifyIp = {
  'dev': "http://172.20.200.30:9544",
  'test': "http://dyt.pms.com.cn:9544",
  'prod': 'https://sso.lapa.com.cn',
}
const environmentConfiguration = {
  refreshKey: `refreshAuthCenter`,//刷新token时间
  DBKey: `authCenter-token`,//登宇通token信息
  operation: `authCenter-operation`,//用户账户
  envKey: envKey,
  prefixDomain: serviceIp[envKey],
  prefixAuth: authVerifyIp[envKey],
  version: "2.5.77",
  versionNum: "25770000",
}
export default environmentConfiguration;