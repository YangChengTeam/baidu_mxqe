const app = getApp()
var bdParse = require('../../bdparse/bdParse/bdParse.js')
var base64 = require('../../utils/base64')
var config = require('../../js/config')

Page({
    data: {
        id: "",
        title: "",
        writer: "",
        newDate: "",
        column: "",
        recommendTitle: "",
        relatedTitle: "",
        itemRecommends: [],
        ellipsis: true, // 文字是否收起，默认收起
        isBindEllipsis: false,
        isInWeek: true,
        isParamOk: false,
        showComment: true,
        isShowSkeleton: false,
        commentParam: {},
        toolbarConfig: {},
        show: false
    },
    /**
     * 收起/展开按钮点击事件
     */
    ellipsis: function () {
        // var value = !this.data.ellipsis;


        // this.setData({
        //     ellipsis: false,
        //     isBindEllipsis: true
        // })
        this.setData({
            show: true
        })
    },
    onInit(res) {
        this.data.id = res.id;

        this.showMyLoading();
        this.getCmsmainData();

        // this.getOpenid()
    },
    onLoad(res) {

    },
    onReady() {},
    onShow() {},
    initComment() {
        var that = this;
        that.setData({
            commentParam: {
                snid: that.data.id,
                path: '/pages/cmsmain/cmsmain?id=' + that.data.id,
                title: that.data.title,
                images: that.data.images,
            },
            toolbarConfig: {
                share: {
                    title: that.data.title,
                },
                moduleList: ['comment', 'like', 'favor', 'share'],
                placeholder: "回复评论"
            },
            showComment: false
        });
    },
    showMyLoading: function () {
        swan.showLoading({
            title: '页面加载中...',
            mask: true,
            success: function () {},
            fail: function (err) {
                console.log('showLoading fail', err);
            }
        });
    },
    onHide() {
        swan.hideLoading();
    },

    getCmsmainData: function () {
        var that = this;
        console.log("netData id:" + that.data.id);
        let userInfo = app.globalData.userInfo
        let isVip = 0;
        if (userInfo) {
            isVip = userInfo.is_vip
        }

        swan.request({
            url: config.apiList.baseUrl,
            data: {
                action: "detail",
                id: that.data.id,

            },
            success: function (res) {
                console.log("netData data", res.data);
                if (res.data == null || res.data.content == null) {
                    console.log("没有数据，返回上级页面");

                    swan.showModal({
                        title: '抱歉，页面已过期',
                        content: '该页面不存在或已被删除',
                        showCancel: false,
                        confirmText: '返回首页',
                        success: function (res) {
                            console.log("navigateBack-5555---");
                            swan.reLaunch({
                                url: '/pages/home/home',
                            });
                        },
                    });
                    swan.hideLoading();
                    return;
                }
                var contentData = base64.base64_decode(res.data.content);
                console.log("contentData ", contentData);
                console.log("res.data.inWeek ", res.data.inWeek == 0 || false);
                console.log("res.data", res.data);
                let is_sf = res.data.is_sf //是否收费 1收费 显示全部 2 免费 不显示全部
                if (isVip == 1) {
                    that.data.isBindEllipsis = true
                    that.data.ellipsis = false
                } else {
                    if (is_sf == 1) {
                        that.data.isBindEllipsis = false
                        that.data.ellipsis = true
                    } else {
                        that.data.isBindEllipsis = true
                        that.data.ellipsis = false
                    }
                }


                // 当前时间戳
                // var newstimeOut = res.data.newstime * 1000 + 1209600000  //新闻两周过期
                // var currenttimes = Date.parse(new Date());   //当前时间戳
                // console.log("time  stamp", currenttimes);
                // console.log("newstimeNum", newstimeOut)
                // if (newstimeOut > currenttimes) {
                //     that.setData({
                //         ellipsis: false,
                //         isBindEllipsis: true,
                //     })
                // }
                var contentString = bdParse.bdParse('article', 'html', contentData, that, 5);

                var list = res.data.list
                if (list) {
                    for (let index = 0; index < list.length; index++) {
                        if (list[index].images.length < 2) {
                            list[index].images[1] = res.data.file
                        }
                        if (list[index].images.length < 3) {
                            list[index].images[2] = res.data.file
                        }
                    }
                }


                that.setData({
                    content: contentString,
                    title: res.data.title,
                    column: res.data.column,
                    writer: res.data.writer,
                    newDate: res.data.time.substring(0, 10),
                    itemRecommends: list,
                    itemRelated: res.data.list2,
                    recommendTitle: "更多推荐",
                    relatedTitle: "猜你喜欢",
                    isInWeek: res.data.inWeek == 0 || false,
                    isShowSkeleton: true,
                    isBindEllipsis: that.data.isBindEllipsis,
                    ellipsis: that.data.ellipsis,
                    article_id: res.data.id,
                    class_id: res.data.class_id
                })
                swan.setPageInfo({
                    title: res.data.title,
                    keywords: res.data.keywords,
                    description: res.data.description,
                    comments: res.data.comments,
                    image: res.data.images,
                    success: function () {},
                    fail: function (err) {
                        console.log('setPageInfo fail', err);
                    }
                })
                swan.hideLoading();

                // that.getOpenid()
                that.initComment();
            },
            fail: function (err) {
                console.log('错误码：', err.errCode + " " + err.errMsg);
            }
        });

    },
    gotomain(res) {
        console.log(res)

        var id = res.currentTarget.dataset.item.id;
        var title = res.currentTarget.dataset.item.title;
        swan.navigateTo({
            url: '/pages/cmsmain/cmsmain?id=' + id + '&title=' + title,
        });
    },

    close() {
        this.setData({
            show: false,
        })
    },
    myevent() {
        console.log("close")
        this.setData({
            show: false,
            isBindEllipsis: true,
            ellipsis: false,
        })
    }
})