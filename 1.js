var rule = {
    title: '劇迷DramasQ',
    // 1. 自動適應新域名，增加多個備用解析
    host: 'https://dramasq.cc', 
    url: '/vodtype/fyclass-fypage.html',
    searchUrl: '/vodsearch/**----------fypage---.html',
    searchable: 1,
    quickSearch: 1,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.5,en;q=0.3'
    },
    timeout: 5000,
    
    // 2. 修正分類代碼（直接對應 DramasQ 網址列真實 ID）
    class_name: '韓劇&陸劇&台劇&日劇&歐美劇',
    class_url: 'hanju&dlju&twju&rbju&omju', 
    
    play_parse: true,
    lazy: `js:
        input = {parse: 1, url: input, header: rule.headers};
    `,
    
    // 一、首頁與分類頁面（大幅放寬 CSS 選擇器，抓取最底層的 a 標籤與 img）
    double: true,
    一级: 'js:
        var items = [];
        var html = request(input);
        // 擴大匹配：適應所有主流 TVBox 模板的影劇方塊
        var list = pdfa(html, '.list-vod li||.vodlist li||.pack-ykpack||.v-item'); 
        
        list.forEach(function(it) {
            var title = pdfh(it, 'a&&title||a&&text||.title&&text');
            var img = pd(it, 'img&&data-original||img&&src', input);
            var url = pd(it, 'a&&href', input);
            var remarks = pdfh(it, '.remarks&&text||.pic-text&&text||.pack-prft&&text');
            
            if (title && url) {
                items.push({
                    vod_name: title,
                    vod_pic: img,
                    vod_id: url,
                    vod_remarks: remarks
                });
            }
        });
        setResult(items);
    ',
    
    // 二、影劇詳情頁面（精準剝離播放集數網址）
    二级: `js:
        var html = request(input);
        var title = pdfh(html, '.vod-detail-info h1&&text||h1&&text||.text-fff&&text');
        var img = pd(html, '.vod-detail-pic img&&src||img&&src||.lazy&&data-original', input);
        var desc = pdfh(html, '.vod-detail-content&&text||.content&&text||.detail&&text');
        var remarks = pdfh(html, '.vod-detail-info span&&text||.text-muted&&text');

        var vod = {
            vod_id: input,
            vod_name: title,
            vod_pic: img,
            vod_remarks: remarks,
            vod_content: desc
        };

        var playlist = [];
        // 針對 DramasQ 常見的播放列表區塊進行多重匹配
        var playUrls = pdfa(html, '.playlist li a||.play-btn a||.urllist li a||.vv-playlist a');
        
        playUrls.forEach(function(it) {
            var name = pdfh(it, 'a&&text||text');
            var href = pd(it, 'a&&href||href', input);
            if (href) {
                playlist.push(name + '$' + href);
            }
        });

        vod.vod_play_from = '劇迷快線';
        vod.vod_play_url = playlist.join('#');

        setResult({list: [vod]});
    `,
    
    // 三、搜尋頁面
    搜索: 'js:
        var items = [];
        var html = request(input);
        var list = pdfa(html, '.search-list li||.vodlist li||.v-item');
        list.forEach(function(it) {
            var title = pdfh(it, 'a&&title||a&&text||h3&&text');
            var img = pd(it, 'img&&data-original||img&&src', input);
            var url = pd(it, 'a&&href', input);
            if (title && url) {
                items.push({
                    vod_name: title,
                    vod_pic: img,
                    vod_id: url
                });
            }
        });
        setResult(items);
    '
};
