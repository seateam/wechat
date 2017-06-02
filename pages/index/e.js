var order = ['red', 'yellow', 'blue', 'green', 'red']
const log = console.log.bind(console)
let start = 0
Page({
    data: {
        order: ['red', 'yellow', 'blue', 'green', 'red'],
        toView: 'red',
        scrollTop: 100,
        start: 0
    },
    left: function(e) {
        // console.log(e)
    },
    right: function(e) {
        // console.log(e)
    },
    start: function(e) {
        start = e.changedTouches["0"].clientX
    },
    end: function(e) {
        let that = this
        let end = e.changedTouches["0"].clientX
        let sum = end - start
        let move = function(shift) {
            for (var i = 0; i < order.length; ++i) {
                if (order[i] === that.data.toView) {
                    log('左滑',order[i + shift])
                    that.setData({
                        toView: order[i + shift]
                    })
                    break
                }
            }
        }
        if (Math.abs(sum) > 20) {
            if (sum > 0) {
                // 左滑
                move(-1)
            } else {
                move(1)
            }
        }
    },
    tapMove: function(e) {
        this.setData({
            scrollTop: this.data.scrollTop + 10
        })
    }
})
