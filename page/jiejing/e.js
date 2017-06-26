const log = console.log.bind(console)
const app = getApp()
const mapKey = '6XNBZ-67YR3-O7F3I-3MJPM-75IM5-DTBQQ'
Page({
    data: {
        userInfo: null,
        // 罗盘
        compass: null,
        heading: null,
        src: null,
        jiejing: null,
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
    jiejing: function() {
        let that = this
        let db = {
            // location: '30.686345,104.165497',
            // 半径 米
            radius: '200',
            // 正北：heading=0，正东：heading=90, 正南：heading=180，正西：heading=270
            heading: parseInt(that.data.heading) || '0'
        }
        log('方向：',db.heading)
        wx.getLocation({
            type: 'wgs84',
            success: function(now) {
                now = [now.latitude,now.longitude].join(',')
                log('位置：',now)
                downPic(now)
            }
        })
        let enSrc = function(id, heading) {
            let url = `https://apis.map.qq.com/ws/streetview/v1/image?`
            let data = {
                size: '960x640',
                pano: id,
                pitch: '0',
                heading: heading,
                key: mapKey,
            }
            let arr = []
            for (let i of Object.keys(data)) {
                arr.push( [i, data[i]].join('=') )
            }
            that.setData({
                src: url + arr.join('&')
            })
        }
        let downPic = function(now) {
            wx.request({
                url: `https://apis.map.qq.com/ws/streetview/v1/getpano?`,
                data: {
                    location: now,
                    // 半径
                    radius: db.radius,
                    key: mapKey
                },
                method: "GET",
                header: {
                    "Content-Type": "application/json",
                },
                success: function(res) {
                    let data = res.data
                    if (data.status === 0) {
                        enSrc(data.detail.id, db.heading)
                        that.setData({
                            jiejing: 'ok'
                        })
                    } else {
                        // 提示
                        that.setData({
                            jiejing: data.message
                        })
                    }

                }
            })
        }

    }
})
