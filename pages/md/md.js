//textarea.js
Page({
    bindFormSubmit: function(e) {
        console.log(e.detail.value.name, e.detail.value.text)
    },
    bindAdress: function() {
        wx.chooseAddress({
            success: function (res) {
                console.log(res)
            }
        })
    }
})
