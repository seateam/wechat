const log = console.log.bind(console)
const app = getApp()
Page({
    data: {
        // 用户
        userInfo: null,
        // 罗盘
        compass: null,
        heading: null
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
                    compass: str,
                    heading: parseInt(du)
                })
            }
        })
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
})
