//index.js
//获取应用实例

// This is our App Service.
// This is our data.
var app = getApp()
// Register a Page.
Page({
  data: {
    motto: '天下一地武道会',
    userInfo: {},
    name: 'Hasaki'
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  },
  changeName: function(e) {
    // sent data change to view
    this.setData({
      name: '罗总'
    })
  },
  nextPage: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  }
})

// Page({
//
// data: {
//   motto: '天下一地武道会',
//   userInfo: {}
// },
// //事件处理函数
// bindViewTap: function() {
//   wx.navigateTo({
//     url: '../logs/logs'
//   })
// },
// onLoad: function () {
//   console.log('点击')
//   var that = this
//   //调用应用实例的方法获取全局数据
//   app.getUserInfo(function(userInfo){
//     //更新数据
//     that.setData({
//       userInfo:userInfo
//     })
//   })
// }
//
// })
