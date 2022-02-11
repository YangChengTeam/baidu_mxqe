const app = getApp()
var config = require('../../js/config')
var base64 = require('../../utils/base64')

const TOP_DISTANCE = 630;
var titlepics = []; //setPageInfo 图片容器
let detail;
let cate = {} //筛选分类
Page({
    data: {

        pageName: '最新',
        itemBanners: [],
        itemNews: [],
        itemNewsMore: [],
        itemData: {},
        pageNum: 1,
        current: 0,
        switchIndicateStatus: true,
        switchAutoPlayStatus: false,
        switchDuration: 500,
        autoPlayInterval: 2000,
        showBackTop: false,
        loading: "加载中...",
        isOneLoading: true,
        showSwiper: true,
        nianjiStlect: "",
        ceStlect: "",
        kemuStlect: "",
        filter0: "年级",
        filter1: "上下册",
        filter2: "学科",
        screenShow: false,
        nianjiFilter: '',
        ceFilter: '',
        kemuFilter: '',
        floatNavHeight: "auto", //列表页的层级
    },
    onInit() {
        console.log("00671", "onInit")
        this.showMyLoading();

    },

    index(e) {
        // console.log("e", e);
        detail = e.detail
        this.getListData(detail)
    },

    onLoad() { // 监听页面加载的生命周期函数
        console.log("00671", "onLoad")
    },
    onReady() {

    },
    onShow() {
        this.showMyFavoriteGuide();
    },
    showMyLoading: function () {
        console.log("showMyLoading isOneLoading", this.data.isOneLoading);
        if (this.data.isOneLoading) {
            swan.showLoading({
                title: '页面加载中...',
            });
        }
    },

    listener(e) {
        detail = e.detail

        // console.log("er", e.detail)
        if (detail.action != "index") {
            this.data.showSwiper = false;
        } else {
            this.data.showSwiper = true;
        }
        this.setData({
            pageName: detail.name,
            showSwiper: this.data.showSwiper,
            filter0: '年级',
            filter1: '上下册',
            filter2: '学科'
        })
        this.data.pageNum = 1
        this.data.nianjiFilter = ''
        this.data.ceFilter = ''
        this.data.kemuFilter = ''
        this.data.nianjiStlect = ''
        this.data.ceStlect = ''
        this.data.kemuStlect = ''
        this.hideScreen()
        this.scrollToTop()
        this.showMyLoading()
        this.getListData(detail)
    },



    getListData(detail) {





        // if (userInfo) {
        //     console.log('log', userInfo.username, userInfo.phone)
        // }

        var that = this;
        let params = {
            action: detail.action,
            page: that.data.pageNum,
            cate_id: detail.cate_id
        };

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
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                swan.hideLoading();
                console.log("getHomeData res.data", res.data);

                if (res.data == null) {
                    if (that.data.pageNum == 1) {
                        that.data.loading = '没有数据'
                    } else {
                        that.data.loading = '没有更多了'
                    }
                }

                if (that.data.pageNum == 1) {
                    that.data.itemNews = []
                }
                if (detail.action == 'index') {
                    if (res.data.news == null || res.data.news.length < 6) {
                        that.data.loading = '没有更多了'
                    }
                    that.data.itemNews = that.data.itemNews.concat(res.data.news);
                } else {
                    if (res.data.list == null || res.data.list.length < 6) {
                        that.data.loading = '没有更多了'
                    }
                    cate = res.data.cate
                    if (that.data.nianjiStlect == "" && that.data.ceStlect == "" && that.data.kemuStlect == "") {
                        that.setData({
                            nianjiStlect: cate.nianji[0].id,
                            ceStlect: cate.ce[0].id,
                            kemuStlect: cate.kemu[0].id,
                            listPaddingTop: 70
                        })
                    }
                    if (res.data.list) {
                        res.data.list.forEach(item => {
                            item.newstime = that.switchTime(item.newstime);
                        })
                        that.data.itemNews = that.data.itemNews.concat(res.data.list);
                    }

                }
                that.setData({
                    itemNews: that.data.itemNews,
                    itemBanners: res.data.banner,
                    loading: that.data.loading
                })
                if (titlepics.length == 0) {
                    for (var itemNew of res.data.news) {
                        const titlepic = itemNew.titlepic;
                        titlepics.push(titlepic)
                    }
                    that.setPageInfoData(titlepics, res.data.site)
                }

            },

            fail: function (err) {
                console.log('错误码：' + err.errCode);
                console.log('错误信息：' + err.errMsg);
            }
        });
    },

    switchTime(unixtime) {
        var dateTime = new Date(parseInt(unixtime) * 1000)
        var year = dateTime.getFullYear();
        var month = dateTime.getMonth() + 1;
        var day = dateTime.getDate();
        var hour = dateTime.getHours();
        var minute = dateTime.getMinutes();

        var timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
        return timeSpanStr;

    },

    showScreen(e) { //显示筛选
        if (this.data.screenShow) {
            this.hideScreen()
            return
        }
        let index = e.currentTarget.dataset.index
        var filterList2 = []
        if (index == 0) {
            filterList2 = cate.nianji
        } else if (index == 1) {
            filterList2 = cate.ce
        } else {
            filterList2 = cate.kemu
        }
        this.setData({
            screenShow: true,
            filterList: filterList2,
            floatNavHeight: "100%",
        })
    },
    hideScreen: function () { //隐藏筛选
        this.setData({
            screenShow: false,
            floatNavHeight: "auto",
        })
    },

    showList: function (e) {
        var that = this;
        // console.log("showList ", e)
        let item = e.currentTarget.dataset.item
        if (item.type == "nianji") {
            that.setData({
                nianjiStlect: item.id,
                filter0: item.name
            })
            if (item.name == "全部") {
                this.data.nianjiFilter = ""
            } else {
                this.data.nianjiFilter = item.id
            }
        } else if (item.type == "ce") {
            that.setData({
                ceStlect: item.id,
                filter1: item.name
            })
            if (item.name == "全部") {
                this.data.ceFilter = ""
            } else {
                this.data.ceFilter = item.id
            }
        } else if (item.type == "kemu") {
            that.setData({
                kemuStlect: item.id,
                filter2: item.name
            })
            if (item.name == "全部") {
                this.data.kemuFilter = ""
            } else {
                this.data.kemuFilter = item.id
            }
        }
        that.data.pageNum = 1
        that.data.itemLists = []

        // if (that.data.keyword != "" && that.data.keyword != "undefined" && that.data.keyword != null) {
        //     that.getSearchDatas();
        // } else {
        //     that.getNavDatas();
        // }

        this.hideScreen()
        this.scrollToTop()
        this.getListData(detail)
    },
    scrollToTop() {
        swan.pageScrollTo({
            scrollTop: 0,
            duration: 300,
            success: () => {
                console.log('pageScrollTo success');
            },
            fail: err => {
                console.log('pageScrollTo fail', err);
            }
        });
    },

    swiperChange(e) {

    },

    gotomain(res) {
        console.log("gotomain", res)
        if (res == null || "" == res) {
            return
        }
        var id = res.currentTarget.dataset.item.id;
        var title = res.currentTarget.dataset.item.title;
        console.log("gotomain cmsmain id : " + id)
        swan.navigateTo({
            url: '/pages/cmsmain/cmsmain?id=' + id + '&title=' + title,
        });
    },
    loadMore: function () {
        this.data.pageNum++;
        // this.getHomeData();
        this.getListData(detail)
    },
    showMyFavoriteGuide: function () {
        swan.showFavoriteGuide({
            type: 'tip',
            content: '一键关注小程序',
            success: res => {
                console.log('关注成功：', res);
            },
            fail: err => {
                console.log('关注失败：', err);
            }
        })
    },
    getHomeData: function () {
        var that = this;
        swan.request({
            url: config.apiList.baseUrl,
            method: 'GET',
            dataType: 'json',
            data: {
                action: "index",
                page: that.data.pageNum
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                swan.hideLoading();
                console.log("getHomeData res.data", res.data);

                if (res.data == null) {
                    if (that.data.pageNum == 1) {
                        that.data.loading = '没有数据'

                    } else {
                        that.data.loading = '没有更多了'

                    }
                }

                if (res.data.news == null || res.data.news.length < 6) {
                    that.data.loading = '没有更多了'

                }

                that.data.itemNews = that.data.itemNews.concat(res.data.news);

                that.setData({
                    itemNews: that.data.itemNews,
                    itemBanners: res.data.banner,
                    loading: that.data.loading
                })
                if (titlepics.length == 0) {
                    for (var itemNew of res.data.news) {
                        const titlepic = itemNew.titlepic;
                        titlepics.push(titlepic)
                    }
                    that.setPageInfoData(titlepics, res.data.site)
                }

            },

            fail: function (err) {
                console.log('错误码：' + err.errCode);
                console.log('错误信息：' + err.errMsg);
            }
        });
    },
    setPageInfoData(titlepics, sites) {
        console.log("sites", sites)
        swan.setPageInfo({
            title: sites.title,
            image: titlepics,
            keywords: sites.sitekey,
            description: sites.siteintro,
            success: function () {},
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
        console.log("onBackTop")

        this.scrollToTop()
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
    }

})