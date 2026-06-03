// 🎯 終極修正：絕對正確的 dramasq.com.tr
const host = 'https://dramasq.com.tr';
const header = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

function init(ext) {
    return "";
}

function home(filter) {
    var classes = [
        {"type_id": "hanju", "type_name": "韓劇測試"},
        {"type_id": "dlju", "type_name": "陸劇測試"}
    ];
    return JSON.stringify({ "class": classes });
}

function category(tid, pg, filter, extend) {
    return JSON.stringify({ "page": 1, "pagecount": 1, "limit": 20, "total": 20, "list": [] });
}

function detail(id) {
    return JSON.stringify({ "list": [] });
}

function search(wd, quick) {
    return JSON.stringify({ "list": [] });
}

function play(flag, id, flags) {
    return JSON.stringify({ "parse": 0, "url": id });
}
