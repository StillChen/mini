// pages/account/address/add/add.js
var api = require("../../../../config/api.js");
var util = require("../../../../utils/util.js");
var user = require("../../../../services/user.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pagefrom:"",
    name: '',
    phone: '',
    detailAddress: '',
    region: ['湖南省', '长沙市', '天心区'],
    choose: '',
    isDefault: false,
    isSubmit:false,
    id:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _from = options.from;
    if (_from == undefined)
    {
      _from='';
    }
    var id=options.id;
    if(id>0)
    {
      this.setData({ id: id, pagefrom: _from });
      this.loadAddressDetail(id);
      wx.setNavigationBarTitle({
        title: '编辑收货地址',
      })
    }
    else
    {
      this.setData({ pagefrom: _from })
    }
  },
  loadAddressDetail:function(id){
    util.request(api.AddressDetail, {id:id}, "POST").then(res => {
      //console.log(res);
      var _this = this;
      console.log(_this);
      if (res.result.token) {
        _this.loadAddressDetail(id);
        return;
      }
      var address=res.result;
      if(address!=null)
      {
        _this.setData({
          name: address.contact,
          phone: address.mobile,
          detailAddress: address.detail,
          region: [address.province, address.city, address.district],
          choose: address.tag,
          isDefault: address.isDefault,
          id: address.id
        });
      }      
    }).catch((err) => {
      
    });
  },
  addNewAddress:function()
  {
    var _this = this;
    if (_this.data.isSubmit) {
      return;
    }
    if (_this.data.phone.length>11)
    {
      wx.showToast({
        title: '手机号码不能超过11位',
        icon: 'none'
      });
      return;
    }
    this.setData({ isSubmit: true });
    wx.showLoading({
      title: '正在提交...',
    });

    util.request(api.AddressSave, {
      id: this.data.id,
      area:this.data.region.join(' '),
      Address: this.data.detailAddress,
      Contact: this.data.name,
      Mobile: this.data.phone,
      Tag: this.data.choose,
      isDefault: this.data.isDefault
    }, "POST").then(res => {
      //console.log(res);
      wx.hideLoading();
      if (!res.result.status) {
        wx.showModal({
          title: '失败',
          content: '提交失败:'+res.result.message,
          showCancel: false
        })
        _this.setData({ isSubmit: false });
      }
      else {
        wx.showToast({
          title: '提交成功',
          complete: function () {
            setTimeout(() => {
              _this.setData({ isSubmit: false });

              if (_this.data.pagefrom == 'comfirmorder') {
                var ids=wx.getStorageSync('addresslist');
                if (!ids) {
                  ids = [];
                }
                ids.push(res.result.entityId);
                wx.setStorage({
                  key: 'addresslist',
                  data: ids,
                });
              }
              wx.navigateBack();
            }, 2000)
          }
        })
      }
    }).catch((err) => {
      wx.hideLoading();
      console.log(err);
      _this.setData({ isSubmit: false });
    });
  },
  bindRegionChange:function(event)
  {    
    this.setData({ region: event.detail.value });
  },
  setName:function(event)
  {
    this.setData({ name:event.detail.value});
  },
  setPhone:function(event)
  {
    var mobile = event.detail.value.replace(' ', '').replace('-', '');
    if(mobile.length>11)
    {
      wx.showToast({
        title: '手机号码不能超过11位',
        icon:'none'
      });
    }
    this.setData({ phone: mobile});
  },
  setAddress: function (event)
  {
    this.setData({ detailAddress: event.detail.value });
  },
  setTags: function (event)
  {
    console.log(event.detail.value);
  },
  setDefault:function(event)
  {
    this.setData({ isDefault: event.detail.value });
  },
  chooseTag:function(event)
  {
    if (this.data.choose == event.currentTarget.dataset.tag)
    {
      this.setData({ choose: '' }); 
    }
    else
    {
      this.setData({ choose: event.currentTarget.dataset.tag });   
    }
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
    var _this=this;
    if (_this.data.id==0)
    {
      wx.getClipboardData({
        success: function (res) {
          _this.setClipboardAddress(res.data);
        }
      })
    }
    
  },
  setClipboardAddress:function(data){
    console.log(data);
    var address=data.split('。');
    if(address.length<3)
    {
      address = data.split('.');
    }
    if (address.length < 3) {
      address = data.split(',');
    }
    if (address.length < 3) {
      address = data.split('，');
    }
    if (address.length < 3) {
      this.getLocation();
      return;
    }
    var mobile = address[1].replace(/[^0-9]/ig, "");
    if (mobile.length > 11) {
      wx.showToast({
        title: '手机号码不能超过11位',
        icon: 'none'
      });
    }
    this.setData({ name: address[0], phone: mobile});
    this.loadCityFormat(address[2]);
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ isSubmit: false });
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
  
  },
  getLocation: function () {
    var page = this
    wx.getLocation({
      type: 'wgs84',   //默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标 
      success: function (res) {
        // success  
        var longitude = res.longitude
        var latitude = res.latitude
        page.loadCity(longitude, latitude)
      }
    })
  },
  loadCity: function (longitude, latitude,address) {
    var page = this
    wx.request({
      url: 'https://api.map.baidu.com/geocoder/v2/?ak=umzxpG3B4s6A74dNlPMsaqdITUpWEBwB&location=' + latitude + ',' + longitude + '&output=json',
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        var city = res.data.result.addressComponent.city;
        var province = res.data.result.addressComponent.province;
        var district = res.data.result.addressComponent.district;

        var addr = '';
        if(address!=undefined)
        {
          var detail= address.split(district);
          if(detail.length>1)
          {
            addr=detail[1];
          }
        }
        page.setData({ region: [province, city, district], detailAddress:addr });
      }
    })
  },
  loadCityFormat:function(address)
  {
    var page = this
    wx.request({
      url: 'https://api.map.baidu.com/geocoder/v2/?ak=umzxpG3B4s6A74dNlPMsaqdITUpWEBwB&address=' + address + '&output=json',
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        if (res.data.status!=0)
        {
          return;
        }
        var loc=res.data.result;
        page.loadCity(loc.location.lng, loc.location.lat, address)
      }
    })
  }
})