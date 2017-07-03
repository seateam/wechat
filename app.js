const log = console.log.bind(console, '>>>')
const amapFile = require('ku/js/amap-wx.js')
const config = require('ku/js/config.js')

App({
    // onLaunch 全局登陆触发一次
    onLaunch() {
        // 开启罗盘
        // wx.startCompass()

        //卡片测试
        let testCards = function() {
            let deitude = function(itude) {
                return itude.split(',').reverse().join(',')
            }
            let cards = [
                {
                    name: '升仙湖',
                    shortName: '升仙湖',
                    jam: "畅",
                    icon: "home",
                    time: '25',
                    km: '10',
                    // 出发点
                    origin: deitude('30.56585,104.06588'), // 环球中心
                    // 目的地
                    destination: deitude('30.70775,104.08171'), // 升仙湖
                    // 我的位置
                    myorigin: deitude('30.572269,104.066541'), // 公司
                    // 躲避拥堵
                    // isGetRouts: false,
                    // 记录起点
                    // isStart: false
                },
                {
                    name: '黄龙奇观',
                    shortName: '黄龙奇…',
                    jam: "畅",
                    icon: "school",
                    time: '11',
                    km: '90',
                    // 出发点
                    origin: deitude('33.18523,103.9267'), // 九寨沟风景区
                    // 目的地
                    destination: deitude('32.74994,103.82415'), // 黄龙奇观
                    // 我的位置
                    myorigin: deitude('30.572269,104.066541'), // 公司
                    // isGetRouts: false,
                    // isStart: false
                },
                {
                    name: '华阳客运中心',
                    shortName: '华阳客…',
                    jam: "畅",
                    icon: "market",
                    time: '11',
                    km: '90',
                    // 出发点
                    origin: deitude('30.572269,104.066541'), // 公司
                    // 目的地
                    destination: deitude('30.48864,104.06858'), // 华阳客运中心
                    // 我的位置
                    myorigin: deitude('30.572269,104.066541'), // 公司
                    // isGetRouts: false,
                    // isStart: false
                },
                {
                    name: '天府广场',
                    shortName: '天府广…',
                    jam: "缓",
                    icon: "office",
                    time: '11',
                    km: '90',
                    // 出发点
                    origin: deitude('30.66359,104.0526'), // 宽窄巷子
                    // 目的地
                    destination: deitude('30.65742,104.06584'), // 天府广场
                    // 我的位置
                    myorigin: deitude('30.572269,104.066541'), // 公司
                    // // isGetRouts: false,
                    // // isStart: false
                },
                {
                    name: '成都杜甫草堂博物馆',
                    shortName: '成都杜…',
                    jam: "堵",
                    icon: "original",
                    time: '999',
                    km: '999',
                    // 出发点
                    origin: deitude('30.64606,104.048'), // 武侯祠博物馆
                    // 目的地
                    destination: deitude('30.66004,104.02876'), // 成都杜甫草堂博物馆
                    // 我的位置
                    myorigin: deitude('30.572269,104.066541'), // 公司
                    // // isGetRouts: false,
                    // // isStart: false
                }
            ]
            wx.setStorageSync('userCards', cards)
        }
        // testCards()
    },
    // 小程序启动 或 后台进入前台展示
    onShow() {
        this.getLocation()
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
                            fail: (err) => {log(err)}
                        })
                    },
                    fail: (err) => {log(err)}
                })
            },
            fail: (err) => {log(err)}
        })
    },
    getLocation(callback) {
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
                        wx.setStorageSync('userLocation', location)
                        if (typeof callback === 'function') { callback() }
                    },
                    fial: function(err) {
                        wx.setStorageSync('userLocation', location)
                        if (typeof callback === 'function') { callback() }
                    }
                })
            },
            cancel: function(res) {
                log(res)
            },
            fail: (err) => {
                log(err)
            }
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
