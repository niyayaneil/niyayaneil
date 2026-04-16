const download = {
  // 下载 Excel 方法
  excel: (res: Blob, name: string) => {
    // 转化为blob对象
    let blob = new Blob([res as unknown as BlobPart], {
      type: 'application/octet-stream',
    })
    let filename = name + '.xlsx'
    // 将blob对象转为一个URL
    var blobURL = window.URL.createObjectURL(blob)
    // 创建一个a标签
    var tempLink = document.createElement('a')
    // 隐藏a标签
    tempLink.style.display = 'none'
    // 设置a标签的href属性为blob对象转化的URL
    tempLink.href = blobURL
    // 给a标签添加下载属性
    tempLink.setAttribute('download', filename)
    if (typeof tempLink.download === 'undefined') {
      tempLink.setAttribute('target', '_blank')
    }
    // 将a标签添加到body当中
    document.body.appendChild(tempLink)
    // 启动下载
    tempLink.click()
    // 下载完毕删除a标签
    document.body.removeChild(tempLink)
    window.URL.revokeObjectURL(blobURL)
  },
}

export default download
