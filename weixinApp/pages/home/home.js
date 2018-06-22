// load xml 类
var parser = require('../../utils/parser.js')
var util = require('../../utils/util.js')

Page({
    data: {
        areaIndex: 0,
        ssid: '',
        currentTab: 0,
    },

    onLoad: function (options) {
        var that = this
        let pid = 0
        let name = ''

        try {
            let num = wx.getStorageSync('num')
            if (num == 1) {
                pid = wx.getStorageSync('pid')
                name = wx.getStorageSync('name')
            }
            else if (num == 2) {
                pid = options.id
                name = options.name
                wx.setStorageSync('name', name)
            }
            wx.setNavigationBarTitle({
                title: name,
            })
        } catch (e) {
            pid = -1
            console.log('Home wx.getStorageSync: num & pid ' + e)
        }

        wx.getStorage({
            key: 'ssid',
            success: function (s) {
                that.setData({
                    ssid: s.data
                })
                // get column info
                wx.request({
                    url: 'https://open.estar360.com/portal/structure.php',
                    data: {
                        ssid: s.data,
                        pid: pid,
                        layer: 2
                    },
                    success: function (res) {
                        // success
                        var id, layer, name, homepage, push
                        var arr = [], arrID = []
                        var jsonStr, jsonMeun

                        var xmldoc = parser.loadXML(res.data)
                        var elements = xmldoc.getElementsByTagName("structure")

                        for (let i = 0; i < elements.length; i++) {
                            var errno = elements[i].getElementsByTagName("errno")[0].firstChild.nodeValue
                            var col = elements[i].getElementsByTagName("column")

                            if (errno == 0) {
                                for (let x = 0; x < col.length; x++) {
                                    var columns = col[x].getElementsByTagName("columns")
                                    var homeID = col[x].getElementsByTagName("id")[0].firstChild.nodeValue

                                    for (let j = 0; j < columns.length; j++) {
                                        var column = columns[j].getElementsByTagName("column")

                                        for (let k = 0; k < column.length; k++) {
                                            homepage = column[k].getElementsByTagName("homepage")[0].firstChild.nodeValue

                                            layer = column[k].getElementsByTagName("layer")[0].firstChild.nodeValue
                                            // 替换首页homepage ID号
                                            if (homepage && k == 0)
                                                id = homeID
                                            else
                                                id = column[k].getElementsByTagName("id")[0].firstChild.nodeValue

                                            name = column[k].getElementsByTagName("name")[0].firstChild.nodeValue

                                            jsonStr = { id: id, name: name }
                                            arr.push(jsonStr)
                                            arrID.push(id)
                                        }
                                    }
                                }
                            }
                        }

                        let start = (new Date()).valueOf()
                        wx.showLoading({
                            title: util.toastStr(),
                        })

                        info(0, arrID, s.data, that)

                        util.hideToast(start)

                        that.setData({
                            arrayCol: arr,
                            arrID: arrID,
                        })
                    }
                })
            },
        })
    },

    // Tabbar
    swichNav: function (e) {
        var that = this
        var id = e.target.dataset.current

        // Clear fake buffer
        that.setData({
            condition: true
        })

        let start = (new Date()).valueOf()
        wx.showLoading({
            title: util.toastStr(),
        })
        util.hideToast(start)

        that.setData({
            condition: false
        })

        info(id, this.data.arrID, this.data.ssid, that)

        if (this.data.currentTab === id)
            return false
        else
            that.setData({
                currentTab: id
            })
    },
})

function info(id, arr, ssid, that) {
    var cid = arr[id]

    wx.request({
        url: 'https://open.estar360.com/column/article_list.php',
        data: {
            ssid: ssid,
            showtype: 0,
            cid: cid,
            n: 100
        },
        success: function (res) {
            // success
            var id, title, rep, time, img, src
            var art = []
            var arrAID = []
            var jsonStr

            var xmldoc = parser.loadXML(res.data)
            var elements = xmldoc.getElementsByTagName("article_list")

            for (let i = 0; i < elements.length; i++) {
                var errno = elements[i].getElementsByTagName('errno')[0].firstChild.nodeValue
                var articles = elements[i].getElementsByTagName('articles')

                if (errno == 0) {
                    for (let j = 0; j < articles.length; j++) {
                        var article = articles[j].getElementsByTagName('article')

                        for (let k = 0; k < article.length; k++) {
                            try {
                                id = article[k].getElementsByTagName('id')[0].firstChild.nodeValue
                                title = article[k].getElementsByTagName('title')[0].firstChild.nodeValue
                                rep = article[k].getElementsByTagName('reprint_count')[0].firstChild.nodeValue
                                time = article[k].getElementsByTagName('pubtime')[0].firstChild.nodeValue
                                img = article[k].getElementsByTagName('image_link')[0].firstChild.nodeValue
                                src = article[k].getElementsByTagName('websrc')[0].firstChild.nodeValue

                                if (rep > 0)
                                    rep = '转载: ' + rep + '条'
                                else
                                    rep = ''
                            } catch (e) {
                                console.log(e)
                            }

                            if (title.length > 30)
                                title = title.substring(0, 29) + '... '

                            jsonStr = { id: id, title: title, rep: rep, time: time, img: img, src: src }
                            art.push(jsonStr)
                            arrAID.push(id)
                        }
                    }
                }
            }

            that.setData({
                arrArt: art,
                arrAID: arrAID
            })
        }
    })
}