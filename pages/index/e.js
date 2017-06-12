const log = console.log.bind(console, '>>>')
const config = require('../../ku/js/config.js')
const app = getApp()
import weSwiper from '../../ku/we_swiper/src/main'
let userInfo = null
let location = null
Page({
    data: {
        order: ['red', 'red', 'left', 'left', 'go', 'commany'],
        township: '定位中…'
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    onLoad() {
        let that = this
        that.getUser()
        if (userInfo && location) {
            that.init()
        } else {
            log('首次登陆')
            app.getLocation(function() {
                app.getUserInfo(function() {
                    that.getUser()
                    that.init()
                })
            })
        }
    },
    getUser() {
        userInfo = wx.getStorageSync('userInfo')
        location = wx.getStorageSync('userLocation')
    },
    init() {
        this.setData({
            township: location.data.regeocode.addressComponent.township
        })
        const device = wx.getSystemInfoSync()
        new weSwiper({
            animationViewName: 'animationData',
            slideLength: this.data.order.length + 2,
            initialSlide: 1,
            width: 606 * device.windowWidth / 750,
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
    touchstart(e) {
        this.weswiper.touchstart(e)
    },
    touchmove(e) {
        this.weswiper.touchmove(e)
    },
    touchend(e) {
        this.weswiper.touchend(e)
    },
    shangbao() {
        let dot = {
            type: "Point",
            coordinates: [104.115448, 30.746012]
        }
        let session = userInfo.session_key
        wx.request({
            url: config.url + '/info/save',
            data: {
                // 拥堵程度 1 - 4 数字
                traffic: 1,
                // 用户自定义
                custom: "有大水坑",
                // 拥堵原因
                reason: "下雨",
                // 当前时间
                data: Date.now(),
                // 经纬度
                location: JSON.stringify(dot),
                // session
                user_id: session
            },
            method: "POST",
            header: {
                "Content-Type": "application/x-www-form-urlencoded",
                "ucloudtech_3rd_key": session
            },
            success: function(res) {
                log(res)
            },
            fail: (err) => {log(err)}
        })
    }
})
