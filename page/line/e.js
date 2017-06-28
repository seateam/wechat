const log = console.log.bind(console)
const config = require('../../ku/js/config.js')
const app = getApp()
const deitude = function(itude) {
    return itude.split(',').reverse().join(',')
}
// 自适应宽度
const device = function(number) {
    let device = wx.getSystemInfoSync()
    return number * 2 * device.windowWidth / 750
}
let User = {}
const getBezier = function() {
    // 新算法
    // anchorpoints：贝塞尔基点
    // pointsAmount：生成的点数
    let CreateBezierPoints = function (anchorpoints, pointsAmount) {
        var points = [];
        for (var i = 0; i < pointsAmount; i++) {
            var point = MultiPointBezier(anchorpoints, i / pointsAmount);
            // point.x = parseInt(point.x)
            // point.y = parseInt(point.y)
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
        if (!dotArr.includes(e)) {
            dotArr.push({
                point: e,
                level: i.level
            })
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
    return arr
}
Page({
    data: {
      Bezier: null
    },
    onLoad: function () {
        let that = this
        app.login(function(userInfo) {
            User.info = userInfo.info
            User.location = userInfo.location
            that.init()
        })

    },
    init: function() {
        let Bezier = getBezier() // 取点
        let now = deitude("104.06951,30.537107")
        let end = deitude("104.118492,30.745042")
        wx.request({
            url: config.url + '/traffic/situation',
            data: {
                // 我的位置
                myorigin: deitude(now),
                // 出发点
                origin: deitude(now),
                // 目的地
                destination: deitude(end),
                // isGetRouts: true,
                // isStart: true,
            },
            method: "POST",
            header: {
                "Content-Type": "application/json",
                "ucloudtech_3rd_key": User.info.session_key
            },
            success: function(res) {
                log(res)
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
                }
                drawBezierPoints(Bezier)
                // 画气泡
                for (let i of indexArr) {
                    let e = Bezier[i.index]
                    ctx.drawImage('../../ku/img/icecream-19.png', e.x - 12, e.y - 24, 24, 24)
                }
                // 画圆点
                ctx.beginPath()
                ctx.arc(device(35.5), device(119.5), device(4), 0, 2 * Math.PI)
                ctx.setFillStyle('#7ed321')
                ctx.fill()
                ctx.beginPath()
                ctx.arc(device(339.5),device(65.5), device(4), 0, 2 * Math.PI)
                ctx.setFillStyle('#ff2c46')
                ctx.fill()

                ctx.draw()
            },
            fail: function(err) {
                console.log('err',err);
            }
        })
    },
    onPullDownRefresh: function() {
        // 停止刷新
        wx.stopPullDownRefresh()
    },
})
