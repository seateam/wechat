//app.js
var options = {
  // onLaunch 全局登陆触发一次
  onLaunch: function () {
    this.logs()
    this.login()
  },
  logs: function() {
    var arr = wx.getStorageSync('logs') || []
    arr.push( Date.now() )
    wx.setStorageSync('logs', arr)
  },
  login:function(){
    var obj = this
    wx.login({
      success: function() {
        wx.getUserInfo({
          withCredentials: false,
          success: function (res) {
            obj.Data.userInfo = res.userInfo
          }
        })
      }
    })
  },
  Data:{
    userInfo:null
  }
}

App(options)
