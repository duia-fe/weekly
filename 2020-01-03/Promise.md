### Promise

```javascript
/**
 * 说明：深入学习Promise，了解他的具体实现
 */

/**
 * Promise是什么？
 * Promise是抽象异步处理对象以及对其进行各种操作的组件。
 *
 * 例子：
 * let promise = new Promise(function(resolve, reject) {
 *  //成功调用 resolve(/返回值/)
 *  //失败调用 reject(/返回值/)
 * })
 */

/**
 * 构造函数，传入function
 */
function Promise(fn) {
  const self = this;
  if (typeof fn !== 'function') {
    //判断传入的是不是函数
    throw new TypeError('Promise fn ' + fn + ' is not a function');
  }
  self.status = 'pending'; // 当前的状态
  self.data = undefined; // 当前promise的值
  self.onResolvedCallback = []; // promise状态变为resolve时的回调函数集
  self.onRejectedCallback = []; // promise状态变为reject时的回调函数集

  function resolve(value) {
    // 成功回调
    if (value instanceof Promise) {
      //判断传入的是不是函数，如果是函数调用一下then
      return value.then(self.resolve, self.reject);
    }
    setTimeout(function() {
      // 保证一致可靠的执行顺序 Promis/A+规范
      // 异步执行所有的回调函数
      if (self.status === 'pending') {
        self.status = 'fullfilled'; // 更改状态为完成
        self.data = value;
        for (let i = 0; i < self.onResolvedCallback.length; i++) {
          // 依次执行then内函数
          self.onResolvedCallback[i](value);
        }
      }
    });
  }
  function reject(reason) {
    // 失败回调
    if (reason instanceof Promise) {
      //判断传入的是不是函数，如果是函数调用一下then
      return reason.then(null, self.reject);
    }
    setTimeout(function() {
      // 保证一致可靠的执行顺序 Promis/A+规范
      if (self.status === 'pending') {
        self.status = 'rejected'; // 更改状态为拒绝的（失败）
        self.data = reason;
        for (let i = 0; i < self.onRejectedCallback.length; i++) {
          // 依次执行catch内函数
          self.onRejectedCallback[i](value);
        }
      }
    });
  }
  try {
    fn(resolve, reject); // 执行并传入成功失败回调
  } catch (e) {
    this.reject(e); //错误调用失败
  }
}

//原型方法
Promise.prototype.then = function(onResolved, onRejected) {
  const self = this;
  let promise2;

  function resolvePromise(promiseX, x, resolveX, rejectX) {
    let then;
    let thenCalledOrThrow = false;

    if (promiseX === x) {
      return rejectX(new TypeError('Chaining cycle detected for promise!'));
    }

    if (x instanceof Promise) {
      if (x.status === 'pending') {
        //because x could resolved by a Promise Object
        x.then(function(v) {
          resolvePromise(promiseX, v, resolveX, rejectX);
        }, rejectX);
      } else {
        //but if it is resolved, it will never resolved by a Promise Object but a static value;
        x.then(resolveX, rejectX);
      }
      return;
    }

    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      try {
        then = x.then; //because x.then could be a getter
        if (typeof then === 'function') {
          then.call(
            x,
            function rs(y) {
              if (thenCalledOrThrow) return;
              thenCalledOrThrow = true;
              return resolvePromise(promiseX, y, resolveX, rejectX);
            },
            function rj(r) {
              if (thenCalledOrThrow) return;
              thenCalledOrThrow = true;
              return rejectX(r);
            }
          );
        } else {
          resolveX(x);
        }
      } catch (e) {
        if (thenCalledOrThrow) return;
        thenCalledOrThrow = true;
        return rejectX(e);
      }
    } else {
      resolveX(x);
    }
  }
  onResolved =
    typeof onResolved === 'function'
      ? onResolved
      : function(val) {
          return val;
        };
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : function(r) {
          throw r;
        };

  if (self.status === 'resolved') {
    return (promise2 = new Promise(function(resolve, reject) {
      setTimeout(function() {
        // 异步执行onResolved
        try {
          let x = onResolved(self.data);
          resolvePromise(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      });
    }));
  }

  if (self.status === 'rejected') {
    return (promise2 = new Promise(function(resolve, reject) {
      setTimeout(function() {
        // 异步执行onRejected
        try {
          let x = onRejected(self.data);
          resolvePromise(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      });
    }));
  }

  if (self.status === 'pending') {
    return (promise2 = new Promise(function(resolve, reject) {
      self.onResolvedCallback.push(function(value) {
        try {
          let x = onResolved(value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (r) {
          reject(r);
        }
      });

      self.onRejectedCallback.push(function(reason) {
        try {
          let x = onRejected(reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (r) {
          reject(r);
        }
      });
    }));
  }
};
Promise.prototype.catch = function(fn) {
  return this.then(null, fn);
};

Promise.deferred = Promise.defer = function() {
  let dfd = {};
  dfd.promise = new Promise(function(resolve, reject) {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};
```
