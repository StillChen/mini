// pages/account/mybalance/index/index.js
var api = require("../../../../config/api.js");
var util = require("../../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    profile:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadProfileData();
  },
  loadProfileData:function()
  {
    util.request(api.AccountProfile, { }, 'POST').then((res) => {
      if (res.result.token) {
        this.loadProfileData();
        return;
      }
      console.log(res);
      if (res.result == null ) {
        return;
      }
      this.setData({ profile: res.result});
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  openWithdraw: function () {
    wx.navigateTo({
      url: '../withdraw/withdraw',
    })
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