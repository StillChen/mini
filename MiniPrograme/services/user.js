/**
 * 用户相关服务
 */
const util = require('../utils/util.js');
const api = require('../config/api.js');
/**
 * 调用微信登录
 */
function loginByWeixin() {

  let code = null;
  return new Promise(function (resolve, reject) {
    return util.login().then((res) => {
      code = res.code;
      wx.request({
        url: api.AuthLoginByWeixin,
        data: { code: code },
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'charset': 'utf-8',
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: function (res) {
          console.log(res);
          if (res.data.result.success) {
            wx.setStorageSync('sessionid', res.data.result.sessionId);
            //存储用户信息
            wx.setStorageSync('token', res.data.result.token);

            resolve(res.data);
          } else {
            if (res.data.result.error.code === 402) {
              wx.setStorageSync('sessionid', res.data.result.sessionId);
            }
            reject(res.data);
          }
        },
        fail:function(err)
        {
          reject(err);
        }
      });
      //return util.getUserInfo();
    
    }).catch((err) => {
      reject(err);
    })
  });
}

/**
 * 注册一个新用户
 */
function signUp()
{
  return new Promise(function (resolve, reject) {
    util.getUserInfo().then((result)=>{

      var sessionId=wx.getStorageSync('sessionid');
      util.request(api.AccountSignUp, { 
        SessionId: sessionId, 
        iv: result.iv,
        rawData: result.rawData,
        signature: result.signature,
        encryptedData: result.encryptedData,
        }, 'POST').then(res => {
          //console.log(res);
        if (res.result.success) {
          //存储用户信息
          resolve(res);
        } else {
          reject(res);
        }
      }).catch((err) => {
        reject(err);
      });
    }).catch((err)=>{
      reject(err);
    });
  });
}

function bindSuperior(Superiorid)
{
  return util.request(api.AccountBindSuperior, {
    id: Superiorid
  }, 'POST');
}

/**
 * 判断用户是否登录
 */
function checkLogin() {
  return new Promise(function (resolve, reject) {
    if (wx.getStorageSync('userInfo') && wx.getStorageSync('token')) {

      util.checkSession().then(() => {
        resolve(true);
      }).catch(() => {
        reject(false);
      });

    } else {
      reject(false);
    }
  });
}


module.exports = {
  loginByWeixin,
  checkLogin,
  signUp, 
  bindSuperior
};
