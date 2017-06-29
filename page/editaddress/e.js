const log = console.log.bind(console)
const User = {
    info: wx.getStorageSync('userInfo'),
    location: wx.getStorageSync('userLocation')
}
Page({
    data: {
        location: "定位中…",
        checked: 0,
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
        wx.chooseLocation({
            success: (res) => {
                let name = res.name
                let dot = [res.latitude,res.longitude].join(',')
                log(name, dot)
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
        this.setData({
            checked: i
        })
    }
})
