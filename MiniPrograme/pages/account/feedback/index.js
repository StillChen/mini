// pages/account/feedback/index.js
var api = require("../../../config/api.js");
var util = require("../../../utils/util.js");
var user = require("../../../services/user.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeKind:0,
    message:"",
    mobile:"",
    isSubmit:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  chooseKind:function(e){
    var kind = e.currentTarget.dataset.kind;
    console.log(kind);
    this.setData({ activeKind:kind});
  },
  onSubmitForm:function(e){
    if (this.data.isSubmit)
    {
      return;
    }
    this.setData({isSubmit:true});
    wx.showLoading({
      title: '正在提交...',
    });

    let value=e.detail.value;
    switch (this.data.activeKind)
    {
      case 1:
        value.feedbackType = "购物流程";
      break;
      case 2:
        value.feedbackType = "物流问题";
      break;
      case 3:
        value.feedbackType = "售后服务";
      break;
      case 4:
        value.feedbackType = "新品提议";
      break;
      default:
        value.feedbackType = "其他意见";
      break;
    }
    console.log(value);
    //FeedbackType
    util.request(api.AccountFeedback,value,"POST").then(res=>{
      //console.log(res);
      var _this=this;
      wx.hideLoading();
      if(!res.result.status)
      {
          wx.showModal({
            title: '失败',
            content: '提交失败',
            showCancel : false
        })
          _this.setData({ isSubmit: false });
      }
      else
      {
        wx.showToast({
          title: '提交成功', 
          complete:function()
          {
            setTimeout(() => {
              _this.setData({ isSubmit: false });
              wx.navigateBack();
            },2000) 
          }
        })
      }
    }).catch((err)=>{
      wx.hideLoading();
      _this.setData({ isSubmit: false });
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
  
  },

})