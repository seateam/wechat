const log = console.log.bind(console, '>>>')
const config = require('../../ku/js/config.js')
const app = getApp()
import weSwiper from '../../ku/we_swiper/src/main'
const deitude = function(itude) {
    return itude.split(',').reverse().join(',')
}
const User = {
    info: wx.getStorageSync('userInfo'),
    location: wx.getStorageSync('userLocation'),
    cards: [
        {
            name: '升仙湖',
            shortName: '升仙湖',
            jam: "畅",
            time: '25',
            km: '10',
            // 出发点
            origin: deitude('30.56585,104.06588'), // 环球中心
            // 目的地
            destination: deitude('30.70775,104.08171'), // 升仙湖
            // 我的位置
            myorigin: deitude('30.572269,104.066541'), // 公司
            // 躲避拥堵
            isGetRouts: false,
            // 记录起点
            isStart: false
        },
        {
            name: '黄龙奇观',
            shortName: '黄龙奇…',
            jam: "畅",
            time: '11',
            km: '90',
            // 出发点
            origin: deitude('33.18523,103.9267'), // 九寨沟风景区
            // 目的地
            destination: deitude('32.74994,103.82415'), // 黄龙奇观
            // 我的位置
            myorigin: deitude('30.572269,104.066541'), // 公司
            isGetRouts: false,
            isStart: false
        },
        {
            name: '华阳客运中心',
            shortName: '华阳客…',
            jam: "畅",
            time: '11',
            km: '90',
            // 出发点
            origin: deitude('30.572269,104.066541'), // 公司
            // 目的地
            destination: deitude('30.48864,104.06858'), // 华阳客运中心
            // 我的位置
            myorigin: deitude('30.572269,104.066541'), // 公司
            isGetRouts: false,
            isStart: false
        },
        {
            name: '天府广场',
            shortName: '天府广…',
            jam: "畅",
            time: '11',
            km: '90',
            // 出发点
            origin: deitude('30.66359,104.0526'), // 宽窄巷子
            // 目的地
            destination: deitude('30.65742,104.06584'), // 天府广场
            // 我的位置
            myorigin: deitude('30.572269,104.066541'), // 公司
            isGetRouts: false,
            isStart: false
        },
        {
            name: '成都杜甫草堂博物馆',
            shortName: '成都杜…',
            jam: "畅",
            time: '11',
            km: '90',
            // 出发点
            origin: deitude('30.64606,104.048'), // 武侯祠博物馆
            // 目的地
            destination: deitude('30.66004,104.02876'), // 成都杜甫草堂博物馆
            // 我的位置
            myorigin: deitude('30.572269,104.066541'), // 公司
            isGetRouts: false,
            isStart: false
        }
    ]
}
Page({
    data: {
        cards: User["cards"],
        township: '定位中…',
        dotNow: 1
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    onShareAppMessage: function () {
        log(getCurrentPages())
        return {
            title: '豁然交通',
            path: 'pages/map_route/e',
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
        new weSwiper({
            animationViewName: 'animationData',
            slideLength: that.data.cards.length + 2,
            initialSlide: 1,
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
        wx.navigateTo({
            url: "../sendshare/e"
        })
    },
    bindRefresh() {
        log('刷新')
        // log(User.cards)
        // status <= 0 畅
        // status <= 0.2 缓
        // status <= 1 慢
        // status > 1 堵
        // wx.request({
        //     url: config.url + '/traffic/routes',
        //     data: {
        //         cards: User.cards
        //     },
        //     method: "POST",
        //     header: {
        //         "Content-Type": "application/json",
        //         "ucloudtech_3rd_key": User.info.session_key
        //     },
        //     success: function(res) {
        //         res.data.forEach(function(e) {
        //             log(e.index, e.data.info.status)
        //         })
        //     },
        //     fail: function(err){
        //         log(err)
        //     }
        // })
    },
    bindSet: function() {
        log('编辑')
    },
    bindCard: function(e) {
        let id = e.currentTarget.dataset.id
        if (!e.target.dataset.btn) {
            log("卡片", id)
        }
    }
})
