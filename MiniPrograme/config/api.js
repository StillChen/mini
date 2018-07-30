const ApiRootUrl = 'https://miniprogram.17xiangwan.cn/';

module.exports = {
  ApiRootUrl: ApiRootUrl,
  IndexUrl: ApiRootUrl + 'home/index', //首页数据接口
  LastProduct: ApiRootUrl +'home/QueryLastGroupBuy', //往期团品
  AuthLoginByWeixin: ApiRootUrl + 'account/onlogin', //微信登录
  AccountGetSuperior: ApiRootUrl + 'account/GetSuperior',
  AccountBindSuperior: ApiRootUrl + 'account/BindSuperior', //绑定推荐人
  AccountSignUp: ApiRootUrl +'account/signUp',//注册用户
  AccountIndex: ApiRootUrl+ "account/index", //个人中心
  AccountFeedback: ApiRootUrl + 'account/createuserfeedback',  //提交建议
  AccountProfile: ApiRootUrl + 'account/GetUserProfile', //获取用户基本信息（等级、余额等）
  AccountTotalIncome: ApiRootUrl +"vip/TotalIncome", //用户累计收益
  AccountDayIncome: ApiRootUrl +"vip/QueryUserDayIncome", //用户每日收益统计

  GoodsDetail: ApiRootUrl + 'products/detail',  //获得商品的详情
  GoodsById: ApiRootUrl + 'products/GetGoods',  //获得商品的详情 

  OrderSubmit: ApiRootUrl + 'order/createOrder', // 提交订单
  OrderPayment: ApiRootUrl + 'order/Payment',
  OrderCompleted: ApiRootUrl +'account/CompletedOrder',//确认收货
  OrderPaymentByBalance: ApiRootUrl + 'Payment/UseBalance',
  OrderPaymentJsApiUnifiedorder: ApiRootUrl + 'Payment/JsApiUnifiedorder',//获取微信统一下单prepay_id

  AddressClientsList: ApiRootUrl +'account/QueryAddressByIds',//选中的客户地址
  AddressList: ApiRootUrl + 'account/QueryAddress',  //收货地址列表
  AddressDetail: ApiRootUrl + 'account/getAddress',  //收货地址详情
  AddressSave: ApiRootUrl + 'account/AddOrUpdateAddress',  //保存收货地址
  AddressDelete: ApiRootUrl + 'account/DeleteAddress',  //保存收货地址

  OrderList: ApiRootUrl + 'account/QueryOrders',  //订单列表
  OrderDetail: ApiRootUrl + 'account/OrderDetail',  //订单详情
  OrderCancel: ApiRootUrl + 'account/CancelOrder',  //取消订单
  OrderExpress: ApiRootUrl + 'account/orderExpress', //物流详情

  AccountWithdraw: ApiRootUrl + "account/ApplyWithdraw", //提现申请
  AccountWithdrawRecord: ApiRootUrl +"account/QueryWithdrawRecords", //提现列表

  AccountUserBalance: ApiRootUrl +"vip/QueryUserBalances", //余额明细

  AccountMyClients: ApiRootUrl + 'vip/QueryMyClientsAsync', //直属分销
  AccountTeamClients: ApiRootUrl + 'vip/QueryTeamClientsAsync', //间属分销

  AccountTotalAchievement: ApiRootUrl +'vip/TotalAchievement'
};