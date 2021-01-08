var config = require('../../js/config')

Page({
    data: {
        listData: [],
        totalPage: 1,
        currentPage: 0,
        // path: '/swan-sitemap/index/index'
    },

    onLoad(e) {
        // let { currentPage } = e;
        // currentPage = +currentPage || 1;

        this.data.currentPage = e.currentPage;
        console.log("onLoad e ", e)
        console.log("onLoad  e.currentPage ", e.currentPage)

        console.log("onLoad  currentPage ", this.data.currentPage)

        this.requestData(this.data.currentPage);
    },

    requestData(currentPage) {
        console.log("index requestData currentPage ", currentPage)
        var that = this;
        // 发起数据资源请求。
        swan.request({
            // url: sitemapUrl, // 数据接口，需改为开发者实际的请求接口
            // url: "https://api.5h.com/baiduApi.php?action=swan",
            url: config.apiList.baseUrl,
            data: {
                action: "swan",
                currentPage: currentPage // 参数中需携带页码参数，此为示例，可根据实际情况传入其他所需参数
            },
            success: res => {
                console.log("success data ", res.data)
                let resData = res.data;
                console.log("resData resData.currentPage ", resData.currentPage)

                // console.log("resData that.data.currentPage  ----",  resData.currentPage)
                // console.log("resData that.data.currentPage  ----",  resData.totalPage)
                // console.log("resData that.data.currentPage  ----",  resData.path)
                that.setData({
                    listData: resData.list,
                    totalPage: resData.totalPage,
                    currentPage: resData.currentPage,
                    // path: that.data.path
                    // path: ""
                });
                // }
            }
        });
    }
});