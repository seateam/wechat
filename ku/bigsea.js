(function(func) {
    "use strict";
    var Sea = new Object
	var fn = {
		css: function(key, value) {
			for (var i = 0; i < this.length; i++) {
				this[i].style[key] = value
			}
			return this
		},
		on: function(events, listen, func) {
			if (typeof listen === 'function') {
				func = listen
				for (var i = 0; i < this.length; i++) {
					this[i].addEventListener(events, func, false)
				}
			}
		},
		html: function(html) {
			if (html) {
				this[0].innerHTML = html
			} else {
				return this[0].innerHTML
			}
		}
	}
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = func(false, Sea)
    } else {
        // 选择器
        Sea = function(select) {
            if (typeof select === 'function') {
                window.onload = select
            } else {
                var push = [].push
                var obj = new Sea.init
                if (select) {
                    // 检查 select
                    if (isNaN(Number(select.slice(0, 1)))) {
                        var nodeList = document.querySelectorAll(select)
                        for (var i = 0; i < nodeList.length; i++) {
                            push.call(obj, nodeList[i])
                        }
                        return obj
                    }
                }
                return obj
            }
        }
        // 原型链
		Sea.init = function() {}
        Sea.init.prototype = fn
        func(true, Sea)
    }
})(function(web, Sea) {
    // 定制方法 / 函数
    // ( url, data, [func, sync, Method] )
    Sea.Ajax = (url, data, func, sync, Method) => {
        // true 异步
        sync = sync || true
        // 注册 响应函数
        func = func || function(e) {
            console.log(e)
        }
        Method = Method || 'POST'
        // 创建 AJAX 对象
        var r = new XMLHttpRequest()
        r.open(Method, url, sync)
        r.setRequestHeader('Content-Type', 'application/json')
        r.onreadystatechange = function() {
            // 完成
            if (r.readyState === 4) {
                func(r.response)
            }
        }
        // POST
        if (data) {
            data = JSON.stringify(data)
            r.send(data)
            // GET
        } else {
            // 发送 请求
            r.send()
        }
    }
    // ( name, [value, day] )
    Sea.Cookie = (name, value, day) => {
        if (value === undefined) {
            // GET Cookie
            var arr = document.cookie.split('; ')
            for (var i of arr) {
                var e = i.split('=')
                if (e[0] === name) {
                    return e[1]
                }
            }
        } else {
            // POST Cookie
            var date = new Date()
            var str = ''
            if (Number.isInteger(day)) {
                date.setTime(date.getTime() + day * 24 * 3600 * 1000)
                str = ";expires=" + date.toGMTString()
            }
            document.cookie = name + "=" + encodeURIComponent(value) + str
        }
    }
    // ( 1921 < date < 2020 )
    Sea.Lunar = function(date) {
        // 获取时间
        var obj = new Object
        var D = date || new Date
        var yy = D.getFullYear()
        var mm = D.getMonth() + 1
        var dd = D.getDate()
        var ww = D.getDay()
        var hh = D.getHours()
        var min = D.getMinutes()
        var ss = parseInt(D.getTime() / 1000)
        if (yy < 100) {
            yy = "19" + yy
        }
        var cYear, cMonth, cDay, TheDate
        // 农历参数
        var CalendarData = [0xA4B, 0x5164B, 0x6A5, 0x6D4, 0x415B5, 0x2B6, 0x957, 0x2092F, 0x497, 0x60C96, 0xD4A, 0xEA5, 0x50DA9, 0x5AD, 0x2B6, 0x3126E, 0x92E, 0x7192D, 0xC95, 0xD4A, 0x61B4A, 0xB55, 0x56A, 0x4155B, 0x25D, 0x92D, 0x2192B, 0xA95, 0x71695, 0x6CA, 0xB55, 0x50AB5, 0x4DA, 0xA5B, 0x30A57, 0x52B, 0x8152A, 0xE95, 0x6AA, 0x615AA, 0xAB5, 0x4B6, 0x414AE, 0xA57, 0x526, 0x31D26, 0xD95, 0x70B55, 0x56A, 0x96D, 0x5095D, 0x4AD, 0xA4D, 0x41A4D, 0xD25, 0x81AA5, 0xB54, 0xB6A, 0x612DA, 0x95B, 0x49B, 0x41497, 0xA4B, 0xA164B, 0x6A5, 0x6D4, 0x615B4, 0xAB6, 0x957, 0x5092F, 0x497, 0x64B, 0x30D4A, 0xEA5, 0x80D65, 0x5AC, 0xAB6, 0x5126D, 0x92E, 0xC96, 0x41A95, 0xD4A, 0xDA5, 0x20B55, 0x56A, 0x7155B, 0x25D, 0x92D, 0x5192B, 0xA95, 0xB4A, 0x416AA, 0xAD5, 0x90AB5, 0x4BA, 0xA5B, 0x60A57, 0x52B, 0xA93, 0x40E95]
        var madd = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
        var tgString = "甲乙丙丁戊己庚辛壬癸"
        var dzString = "子丑寅卯辰巳午未申酉戌亥"
        var numString = "一二三四五六七八九十"
        var monString = "正二三四五六七八九十冬腊"
        var weekString = "日一二三四五六"
        var keString = ['','初刻','二刻','三刻']
        var sx = "鼠牛虎兔龙蛇马羊猴鸡狗猪"
        var sTermInfo = [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758]
        var solarTerm = ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"]
        // 节气
        var GetSolarTerm = function(solarYear, solarMonth, solarDay) {
            var yy = solarYear
            var mm = solarMonth
            var dd = solarDay
            var mm = mm - 1;
            var tmp1 = new Date((31556925974.7 * (yy - 1900) + sTermInfo[mm * 2 + 1] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
            var tmp2 = tmp1.getUTCDate();
            var result = "";
            if (tmp2 == dd)
                result = solarTerm[mm * 2 + 1];
            tmp1 = new Date((31556925974.7 * (yy - 1900) + sTermInfo[mm * 2] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
            tmp2 = tmp1.getUTCDate();
            if (tmp2 == dd) {
                result = solarTerm[mm * 2];
            }
            obj.SolarTerm = result
        }
        // 十二时辰
        var Get12Time = function() {
            obj.Shi = dzString[Math.floor(hh / 2)]
            if ((hh / 2) % 1 === 0) {
                obj.Shi += "时"
            } else {
                obj.Shi += "正"
            }
            obj.Ke = keString[Math.floor(min / 15)]
        }
        // 农历
        var GetBit = function(m, n) {
            return (m >> n) & 1;
        }
        var e2c = function() {
            TheDate = (arguments.length != 3) ? new Date() : new Date(arguments[0], arguments[1], arguments[2]);
            var total, m, n, k;
            var isEnd = false;
            var tmp = TheDate.getYear();
            if (tmp < 1900) {
                tmp += 1900;
            }
            total = (tmp - 1921) * 365 + Math.floor((tmp - 1921) / 4) + madd[TheDate.getMonth()] + TheDate.getDate() - 38;
            if (TheDate.getYear() % 4 == 0 && TheDate.getMonth() > 1) {
                total++;
            }
            for (m = 0;; m++) {
                k = (CalendarData[m] < 0xfff) ? 11 : 12;
                for (n = k; n >= 0; n--) {
                    if (total <= 29 + GetBit(CalendarData[m], n)) {
                        isEnd = true;
                        break;
                    }
                    total = total - 29 - GetBit(CalendarData[m], n);
                }
                if (isEnd) {
                    break
                }
            }
            cYear = 1921 + m;
            cMonth = k - n + 1;
            cDay = total;
            if (k == 12) {
                if (cMonth == Math.floor(CalendarData[m] / 0x10000) + 1) {
                    cMonth = 1 - cMonth;
                }
                if (cMonth > Math.floor(CalendarData[m] / 0x10000) + 1) {
                    cMonth--;
                }
            }
        }
        var toString = function() {
            obj.Time = D.getTime()
            // 天干 地支
            obj.Year = tgString.charAt((cYear - 4) % 10) + dzString.charAt((cYear - 4) % 12)
            // 生肖
            obj.ChineseZodiac = sx.charAt((cYear - 4) % 12)
            // 闰月
            if (cMonth < 1) {
                obj.Mon = "闰" + monString.charAt(-cMonth - 1)
            } else {
                obj.Mon = monString.charAt(cMonth - 1)
            }
            obj.Mon += "月"
            // 日夜
            if (cDay < 11) {
                obj.Day = "十"
            } else if (cDay < 20) {
                obj.Day = "十"
            } else if (cDay < 30) {
                obj.Day = "廿"
            } else {
                obj.Day = "卅"
            }
            if (cDay % 10 != 0 || cDay == 10) {
                obj.Day += numString.charAt((cDay - 1) % 10)
            }
            // 组合
            obj.Str = `${obj.Year}(${obj.ChineseZodiac})年 ${obj.Mon}${obj.Day}`
            if (obj.SolarTerm) {
                obj.Str += " "
                obj.Str += obj.SolarTerm
            }
            obj.Str += " "
            obj.Str += obj.Shi
            obj.Str += obj.Ke
        }
        var GetLunarDay = function(solarYear, solarMonth, solarDay) {
            //solarYear = solarYear<1900?(1900+solarYear):solarYear;
            if (solarYear < 1921 || solarYear > 2020) {
                obj.Str = '年份超出(1921-2020)'
            } else {
                solarMonth = (parseInt(solarMonth) > 0) ? (solarMonth - 1) : 11;
                e2c(solarYear, solarMonth, solarDay);
                toString()
                GetSolarTerm(yy, mm, dd)
            }
        }
        var init = function() {
            Get12Time()
            GetLunarDay(yy, mm, dd)
        }()
        return obj
    }
    // 前端
    if (web) {
        window.c = Sea;
        // 定义 log c
        window.log = function() {
            console.log.apply(console, arguments)
        }
    }
    return Sea
})
