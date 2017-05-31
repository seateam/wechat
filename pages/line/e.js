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
        ctx.beginPath()
        ctx.setLineCap('round')
        ctx.setLineWidth(2)
        ctx.setStrokeStyle('black')
        let x1,x2,y1,y2,xk1,xk2,yk1,yk2 = 0
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
        xk1 = 21; xk2 = 116 // x控制点
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
        yk1 = 306; yk2 = 44 // y控制点
        draw(x1,x2,y1,y2,xk1,xk2,yk1,yk2)
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
