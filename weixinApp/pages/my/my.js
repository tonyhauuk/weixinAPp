var parser = require('../../utils/parser.js')

//获取应用实例
var app = getApp()

Page({
    data: {
        userName: '',
        pwd: ''
    },

    onLoad: function () {
        var that = this
        //调用应用实例的方法获取全局数据
        app.getUserInfo(function (userInfo) {
            //更新数据
            that.setData({
                userInfo: userInfo
            })
        })
    },

    userBind: function (e) {
        this.data.userName = e.detail.value.trim()
    },

    pwdBind: function (e) {
        this.data.pwd = e.detail.value.trim()
    },

    submit: function () {
        let acc = this.data.userName
        let pass = this.data.pwd

        if (acc && pass) {
            try {   // 把用户名和密码缓存到本地，这个是同步的
                wx.setStorageSync('acc', acc)
                wx.setStorageSync('pass', pass)
            } catch (e) {
                console.log(e)
            }
            wx.request({
                url: 'https://open.estar360.com/user/auth.php',
                data: {
                    acc: acc,
                    pass: pass
                },
                success: function (res) {
                    // load xml 类
                    var xmldoc = parser.loadXML(res.data)
                    var elements = xmldoc.getElementsByTagName("auth")

                    var errno = elements[0].getElementsByTagName("errno")[0].firstChild.nodeValue
                    var error = elements[0].getElementsByTagName("error")[0].firstChild.nodeValue

                    if (errno == 0) {
                        var ssid = elements[0].getElementsByTagName("ssid")[0].firstChild.nodeValue
                        wx.setStorage({ // 异步将ssid数据缓存到本地
                            key: 'ssid',    
                            data: ssid,
                            success: function (res) {
                                wx.redirectTo({
                                    url: '../selected/selected'
                                })
                            }
                        })
                    }
                    else if (errno > 0) {
                        wx.showToast({
                            title: error,
                            icon: 'loading',
                            duration: 1500
                        })
                    }
                }
            })
        }
        else {
            wx.showToast({
                title: '登录名或密码错误',
                icon: 'loading',
                duration: 1500
            })
        }
    },
})