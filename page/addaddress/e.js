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
    destination: deitude(User.location.now)
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
                result.destination = dot
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
        result.checked = i
        this.setData({
            checked: i
        })
    },
    bindAdd: function() {
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
