//app.js
var options = {
    // onLaunch 全局登陆触发一次
    db: {
        userInfo: null
    },
    onLaunch: function () {

    },
    login: function(that) {
        wx.login({
            success: function () {
                wx.getUserInfo({
                    withCredentials: false,
                    success: function (res) {
                        that.setData({
                            userInfo: res.userInfo
                        })
                    },
                    fail: () => {}
                })
            },
            fail: () => {}
        })
    }
}

App(options)
