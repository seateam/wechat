class $ {
    constructor(select) {
        this.deviceInfo = wx.getSystemInfoSync().windowWidth
        this.res = new Promise(function(resolve, reject) {
            wx.createSelectorQuery().select(select).boundingClientRect(res => {
                resolve(res)
            }).exec()
        })
    }
    // new
    static find(select) {
        return new $(select).res
    }
    // css
    static css(object) {
        let o = object
        let s = ''
        for (var key in o) {
            let val = o[key]
            s += `${key}:${val};`
        }
        return s
    }
    // 坐标反转
    static deitude(itude) {
        return itude.split(',').reverse().join(',')
    }
}

module.exports = $
