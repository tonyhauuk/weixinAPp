//app.js
var util = require('./utils/util.js')
App({
    onLaunch: function () {
        wx.getStorage({
            key: 'ssid',
            success: function (res) {
                util.doLogin() // Mock login
                wx.redirectTo({
                    url: '../../pages/selected/selected'
                })
            }
        })
    },
    getUserInfo: function (cb) {
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.login({
                success: function () {
                    wx.getUserInfo({
                        success: function (res) {
                            that.globalData.userInfo = res.userInfo
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        }
                    })
                }
            })
        }
    },
    globalData: {
        userInfo: null
    }
})

/*
"navigationBarBackgroundColor": "#46a3ff",
 */