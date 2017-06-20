const log = console.log.bind(console)
const User = {
    info: wx.getStorageSync('userInfo'),
    location: wx.getStorageSync('userLocation'),
    mapCtx: null
}
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
            iconPath: 'img/sea.png',
            clickable: true,
            position: {
                left: 10,
                top: 10,
                width: 30,
                height: 30
            }
        }],
        jam: [
            {
                checked: "1",
                icon: "iconAccident@3x.png",
                text: "交通事故"
            },
            {
                checked: "0",
                icon: "iconWater@3x.png",
                text: "积水"
            },
            {
                checked: "0",
                icon: "iconFenglu@3x.png",
                text: "封路"
            },
            {
                checked: "0",
                icon: "iconShigong@3x.png",
                text: "施工"
            },
            {
                checked: "0",
                icon: "iconHonglvdeng@3x.png",
                text: "道路故障"
            },
            {
                checked: "0",
                icon: "iconBuwenmGrey@3x.png",
                text: "不文明驾驶"
            },
        ]
    },
    onLoad: function () {

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
    }
})
