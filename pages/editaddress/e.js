const log = console.log.bind(console)
Page({
    data: {

    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    }
})
