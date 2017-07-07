const log = console.log.bind(console)
const config = require('../../ku/js/config.js')
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
    // 104.072556,30.72382 中间
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
        text: "施工"
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
let User = {}
Page({
    onPullDownRefresh: function() {
        // 停止刷新
        wx.stopPullDownRefresh()
    },
    data: {
      Bezier: null,
      card: {
          km: "999",
          time: "999",
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
      firstSug: {
          distance: 0
      },
      sugs: [{
          distance: 300,
          road: "吉龙路"
      }]
    },
    onLoad(option) {
        let that = this
        // 取卡片
        User.card = wx.getStorageSync('userCards')[option.id]
        User.info = wx.getStorageSync('userInfo')
        User.location = wx.getStorageSync('userLocation')
        that.setData({
            card: User.card,
            trip: {
                startS: User.location.data.regeocode.addressComponent.township || "当前位置",
                endS: User.card.street
            }
        })
        // 起点 终点
        let start = [User.location.longitude, User.location.latitude].join(',')
        let end = User.card.destination
        that.init(start, end)
    },
    init(start, end) {
        let that = this
        let Bezier = getBezier() // 取点
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
                isStart: false,
            },
            method: "POST",
            header: {
                "Content-Type": "application/json",
                "ucloudtech_3rd_key": User.info.session_key
            },
            success: function(res) {
                let draw = function() {
                    User.card.time = Math.round(res.data.info.trafficData.duration / 60 * 10) / 10
                    User.card.km = Math.round(res.data.info.trafficData.distance / 1000 * 10) / 10
                    that.setData({
                        card: User.card
                    })
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
                    that.initImage(indexArr, Bezier, ctx)
                    // over
                    ctx.draw()
                }()
                // 出行建议
                that.initTrip(res)
                that.initJam(res)
            },
            fail: function(err) {
                console.log('err',err);
            }
        })
    },
    initImage(indexArr, Bezier, ctx) {
        // 画气泡
        for (let i of indexArr) {
            let e = Bezier[i.index - 1]
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
        let e = Bezier[0]
        ctx.drawImage('img/iconOLoca@3x.png', e.x - device(8), e.y - device(8), device(16), device(16))
    },
    // 出行建议
    initTrip(res) {
        // for (let e of res.data.info.trafficData.steps) {
        //     log(e.distance, e.action, e.road)
        // }
        let steps = res.data.info.trafficData.steps.slice(0, 4)
        let firstSug = {
            distance: steps[0].distance
        }
        let arr = []
        for(let i = 1; i < steps.length - 1; i++) {
            let e = steps[i]
            arr.push({
                distance: e.distance,
                road: e.road
            })
        }
        this.setData({
            sugs: arr,
            firstSug: firstSug
        })
    },
    // 用户分享
    initJam(res) {
        let arounds = res.data.around
        let result = []
        arounds.forEach(function(e, i) {
            let text = lineIcon[0].text
            if (e.reason) {
                text = lineIcon[Number(e.reason) + 1].text
            }
            result.push({
                around: text,
                street: "江南大道",
                time: "15"
            })
        })
        this.setData({
            arounds: result
        })
    },
    bindMap() {
        wx.navigateTo({
            url: "../map/e"
        })
    },
    bindReport() {
        wx.navigateTo({
            url: "../report/e"
        })
    },
    bindStart() {
        log("启程")
    }
})
