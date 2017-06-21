const log = console.log.bind(console)
const User = {
    info: wx.getStorageSync('userInfo'),
    location: wx.getStorageSync('userLocation'),
    mapCtx: null
}
const device = wx.getSystemInfoSync()
const mapButton = {
    1: function() {
        User.mapCtx.moveToLocation()
    }
}
Page({
    data: {
        User: User,
        controls: [{
            id: 1,
            iconPath: 'img/iconRelocation@3x.png',
            clickable: true,
            position: {
                left: 30 * device.windowWidth / 750,
                top: 178 * device.windowWidth / 750,
                width: 36,
                height: 36
            }
        }],
        jam: [
            {
                checked: false,
                icon: "iconAccident@3x.png",
                text: "交通事故"
            },
            {
                checked: true,
                icon: "iconWater@3x.png",
                text: "积水"
            },
            {
                checked: false,
                icon: "iconFenglu@3x.png",
                text: "封路"
            },
            {
                checked: true,
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
            feel: 2
        }
    },
    onLoad: function () {

    },
    onShareAppMessage: function() {
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
    onReady: function () {
        // 使用 wx.createMapContext 获取 map 上下文
        User.mapCtx = wx.createMapContext('topMap')
    },
    onPullDownRefresh: function() {
        // 停止刷新
        wx.stopPullDownRefresh()
    },
    bindControls: function(e) {
        let that = this
        mapButton[e.controlId](that)
    },
    bindFeel: function(e) {
        let that = this
        let i = e.currentTarget.dataset.index
        let checked = that.data.checked
        checked.feel = i
        that.setData({
            checked: checked
        })
    },
    bindJam: function(e) {
        let that = this
        let i = e.currentTarget.dataset.index
        let jam = that.data.jam
        jam[i].checked = !jam[i].checked
        that.setData({
            jam: jam
        })
    }
})
