const app = getApp()
var config = require('../../js/config')
var base64 = require('../../utils/base64')

const TOP_DISTANCE = 630;
var titlepics = []; //setPageInfo 图片容器

Page({
    data: {
        pageName: "",
        pageNumber: "", //导航
        keyword: '',
        pageNum: 1, //分页
        itemLists: [],
        nianji: [],
        ce: [],
        kemu: [],
        nianjiStlect: "",
        ceStlect: "",
        kemuStlect: "",
        nianjiFilter: "",
        ceFilter: "",
        kemuFilter: "",
        filter0: "年级",
        filter1: "上下册",
        filter2: "学科",
        filterList: [],
        showBackTop: false,
        loading: "数据努力加载中...",
        screenShow: false,
        listPaddingTop: 140,
        floatNavHeight: "auto", //列表页的层级
    },
    onInit(res) {
        var pageNumberString = res.pageNumber;
        var pageNameString = res.pageName;
        if (pageNumberString == 1 || pageNumberString == 4) {
            pageNumberString = 17
            pageNameString = "护肤"
        } else if (pageNumberString == 2 || pageNumberString == 3) {
            pageNumberString = 18
            pageNameString = "彩妆"
        }
        console.log("pageName ", res.pageName + " pageNumber " + res.pageNumber + " keyword " + res.keyword)
        // eslint-disable-next-line no-unused-expressions
        this.setData({
                pageName: pageNameString,
                pageNumber: pageNumberString,
                keyword: res.keyword,
            }),
            this.getListDatas();
    },
    onLoad(res) {
        console.log("gotomain --- 123");
    },
    onShow() {},
    gotomain(res) {
        console.log("gotomain --- ", res);
        var id = res.currentTarget.dataset.item.id;
        var title = res.currentTarget.dataset.item.title;
        swan.navigateTo({
            url: '/pages/cmsmain/cmsmain?id=' + id + '&title=' + title,
        });
    },
    loadMore: function () { //加载更多
        this.data.pageNum++;
        if (this.data.keyword) {
            this.getSearchDatas();
        } else {
            this.getNavDatas();
        }
    },
    showScreen: function (e) { //显示筛选
        if (this.data.screenShow) {
            this.hideScreen()
            return
        }
        let index = e.currentTarget.dataset.index
        var filterList2 = []
        if (index == 0) {
            filterList2 = this.data.nianji
        } else if (index == 1) {
            filterList2 = this.data.ce
        } else {
            filterList2 = this.data.kemu
        }
        this.setData({
            screenShow: true,
            filterList: filterList2,
            floatNavHeight: "100%",
        })
    },
    showList: function (e) {
        var that = this;
        console.log("showList ", e)
        let index = e.currentTarget.dataset.index
        if (index.type == "nianji") {
            that.setData({
                nianjiStlect: index.id,
                filter0: index.name
            })
            if (index.name == "全部") {
                this.data.nianjiFilter = ""
            } else {
                this.data.nianjiFilter = index.id
            }
        } else if (index.type == "ce") {
            that.setData({
                ceStlect: index.id,
                filter1: index.name
            })
            if (index.name == "全部") {
                this.data.ceFilter = ""
            } else {
                this.data.ceFilter = index.id
            }
        } else if (index.type == "kemu") {
            that.setData({
                kemuStlect: index.id,
                filter2: index.name
            })
            if (index.name == "全部") {
                this.data.kemuFilter = ""
            } else {
                this.data.kemuFilter = index.id
            }
        }
        that.data.pageNum = 1
        that.data.itemLists = []

        if (that.data.keyword != "" && that.data.keyword != "undefined" && that.data.keyword != null) {
            that.getSearchDatas();
        } else {
            that.getNavDatas();
        }
        this.hideScreen()
    },
    hideScreen: function () { //隐藏筛选
        this.setData({
            screenShow: false,
            floatNavHeight: "auto",
        })
    },
    getListDatas: function () { //初始化数据
        var that = this;
        if (that.data.keyword != "" && that.data.keyword != "undefined" && that.data.keyword != null) {
            that.getSearchDatas();
        } else {
            that.getNavDatas();
        }
    },
    getSearchDatas: function () {
        var that = this;
        console.log("http", `url=${config.apiList.baseUrl} action=${"search"} keyword=${that.data.keyword} page=${that.data.pageNum}`)
        var params = {
            action: "search",
            keyword: that.data.keyword,
            page: that.data.pageNum
        }
        if (that.data.nianjiFilter) {
            params.nianji = that.data.nianjiFilter
        }
        if (that.data.ceFilter) {
            params.ce = that.data.ceFilter
        }
        if (that.data.kemuFilter) {
            params.kemu = that.data.kemuFilter
        }
        swan.request({
            url: config.apiList.baseUrl,
            method: 'GET',
            dataType: 'json',
            data: params,
            success: function (res) {
                console.log("http", "getSearchDatas", res.data);
                if (res && res.data && res.data.list) {
                    let list = res.data.list
                    if (list.length < 10) {
                        that.setData({
                            loading: "没有更多了",
                        })
                    }
                    for (let index = 0; index < list.length; index++) {
                        list[index].newstime = that.switchTime(list[index].newstime);
                    }

                    that.data.itemLists = [...that.data.itemLists, ...list]

                    if (that.data.nianjiStlect == "" && that.data.ceStlect == "" && that.data.kemuStlect == "") {
                        that.setData({
                            nianjiStlect: res.data.cate.nianji[0].id,
                            ceStlect: res.data.cate.ce[0].id,
                            kemuStlect: res.data.cate.kemu[0].id,
                            listPaddingTop: 70
                        })
                    }
                    that.setData({
                        itemLists: that.data.itemLists,
                        nianji: res.data.cate.nianji,
                        ce: res.data.cate.ce,
                        kemu: res.data.cate.kemu,
                    })
                    if (titlepics.length == 0) {
                        for (var itemNew of res.data.list) {
                            const titlepic = itemNew.titlepic;
                            titlepics.push(titlepic)
                        }
                        that.setPageInfoData(titlepics, res.data.site)
                    }
                } else {
                    if (that.data.pageNum == 1) {
                        that.setData({
                            itemLists: {},
                            loading: "没有数据",
                        })
                    } else {
                        that.setData({
                            loading: "没有更多了",
                        })
                    }
                }
            },
            fail: function (err) {
                console.log('错误码：' + err.errCode);
                console.log('错误信息：' + err.errMsg);
            }
        });
    },
    switchTime: function (unixtime) {
        var dateTime = new Date(parseInt(unixtime) * 1000)
        var year = dateTime.getFullYear();
        var month = dateTime.getMonth() + 1;
        var day = dateTime.getDate();
        var hour = dateTime.getHours();
        var minute = dateTime.getMinutes();
        var second = dateTime.getSeconds();
        var now = new Date();
        var now_new = Date.parse(now.toDateString()); //typescript转换写法
        var milliseconds = now_new - dateTime;
        var timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
        return timeSpanStr;

    },
    getNavDatas: function () {

        var that = this;
        var params = {
            action: "cate",
            cate_id: that.data.pageNumber,
            page: that.data.pageNum
        }
        if (that.data.nianjiFilter) {
            params.nianji = that.data.nianjiFilter
        }
        if (that.data.ceFilter) {
            params.ce = that.data.ceFilter
        }
        if (that.data.kemuFilter) {
            params.kemu = that.data.kemuFilter
        }

        console.log("params", that.data.pageNumber + " nianji " + that.data.nianjiFilter + " ce " + that.data.ceFilter + " kemu " + that.data.kemuFilter)

        swan.request({
            url: config.apiList.baseUrl,
            method: 'GET',
            dataType: 'json',
            data: params,
            success: function (res) {
                console.log("getNavDatas res.data", res.data);
                if (res && res.data && res.data.list) {
                    let list = res.data.list
                    if (list.length < 10) {
                        that.setData({
                            loading: "没有更多了",
                        })
                    }
                    for (let index = 0; index < list.length; index++) {
                        list[index].newstime = that.switchTime(list[index].newstime);
                    }

                    if (that.data.nianjiStlect == "" && that.data.ceStlect == "" && that.data.kemuStlect == "") {
                        that.setData({
                            nianjiStlect: res.data.cate.nianji[0].id,
                            ceStlect: res.data.cate.ce[0].id,
                            kemuStlect: res.data.cate.kemu[0].id,
                        })
                    }

                    that.data.itemLists = [...that.data.itemLists, ...list]

                    that.setData({
                        itemLists: that.data.itemLists,
                        nianji: res.data.cate.nianji,
                        ce: res.data.cate.ce,
                        kemu: res.data.cate.kemu,
                    })
                    if (titlepics.length == 0) {


                        for (var itemNew of res.data.list) {
                            const titlepic = itemNew.titlepic;
                            titlepics.push(titlepic)
                        }
                        that.setPageInfoData(titlepics, res.data.site)
                    }
                } else {
                    if (that.data.pageNum == 1) {
                        that.setData({
                            itemLists: {},
                            loading: "没有数据",
                        })
                    } else {
                        that.setData({
                            loading: "没有更多了",
                        })
                    }
                }
            },
            fail: function (err) {
                console.log('错误码：' + err.errCode);
                console.log('错误信息：' + err.errMsg);
            }
        });
    },
    setPageInfoData(titlepics, sites) {
        console.log("sites2 ", sites)
        if(sites==undefined){
            return;
        }
        swan.setPageInfo({
            title: sites.title,
            image: titlepics,
            keywords: sites.sitekey,
            description: sites.siteintro,
            success: function () {
                console.log('setPageInfo success sites.title: ' + sites.title + " keywords :" + sites.sitekey || this.data.keyword);
            },
            fail: function (err) {
                console.log('setPageInfo fail', err);
            }
        })
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.loadMore();
    },
    /**
     * 回到顶部
     */
    onBackTop() {
        swan.pageScrollTo({
            scrollTop: 0,
        })
    },
    /**
     * 页面滑动监听,回到顶部按钮显示隐藏
     */
    onPageScroll: function (options) {
        const scrollTop = options.scrollTop;
        const flag = scrollTop >= TOP_DISTANCE;
        if (flag != this.data.showBackTop) {
            this.setData({
                showBackTop: flag
            })
        }
    },
    //接收nav.js传过来的值,之后进行逻辑处理
    receiveData(res) {
        var that = this;
        console.log(123, res)
        that.setData({
            pageNum: 1,
            keyword: res.detail.searchValue,
        })

        if (res.detail == null) {
            that.setData({
                itemLists: [],
                loading: "没有数据",
            })
            return;
        }
        that.data.itemLists = res.detail.list;
        that.setData({
            itemLists: that.data.itemLists,
        })

        if (res.detail.list == null || res.detail.list.length < 10) {
            that.setData({
                loading: "没有更多了",
            })
        };
    },
})