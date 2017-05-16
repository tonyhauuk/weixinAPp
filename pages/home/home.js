// load xml 类
var parser = require('../../utils/parser.js');

Page({
  data: {
    ssid: '',
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    c: '',
    p: '',
    n: '',
    arrayCol: [],
    arrID: [],
    arrArt: [],
    arrAID: [],
    subMenuDisplay: initSubMenuDisplay()
  },
  onLoad: function () {
    var that = this;

    // 获取系统信息 
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },

  onShow: function (options) {
    var that = this

    wx.getStorage({
      key: 'ssid',
      success: function (res) {
        that.setData({
          ssid: res.data
        })

        wx.request({
          url: 'https://open.estar360.com/user/favorite.php?',
          data: {
            ssid: res.data
          },
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: {
            'content-type': 'application/json'
          }, // 设置请求的 header
          success: function (res) {
            // success
            let xmldoc = parser.loadXML(res.data)
            let elements = xmldoc.getElementsByTagName("favorite")

            let pid, name, cid = ''

            for (let i = 0; i < elements.length; i++) {
              let errno = elements[i].getElementsByTagName("errno")[0].firstChild.nodeValue
              let portals = elements[i].getElementsByTagName("portals")

              if (errno == 0) {
                for (let j = 0; j < portals.length; j++) {
                  let portal = portals[j].getElementsByTagName("portal")

                  //for (let k = 0; k < portal.length; k++) {
                  let k = 2
                  let pid = portal[k].getElementsByTagName("pid")[0].firstChild.nodeValue
                  let name = portal[k].getElementsByTagName("name")[0].firstChild.nodeValue
                  let cid = portal[k].getElementsByTagName("cid")[0].firstChild.nodeValue
                  try {
                    wx.setStorageSync('pid', 10496)
                  } catch (e) {
                    console.log(e)
                  }

                  that.setData({
                    p: pid,
                    c: cid,
                    n: name
                  })
                  //}
                }
              }
            }
          }
        })

        // get column info
        wx.request({
          url: 'https://open.estar360.com/portal/structure.php?',
          data: {
            ssid: res.data,
            pid: 10496,
            layer: 2
          },
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: { 'content-type': 'application/json' }, // 设置请求的 header
          success: function (res) {
            // success
            var id, layer, name, homepage, push
            var arr = []
            var arrID = []
            var jsonStr

            var xmldoc = parser.loadXML(res.data)
            var elements = xmldoc.getElementsByTagName("structure")

            for (let i = 0; i < elements.length; i++) {
              var errno = elements[i].getElementsByTagName("errno")[0].firstChild.nodeValue
              var column = elements[i].getElementsByTagName("column")

              if (errno == 0) {
                for (let x = 0; x < column.length; x++) {
                  var columns = column[x].getElementsByTagName("columns")

                  for (let j = 0; j < columns.length; j++) {
                    var column = columns[j].getElementsByTagName("column")

                    for (let k = 0; k < column.length; k++) {
                      id = column[k].getElementsByTagName("id")[0].firstChild.nodeValue
                      layer = column[k].getElementsByTagName("layer")[0].firstChild.nodeValue
                      name = column[k].getElementsByTagName("name")[0].firstChild.nodeValue
                      homepage = column[k].getElementsByTagName("homepage")[0].firstChild.nodeValue
                      push = column[k].getElementsByTagName("push")[0].firstChild.nodeValue

                      if (name.length > 4)
                        name = name.substring(0, 4) + '...'

                      jsonStr = { id: id, name: name }
                      arr.push(jsonStr)
                      arrID.push(id)


                    }
                  }
                }
              }
            }
            that.setData({
              arrayCol: arr,
              arrID: arrID
            })
          }
        })
      }
    })
  },

  bindChange: function (e) {
    var that = this
    var id = e.detail.current
    if (id == '' || id == null)
      id = 0

    info(id, this.data.arrID, this.data.ssid, that)

    that.setData({
      currentTab: e.detail.current
    })
  },

  swichNav: function (e) {
    var that = this
    var id = e.target.dataset.current
    if (id == '' || id == null)
      id = 0

    info(id, this.data.arrID, this.data.ssid, that)

    if (this.data.currentTab === e.target.dataset.current)
      return false
    else
      that.setData({
        currentTab: e.target.dataset.current
      })
  },

  tapMainMenu: function (e) {
    var index = parseInt(e.currentTarget.dataset.index)
    var newSubMenuDisplay = initSubMenuDisplay()
    if (this.data.subMenuDisplay[index] == 'hidden') {
      newSubMenuDisplay[index] = 'show';
    } else {
      newSubMenuDisplay[index] = 'hidden';
    }
    this.setData({
      subMenuDisplay: newSubMenuDisplay
    });
  },

  tapSubMenu: function (e) {        
    // 隐藏所有一级菜单
    this.setData({
      subMenuDisplay: initSubMenuDisplay()
    });        
    // 处理二级菜单，首先获取当前显示的二级菜单标识
    var indexArray = e.currentTarget.dataset.index.split('-');        // 初始化状态
    // var newSubMenuHighLight = initSubMenuHighLight;
    for (var i = 0; i < initSubMenuHighLight.length; i++) {            
      // 如果点中的是一级菜单，则先清空状态，即非高亮模式，然后再高亮点中的二级菜单；如果不是当前菜单，而不理会。经过这样处理就能保留其他菜单的高亮状态
      if (indexArray[0] == i) {
        for (var j = 0; j < initSubMenuHighLight[i].length; j++) {                    
          // 实现清空
          initSubMenuHighLight[i][j] = '';
        }                
        // 将当前菜单的二级菜单设置回去
      }
    }        
    // 与一级菜单不同，这里不需要判断当前状态，只需要点击就给class赋予highlight即可
    initSubMenuHighLight[indexArray[0]][indexArray[1]] = 'highlight';        
    // 设置为新的数组
    this.setData({
      subMenuHighLight: initSubMenuHighLight
    });
  }
})

function info(id, arr, ssid, that) {
  var cid = arr[id]

  wx.request({
    url: 'https://open.estar360.com/column/article_list.php?',
    data: {
      ssid: ssid,
      showtype: 0,
      cid: cid,
      n: 10
    },
    method: 'GET',
    // header: {'content-type': 'application/json'}, // 设置请求的 header
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
              id = article[k].getElementsByTagName('id')[0].firstChild.nodeValue
              title = article[k].getElementsByTagName('title')[0].firstChild.nodeValue
              rep = article[k].getElementsByTagName('reprint_count')[0].firstChild.nodeValue
              time = article[k].getElementsByTagName('pubtime')[0].firstChild.nodeValue
              img = article[k].getElementsByTagName('image_link')[0].firstChild.nodeValue
              src = article[k].getElementsByTagName('websrc')[0].firstChild.nodeValue
              
              if (title.length > 15)
                title = title.substring(0, 15) + '... '

              if (!img || img == 'null')
                img = ''

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
function initSubMenuDisplay() {
  return ['hidden', 'hidden', 'hidden'];
}