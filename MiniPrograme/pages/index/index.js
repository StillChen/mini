//index.js
var api = require("../../config/api.js");
var util = require("../../utils/util.js");
//获取应用实例
const app = getApp()

Page({
  data: {
    isLoading:false,
    TotalProducts:0,
    banner:[],
    snapbuygoods:[]
  },
  onLoad: function () {

  },
  onShow:function()
  {
    this.loadIndexData(0);
  },
  onPullDownRefresh:function(){
    this.loadIndexData(0);
  },
  onReachBottom:function(){
    var start = this.data.snapbuygoods.length;
    this.loadIndexData(start);
  },
  loadIndexData: function (start)
  {
    if (start>0 && start >= this.data.TotalProducts)
    {
      wx.stopPullDownRefresh();
      return;
    }
    this.setData({ isLoading:true});
    util.request(api.IndexUrl, { start: start, length: 10 }, 'POST').then((res) => {
      this.setData({ isLoading: false });
      if (res.result.token) {
        this.loadIndexData(start);
        return;
      }
      wx.stopPullDownRefresh();
      if(start==0)
      {
        this.setData({ snapbuygoods: [], TotalProducts: 0 });
      }      
      this.SetProductData(res.result.products);
      this.SetAdvertData(res.result.advert);
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  SetProductData:function(res)
  {
    console.log(res)
    var list = this.data.snapbuygoods;
    for (var i = 0; i < res.items.length;i++)
    {
      var product = res.items[i];
      list.push( {
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

    this.setData({ snapbuygoods: list, TotalProducts: res.totalCount});
  },
  SetAdvertData: function (data) {
    var advert=[];
    console.log(data.items);
    for (var i in data.items)
    {
      advert.push({
        id: data.items[i].id,
        image_url: data.items[i].image
      });
    }
    this.setData({ banner: advert });
  },
  showGoods: function (e) {
    var goodsid = e.currentTarget.dataset.goodsid;
    console.log(goodsid);
    wx.navigateTo(
      {url:"/pages/products/index/index?id="+goodsid}
    );
  }
})
