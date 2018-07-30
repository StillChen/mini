// pages/account/myorders/express/index.js
var api = require("../../../../config/api.js");
var util = require("../../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    express:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id=options.id;
    this.loadExpress(id);
  },
  loadExpress:function(id)
  {
    //OrderExpress
    util.request(api.OrderExpress, { id: id }, 'POST').then((res) => {
      if (res.result.token) {
        this.loadExpress(id);
        return;
      }
      console.log(res);
      if (res.result == null || res.result.status!=200)
      {
        this.setData({ express: { stateName: '查无记录', com: res.result.com, nu: res.result.nu, data: [{ context: '暂时查无记录,请稍后再试', ftime: util.formatTime(new Date())}]} });

        return;
      }
      //0在途中、1已揽收、2疑难、3已签收、4退签、5同城派送中、6退回、7转单
      var express = res.result;
      switch(express.state)
      {
        case 0:
          express.stateName ="在途中";
          break;
        case 1:
          express.stateName = "已揽收";
          break;
        case 2:
          express.stateName = "疑难";
          break;
        case 3:
          express.stateName = "已签收";
          break;
        case 4:
          express.stateName = "退签";
          break;
        case 5:
          express.stateName = "同城派送中";
          break;
        case 6:
          express.stateName = "退回";
          break;
        case 7:
          express.stateName = "转单";
          break;
      }
      this.setData({ express:res.result});
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