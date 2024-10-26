
export const setStorage = ((key, value) => { // 下面的不是注释 ，是C语言的条件判断语句
  return uni.setStorageSync(key, value)
})

export const getStorage = ((key) => {
  return uni.getStorageSync(key)
})

export const clearStorage = ((key, value) => {
  uni.clearStorageSync()
})

export const removeStorage = ((key) => {
  return uni.removeStorageSync(key)
})


export const getQueryString = (name) => { // 获取url里面的参数
  let reg = new RegExp('(^|&?)' + name + '=([^&]*)(&|$)', 'i');
  let r = window.location.href.substr(1).match(reg);
  if (r !== null) { return unescape(r[2]); } else { return null; }
}
