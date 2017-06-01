const log = console.log.bind(console)
const app = getApp()
Page({
    data: {
      x: 0,
      y: 0,
      hidden: true
    },
    onLoad: function () {
        const ctx = wx.createCanvasContext('myCanvas')
        ctx.setLineCap('round')
        ctx.setLineWidth(3)
        ctx.setStrokeStyle('red')

        let oldDraw = function() {
            let x1,x2,y1,y2,xk1,xk2,yk1,yk2
            let draw = function(x1,x2,y1,y2,xk1,xk2,yk1,yk2,color) {
                // Draw quadratic curve
                ctx.moveTo(x1, x2)
                ctx.bezierCurveTo(xk1, xk2, yk1, yk2, y1, y2)
                ctx.stroke()
                ctx.draw(true)
                // Draw points
                // ctx.beginPath()
                // ctx.arc(x1, x2, 2, 0, 2 * Math.PI)
                // ctx.setFillStyle('red')
                // ctx.fill()
                //
                // ctx.beginPath()
                // ctx.arc(y1, y2, 2, 0, 2 * Math.PI)
                // ctx.setFillStyle('lightgreen')
                // ctx.fill()
                //
                // ctx.beginPath()
                // ctx.arc(xk1, xk2, 2, 0, 2 * Math.PI)
                // ctx.arc(yk1, yk2, 2, 0, 2 * Math.PI)
                // ctx.setFillStyle('blue')
                // ctx.fill()
            }
            x1 = 21; x2 = 116 // 起点
            y1 = 110; y2 = 52 // 终点
            xk1 = 27; xk2 = 92 // x控制点
            yk1 = 60; yk2 = 52 // y控制点
            draw(x1,x2,y1,y2,xk1,xk2,yk1,yk2)
            x1 = 110; x2 = 52 // 起点
            y1 = 225; y2 = 91 // 终点
            xk1 = 160; xk2 = 52 // x控制点
            yk1 = 187; yk2 = 91 // y控制点
            draw(x1,x2,y1,y2,xk1,xk2,yk1,yk2)
            x1 = 225; x2 = 91 // 起点
            y1 = 306; y2 = 44 // 终点
            xk1 = 269; xk2 = 91 // x控制点
            yk1 = 290; yk2 = 70 // y控制点
            draw(x1,x2,y1,y2,xk1,xk2,yk1,yk2)
        }

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
        let drawBezierPoints = function(arr) {
            ctx.moveTo(arr[0].x, arr[0].y)
            for (let i of arr) {
                ctx.lineTo(i.x, i.y)
            }
            ctx.stroke()
            ctx.draw(true)
        }
        // 实例
        let arr1 = CreateBezierPoints([
            {x: 21,y: 116},
            {x: 27,y: 92},
            {x: 60,y: 52},
            {x: 110,y: 52}
        ], 33)
        let arr2 = CreateBezierPoints([
            {x: 110,y: 52},
            {x: 160,y: 52},
            {x: 187,y: 91},
            {x: 225,y: 91}
        ], 33)
        let arr3 = CreateBezierPoints([
            {x: 225,y: 91},
            {x: 269,y: 91},
            {x: 290,y: 70},
            {x: 306,y: 44}
        ], 33)
        let arr = arr1.concat(arr2, arr3)
        arr.push({x: 306,y: 44})
        drawBezierPoints(arr)

    },
    onPullDownRefresh: function() {
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
