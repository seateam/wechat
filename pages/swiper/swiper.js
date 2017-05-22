const log = console.log.bind(console)
Page({
    data: {
        imgUrls: [
            'http://i3.mifile.cn/a4/xmad_1493109150882_opGFm.jpg',
            'http://i3.mifile.cn/a4/xmad_14950996440442_FrUIx.jpg',
            'http://i3.mifile.cn/a4/xmad_14950995035103_fhWtH.jpg'
        ],
        imgText: [
            '眼镜',
            '路由器',
            '平衡车'
        ],
        text: '',
        indicatorDots: false,
        autoplay: false,
        interval: 5000,
        duration: 1000
    },
    bindtap: function(e) {
        log(e.target)
    },
    bindChange: function(e) {
        this.setData({
            text: this.data.imgText[e.detail.current]
        })
    },
    changeIndicatorDots: function(e) {
        this.setData({
            indicatorDots: !this.data.indicatorDots
        })
    },
    changeAutoplay: function(e) {
        this.setData({
            autoplay: !this.data.autoplay
        })
    },
    intervalChange: function(e) {
        this.setData({
            interval: e.detail.value
        })
    },
    durationChange: function(e) {
        this.setData({
            duration: e.detail.value
        })
    }
})
