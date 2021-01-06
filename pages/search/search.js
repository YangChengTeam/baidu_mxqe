const app = getApp()
var config = require('../../js/config')

Page({
    data: {
        pageName: "搜索", //搜索页面名称
        keyword: "", //搜索关键词
        hotsearchData: [],//热门搜索
    },
    onInit(res) {
        this.getHotData();
    },
    onLoad(res) {
        // 监听页面加载的生命周期函数


    },
    onShow() {
        swan.setPageInfo({
            title: 'pages/search/search',
            // keywords: 'XXXX',  
            // description: 'XXXXX',  
            // image: [  
            //     'XXXXX'  
            // ]  
        })
    },
    //输入关键词
    inputKey(res) {
        this.setData({
            keyword: res.detail.value
        })
    },
    //跳转列表
    gotosearchlist(res) {
        var keyword = this.data.keyword; //搜索关键词
        console.log(this.data.keyword)
        if (keyword == '') {
            swan.showToast({
                title: '请输入关键词',
                icon: 'none'
            });
            return false;
        }
        swan.navigateTo({
            url: '/pages/list/list?pageName=' + this.data.pageName + '&keyword=' + this.data.keyword
        });
    },
    //热门搜索跳转
    hotgoin(res) {
        var key = res.currentTarget.dataset.val
        swan.navigateTo({
            url: '/pages/list/list?pageName=' + this.data.pageName + '&keyword=' + key
        });
    },
    getHotData: function () {
        var that = this;
        swan.request({
            url: config.apiList.baseUrl,
            method: 'GET',
            dataType: 'json',
            data: {
                action: "hotkwd",
            },
            success: function (res) {
                console.log(res.data);
                that.setData({
                    hotsearchData: res.data
                })
            },
            fail: function (err) {

                console.log('错误码：' + err.errCode);
                console.log('错误信息：' + err.errMsg);
            }
        });
    }
})
