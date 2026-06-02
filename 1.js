var rule = {
    title: '劇迷DramasQ',
    host: 'https://dramasq.biz', // 基礎域名
    url: '/vodtype/fyclass-fypage.html', // 分類分頁網址規則
    searchUrl: '/vodsearch/**----------fypage---.html', // 搜尋網址規則
    searchable: 1,
    quickSearch: 1,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    timeout: 5000,
    class_name: '韓劇&陸劇&台劇&日劇&歐美劇', // 電視畫面上要顯示的分類名稱
    class_url: 'kr&cn&tw&jp&us', // 對應 DramasQ 網址的分類 ID
    play_parse: true,
    lazy: `js:
        // 這邊負責處理播放頁面的影片真實網址 (M3U8 或 MP4)
        // 先預設直接回傳網址，若後面遇到加密源我們再微調
        input = {parse: 1, url: input, header: rule.headers};
    `,
    // 一、首頁與分類頁面解析
    double: true, // 兩層結構
    一级: 'js:
        var items = [];
        // 抓取網頁中影劇列表的 CSS 選擇器 (通常是 list-vod 中的 li 或 a)
        var html = request(input);
        var list = pdfa(html, '.list-vod li, .vodlist li'); // 根據 DramasQ 結構動態適應
        list.forEach(function(it) {
            var title = pdfh(it, 'a&&title||a&&text');
            var img = pd(it, 'img&&src', input);
            var url = pd(it, 'a&&href', input);
            var remarks = pdfh(it, '.remarks&&text||.pic-text&&text');
            items.push({
                vod_name: title,
                vod_pic: img,
                vod_id: url,
                vod_remarks: remarks
            });
        });
        setResult(items);
    ',
    // 二、影劇詳情頁面（抓集數）
    二级: `js:
        var html = request(input);
        // 抓取標題、圖片、簡介
        var title = pdfh(html, '.vod-detail-info h1&&text||h1&&text');
        var img = pd(html, '.vod-detail-pic img&&src||img&&src', input);
        var desc = pdfh(html, '.vod-detail-content&&text||.content&&text');
        var remarks = pdfh(html, '.vod-detail-info span&&text');

        var vod = {
            vod_id: input,
            vod_name: title,
            vod_pic: img,
            vod_remarks: remarks,
            vod_content: desc
        };

        // 抓取播放清單（集數）
        var playlist = [];
        // 尋找 DramasQ 的播放列表區塊
        var playUrls = pdfa(html, '.playlist li a||.play-btn a');
        playUrls.forEach(function(it) {
            var name = pdfh(it, 'a&&text');
            var href = pd(it, 'a&&href', input);
            playlist.push(name + '$' + href);
        });

        vod.vod_play_from = '劇迷專線';
        vod.vod_play_url = playlist.join('#');

        setResult({list: [vod]});
    `,
    // 三、搜尋頁面解析
    搜索: 'js:
        var items = [];
        var html = request(input);
        var list = pdfa(html, '.search-list li||.vodlist li');
        list.forEach(function(it) {
            var title = pdfh(it, 'a&&title||a&&text');
            var img = pd(it, 'img&&src', input);
            var url = pd(it, 'a&&href', input);
            items.push({
                vod_name: title,
                vod_pic: img,
                vod_id: url
            });
        });
        setResult(items);
    '
};
