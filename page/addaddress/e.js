const log = console.log.bind(console)
const config = require('../../ku/js/config.js')
const $ = require('../../ku/js/bigsea.js')
let result = {}
let User = {}
Page({
    onReachBottom() {
        //
    },
    data: {
        btnSave_css: "",
        location_css: "",
        name_css: "",
        location: "你想去",
        checked: 0,
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    onLoad: function() {
        result = {}
        User.location = wx.getStorageSync('userLocation')
        let now = [User.location.longitude, User.location.latitude].join(',')
        // 目的地
        result.destination = now
        result.origin = now
        result.myorigin = now
        result.street = User.location.street_number
    },
    bindChoose: function() {
        let that = this
        wx.chooseLocation({
            success: (res) => {
                let name = res.name || res.address
                let dot = [res.longitude, res.latitude].join(',')
                result.destination = dot
                result.street = name
                that.setData({
                    location: name,
                    name_css: $.css({
                        display: "block",
                    }),
                    location_css: $.css({
                        "margin-top": "276rpx",
                        color: "#343434",
                    }),
                    btnSave_css: $.css({
                        "border-color": '#648cff',
                        color: '#648cff',
                    })
                })
            }
        })
    },
    bindInputBlur: function(e) {
        result.name = e.detail.value || result.street
    },
    bindAdd: function() {
        let that = this
        if (this.data.btnSave_css) {
            // 安卓距离 bug
            // let i = this.data.checked
            // let start = [User.location.longitude ,User.location.latitude].join(',')
            // if (result.destination === start) {
            //     wx.showModal({
            //         title: '距离太近了',
            //         showCancel: false,
            //         confirmText: "选择地址",
            //         confirmColor: "#7878FF",
            //         success: function(res) {
            //             if (res.confirm) {
            //                 that.bindChoose()
            //             }
            //         }
            //     })
            // }
            result.name = result.name || result.street
            result.jam = "畅"
            result.km = '0'
            result.time = '0'
            result.start = ""
            result.icon = "home"
            wx.request({
                url: config.url + '/cards/add',
                data: result,
                method: "POST",
                header: {
                    "Content-Type": "application/json",
                    "ucloudtech_3rd_key": wx.getStorageSync('userInfo').session_key
                },
                success: function(res) {
                    if (res.data.code === 200) {
                        let cards = wx.getStorageSync('userCards')
                        if (cards.length === 0) {
                            cards = []
                        }
                        cards.reverse().push(result)
                        wx.setStorageSync('userCards', cards.reverse())
                        // 后退
                        wx.reLaunch({
                            url: "../index/e"
                        })
                    } else {
                        log(res)
                        wx.showModal({
                            title: res.data.message,
                            showCancel: false,
                            confirmText: "确定",
                            confirmColor: "#7878FF",
                            success: function(res) {
                                if (res.confirm) {

                                }
                            }
                        })
                    }
                },
                fail: function(err) {
                    log("routes获取失败",err)
                }
            })
        }
    }
})
