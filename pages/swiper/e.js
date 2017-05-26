const log = console.log.bind(console)
Page({
    data: {
        imgUrls: [{
                img: 'http://i3.mifile.cn/a4/xmad_1493109150882_opGFm.jpg',
                text: '眼镜'
            },
            {
                img: 'http://i3.mifile.cn/a4/xmad_14950996440442_FrUIx.jpg',
                text: '路由'
            },
            {
                img: 'http://i3.mifile.cn/a4/xmad_14950995035103_fhWtH.jpg',
                text: '平衡车'
            },
            {
                img: 'http://n1.itc.cn/img8/wb/recom/2016/06/22/146658964434721676.GIF',
                text: '兰博基尼'
            },
            {
                img: 'http://pic1.win4000.com/wallpaper/8/58203d1cadb7d.jpg',
                text: 'cool'
            }
        ],
        indicatorDots: false,
        autoplay: false,
        interval: 4000,
        duration: 800
    },
    bindtap: function(e) {
        // log(e)
    },
    bindChange: function(e) {
        // log(e)
    }
})
