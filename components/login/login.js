const util = require('../../js/config')
const app= getApp()

Component({
    properties: {
        tint: { // 属性名
            type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            value: '再查看个人中心！', // 属性初始值（必填）
            observer: function (newVal, oldVal) {
                // 属性被改变时执行的函数（可选）
            }
        },
        show: {
            type: Boolean,
            value: false
        }
    },

    data: {

    }, // 私有数据，可用于模版渲染

    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
        // console.log("login", "attached")
        // this.clickEvent()

    },

    detached: function () {
        // console.log("login", "detached")
    },
    pageLifetimes: {
        show: function () {
            // 组件所在的页面被展示时触发
            // console.log("login", "show")
        },
        hide: function () {
            // 组件所在的页面被隐藏时触发
            // console.log("login", "hide")
        }
    },

    methods: {
        // onTap: function () {
        //     this.setData({
        //         // 更新属性和数据的方法与更新页面数据的方法类似
        //     });
        // }


        getUserInfo(e) {


            // console.log("e", e)
            let userInfo = e.detail.userInfo

            if (swan.canIUse('getLoginCode')) {
                swan.getLoginCode({
                    success: res => {
                        console.log('res', res)
                        let code = res.code
                        swan.request({
                            // 开发者服务器接口地址
                            url: util.apiList.baseUserUrl,
                            // 请求的参数
                            data: {
                                action: 'login',
                                code: code
                            },
                            header: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            dataType: 'json',
                            method: 'POST',
                            // 收到开发者服务成功返回的回调函数。
                            success: res => {
                                console.log('res', res)
                                let data = res.data
                                if (data) {
                                    swan.showToast({
                                        title: '用户登录成功',
                                        icon: 'none'
                                    });
                                    userInfo.id = data.data.id
                                    console.log('userinfo', userInfo)
                                    swan.setStorageSync("userInfo", userInfo);
                                    this.setData({
                                        show: false,
                                    })
                                }

                            },
                            // 接口调用失败的回调函数。
                            fail: res => {
                                console.log('err', res)
                            },

                        });
                    },
                    fail: err => {
                        console.log('err', err)
                    }
                });
            } else {
                //在低版本基础库中'swan.getLoginCode'不可用时进行兼容

            }
            // console.log('userInfo', userInfo)


        },
        login(e) {
            if (e.detail.errCode === '10004' || e.detail.errCode === '904') {
                swan.showToast({
                    title: '用户未登录',
                    icon: 'none'
                });
                return;
            }
        },

        getPhoneNumber(e) {
            console.log('e', e);

            if (swan.canIUse('getLoginCode')) {
                swan.getLoginCode({
                    success: res => {
                        // console.log('res', res)
                        let code = res.code
                        swan.request({
                            // 开发者服务器接口地址
                            url: 'https://api.mxqe.com/user.php',
                            // 请求的参数
                            data: {
                                enews: 'login',
                                code: code,
                                encrypted_data: e.detail.encryptedData,
                                iv: e.detail.iv
                            },
                            header: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            dataType: 'json',
                            method: 'POST',
                            // 收到开发者服务成功返回的回调函数。
                            success: res => {
                                console.log('res', res)
                                let data = res.data
                                if (data) {
                                    swan.showToast({
                                        title: '登录成功',
                                        icon: 'success'
                                    });

                                    // console.log('userinfo', userId)
                                    // swan.setStorageSync({
                                    //     key: 'userInfo',
                                    //     data: data.data
                                    // });

                                    swan.setStorageSync("userInfo", data.data);

                                    this.setData({
                                        show: false,
                                    })

                                    app.globalData.userInfo = data.data

                                }

                            },
                            // 接口调用失败的回调函数。
                            fail: res => {
                                console.log('err', res)
                            },

                        });
                    },
                    fail: err => {
                        console.log('err', err)
                    }
                });
            } else {
                //在低版本基础库中'swan.getLoginCode'不可用时进行兼容

            }

            // if (e.detail.encryptedData) {
            //     swan.showModal({
            //         title: '获取成功',
            //         content: JSON.stringify(e)
            //     });
            // }
        },
        close() {
            this.closeEvent()
        },
        clickEvent() {
            let userInfo = swan.getStorageSync("userInfo");
            var myEventDetail = {
                userInfo: userInfo
            }
            // 触发事件的选项
            var myEventOption = {
                bubbles: true
            }
            this.triggerEvent('myevent', myEventDetail, myEventOption);
        },
        closeEvent() {
            var myEventDetail = {}
            // 触发事件的选项
            var myEventOption = {
                bubbles: true
            }
            this.triggerEvent('closeevent', myEventDetail, myEventOption);
        }
    },
    observers: {
        'show': function (show) {
            // 在 numberA 或者 numberB 被设置时，执行这个函数
            if (!show)
                this.clickEvent()
        }
    }
});