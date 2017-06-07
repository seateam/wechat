//app.js
const log = console.log.bind(console)
const getUserInfo = function() {
    let that = this
    wx.login({
        success: function () {
            wx.getUserInfo({
                withCredentials: false,
                success: function (res) {
                    wx.setStorageSync('userInfo', res.userInfo)
                },
                fail: (err) => {log(err)}
            })
        },
        fail: (err) => {log(err)}
    })
}
const getLocation = function() {
    wx.getLocation({
        success: function(res) {
            res.now = [res.latitude, res.longitude].join(',')
            wx.setStorageSync('userLocation', res)
        },
        cancel: function(res) {
            console.log(res);
        },
        fail: (err) => {
            log(err)
        }
    })
}
App({
    // onLaunch 全局登陆触发一次
    onLaunch: function () {
        getUserInfo()
        // 开启罗盘
        // wx.startCompass()
    },
    // 小程序启动 或 后台进入前台展示
    onShow: function() {
        getLocation()
    },
    // 暂时不用
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
})
