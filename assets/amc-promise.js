/**
 *  amc-promise.js 针对鸟巢的Promise
 *  依赖: amc.js (打印错误日志)
 */

// 参考1: https://github.com/xieranmaya/blog/issues/3
// 参考2: https://promisesaplus.com/#point-46

// 备注: 不要滥用Promise, 在浏览器中两次setTimout的间隔是4ms(两次Event Loop的时间),
//       Promise回调用setTimeout实现异步回调，链太长会增加延时
function Promise(executor) {
    var self = this;

    self.status = 'pending';
    self.onResolvedCallback = [];
    self.onRejectedCallback = [];
    self.isBNPromise = true;

    function resolve(value) {
        // 鸟巢instanceof不正确用isBNPromise替代
        // if (value instanceof Promise) {
        if (value && value.isBNPromise) {
            return value.then(resolve, reject);
        }
        setTimeout(function() { // 异步执行所有的回调函数, 让后续then先执行
            if (self.status === 'pending') {
                self.status = 'resolved';
                self.data = value;
                for (var i = 0; i < self.onResolvedCallback.length; i++) {
                    self.onResolvedCallback[i](value);
                }
            }
        }, 0); // 备注: 鸟巢不支持setTimeout第二个参数为空
    }

    function reject(reason) {
        setTimeout(function() { // 异步执行所有的回调函数, 让后续then先执行
            if (self.status === 'pending') {
                self.status = 'rejected';
                self.data = reason;

                if (self.onRejectedCallback.length === 0) {
                    if (amc && amc.fn && amc.fn.logError && amc.fn.getTplId) {
                        // 通过resolveFnName定位问题
                        var resolveFnName = (self.onResolvedCallback[0] && self.onResolvedCallback[0].name) || '';
                        amc.fn.logError('amc-promise', '未catch的promise' + amc.fn.getTplId() + '-' + resolveFnName);
                    }
                }
                for (var i = 0; i < self.onRejectedCallback.length; i++) {
                    self.onRejectedCallback[i](reason);
                }
            }
        }, 0);
    }

    try {
        executor(resolve, reject);
    } catch (reason) {
        reject(reason);
    }
}

function resolvePromise(promise2, x, resolve, reject) {
    var then;
    var thenCalledOrThrow = false;

    if (promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise!'));
    }

    // if (x instanceof Promise) {
    // 鸟巢instanceof不正确用isBNPromise替代
    if (x && x.isBNPromise) {
        if (x.status === 'pending') { //because x could resolved by a Promise Object
            x.then(function(v) {
                resolvePromise(promise2, v, resolve, reject);
            }, reject);
        } else { //but if it is resolved, it will never resolved by a Promise Object but a static value;
            x.then(resolve, reject);
        }
        return;
    }

    if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
        try {
            then = x.then; //because x.then could be a getter
            if (typeof then === 'function') {
                then.call(x, function rs(y) {
                    if (thenCalledOrThrow) return;
                    thenCalledOrThrow = true;
                    return resolvePromise(promise2, y, resolve, reject);
                }, function rj(r) {
                    if (thenCalledOrThrow) return;
                    thenCalledOrThrow = true;
                    return reject(r);
                });
            } else {
                resolve(x);
            }
        } catch (e) {
            if (thenCalledOrThrow) return;
            thenCalledOrThrow = true;
            return reject(e);
        }
    } else {
        resolve(x);
    }
}

Promise.prototype.then = function(onResolved, onRejected) {
    var self = this;
    var promise2;
    onResolved = typeof onResolved === 'function' ? onResolved : function(v) {
        return v;
    };
    onRejected = typeof onRejected === 'function' ? onRejected : function(r) {
        throw r;
    };

    if (self.status === 'resolved') {
        return promise2 = new Promise(function(resolve, reject) {
            setTimeout(function() { // 异步执行onResolved
                try {
                    var x = onResolved(self.data);
                    resolvePromise(promise2, x, resolve, reject);
                } catch (reason) {
                    reject(reason);
                }
            }, 0);
        });
    }

    if (self.status === 'rejected') {
        return promise2 = new Promise(function(resolve, reject) {
            setTimeout(function() { // 异步执行onRejected
                try {
                    var x = onRejected(self.data);
                    resolvePromise(promise2, x, resolve, reject);
                } catch (reason) {
                    reject(reason);
                }
            }, 0);
        });
    }

    if (self.status === 'pending') {
        // 这里之所以没有异步执行，是因为这些函数必然会被resolve或reject调用，而resolve或reject函数里的内容已是异步执行，构造函数里的定义
        return promise2 = new Promise(function(resolve, reject) {
            self.onResolvedCallback.push(function(value) {
                try {
                    var x = onResolved(value);
                    resolvePromise(promise2, x, resolve, reject);
                } catch (r) {
                    reject(r);
                }
            });

            self.onRejectedCallback.push(function(reason) {
                try {
                    var x = onRejected(reason);
                    resolvePromise(promise2, x, resolve, reject);
                } catch (r) {
                    reject(r);
                }
            });
        });
    }
};

Promise.prototype.error = function(onRejected) {
    return this.then(null, onRejected);
};

Promise.deferred = Promise.defer = function() {
    var dfd = {};
    dfd.promise = new Promise(function(resolve, reject) {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
};

Promise.resolve = function(value) {
    return new Promise(function(resolve) {
        resolve(value);
    });
};

Promise.reject = function(value) {
    return new Promise(function(resolve, reject) {
        reject(value);
    });
};

// 通过产生一个pending状态的Promise避免promise链的后续逻辑执行
Promise.cancel = Promise.stop = function() {
    return new Promise(function() {});
};