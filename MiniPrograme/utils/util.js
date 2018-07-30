var api = require('../config/api.js');

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function toDateTime(ftime)
{
  var date = ftime.substr(0, 10)//2017-02-27
  var hour = ftime.substr(11, 2) == '00' ? 0 : ftime.substr(11, 2).replace(/\b(0+)/gi, "") 
  var minute = ftime.substr(14, 2) == '00' ? 0 : ftime.substr(14, 2).replace(/\b(0+)/gi, "") 
  var second = ftime.substr(17, 2) == '00' ? 0 : ftime.substr(17, 2).replace(/\b(0+)/gi, "")
  //var timestamp = parseInt(new Date(date).getTime() / 1000) + parseInt(hour) * 3600 + parseInt(minute) * 60 + parseInt(second) - 28800//别问我为什么-28800，只能告诉你实践出真知    
  var datetime = new Date(date);
  datetime.setHours(parseInt(hour));
  datetime.setMinutes(parseInt(minute));
  datetime.setSeconds(parseInt(second));

  return datetime ;          
}
/**
 * 封装微信的的request
 */
function request(url, data = {}, method = "GET") {
  
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'charset':'utf-8',
        'Authorization': 'Bearer '+wx.getStorageSync('token')
      },
      success: function (res) {
        //console.log(res);
        if(res.statusCode==401)
        {
          if (res.data.unAuthorizedRequest) {
            //需要登录后才可以操作
            wx.removeStorageSync("sessionid");
            wx.removeStorageSync("userInfo");
            wx.removeStorageSync("token");

            let code = null;
            return login().then((res) => {
              code = res.code;
              return getUserInfo();
            }).then((userInfo) => {
              //登录远程服务器
              request(api.AuthLoginByWeixin, { code: code }, 'POST').then(res => {
                if (res.result.success) {
                  //存储用户信息
                  wx.setStorageSync('sessionid', res.result.sessionId);
                  wx.setStorageSync('token', res.result.token);
                
                  resolve(res);
                } else {
                  reject(res);
                }
              }).catch((err) => {
                if(err.statusCode==402)
                {
                  wx.redirectTo({
                    url: '/pages/auth/login/index',
                  });    
                  return;
                }
                reject(err);
              });
            }).catch((err) => {
              //console(err);
              if (err.errMsg =='getUserInfo:fail scope unauthorized')
              {
                  wx.redirectTo({
                    url: '/pages/auth/login/index',
                  });                  
              }
              else  
              {
                reject(err);
              }              
            })
          }
        }
        if (res.statusCode == 200) {
            resolve(res.data);
        } else {
          reject(res);
        }

      },
      fail: function (err) {
        reject(err)
        console.log(err)
      }
    })
  });
}

/**
 * 检查微信会话是否过期
 */
function checkSession() {
  return new Promise(function (resolve, reject) {
    wx.checkSession({
      success: function () {
        resolve(true);
      },
      fail: function () {
        reject(false);
      }
    })
  });
}

/**
 * 调用微信登录
 */
function login() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (res.code) {
          //登录远程服务器
          console.log(res)
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

function getUserInfo() {
  return new Promise(function (resolve, reject) {
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        console.log(res)
        wx.setStorageSync('userInfo', res.userInfo);
        resolve(res);
      },
      fail: function (err) {
        reject(err);
      }
    })
  });
}

function redirect(url) {

  //判断页面是否需要登录
  if (false) {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
    return false;
  } else {
    console.log(url);
    wx.redirectTo({
      url: url
    });
  }
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}

function showErrorModal(err)
{
  
  if (err.errMsg == 'request:fail timeout') {
    wx.showModal({
      title: '系统错误',
      content: '请求超时，请检查网络',
      showCancel:false
    });
  }
  else {
    wx.showModal({
      title: '系统错误',
      content: '发生系统错误，请稍后再试！',
      showCancel: false
    });
  }
}

module.exports = {
  toDateTime,
  formatTime,
  request,
  redirect,
  showErrorToast,
  checkSession,
  login,
  getUserInfo,
  showErrorModal
}