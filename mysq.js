let host = 'https://dramasq.cc';
let header = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

async function init(ext) {
    return String("");
}

async function home(filter) {
    let classes = [
        {"type_id": "hanju", "type_name": "韓劇"},
        {"type_id": "dlju", "type_name": "陸劇"},
        {"type_id": "twju", "type_name": "台劇"},
        {"type_id": "rbju", "type_name": "日劇"},
        {"type_id": "omju", "type_name": "歐美劇"}
    ];
    return JSON.stringify({ class: classes });
}

async function category(tid, pg, filter, extend) {
    if (pg <= 0) pg = 1;
    let url = host + '/vodtype/' + tid + '-' + pg + '.html';
    let html = await req(url, { headers: header });
    let items = [];
    
    // 直接調用你反編譯看到的 pdfa, pdfh, pd
    let list = pdfa(html, '.list-vod li, .vodlist li');
    list.forEach(it => {
        items.push({
            vod_id: pdfh(it, 'a&&href'),
            vod_name: pdfh(it, 'a&&title'),
            vod_pic: pd(it, 'img&&data-original'),
            vod_remarks: pdfh(it, '.remarks&&text')
        });
    });
    return JSON.stringify({ page: pg, pagecount: 99, limit: 20, total: 999, list: items });
}

async function detail(id) {
    let url = id.startsWith('http') ? id : host + id;
    let html = await req(url, { headers: header });
    let vod = {
        vod_id: id,
        vod_name: pdfh(html, '.vod-detail-info h1&&text'),
        vod_pic: pd(html, '.vod-detail-pic img&&src'),
        vod_remarks: pdfh(html, '.vod-detail-info span&&text'),
        vod_content: pdfh(html, '.vod-detail-content&&text')
    };
    
    let playlist = [];
    let playUrls = pdfa(html, '.playlist li a, .urllist li a');
    playUrls.forEach(it => {
        let name = pdfh(it, 'a&&text');
        let href = pdfh(it, 'a&&href');
        playlist.push(name + '$' + href);
    });
    
    vod.vod_play_from = "劇迷線路";
    vod.vod_play_url = playlist.join('#');
    return JSON.stringify({ list: [vod] });
}

async function search(wd, quick, pg) {
    let url = host + '/vodsearch/' + wd + '----------' + pg + '---.html';
    let html = await req(url, { headers: header });
    let items = [];
    let list = pdfa(html, '.search-list li, .vodlist li');
    list.forEach(it => {
        items.push({
            vod_id: pdfh(it, 'a&&href'),
            vod_name: pdfh(it, 'a&&title'),
            vod_pic: pd(it, 'img&&data-original')
        });
    });
    return JSON.stringify({ list: items });
}

async function play(flag, id, flags) {
    return JSON.stringify({ parse: 1, url: id, header: header });
}
