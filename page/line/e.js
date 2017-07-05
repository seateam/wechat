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
    let steps = res.data.info.trafficData.steps
    let points = res.data.points
    let meters = function(i1, i2) {
        let meter = 0
        let step = steps.slice(0, i1)
        let tmcs = steps[i1].tmcs.slice(0, i2)
        // 大路段
        for (let i of step) {
            meter += Number(i.distance)
        }
        // 子路段
        for (let i of tmcs) {
            meter += Number(i.distance)
        }
        return meter
    }
    let arr = []
    // 去重
    let dotArr = []
    for (let i of points) {
        let e = [i.lon,i.lat].join(',')
        let dot = {
            point: e,
            level: i.level
        }
        let bool = false
        for (let i2 of dotArr) {
            if (i2.level === dot.level && i2.point === dot.point) {
                bool = true
            }
        }
        if (bool === false) {
            dotArr.push(dot)
        }
    }
    // 总长
    let meterAll = Number(res.data.info.trafficData.distance)
    let temp = ''
    // 相对位置
    for (let dot of dotArr) {
        let point = dot.point
        steps.forEach((step, i1) => {
            step.tmcs.forEach((e, i2) => {
                // 取尾
                if (e.polyline.includes(point) && temp !== point){
                    temp = point
                    let meter = meters(i1, i2)
                    arr.push({
                        ratio: (meter / meterAll),
                        level: dot.level
                    })
                }
            })
        })
    }
    log('points', arr)
    return arr
}
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
          "堵": {
              color: "#207ab6",
              id: "3"
          },
          "距离过长" : {
              color: "#207ab6",
              id: "3"
          }
      }
    },
    onLoad: function (option) {
        let that = this
        // 取卡片
        User.card = wx.getStorageSync('userCards')[option.id]
        User.info = wx.getStorageSync('userInfo')
        User.location = wx.getStorageSync('userLocation')
        that.setData({
            card: User.card,
            trip: {
                startS: User.location.data.regeocode.addressComponent.township,
                endS: User.card.street
            }
        })
        // 起点
        let start = User.card.myorigin
        // 终点
        let end = User.card.destination
        that.init(start, end)
    },
    init: function(start, end) {
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
                // isGetRouts: true,
                // isStart: true,
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
                    // 取比例
                    let ratioArr = getRatio(res)
                    // 坐标点
                    let indexArr = []
                    ratioArr.forEach((e, i) => {
                        let index = parseInt( Bezier.length * e.ratio )
                        indexArr.push({
                            index: index,
                            level: e.level
                        })
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
                    // 贴图片
                    that.drawImg(indexArr, Bezier, ctx)
                    // 画圆点
                    ctx.beginPath()
                    ctx.arc(device(35.5), device(119.5), device(4), 0, 2 * Math.PI)
                    ctx.setFillStyle('#7ed321')
                    ctx.fill()
                    ctx.beginPath()
                    ctx.arc(device(339.5),device(65.5), device(4), 0, 2 * Math.PI)
                    ctx.setFillStyle('#ff2c46')
                    ctx.fill()
                    // over
                    ctx.draw()
                }()
                // 出行建议 (避堵)
                let suggest = function() {
                    let steps = res.data.info.trafficData.steps
                    for(var i = 0; i < steps.length; i++) {
                        let e = steps[i]
                        // log(i,e.action,e.distance,"米",)
                    }
                }()
            },
            fail: function(err) {
                console.log('err',err);
            }
        })
    },
    drawImg: function(indexArr, Bezier, ctx) {
        // 画气泡
        for (let i of indexArr) {
            let e = Bezier[i.index]
            let x = Math.round(e.x - device(22))
            let y = Math.round(e.y - device(50))
            ctx.drawImage('img/line/iconWaterShowmap@3x.png', x, y, device(44), device(50))
        }
        // 画起点 ( 起点不变
        let e = Bezier[0]
        ctx.drawImage('img/iconOLoca@3x.png', e.x - device(8), e.y - device(8), device(16), device(16))
    },
    bindMap: function() {
        wx.navigateTo({
            url: "../map_route/e"
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
