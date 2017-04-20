
var app = getApp()
Page({
  data: {
    imgUrls: [
      'https://img11.static.yhbimg.com/yhb-img01/2017/04/17/11/01b8ebbf5664673fefc60c9f114dcc64c7.jpg',
      'https://img10.static.yhbimg.com/yhb-img01/2017/04/17/11/016a00f8a3ea303121796ddeead2d5c86b.jpg',
      'https://img10.static.yhbimg.com/yhb-img01/2017/04/17/11/01fbdd551f72683d0d5e5123d9434d05b9.jpg',
      'https://img10.static.yhbimg.com/yhb-img01/2017/04/17/11/01ad1bf1cd460cb7605c7319342da1f4a0.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    userInfo: {},
    name: 'Hasaki'
  },
  onLoad: function () {
   var that = this
   //调用应用实例的方法获取全局数据
   that.setData({
     userInfo: app.Data.userInfo
   })
 },
 changeName: function() {
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
