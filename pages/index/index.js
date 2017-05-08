const log = require('../../ku/js/log.js')
const app = getApp()
Page({
    data: {
        userInfo: {}
    },
    onLoad: function () {
        let that = this
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
    }
})
