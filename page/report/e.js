const log = console.log.bind(console)
const config = require('../../ku/js/config.js')
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
            title: '自定义标题',
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
        User: User,
        controls: [{
            id: 1,
            iconPath: 'img/iconRelocation@3x.png',
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
                icon: "iconAccident@3x.png",
                text: "交通事故"
            },
            {
                checked: false,
                icon: "iconWater@3x.png",
                text: "积水"
            },
            {
                checked: false,
                icon: "iconFenglu@3x.png",
                text: "封路"
            },
            {
                checked: false,
                icon: "iconShigong@3x.png",
                text: "施工"
            },
            {
                checked: false,
                icon: "iconHonglvdeng@3x.png",
                text: "道路故障"
            },
            {
                checked: false,
                icon: "iconBuwenmGrey@3x.png",
                text: "不文明驾驶"
            },
        ],
        feel: ["畅","缓","慢","挤"],
        checked: {
            feel: 0
        }
    },
    onLoad() {
    },
    onReady() {
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
            checked: checked
        })
    },
    bindJam(e) {
        let that = this
        let i = e.currentTarget.dataset.index
        let jam = that.data.jam
        jam[i].checked = !jam[i].checked
        that.setData({
            jam: jam
        })
    },
    bindSend(e) {
        User.info = wx.getStorageSync('userInfo')
        User.location = wx.getStorageSync('userLocation')
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
        let reason = arr.join(',') || "0"
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
                traffic: that.data.checked.feel,
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
                "ucloudtech_3rd_key": User.info.session_key
            },
            success: callback,
            fail: (err) => {
                log(err)
            }
        })
    }
})
