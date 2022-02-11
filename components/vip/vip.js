const util = require('../../js/config')
const app = getApp()

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
        },
        class_id: {
            type: String,
            value: '',
            observer: function (newVal, oldVal) {
                console.log('class_id', newVal)
                this.data.class_id = newVal;
            }

        },
        article_id: {
            type: String,
            value: '',
            observer: function (newVal, oldVal) {
                console.log('article_id', newVal)
                this.data.article_id = newVal;
            }
        }
    },

    data: {
        goodsList: [],
        selectPrice: "",
        selectIndex: 0,
        userId: "",
        class_id: '',
        article_id: ''

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
            console.log("login", "show")
            let userInfo = app.globalData.userInfo
            if (userInfo) {
                this.data.userId = userInfo.id
            }
            swan.request({
                url: "https://api.mxqe.com/pay/pay.php",
                data: {
                    enews: "goods_list"
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                dataType: 'json',
                method: 'POST',
                success: res => {
                    console.log('res', res.data)
                    let data = res.data
                    if (data) {
                        let vipList = data.data
                        this.setData({
                            goodsList: vipList,
                            selectPrice: vipList[this.data.selectIndex].price,
                            userId: this.data.userId
                        })
                    }
                },
                fail: err => {
                    console.log('err', err)
                }
            })
        },
        hide: function () {
            // 组件所在的页面被隐藏时触发
            // console.log("login", "hide")
        }
    },

    methods: {

        getPhoneNumber(e) {
            console.log('phone', e, app.globalData.userInfo)
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
                                    let userId = data.data.id
                                    let isVip = data.data.is_vip
                                    // console.log('userinfo', userId)
                                    swan.setStorage({
                                        key: 'userInfo',
                                        data: data.data
                                    });

                                    app.globalData.userInfo = data.data
                                    this.data.userId = userId
                                    if (isVip == 1) { //开通vip
                                        this.clickEvent()
                                    } else {
                                        this.openVip()
                                    }

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
        },
        openVip() {

            let goodInfo = this.data.goodsList[this.data.selectIndex]
            console.log('select', goodInfo)
            swan.request({
                url: 'https://api.mxqe.com/pay/pay.php',
                data: {
                    enews: 'pay',
                    user_id: this.data.userId,
                    goods_id: goodInfo.id,
                    class_id: this.data.class_id,
                    article_id: this.data.article_id

                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                dataType: 'json',
                method: 'POST',
                // 收到开发者服务成功返回的回调函数。
                success: res => {
                    let data = res.data
                    console.log("data", data)
                    if (data) {
                        this.requestPolymerPayment(data.data.order_info)
                    }
                },
                fail: err => {
                    console.log('err', err)
                }
            });

        },

        requestPolymerPayment(orderInfo) {
            swan.requestPolymerPayment({
                orderInfo: orderInfo,
                success: res => {
                    swan.showToast({
                        title: '支付成功',
                        icon: 'success'
                    });

                    let userInfo = app.globalData.userInfo
                    userInfo.is_vip = 1

                    swan.setStorage({
                        key: 'userInfo',
                        data: userInfo
                    });


                    this.clickEvent()
                    console.log('pay success', res);
                },
                fail: err => {
                    swan.showToast({
                        title: err.errMsg,
                        icon: 'none'
                    });
                    console.log('pay fail', err);
                }
            });
        },


        selectVip(e) {
            // console.log('click', e)
            var index = e.currentTarget.dataset.index
            if (index == this.data.selectIndex) {
                return
            }
            this.data.selectIndex = index
            this.setData({
                selectPrice: this.data.goodsList[index].price,
                selectIndex: this.data.selectIndex
            })
        },

        close() {
            this.closeEvent()
        },
        clickEvent() {

            var myEventDetail = {}
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
        // 'show': function (show) {
        //     // 在 numberA 或者 numberB 被设置时，执行这个函数
        //     if (!show)
        //         this.clickEvent({})
        // },
    }
});