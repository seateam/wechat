var formatTime = function( z ) {
    if (z === undefined) { z = new Date() }
    var x = z.toString()
    var zh     = '天一二三四五六'
    var Year   = x.slice(11,15)
    var Month  = z.getMonth() + 1
    var Day    = x.slice(8,10)
    var Hour   = x.slice(16,18)
    var Minute = x.slice(19,21)
    var Second = x.slice(22,24)
    var Week   = zh[ z.getDay() ]
    if ( String(Month).length === 1) {
        Month = '0' + Month
    }
    return `${Year}年${Month}月${Day}日 ${Hour}:${Minute}:${Second} 星期${Week}`
}

module.exports = {
  formatTime: formatTime
}
