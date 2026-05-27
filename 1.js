var rule = {
    title: 'DramasQ',
    host: 'https://dramasq.com.tr',

    url: '/vodshow/fyclass--------fypage---.html',
    searchUrl: '/vodsearch/**----------fypage---.html',

    searchable: 2,
    quickSearch: 1,
    filterable: 0,

    class_name: '陸劇&台劇&韓劇&日劇&泰劇&港劇&美劇&動漫',
    class_url: '13&14&15&20&21&22&16&4',

    play_parse: true,

    lazy: `
js:
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

    推荐: '*',
    double: true,

    一级: `
js:
let d = [];

pdfh = jsp.pdfh;
pdfa = jsp.pdfa;

let list = pdfa(html, 'body .module-items .module-item');

list.forEach(it => {

    d.push({
        title: pdfh(it, '.module-item-title&&Text'),
        pic_url: pdfh(it, '.lazyload&&data-original'),
        desc: pdfh(it, '.module-item-note&&Text'),
        url: pdfh(it, 'a&&href')
    });

});

setResult(d);
`,

    二级: {
        title: 'h1&&Text',
        img: '.lazyload&&data-original',
        desc: '.module-info-item-content&&Text',
        content: 'pre&&Text',

        tabs: '.title:contains(片源)',

        lists: '.items&&li'
    },

}
