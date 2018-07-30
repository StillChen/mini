// pages/auth/login/index.js
var api = require("../../../config/api.js");
var util = require("../../../utils/util.js");
var user = require("../../../services/user.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parent:{},
    id:0,
    isOpenRegister:false,
    isLoading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   var id=options.id;
   if(id>0)
   {
     this.setData({ id: id });
   }
  },
  loadParent:function(id)
  {
    wx.showLoading();
    var that=this;
    wx.request({
      url: api.AccountGetSuperior,
      data: {id:id},
      header: {
        'Content-Type': 'application/json',
        'charset': 'utf-8'
      },
      success: function (res) {
        console.log(res.data);
        that.setData({ parent: res.data.result.result, isOpenRegister:res.data.result.isOpenRegister});
      },
      fail:function(err)
      {
        util.showErrorModal(err);
      },
      complete:function()
      {
        wx.hideLoading();
      }
    })
  },
  bindGetUserInfo:function(e)
  {
    var _this=this;
    if(e.detail.userInfo==null)
    {
      wx.showModal({
        title: '授权失败',
        content: '您没有授权我们获取您的信息',
        showCancel:false
      })
    }
    else
    {
      wx.showLoading();
      _this.setData({ isLoading:true});
      user.loginByWeixin().then(res => {
        //console.log(res);
        if(this.data.parent!=null && this.data.parent.id>0)
        {
          user.bindSuperior(this.data.parent.id);
        }
        return util.getUserInfo();
      }).then(res=>{
        wx.hideLoading();
        _this.setData({ isLoading: false });
        wx.switchTab({
          url: "/pages/account/index/index",
        });
      }).catch((err) => {
        wx.hideLoading();
        _this.setData({ isLoading: false });
        if (err.result.error.code === 402) {
          if ((_this.data.parent == null ||
            _this.data.parent.id == undefined ||
            _this.data.parent.id <= 0) && !_this.data.isOpenRegister) {
            wx.showModal({
              title: '提示',
              content: '本系统为内部系统，你未获得使用授权，请联系公司获得授权',
              showCancel: false
            })
            return;
          }
          wx.showLoading();
          _this.setData({ isLoading: true });
          user.signUp().then(res=>{
            return user.loginByWeixin();
          }).then(res=>{
            var parentId=0
            if(_this.data.parent!=null)
            {
              parentId = _this.data.parent.id;
            }
            return user.bindSuperior(parentId);
            }).then(res => {
              console.log(res);
            wx.hideLoading();
            _this.setData({ isLoading: false });
            wx.switchTab({
              url: "/pages/account/index/index",
            });
            }).catch((err) => {
              console.log(err);
              wx.hideLoading();
              _this.setData({ isLoading: false });
          });
        }
      });
    }
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
    this.loadParent(this.data.id);
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