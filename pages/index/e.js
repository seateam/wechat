const log = console.log.bind(console)
const app = getApp()
Page({
    data: {
        imgUrls: [{
                img: 'http://i3.mifile.cn/a4/xmad_14950995035103_fhWtH.jpg',
                text: '平衡车'
            },
            {
                img: 'http://i3.mifile.cn/a4/xmad_1493109150882_opGFm.jpg',
                text: '眼镜'
            },
            {
                img: 'http://i3.mifile.cn/a4/xmad_14950996440442_FrUIx.jpg',
                text: '路由'
            }
        ],
        indicatorDots: true,
        autoplay: false,
        interval: 4000,
        duration: 800,
        // 用户
        userInfo: null,
        // 罗盘
        compass: null,
        heading: null
    },
    onLoad: function () {
        // 登陆
        if (app.db.userInfo === null) {
            app.login(this)
        }
        // 方向
        let that = this
        wx.onCompassChange(function (res) {
            let du = res.direction.toFixed(2)
            // 全局变量 compass
            app.db.compass = app.direction(du)
            let str = app.db.compass
            if (str !== that.data.compass) {
                that.setData({
                    compass: str,
                    heading: parseInt(du)
                })
            }
        })
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
})
