/**
 *  amc-brdige.js 公共jsapi
 *  依赖:  amc-promise.js, amc.js
 */
(function(global) {
  /**
   * toast
   * @param  {String} content toast内容
   * @param {String} type toast样式'fail'/'success'/'none'
   * @param {Boolean} loadControl 是否需要做防重复控制
   */
  function toast(content, type, loadControl) {
    if (!content) {
      return;
    }

    type = type || 'none';

    // 安卓疯狂输入字符的时候，会一直显示toast，需要防重复拦击
    if (loadControl && amc.isAndroid) {
      // 2s内防重复
      if (this.toastDisabled) {
        return;
      }
      setTimeout(function() {
        this.toastDisabled = false;
      }, 2000);
      this.toastDisabled = true;
    }

    document.toast({
      'text': content,
      'type': type || 'none'
    }, function() {

    });
  }

  function tradePay(data) {
    return new Promise(function(resolve, reject) {
      document.invoke('pay', data, function(result) {
        result = result || {};
        // Android中extendInfo是String
        if (result.extendInfo && !amc.fn.isObject(result.extendInfo)) {
          try {
            result.extendInfo = JSON.parse(result.extendInfo);
          } catch (e) {}
        }
        if (result.resultCode == '9000') { // 支付成功
          resolve(result);
          return;
        } else if (result.resultCode == '8000') { // 支付结果未知
          // TODO: toast
          // toast('正在处理中'); 页面已经消失，toast会导致crash(@逸空 @醉杭)
        } else if (result.resultCode == '4000') {
          toast('支付失败', 'fail');
        } else if (result.resultCode == '6002') {
          toast('网络不给力', 'fail');
        }
        // 6001 用户取消
        // 6004 暂时获取不到支付结果

        reject(result);
      });
    });
  }

  function nativeConfirm(config, callback) {
    config = config || {};
    document._confirm({
      title: config.title,
      message: config.message,
      okButton: config.okButton || '确定',
      cancelButton: config.cancelButton || '取消',
    }, function(result) {
      callback && callback(result);
    });
  }

  function alert(config, callback) {
    config = config || {};
    document.alert({
      title: config.title,
      message: config.message,
      button: config.button || '确定'
    }, function() {
      callback && callback();
    });
  }

  /**
   * 判定RPC是否成功
   * @param  {object}  result rpc返回结果
   * @return {Boolean}        RPC是否成功
   */
  function isRpcSuccess(result) {
    return result && (result.success || result.resultCode === 'SUCCESS' || result.resultCode ===
      'success');
  }

  function postRPC(url, data) {
    var postData = {
      operationType: url,
      requestData: data || {}
    };

    return new Promise(function(resolve, reject) {
      // 防止Android Crash
      setTimeout(function() {
        document.invoke('rpc', postData || {}, function(result) {
          result = result || {};
          if (!isRpcSuccess(result)) {
            reject(result);
          } else {
            resolve(result);
          }
        });
      }, 10);
    });
  }

  function showLoading() {
    // 防止Android Crash
    setTimeout(function() {
      document.invoke('showLoading');
    }, 20);
  }

  function hideLoading() {
    // 防止Android Crash
    setTimeout(function() {
      document.invoke('hideLoading');
    }, 20);
  }
  /**
   * 查询账户信息
   * @param  {string}   uid      用户ID
   * @param  {Function} callback 回调
   */
  function getAccountDetail(uid, callback) {
    if (!uid) {
      callback && callback(null);
      return;
    }

    // 防止Android Crash
    setTimeout(function() {
      document.invoke('queryExistingAccounts', {
        uids: [uid]
      }, function(result) {
        result = result || {};
        if (result.contactsDicArray && result.contactsDicArray.length) {
          callback && callback(result.contactsDicArray[0]);
        } else {
          callback && callback({
            error: result.error || 'unknown'
          });
        }
      });
    }, 20);
  }

  function putLocalStorage(key, data) {
    if (!key) {
      return;
    }

    // 防止Android在子线程调用invoke Crash
    setTimeout(function() {
      amc.fn.putCache(key, data, true);
    }, 20);
  }

  function getLocalStorage(key, callback) {
    if (!key || !callback) {
      return;
    }
    // 防止Android在子线程调用invoke Crash
    setTimeout(function() {
      amc.fn.fetchCache(key, callback, true);
    }, 20);
  }

  function getLocation() {
    return new Promise(function(resolve, reject) {
      // 防止Crash，将invoke调用放入主线程
      setTimeout(function() {
        // timeout: 框架获取时间的默认间隔
        document.invoke('location', {
          'timeout': 300
        }, function(lbsInfo) {
          if (!lbsInfo || !lbsInfo.latitude || !lbsInfo.longitude) {
            reject(lbsInfo);
            return;
          } else {
            resolve(lbsInfo);
          }
        });
      }, 20);

    });
  }

  /**
   * @param {string?} key   为 undefined 时返回整个 startupParams
   * @return {object|null}
   */
  function getStartupParams(key) {
    var flybird = window.flybird;
    if (!flybird || !flybird.local || !flybird.local.startupParams) {
      return null;
    }

    if (!key) {
      return flybird.local.startupParams;
    } else {
      return flybird.local.startupParams[key];
    }
  }

  /**
   * @param {string} content
   * @param {string} ecLevel 纠错级别, 默认为M L:7%/ M: 15%/ Q: 25%/ H: 30%
   * @param {int} width 物理像素宽度, 
   * @param {function} callback
   * 生成二维码 
   * @return {object} 
   *{
   * img: [image base64] // 图片base64 'iVBORw0KGgoAAAAN...', png格式
   * 
   *}
   */
  function generateQRImage(content, ecLevel, width, callback) {
    if (!content || !callback || width <= 0) {
      return;
    }
    setTimeout(function() {
      document.invoke('qrGen', {
        content: content,
        ecLevel: ecLevel || 'M',
        width: width
      }, function(result) {
        if (result && result.img) {
          result.img = 'data:image/png;base64,' + result['img'];
        }
        callback(result);
      });
    }, 20);
  }

  global.JsBridgeUtil = {
    postRPC: postRPC,
    isRpcSuccess: isRpcSuccess,
    toast: toast,
    alert: alert,
    nativeConfirm: nativeConfirm,
    showLoading: showLoading,
    hideLoading: hideLoading,
    getAccountDetail: getAccountDetail,
    putLocalStorage: putLocalStorage,
    getLocalStorage: getLocalStorage,
    getLocation: getLocation,
    getStartupParams: getStartupParams,
    tradePay: tradePay,
    generateQRImage: generateQRImage
  };
})(window);