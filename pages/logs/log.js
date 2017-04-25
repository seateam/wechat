var c = require('../../ku/bigsea.js')
var options = {
  data: {
    logs: []
  },
  onLoad: function () {
    var logs = wx.getStorageSync('logs') || []
    var arr = []
    for (var i of logs) {
      var e = c.Lunar(new Date(i))
      arr.push(e.Str)
    }
    this.setData({
      logs: arr
    })
  },
  changeName: function() {
      var that = this
    that.setData({
      logs: ['吃饭','睡觉']
    })
  },
  clearLogs: function() {
    wx.removeStorageSync('logs')
    // delete localStorage.logs
    this.setData({
      logs: []
    })
  }
}
Page(options)
