import weSwiper from '../../ku/we_swiper/src/main'
const log = console.log.bind(console, '>>>')
const config = require('../../ku/js/config.js')
const app = getApp()
const deviceInfo = wx.getSystemInfoSync().windowWidth
const device = function(number) {
    return number * 2 * deviceInfo / 750
}
let User = {
    info: null,
    location: null,
    cards: []
}
Page({
    data: {
        cards: User.cards,
        township: '定位中…',
        dotNow: 1,
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
            }
        },
        status: "未知",
        share: [{
            street: "",
            status: ""
        }],
        smooth: [{
            street: "",
            status: ""
        }]
    },
    onPullDownRefresh: function() {
        this.initZero()
        this.initJam()
        wx.stopPullDownRefresh()
    },
    onShareAppMessage: function() {
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
    onLoad() {
        wx.showLoading({
            title: "正在登陆",
            mask: true
        })
        let that = this
        app.login(function(userInfo) {
            User.info = userInfo.info
            User.location = userInfo.location
            User.cards = wx.getStorageSync('userCards')
            that.setData({
                cards: User.cards
            })
            that.init()
            that.initJam()
            that.initZero()
            wx.hideLoading()
        })
        },
    onReachBottom: function() {
        // 上滑
    },
    init() {
        let that = this
        let address = User.location.data.regeocode.addressComponent.streetNumber
        User.location.street_number = address.street + address.number

        that.setData({
            township: User.location.street_number || "未知道路"
        })
        let l = that.data.cards.length
        let slideLength, initialSlide
        if (l > 3) {
            slideLength = l + 3
            initialSlide = 2
        } else {
            slideLength = l + 2
            initialSlide = 1
        }
        new weSwiper({
            animationViewName: 'animationData',
            slideLength: slideLength,
            initialSlide: initialSlide,
            width: Math.floor(device(281)) + Math.floor(device(15)) + Math.floor(device(15)),
            /**
             * swiper初始化后执行
             */
            onInit(weswiper) {

            },
            /**
             * 手指碰触slide时执行
             * swiper
             * event
             */
            onTouchStart(weswiper, event) {

            },
            /**
             * 手指碰触slide并且滑动时执行
             * swiper
             * event
             */
            onTouchMove(weswiper, event) {

            },
            /**
             * 手指离开slide时执行
             * swiper
             * event
             */
            onTouchEnd(weswiper, event) {

            },
            /**
             *  slide达到过渡条件时执行
             */
            onSlideChangeStart(weswiper) {

            },
            /**
             *  swiper从一个slide过渡到另一个slide结束时执行
             */
            onSlideChangeEnd(weswiper) {
                that.setData({
                    dotNow: weswiper.activeIndex
                })
            },
            /**
             *  过渡时触发
             */
            onTransitionStart(weswiper) {

            },
            /**
             *  过渡结束时执行
             */
            onTransitionEnd(weswiper) {

            },
            /**
             *  手指触碰swiper并且拖动slide时执行
             */
            onSlideMove(weswiper) {

            },
            /**
             * slide达到过渡条件 且规定了方向 向前（右、下）切换时执行
             */
            onSlideNextStart(weswiper) {

            },
            /**
             *  slide达到过渡条件 且规定了方向 向前（右、下）切换结束时执行
             */
            onSlideNextEnd(weswiper) {

            },
            /**
             *  slide达到过渡条件 且规定了方向 向前（左、上）切换时执行
             */
            onSlidePrevStart(swiper) {

            },
            /**
             *  slide达到过渡条件 且规定了方向 向前（左、上）切换结束时执行
             */
            onSlidePrevEnd(weswiper) {

            }
        })
    },
    initJam() {
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
                res.data.forEach( e => {
                    let card = User.cards[e.index]
                    if (e.code === 200) {
                        card.time = Math.round(e.data.info.duration / 60 * 10) / 10
                        card.km = Math.round(e.data.info.distance / 1000 * 10) / 10
                        card.jam = deStatus(e.data.info.status)
                    } else if (e.message === "距离过长"){
                        card.jam = e.message
                        card.km = 999
                        card.time = 999
                    }
                })
                that.setData({
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
            // 畅通道路
            let smooth = function() {
                let arounds = res.data.situation.description.split("；")
                let arr = []
                for (let i of arounds) {
                    // 去句号
                    let e = i.replace('。','').split('：')
                    let k = e[1].split('，')
                    if (k[0].slice(-2) === "畅通") {
                        arr.push({
                            street: e[0],
                            status: e[1]
                        })
                    } else if (k[1]) {
                        if (k[0].slice(-2) === "畅通") {
                            arr.push({
                                street: e[0],
                                status: e[1]
                            })
                        }
                    }
                }
                if (arr.length === 0) {
                    arr = [{
                        street: "",
                        status: ""
                    }]
                }
                that.setData({
                    smooth: arr.slice(0, 3)
                })
            }()
            // 畅缓慢挤
            let top = function() {
                let e = res.data.situation.evaluation
                let traffic = ['未知', '畅', '', '挤']
                let result = traffic[e.status]
                if (result) {
                    that.setData({
                        status: result
                    })
                } else {
                    let huan = Number(e.congested.replace('%',''))
                    let du = Number(e.blocked.replace('%',''))
                    let str = '缓'
                    if (huan + du > 16) {
                        str = '慢'
                    }
                    that.setData({
                        status: str
                    })
                }
            }()
            // 用户分享
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
    touchstart(e) {
        this.weswiper.touchstart(e)
    },
    touchmove(e) {
        this.weswiper.touchmove(e)
    },
    touchend(e) {
        this.weswiper.touchend(e)
    },
    bindReport() {
        wx.navigateTo({
            url: "../report/e"
        })
    },
    bindRefresh(e) {
        let id = e.currentTarget.dataset.id
        log('刷新', id)
        this.initJam()
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
        let that = this
        wx.chooseLocation({
            success: (res) => {
                User.location.street_number = res.name
                User.location.longitude = res.longitude
                User.location.latitude = res.latitude
                User.location.now = [res.latitude,res.longitude].join(',')
                wx.setStorageSync('userLocation', User.location)
                that.setData({
                    township: User.location.street_number
                })
                that.onPullDownRefresh()
            }
        })
    }
})
