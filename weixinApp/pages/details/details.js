// load xml 类
var parser = require('../../utils/parser.js')
const WxParse = require('../../utils/wxParse/wxParse/wxParse.js')
var util = require('../../utils/util.js')

Page({
    data: {
        ssid: '',
        id: '',
    },

    onLoad: function (options) {
        var that = this
        this.data.id = options.id
        let name = ''

        try {
            name = wx.getStorageSync('name')

        } catch (e) {
            console.log(e)
        }

        wx.setNavigationBarTitle({
            title: name,
        })

        let start = (new Date()).valueOf()
        wx.showLoading({
            title: util.toastStr(),
        })

        wx.getStorage({
            key: 'ssid',
            success: function (res) {
                wx.request({
                    url: 'https://open.estar360.com/article/content.php',
                    data: {
                        ssid: res.data,
                        aid: options.id
                    },
                    success: function (res) {
                        // success
                        var id, title, link, rep, time, text, mark, origin, merge

                        let xmldoc = parser.loadXML(res.data)
                        let elements = xmldoc.getElementsByTagName("content")

                        for (let i = 0; i < elements.length; i++) {
                            let errno = elements[i].getElementsByTagName('errno')[0].firstChild.nodeValue
                            let article = elements[i].getElementsByTagName('article')

                            if (errno == 0) {
                                for (let k = 0; k < article.length; k++) {
                                    try {
                                        title = article[k].getElementsByTagName('title')[0].firstChild.nodeValue
                                        rep = article[k].getElementsByTagName('reprint_count')[0].firstChild.nodeValue
                                        time = article[k].getElementsByTagName('pubtime')[0].firstChild.nodeValue
                                        text = article[k].getElementsByTagName('text')[0].firstChild.nodeValue
                                        mark = article[k].getElementsByTagName('mark')[0].firstChild.nodeValue
                                        origin = article[k].getElementsByTagName('origsrc')[0].firstChild.nodeValue
                                        link = '原文链接: ' + article[0].getElementsByTagName('link')[0].firstChild.nodeValue

                                        if (origin == 'none')
                                            origin = ' '

                                        if (rep > 0)
                                            rep = ' 转载:' + rep + '条 '
                                        else
                                            rep = '  '

                                        merge = time + rep + origin
                                    } catch (e) {
                                        console.log(e)
                                    }

                                    if (title.length > 40)
                                        title = title.substring(0, 40) + '...'

                                    let rplc = '<p style="padding: 10px">'
                                    text = text.replace(/\n/g, rplc)
                                }
                            }
                        }

                        WxParse.wxParse('content', 'html', text, that, 5)
                        let pron = util.pron()

                        that.setData({
                            title: title,
                            link: link,
                            mark: mark,
                            merge: merge,
                            pron: pron,
                        })
                    }
                })
                statusCheck(res.data, options.id, that)
            }
        })
        util.hideToast(start)
    },
    submit: function () {
        var that = this
        let aid = this.data.id
        wx.getStorage({
            key: 'ssid',
            success: function (res) {
                statusCheck(res.data, aid, that, 1)
            },
        })
    }
})

function statusCheck(ssid, aid, that, did = 0, op = 2) {
    wx.request({
        url: 'https://open.estar360.com/article/mark.php',
        data: {
            ssid: ssid,
            aid: aid,
            op: op,
        },
        success: function (res) {
            let xmldoc = parser.loadXML(res.data)
            let elements = xmldoc.getElementsByTagName("mark_result")
            let errno = elements[0].getElementsByTagName('errno')[0].firstChild.nodeValue
            let error = elements[0].getElementsByTagName('error')[0].firstChild.nodeValue

            if (op == 2) {
                that.setData({
                    status: error
                })
            }

            if (did == 1 && errno == 16) {
                statusCheck(ssid, aid, that, 1, 1)
                statusCheck(ssid, aid, that)
            }
            else if (did == 1 && errno == 15) {
                statusCheck(ssid, aid, that, 1, 0)
                statusCheck(ssid, aid, that)
            }
        }
    })
}