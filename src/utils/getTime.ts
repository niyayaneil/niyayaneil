export let getExportDate = () => {
  // 补零
  let addZero = (t: number) => {
    return t < 10 ? '0' + t : t;
  }
  let time = new Date();
  let Y = time.getFullYear(), // 年
    M = time.getMonth() + 1, // 月
    D = time.getDate(), // 日
    h = time.getHours(), // 时
    m = time.getMinutes() // 分
  // s = time.getSeconds(); // 秒
  if (M > 12) {
    // 注: new Date()的年月日的拼接，在月份为12月时，会出现 获取月份+1 后，为13月的bug，需要特殊处理。用moment第三方插件获取时间也可避免此问题。
    M = M - 12;
  }
  return `${Y}${addZero(M)}${addZero(D)}${addZero(h)}${addZero(m)}`;
}
