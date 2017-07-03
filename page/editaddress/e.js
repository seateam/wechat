const log = console.log.bind(console)
const User = {
    info: wx.getStorageSync('userInfo'),
    location: wx.getStorageSync('userLocation')
}
// 反转坐标
const deitude = function(itude) {
    return itude.split(',').reverse().join(',')
}

const result = {
    checked: 0,
    name: null,
    destination: null
}
Page({
    data: {
        location: "定位中…",
        checked: result.checked,
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
        // 卡片
        User.cards = wx.getStorageSync('userCards')
        if (User.cards.length === 0) {
            User.cards = []
        }
        // 目的地
        result.destination = deitude(User.location.now)
        this.setData({
            location: User.location.data.regeocode.addressComponent.township
        })
    },
    bindInputBlur: function(e) {
        result.name = e.detail.value
    },
    bindChoose: function() {
        let that = this
        wx.chooseLocation({
            success: (res) => {
                let name = res.name
                let dot = [res.latitude,res.longitude].join(',')
                result.destination = dot
                that.setData({
                    location: name
                })
            }
        })
    },
    bindDel: function() {
        wx.showModal({
            content: "确认删除吗？",
            cancelColor: "#9B9B9B",
            confirmColor: "#FF633D"
        })
    },
    bindIcon: function(e) {
        let i = e.currentTarget.dataset.index
        log('icon', i)
        this.setData({
            checked: i
        })
    },
    bindSave: function() {
        if (result.name) {
            // log(wx.getStorageSync('userCards'))
            // let newCard = {
            //     destination: null
            // }
            log(result)
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
})
