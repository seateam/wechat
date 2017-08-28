const log = console.log.bind(console)
const amapFile = require('../../ku/js/amap-wx.js')
const config = require('../../ku/js/config.js')
const app = getApp()
// 自适应宽度
const deviceInfo = wx.getSystemInfoSync().windowWidth
const device = function(number) {
    return number * 2 * deviceInfo / 750
}
let User = {}
// 默认参数
let db = {
    myAmapFun: null, // 高德API实例
    mapCtx: null,    // 地图实例
    markers: [{
        iconPath: 'img/iconQi.png',
        id: 0,
        latitude:  null,
        longitude: null,
        width: device(30),
        height: device(38)
    }, {
        iconPath: 'img/iconZhong.png',
        id: 1,
        latitude: null,
        longitude: null,
        width: device(30),
        height: device(38)
    }],
    controls: [{
            id: 1,
            iconPath: 'img/iconRelocation.png',
            clickable: true,
            position: {
                left: device(10),
                top: device(603 - 40 - 31.5),
                width: device(40),
                height: device(40)
            }
        }, {
            id: 2,
            iconPath: 'img/invalidName.png',
            clickable: true,
            position: {
                left:device(375 / 2 - 25.5),
                top: device(603 - 59 - 21),
                width:  device(59),
                height: device(59)
            }
        }]
}
// 地图按钮事件
const mapButton = {
    1: function() {
        db.mapCtx.moveToLocation()
    },
    2: function(that) {
        // wx.redirectTo({
        //   url: '../../pages/index/e'
        // })
        db.mapCtx.includePoints({
            padding: [device(58), device(20), device(92), device(20)],
            points: that.data.markers
        })
    }
}
// 曲线图标
const lineIcon = [
    {
        icon: "iconYongdu.png",
        text: "出现拥堵"
    },
    {

        icon: "iconAccident.png",
        text: "出现交通事故"
    },
    {

        icon: "iconWater.png",
        text: "积水"
    },
    {

        icon: "iconFenglu.png",
        text: "封路"
    },
    {

        icon: "iconShigong.png",
        text: "正在施工"
    },
    {

        icon: "iconHonglvdeng.png",
        text: "道路故障"
    },
    {

        icon: "iconBuwenmGrey.png",
        text: "出现不文明驾驶"
    },
]
Page({
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    onReachBottom() {
        //
    },
    data: {
        markers: [],
        polyline: [],
        controls: db.controls
    },
    onLoad: function(option) {
        User.info = wx.getStorageSync('userInfo')
        User.location = wx.getStorageSync('userLocation')
        User.cards = wx.getStorageSync('userCards')
        User.card = User.cards[option.id]
        this.init()
    },
    onReady: function () {
        // 使用 wx.createMapContext 获取 map 上下文
        db.mapCtx = wx.createMapContext('navi_map')
        this.bindMarks()
    },
    init: function() {
        let that = this
        db.myAmapFun = new amapFile.AMapWX({
            key: config.key
        })
        // 起点
        let now = [User.location.longitude, User.location.latitude].join(',')
        let end = User.card.destination
        if (User.card.start) {
            now = User.card.start
        }

        db.markers[0].longitude = Number(now.split(',')[0])
        db.markers[0].latitude = Number(now.split(',')[1])
        db.markers[1].longitude = Number(end.split(',')[0])
        db.markers[1].latitude = Number(end.split(',')[1])
        // 路径
        let draw = function() {
            // res
            let res = app.res
            // around
            let dot = app.around
            if (res) {
                var points = [];
                // 路线
                var steps = res.data.info.trafficData.steps
                for (var i = 0; i < steps.length; i++) {
                    var poLen = steps[i].polyline.split(';');
                    for (var j = 0; j < poLen.length; j++) {
                        points.push({
                            longitude: parseFloat(poLen[j].split(',')[0]),
                            latitude: parseFloat(poLen[j].split(',')[1])
                        })
                    }
                }
                // 长度
                let rice = res.data.info.trafficData.distance
                if (rice < 350000) {
                    that.setData({
                        polyline: [{
                            points: points,
                            color: "#0091ff",
                            width: 6,
                            arrowLine: true,
                            // dottedLine: true
                        }]
                    })
                } else {
                    log('超过350km')
                }

                let arr = db.markers
                for (let i of dot) {
                    // 判断是否和起始点重复
                    if (i.lon === arr[0].longitude || i.lon === arr[1].longitude) {
                        if (i.lat === arr[0].latitude || i.lat === arr[1].latitude) {
                            continue
                        }
                    }
                    let icon = lineIcon[0].icon
                    if (i.reason) {
                        let index = i.reason.split(',')[0]
                        icon = lineIcon[Number(index) + 1].icon
                    }
                    arr.push({
                        iconPath: '../line/img/line/' + icon,
                        id: 1,
                        latitude: i.lat,
                        longitude: i.lon,
                        width: device(44),
                        height: device(50),
                        callout: {
                            display: 'BYCLICK',
                            borderRadius: 5,
                            padding: 8,
                            bgColor: '#333',
                            content: '上报用户：大海\r\n地址：移动互联网创业大厦\r\n路况：拥堵\r\n时间：30分钟前',
                            color: '#FFF',
                        },
                    })
                }
                that.setData({
                    markers: arr
                })
            }
        }()
    },
    bindMarks: function() {
        mapButton[2](this)
    },
    bindControls: function(e) {
        let that = this
        mapButton[e.controlId](that)
    }
})
