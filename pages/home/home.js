
const app = getApp()
var config = require('../../js/config')
var base64 = require('../../utils/base64')

const TOP_DISTANCE = 630;
var titlepics = []; //setPageInfo 图片容器

Page({
    data: {
        navData: [
            {
                path: "/pages/list/list",
                name: "最新"
            },
            {
                path: "/pages/list/list",
                name: "小学",
            },
            {
                path: "/pages/list/list",
                name: "初中",
            },
            {
                path: "/pages/list/list",
                name: "高中",
            },
        ],
        pageName: '最新',
        itemBanners: [
        ],
        itemNews: [
        ],
        itemNewsMore: [
        ],
        itemData: {
        },
        pageNum: 1,
        current: 0,
        switchIndicateStatus: true,
        switchAutoPlayStatus: false,
        switchDuration: 500,
        autoPlayInterval: 2000,
        showBackTop: false,
        loading: "加载中...",
        isOneLoading: true,
    },
    onInit() {
        console.log("00671", "onInit")
        this.showMyLoading();
        this.getHomeData();
        this.showMyFavoriteGuide();
    },
    onLoad() { // 监听页面加载的生命周期函数
        console.log("00671", "onLoad")
    },
    onReady() {
    },
    onShow() {
    },
    showMyLoading: function () {
        console.log("showMyLoading isOneLoading", this.data.isOneLoading);
        if (this.data.isOneLoading) {
            swan.showLoading({
                title: '页面加载中...',
                mask: true,
                success: function () {
                },
                fail: function (err) {
                    console.log('showLoading fail', err);
                }
            });
        }
    },
    swiperChange(e) {

    },
    gotoclass(res) {
        console.log("gotoclass : " + res)
        var path = res.currentTarget.dataset.nav.path;
        var name = res.currentTarget.dataset.nav.name;
        swan.redirectTo({
            url: '/pages/list/list?path=' + path + '&name=' + name,
            success: function () {
                console.log('redirectTo success');
            },
            fail: function (err) {
                console.log('redirectTo fail', err);
            }
        });
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
        this.getHomeData();
    },
    showMyFavoriteGuide: function () {
        swan.showFavoriteGuide({
            type: 'bar',
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
                        that.setData('loading', "没有数据");
                    } else {
                        that.setData('loading', "没有更多了");
                    }
                }

                that.data.itemNews = that.data.itemNews.concat(res.data.news);

                that.setData({
                    itemNews: that.data.itemNews,
                    itemBanners: res.data.banner,
                })
                if (titlepics.length == 0) {
                    for (var itemNew of res.data.news) {
                        const titlepic = itemNew.titlepic;
                        titlepics.push(titlepic)
                    }
                    that.setPageInfoData(titlepics, res.data.site)
                }
                if (res.data.news == null || res.data.news.length < 6) {
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
    setPageInfoData(titlepics, sites) {
        swan.setPageInfo({
          title: sites.title != undefined && sites.title != null,
            image: titlepics,
            keywords: sites.sitekey,
            description: sites.siteintro,
            success: function () {
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
            // duration: 0
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
    }

})
