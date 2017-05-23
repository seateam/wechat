//app.js
var options = {
    // onLaunch 全局登陆触发一次
    db: {
        userInfo: null,
        // 方向
        compass: null
    },
    onLaunch: function () {
        // 开启罗盘
        // wx.startCompass()
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
    },
    direction: function(du) {
        // 360 / 8 = 45
        if (du >= 338 || du < 23) {
            return '北'
        } else if (du >= 23 && du < 68) {
            return '东北'
        } else if (du >= 68 && du < 113) {
            return '东'
        } else if (du >= 113 && du < 158) {
            return '东南'
        } else if (du >= 158 && du < 203) {
            return '南'
        } else if (du >= 203 && du < 248) {
            return '西南'
        } else if (du >= 248 && du < 293) {
            return '西'
        }  else if (du >= 293 && du < 338) {
            return '西北'
        }  else {
            return null
        }
    }
}

App(options)
