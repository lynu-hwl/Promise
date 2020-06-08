/**
 * 自定义Promise函数模块:IIFE
 */
(function(window){
    /**
     * Promise构造函数
     */

    const PENDING = 'pending';
    const RESOLVED = 'resolved';
    const REJECTED = 'rejected';

    function Promise(excutor){
        const self = this;
        self.status = PENDING //给promise对象指定status属性，初始值为pending 
        self.data = undefined //给promise对象指定一个用于存储结果数据的属性
        self.callbacks = [] //每个元素的结果:{onResolved(){},onRejected(){}}

        function resolve(value){
            //如果当前状态不是pending,直接结束
            if(self.status!==PENDING) return
            //将状态改为resolved
            self.status = RESOLVED
            //保存value数据
            self.data = value
            //如果有待执行callback函数,立即异步执行回调函数
            if(self.callbacks.length>0){
                setTimeout(()=>{//放入队列中执行所有成功的回调
                    self.callbacks.forEach(callbacksObj => {
                        callbacksObj.onResolved(value)
                    });
                })
            }
        }

        function reject(reason){
            //如果当前状态不是pending,直接结束
            if(self.status!==PENDING) return
            //将状态改为rejected
            self.status = REJECTED
            //保存reason数据
            self.data = reason
            //如果有待执行callback函数,立即异步执行回调函数
            if(self.callbacks.length>0){
                setTimeout(()=>{//放入队列中执行所有失败的回调
                    self.callbacks.forEach(callbacksObj => {
                        callbacksObj.onRejected(reason)
                    });
                })
            }
        }

        //立即同步执行
        try {
            excutor(resolve,reject)    
        } catch (error) {
            reject(error)
        }
    }

    //Promise原型对象的then()
    //指定成功和失败的回调函数
    //返回一个新的promise对象
    Promise.prototype.then = function(onResolved,onRejected){

        //指定默认的成功回调
        onResolved = typeof onResolved === 'function'?onResolved:value=>value
        //指定默认的失败回调(实现错误/异常传透的关键点)
        onRejected = typeof onRejected === 'function'?onRejected:reason=>{throw reason}
        
        const self = this;
        return new Promise((resolve,reject)=>{
            /**
             * 调用指定的回调函数处理
             */
            function handle(callback){
                /**
                 * 1.如果抛出异常，return的promise就会失败，reason就是error
                 * 2.如果回调函数返回非promise，return的promise就会成功，value就是返回的值
                 * 3.如果回调函数返回是promise，return的promise结果就是这个promise的结果
                 */
                try {
                    const result = callback(self.data)
                    if(result instanceof Promise){
                        result.then(
                            value=>resolve(value),
                            reason=>reject(reason)
                        )
                    }else{
                        resolve(result) 
                    }
                } catch (error) {
                    reject(error)
                }
            }
                //假设当前状态还是pending状态，将回调函数保存起来
                if(self.status===PENDING){
                    self.callbacks.push({
                        onResolved(){
                            handle(onResolved);
                        },
                        onRejected(){
                            handle(onRejected);
                        }
                    })
                }else if(self.status===RESOLVED){
                    // 如果当前是resolve状态，异步执行onResolved并改变return的的promise状态
                    setTimeout(()=>{
                        handle(onResolved);
                    })
                }else{
                    setTimeout(()=>{
                        handle(onRejected);
                    })
                }
            }
        )
    }

    //Promise原型对象的catch()
    //指定失败的回调函数
    //返回一个新的promise对象
    Promise.prototype.catch = function(onRejected){
          return this.then(undefined,onRejected)
    }

    //Promise函数对象resolve
    //返回一个指定结果的成功的Promise
    Promise.resolve = function(value){

    }

    //Promise函数对象reject
    //返回一个指定reason的失败的Promise
    Promise.reject = function(reason){

    }
    
    //Promise函数对象all
    //返回一个promise，只有当promise都成功时才成功，只要有一个失败的就失败了
    Promise.all = function(promises){

    }

    //Promise函数对象
    //返回一个promise,其结果由第一个完成的promise决定
    Promise.race = function(promises){

    }

    //向外暴露Promise函数
    window.Promise = Promise;
})(window)