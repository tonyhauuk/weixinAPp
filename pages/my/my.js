// load xml 类
var parser = require('../../utils/parser.js');

//获取应用实例
var app = getApp()

Page({
  data: {
    userName: '',
    pwd: ''
  },
  userBind: function (e) {
    this.data.userName = e.detail.value.trim()
  },
  pwdBind: function (e) {
    this.data.pwd = e.detail.value.trim()
  },
  submit: function () {
    var acc = this.data.userName
    var pass = this.data.pwd

    if (acc && pass) {
      // 网络请求
      wx.request({
        url: 'https://open.estar360.com/user/auth.php?',
        data: {
          acc: this.data.userName,
          pass: this.data.pwd
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          // parse xml
          var xmldoc = parser.loadXML(res.data)
          var elements = xmldoc.getElementsByTagName("auth");

          for (var i = 0; i < elements.length; i++) {
            var errno = elements[i].getElementsByTagName("errno")[0].firstChild.nodeValue;
            var error = elements[i].getElementsByTagName("error")[0].firstChild.nodeValue;
            var ssid = elements[i].getElementsByTagName("ssid")[0].firstChild.nodeValue;
          }
          if (errno == 0) {
            wx.setStorage({
              key: 'ssid',
              data: ssid,
              success: function (res) {
                // success
                //console.log('storage: ' + ssid)
                try {
                  wx.setStorageSync('ssid', ssid)
                } catch (e) {
                  console.log(e)
                }
              },
              fail: function () {
                // fail
              },
              complete: function () {
                // complete
              }
            })
            wx.redirectTo({
              url: '../home/home',
              success: function (res) {
                // success
              },
              fail: function () {
                // fail
              },
              complete: function () {
                // complete
              }
            })
          }
          else {
            wx.showToast({
              title: '登录失败',
              icon: 'loading',
              during: 1500
            })
          }

        }
      })
    }
    else {
      wx.showToast({
        title: '登录名或密码错误',
        icon: 'loading',
        during: 1500
      })
    }

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
  }
})