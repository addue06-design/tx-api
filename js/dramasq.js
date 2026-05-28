var rule = {
    title: 'DramasQ',
    host: 'https://www.dramasq.com.tr',
    homeUrl: '/',
    url: '/vodshow/fyclass--------fypage---.html',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,

    headers: {
        'User-Agent': 'Mozilla/5.0'
    },

    class_name: '陸劇&台劇&韓劇&日劇&泰劇&港劇&美劇&動漫',
    class_url: '13&14&15&20&21&22&16&4',

    play_parse: true,
    lazy: '',

    limit: 6,

    推荐: '.drama;a&&title;.imgflat&&style;.carousel-caption p&&Text;a&&href',
    一级: '.drama;a&&title;.imgflat&&style;.carousel-caption p&&Text;a&&href',

    二级: {
        title: '.catleader h1&&Text',
        img: '.imgflat&&style',
        desc: '.carousel-caption p&&Text',
        content: 'body&&Text',
        tabs: '.play_source_tab a',
        lists: '.paly_list_btn:eq(#id) a'
    },

    搜索: '.drama;a&&title;.imgflat&&style;.carousel-caption p&&Text;a&&href',

    图片替换: function (input) {
        let m = input.match(/url\\((.*?)\\)/);
        if (m && m[1]) {
            let url = m[1]
                .replace(/"/g, '')
                .replace(/'/g, '');

            if (url.startsWith('/')) {
                url = HOST + url;
            }

            return url;
        }
        return '';
    }
}
