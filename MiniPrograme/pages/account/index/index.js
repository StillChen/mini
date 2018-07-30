// pages/account/index/index.js
var api = require("../../../config/api.js");
var util = require("../../../utils/util.js");
var user = require("../../../services/user.js");

const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ApiRootUrl: api.ApiRootUrl,
    level: 0,
    levelImg: api.ApiRootUrl+"images/vip1.png",
    uplevel:"",
    balance: 0,
    income: 0,
    achievement: 0,
    userinfo:{},
    superiorAvatar:"",
    userProfile:{},
    orderTotal:null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    var userinfo = wx.getStorageSync("userInfo");
    if (!userinfo) {
      util.getUserInfo().then((res) => {
        userinfo = res.userInfo;
        this.setData({
          userinfo: {
            nickname: userinfo.nickName,
            avatar: userinfo.avatarUrl
          }
        })
      });
    }
    this.setData({
      userinfo: {
        nickname: userinfo.nickName,
        avatar: userinfo.avatarUrl
      }
    });
  },
  loadIndexData: function () {
    util.request(api.AccountIndex, {}, 'POST').then((res) => {
      if (res.result.token) {
        this.loadIndexData();
        return;
      }
      wx.stopPullDownRefresh();

      let wealth = res.result.userWealth;
      let profile = res.result.userProfile;
      var superiorUserProfile = res.result.superiorUserProfile;
      var orderTotal = res.result.orderTotal;
      console.log(orderTotal)
      this.setData({
        balance: wealth.balance,
        income: wealth.totalProfit,
        achievement: wealth.totalAchievement,
        superiorAvatar: superiorUserProfile != null ? superiorUserProfile.avatar : '',
        level:profile.vipLevel,
        levelImg: api.ApiRootUrl+ "images/vip"+profile.vipLevel+".png",
        uplevel: res.result.upLevelTip,
        userProfile: profile,
        orderTotal: orderTotal == undefined ? null : orderTotal
      });

    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadIndexData();
    
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadIndexData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.userProfile.nickName+'邀请您加入闺蜜优团',
      path: 'pages/auth/login/index?id=' + this.data.userProfile.id
    }
  },
  showShareMenu:function(){
    this.onShareAppMessage();    
  }
})