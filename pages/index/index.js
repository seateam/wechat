const log = require('../../ku/js/log.js')
const app = getApp()
const login = function(that) {
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
Page({
    data: {
        userInfo: {}
    },
    onLoad: function () {
        login(this)
    }
})
