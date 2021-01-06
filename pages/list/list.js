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
        pageNum: 1,  //分页
        itemLists: [],
        nianji: [],
        ce: [],
        kemu: [],
        filterList: [],
        showBackTop: false,
        loading: "加载中...",
        screenShow: false,
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
        this.setData({
            pageName: pageNameString,
            pageNumber: pageNumberString,
            keyword: res.keyword,
        }),
            this.getListDatas();
    },
    onLoad(res) {

    },
    onShow() {
    },
    gotomain(res) {
        console.log("gotomain --- ", res)
        var id = res.currentTarget.dataset.item.id;
        var title = res.currentTarget.dataset.item.title;
        swan.navigateTo({
            url: '/pages/cmsmain/cmsmain?id=' + id + '&title=' + title,
        });
    },
    loadMore: function () { //加载更多
        this.data.pageNum++;
        if (this.data.keyword != "" && this.data.keyword != "undefined" && this.data.keyword != null) {
            this.getSearchDatas();
        } else {
            this.getNavDatas();
        }
    },
    showScreen: function (e) {  //显示筛选
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
            filterList: filterList2
        })


    },
    hideScreen: function () {  //隐藏筛选
        this.setData({
            screenShow: false,
        })
    },
    getListDatas: function () {  //初始化数据
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
        swan.request({
            url: config.apiList.baseUrl,
            method: 'GET',
            dataType: 'json',
            data: {
                action: "search",
                keyword: that.data.keyword,
                page: that.data.pageNum
            },
            success: function (res) {
                console.log("http", "getSearchDatas", res.data);
                if (res.data == null) {
                    if (that.data.pageNum == 1) {
                        that.setData({
                            loading: "没有数据",
                        })
                    } else {
                        that.setData({
                            loading: "没有更多了",
                        })
                    }
                }
                if (res && res.data && res.data.list) {

                    var list = res.data.list
                    for (let index = 0; index < list.length; index++) {
                        list[index].newstime = that.switchTime(list[index].newstime);
                    }

                    that.data.itemLists = that.data.itemLists.concat(list);
                    that.setData({
                        itemLists: that.data.itemLists,
                        nianji: res.data.cate.nianji,
                        ce: res.data.cate.ce,
                        kemu: res.data.cate.kemu,
                    })
                    for (var itemNew of res.data.list) {
                        const titlepic = itemNew.titlepic;
                        titlepics.push(titlepic)
                    }
                    that.setPageInfoData(titlepics, res.data.site)
                }
                if (!res || !res.data || !res.data.list || res.data.list.length < 10) {
                    that.setData({
                        loading: "没有更多了",
                    })
                };
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
        var now_new = Date.parse(now.toDateString());  //typescript转换写法
        var milliseconds = now_new - dateTime;
        var timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
        return timeSpanStr;

    },
    getNavDatas: function () {
        var that = this;
        console.log("http getNavDatas ", `url=${config.apiList.baseUrl} action=${"cate"} cate_id=${that.data.pageNumber} page=${that.data.pageNum}`)
        swan.request({
            url: config.apiList.baseUrl,
            method: 'GET',
            dataType: 'json',
            data: {
                action: "cate",
                cate_id: that.data.pageNumber,
                page: that.data.pageNum
            },
            success: function (res) {

                console.log("getNavDatas res.data", res.data);

                if (res.data == null) {
                    if (that.data.pageNum == 1) {
                        that.setData({
                            loading: "没有数据",
                        })
                    } else {
                        that.setData({
                            loading: "没有更多了",
                        })
                    }
                }

                if (res.data != null && res.data != undefined && res.data.list != null && res.data.list != undefined) {

                    var list = res.data.list
                    for (let index = 0; index < list.length; index++) {
                        list[index].newstime = that.switchTime(list[index].newstime);
                    }

                    // var nianji = []
                    // Object.keys(res.data.cate.nianji).forEach(key => {
                    //     nianji.push({
                    //         id: key,
                    //         name: res.data.cate.nianji[key]
                    //     })
                    // })
                    // res.data.cate.nianji = nianji

                    // console.log("nianji " + res.data.cate.nianji)
                    // for (let index = 0; index < nianji.length; index++) {
                    //     console.log(nianji[index].id)
                    //     console.log(nianji[index].name)
                    // }

                    console.log("nianji ", res.data.cate.nianji)
                    console.log("ce ", res.data.cate.ce)
                    console.log("kemu ", res.data.cate.kemu)

                    that.data.itemLists = that.data.itemLists.concat(list);
                    that.setData({
                        itemLists: that.data.itemLists,
                        nianji: res.data.cate.nianji,
                        ce: res.data.cate.ce,
                        kemu: res.data.cate.kemu,
                    })
                }

                for (var itemNew of res.data.list) {
                    const titlepic = itemNew.titlepic;
                    titlepics.push(titlepic)
                }
                that.setPageInfoData(titlepics, res.data.site)
            },
            fail: function (err) {
                console.log('错误码：' + err.errCode);
                console.log('错误信息：' + err.errMsg);
            }
        });
    },
    setPageInfoData(titlepics, sites) {
        var title = this.data.keyword;
        var keywords = this.data.keyword;
        var description = this.data.keyword;
        if (sites != null && sites != undefined) {
            title = sites.title;
            keywords = sites.sitekey;
            description = sites.siteintro;
        }
        swan.setPageInfo({
            image: titlepics,
            title: title,
            keywords: keywords,
            description: description,
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
            loading: "加载中...",
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
