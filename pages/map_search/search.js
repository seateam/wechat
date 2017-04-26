var amapFile = require('../../ku/amap-wx.js');
var config = require('../../ku/config.js');
var lonlat;
var city;
Page({
    data: {
        tips: {},
        i: 0
    },
    onLoad: function(e) {
        lonlat = e.lonlat;
        city = e.city;
    },
    bindInput: function(e) {
        var that = this;
        var keywords = e.detail.value;
        var key = config.key;
        var myAmapFun = new amapFile.AMapWX({
            key: key
        })
        var i = this.data.i
        if (i < 10) {
            this.setData({
                i: i + 1
            })
            myAmapFun.getInputtips({
                keywords: keywords,
                // location: lonlat,
                // city: city,
                success: function(data) {
                    var i = that.data.i
                    if (data && data.tips) {
                        that.setData({
                            tips: data.tips,
                            i: i - 1
                        })
                    }
                },
                fail: function(err) {}
            })
        }
    },
    bindSearch: function(e) {
        var keywords = e.target.dataset.keywords;
        var url = '../map/map?keywords=' + keywords;
        wx.redirectTo({
            url: url
        })
    }
})
