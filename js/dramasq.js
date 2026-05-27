var rule = {
    title:'DramasQ',
    host:'https://dramasq.com.tr',

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

let m = html.match(/var player_aaaa=({.*?})</);

if(m){

    let data = JSON.parse(m[1]);

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

    limit:6,

    推荐:'.items&&li;a&&title;a&&data-original;.module-item-note&&Text;a&&href',

    一级:'.items&&li;a&&title;a&&data-original;.module-item-note&&Text;a&&href',

    二级:{
        title:'h1&&Text',
        img:'.lazyload&&data-original',
        desc:'font&&Text',
        content:'pre&&Text',
        tabs:'.title',
        lists:'.items:eq(#id)&&li'
    }

}
