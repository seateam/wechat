const log = console.log.bind(console)
const amapFile = require('../../ku/js/amap-wx.js')
const config = require('../../ku/js/config.js')
// 反转坐标
const deitude = function(itude) {
    return itude.split(',').reverse().join(',')
}
const db = {
    markers: [{
        iconPath: '../../ku/img/icecream-07.png',
        id: 0,
        latitude:  null,
        longitude: null,
        width: 24,
        height: 34
    }, {
        iconPath: '../../ku/img/icecream-18.png',
        id: 1,
        latitude: null,
        longitude: null,
        width: 24,
        height: 34
    }]
}
let mapCtx = null
const mapButton = {
    1: function() {
        mapCtx.moveToLocation()
    },
    2: function() {
        wx.redirectTo({
          url: '../../pages/index/e'
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
        controls: [{
            // id: 1,
            iconPath: '../../ku/img/bottom.png',
            // clickable: true,
            position: {
                left: 0,
                top: 603 - 100,
                width: 375,
                height: 100
                }
            }, {
                id: 1,
                iconPath: '../../ku/img/sea.png',
                clickable: true,
                position: {
                    left: 10,
                    top: 603 - 50 - 10,
                    width: 50,
                    height: 50
                }
            }, {
                id: 2,
                iconPath: '../../ku/img/mountain.png',
                clickable: true,
                position: {
                    left:375 / 2 - 25,
                    top: 603 - 50 - 10,
                    width: 50,
                    height: 50
                }
            }
        ],
        myAmapFun: null
    },
    onReady: function (e) {
      // 使用 wx.createMapContext 获取 map 上下文
      mapCtx = wx.createMapContext('navi_map')
    },
    onLoad: function() {
        let that = this;
        let key = config.key;
        this.myAmapFun = new amapFile.AMapWX({
            key: key
        })
        // 气泡测试
        let testBubble = function() {
            let now = deitude("104.06951,30.537107")
            let end = deitude("104.118492,30.745042")
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
                url: config.url + '/traffic/route',
                data: {
                    // 出发点
                    origin: deitude(now),
                    // 目的地
                    destination: deitude(end)
                },
                method: "GET",
                header: {
                    "Content-Type": "application/json",
                },
                success: function(res) {
                    let dot = res.data.points
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
                            iconPath: '../../ku/img/icecream-18.png',
                            id: 1,
                            latitude: i.lat,
                            longitude: i.lon,
                            width: 24,
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
        testBubble()
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
        that.myAmapFun.getDrivingRoute({
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
        mapCtx.includePoints({
          padding: [40, 20, 20, 20],
          points: this.data.markers
        })
    },
    bindControls: function(e) {
        mapButton[e.controlId]()
    }
})
