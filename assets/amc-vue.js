/**
 *  amc-vue.js 针对鸟巢的Vue数据绑定
 *  依赖: amc.js (打印错误日志)
 *  备注: 
 *      可参考bizapp-collect-money.html
 *      只有声明在state中的属性才能被监听，目前支持原始属性监听，不支持多级监听。
 *      即：如果属性是对象，对象的内容被修改不会触发事件
 */
function Observer(data) {
    this.data = data;
    this.walk(data);
}

Observer.prototype = {
    walk: function(data) {
        var self = this;
        Object.keys(data).forEach(function(key) {
            self.defineReactive(data, key, data[key]);
        });
    },
    defineReactive: function(data, key, val) {
        // 为复杂类型递归添加Observer
        var childOb = observe(val);
        var dep = new Dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: function() {
                // 创建Watcher时赋值
                Dep.targets.forEach(function(target) {
                    dep.addSub(target);
                });
                return val;
            },
            set: function(newVal) {
                if (newVal === val) {
                    return;
                }

                // 更新子属性
                Dep.targets = dep.getTargets();
                childOb = observe(newVal); //如果新赋值的值是个复杂类型则递归加上对应的Wathcer
                Dep.targets = [];
                val = newVal;
                dep.notify();

            }
        });
    }
};

function observe(data) {
    if (!data || typeof data !== 'object') {
        return;
    }
    return new Observer(data);
}

// 订阅者管理
function Dep() {
    this.subs = [];
}
Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub);
    },
    notify: function() {
        this.subs.forEach(function(sub) {
            sub.update();
        });
    },
    getTargets: function() {
        return this.subs;
    }
};
Dep.targets = [];

// Watcher(Subscriber)

/**
 * 
 * @param {Object} vm 被监听的vm
 * @param {String} expOrFn 监听的key
 * @param {Function} cb 监听回调
 */
function Watcher(vm, expOrFn, cb) {
    this.cb = cb;
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.value = this.get();
    this.watch();
}

Watcher.prototype = {
    update: function() {
        this.run();
    },
    run: function() {
        var value = this.vm.$state[this.expOrFn];
        var oldVal = this.value;
        // 如果是对象，关联的是引用，子属性修改时value和oldVal永远一致
        if (typeof oldVal == 'object' || value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal, this.expOrFn);
        }
    },
    get: function() {
        return this.vm.$state[this.expOrFn];
    },
    watch: function() {
        Dep.targets = [this]; // 将自己加入监听者列表，传递给Observer
        // 触发所有结构的get操作，自己加入到Observer的就监听列表中
        walkGetters(this.vm.$state, this.expOrFn);
        Dep.targets = []; // 监听完毕，将自己移除
    }
};


// 遍历所有属性
function walkGetters(data, key) {
    var _data = key ? data[key] : data;
    if (!_data || typeof _data !== 'object') {
        return;
    }
    Object.keys(_data).forEach(function(_key) {
        walkGetters(_data, _key);
    });
}

function Vue(options) {
    var self = this;
    this.$options = options;

    // 绑定方法
    if (options.methods) {
        Object.keys(options.methods).forEach(function(key) {
            self[key] = options.methods[key].bind(self);
        });
    }

    if (options.data) {
        this.$data = options.data;
    }

    // 代理data
    this.$state = this.$options.state;
    Object.keys(this.$state).forEach(function(key) {
        self._proxy(key);
    });

    observe(this.$state);

    if (typeof self.mounted === 'function') {
        self.mounted();
    }
}

Vue.prototype = {
    // 将vm.data.xx代理为vm.x
    _proxy: function(key) {
        var self = this;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function getter() {
                return self.$state[key];
            },
            set: function setter(val) {
                self.$state[key] = val;
            }
        });
    },
    $watch: function(expOrFn, cb) {
        // 可以监听多个
        var self = this;
        if (Object.prototype.toString.call(expOrFn) === '[object Array]') {
            expOrFn.forEach(function(el) {
                new Watcher(self, el, cb);
            });
        } else if (expOrFn instanceof String || typeof expOrFn === 'string') {
            new Watcher(self, expOrFn, cb);
        }
    }
};