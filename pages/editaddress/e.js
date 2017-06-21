const log = console.log.bind(console)
const User = {
    info: wx.getStorageSync('userInfo'),
    location: wx.getStorageSync('userLocation')
}
Page({
    data: {
        location: "定位中…"
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
    }
})
