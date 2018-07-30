// pages/account/myteam/index.js
var api = require("../../../config/api.js");
var util = require("../../../utils/util.js");
const sliderWidth = 250;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["直属分销", "间属分销"],
    activeIndex: 0,
    goldCustoms: [],
    goldCustomsTotal:0,
    silverCustoms: [],
    silverCustomsTotal:0,
    isLoading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadMyClientsData(0);
  },
  tabClick: function (e) {
    if (parseInt(e.currentTarget.id)==0)
    {
      this.loadMyClientsData(this.data.goldCustoms.length);
    }
    else
    {
      this.loadTeamClientsData(this.data.silverCustoms.length)
    }
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: parseInt(e.currentTarget.id)
    });
  },
  loadMyClientsData: function (start) {
    if (start > 0 && this.data.goldCustomsTotal <= start) {
      return;
    }
    this.setData({ isLoading: true });
    util.request(api.AccountMyClients, { start: start, length: 10 }, 'POST').then((res) => {
      this.setData({ isLoading: false });
      if (res.result.token) {
        this.loadMyClientsData(start);
        return;
      }
      if (res.result == null) {
        return;
      }
      //goldCustoms
      console.log(res.result);
      this.setGoldCustomsData(res.result);
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  setGoldCustomsData:function(data)
  {
    var total = data.totalCount;
    var froms = this.data.goldCustoms;
    for (var i in data.items) {
      var item = data.items[i];
      froms.push(
        {
          "id": item.id,
          "src": item.avatar,
          "name": item.nickName,
          "todayProfit": item.userProfitByDay != null ? item.userProfitByDay.profit.achievement : 0,
          "totalAchievement": item.totalAchievement,
          "lev": item.vipLevel,
          "levelName": this.getLevelName(item.vipLevel)
        }
      )
    }
    this.setData({ goldCustoms: froms, goldCustomsTotal: total });
  },
  loadTeamClientsData: function (start) {
    if (start > 0 && this.data.silverCustomsTotal <= start) {
      return;
    }
    this.setData({ isLoading: true });
    util.request(api.AccountTeamClients, { start: start, length: 10 }, 'POST').then((res) => {
      this.setData({ isLoading: false });
      if (res.result.token) {
        this.loadTeamClientsData(start);
        return;
      }
      if (res.result == null) {
        return;
      }
      //goldCustoms
      console.log(res.result);
      this.setSilverCustomsData(res.result);
    }).catch(err => {
      util.showErrorModal(err);
    });
  },
  setSilverCustomsData: function (data) {
    var total = data.totalCount;
    var froms = this.data.silverCustoms;
    for (var i in data.items) {
      var item = data.items[i];
      froms.push(
        {
          "id": item.id,
          "src": item.avatar,
          "name": item.nickName,
          "todayProfit": item.userProfitByDay != null ? item.userProfitByDay.profit.achievement : 0,
          "totalAchievement": item.totalAchievement,
          "lev": item.vipLevel,
          "levelName": this.getLevelName(item.vipLevel)
        }
      )
    }
    
    this.setData({ silverCustoms: froms, silverCustomsTotal: total });
  },
  getLevelName:function(level)
  {
      switch(level)
      {
        case 0:
          return '游客';
          break;
        case 1:
          return '见习';
          break;
        case 2:
          return '分销';
          break;
        case 3:
          return '联创';
          break;
        case 4:
          return '董事';
          break;
        case 5:
          return '一星董事';
          break;
        case 6:
          return '二星董事';
          break;
        case 7:
          return '三星董事';
          break;
        case 8:
          return '四星董事';
          break;
        case 9:
          return '五星董事';
          break;
      }
      return '';
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
    if (this.data.activeIndex == 0) {
      this.loadMyClientsData(this.data.goldCustoms.length);
    }
    else {
      this.loadTeamClientsData(this.data.silverCustoms.length)
    }
  }
})