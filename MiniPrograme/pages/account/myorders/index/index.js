// pages/account/myorders/index/index.js
var api = require("../../../../config/api.js");
var util = require("../../../../utils/util.js");

const sliderWidth = 75;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["全部", "待付款", "待发货", "待收货", "已完成"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    allList: [],
    allTotal:0,
    pendingList: [],
    pendingTotal: 0,
    paidList: [],
    paidTotal: 0,
    shippingList: [],
    shippingTotal: 0,
    finishedList: [],
    finishedTotal: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var activeIndex = 0;
    switch (options.tag) {
      case 'pending':
        activeIndex = 1;
        break;
      case 'shipping':
        activeIndex = 2;
        break;
      case 'shipped':
        activeIndex = 3;
        break;
      case 'finished':
        activeIndex = 4;
        break;
      default:
        activeIndex = 0;
        break;
    }
    this.setData({ activeIndex:activeIndex});
    this.loadOrders(0,activeIndex);
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * activeIndex
        });
      }
    });
  },
  tabClick: function (e) {
    var status = parseInt(e.currentTarget.id);
    switch (status) {
      case 0:
        this.loadOrders(this.data.allTotal, status);
        break;
      case 1:
        this.loadOrders(this.data.pendingTotal, status);
        break;
      case 2:
        this.loadOrders(this.data.paidTotal, status);
        break;
      case 3:
        this.loadOrders(this.data.shippingTotal, status);
        break;
      case 4:
        this.loadOrders(this.data.finishedTotal, status);
        break;
    }
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: status
    });
  },
  loadOrders: function (start, status)
  {
    let orderStatus=-1;
    switch (status) {
      case 0:
        if (start>0 && start>=this.data.allTotal)
        {
          return;
        }
        break;
      case 1:
        if (start > 0 && start >= this.data.pendingTotal) {
          return;
        }
        orderStatus = 1;
        break;
      case 2:
        if (start > 0 && start >= this.data.paidTotal) {
          return;
        }
        orderStatus = 40;
        break;
      case 3:
        if (start > 0 && start >= this.data.shippingTotal) {
          return;
        }
        orderStatus = 41;
        break;
      case 4:
        if (start > 0 && start >= this.data.finishiedTotal) {
          return;
        }
        orderStatus = 100;
        break;
    }

    util.request(api.OrderList, { start: start, length: 10, orderStatus: orderStatus }, 'POST').then((res) => {
      if (res.result.token) {
        this.loadOrders(start, status);
        return;
      }
      this.setOrderData(res.result,status);
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  setOrderData:function(data,status)
  {
    console.log(data);
    if(data==null)
    {
      return;
    }
    var orders=[];
    var total=0;
    switch (status) {
      case 0:
        orders=this.data.allList;
        break;
      case 1:
        orders = this.data.pendingList;
        break;
      case 2:
        orders = this.data.paidList;
        break;
      case 3:
        orders = this.data.shippingList;
        break;
      case 4:
        orders = this.data.finishedList;
        break;
    }
    for(var i in data.items)
    {
      var item = data.items[i];
      item.dateformat = util.formatTime(util.toDateTime(item.creationTime));
      for (var n in item.items) {
        var ni = item.items[n];
        if (ni.remark != null || ni.remark != '') {
          var attrs = JSON.parse(ni.remark);
          var attr = [];
          for (var j in attrs) {
            attr.push(attrs[j].value);            
          }
          ni.attr = attr.join(',');
        }
      }
      switch (item.orderStatus) {
        case 0:
          item.statusName= "正在创建";
          break;
        case 1:
          item.statusName = "待支付";
          break;
        case 2:
          item.statusName = "已支付待确认";
          break;
        case 3:
          item.statusName = "已支付";
          break;
        case 40:
          item.statusName = "待发货";
          break;
        case 41:
          item.statusName = "已发货";
          break;
        case 99:
          item.statusName = "已关闭";
          break;
        case 100:
          item.statusName = "已完成";
          break;
      }
      orders.push(data.items[i]);
    }
    
    switch (status) {
      case 0:
        this.setData({ allList: orders, allTotal: data.totalCount})
        break;
      case 1:
        this.setData({ pendingList: orders, pendingTotal: data.totalCount })
        break;
      case 2:
        this.setData({ paidList: orders, paidTotal: data.totalCount })
        break;
      case 3:
        this.setData({ shippingList: orders, shippingTotal: data.totalCount })
        break;
      case 4:
        this.setData({ finishedList: orders, finishedTotal: data.totalCount })
        break;
    }
  },
  finishedOrder:function(event)
  {
    var id = event.currentTarget.dataset.orderid;
    wx.showLoading({
      title: '正在完成',
    });
    util.request(api.OrderCompleted, { id:id }, 'POST').then((res) => {
      wx.hideLoading();
      if (res.result.status) {
        var list = this.data.shippingList;
        var allList = this.data.allList;
        var li = list.findIndex((item)=>{
          return item.id==id;
        })
        for (var item in allList)
        {
            if(allList[item].id==id)
            {
              allList[item].statusName = "已完成";
              allList[item].orderStatus=100;
            }
        }
        list.splice(li,1);
        this.setData({ allList: allList, shippingList: list, shippingTotal: this.data.shippingTotal-1})
        return;
      }
      wx.showToast({
        title: '操作失败',
      })
    }).catch(err => {
      wx.hideLoading();
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
    var orders=[];
    switch (this.data.activeIndex) {
      case 0:
        orders = this.data.allList;
        break;
      case 1:
        orders = this.data.pendingList;
        break;
      case 2:
        orders = this.data.paidList;
        break;
      case 3:
        orders = this.data.shippingList;
        break;
      case 4:
        orders = this.data.finishedList;
        break;
    }
    this.loadOrders(orders.length, this.data.activeIndex);
  }
})