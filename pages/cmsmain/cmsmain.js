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
        showComment:true,
        isShowSkeleton: false,
        commentParam: {},
        toolbarConfig: {},
    },
    /**
   * 收起/展开按钮点击事件
   */
    ellipsis: function () {
        var value = !this.data.ellipsis;
        this.setData({
            ellipsis: false,
            isBindEllipsis: true
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
    onReady() {
    },
    onShow() {
    },
    initComment(){
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
            showComment:false
        });
    },
    showMyLoading: function () {
        swan.showLoading({
            title: '页面加载中...',
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

    getCmsmainData: function () {
        var that = this;
        console.log("netData id:" + that.data.id);
        console.log("netData url:" + that.data.id);
        console.log("netData id:" + that.data.id);
        swan.request({
            url: config.apiList.baseUrl,
            data: {
                action: "detail",
                id: that.data.id,
                // id: 20613,
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
                if(list){
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
                })
                swan.setPageInfo({
                    title: res.data.title,
                    keywords: res.data.keywords,
                    description: res.data.description,
                    comments: res.data.comments,
                    image: res.data.images,
                    success: function () {
                    },
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
    getOpenid() {
        swan.login({
            success: res => {
                swan.request({
                    url: 'https://spapi.baidu.com/oauth/jscode2sessionkey',
                    method: 'POST',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                        code: res.code,
                        // client_id = AppKey, sk = AppSecret
                        // client_id: '你的AppKey', // eslint-disable-line
                        //  sk: '你的AppSecret'
                        client_id: 'kKfaiMc6apvdkoRm06Dyp84FBIvQYGOx', // eslint-disable-line
                        sk: 'Ux81AfLlBSk5fDyo8SmRP4rf387LHogt'
                    },
                    success: res => {
                        var that = this
                        console.log("netData getOpenid res ", res)
                        if (res.statusCode == 200) {
                            // 这里是使用获取到的用户openid
                            that.setData({
                                commentParam: {
                                    openid: res.data.openid,
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
                                isParamOk: true,
                            });
                        }
                    },
                    fail: function (err) {
                        console.log('getOpenid fail', err);
                    }
                });
            }, fail: function (err) {
                console.log('getOpenid fail 222', err);
            }
        });
    }
})
