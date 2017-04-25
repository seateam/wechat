var amapFile = require('../../ku/amap-wx.js');
var config = require('../../ku/config.js');
var marker = '../../ku/img/icecream-07.png'
var marker_checked = '../../ku/img/icecream-18.png'
var marker_data = [];
Page({
    data: {
        markers: [],
        latitude: '',
        longitude: '',
        textData: {},
        city: ''
    },
    makertap: function(e) {
        var id = e.markerId;
        var that = this;
        that.showMarkerInfo(marker_data, id);
        that.changeMarkerColor(marker_data, id);
    },
    onLoad: function(e) {
        var that = this;
        var key = config.key;
        var myAmapFun = new amapFile.AMapWX({
            key: key
        });
        var params = {
            iconPathSelected: marker_checked,
            iconPath: marker,
            success: function(data) {
                marker_data = data.markers;
                var poisData = data.poisData;
                var markers_new = [];
                marker_data.forEach(function(item, index) {
                    markers_new.push({
                        id: item.id,
                        latitude: item.latitude,
                        longitude: item.longitude,
                        iconPath: item.iconPath,
                        width: item.width,
                        height: item.height
                    })

                })
                if (marker_data.length > 0) {
                    that.setData({
                        markers: markers_new
                    });
                    that.setData({
                        city: poisData[0].cityname || ''
                    });
                    that.setData({
                        latitude: marker_data[0].latitude
                    });
                    that.setData({
                        longitude: marker_data[0].longitude
                    });
                    that.showMarkerInfo(marker_data, 0);
                } else {
                    wx.getLocation({
                        type: 'gcj02',
                        success: function(res) {
                            that.setData({
                                latitude: res.latitude
                            });
                            that.setData({
                                longitude: res.longitude
                            });
                            that.setData({
                                city: '北京市'
                            });
                        },
                        fail: function() {
                            that.setData({
                                latitude: 39.909729
                            });
                            that.setData({
                                longitude: 116.398419
                            });
                            that.setData({
                                city: '北京市'
                            });
                        }
                    })

                    that.setData({
                        textData: {
                            name: '抱歉，未找到结果',
                            desc: ''
                        }
                    });
                }

            },
            fail: function(info) {
                // wx.showModal({title:info.errMsg})
            }
        }
        if (e && e.keywords) {
            params.querykeywords = e.keywords;
        }
        myAmapFun.getPoiAround(params)
    },
    bindInput: function(e) {
        var that = this;
        var url = '../inputtips/input';
        if (e.target.dataset.latitude && e.target.dataset.longitude && e.target.dataset.city) {
            var dataset = e.target.dataset;
            url = url + '?lonlat=' + dataset.longitude + ',' + dataset.latitude + '&city=' + dataset.city;
        }
        wx.redirectTo({
            url: url
        })
    },
    showMarkerInfo: function(data, i) {
        var that = this;
        that.setData({
            textData: {
                name: data[i].name,
                desc: data[i].address
            }
        });
    },
    changeMarkerColor: function(data, i) {
        var that = this;
        var markers = [];
        for (var j = 0; j < data.length; j++) {
            if (j == i) {
                data[j].iconPath = marker_checked;
            } else {
                data[j].iconPath = marker;
            }
            markers.push({
                id: data[j].id,
                latitude: data[j].latitude,
                longitude: data[j].longitude,
                iconPath: data[j].iconPath,
                width: data[j].width,
                height: data[j].height
            })
        }
        that.setData({
            markers: markers
        });
    }

})
