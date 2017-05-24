const log = console.log.bind(console)
const app = getApp()
const mapKey = '6XNBZ-67YR3-O7F3I-3MJPM-75IM5-DTBQQ'
Page({
    data: {
        userInfo: null,
        compass: null,
        src: 'https://apis.map.qq.com/ws/streetview/v1/image?size=960x640&pano=10011022120723095812200&pitch=0&heading=0&key=' + mapKey
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
