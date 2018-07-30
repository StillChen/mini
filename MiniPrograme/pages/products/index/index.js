    // pages/products/index/index.js
var api = require("../../../config/api.js");
var util = require("../../../utils/util.js");
var Suit = require("suit.js");
var WxParse = require('../../../components/wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openAttr:false,
    indicatorDots: 1,
    picturesPathList:[],
    attrs:[],
    product:null,
    goods:[],
    chooseGoods:null,
    checkedSpecText: '请选择规格数量',
    zsSuit:null
  },
  changeIndicatorDots: function (e) {
    //console.log(e);
    this.setData({
      indicatorDots: e.detail.current+1
    })
  },
  switchAttrPop: function () {
    if (this.data.openAttr == false) {
      this.setData({
        openAttr: !this.data.openAttr
      });
    }
  },
  closeAttr: function () {
    this.setData({
      openAttr: false,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id=options.id;
    this.setData({ zsSuit:new Suit.ZsSuit()})
    this.loadProductData(id);
  },
  loadProductData:function(id)
  {
    //GoodsDetail
    util.request(api.GoodsDetail, { id: id }, 'POST').then((res) => {
      if (res.result.token) {
        this.loadProductData(id);
        return;
      }
      this.SetProductData(res.result);
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  SetProductData:function(res){
    var defaultGoods = res.goods[0];
    var specificationList = [];
    for (var i = 0; i < res.attrs.attrs.length; i++)
    {
      var item = res.attrs.attrs[i];
      if (item.attrType==1)
      {
        specificationList.push({
          id:item.id,
          name:item.name,
          valueList:[]
        });
      };
    }
    var ruleInfo = "{";
    for(var i=0;i<res.goods.length;i++)
    {
      var goods = res.goods[i];
      if (goods.isDefault)
      {
        defaultGoods = goods;
      }
      var skuAttrValue = JSON.parse(goods.skuAttrValue);
      var v=[];
      for (var j = 0; j < skuAttrValue.length;j++)
      {
        v.push(skuAttrValue[j].value);
        if(!specificationList[j].valueList.find((value)=>{
          return value.value == skuAttrValue[j].value;
        }))
        {
          specificationList[j].valueList.push(skuAttrValue[j]);
        }
      }
      ruleInfo += ("\"" + goods.id.toString() + "\":\"" + v.join('_') + "\"");
      if (i < res.goods.length - 1) {
        ruleInfo += ',';
      }
    }
    ruleInfo += '}';
    
    var defaultAttr = JSON.parse(defaultGoods.skuAttrValue);

    for (let i = 0; i < specificationList.length; i++) {
      if (defaultAttr.length>0 && specificationList[i].id == defaultAttr[i].key) {
        for (let j = 0; j < specificationList[i].valueList.length; j++) {
          if (specificationList[i].valueList[j].value == defaultAttr[i].value) {
            //如果已经选中，则反选
            if (specificationList[i].valueList[j].checked) {
              //_specificationList[i].valueList[j].checked = false;
            } else {
              specificationList[i].valueList[j].checked = true;
            }
          } else {
            specificationList[i].valueList[j].checked = false;
          }
        }
      }
    }

    this.setData({
      picturesPathList: JSON.parse(res.product.picturesPathList),
      product: res.product,
      chooseGoods: defaultGoods,
      specificationList: specificationList,
      goods: res.goods});

    if (res.product.mobileDetailHtml!=null)
    {
      WxParse.wxParse('goodsDetail', 'html', res.product.mobileDetailHtml, this);
    }    
    this.data.zsSuit.config({ 'suitRuleInfo': JSON.parse(ruleInfo) , 'CallBack': this.SuitCallBack});
    for(let i in defaultAttr)
    {
      this.data.zsSuit.set(i, defaultAttr[i].value);
    }
    this.changeSpecInfo();
  },
  SuitCallBack:function(data, skuId) {    
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      let item = _specificationList[i];
      for (let j = 0; j < item.valueList.length; j++) {
        if (this.data.zsSuit.inArr(item.valueList[j].value, data[i]) >= 0) {
          item.valueList[j].disabled = true;
        }
        else {
          item.valueList[j].disabled = false;
        }
      }
    }
    var chooseGoods = this.data.chooseGoods;
    if (skuId>0)
    {
      for(var g in this.data.goods)
      {
        if(this.data.goods[g].id==skuId)
        {
          chooseGoods = this.data.goods[g];
        }
      }
    }
    this.setData({
      'chooseGoods': chooseGoods,
      'specificationList': _specificationList
    });
  },
  clickSkuValue: function (event) {
    let disabled = event.currentTarget.dataset.disabled;
    if(disabled)
    {
      return;
    }
    let that = this;
    let specNameId = event.currentTarget.dataset.nameId;
    let specValueId = event.currentTarget.dataset.valueId;
    let position=0;

    //判断是否可以点击
    //console.log(specNameId, specValueId);
    //TODO 性能优化，可在wx:for中添加index，可以直接获取点击的属性名和属性值，不用循环
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      if (_specificationList[i].id == specNameId) {
        for (let j = 0; j < _specificationList[i].valueList.length; j++) {
          if (_specificationList[i].valueList[j].value == specValueId) {
            //如果已经选中，则反选
            if (_specificationList[i].valueList[j].checked) {
              //_specificationList[i].valueList[j].checked = false;
            } else {
              _specificationList[i].valueList[j].checked = true;
            }
          } else {
            _specificationList[i].valueList[j].checked = false;
          }
        }
        position=i;
      }
    }
    this.setData({
      'specificationList': _specificationList
    });
    this.data.zsSuit.set(position, specValueId);
    //重新计算spec改变后的信息
    this.changeSpecInfo();

    //重新计算哪些值不可以点击
  },

  //获取选中的规格信息
  getCheckedSpecValue: function () {
    let checkedValues = [];
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      let _checkedObj = {
        nameId: _specificationList[i].id,
        valueText: ''
      };
      for (let j = 0; j < _specificationList[i].valueList.length; j++) {
        if (_specificationList[i].valueList[j].checked) {
          _checkedObj.valueText = _specificationList[i].valueList[j].value;
        }
      }
      checkedValues.push(_checkedObj);
    }

    return checkedValues;

  },
  getCheckedSpecKey: function () {
    let checkedValue = this.getCheckedSpecValue().filter(function (v) {
      return v.valueText!='';
    });
    return checkedValue;
  },
  changeSpecInfo: function () {
    let checkedNameValue = this.getCheckedSpecKey();
    //设置选择的信息
    let checkedValue = checkedNameValue.filter(function (v) {
      if (v.id != 0) {
        return true;
      } else {
        return false;
      }
    }).map(function (v) {
      return v.valueText;
    });

    if (checkedValue.length > 0) {
      this.setData({
        'checkedSpecText': '已选择：'+checkedValue.join(',')
      });
    } else {
      this.setData({
        'checkedSpecText': '请选择规格数量'
      });
    }
    //console.log(checkedValue);
    //this.setSpecValueStatus();
  },
  addToCart: function(e)
  {
    if (this.data.goods.length>1)
    {
      this.switchAttrPop();
    }
    else if (this.data.goods.length >0)
    {
      this.goToBuy(e);
    }
    else
    {
      wx.showToast({
        title: '货品不存在',
        icon:"none"
      });
    }
  },
  goToBuy:function(e)
  {
     wx.navigateTo({
       url: "/pages/orders/confirm/index?goodid=" + this.data.chooseGoods.id
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
    //WxParse.wxParse('goodsDetail', 'html', this.data.goodsDetail, this);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.closeAttr();
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