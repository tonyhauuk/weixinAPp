// load xml 类
var parser = require('../../utils/parser.js')
var util = require('../../utils/util.js')

Page({
    data: {
    },
    onLoad: function (options) {
        var that = this
        util.doLogin() // mock login
        wx.getStorage({
            key: 'ssid',
            success: function (s) {
                that.setData({
                    ssid: s.data
                })
                wx.request({
                    url: 'https://open.estar360.com/user/favorite.php',
                    data: {
                        ssid: s.data
                    },
                    success: function (res) {
                        // success
                        let xmldoc = parser.loadXML(res.data)
                        let elements = xmldoc.getElementsByTagName("favorite")
                        let arr = []

                        for (let i = 0; i < elements.length; i++) {
                            let errno = elements[i].getElementsByTagName("errno")[0].firstChild.nodeValue
                            let portals = elements[i].getElementsByTagName("portals")

                            if (errno == 0) {
                                for (let j = 0; j < portals.length; j++) {
                                    let portal = portals[j].getElementsByTagName("portal")
                                    let len = portal.length

                                    // 1个门户
                                    if (len == 1) {
                                        let pid = portal[0].getElementsByTagName("pid")[0].firstChild.nodeValue
                                        let name = portal[0].getElementsByTagName("name")[0].firstChild.nodeValue

                                        try {
                                            wx.setStorageSync('pid', pid)
                                            wx.setStorageSync('num', 1)
                                            wx.setStorageSync('name', name)
                                        } catch (e) {
                                            console.log(e)
                                        }

                                        wx.redirectTo({
                                            url: '../home/home'
                                        })
                                    }
                                    // 多个门户
                                    else if (len > 1) {
                                        try {
                                            wx.setStorageSync('num', 2)
                                        } catch (e) {
                                            console.log(e)
                                        }

                                        for (let k = 0; k < len; k++) {
                                            let pid = portal[k].getElementsByTagName("pid")[0].firstChild.nodeValue
                                            let name = portal[k].getElementsByTagName("name")[0].firstChild.nodeValue

                                            let jsonStr = { pid: pid, name: name }
                                            arr.push(jsonStr)
                                        }
                                        
                                    }
                                    else if (len == 0) {
                                        wx.showToast({
                                            title: '您的门户已关闭',
                                            icon: 'loading',
                                            duration: 2000,
                                        })

                                        try {
                                            wx.clearStorage()
                                            wx.clearStorageSync()
                                        } catch (e) {
                                            console.log('No portal error message: ' + e)
                                        }

                                        setTimeout(function () {
                                            wx.switchTab({
                                                url: '/pages/my/my'
                                            })
                                        }, 3000)
                                        
                                    }
                                    that.setData({ arr: arr })
                                }
                            }
                        }
                    }
                })
            },
        })
    }
})

