const log = console.log.bind(console, '>>>')
const config = require('../../ku/js/config.js')
const app = getApp()
const deviceInfo = wx.getSystemInfoSync().windowWidth
const device = function(number) {
    return number * 2 * deviceInfo / 750
}
const zeroReason = ["出现拥堵", "出现交通事故", "积水", "封路", "正在施工", "道路故障", "出现不文明驾驶"]
let User = {
    info: null,
    location: null,
    cards: [],
}
Page({
    data: {
        iosLeft: 'block',
        iosRight: 'block',
        cards: User.cards,
        township: '定位中…',
        dotNow: 0,
        jam: {
            "畅": {
                color: "#e9585c",
                id: "0"
            },
            "缓": {
                color: "#eab52f",
                id: "1"
            },
            "慢": {
                color: "#2eada3",
                id: "2"
            },
            "挤": {
                color: "#207ab6",
                id: "3"
            },
            "距离过长" : {
                color: "#207ab6",
                id: "3"
            },
            // "未知" : {
            //     color: "transparent",
            //     id: "4"
            // }
        },
        status: "畅",
        statusColor: "#207ab6",
        weather: '',
        share: [{
            street: "",
            status: ""
        }],
        smooth: [{
            street: "",
            status: ""
        }],
    },
    onPullDownRefresh() {
        let that = this
        app.getLocation(() => {
            User.location = wx.getStorageSync('userLocation')
            that.setData({
                township: User.location.street_number
            })
            this.initJam()
            this.initZero()
            wx.stopPullDownRefresh()
        })
    },
    onShareAppMessage() {
        return {
            title: '豁然交通',
            // path: 'pages/map_route/e',
            success: function(res) {
                log(res)
                // 转发成功
            },
            fail: function(res) {
                log(res)
                // 转发失败
            }
        }
    },
    onReachBottom() {
        //
    },
    onLoad() {
        // wx.showLoading({
        //     title: "正在登陆",
        //     mask: true
        // })
        let that = this
        app.login(function(userInfo) {
            User.info = userInfo.info
            User.location = userInfo.location
            User.cards = userInfo.cards
            that.init()
            that.initJam()
            that.initZero()
        })
    },
    onShow() {
        let that = this
        if (wx.getStorageSync('onShow') && !User.bindTop) {
            app.getLocation(() => {
                User.location = wx.getStorageSync('userLocation')
                this.initJam()
                that.initZero()
            })
        } else {
            User.bindTop = false
        }
        // User.cards = wx.getStorageSync('userCards')
        that.setData({
            // cards: User.cards,
            township: User.location.street_number || "未知道路"
        })
    },
    init() {
        let that = this
        that.setData({
            cards: User.cards,
            township: User.location.street_number || "未知道路",
            dotNow: User.cards.length > 3 ? 2 : 1,
        })
    },
    initJam() {
        // 启程与否
        User.cards = wx.getStorageSync('userCards')
        for (var i = 0; i < User.cards.length; i++) {
            let e = User.cards[i]
            e.origin = User.location.origin
            e.myorigin = User.location.origin
        }
        let that = this
        let deStatus = function(s) {
            if (s <= 0) {
                return "畅"
            } else if (s <= 0.2) {
                return "缓"
            } else if (s <= 1) {
                return "慢"
            } else if (s > 1) {
                return "挤"
            }
        }
        if (User.cards.length) {
            let callback = function(res) {
                // log("routes", res.data)
                res.data.forEach( e => {
                    let i = e.index
                    let info = e.info
                    let card = User.cards[i]
                    if (Number(e.code) === 200) {
                        card.time = Math.round(info.duration / 60 * 10) / 10
                        card.km = Math.round(info.distance / 1000 * 10) / 10
                        card.jam = deStatus(info.status)
                    } else if (e.message === "距离过长") {
                        card.jam = e.message
                        card.km = 999
                        card.time = 999
                    }
                })
                that.setData({
                    township: User.location.street_number || "未知道路",
                    cards: User.cards
                })
                wx.setStorageSync('userCards', User.cards)
            }
            wx.request({
                url: config.url + '/traffic/routes',
                data: {
                    cards: User.cards
                },
                method: "POST",
                header: {
                    "Content-Type": "application/json",
                    "ucloudtech_3rd_key": User.info.session_key
                },
                success: callback,
                fail: function(err) {
                    log("routes获取失败",err)
                }
            })
        } else {
            log("没有卡片！")
        }
    },
    initZero() {
        let that = this
        let callback = function(res) {
            app.around = res.data.around
            let description = res.data.situation.description
            let wt = res.data.weather[0]
            let weather = `${wt.weather} / ${wt.temperature}°C`
            // 周围路况
            let smooth = function() {
                let arounds = description.length ? description.split("；") : []
                let arr = []
                for (let i of arounds) {
                    // 去句号
                    let e = i.replace('。','').split('：')
                    if (e[1].includes('从') && e[1].includes('到')) {
                    } else if (e[1].includes('附近')) {
                        if (e[1].split('，').length === 1) {
                            arr.push({
                                street: e[0],
                                status: e[1]
                            })
                        }
                    } else if ((e[0] + e[1]).length <= 30) {
                        arr.push({
                            street: e[0],
                            status: e[1]
                        })
                    }

                }
                if (arr.length === 0) {
                    arr = [{
                        street: "附近的道路看起来比较畅通哦，",
                        status: "请务必安全驾驶~~~"
                    }]
                }
                that.setData({
                    smooth: arr.slice(0, 4)
                })
            }()
            // 畅缓慢挤
            let top = function() {
                let e = res.data.situation.evaluation
                let evaluation = e.status.length ? e.status : '0'
                let traffic = [{
                    text: '未知',
                    color: "#207ab6"
                }, {
                    text: '畅',
                    color: "#e9585c"
                }, {
                    text: '',
                    color: "#207ab6"
                }, {
                    text: '挤',
                    color: "#207ab6"
                }]
                let result = traffic[evaluation].text
                let color = traffic[evaluation].color
                if (result) {
                    that.setData({
                        weather: weather,
                        status: result,
                        statusColor: color
                    })
                } else {
                    let huan = Number(e.congested.replace('%',''))
                    let du = Number(e.blocked.replace('%',''))
                    let str = '缓'
                    color = "#eab52f"
                    if (huan + du > 16) {
                        str = '慢'
                        color = "#2eada3"
                    }
                    that.setData({
                        weather: weather,
                        status: str,
                        statusColor: color
                    })
                }
            }()
            // 用户分享
            let points = res.data.around
            let arr = []
            for (let e of points) {
                let name = e.street_number
                let reasons = e.reason.split(',')
                for (let i of reasons) {
                    arr.push({
                        street: name,
                        status: zeroReason[Number(i) + 1]
                    })
                }
            }
            if (arr.length === 0) {
                arr = [{
                    street: "附近暂时没有用户分享路况，",
                    status: "点击下方上报按钮参与分享吧"
                }]
            }
            that.setData({
                share: arr.slice(0, 3)
            })
        }
        wx.request({
            url: config.url + '/home/zero',
            data: {
                longitude: User.location.longitude,
                latitude: User.location.latitude
            },
            method: "POST",
            header: {
                "Content-Type": "application/json",
                "ucloudtech_3rd_key": User.info.session_key
            },
            success: callback,
            fail: function(err) {
                log("zero",err)
            }
        })
    },
    bindReport() {
        wx.navigateTo({
            url: "../report/e"
        })
    },
    bindRefresh() {
        this.onPullDownRefresh()
    },
    bindRefreshZero() {
        this.initZero()
    },
    bindSet(e) {
        let id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: "../editaddress/e?id=" + id
        })
    },
    bindAdd() {
        wx.navigateTo({
            url: "../addaddress/e"
        })
    },
    bindCard(e) {
        let id = e.currentTarget.dataset.id
        if (!e.target.dataset.btn) {
            wx.navigateTo({
                url: "../line/e?id=" + id
            })
        }
    },
    bindTop() {
        wx.setStorageSync('onShow', false)
        User.bindTop = true
        let that = this
        wx.chooseLocation({
            success: (res) => {
                User.location.street_number = res.name || res.address
                User.location.longitude = res.longitude
                User.location.latitude = res.latitude
                User.location.now = [res.latitude, res.longitude].join(',')
                User.location.origin = [res.longitude, res.latitude].join(',')
                wx.setStorageSync('userLocation', User.location)
                that.setData({
                    township: User.location.street_number
                })
                app.data.onShow = 'no'
                this.initJam()
                this.initZero()
            }
        })
    },
    bindChange(e) {
        let that = this
        let index = e.detail.current
        let cards = User.cards
        let length = cards.length > 3 ? cards.length + 2 : cards.length + 1
        let o = {}
        o['0'] = function() {
            that.setData({
                iosLeft: 'none',
                dotNow: e.detail.current,
            })
        }
        o[length] = function() {
            that.setData({
                iosRight: 'none',
                dotNow: e.detail.current,
            })
        }
        if (o[index]) {
            o[index]()
        } else {
            that.setData({
                iosLeft: 'block',
                iosRight: 'block',
                dotNow: e.detail.current,
            })
        }
    },
    bindTouchStart(e) {
        // log('滑动开始')
    },
    bindTouchEnd(e) {
        // log('滑动结束')
    },
})
