const app = getApp()
var config = require('../../js/config')

Component({
    properties: {
        pageName: String,
        keyword: String,
    },
    data: {
        //频道页面data
        navData: [
            {
                path: "/pages/home/home",
                name: "最新",
                pageNumber: 0
            },
            {
                path: "/pages/list/list",
                name: "小学",
                pageNumber: 31
            },
            {
                path: "/pages/list/list",
                name: "初中",
                pageNumber: 32
            },
            {
                path: "/pages/list/list",
                name: "高中",
                pageNumber: 33
            },
        ],
        isFocus:false,
        searchShow:false,
    },
    created() {
        // 监听页面加载的生命周期函数
        console.log("这里："+this.data.pageName);
        if(this.data.pageName == "最新"){
            this.setData({
                searchShow:true,
            })
        }
    },
    //跳转频道页面
    gotoclass(res) {
        console.log("gotoclass 2 :--- " + res)
        console.log(res)
        var path = res.currentTarget.dataset.nav.path;
        var name = res.currentTarget.dataset.nav.name;
        var pageNumber = res.currentTarget.dataset.nav.pageNumber;
        swan.redirectTo({
            // swan.redirectTo({
            url: path + '?path=' + path + '&pageName=' + name + '&pageNumber=' + pageNumber,
            success: function () {
                console.log('redirectTo success');
            },
            fail: function (err) {
                console.log('redirectTo fail', err);
            }
        });
    },
    //跳转搜索,如果是搜索页面，则不跳转
    gotosearch(res) {
        console.log(res)
        // console.log("nav pageName ", this.data.pageName)
        if (this.data.pageName != '搜索') {
            swan.navigateTo({
                url: '/pages/search/search'
                // url: '/swan-sitemap/index/index?currentPage=1',
            });
            this.setData({
                isFocus:false,
            })
        }
    },
    //直接搜索,如果是搜索页面，直接搜索
    search(res) {
        this.data.keyword = res.detail.value; //获取搜索关键词
        if (this.data.pageName == '搜索') {
            //这里走搜索接口
            this.getSearchDatas(res.detail.value);
        }
    },
    getSearchDatas: function (searchValue) {
        var that = this;
        console.log(`url=${config.apiList.baseUrl} action=${"search"} keyword=${that.data.keyword} page=${that.data.pageNum}`)
        swan.request({
            url: config.apiList.baseUrl,
            method: 'GET',
            dataType: 'json',
            data: {
                action: "search",
                keyword: searchValue,
                page: 1
            },
            success: function (res) {
                console.log(res.data)
                var searchList = [];
                if (res.data != null && res.data.list != null) {
                    searchList = res.data.list;
                }
                that.sendSearchData(searchValue, searchList);
            },
            fail: function (err) {
                console.log('错误码：' + err.errCode);
                console.log('错误信息：' + err.errMsg);
                that.sendSearchData(searchValue);
            }
        });
    },
    //搜索数据，用于给父级
    sendSearchData: function (searchValue, searchList) {
        if (searchList == null) {
            searchList = []
        }
        var searchData = {
            searchValue: searchValue,
            label: "",
            list: searchList,
        };
        this.triggerEvent('sendParentSearch', searchData);
    }
})
