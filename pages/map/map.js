const amapFile = require('../../ku/js/amap-wx.js')
const config = require('../../ku/js/config.js')
const marker = '../../ku/img/icecream-07.png'
const marker_checked = '../../ku/img/icecream-18.png'
let markersData = []
Page({
    data: {
        markers: [],
        latitude: '',
        longitude: '',
        textData: {},
        city: '',
        controls: [{
            id: 0,
            iconPath: '../../ku/img/clear.png',
            position: {
                left: 330,
                top: 15,
                width: 30,
                height: 30
            },
            clickable: true
        }]
    },
    onLoad: function(e) {
        let that = this;
        let key = config.key;
        let myAmapFun = new amapFile.AMapWX({
            key: key
        });
        let params = {
            iconPathSelected: marker_checked,
            iconPath: marker,
            success: function(data) {
                markersData = data.markers;
                let poisData = data.poisData;
                let markers_new = [];
                markersData.forEach(function(item, index) {
                    markers_new.push({
                        id: item.id,
                        latitude: item.latitude,
                        longitude: item.longitude,
                        iconPath: item.iconPath,
                        width: item.width,
                        height: item.height
                    })
                })
                if (markersData.length > 0) {
                    that.setData({
                        markers: markers_new
                    });
                    that.setData({
                        city: poisData[0].cityname || ''
                    });
                    that.setData({
                        latitude: markersData[0].latitude
                    });
                    that.setData({
                        longitude: markersData[0].longitude
                    });
                    that.showMarkerInfo(markersData, 0);
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
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    makertap: function(e) {
        let id = e.markerId;
        let that = this;
        that.showMarkerInfo(markersData, id);
        that.changeMarkerColor(markersData, id);
    },
    controltap: function(e) {
        if (e.controlId === 0) {
            wx.switchTab({
                url: '../map_search/search'
            })
        }
    },
    bindInput: function(e) {
        let that = this;
        let url = '../map_search/search';
        if (e.target.dataset.latitude && e.target.dataset.longitude && e.target.dataset.city) {
            let dataset = e.target.dataset;
            url = url + '?lonlat=' + dataset.longitude + ',' + dataset.latitude + '&city=' + dataset.city;
        }
        wx.redirectTo({
            url: url
        })
    },
    showMarkerInfo: function(data, i) {
        let that = this;
        that.setData({
            textData: {
                name: data[i].name,
                desc: data[i].address
            }
        });
    },
    changeMarkerColor: function(data, i) {
        let that = this;
        let markers = [];
        for (let j = 0; j < data.length; j++) {
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
    },
})
