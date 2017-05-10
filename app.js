//app.js


App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    var that = this
    wx.getStorage({
      key: 'ssid',
      success: function(res){
        ssid: res.data
      }
    })

  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
              //console.log(res.iv)
              try {
                var ssid = wx.getStorageSync('ssid')
                var pid = wx.getStorageSync('pid')
                if (ssid && pid) {
                  // Do something with return value
                  wx.redirectTo({
                    url: '../home/home',
                  })
                }
              } catch (e) {
                // Do something when catch error
              }
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null
  }
})