importClass("android.util.Log");
importClass("android.view.View");
Lynel.__c("initJsRuntime", this);
this.__s("adapterVersion", 1.2);
this.__s("lynelVersion", 2);
PageBridge.__c("registerResumeHandler", 'viewDidAppear');
PageBridge.__c("registerPauseHandler", 'viewDidDisappear');
function viewDidAppear() {
}
function viewDidDisappear() {
}
var vc = {};
var notifyName = {};
function registerNotification(name, callback) {
  notifyName[name] = callback;
  WVBridge.__c("registerWVEvent", this, '_notifyCallBack');
}
function _notifyCallBack(notify) {
  var e = JSON.__c("parse", notify);
  if (e) 
  {
    var callName = notifyName.__g(e.__g("event"));
    eval(callName + '(e);');
  }
}
function postNotify(name, param) {
  var params = {'event': name, 'param': param};
  WVBridge.__c("callMethod", 'WVStandardEventCenter', 'postNotificationToNative', JSON.__c("stringify", params), null, null);
}
var mtopSuccCallback;
var mtopFailCallback;
function mtopRequest(name, version, param, successBack, failBack) {
  var pstr = JSON.__c("stringify", param);
  mtopSuccCallback = successBack;
  mtopFailCallback = failBack;
  MtopBridge.__c("request", name, version, pstr, '_innerMtopSucc', '_innerMtopFail');
}
function _innerMtopSucc(requestJsonStr, responseJsonStr) {
  eval(mtopSuccCallback + '(' + requestJsonStr + ',' + responseJsonStr + ');');
}
function _innerMtopFail(requestJsonStr, responseJsonStr) {
  eval(mtopFailCallback + '(' + requestJsonStr + ',' + responseJsonStr + ');');
}
function asyncCall(name, args) {
  CommonBridge.__c("asyncCall", name, args);
}
function mainACall(name, args) {
  CommonBridge.__c("mainCall", name, args);
}
function getTangramView(vc, index, dir) {
  return TangramBridge.__c("findTangramView", dir, index);
}
var clickHandlerMap = {};
function registerTangramOpenURL(tangramView, callBack) {
  clickHandlerMap['default'] = callBack;
}
function registerTangramURLName(tangramView, url, callBack) {
  clickHandlerMap[url] = callBack;
}
function _innerClickProcessor(action, cellJson) {
  var u = _parseAction(String(action));
  _processAction(u, String(cellJson));
}
TangramBridge.__c("handlerClickEvent", '_innerClickProcessor');
function _parseAction(url) {
  var us = url.__c("split", '?', 2);
  var rs = {};
  if (us.__g("length") > 0) 
  {
    var lastCh = us[0].__c("charAt", us[0].__g("length") - 1);
    if (lastCh == '/') 
    {
      rs['@action'] = us[0].__c("substring", 0, us[0].__g("length") - 1);
    } else {
      rs['@action'] = us[0];
    }
  }
  if (us.__g("length") > 1) 
  {
    var uss = us[1].__c("split", '&');
    for (var i = 0, l = uss.__g("length"); i < l; i++) 
      {
        var ks = uss[i].__c("split", '=', 2);
        rs[ks[0]] = ks.__g("length") == 1 ? '' : decodeURIComponent(ks.__g(1));
      }
  }
  return rs;
}
function _processAction(kv, cellJson) {
  var a = kv.__g('@action');
  if (a == undefined) 
  {
    return false;
  }
  cellJson = JSON.__c("parse", cellJson);
  var openName = clickHandlerMap.__g(a);
  if (openName != undefined) 
  {
    eval(openName + "(kv, cellJson)");
    return false;
  }
  var d = clickHandlerMap.__g('default');
  if (kv['@action'].__c("indexOf", "tangram://") == 0 && d != undefined) 
  {
    eval(d + "(kv, cellJson)");
  }
}
function addEvent(view, callBack) {
  view.__c("setOnClickListener", new OnClickListener(function() {
  eval(callBack + "(view);");
}));
}
function spm2101(page, arg1, args) {
  UTBridge.__c("track2101", page, arg1, JSON.__c("stringify", args));
}
function spm2201(page, arg1, args) {
  UTBridge.__c("track2201", page, arg1, JSON.__c("stringify", args));
}
function lynelLog(r) {
  Log.__c("e", 'LynelLog', r);
}
function lynelAlert(r) {
  Log.__c("e", 'LynelAlert', r);
}
function hybirdCall(obj, m, p, successCall, failCall) {
  wvSuccCallback = successCall;
  wvFailCallback = failCall;
  WVBridge.__c("callMethod", obj, m, JSON.__c("stringify", p), '_hybirdSuccCallback', '_hybirdFailCallback');
}
function _hybirdSuccCallback(s) {
  if (wvSuccCallback) 
  {
    eval(wvSuccCallback + '(' + s + ')');
  }
}
function _hybirdFailCallback(s) {
  if (wvFailCallback) 
  {
    eval(wvFailCallback + '(' + s + ')');
  }
}
function createViewFromVV(data) {
  var view = TangramBridge.__c("createViewFromVV", JSON.__c("stringify", data));
  if (data.style) 
  {
    if (data.__g("style").__g("width") && data.__g("style").__g("height")) 
    {
      var width = data.__g("style").__g("width") * screenWidth / 375;
      var height = data.__g("style").__g("height") * screenWidth / 375;
      TangramBridge.__c("setViewBounds", view, width, height);
    } else if (data.__g("style").__g("width") && !data.__g("style").height) 
    {
      var width = data.__g("style").__g("width") * screenWidth / 375;
      TangramBridge.__c("setViewBounds", view, width, -2);
    } else if (!data.__g("style").width && data.__g("style").__g("height")) 
    {
      var height = data.__g("style").__g("height") * screenWidth / 375;
      TangramBridge.__c("setViewBounds", view, -2, height);
    }
    if (data.__g("style").fixX) 
    {
      view.__c("setTranslationX", data.__g("style").__g("fixX"));
    }
    if (data.__g("style").fixY) 
    {
      view.__c("setTranslationY", data.__g("style").__g("fixY"));
    }
  }
  return view;
}
function removeView(view) {
  TangramBridge.__c("removeView", view);
}
function addView(view, parentView, gravity) {
  var gravityRet;
  if (gravity == 'LT') 
  {
    gravityRet = 1;
  } else if (gravity == 'CT') 
  {
    gravityRet = 2;
  } else if (gravity == 'RT') 
  {
    gravityRet = 3;
  } else if (gravity == 'LC') 
  {
    gravityRet = 4;
  } else if (gravity == 'CC') 
  {
    gravityRet = 5;
  } else if (gravity == 'RC') 
  {
    gravityRet = 6;
  } else if (gravity == 'LB') 
  {
    gravityRet = 7;
  } else if (gravity == 'CB') 
  {
    gravityRet = 8;
  } else if (gravity == 'RB') 
  {
    gravityRet = 9;
  }
  TangramBridge.__c("addView", view, parentView, gravityRet);
}
function putUserParam(key, value) {
  Lynel.__c("putUserParam", key, value);
}
function getUserParam(key) {
  return Lynel.__c("getUserParam", key);
}
function openURL(url) {
  TangramBridge.__c("openUrl", url);
}
function getEngineData(k) {
  return JSON.__c("parse", dataClusterMap.__c("get", k).__c("getTangramData").__c("toString"));
}
function updateEngineData(k, d) {
  dataClusterMap.__c("get", k).__c("setTangramData", String(JSON.__c("stringify", d)));
  containerEngine.__c("setData", String(JSON.__c("stringify", d)));
}
function getEngineResponse() {
  return JSON.__c("parse", dataClusterMap.__c("get", '1').__c("getResponseData").__c("toString"));
}
function isCacheData() {
  return false;
}
function toast(type, text, time) {
  if (parseInt(time) > 3)
  {
    TMCommonBridge.__c("showToastLong", text);
  } else {
    TMCommonBridge.__c("showToastShort", text);
  }
}
function dealUTForTangram(tangramJsonArray, spmb) {
  if (!tangramJsonArray)
  {
    return;
  }
  for (var i = 0, length = tangramJsonArray.__g("length"); i < length; i++)
    {
      var data = tangramJsonArray.__g(i);
      dealUT(data.__g("header"), data.__g("header"), spmb);
      dealUT(data.__g("footer"), data.__g("footer"), spmb);
      var items = data.__g("items");
      if (items != null)
      {
        dealUTForTangram(items, spmb);
      } else {
        var datas = data.__g("data");
        if (datas != null)
        {
          dealUTForTangram(datas, spmb);
        }
      }
      dealUT(data, data, spmb);
    }
}
function dealUT(data, destData, spmb) {
  if (!data || !destData)
  {
    return;
  }
  var spmArr = destData.__g("userTrackParams");
  if (null != spmArr)
  {
    var len = spmArr.__g("length");
    for (var i = 0; i < len; ++i)
      {
        var obj = spmArr.__g(i);
        if (null != obj)
        {
          var key = obj.__g("key");
          var spm = obj.__g("spm");
          var scm = obj.__g("scm");
          var scmRev = obj.__g("scm-rev");
          var paramMap = obj.__g("paramMap");
          if (!spm)
          {
            spm = parseSpm(destData, spmb);
          }
          if (!scm)
          {
            scm = parseScm(destData, paramMap);
          }
          var ext = obj.__g("ext");
          if (key && destData[key])
          {
            var action = destData.__g(key);
            var o = {'action': action, 'spm': spm, 'scm': scm, 'scm-rev': scmRev, 'ext': ext, 'paramMap': paramMap};
            data[key] = o;
          }
        }
      }
  }
}
function parseSpm(jsonObject, spmb) {
  if (jsonObject["runtime-cache-spm"])
  {
    return jsonObject["runtime-cache-spm"];
  }
  var spm = {};
  var spmc = jsonObject.__g('spmc');
  if (!spmc)
  {
    var spmd = jsonObject.__g('index');
    if (!spmd)
    {
      spmd = "1";
    }
    spm = 'a1z60.' + spmb + '.' + spmc + '.' + spmd;
  }
  if (spm)
  {
    spm = jsonObject['spm'];
  }
  if (spm)
  {
    spm = 'a1z60.' + spmb + '.0.0';
  }
  jsonObject["runtime-cache-spm"] = spm;
  return spm;
}
function parseScm(jsonObject, paramMap) {
  if (jsonObject["runtime-cache-scm"])
  {
    return jsonObject["runtime-cache-scm"];
  }
  var scm;
  if (paramMap)
  {
    scm = paramMap['scm'];
  }
  if (!scm)
  {
    scm = jsonObject['scm'];
    if (!scm)
    {
      var actionObject = jsonObject.__g('action');
      var action = null;
      if (actionObject != null)
      {
        action = actionObject['action'];
      } else {
        action = jsonObject['action'];
      }
      if (action != null)
      {
      }
      if (!scm)
      {
        scm = "";
      }
      jsonObject["runtime-cache-scm"] = scm;
    }
  } else {
    jsonObject["runtime-cache-scm"] = scm;
  }
  return scm;
}
