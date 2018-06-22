function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function hideToast(start) {
    let end = (new Date()).valueOf()
    let diff = String(end - start)
    let res = diff.charAt(diff.length - 1)

    setTimeout(function () {
        wx.hideLoading()
    }, parseInt(res * 1000))
}

function toastStr() {
    return '加载中...'
}

function pron() {
    let str = '【免责声明】文章内容全部通过电脑自动采集程序上传，铱星不发布任何信息，铱星只为客户提供信息监控及统计服务。本文仅代表作者本人观点，与铱星无关。铱星网站对文中陈述、观点判断保持中立，不对所包含内容的准确性、可靠性或完整性提供任何明示或暗示的保证。请读者仅作参考，并请自行承担全部责任。如果您发现该内容侵犯了您的权利，请立即通知铱星在线。'

    return str
}

function doLogin() {
    let acc = wx.getStorageSync('acc')
    let pass = wx.getStorageSync('pass')
    try {
        if (acc != '' && pass != '') {
            console.log('name: '+acc+' pass: '+pass)
            wx.request({
                url: 'https://open.estar360.com/user/auth.php',
                data: {
                    acc: acc,
                    pass: pass
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    formatTime: formatTime,
    hideToast: hideToast,
    toastStr: toastStr,
    pron: pron,
    doLogin: doLogin,
}
