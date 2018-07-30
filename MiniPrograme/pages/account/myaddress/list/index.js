// pages/account/myaddress/list/index.js
var api = require("../../../../config/api.js");
var util = require("../../../../utils/util.js");
var user = require("../../../../services/user.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    TotalCount:0,
    addresses: [],
    isLoading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  loadAddress:function(start)
  {
    if (start > 0 && start >= this.data.TotalCount) {
      wx.stopPullDownRefresh();
      return;
    }
    var that = this;
    this.setData({ isLoading: true });
    util.request(api.AddressList, { start: start, length: 10 }, 'POST').then((res) => {
      this.setData({ isLoading: false });
      if (res.result.token) {
        that.loadAddress(start);
        return;
      }
      wx.stopPullDownRefresh();
      if (start == 0) {
        that.setData({ addresses: [], TotalCount: 0 });
      }
      console.log(res);
      that.SetAddressData(res.result);
    }).catch(err => {
      console.log(err);
      if (err.errMsg == 'request:fail timeout') {
        wx.showModal({
          title: '系统错误',
          content: '请求超时，请检查网络',
        });
      }
      else {
        wx.showModal({
          title: '系统错误',
          content: '发生系统错误，请稍后再试！',
        });
      }
    });
  },
  SetAddressData:function(data){
    var list = this.data.addresses
    for(var n in data.items)
    {
      var item=data.items[n];
      list.push({
        "name": item.contact,
        "address": item.province + item.city + item.district + item.detail,
        "phone": item.mobile,
        "checked": item.isDefault,
        "value": item.id
      });
    }
    this.setData({addresses:list,TotalCount:data.totalCount});
  },
  addNewAddress: function (event) {
    wx.navigateTo({
      url: '../add/add'
    })
  },
  editAddress: function (event) {
    let id = event.currentTarget.dataset.value;
    wx.navigateTo({
      url: '../add/add?id=' + id
    });
  },
  deleteAddress:function(event)
  {
    var that = this;
    wx.showModal({
      title: '删除地址',
      content: '确定要删除此地址吗？',
      success: function (res) {
        if (res.confirm) {
          let id = event.currentTarget.dataset.value;
          let index = event.currentTarget.dataset.index;
          wx.showLoading({
            title: '正在提交...',
          });
          util.request(api.AddressDelete, { id: id }, 'POST').then((res) => {
            wx.hideLoading();
            if (res.result.token) {
              that.deleteAddress(event);
              return;
            }

            var _addresses = that.data.addresses;

            _addresses.splice(index, 1);

            that.setData({ addresses: _addresses, TotalCount: that.data.TotalCount - 1 });
          }).catch(err => {
            wx.hideLoading();
            if (err.errMsg == 'request:fail timeout') {
              wx.showModal({
                title: '系统错误',
                content: '请求超时，请检查网络',
              });
            }
            else {
              wx.showModal({
                title: '系统错误',
                content: '发生系统错误，请稍后再试！',
              });
            }
          });
        }
      }
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
    this.loadAddress(0);
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
    this.loadAddress(0);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

    this.loadAddress(this.data.addresses.length);
  },
})