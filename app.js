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
    },
    getUserInfo(callback) {
        let that = this
        wx.login({
            success: function (res) {
                let code = res.code
                wx.getUserInfo({
                    withCredentials: false,
                    success: function (res) {
                        // 获取 ucloud session
                        let userInfo = res.userInfo
                        userInfo.code = code
                        userInfo.rawData = res.rawData
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
                                let cards = res.data.info.cards
                                userInfo.session_key = res.data.info.session_key
                                wx.setStorageSync('userInfo', userInfo)
                                if (typeof callback === 'function') { callback(cards) }
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
            type: "gcj02",
            success: function(res) {
                if (res.accuracy > 40) {
                    // showToast
                    log('当前GPS信号弱，请行驶到开阔地带')
                }
                let location = res
                location.now = [res.latitude, res.longitude].join(',')
                location.origin = [res.longitude, res.latitude].join(',')
                wx.request({
                    url: 'https://restapi.amap.com/v3/geocode/regeo?parameters',
                    data: {
                        key: config.web,
                        location: location.origin,
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
            location: wx.getStorageSync('userLocation'),
            cards: wx.getStorageSync('userCards')
        }
        if (User.info && User.location) {
            if (typeof callback === 'function') { callback(User) }
        } else {
            that.getLocation(function() {
                User.location = wx.getStorageSync('userLocation')
                that.getUserInfo(function(cards) {
                    // 获取 cards
                    let now = [User.location.longitude, User.location.latitude].join(',')
                    for (let i of cards) {
                        i.origin = now
                        i.myorigin = now
                    }
                    wx.setStorageSync('userCards', cards)
                    // 读取
                    User.info = wx.getStorageSync('userInfo')
                    User.cards = wx.getStorageSync('userCards')
                    if (typeof callback === 'function') { callback(User) }
                })
            })
        }
    },
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
