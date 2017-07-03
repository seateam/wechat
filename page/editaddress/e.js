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
        name: "",
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
    onLoad: function(option) {
        User.id = option.id
        User.cards = wx.getStorageSync('userCards')
        let card = User.cards[User.id]
        User.location = wx.getStorageSync('userLocation')
        let now = deitude(User.location.now)
        // 目的地
        result.destination = now
        result.origin = now
        result.myorigin = now
        // 图标
        let checked = 0
        for (var i = 0; i < iconArr.length; i++) {
            if (card.icon === iconArr[i]) {
                checked = i
            }
        }
        this.setData({
            location: card.street,
            checked: checked,
            name: card.name
        })
    },
    bindChoose: function() {
        let that = this
        wx.chooseLocation({
            success: (res) => {
                let name = res.name
                let dot = [res.latitude,res.longitude].join(',')
                result.destination = deitude(dot)
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
        let i = this.data.checked
        result.icon = iconArr[i]
        if (result.name) {
            let card =  User.cards[User.id]
            card.destination = result.destination
            card.icon = result.icon
            card.name = result.name
            wx.setStorageSync('userCards', User.cards)
            wx.reLaunch({
                url: "../index/e"
            })
        } else {
            this.setData({
                focus: true
            })
        }
    },
    bindDel: function() {
        let index = Number(User.id)
        User.cards.splice(index, 1)
        wx.showModal({
            content: "确认删除吗？",
            cancelColor: "#9B9B9B",
            confirmColor: "#FF633D",
            success: function(res) {
                if (res.confirm) {
                    wx.setStorageSync('userCards', User.cards)
                    wx.redirectTo({
                        url: "../index/e"
                    })
                } else if (res.cancel) {
                    console.log('取消')
                }
            }
        })
    }
})
