const log = console.log.bind(console)
const amapFile = require('../../ku/js/amap-wx.js')
const config = require('../../ku/js/config.js')
const app = getApp()
// 反转坐标
const deitude = function(itude) {
    return itude.split(',').reverse().join(',')
}
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
        iconPath: 'img/icecream-20.png',
        id: 0,
        latitude:  null,
        longitude: null,
        width: 34,
        height: 34
    }, {
        iconPath: 'img/icecream-07.png',
        id: 1,
        latitude: null,
        longitude: null,
        width: 34,
        height: 34
    }],
    controls: [{
            id: 1,
            iconPath: 'img/iconRelocation@3x.png',
            clickable: true,
            position: {
                left: device(10),
                top: device(603 - 36 - 31.5),
                width: device(36),
                height: device(36)
            }
        }, {
            id: 2,
            iconPath: 'img/invalidName@3x.png',
            clickable: true,
            position: {
                left:device(375 / 2 - 25.5),
                top: device(603 - 51 - 21),
                width:  device(51),
                height: device(51)
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
          padding: [40, 20, 20, 20],
          points: that.data.markers
        })
    }
}
Page({
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    data: {
        markers: [],
        polyline: [],
        controls: db.controls
    },
    onLoad: function() {
        let that = this
        app.login(function(userInfo) {
            User.info = userInfo.info
            User.location = userInfo.location
            that.init()
        })
    },
    onReady: function () {
        // 使用 wx.createMapContext 获取 map 上下文
        db.mapCtx = wx.createMapContext('navi_map')
    },
    init: function() {
        let that = this;
        db.myAmapFun = new amapFile.AMapWX({
            key: config.key
        })
        // 气泡测试
        let testBubble = function(now, end) {
            // 起点
            let arr = db.markers
            arr[0].latitude = Number(now.split(',')[0])
            arr[0].longitude = Number(now.split(',')[1])
            arr[1].latitude = Number(end.split(',')[0])
            arr[1].longitude = Number(end.split(',')[1])
            that.setData({
                markers: arr
            })
            wx.request({
                url: config.url + '/traffic/situation',
                data: {
                    // 出发点
                    origin: deitude(now),
                    // 目的地
                    destination: deitude(end),
                    // 我的位置
                    myorigin: deitude(now),
                    // 躲避拥堵
                    // isGetRouts: true,
                    // 记录起点
                    // isStart: true,
                },
                method: "POST",
                header: {
                    "Content-Type": "application/json",
                    "ucloudtech_3rd_key": User.info.session_key
                },
                success: function(res) {
                    log(res)
                    if (Number(res.data.code) !== 200) {
                        return;
                    }
                    let dot = res.data.around
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
                    log(rice + '米')
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
                        that.bindMarks()
                    } else {
                        log('超过350km')
                    }

                    let arr = db.markers
                    for (let i of dot) {
                        arr.push({
                            iconPath: 'img/icecream-11.png',
                            id: 1,
                            latitude: i.lat,
                            longitude: i.lon,
                            width: 34,
                            height: 34
                        })
                    }
                    that.setData({
                        markers: arr
                    })
                },
                fail: function(err) {
                    console.log('err',err);
                }
            })
        }
        let now = User.location.now
        let end = '30.48864,104.06858'
        testBubble(now, end)
    },
    // 解析地址
    deLocation: function() {
        wx.request({
            url: `https://restapi.amap.com/v3/assistant/coordinate/convert?`,
            data: {
                key: '043d1bcd92f7602cd9825bd8f6fd5be7',
                locations: '116.481499,39.990475|116.481499,39.990375',
                coordsys: 'mapbar'
            },
            method: "GET",
            header: {
                "Content-Type": "application/json",
            },
            success: function(res) {
                console.log(res)
            }
        })
    },
    show: function(that, start, end) {
        db.myAmapFun.getDrivingRoute({
            origin: deitude(start),
            destination: deitude(end),
            // city: '成都',
            success: function(data) {
                var points = [];
                // 路线
                if (data.paths && data.paths[0] && data.paths[0].steps) {
                    var steps = data.paths[0].steps;
                    for (var i = 0; i < steps.length; i++) {
                        var poLen = steps[i].polyline.split(';');
                        for (var j = 0; j < poLen.length; j++) {
                            points.push({
                                longitude: parseFloat(poLen[j].split(',')[0]),
                                latitude: parseFloat(poLen[j].split(',')[1])
                            })
                        }
                    }
                }

                // 长度
                let rice = 0
                if (data.paths[0] && data.paths[0].distance) {
                    rice = data.paths[0].distance
                    log(rice + '米')
                }

                // 打车费用
                if (data.taxi_cost) {
                    log('打车约' + Number(data.taxi_cost).toFixed(2)  + '元')
                }
                if (rice < 350000) {
                    that.setData({
                        polyline: [{
                            points: points,
                            color: "#0091ff",
                            width: 7,
                            dottedLine: true
                        }]
                    })
                    that.bindMarks()
                } else {
                    log('超过350km')
                }

            },
            fail: function(info) {
                console.log(info);
            }
        })
    },
    bindPath: function() {
        let that = this
        wx.chooseLocation({
            success: function(end) {
                wx.getLocation({
                    type: 'wgs84',
                    success: function(now) {
                        now = [now.latitude,now.longitude].join(',')
                        end = [end.latitude, end.longitude].join(',')
                        // 设置起点终点气泡
                        let arr = db.markers
                        arr[0].latitude = Number(now.split(',')[0])
                        arr[0].longitude = Number(now.split(',')[1])
                        arr[1].latitude = Number(end.split(',')[0])
                        arr[1].longitude = Number(end.split(',')[1])
                        that.setData({
                            markers: arr.slice(0,2)
                        })
                        that.show(that, now, end)
                    }
                })
            },
            fail: function(err) {
                log('用户取消选择',err)
            }
        })
    },
    bindMarks: function() {
        db.mapCtx.includePoints({
          padding: [40, 20, 20, 20],
          points: this.data.markers
        })
    },
    bindControls: function(e) {
        let that = this
        mapButton[e.controlId](that)
    }
})
