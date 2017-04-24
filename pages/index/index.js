
var app = getApp()
Page({
    data: {
    imgUrls: [
      'http://i3.mifile.cn/a4/xmad_14924228925772_WRpTQ.jpg',
      'http://i3.mifile.cn/a4/xmad_14917471739205_EgXRY.jpg',
      'http://i3.mifile.cn/a4/xmad_14917472556483_dUXkz.jpg',
      'http://i3.mifile.cn/a4/xmad_14926930285634_rFZyK.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    userInfo: {},
    name: 'Hasaki'
    },
    onLoad: function () {
        var that = this
        wx.login({
          success: function () {
            wx.getUserInfo({
              success: function (res) {
                  console.log(res.userInfo)
                that.setData({
                  userInfo: res.userInfo
                })
              }
            })
          }
        })
        // var that = this
        // //调用应用实例的方法获取全局数据
        // var func = function(userInfo){
        //   //更新数据
        //   that.setData({
        //     userInfo:userInfo
        //   })
        // }
        // app.login(func)
    },
    changeName: function() {
        this.setData({
            name: '大香蕉'
        })
    },
    nextPage: function() {
        wx.switchTab({
            url: '../logs/logs'
        })
        // wx.navigateTo({
        //     url: '../logs/logs'
        // })
    }
})
