/**
 *  bizapp-bizUtil.js 收钱码应用公共业务库
 *  依赖:  amc-jsbride.js, amc-promise.js, amc.js, amc-common-util.js
 */
(function(global) {
  //----------------报错处理----------------
  var DEFAULT_MESSAGE = '网络开小差，请稍后重试';
  var DefaultErrors = {
    'DEFAULT': DEFAULT_MESSAGE,
    'SYSTEM_ERROR': DEFAULT_MESSAGE,
    'INVALID_PARAMETER': DEFAULT_MESSAGE,
    'ACCESS_FORBIDDEN': '服务尚未生效，还不能收款，请稍候再试。',
    'EXIST_FORBIDDEN_WORD': '卖家店铺名称有敏感词汇，请联系卖家修改',
    'PARTNER_ERROR': '交易存在风险，暂不支持付款',
    'TOTAL_FEE_EXCEED': '付款金额超过卖家当日收款上限，请重新填写',
    'BUYER_SELLER_EQUAL': '您不能给自己付款',
    'BUYER_ENABLE_STATUS_FORBID': '您的账户存在风险，暂不支持付款，请拨打客服电话95188咨询处理。',
    'SELLER_BEEN_BLOCKED': '卖家账户异常，暂不支持收款，请拨打客服电话95188-6咨询处理。',
    'STORE_STATUS_IS_INVALIDATION': '此二维码已停用，请联系商家处理',
    'MR_STORE_STATUS_IS_INVALIDATION': '补票机状态异常，请联系列车员处理。',
    'ERROR_SELLER_CERTIFY_LEVEL_LIMIT': '该码尚未启用，请收款人登录支付宝-我的-余额，补全本人身份信息即可收款。',
    'DYNAMIC_CODE_CHECK_INVALID': '动态码已失效，请重新扫码付款',
    'PAYMENT_REQUEST_HAS_RISK': '网络开小差，请重新扫码',
    'ORDER_SESSION_TIMEOUT': '停留时间太长，请重新扫码支付',
    'MERCHANT_STATUS_NOT_NORMAL': '商家接口异常，暂不支持收款'
  };

  var C2CErrors = {
    'EXIST_FORBIDDEN_WORD': '含有敏感词哦，请重新输入'
  };

  var MRErrors = {
    'STORE_STATUS_IS_INVALIDATION': '补票机状态异常，请联系列车员处理。'
  };

  var Errors = {
    'DEFAULT': DefaultErrors,
    'C2C': C2CErrors,
    'MR': MRErrors
  };

  function getMessage(code, msgGroup) {
    if (typeof code !== 'string') {
      return DEFAULT_MESSAGE;
    }
    code = code.toUpperCase();
    msgGroup = msgGroup || 'DEFAULT';
    return Errors[msgGroup][code] || Errors['DEFAULT'][code] || DEFAULT_MESSAGE;
  }

  //----------------业务接口----------------
  var DEFAULT_ORDER_CREATE_API = 'alipay.acquire.order.create';
  var WARN_TIP_KEY_PREFIX = 'TRANSFER_WARN'; // C2C付钱的提示信息本地存储前缀
  var C2C_BIZ_TYPE = 'C2C';
  var RAILWAY_ORDER_SCENE = 'MRBuPiao';
  var C2CTAG_ORCER_SCENE = 'tqpC2CTag';
  var C2C_SWITCH_ORDER_SCENE = 'tqpC2CSwitch';
  var _rpc = amc.rpcData || {};

  var pageData = {
    nickName: _rpc.mNick,
    realName: _rpc.mName,
    imageUrl: _rpc.avatar,
    productCode: _rpc.product,
    partnerId: _rpc.pid,
    merchantOrderNo: _rpc.orderNo,
    sign: _rpc.sign,
    buyerId: _rpc.uid,
    token: _rpc.token, // code用于给下单时的扩展字段
    limitAmount: _rpc.limitAmount,
    serviceBizType: _rpc.serviceBizType,
    orderScene: _rpc.scene,
    paySessionId: generatePaySessionId(),
    defaultAmount: _rpc.amount,
    defaultMemo: _rpc.memo,
    alipayStoreId: _rpc.shopId,
    shopLabels: _rpc.shopDesc,
    extendParams: getExParams()
  };

  function getExParams() {
    var exParams = _rpc.exParams || {};
    if (!amc.fn.isObject(exParams)) {
      try {
        exParams = JSON.parse(exParams);
      } catch (e) {
        exParams = {};
        CommonUtil.logError('biz', 'json-fail', e);
      }
    }
    return exParams;
  }


  /**
   * 从本地生成 paySessionId
   *
   * uid:       2088602123017451
   * timestamp: 1531461951527
   *
   * e.g. COLLECT_MONEY_PAY_20886021230174511531461951527
   *      '----- 固定 -----''----- uid ----''-- timestamp
   * @returns string
   */
  function generatePaySessionId() {
    return 'COLLECT_MONEY_PAY_' + _rpc.uid + Date.now();
  }

  /**
   * 返回从参数中获得的起始参数
   */
  function getPageData() {
    return pageData;
  }


  /**
   * 获取账户类型
   */
  function getAccountType() {
    var exParams = pageData.extendParams || {};
    return exParams.accountType || ''; // accountType 是来自扩展参数
  }

  /**
   * 创建订单并获取订单信息
   * 创建订单的api是动态的，服务端可能会下发具体的路径
   */
  function placeOrder(data) {

    data = data || {};

    // codec->扫码SDK->前置页->UTP的扫码缓存相关参数
    var startupParams = JsBridgeUtil.getStartupParams() || {};

    /**
     * Key 可能为 'codecSign' | 'time' | 'bizType' | 'code' | 'isCache' | 'expireTime' | 'dest' |
     *            'product' | 'productVersion' | 'time' | 'session' | 'userId' | 'imageChannel' |
     *            'valueFromRoute' | 'isOriginStartFromExternal' | 'lbsInfo' | 'useScan'
     *
     * @type {Object.<string, string | boolean | number>}
     */
    var cachedParams = {};

    // 从 startupParams 中拆出所有匹配
    //     '_-_-key_-_-': 'value'
    // 的参数，并以
    //     {key: value}
    // 的形式放在 RPC 参数的 'scanCachedParams' 字段中。
    var cacheRx = /^_-_-(.+)_-_-$/;

    for (var key in startupParams) {
      if (startupParams.hasOwnProperty(key)) {
        var matches = cacheRx.exec(key);
        if (matches && matches.length === 2) {
          var cacheKey = matches[1];
          var cacheVal = startupParams[key];
          if (typeof cacheVal === "string" || typeof cacheVal === "boolean" || typeof cacheVal === "number") {
            cachedParams[cacheKey] = cacheVal;
          }
        }
      }
    }

    data.scanCachedParams = JSON.stringify(cachedParams);

    var exParams = getExParams() || {};
    var api = exParams.apiMethod || DEFAULT_ORDER_CREATE_API;
    return new Promise(function(resolve, reject) {
      JsBridgeUtil.postRPC(api, data)
        .then(function(result) {
          resolve(result);
        })
        .error(function(result) {
          reject(result);
        });
    });
  }

  function notifyPayScene(payScene) {
    var reqData = {
      fromUid: pageData.buyerId,
      toUid: pageData.partnerId,
      reqScene: payScene,
      reqInfo: {
        paySessionId: pageData.paySessionId,
        amount: pageData.defaultAmount
      }
    };

    JsBridgeUtil.postRPC('alipay.livetradeprod.c2c.transfer.notify', reqData).then(function(result) {
      amc.fn.logAction('c2c-notify', 'success');
    }).error(function(result) {
      result = result || {};
      if (result.error === undefined) {
        // 非 rpc 错误埋点
        CommonUtil.logError('QR', 'notifyFail-unknown', result);
      }
    });
  }

  /**
   *
   * @param {Object} error RPC返回的错误对象
   */
  function showRpcErrorMessage(e) {
    var msgGroup = 'DEFAULT';
    if (isC2C()) {
      msgGroup = 'C2C';
    }

    if (isRailwayPay()) {
      msgGroup = 'MR';
    }

    if (e && e.detailErrorCode) {
      var errCode = e.detailErrorCode;
      var errDes = e.detailErrorDes;

      // 针对静态码每日限额进行单独提示
      if (errCode === 'STATIC_CODE_BUYER_EXCEED' && errDes) {

        JsBridgeUtil.nativeConfirm({
          message: errDes,
          okButton: '查看详情',
        }, function(result) {
          if (result.ok) {
            amc.fn.openurl(Constant.EXCEED_URL, '2');
          }
        });
        return;
      }

      if (errCode === 'VERIFY_SELLER_NAME_INVALID' || errCode ===
        'VERIFY_SELLER_NAME_TIMES_EXCEED' && errDes) {
        JsBridgeUtil.alert({
          message: errDes
        });

        return;
      }
      JsBridgeUtil.toast(BizUtil.getMessage(errCode, msgGroup));
    } else if (e && e.userMessage) {
      JsBridgeUtil.toast(e.userMessage);
    } else {
      JsBridgeUtil.toast(BizUtil.getMessage('DEFAULT', msgGroup));
    }
  }


  function isC2C() {
    return pageData.serviceBizType === C2C_BIZ_TYPE;
  }

  /**
   * 没有签约的C2C
   */
  function isC2CTransfer() {
    var orderScene = pageData.orderScene;
    return orderScene === C2CTAG_ORCER_SCENE || orderScene === C2C_SWITCH_ORDER_SCENE;
  }

  function isRailwayPay() {
    var orderScene = pageData.orderScene;
    return orderScene === RAILWAY_ORDER_SCENE;
  }

  function trackLbsInfo(tradeNo, lbsInfo) {
    if (!lbsInfo || !lbsInfo.latitude) {
      return;
    }

    CommonUtil.trackLog('a87.b416.c7815.d13637', 'TransferPay', {
      latitude: lbsInfo.latitude || '',
      longitude: lbsInfo.longitude || '',
      accuracy: lbsInfo.accuracy,
      serviceBizType: pageData.serviceBizType || '',
      orderScene: pageData.orderScene || '',
      tradeNo: tradeNo || ''
    });
  }

  /**
   * @param {String}  
   */
  function warnTransferTip() {
    var warnTipCacheKey = WARN_TIP_KEY_PREFIX + pageData.partnerId;
    var doWarn = function() {
      JsBridgeUtil.alert({
        title: '安全提示',
        message: '付款后资金将直接进入对方账户，无法退款。为保证安全，请核实对方身份后支付。',
        button: '知道了'
      }, function() {
        JsBridgeUtil.putLocalStorage(
          warnTipCacheKey, {
            value: 'YES'
          });
      });
    };

    JsBridgeUtil.getLocalStorage(warnTipCacheKey, function(result) {
      result = result || {};

      if (!result || result.value !== 'YES') {
        doWarn();
      }
    });
  }


  /*
   * @param {Object} result 服务端返回的结果，用于构造发码参数
   */
  function generateQrCodeRequestInfo(result) {
    result = result || {};
    var extendParams = result.extendParams || {};
    var timeOut = CommonUtil.parseInt(extendParams.codeTimeoutFor500, 60);
    var timeRefresh = CommonUtil.parseInt(extendParams.codeRefreshTimeFor500, 10);
    var qrCodeResult = {
      qrCodeValue: result.qrCode,
      qrCodeUrl: result.picUrl,
      timeOut: timeOut,
      timeRefresh: timeRefresh,
      bizType: extendParams.codeTypeFor500,
      userId: pageData.buyerId,
      pid: pageData.partnerId
    };

    return qrCodeResult;
  }

  function getDynamicQrCode(data) {
    return JsBridgeUtil.postRPC('alipay.mobilecodec.shakeCodeRz.encode', data);
  }

  /**
   *
   * @param {String} tradeNo 交易号
   * @param {Object} passExtendParams 服务端需要透传的参数，会通过收银台带入
   */
  function tradePay(tradeNo, passExtendParams) {
    var serverExtParams = getExParams() || {};

    // 从 startupParams 获取 bundleId
    var sourceBundleId = JsBridgeUtil.getStartupParams('_-_-bundleId_-_-') || '';

    var params = {
      tradeNO: tradeNo,
      appName: 'alipay',
      bizType: 'trade',
      sourceBundleId: sourceBundleId,
      // 收银台客户端控制参数
      bizContext: JSON.stringify({
        sc: 'tqrcode',
        // 服务端用于统计小程序来源量
        tinyAppId: serverExtParams.tinyAppId || '',
        resultPageExitMode: '2'
      }),
      displayPayResult: false
    };

    var extParams = {};
    if (amc.fn.isObject(passExtendParams)) {
      for (var key in passExtendParams) {
        // extParams不能与params的key重复
        if (params[key] === undefined) {
          // 透传参数只支持string
          extParams[key] = passExtendParams[key] + '';
        }
      }
      params['extParams'] = extParams;
    }

    return new Promise(function(resolve, reject) {
      JsBridgeUtil.tradePay(params).then(function(result) {
        resolve(result);
      }).error(function(e) {
        reject(e);
      });
    });
  }

  /*
   *
   * 生成外部交易号
   * 不同类型交易的外部交易号，前缀不一样，需要区分
   * 收钱码正扫的外部交易号新算法为：场景特征1位 + currentTimeMillis的从左边第2位开始往右取10位 + 买家userId后12位
   *（大于0.1秒的操作不会重复，比如当前是1526038222538，就取5260382225，那么用到2049年没问题）
   */
  function getOutTradeNo(uid, outTradeNoPre) {
    uid = uid || '';
    outTradeNoPre = outTradeNoPre || 'TQP001';

    var timeMills = new Date().getTime() + '';
    var outTradeTimeMills = timeMills.substr(1, 10);
    var outTradeNo = outTradeNoPre + outTradeTimeMills + uid.slice(-12);
    return outTradeNo;
  }

  global.BizUtil = {
    getMessage: getMessage,
    getPageData: getPageData,
    placeOrder: placeOrder,
    tradePay: tradePay,
    getExParams: getExParams,
    getAccountType: getAccountType,
    isC2C: isC2C,
    isRailwayPay: isRailwayPay,
    isC2CTransfer: isC2CTransfer,
    trackLbsInfo: trackLbsInfo,
    notifyPayScene: notifyPayScene,
    warnTransferTip: warnTransferTip,
    getOutTradeNo: getOutTradeNo,
    getDynamicQrCode: getDynamicQrCode,
    generateQrCodeRequestInfo: generateQrCodeRequestInfo,
    showRpcErrorMessage: showRpcErrorMessage,

  };
})(window);
