const log = console.log.bind(console)
const config = require('../../ku/js/config.js')
const app = getApp()
const deitude = function(itude) {
    return itude.split(',').reverse().join(',')
}
// 自适应宽度
const deviceInfo = wx.getSystemInfoSync().windowWidth
const device = function(number) {
    return number * 2 * deviceInfo / 750
}
const zeroReason = ["出现拥堵", "出现交通事故", "积水", "封路", "正在施工", "道路故障", "出现不文明驾驶"]
// 曲线图标
const lineIcon = [
    {
        icon: "iconYongdu.png",
        text: "出现拥堵"
    },
    {

        icon: "iconAccident.png",
        text: "出现交通事故"
    },
    {

        icon: "iconWater.png",
        text: "积水"
    },
    {

        icon: "iconFenglu.png",
        text: "封路"
    },
    {

        icon: "iconShigong.png",
        text: "正在施工"
    },
    {

        icon: "iconHonglvdeng.png",
        text: "道路故障"
    },
    {

        icon: "iconBuwenmGrey.png",
        text: "出现不文明驾驶"
    },
]
const goIcon = {
    "左转": "iconLeft.png",
    "右转": "iconRight.png",
    "向左前方行驶": "iconNearleft.png",
    "向右前方行驶": "iconNearright.png",
    "左转调头": "iconTurn.png",
    "向左后方行驶": "iconTurn.png",
    "向右后方行驶": "iconTurn.png",
    "直行": "iconUp.png",
    "靠左": "iconNearleft.png",
    "靠右": "iconNearright.png",
    "进入环岛": "iconHuandao.png",
    "离开环岛": "iconHuandao.png",
    "减速行驶": "iconHuandao.png",
    "插入直行": "iconUp.png",
}
// 到达途经地
const startRatio = (res, i) => {
    let meterAll = res.data.info.trafficData.distance
    let steps = res.data.info.trafficData.steps.slice(0, i)
    let meter = 0
    for (let e of steps) {
        meter += Number(e.distance)
    }
    return Math.round(meter / meterAll * 100) / 100
}
let User = {}
Page({
    onPullDownRefresh: function() {
        User.Refresh = true
        app.getLocation(() => {
            User.location = wx.getStorageSync('userLocation')
            this.onLoad({id:User.card.id})
            wx.stopPullDownRefresh()
        })
    },
    onReachBottom() {
        //
    },
    data: {
      card: {
          km: "0",
          time: "0",
          jam: "畅",
          icon: "home",
          name: "默认"
      },
      trip: {
          startS: "起点",
          endS: "终点"
      },
      jam: {
          "畅": {
              color: "#e9585c",
              id: "0"
          },
          "缓": {
              color: "#eab52f",
              id: "1"
          },
          "慢": {
              color: "#2eada3",
              id: "2"
          },
          "挤": {
              color: "#207ab6",
              id: "3"
          },
          "距离过长" : {
              color: "#207ab6",
              id: "3"
          }
      },
      arounds: [],
      sugs: [{
          distance: 0,
          action: "直行",
          road: "",
          go: "直行"
      }],
      goIcon: goIcon,
      start: "启程",
      startColor: "",
      userImg: "",
    },
    onLoad(option) {
        wx.setStorageSync('onShow', true)
        let that = this
        User.info = wx.getStorageSync('userInfo')
        User.location = wx.getStorageSync('userLocation')
        // 取卡片
        User.cards = wx.getStorageSync('userCards')
        User.card = User.cards[option.id]
        User.card.id = option.id
        that.setData({
            card: User.card,
            trip: {
                startS: User.location.street_number || "当前位置",
                endS: User.card.street
            },
            userImg: User.info.avatarUrl,
        })
        // 起点 终点
        let start = [User.location.longitude, User.location.latitude].join(',')
        let end = User.card.destination
        that.init(start, end)
    },
    init(start, end) {
        // log("启程与否", User.card.start)
        let that = this
        let origin = User.card.start
        if (User.card.start === '') {
            origin = start
        } else {
            that.setData({
                start: "结束",
                startColor: "btn-blue"
            })
        }
        wx.request({
            url: config.url + '/traffic/situation',
            data: {
                // 我的位置
                myorigin: start,
                // 出发点
                origin: origin,
                // 目的地
                destination: end,
                isGetRouts: false,
                isStart: Boolean(User.card.start),
            },
            method: "POST",
            header: {
                "Content-Type": "application/json",
                "ucloudtech_3rd_key": User.info.session_key
            },
            success: function(res) {
                if (Number(res.data.code) === 200) {
                    app.res = res
                    // 出行建议
                    that.initTrip(res)
                    that.initJam(res)
                } else {
                    log("situation错误", res.data)
                }
            },
            fail: function(err) {
                console.log('err',err);
            }
        })
    },
    // 出行建议
    initTrip(res) {
        let steps = res.data.info.trafficData.steps
        let arr = []
        for (let e of steps) {
            // log(e.distance, e.action, e.road)
            if (e.action.length) {
                if (e.road) {
                    arr.push({
                        distance: e.distance,
                        action: "进入",
                        road: e.road,
                        go: e.action
                    })
                } else {
                    arr.push({
                        distance: e.distance,
                        action: e.action,
                        road: "",
                        go: e.action
                    })
                }
            }
        }
        this.setData({
            sugs: arr.slice(0, 3)
        })
    },
    // 用户分享
    initJam() {
        let points = app.around
        let arr = []
        for (let e of points) {
            let reasons = e.reason.split(',')
            let mins = String(parseInt((Date.now() - e.date) / 1000 / 60))
            let uname = User.info.nickName
            if (uname.length > 5) {
                uname = uname.slice(0, 5) +  '...'
            }
            for (let i of reasons) {
                let sname = e.street_number + '有' + zeroReason[Number(i) + 1]
                if (sname.length > 19) {
                    sname = uname.slice(0, 19) +  '...'
                }
                if ((uname + sname).length < 16) {
                    sname += '\n'
                }
                arr.push({
                    user: uname,
                    street: sname,
                    mins: mins
                })
            }
        }
        if (arr.length) {
            this.setData({
                arounds: arr
            })
        }
    },
    // 地图
    bindMap() {
        wx.navigateTo({
            url: "../map/e?id=" + User.card.id
        })
    },
    // 上报
    bindReport() {
        wx.navigateTo({
            url: "../report/e"
        })
    },
    // 启程
    bindStart() {
        let that = this
        let isStart = User.card.start ? true : false
        if (that.data.start === '启程') {
            // 起点 终点
            let start = [User.location.longitude, User.location.latitude].join(',')
            let end = User.card.destination
            let callback = function(res) {
                if (Number(res.data.code) === 200) {
                    User.card.start = start
                    wx.setStorageSync('userCards', User.cards)
                    log(start, "记录成功！")
                } else {
                    wx.showToast({
                        title: res.data.message || '起点记录错误！',
                        icon: 'loading',
                        duration: 3000
                    })
                }
            }
            wx.request({
                url: config.url + '/traffic/situation',
                data: {
                    // 我的位置
                    myorigin: start,
                    // 出发点
                    origin: start,
                    // 目的地
                    destination: end,
                    isGetRouts: false,
                    isStart: isStart
                },
                method: "POST",
                header: {
                    "Content-Type": "application/json",
                    "ucloudtech_3rd_key": User.info.session_key
                },
                success: callback,
                fail: function(err) {
                    console.log('err',err);
                }
            })
            that.setData({
                start: "结束",
                startColor: "btn-blue"
            })
        } else {
            User.cards[User.card.id].start = ''
            wx.setStorageSync('userCards', User.cards)
            that.setData({
                start: "启程",
                startColor: ""
            })
        }
    },
    // 避堵
    bindSuggest() {
        wx.showLoading({
            title: '正在规划'
        })
        // log("启程与否", User.card.start)
        let that = this
        let origin = User.card.start
        if (User.card.start === '') {
            origin = start
        } else {
            that.setData({
                start: "结束",
                startColor: "btn-blue"
            })
        }
        // 起点 终点
        let start = [User.location.longitude, User.location.latitude].join(',')
        let end = User.card.destination
        let callback = function(res) {
            wx.hideLoading()
            if (Number(res.data.code) === 200) {
                app.res = res
                // 新时间距离
                User.card.time = Math.round(res.data.info.trafficData.duration / 60 * 10) / 10
                User.card.km = Math.round(res.data.info.trafficData.distance / 1000 * 10) / 10
                User.cards[User.card.id] = User.card
                wx.setStorageSync('userCards', User.cards)
                that.setData({
                    card: User.card
                })
                // 出行建议
                that.initTrip(res)
                that.initJam(res)
            } else {
                setTimeout(function(){
                    wx.showToast({
                        title: res.data.message || '距离太短',
                        icon: 'loading',
                        duration: 2200
                    })
                }, 300)
            }
        }
        wx.request({
            url: config.url + '/traffic/situation',
            data: {
                // 我的位置
                myorigin: start,
                // 出发点
                origin: start,
                // 目的地
                destination: end,
                isGetRouts: true,
                isStart: false,
            },
            method: "POST",
            header: {
                "Content-Type": "application/json",
                "ucloudtech_3rd_key": User.info.session_key
            },
            success: callback,
            fail: function(err) {
                console.log('err',err);
            }
        })
    }
})
