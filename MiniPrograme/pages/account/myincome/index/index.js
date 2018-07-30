// pages/account/myincome/index/index.js
var api = require("../../../../config/api.js");
var util = require("../../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    income:{},
    dayIncome:[],
    dayIncomeTotal:0,
    isLoading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadTotalIncomeData();
  },
  loadTotalIncomeData: function () {
    util.request(api.AccountTotalIncome, {}, 'POST').then((res) => {
      if (res.result.token) {
        this.loadTotalIncomeData();
        return;
      }
      console.log(res);
      if (res.result == null) {
        return;
      }
      this.setData({ income: res.result });
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  loadDayIncomeList:function(start){
    if (start > 0 && this.data.dayIncomeTotal <= start) {
      return;
    }
    this.setData({ isLoading: true });
    util.request(api.AccountDayIncome, { start: start, length: 10 }, 'POST').then((res) => {
      this.setData({ isLoading: false });
      if (res.result.token) {
        this.loadDayIncomeList(start);
        return;
      }
      console.log(res);
      if (res.result == null) {
        return;
      }
      //this.setData({ income: res.result });
      this.setDayIncome(res.result);
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  setDayIncome:function(data)
  {
    var list = this.data.dayIncome
    for (var n in data.items) {
      var item = data.items[n];
      item.fdate=item.date.replace('T00:00:00','');
      list.push(item);
    }
    this.setData({ dayIncome: list, dayIncomeTotal: data.totalCount });
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
    this.loadDayIncomeList(0);
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
    this.loadDayIncomeList(this.data.dayIncome.length);
  }
})