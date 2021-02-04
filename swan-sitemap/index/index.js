var config = require('../../js/config')

Page({
    data: {
        listData: [],
        totalPage: 1,
        currentPage: 0,
        path: "/swan-sitemap/index/index",
        isShowSkeleton: false,
    },

    onLoad(e) {

        this.data.currentPage = e.currentPage;
        console.log("onLoad e ", e)

        this.showMyLoading();
        this.requestData(this.data.currentPage);
    },
    showMyLoading: function () {
        swan.showLoading({
            title: '页面载入中...',
            mask: true,
            success: function () {
            },
            fail: function (err) {
                console.log('showLoading fail', err);
            }
        });
    },
    onHide() {
        swan.hideLoading();
    },

    requestData(currentPage) {
        console.log("index requestData currentPage ", currentPage)
        var that = this;
        // 发起数据资源请求。
        swan.request({
            url: config.apiList.baseUrl,
            data: {
                action: "swan",
                currentPage: currentPage // 参数中需携带页码参数，此为示例，可根据实际情况传入其他所需参数
            },
            success: res => {
                console.log("success data ", res.data)
                let resData = res.data;
                console.log("resData resData.currentPage ", resData.currentPage)
                that.setData({
                    isShowSkeleton:true,
                    listData: resData.list,
                    totalPage: resData.totalPage,
                    currentPage: resData.currentPage,
                    path:that.data.path
                });
                swan.hideLoading();
            }
        });
    }
});