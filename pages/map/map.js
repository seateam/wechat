var amapFile = require('../../ku/amap-wx.js')
var markersData = [];
Page({
    data: {
        markers: [],
        latitude: '',
        longitude: '',
        textData: {}
    },
    makertap: function(e) {
        var id = e.markerId;
        var that = this;
        that.showMarkerInfo(markersData, id);
        that.changeMarkerColor(markersData, id);
    },
    onLoad: function() {
        var that = this;
        var myAmapFun = new amapFile.AMapWX({
            key: 'fead47572a741d3f54aadd4be1d7d90a'
        });
        myAmapFun.getPoiAround({
            iconPathSelected: '/ku/img/icecream-04.png', //选中
            iconPath: '/ku/img/icecream-04.png', //未选中
            // querykeywords: '武侯祠', // 关键字
            success: function(data) {
                markersData = data.markers;
                that.setData({
                    markers: markersData
                });
                that.setData({
                    latitude: markersData[0].latitude
                });
                that.setData({
                    longitude: markersData[0].longitude
                });
                that.showMarkerInfo(markersData, 0);
            },
            fail: function(info) {
                wx.showModal({
                    title: info.errMsg
                })
            }
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
                data[j].iconPath = "/ku/img/icecream-12.png"; //选中 /开头 根目录
            } else {
                data[j].iconPath = "/ku/img/icecream-12.png"; //未选中
            }
            markers.push(data[j]);
        }
        that.setData({
            markers: markers
        });
    }

})
