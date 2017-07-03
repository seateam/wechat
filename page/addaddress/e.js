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
        let now = deitude(User.location.now)
        // 目的地
        result.destination = now
        result.origin = now
        result.myorigin = now
        this.setData({
            location: User.location.data.regeocode.addressComponent.township
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
    bindAdd: function() {
        let i = this.data.checked
        result.icon = iconArr[i]
        if (result.name) {
            result.jam = "堵"
            let cards = wx.getStorageSync('userCards')
            if (cards.length === 0) {
                cards = []
            }
            cards.push(result)
            wx.setStorageSync('userCards', cards)
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
