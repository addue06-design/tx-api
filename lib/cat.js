import { spy } from './spider.js';

const _ = {
    // 這裡封裝了 Java 底層傳遞過來的原生方法
    js2Proxy: function (obj) { return js2Proxy(obj); },
    req: function (url, opt) { return req(url, opt); },
};

export { _ };
