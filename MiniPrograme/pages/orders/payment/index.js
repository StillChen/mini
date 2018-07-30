// pages/orders/payment/index.js
var api = require("../../../config/api.js");
var util = require("../../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order:{},
    userProfile:{},
    id:0,
    second:0,
    secondFormat: "30:00",
    useBalance: 0,
    balance:0,
    amount: 0,
    isSubmit: false,
    timer:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id=options.id;
    this.setData({id:id});
    this.countdown(this);
    this.loadOrderData(id);
  },
  loadOrderData:function(id)
  {
    util.request(api.OrderPayment, { id: id }, 'POST').then((res) => {
      if (res.result.token) {
        this.loadOrderData(id);
        return;
      }
      if (res.result.error!=0)
      {
        console.log(res);
        wx.redirectTo({
          url: '/pages/orders/paymentFail/index'
        });
        return;
      }
      if(!this.checkOrderStatus(res.result.order))
      {
        return;
      }
      var date = util.toDateTime(res.result.order.creationTime);
      var now = new Date();
      
      var second = (Date.parse(date) + 30 * 60 * 1000 - Date.parse(now))/1000;
      var format=this.dateformat(second);
      this.setData({ userProfile: res.result.profile, 
                     order: res.result.order, 
                     amount: res.result.order.amount, 
                     balance: res.result.profile.balance, 
                     second: second,
                     secondFormat: format});
      this.countdown(this);
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  checkOrderStatus:function(order)
  {
    if(order.orderStatus==1)
    {
      return true;
    };
    if (res.result.order.orderStatus == 3) {
      wx.redirectTo({
        url: '/pages/orders/paymentSuccess/index'
      });
    }
    else
    {
      wx.redirectTo({
        url: '/pages/orders/paymentFile/index'
      });
    }

    return false;
  },
  changeUseBalance: function (event) {
    let amount = this.data.order.amount;
    let balance = this.data.userProfile.balance;
    let useBalance=0;
    if (event.detail.value) {
      amount -= balance;
      if (amount < 0) {
        useBalance = this.data.order.amount;
        amount = 0;
      }
      else
      {
        useBalance = balance;
      }
      balance -= this.data.order.amount;
      if (balance<0)
      {
        balance=0;
      }
    }

    this.setData({ useBalance: useBalance, amount: amount, balance: balance});

  },
  countdown:function(that) {
    var second = that.data.second
    if (second <= 0) {
      // console.log("Time Out...");
        that.setData({
          secondFormat: "00:00"
        });
        return;
      }
      var time = setTimeout(function () {
        let format=that.dateformat(second-1);
          that.setData({
            second: second - 1,
            secondFormat: format
          });
          that.countdown(that);
        }
      , 1000);
      that.setData({timer:time});
  },
  dateformat:function(second) {
    if(second<=0)
    {
      console.log("second=0");
      wx.redirectTo({
        url: '/pages/orders/paymentFail/index'
      });
    }
    // 分钟位
    var min = Math.floor((second) / 60);
    // 秒位
    var sec = (second - min * 60);

    if (min < 10) {
      min = '0' + min;
    }
    if (sec < 10) {
      sec = '0' + sec;
    }
    return  min + ":" + sec;
  },
  onPayment:function()
  {
    if (this.data.order.amount == this.data.useBalance)
    {
      this.paymentByBalance();
    }
    else
    {
      //微信支付
      this.wechatPayment();
    }
  },
  wechatPayment:function()
  {
    //JsApiUnifiedorder
    util.request(api.OrderPaymentJsApiUnifiedorder, { orderid: this.data.id, useBalance: this.data.useBalance}, 'POST').then((res) => {
      if (res.result.token) {
        this.wechatPayment();
        return;
      }
      if (res.result.status) {
        wx.requestPayment(
          {
            'timeStamp': res.result.timeStamp,
            'nonceStr': res.result.nonceStr,
            'package': res.result.packageValue,
            'signType': 'MD5',
            'paySign': res.result.paySign,
            'success': function (res) {
              wx.redirectTo({
                url: '/pages/orders/paymentSuccess/index'
              });
             },
            'fail': function (res) {
              console.log(res);
              wx.redirectTo({
                url: '/pages/orders/paymentFail/index'
              });
             }
          })
      }
      else {
        wx.showModal({
          title: '支付失败',
          content: res.result.msg,
          showCancel: false
        });
      }
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  paymentByBalance:function()
  {
    util.request(api.OrderPaymentByBalance, { id: this.data.id }, 'POST').then((res) => {
      if (res.result.token) {
        this.paymentByBalance();
        return;
      }
      if (res.result.status)
      {
        wx.redirectTo({
          url: '/pages/orders/paymentSuccess/index'
        });
      }
      else
      {
        wx.showModal({
          title: '支付失败',
          content: res.result.message,
          showCancel: false
        });
      }
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  cancelPay:function()
  {
    wx.switchTab({
      url: '/pages/account/index/index',
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
    if (this.data.timer>0)
    {
      clearTimeout(this.data.timer);
    }
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