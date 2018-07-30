// pages/orders/confirm/index.js
var api = require("../../../config/api.js");
var util = require("../../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: {},
    customs:[],
    quantity:0,
    userProfile:null,
    useBalance:false,
    amount:0,
    isSubmit:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var id=options.goodid;
    if(id>0)
    {
      this.loadGoods(id);
    }
    else
    {
      wx.navigateBack();
    }
  },
  loadUserProfile:function()
  {
    //AccountProfile
    util.request(api.AccountProfile, {}, 'POST').then((res) => {
      if (res.result.token) {
        this.loadUserProfile();
        return;
      }
      this.setData({userProfile:res.result});
    }).catch(err => {
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
  loadGoods:function(id)
  {
    util.request(api.GoodsById, { id: id }, 'POST').then((res) => {
      if (res.result.token) {
        this.loadGoods(id);
        return;
      }
      this.loadUserProfile();
      this.SetProductData(res.result);
    }).catch(err => {
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
  SetProductData:function(data)
  {
    //console.log(data);
    var skuAttrValue = "";
    if (data.skuAttrValue != null && data.skuAttrValue!="")
    {
      var attrs = JSON.parse(data.skuAttrValue);
      var attr=[];
      for(var n in attrs)
      {
        attr.push(attrs[n].value);
      }
      skuAttrValue=attr.join(',');
    }
    
    this.setData({goods:{
      id: data.id,
      thumb: data.picturePath,
      price: data.price,
      income: data.price - data.wholesalePrice,
      title: data.title,
      attrValue: skuAttrValue,
      subtitle: data.subTitle,
      quantity: data.quantity,
      stock: data.stock
    }});
  },
  
  chooseClientAddress:function(event)
  {
    wx.navigateTo({
      url: '../chooseAddress/index',
    })
  },
  loadCustomAddress:function()
  {
    var addresslist = wx.getStorageSync("addresslist");
      //AddressClientsList
    var ids=[]
    var customs = this.data.customs;
    for (var i in addresslist) {
      var item = addresslist[i];
      if (customs.find(a => {
        return a.id == item
      })) {
        continue;
      }
      ids.push(item)
    }
    if(ids.length<=0)
    {
      return;
    }
    var that = this;
    util.request(api.AddressClientsList, { ids: ids }, 'POST').then((res) => {
      if (res.result.token) {
        that.loadCustomAddress();
        return;
      }
      that.SetCustomAddressData(res.result);
    }).catch(err => {
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
  SetCustomAddressData:function(data)
  {
    var customs=this.data.customs;
    for(var i in data)
    {
      var item = data[i];
      if(customs.find(a=>{
        return a.id==data[i].id
      }))
      {
        continue;
      }
      customs.push(
      {
        "id": item.id,
        "name": item.contact,
        "address": item.province + item.city + item.district + item.detail,
        "phone": item.mobile,
        "count": 1,
        "stepper": {
          stepper: 1,
          min: 1,
          max: 99
          }
      });
    }
    this.setData({ customs: customs });
    this.updateQuantity();
  },
  removeCustomAddress(event)
  {
    var index = event.currentTarget.dataset.index;
    var customs=this.data.customs;
    var client=customs[index];
    if(index>=customs.length)
    {
      return;
    }
    customs.splice(index,1);
    var ids=wx.getStorageSync("addresslist");
    var idIndex=ids.indexOf(client.id.toString());
    ids.splice(idIndex, 1);

    //console.log(client.id)
    wx.setStorage({
      key: 'addresslist',
      data: ids,
    });

    this.setData({ customs: customs });
  },
  clearCustom:function(){
    wx.removeStorage({
      key: 'addresslist'
    });
    this.setData({ customs: [] });

  },
  addNewAddress: function (event) {
    wx.navigateTo({
      url: '../../account/myaddress/add/add?from=comfirmorder'
    })
  },
  handleZanStepperChange({
    detail: stepper,
    target: {
      dataset: {
        componentId
      }
    }
  }) {
    this.setData({
      [`${componentId}.stepper`]: stepper
    });
    this.updateQuantity();
  },
  updateQuantity:function(){
    let customs=this.data.customs;
    let goods=this.data.goods;
    let useBalance = this.data.useBalance;
    let profile=this.data.userProfile;
    let quantity=0;
    for(let c in customs)
    {
      quantity += customs[c].stepper.stepper
    }
    let amount = (goods.price - goods.income) * quantity;

    if (useBalance) {
      amount = amount-profile.balance;
    }
    if(amount<0)
    {
      amount=0;
    }
    this.setData({ quantity: quantity, amount: amount});
  },
  changeUseBalance:function(event)
  {
    this.setData({ useBalance: event.detail.value });
    this.updateQuantity();
  },
  createOrder:function()
  {
    if (this.data.isSubmit) {
      return;
    }
    let goods=this.data.goods;
    var customs=this.data.customs;
    if(goods==null && goods.id<=0)
    {
      wx.showModal({
        title: '提交失败',
        content: '商品信息错误请返回商品详情页重新选择',
        showCancel: false
      })
      return;
    }
    if(customs.length<=0)
    {
      wx.showModal({
        title: '提交失败',
        content: '请选择客户信息',
        showCancel: false
      })
      return;
    }

    this.setData({ isSubmit: true });
    wx.showLoading({
      title: '正在提交...',
    });

    var clients=[];
    for (let c in customs) {
      clients.push({
        id: customs[c].id,
        quantity: customs[c].stepper.stepper
      })
    }

    util.request(api.OrderSubmit, {
      Remark: JSON.stringify(clients),
      goodsId: goods.id
    }, "POST").then(res => {
      var _this = this;
      wx.hideLoading();
      if (!res.result.status) {
        wx.showModal({
          title: '失败',
          content: '提交失败',
          showCancel: false
        })
        _this.setData({ isSubmit: false });
      }
      else {
        wx.showToast({
          title: '提交成功',
          complete: function () {
            _this.setData({ isSubmit: false });
            wx.removeStorage({ key: 'addresslist' });
            wx.redirectTo({
              url: '/pages/orders/payment/index?id='+res.result.entityId,
            })
          }
        })
      }
    }).catch((err) => {
      wx.hideLoading();
      _this.setData({ isSubmit: false });
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
    this.loadCustomAddress();
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