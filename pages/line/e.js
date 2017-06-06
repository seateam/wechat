const log = console.log.bind(console)
const config = require('../../ku/js/config.js')
const app = getApp()
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
        {x: 21,y: 116},
        {x: 27,y: 92},
        {x: 60,y: 52},
        {x: 110,y: 52}
    ], 100)
    let arr2 = CreateBezierPoints([
        {x: 110,y: 52},
        {x: 160,y: 52},
        {x: 187,y: 91},
        {x: 225,y: 91}
    ], 100)
    let arr3 = CreateBezierPoints([
        {x: 225,y: 91},
        {x: 269,y: 91},
        {x: 290,y: 70},
        {x: 306,y: 44}
    ], 100)
    let arr = arr1.concat(arr2, arr3)
    return arr
}
const deitude = function(itude) {
    return itude.split(',').reverse().join(',')
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
      x: 0,
      y: 0,
      hidden: true,
      Bezier: null
    },
    onLoad: function () {
        let Bezier = getBezier() // 取点
        let now = deitude("104.06951,30.537107")
        let end = deitude("104.118492,30.745042")
        wx.request({
            url: config.url + '/traffic/route',
            data: {
                // 出发点
                origin: deitude(now),
                // 目的地
                destination: deitude(end)
            },
            method: "GET",
            header: {
                "Content-Type": "application/json",
            },
            success: function(res) {
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
                ctx.setLineWidth(3)
                ctx.setStrokeStyle('red')
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
    ctxClick: function(e) {

    },
    start: function(e) {
      this.setData({
        hidden: false,
        x: e.touches[0].x,
        y: e.touches[0].y
      })
    },
    move: function(e) {
      this.setData({
        x: e.touches[0].x,
        y: e.touches[0].y
      })
    },
    end: function(e) {
      this.setData({
        hidden: true
      })
    }
})
