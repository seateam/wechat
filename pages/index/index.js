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
                },
                fail: () => {}
            })
        },
        fail: () => {}
    })
}
Page({
    data: {
        userInfo: null
    },
    onLoad: function () {
        if (this.data.userInfo === null) {
            login(this)
        }
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    clickHead: function() {
        wx.switchTab({
            url: "../md/md"
        })
    }
})
