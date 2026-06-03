var rule = {
    title: '劇迷DramasQ',
    host: 'https://dramasq.cc',
    url: '/vodtype/fyclass-fypage.html',
    searchUrl: '/vodsearch/**----------fypage---.html',
    searchable: 1,
    quickSearch: 1,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    timeout: 5000,
    
    // 重新定義純英文字元分類，防止非 UTF-8 編碼造成亂碼中斷
    class_name: '韓劇&陸劇&台劇&日劇&歐美劇',
    class_url: 'hanju&dlju&twju&rbju&omju',
    
    play_parse: true,
    lazy: 'js: input = {parse: 1, url: input, header: rule.headers};',
    
    double: true,
    一级: 'js: var items = []; var html = request(input); var list = pdfa(html, ".list-vod li||.vodlist li||.pack-ykpack||.v-item"); list.forEach(function(it) { var title = pdfh(it, "a&&title||a&&text||.title&&text"); var img = pd(it, "img&&data-original||img&&src", input); var url = pd(it, "a&&href", input); var remarks = pdfh(it, ".remarks&&text||.pic-text&&text"); if (title && url) { items.push({ vod_name: title, vod_pic: img, vod_id: url, vod_remarks: remarks }); } }); setResult(items);',
    
    二级: 'js: var html = request(input); var title = pdfh(html, ".vod-detail-info h1&&text||h1&&text"); var img = pd(html, ".vod-detail-pic img&&src||img&&src", input); var desc = pdfh(html, ".vod-detail-content&&text||.content&&text"); var remarks = pdfh(html, ".vod-detail-info span&&text"); var vod = { vod_id: input, vod_name: title, vod_pic: img, vod_remarks: remarks, vod_content: desc }; var playlist = []; var playUrls = pdfa(html, ".playlist li a||.play-btn a||.urllist li a"); playUrls.forEach(function(it) { var name = pdfh(it, "a&&text||text"); var href = pd(it, "a&&href||href", input); if (href) { playlist.push(name + "$" + href); } }); vod.vod_play_from = "劇迷快線"; vod.vod_play_url = playlist.join("#"); setResult({list: [vod]});',
    
    搜索: 'js: var items = []; var html = request(input); var list = pdfa(html, ".search-list li||.vodlist li"); list.forEach(function(it) { var title = pdfh(it, "a&&title||a&&text"); var img = pd(it, "img&&data-original||img&&src", input); var url = pd(it, "a&&href", input); if (title && url) { items.push({ vod_name: title, vod_pic: img, vod_id: url }); } }); setResult(items);'
};
