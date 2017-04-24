//app.js
var options = {
    // onLaunch 全局登陆触发一次
    onLaunch: function () {
        this.logs()
    },
    logs: function() {
        var arr = wx.getStorageSync('logs') || []
        arr.push( Date.now() )
        wx.setStorageSync('logs', arr)
    }
}

App(options)
