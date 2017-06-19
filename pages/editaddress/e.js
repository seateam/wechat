const log = console.log.bind(console)
Page({
    data: {

    },
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
    },
    onShareAppMessage: function() {
        return {
            title: '转发标题',
            path: '/pages/map_route/e',
            success: function(res) {
            // 转发成功
            },
            fail: function(res) {
            // 转发失败
            }
        }
    }
})
