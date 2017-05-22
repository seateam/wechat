const log = require('../../ku/js/log.js')
const amapFile = require('../../ku/js/amap-wx.js')
const config = require('../../ku/js/config.js')
const db = {
    marker: '../../ku/img/icecream-07.png',
    marker_checked: '../../ku/img/icecream-18.png'
}

let markersData = []
Page({
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    data: {
        markers: [{
            iconPath: db.marker,
            id: 0,
            latitude: 39.989643,
            longitude: 116.481028,
            width: 23,
            height: 33
        }, {
            iconPath: db.marker_checked,
            id: 0,
            latitude: 39.90816,
            longitude: 116.434446,
            width: 24,
            height: 34
        }],
        polyline: []
    },
    onLoad: function() {
        var that = this;
        var key = config.key;
        var myAmapFun = new amapFile.AMapWX({
            key: key
        })
        myAmapFun.getDrivingRoute({
            origin: '116.481028,39.989643',
            destination: '116.434446,39.90816',
            success: function(data) {
                // console.log(data);
                var points = [];
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
                that.setData({
                    polyline: [{
                        points: points,
                        color: "#0091ff",
                        width: 7,
                        dottedLine: true
                    }]
                });
                if (data.paths[0] && data.paths[0].distance) {
                    log(data.paths[0].distance + '米')
                }
                if (data.taxi_cost) {
                    log('打车约' + Number(data.taxi_cost).toFixed(2)  + '元')
                }
            },
            fail: function(info) {
                console.log(info);
            }
        })
    }
})
