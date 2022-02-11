/**
 * @file app.js
 * @author swan
 */


App({
    onLaunch(options) {},
    onShow(options) {
        swan.getStorage({
            key: 'userInfo',
            success: res => {
                let data = res.data
                if (data) {
                    console.log("log", data)
                    this.globalData.userInfo = data
                }
            }
        });
    },
    onHide() {},
    globalData: {},
    "useSwanNews": true
});