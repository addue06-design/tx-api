var rule = {
    title:'DramasQ',
    host:'https://www.dramasq.com.tr',
    headers:{
        'User-Agent':'Mozilla/5.0',
        'Referer':'https://dramasq.com.tr/',
        'Accept-Language':'zh-TW,zh;q=0.9'
    },
    url:'/vodshow/fyclass--------fypage---.html',
    searchUrl:'/vodsearch/**----------fypage---.html',

    searchable:2,
    quickSearch:1,
    filterable:0,

    class_name:'陸劇&台劇&韓劇&日劇&泰劇&港劇&美劇&動漫',
    class_url:'13&14&15&20&21&22&16&4',

    play_parse:true,

    lazy:`js:
let html = request(input);

let match = html.match(/var player_aaaa=({.*?})</);

if(match){

    let data = JSON.parse(match[1]);

    input = {
        parse:0,
        url:data.url,
        header:{
            "User-Agent":"Mozilla/5.0",
            "Referer":"https://dramasq.com.tr/"
        }
    }
}
`,

    limit:20,

    推荐:`js:
let d=[];

pdfa(html,'.module-items .module-item').forEach(it=>{

    d.push({
        title:pdfh(it,'.module-item-title&&Text'),
        pic_url:pd(it,'.module-item-pic&&img&&data-original',HOST),
        desc:pdfh(it,'.module-item-note&&Text'),
        url:pd(it,'a&&href',HOST)
    });

});

setResult(d);
`,

    一级:`js:
let d=[];

pdfa(html,'.module-items .module-item').forEach(it=>{

    d.push({
        title:pdfh(it,'.module-item-title&&Text'),
        pic_url:pd(it,'.module-item-pic&&img&&data-original',HOST),
        desc:pdfh(it,'.module-item-note&&Text'),
        url:pd(it,'a&&href',HOST)
    });

});

setResult(d);
`,

    二级:`js:
VOD = {};

VOD.vod_name = pdfh(html,'h1&&Text');

VOD.vod_pic = pd(html,'.module-item-pic&&img&&data-original',HOST);

VOD.type_name = pdfh(html,'.module-info-tag-link:eq(0)&&Text');

VOD.vod_content = pdfh(html,'pre&&Text');

let tabs = pdfa(html,'.module-tab-item');

let playmap = {};

tabs.forEach((tab,i)=>{

    let from = pdfh(tab,'body&&Text');

    playmap[from] = [];

    let list = pdfa(html,'.module-play-list:eq('+i+') a');

    list.forEach(it=>{

        let title = pdfh(it,'a&&Text');

        let url = pd(it,'a&&href',HOST);

        playmap[from].push(title + '$' + url);

    });

});

VOD.vod_play_from = Object.keys(playmap).join('$$$');

let urls = [];

Object.keys(playmap).forEach(key=>{

    urls.push(playmap[key].join('#'));

});

VOD.vod_play_url = urls.join('$$$');
`,

    搜索:`js:
let d=[];

pdfa(html,'.module-items .module-item').forEach(it=>{

    d.push({
        title:pdfh(it,'.module-item-title&&Text'),
        pic_url:pd(it,'.module-item-pic&&img&&data-original',HOST),
        desc:pdfh(it,'.module-item-note&&Text'),
        url:pd(it,'a&&href',HOST)
    });

});

setResult(d);
`
}
