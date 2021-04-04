
// just define an async forEach
if (!self.forEach) {
    self.forEach = async (collection, fn) => {
        if (!collection || !Array.isArray(collection)) return ;
        for (let index = 0; index < collection.length; index++) {
            await fn(collection[index], index, collection);
        }
    };
}

// simple function check
self.isFunction = (obj) => typeof(obj) === 'function';
// async timeout fn
self.timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// just push back to the event loop and perform following steps 'async' (simulated)
self.doAsync = () => timeout(0);
