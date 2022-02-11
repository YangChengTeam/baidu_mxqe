let isLogin = false //是否登录
Page({
    data: {
        pic: '../../images/default_icon.png',
        desc: '还没有个人简介',
        nickName: '登录',
        qq: '2645034912@qq.com'
    },
    onInit: function () {
        // 监听页面初始化的生命周期函数
    },
    onLoad: function () {
        // 监听页面加载的生命周期函数
        let siteInfo = swan.getStorageSync('siteInfo');
        if (siteInfo)
            swan.setPageInfo({
                // 页面标题
                title: siteInfo.sites.title,
                // 页面关键字
                keywords: siteInfo.sites.sitekey,
                // 页面描述信息
                description: siteInfo.sites.siteintro,
                image: siteInfo.pics,
                // 接口调用失败的回调函数
                fail: err => {
                    console.log('setPageInfo fail', err);
                },
            });
    },

    setUserInfo() {
        let userInfo = swan.getStorageSync('userInfo');
        console.log('userInfo', userInfo)

        if (userInfo) {
            isLogin = true
            this.setUserData(userInfo)
        }
        //  else {
        //     // this.setData({
        //     //     show: true
        //     // })
        // }
    },

    setUserData(userInfo) {
        this.setData({
            pic: userInfo.avatarUrl ? userInfo.avatarUrl : this.data.pic,
            desc: userInfo.desc ? userInfo.desc : this.data.desc,
            nickName: userInfo.nickName ? userInfo.nickName : "id: " + userInfo.id,
            show: false
        })
    },

    listener(e) {
        console.log("my", e)
        let userInfo = e.detail.userInfo
        if (userInfo) {
            isLogin = true
            this.setUserData(userInfo)
        }
    },
    close() {
        this.setData({
            show: false
        })
    },
    login() {
        // if (!isLogin) {
        //     this.setData({
        //         show: true
        //     })
        // }
        this.condition(() => {})
    },

    toLove() {

        this.condition(() => {
            swan.navigateTo({
                // 需要跳转的应用内非 tabBar 的页面的路径 , 路径后可以带参数。参数与路径之间使用?分隔，参数键与参数值用=相连，不同参数用&分隔；如 ‘path?key=value&key2=value2’。
                url: '/subPackages/pages/love/love',
            });
        })
    },

    toCollect() {
        this.condition(() => {
            swan.navigateTo({
                url: '/subPackages/pages/collect/collect'
            })
        })
    },

    condition(callback) {
        if (isLogin) { //登录
            callback()
        } else {
            this.setData({
                show: true
            })
        }
    },
    copyService() {
        swan.setClipboardData({
            data: this.data.qq,
            success: res => {
                console.log("res", res)
                swan.showToast({
                    // 提示的内容
                    title: '客服邮箱复制成功',
                    // 图标，有效值"success"、"loading"、"none"。
                    icon: 'none',
                    // 自定义图标的本地路径，image 的优先级高于 icon
                    mask: false
                });
            }
        });
    },

    onReady: function () {
        // 监听页面初次渲染完成的生命周期函数
    },
    onShow: function () {
        // 监听页面显示的生命周期函数
        // console.log("show")
        this.setUserInfo()
    },
    onHide: function () {
        // 监听页面隐藏的生命周期函数
    },
    onUnload: function () {
        // 监听页面卸载的生命周期函数
    },
    onPullDownRefresh: function () {
        // 监听用户下拉动作
    },
    onReachBottom: function () {
        // 页面上拉触底事件的处理函数
    },
    onShareAppMessage: function () {
        // 用户点击右上角转发
    },
    onError: function () {
        // 错误监听函数
    }
});