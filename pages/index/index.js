var app = getApp()
Page({
    data: {
    imgUrls: [
      'http://i3.mifile.cn/a4/xmad_14924228925772_WRpTQ.jpg',
      'http://i3.mifile.cn/a4/xmad_14917471739205_EgXRY.jpg',
      'http://i3.mifile.cn/a4/xmad_14917472556483_dUXkz.jpg',
      'http://i3.mifile.cn/a4/xmad_14926930285634_rFZyK.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    userInfo: null,
    name: 'Hasaki'
    },
    onLoad: function () {
        var that = this
        wx.login({
            success: function () {
                wx.getUserInfo({
                    withCredentials: false,
                    success: function (res) {
                        that.setData({
                            userInfo: res.userInfo
                        })
                    }
                })
            }
        })
    },
    changeName: function() {
        this.setData({
            name: '大香蕉'
        })
    },
    TakePhoto: function() {
        wx.chooseImage({
            count: 9, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths
                wx.previewImage({
                    urls: tempFilePaths // 需要预览的图片http链接列表
                })
            }
        })
        // wx.switchTab({
        //     url: '../logs/log'
        // })
        // wx.navigateTo({
        //     url: '../logs/log'
        // })
        // wx.redirectTo({
        //     url: '../logs/log'
        // })
        // wx.navigateBack({
        //     delta: getCurrentPages().length
        // })
    },
    toMap: function() {
        wx.navigateTo({
            url: '../map/map'
        })
    }
})
