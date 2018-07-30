// pages/resource/index/index.js
var api = require("../../../config/api.js");
var util = require("../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nodata_str: "没有数据",
    isLoading: false,
    TotalProducts: 0,
    snapbuygoods: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  loadIndexData: function (start) {
    if (start > 0 && start >= this.data.TotalProducts) {
      return;
    }
    this.setData({ isLoading: true });
    util.request(api.LastProduct, { start: start, length: 10 }, 'POST').then((res) => {
      this.setData({ isLoading: false });
      if (res.result.token) {
        this.loadIndexData(start);
        return;
      }
      wx.stopPullDownRefresh();
      if (start == 0) {
        this.setData({ snapbuygoods: [], TotalProducts: 0 });
      }
      this.SetProductData(res.result);
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  SetProductData: function (res) {
    var list = this.data.snapbuygoods;
    for (var i = 0; i < res.items.length; i++) {
      var product = res.items[i];
      list.push({
        id: product.id,
        thumb: product.picturePath,
        price: product.price,
        income: product.price - product.wholesalePrice,
        title: product.title,
        subtitle: product.subTitle,
        quantity: product.quantity,
        stock: product.stock
      });
    }
    wx.setNavigationBarTitle({
      title: '往期团品 (' + res.totalCount+'款)',
    })
    this.setData({ snapbuygoods: list, TotalProducts: res.totalCount });
  },
  showGoods: function (e) {
    var goodsid = e.currentTarget.dataset.goodsid;
    console.log(goodsid);
    wx.navigateTo(
      { url: "/pages/products/index/index?id=" + goodsid }
    );
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
    this.loadIndexData(0);
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
    this.loadIndexData(0);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var start = this.data.snapbuygoods.length;
    this.loadIndexData(start);
  }
})