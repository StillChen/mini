// pages/account/myorders/detail/index.js
var api = require("../../../../config/api.js");
var util = require("../../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order:{},
    goods:[],
    id:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id=options.id;
    this.loadOrderData(id);
  },
  loadOrderData:function(id)
  {
    util.request(api.OrderDetail, { id: id }, 'POST').then((res) => {
      if (res.result.token) {
        this.loadOrderData(id);
        return;
      }
      var order = res.result.order;
      switch (order.orderStatus) {
        case 0:
          order.statusName = "正在创建";
          break;
        case 1:
          order.statusName = "待支付";
          break;
        case 2:
          order.statusName = "已支付待确认";
          break;
        case 3:
          order.statusName = "已支付";
          break;
        case 40:
          order.statusName = "待发货";
          break;
        case 41:
          order.statusName = "已发货";
          break;
        case 99:
          order.statusName = "已关闭";
          break;
        case 100:
          order.statusName = "已完成";
          break;
      }
      var goods=res.result.items;
      for (var n in goods) {
        var ni = goods[n];
        if (ni.remark != null || ni.remark != '') {
          var attrs = JSON.parse(ni.remark);
          var attr = [];
          for (var j in attrs) {
            attr.push(attrs[j].value);
          }
          ni.attr = attr.join(',');
        }
      }
      console.log(order)
      //var date = new Date(order.creationTime.replace('T',' ').replace('-','/'));
      order.creationTimeString = util.formatTime(util.toDateTime(order.creationTime));
      this.setData({
        order: order,
        goods:goods,
        id: id 
      });
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