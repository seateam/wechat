const log = console.log.bind(console)
const amapFile = require('../../ku/js/amap-wx.js')
const config = require('../../ku/js/config.js')
const db = {
    markers: [{
        iconPath: '../../ku/img/icecream-07.png',
        id: 0,
        latitude:  null,
        longitude: null,
        width: 23,
        height: 33
    }, {
        iconPath: '../../ku/img/icecream-18.png',
        id: 1,
        latitude: null,
        longitude: null,
        width: 24,
        height: 34
    }]
}

let markersData = []
Page({
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    data: {
        // now 30.572269,104.066541
        // end 30.70775,104.08171
        markers: [],
        polyline: [],
        myAmapFun: null
    },
    onReady: function (e) {
      // 使用 wx.createMapContext 获取 map 上下文
      this.mapCtx = wx.createMapContext('navi_map')
    },
    onLoad: function() {
        var that = this;
        var key = config.key;
        this.myAmapFun = new amapFile.AMapWX({
            key: key
        })
        // myAmapFun.getRegeo({
        //     location: '116.481028,39.989643',
        //     success: function(data) {
        //         log(data)
        //     }
        // })
        // this.show(myAmapFun)
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
        // 反转坐标
        let deitude = function(itude) {
            return itude.split(',').reverse().join(',')
        }
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
                    that.marks()
                } else {
                    log('超过350km')
                }

            },
            fail: function(info) {
                console.log(info);
            }
        })
    },
    path: function() {
        let that = this
        wx.chooseLocation({
            success: function(end) {
                wx.getLocation({
                    type: 'wgs84',
                    success: function(now) {
                        let arr = db.markers
                        arr[0].latitude = now.latitude
                        arr[0].longitude = now.longitude
                        arr[1].latitude = end.latitude
                        arr[1].longitude = end.longitude

                        that.setData({
                            markers: arr
                        })

                        now = [now.latitude,now.longitude].join(',')
                        end = [end.latitude, end.longitude].join(',')
                        that.show(that, now, end)
                    }
                })
            },
            fail: function(err) {
                log(err)
            }
        })
    },
    marks: function() {
        this.mapCtx.includePoints({
          padding: [40, 20, 20, 20],
          points: this.data.markers
        })
    }
})
