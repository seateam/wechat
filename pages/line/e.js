const log = console.log.bind(console)
const app = getApp()
Page({
    data: {
      x: 0,
      y: 0,
      hidden: true
    },
    onLoad: function () {

    },
    onPullDownRefresh: function() {
        const ctx = wx.createCanvasContext('myCanvas')
        ctx.setLineCap('round')
        ctx.setLineWidth(3)
        ctx.setStrokeStyle('red')
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
        log(arr)
        drawBezierPoints(arr)
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
