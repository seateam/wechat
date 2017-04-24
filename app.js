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
    },
    // login:function(cb){
    //     var that = this;
    //     if(this.Data.userInfo) {
    //         if (typeof cb == "function") {
    //             cb(this.Data.userInfo)
    //         }
    //     } else {
    //     //调用登录接口
    //
    //     }
    // },
    // Data:{
    //     userInfo: null
    // }
}

App(options)
