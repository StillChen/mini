// pages/account/myperformance/index/index.js

var api = require("../../../../config/api.js");
var util = require("../../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    achievement: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadTotalAchievementData();
  },
  loadTotalAchievementData: function () {
    util.request(api.AccountTotalAchievement, {}, 'POST').then((res) => {
      if (res.result.token) {
        this.loadTotalAchievementData();
        return;
      }
      console.log(res);
      if (res.result == null) {
        return;
      }
      this.setData({ achievement: res.result });
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  }
})