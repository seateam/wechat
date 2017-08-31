const log = console.log.bind(console)
const config = require('../../ku/js/config.js')
const $ = require('../../ku/js/bigsea.js')
const app = getApp()
// 自适应宽度
const deviceInfo = wx.getSystemInfoSync().windowWidth
const device = function(number) {
    return number * 2 * deviceInfo / 750
}
const zeroReason = ["出现拥堵", "出现交通事故", "积水", "封路", "正在施工", "道路故障", "出现不文明驾驶"]
// 直线图标
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
let User = {}
Page({
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
      lines: [
        //   {
        //       x: 220,
        //       icon: "iconFenglu.png",
        //       messgae: '枪响了',
        //       checked: true,
        //   },
        //   {
        //       x: 40,
        //       icon: "iconWater.png",
        //       messgae: '天府二街发生车祸',
        //       checked: false,
        //   },
        //   {
        //       x: 90,
        //       icon: "iconHonglvdeng.png",
        //       messgae: '双拥路出现晚霞流光溢彩',
        //       checked: false,
        //   },
        //   {
        //       x: 44,
        //       icon: "iconHonglvdeng.png",
        //       messgae: '123',
        //       checked: false,
        //   },
      ],
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
    init(start, end, isGetRouts) {
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
        let callback = function(res) {
            app.res = res
            // 用户分享
            that.initJam()
            // 行程概览
            that.initTrip()
            // 出行建议
            that.initSuggest()
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
                isGetRouts: isGetRouts || false,
                isStart: false,
            },
            method: "POST",
            header: {
                "Content-Type": "application/json",
                "ucloudtech_3rd_key": User.info.session_key
            },
            success: function(res) {
                if (Number(res.data.code) === 200) {
                    callback(res)
                } else {
                    log("situation错误", res.data)
                    wx.showModal({
                        title: res.data.message,
                        showCancel: false,
                        confirmText: "确定",
                        confirmColor: "#7878FF",
                        success: function(res) {
                            if (res.confirm) {
                                //
                            }
                        }
                    })
                }
            },
            fail: function(err) {
                console.log('err',err);
            }
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
    // 行程概览
    initTrip() {
        let res = app.res
        let that = this
        let lineWidth = 315
        let getRatio = function(res) {
            let steps = Array.from( new Set( res.data.info.trafficData.steps ) )
            let points = Array.from( new Set( res.data.points ) )
            let meters = function(i1, i2) {
                let meter = 0
                let step = steps.slice(0, i1)
                // 大路段
                for (let i of step) {
                    meter += Number(i.distance)
                }
                // 子路段
                let tmcs = steps[i1].tmcs.slice(0, i2)
                for (let i of tmcs) {
                    meter += Number(i.distance)
                }
                return meter
            }
            // 去重
            let dotArr = Array.from( new Set( points ) )
            for (var i = 0; i < dotArr.length; i++) {
                let e = dotArr[i]
                dotArr[i].point = [e.lon,e.lat].join(',')
            }
            // 总长
            let meterAll = Number(res.data.info.trafficData.distance)
            let temp = ''
            // 相对位置
            let arr = []
            for (var i = 0; i < dotArr.length; i++) {
                let dot = dotArr[i]
                let point = [dot.tms.longitude, dot.tms.latitude].join(',')
                steps.forEach((step, i1) => {
                    step.tmcs.forEach((e, i2) => {
                        // 查找点是否在路径上 （后可扩大范围）
                        if (e.polyline.includes(point) && temp !== point){
                            temp = point
                            let meter = meters(i1, i2)
                            let bili = Math.round(meter / meterAll * 100) / 100
                            dot.ratio = bili
                            dot.x = Math.round(lineWidth * bili)
                            arr.push(dot)
                        }
                    })
                })
            }
            return arr
        }
        let lines = []
        // x 最小
        let minX = 315
        let minIndex = 0
        let arr = getRatio(res)
        for(let i = 0; i < arr.length; i++) {
            let e = arr[i]
            let index = Number(e.reason.split(',')[0]) + 1
            let reason = lineIcon[index]
            // 判断info坐标
            if (e.x > 315 - 12) {
                e.x = 315 - 12
            }
            if (e.x < minX) {
                minX = e.x
                minIndex = i
            }
            let o = {
                messgae: e.street_number + '出现' + reason.text,
                icon: reason.icon,
                x: device(e.x),
                checked: false,
            }
            lines.push(o)
        }
        if (lines[minIndex]) {
            lines[minIndex].checked = true
        }
        that.setData({
            lines: lines
        })
    },
    // 出行建议
    initSuggest() {
        let res = app.res
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
        log('出行建议')
        this.setData({
            sugs: arr.slice(0, 5)
        })
    },
    bindSuggest() {
        let start = [User.location.longitude, User.location.latitude].join(',')
        let end = User.card.destination
        this.init(start, end, true)
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
    // Line
    bindLine(event) {
        let index = event.currentTarget.dataset.id
        let arr = this.data.lines
        for(let i = 0; i < arr.length; i++) {
            let e = arr[i]
            if (index === undefined) {
                e.checked = false
            } else {
                if (i === index) {
                    e.checked = true
                } else {
                    e.checked = false
                }
            }

        }
        this.setData({
            lines: arr
        })
    },
})
