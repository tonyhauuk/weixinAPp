// load xml 类
var parser = require('../../utils/parser.js');
var WxParse = require('../../utils/wxParse/wxParse/wxParse.js');

Page({
  data: {
    ssid: '',
    id: '',
    title: '',
    rep: '',
    time: '',
    text: '',
    mark: '',
    wxParseData: []
  },
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '详情页面'
    })
  },
  onLoad: function (options) {
    var that = this

    wx.getStorage({
      key: 'ssid',
      success: function (res) {
        that.setData({
          ssid: res.data
        })

        wx.request({
          url: 'https://open.estar360.com/article/content.php?',
          data: {
            ssid: res.data,
            aid: options.id
          },
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          // header: {}, // 设置请求的 header
          success: function (res) {
            // success
            var id, title, link, rep, time, text, mark

            let xmldoc = parser.loadXML(res.data)
            
            let elements = xmldoc.getElementsByTagName("content")

            for (let i = 0; i < elements.length; i++) {
              let errno = elements[i].getElementsByTagName('errno')[0].firstChild.nodeValue
              let article = elements[i].getElementsByTagName('article')

              if (errno == 0) {
                for (let k = 0; k < article.length; k++) {
                  id = article[k].getElementsByTagName('id')[0].firstChild.nodeValue
                  title = article[k].getElementsByTagName('title')[0].firstChild.nodeValue
                  rep = article[k].getElementsByTagName('reprint_count')[0].firstChild.nodeValue
                  time = article[k].getElementsByTagName('pubtime')[0].firstChild.nodeValue
                  text = article[k].getElementsByTagName('text')[0].firstChild.nodeValue
                  mark = article[k].getElementsByTagName('mark')[0].firstChild.nodeValue

                  /*text = text.replace(/<img/g, "<image")
                  text = text.replace(/\/>/g, '></image>')*/
                  // text = '<div>' + text + '</div>'
                                
                  if (title.length > 40) 
                    title = title.substring(0, 40) + '...'
                }
              }
            }

            WxParse.wxParse('content', 'html', text, that, 5)

            that.setData({
              id: id,
              title: title,
              rep: rep,
              time: time,
              text: text,
              mark: mark
            })
          }
        })
      }
    })
  }
})