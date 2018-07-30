// pages/orders/chooseAddress/index.js
var api = require("../../../config/api.js");
var util = require("../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    TotalCount: 0,
    addresses: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  loadAddress: function (start) {
    if (start > 0 && start >= this.data.TotalCount) {
      wx.stopPullDownRefresh();
      return;
    }
    var that = this;
    util.request(api.AddressList, { start: start, length: 10 }, 'POST').then((res) => {
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
  SetAddressData: function (data) {
    var list = this.data.addresses
    var ids = wx.getStorageSync('addresslist');
    if(!ids)
    {
      ids=[];
    }
    for (var n in data.items) {
      var item = data.items[n];
      var checked = ids.find(id => { return id == item.id });
      list.push({
        "name": item.contact,
        "address": item.province + item.city + item.district + item.detail,
        "phone": item.mobile,
        "checked": checked,
        "value": item.id
      });
    }
    for (var n in list) {
      var item = list[n];
      var checked = ids.find(id => { return id == item.value });
      item.checked=checked;
    }
    this.setData({ addresses: list, TotalCount: data.totalCount });
  },
  changeAddress: function (event) {
    var ids = wx.getStorageSync('addresslist'); 
    if (!ids) {
      ids = [];
    }
    var choose = event.detail.value;
    for (var i in choose)
    {
      if (ids.find(id=>{return id==choose[i]}))
      {
        continue;
      }
      ids.push(choose[i]);
    }
    wx.setStorage({
      key: 'addresslist',
      data: ids,
    });
    //wx.setStorageSync("addresslist", event.detail.value)
    //console.log(event.detail.value);
  },
  saveClientAddress: function (event) {
    wx.navigateBack();
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadAddress(this.data.addresses.length);
  }
})