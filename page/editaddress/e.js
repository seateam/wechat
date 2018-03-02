const log = console.log.bind(console)
const config = require('../../ku/js/config.js')
const $ = require('../../ku/js/bigsea.js')
const result = {
    name: null,
    destination: null
}
let User = {}
Page({
    onReachBottom() {
        //
    },
    data: {
        location: "正在定位…",
        name: "",
        focus: false,
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    onLoad: function(option) {
        User.id = option.id
        User.cards = wx.getStorageSync('userCards')
        let card = User.cards[User.id]
        User.location = wx.getStorageSync('userLocation')
        let now = $.deitude(User.location.now)
        // 目的地
        result.destination = card.destination
        result.origin = now
        result.myorigin = now
        result.street = card.street
        this.setData({
            location: card.street,
            name: card.name
        })
    },
    bindChoose: function() {
        let that = this
        wx.chooseLocation({
            success: (res) => {
                let name = res.name || res.address
                let dot = [res.latitude,res.longitude].join(',')
                result.destination = $.deitude(dot)
                result.street = name
                that.setData({
                    location: name
                })
            }
        })
    },
    bindInputBlur: function(e) {
        result.name = e.detail.value
    },
    bindIcon: function(e) {
        let i = e.currentTarget.dataset.index
        this.setData({
            checked: i
        })
    },
    bindSave: function() {
        result.icon = "home"
        if (result.name) {
            let card =  User.cards[User.id]
            card.olddestination = card.destination
            card.destination = result.destination
            card.icon = result.icon
            card.name = result.name
            card.street = result.street
            wx.request({
                url: config.url + '/cards/update',
                data: card,
                method: "POST",
                header: {
                    "Content-Type": "application/json",
                    "ucloudtechkey": wx.getStorageSync('userInfo').session_key
                },
                success: (res) => {
                    // 保存
                    wx.setStorageSync('userCards', User.cards)
                    // 后退
                    wx.reLaunch({
                        url: "../index/e"
                    })
                },
                fail: (err) => {
                    log("update更新失败",err)
                }
            })
        } else {
            this.setData({
                focus: true
            })
        }
    },
    bindDel: function() {
        let index = Number(User.id)
        wx.showModal({
            content: "确认删除吗？",
            cancelColor: "#9B9B9B",
            confirmColor: "#FF633D",
            success: function(res) {
                if (res.confirm) {
                    wx.request({
                        url: config.url + '/cards/destroy',
                        data: {
                            destination: User.cards[index].destination
                        },
                        method: "POST",
                        header: {
                            "Content-Type": "application/json",
                            "ucloudtechkey": wx.getStorageSync('userInfo').session_key
                        },
                        success: (res) => {
                            if (res.data.code === 200) {
                                // 删除
                                User.cards.splice(index, 1)
                                wx.setStorageSync('userCards', User.cards)
                                wx.reLaunch({
                                    url: "../index/e"
                                })
                            }
                        },
                        fail: (err) => {
                            log("destroy删除失败",err)
                        }
                    })
                } else if (res.cancel) {
                    console.log('取消')
                }
            }
        })
    }
})
