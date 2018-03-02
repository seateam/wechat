const log = console.log.bind(console)
const config = require('../../ku/js/config.js')
const $ = require('../../ku/js/bigsea.js')
const app = getApp()
const User = {
    info: null,
    location: null,
    mapCtx: null
}
const deviceInfo = wx.getSystemInfoSync().windowWidth
const device = function(number) {
    return number * 2 * deviceInfo / 750
}
const mapButton = {
    1: function() {
        User.mapCtx.moveToLocation()
    }
}
Page({
    onPullDownRefresh() {
        // 停止刷新
        wx.stopPullDownRefresh()
    },
    onReachBottom() {
        //
    },
    onShareAppMessage() {
        return {
            title: '上报路况',
            // path: '/pages/map_route/e',
            success: function(res) {
            // 转发成功
            },
            fail: function(res) {
            // 转发失败
            }
        }
    },
    data: {
        report_css: "",
        User: User,
        controls: [{
            id: 1,
            iconPath: 'img/iconRelocation.png',
            clickable: true,
            position: {
                left:device(15),
                top: device(89),
                width: 36,
                height:36
            }
        }],
        jam: [
            {
                checked: false,
                icon: "iconAccident.png",
                text: "交通事故"
            },
            {
                checked: false,
                icon: "iconWater.png",
                text: "积水"
            },
            {
                checked: false,
                icon: "iconFenglu.png",
                text: "封路"
            },
            {
                checked: false,
                icon: "iconShigong.png",
                text: "施工"
            },
            {
                checked: false,
                icon: "iconHonglvdeng.png",
                text: "道路故障"
            },
            {
                checked: false,
                icon: "iconBuwenmGrey.png",
                text: "不文明驾驶"
            },
        ],
        feel: ["畅","缓","慢","挤"],
        checked: {
            feel: false,
        }
    },
    onLoad() {
        let that = this
        app.login(function(userInfo) {
            User.info = userInfo.info
            User.location = userInfo.location
            that.setData({
                User: User
            })
        })
        // 使用 wx.createMapContext 获取 map 上下文
        User.mapCtx = wx.createMapContext('topMap')
    },
    bindControls(e) {
        let that = this
        mapButton[e.controlId](that)
    },
    bindFeel(e) {
        let that = this
        let i = e.currentTarget.dataset.index
        let checked = that.data.checked
        checked.feel = i
        that.setData({
            checked: checked,
            report_css: $.css({
                color: "#648cff",
                "border-color": "#648cff",
            }),
        })
    },
    bindJam(e) {
        let that = this
        let i = e.currentTarget.dataset.index
        let jam = that.data.jam
        jam[i].checked = !jam[i].checked
        let bool = true
        for (let e of jam) {
            if (e.checked) {
                bool = false
            }
        }
        let report_css
        if (bool && !that.data.checked.feel) {
            report_css = ""
        } else {
            report_css = $.css({
                "color": "#648cff",
                "border-color": "#648cff",
            })
        }
        that.setData({
            jam: jam,
            report_css: report_css,
        })
    },
    bindSend(e) {
        // 公司 104.066541,30.572269 -> 升仙湖 104.08171,30.70775
        let that = this
        let dot = {
            type: "Point",
            // 中间点
            coordinates: [Number(User.location.longitude), Number(User.location.latitude)]
        }
        let arr = []
        that.data.jam.forEach(function(e, i) {
            if (e.checked === true) {
                arr.push(i)
            }
        })
        let reason = arr.join(',') || false
        if (that.data.checked.feel || reason) {
            let callback = function(res) {
                if (res.data.code === 200) {
                    wx.showModal({
                        title: '恭喜您，上报成功！',
                        content: '豁然交通感谢您的支持，期待给您更好的服务☺',
                        showCancel: false,
                        confirmText: "知道了",
                        confirmColor: "#7878FF",
                        success: function(res) {
                            if (res.confirm) {
                                wx.reLaunch({
                                    url: "../index/e"
                                })
                            } else if (res.cancel) {
                                console.log('点击取消')
                            }
                        }
                    })
                } else {
                    wx.showModal({
                        content: '上传失败！',
                        showCancel: false,
                        confirmText: "重试",
                        confirmColor: "#7878FF",
                        success: function(res) {
                            if (res.confirm) {
                                console.log('上报失败！')
                            }
                        }
                    })
                }
            }
            wx.request({
                url: config.url + '/info/save',
                data: {
                    // 道路名称
                    street_number: User.location.street_number,
                    // 拥堵程度 1 - 4 数字
                    traffic: that.data.checked.feel || 1,
                    // 拥堵原因
                    reason: reason,
                    // 当前时间
                    date: Date.now(),
                    // 经纬度
                    location: JSON.stringify(dot),
                    // session
                    user_id: User.info.session_key
                },
                method: "POST",
                header: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "ucloudtechkey": User.info.session_key
                },
                success: callback,
                fail: (err) => {
                    log('/info/save', err)
                }
            })
        }
    }
})
