const log = console.log.bind(console, '>>>')
const amapFile = require('ku/js/amap-wx.js')
const config = require('ku/js/config.js')
App({
    // onLaunch 全局登陆触发一次
    data: {},
    onLaunch() {
        // 开启罗盘
        // wx.startCompass()
    },
    onShow() {
        if (this.data.onShow === 'no') {
        } else {
            this.getLocation()
        }
    },
    onHide() {
        this.data.onShow = undefined
    },
    fail() {
        log('网络状态异常！')
        // wx.showModal({
        //     title: '网络状态异常！',
        //     content: '当前网络不可用，请检查您的网络设置',
        //     showCancel: false,
        //     confirmText: "重试",
        //     confirmColor: "#7878FF",
        //     success: function(res) {
        //         if (res.confirm) {
        //             wx.reLaunch({
        //                 url: "../index/e"
        //             })
        //         }
        //     }
        // })
    },
    getUserInfo(callback) {
        let that = this
        wx.login({
            success: function (res) {
                let code = res.code
                wx.getUserInfo({
                    withCredentials: false,
                    success: function (res) {
                        let userInfo = res.userInfo
                        userInfo.code = code
                        userInfo.rawData = res.rawData
                        // 获取 ucloud session
                        wx.request({
                            url: config.url + '/login',
                            data: {
                                // 出发点
                                wxcode: userInfo.code,
                                rawdata: userInfo.rawData
                            },
                            method: "POST",
                            header: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                            success: function(res) {
                                userInfo.session_key = res.data.info.session_key
                                wx.setStorageSync('userInfo', userInfo)
                                if (typeof callback === 'function') { callback() }
                            },
                            fail: (err) => {that.fail()}
                        })
                    },
                    fail: (err) => {that.fail()}
                })
            },
            fail: (err) => {that.fail()}
        })
    },
    getLocation(callback) {
        let that = this
        wx.getLocation({
            success: function(res) {
                let location = res
                location.now = [res.latitude, res.longitude].join(',')
                let dot = [res.longitude ,res.latitude].join(',')
                wx.request({
                    url: 'https://restapi.amap.com/v3/geocode/regeo?parameters',
                    data: {
                        key: config.web,
                        location: dot,
                    },
                    method: "GET",
                    header: {
                        "Content-Type": "application/json",
                    },
                    success: function(res) {
                        location.data = res.data
                        let address = res.data.regeocode.addressComponent.streetNumber
                        location.street_number = address.street + address.number
                        wx.setStorageSync('userLocation', location)
                        if (typeof callback === 'function') { callback() }
                    },
                    fial: function(err) {
                        wx.setStorageSync('userLocation', location)
                        if (typeof callback === 'function') { callback() }
                    }
                })
            },
            fail: (err) => {that.fail()}
        })
    },
    login(callback) {
        let that = this
        let User = {
            info: wx.getStorageSync('userInfo'),
            location: wx.getStorageSync('userLocation')
        }
        if (User.info && User.location) {
            if (typeof callback === 'function') { callback(User) }
        } else {
            that.getUserInfo(function() {
                that.getLocation(function() {
                    User.info = wx.getStorageSync('userInfo')
                    User.location = wx.getStorageSync('userLocation')
                    if (typeof callback === 'function') { callback(User) }
                })
            })
        }
    },
    // 暂时不用
    direction(du) {
        // 360 / 8 = 45
        if (du >= 338 || du < 23) {
            return '北'
        } else if (du >= 23 && du < 68) {
            return '东北'
        } else if (du >= 68 && du < 113) {
            return '东'
        } else if (du >= 113 && du < 158) {
            return '东南'
        } else if (du >= 158 && du < 203) {
            return '南'
        } else if (du >= 203 && du < 248) {
            return '西南'
        } else if (du >= 248 && du < 293) {
            return '西'
        }  else if (du >= 293 && du < 338) {
            return '西北'
        }  else {
            return null
        }
    }
})
