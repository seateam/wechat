//app.js
const log = console.log.bind(console)
const amapFile = require('ku/js/amap-wx.js')
const config = require('ku/js/config.js')
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
            let location = res
            location.now = [res.latitude, res.longitude].join(',')
            let dot = [res.longitude ,res.latitude].join(',')
            wx.request({
                url: 'https://restapi.amap.com/v3/geocode/regeo?parameters',
                data: {
                    key: config.web,
                    location: dot,
                },
                method: "GET",
                header: {
                    "Content-Type": "application/json",
                },
                success: function(res) {
                    location.data = res.data
                    wx.setStorageSync('userLocation', location)
                },
                fial: function(err) {
                    wx.setStorageSync('userLocation', location)
                }
            })
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
