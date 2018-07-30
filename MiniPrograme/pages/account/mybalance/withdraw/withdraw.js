// pages/account/mybalance/withdraw/withdraw.js
const Toptips = require("../../../../components/toptips/index");
var api = require("../../../../config/api.js");
var util = require("../../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    profile:{},
    amount: '', 
    duration: 1000,
    content: 'xxx',
    $zanui: {
      toptips: {
        show: false
      }
    },
    isSubmit:false,
    canSubmit:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadProfileData();
    var date=new Date();
    console.log(date.getDate())
    if (date.getDate() >= 1 && date.getDate()<4)
    {
      this.setData({ canSubmit:true});
    }
  },
  loadProfileData: function () {
    util.request(api.AccountProfile, {}, 'POST').then((res) => {
      if (res.result.token) {
        this.loadProfileData();
        return;
      }
      console.log(res);
      if (res.result == null) {
        return;
      }
      this.setData({ profile: res.result });
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  allWithdraw:function()
  {
    this.setData({amount:this.data.profile.balance});
  },
  setAmount:function(event)
  {
    this.setData({ amount: event.detail.value });
  },
  SubmitWithdraw:function()
  {
    var amount = this.data.amount;

    if(amount<50)
    {
      Toptips({
        duration: 3000,
        content: '提现金额必须大于50'
      })
      return;
    }

    if (this.data.isSubmit) {
      return;
    }
    this.setData({ isSubmit: true });
    wx.showLoading({
      title: '正在提交...',
    });

    util.request(api.AccountWithdraw, {amount:amount}, 'POST').then((res) => {
      wx.hideLoading();
      if (res.result.token) {
        this.loadProfileData();
        return;
      }
      if (res.result == null || !res.result.status) {
        Toptips({
          duration: 3000,
          content: '申请提交失败'
        })
        return;
      }
      this.setData({ isSubmit: false });
      wx.showModal({
        title: '提交成功',
        content: '您的提现申请已提交',
        showCancel:false,
        success:function(){
          wx.navigateBack();
        }
      })
    }).catch(err => {
      wx.hideLoading();
      this.setData({ isSubmit: false });
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
    this.setData({ isSubmit: false });
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