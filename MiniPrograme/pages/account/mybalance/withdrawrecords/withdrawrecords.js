// pages/account/mybalance/withdrawrecords/withdrawrecords.js
var api = require("../../../../config/api.js");
var util = require("../../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    froms: [],
    fromsTotal: 0,
    isLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadRecordData(0);
  },
  loadRecordData: function (start) {
    if (start > 0 && this.data.fromsTotal <= start) {
      return;
    }
    this.setData({ isLoading: true });
    util.request(api.AccountWithdrawRecord, { start: start, length: 10 }, 'POST').then((res) => {
      this.setData({ isLoading: false });
      if (res.result.token) {
        this.loadRecordData(start);
        return;
      }
      if (res.result == null) {
        return;
      }
      this.setFromData(res.result);
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  setFromData: function (data) {
    var total = data.totalCount;
    var froms = this.data.froms;
    for (var i in data.items) {
      var item = data.items[i];
      var status='';
      switch (item.applyWithdrawStatus)
      {
        case 0:
          status = '待处理';
          break;
        case 1:
          status = '处理中';
          break;
        case 2:
          status = '已完成';
          break;
        case 3:
          status = '已关闭';
          break;
      }
      froms.push(
        {
          "title": status,
          "subtitle": "用户提现",
          "date": util.formatTime(util.toDateTime(item.creationTime)),
          "money": item.amount
        }
      )
    }
    this.setData({ froms: froms, fromsTotal:total});
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