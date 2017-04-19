//logs.js
var c = require('../../ku/bigsea.js')
Page({
  data: {
    logs: []
  },
  onLoad: function () {
    var logs = wx.getStorageSync('logs') || []
    var arr = []
    for (var i of logs) {
      var e = c.formatTime(new Date(i))
      arr.push(e)
    }
    this.setData({
      logs: arr
    })
  },
  changeName: function(e) {
    // sent data change to view
    this.setData({
      logs: ['吃饭','睡觉']
    })
  },
  clearLogs: function() {
    wx.removeStorageSync('logs')
    this.setData({
      logs: []
    })
  }
})
