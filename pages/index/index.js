const log = console.log.bind(console)
const app = getApp()

Page({
    data: {
        userInfo: null,
        compass: null
    },
    onLoad: function () {
        // 登陆
        if (app.db.userInfo === null) {
            app.login(this)
        }
        // 方向
        let that = this
        wx.onCompassChange(function (res) {
            let du = res.direction.toFixed(2)
            // 全局变量 compass
            app.db.compass = app.direction(du)
            let str = app.db.compass
            if (str !== that.data.compass) {
                that.setData({
                    compass: str
                })
            }
        })
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    path: function() {
        let that = this
        wx.chooseLocation({
            success: function(end) {
                wx.getLocation({
                    type: 'wgs84',
                    success: function(now) {
                        log(now, end)
                    }
                })
            }
        })
    }
})
