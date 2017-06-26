import weSwiper from '../../ku/we_swiper/src/main'
const log = console.log.bind(console, '>>>')
const config = require('../../ku/js/config.js')
const app = getApp()
const User = {
    info: wx.getStorageSync('userInfo'),
    location: wx.getStorageSync('userLocation'),
    cards:  wx.getStorageSync('userCards')
}
Page({
    data: {
        cards: User.cards,
        township: '定位中…',
        dotNow: 1
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    onShareAppMessage: function () {
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
         this.init()
         this.initJam()
    },
    onReachBottom: function() {
        // 上滑
    },
    init() {
        let that = this
        that.setData({
            township: User.location.data.regeocode.addressComponent.township
        })
        const device = wx.getSystemInfoSync()
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
            width: 622 * device.windowWidth / 750,
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
       //  status <= 0 畅
       //  status <= 0.2 缓
       //  status <= 1 慢
       //  status > 1 堵
       let deStatus = function(s) {
           if (s <= 0) {
               return "畅"
           } else if (s <= 0.2) {
               return "缓"
           } else if (s <= 1) {
               return "慢"
           } else if (s > 1) {
               return "堵"
           }
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
            success: function(res) {
                res.data.forEach(function(e) {
                    User.cards[e.index].jam = deStatus(e.data.info.status)
                })
                that.setData({
                    cards: User.cards
                })
            },
            fail: function(err){
                log(err)
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
            url: "../sendshare/e"
        })
    },
    bindRefresh() {
        log('刷新')
    },
    bindSet: function() {
        wx.navigateTo({
            url: "../editaddress/e"
        })
    },
    bindCard: function(e) {
        let id = e.currentTarget.dataset.id
        if (!e.target.dataset.btn) {
            log("卡片", id)
        }
    }
})
