const log = console.log.bind(console)
// 反转坐标
const deitude = function(itude) {
    return itude.split(',').reverse().join(',')
}
const iconArr = ["original", "home", "office", "school", "market"]
const result = {
    name: null,
    destination: null
}
let User = {}
Page({
    data: {
        location: "定位中…",
        checked: 0,
        focus: false,
        icon: {
            url: [
                "iconOriginal@3x.png",
                "iconHome@3x.png",
                "iconOffice@3x.png",
                "iconSchool@3x.png",
                "iconMarket@3x.png"
            ]
        }
    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    onLoad: function() {
        User.location = wx.getStorageSync('userLocation')
        let now = [User.location.longitude, User.location.latitude].join(',')
        // 目的地
        result.destination = now
        result.origin = now
        result.myorigin = now
        result.street = User.location.street_number
        this.setData({
            location: result.street
        })
    },
    bindChoose: function() {
        let that = this
        wx.chooseLocation({
            success: (res) => {
                let name = res.name || res.address
                let dot = [res.longitude, res.latitude].join(',')
                result.destination = dot
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
    bindAdd: function() {
        let that = this
        let i = this.data.checked
        result.icon = iconArr[i]
        let start = [User.location.longitude ,User.location.latitude].join(',')
        if (result.destination === start) {
            wx.showModal({
                title: '距离太近了',
                showCancel: false,
                confirmText: "选择地址",
                confirmColor: "#7878FF",
                success: function(res) {
                    if (res.confirm) {
                        that.bindChoose()
                    }
                }
            })
        } else {
            if (result.name) {
                result.jam = "畅"
                result.start = ""
                let cards = wx.getStorageSync('userCards')
                if (cards.length === 0) {
                    cards = []
                }
                cards.reverse().push(result)
                wx.setStorageSync('userCards', cards.reverse())
                // 后退
                wx.navigateBack({
                  delta: 1
                })
            } else {
                this.setData({
                    focus: true
                })
            }
        }
    }
})
