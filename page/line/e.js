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
// 贝赛尔曲线
const getBezier = function() {
    // 新算法
    // anchorpoints：贝塞尔基点
    // pointsAmount：生成的点数
    let CreateBezierPoints = function (anchorpoints, pointsAmount) {
        var points = [];
        for (var i = 0; i < pointsAmount; i++) {
            var point = MultiPointBezier(anchorpoints, i / pointsAmount);
            points.push(point);
        }
        return points;
    }
    let MultiPointBezier = function (points, t) {
        var len = points.length;
        var x = 0,
            y = 0;
        var erxiangshi = function(start, end) {
            var cs = 1,
                bcs = 1;
            while (end > 0) {
                cs *= start;
                bcs *= end;
                start--;
                end--;
            }
            return (cs / bcs);
        };
        for (var i = 0; i < len; i++) {
            var point = points[i];
            x += point.x * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
            y += point.y * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
        }
        return {
            x: x,
            y: y
        }
    }
    // 实例
    let arr1 = CreateBezierPoints([
        {x: device(35.5) ,y: device(119.5)},
        {x: device(40.5) ,y: device(115)},
        {x: device(76)   ,y: device(72.5)},
        {x: device(130.5),y: device(71.5)}
    ], 100)
    let arr2 = CreateBezierPoints([
        {x: device(130.5),y: device(71.5)},
        {x: device(185)  ,y: device(70.5)},
        {x: device(203.5),y: device(99.5)},
        {x: device(251)  ,y: device(101)}
    ], 100)
    let arr3 = CreateBezierPoints([
        {x: device(251)  ,y: device(101)},
        {x: device(298.5),y: device(102.5)},
        {x: device(333)  ,y: device(71)},
        {x: device(339.5),y: device(65.5)}
    ], 100)
    let arr = arr1.concat(arr2, arr3)
    return arr
}
const getRatio = function(res) {
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
        // let point = dot.point
        let point = [dot.tms.lon, dot.tms.lat].join(',')
        steps.forEach((step, i1) => {
            step.tmcs.forEach((e, i2) => {
                // 查找点是否在路径上 （后可扩大范围）
                if (e.polyline.includes(point) && temp !== point){
                    temp = point
                    let meter = meters(i1, i2)
                    let bili = Math.round(meter / meterAll * 100) / 100
                    dot.ratio = bili
                    arr.push(dot)
                }
            })
        })
    }
    return arr
}
// 曲线图标
const lineIcon = [
    {
        icon: "iconYongdu@3x.png",
        text: "出现拥堵"
    },
    {

        icon: "iconAccident@3x.png",
        text: "出现交通事故"
    },
    {

        icon: "iconWater@3x.png",
        text: "积水"
    },
    {

        icon: "iconFenglu@3x.png",
        text: "封路"
    },
    {

        icon: "iconShigong@3x.png",
        text: "正在施工"
    },
    {

        icon: "iconHonglvdeng@3x.png",
        text: "道路故障"
    },
    {

        icon: "iconBuwenmGrey@3x.png",
        text: "出现不文明驾驶"
    },
]
const goIcon = {
    "左转": "iconLeft@3x.png",
    "右转": "iconRight@3x.png",
    "向左前方行驶": "iconNearleft@3x.png",
    "向右前方行驶": "iconNearright@3x.png",
    "左转调头": "iconTurn@3x.png",
    "向左后方行驶": "iconTurn@3x.png",
    "向右后方行驶": "iconTurn@3x.png",
    "直行": "iconUp@3x.png",
    "靠左": "iconNearleft@3x.png",
    "靠右": "iconNearright@3x.png",
    "进入环岛": "iconHuandao@3x.png",
    "离开环岛": "iconHuandao@3x.png",
    "减速行驶": "iconHuandao@3x.png",
    "插入直行": "iconUp@3x.png",
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
      Bezier: null,
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
      startColor: ""
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
            }
        })
        // 起点 终点
        let start = [User.location.longitude, User.location.latitude].join(',')
        let end = User.card.destination
        that.init(start, end)
    },
    init(start, end) {
        // log("启程与否", User.card.start)
        let that = this
        let Bezier = getBezier() // 取点
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
                    // 新时间距离
                    // if (User.Refresh) {
                    //     User.card.time = Math.round(res.data.info.trafficData.duration / 60 * 10) / 10
                    //     User.card.km = Math.round(res.data.info.trafficData.distance / 1000 * 10) / 10
                    //     User.cards[User.card.id] = User.card
                    //     wx.setStorageSync('userCards', User.cards)
                    //     that.setData({
                    //         card: User.card
                    //     })
                    // }
                    // 画
                    let draw = function() {
                        let steps = res.data.info.trafficData.steps
                        let radio
                        for(var i = 0; i < steps.length; i++) {
                            let e = steps[i]
                            if (e.assistant_action === '到达途经地') {
                                radio = startRatio(res, i)
                                break
                            }
                        }
                        let startIndex
                        if (radio) {
                            startIndex = parseInt( radio * Bezier.length )
                        } else {
                            startIndex = 0
                        }
                        // 新时间距离
                        if (User.Refresh) {
                            User.card.time = Math.round(res.data.info.trafficData.duration / 60 * 10) / 10
                            User.card.km = Math.round(res.data.info.trafficData.distance / 1000 * 10) / 10
                            that.setData({
                                card: User.card
                            })
                            User.Refresh = false
                        }
                        // 路线上的点 points
                        // 我周围的点 arounds
                        if (Number(res.data.code) !== 200) {
                            return;
                        }
                        // 去重 取比例
                        let ratioArr = getRatio(res)
                        // 坐标点
                        let indexArr = []
                        ratioArr.forEach((e, i) => {
                            e.index = parseInt( Bezier.length * e.ratio )
                            indexArr.push(e)
                        })
                        // 画线
                        const ctx = wx.createCanvasContext('myCanvas')
                        ctx.setLineCap('round')
                        ctx.setLineWidth(2)
                        ctx.setStrokeStyle('#4990e2')
                        let drawBezierPoints = function(arr) {
                            ctx.moveTo(arr[0].x, arr[0].y)
                            for (let i of arr) {
                                ctx.lineTo(i.x, i.y)
                            }
                            ctx.stroke()
                        }(Bezier)
                        // 画圆点
                        ctx.beginPath()
                        ctx.arc(device(35.5), device(119.5), device(4), 0, 2 * Math.PI)
                        ctx.setFillStyle('#7ed321')
                        ctx.fill()
                        ctx.beginPath()
                        ctx.arc(device(339.5),device(65.5), device(4), 0, 2 * Math.PI)
                        ctx.setFillStyle('#ff2c46')
                        ctx.fill()
                        // 贴图片
                        that.initImage(startIndex, indexArr, Bezier, ctx)
                        // over
                        ctx.draw()
                    }()
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
    initImage(startIndex, indexArr, Bezier, ctx) {
        // 画气泡
        for (let i of indexArr) {
            let index = i.index
            if (index > 0) {
                index = index - 1
            }
            let e = Bezier[index]
            let x = Math.round(e.x - device(22))
            let y = Math.round(e.y - device(50))
            let icon = lineIcon[0].icon
            if (i.reason) {
                let index = i.reason.split(',')[0]
                icon = lineIcon[Number(index) + 1].icon
            }
            ctx.drawImage('img/line/' + icon, x, y, device(44), device(50))
        }
        // 画起点 ( 起点不变
        let e = Bezier[startIndex]
        ctx.drawImage('img/iconOLoca@3x.png', e.x - device(8), e.y - device(8), device(16), device(16))
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
            let name = e.street_number
            let reasons = e.reason.split(',')
            for (let i of reasons) {
                arr.push({
                    street: name,
                    status: zeroReason[Number(i) + 1]
                })
            }
        }
        if (arr.length) {
            this.setData({
                arounds: arr.slice(0, 5)
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
        let Bezier = getBezier() // 取点
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
                // 画
                let draw = function() {
                    let steps = res.data.info.trafficData.steps
                    let startIndex = 0
                    // 路线上的点 points
                    // 我周围的点 arounds
                    if (Number(res.data.code) !== 200) {
                        return;
                    }
                    // 去重 取比例
                    let ratioArr = getRatio(res)
                    // 坐标点
                    let indexArr = []
                    ratioArr.forEach((e, i) => {
                        e.index = parseInt( Bezier.length * e.ratio )
                        indexArr.push(e)
                    })
                    // 画线
                    const ctx = wx.createCanvasContext('myCanvas')
                    ctx.setLineCap('round')
                    ctx.setLineWidth(2)
                    ctx.setStrokeStyle('#4990e2')
                    let drawBezierPoints = function(arr) {
                        ctx.moveTo(arr[0].x, arr[0].y)
                        for (let i of arr) {
                            ctx.lineTo(i.x, i.y)
                        }
                        ctx.stroke()
                    }(Bezier)
                    // 画圆点
                    ctx.beginPath()
                    ctx.arc(device(35.5), device(119.5), device(4), 0, 2 * Math.PI)
                    ctx.setFillStyle('#7ed321')
                    ctx.fill()
                    ctx.beginPath()
                    ctx.arc(device(339.5),device(65.5), device(4), 0, 2 * Math.PI)
                    ctx.setFillStyle('#ff2c46')
                    ctx.fill()
                    // 贴图片
                    that.initImage(startIndex, indexArr, Bezier, ctx)
                    // over
                    ctx.draw()
                }()
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
