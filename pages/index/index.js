const log = require('../../ku/js/log.js')
const app = getApp()
// 方向
const direction = function(du) {
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

Page({
    data: {
        compass: null,
    },
    onLoad: function () {
        if (app.db.userInfo === null) {
            app.login(this)
        }
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    clickHead: function() {
        let that = this
        // 开启罗盘
        wx.startCompass()
        wx.onCompassChange(function (res) {
            let du = res.direction.toFixed(2)
            let str = direction(du)
            if (that.data !== str) {
                that.setData({
                    compass: str
                })
            }
        })
    }
})
