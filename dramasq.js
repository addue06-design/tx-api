export default {
    async init(ext) {
        this.host = "https://dramasq.com.tr";
    },

    async home(filter) {
        return JSON.stringify({
            class: [
                {
                    type_id: "search",
                    type_name: "搜尋"
                }
            ]
        });
    },

    async search(wd, quick, pg) {
        try {
            const url = `${this.host}/vodsearch/-------------.html?wd=${encodeURIComponent(wd)}`;

            const html = await req(url);

            const list = [];
            const reg = /href="\/voddetail\/(\d+)\.html"[\s\S]*?title sizing">(.*?)<\/div>/g;

            let m;

            while ((m = reg.exec(html.content)) !== null) {
                list.push({
                    vod_id: m[1],
                    vod_name: m[2].trim(),
                    vod_pic: "",
                    vod_remarks: ""
                });
            }

            return JSON.stringify({
                list
            });

        } catch (e) {
            return JSON.stringify({
                list: []
            });
        }
    },

    async detail(id) {
        try {
            const url = `${this.host}/voddetail/${id}.html`;

            const html = await req(url);

            const playMap = {};

            const reg =
                /href="\/video\/(\d+)-(\d+)\.html#sid=(\d+)".*?>(.*?)<\/a>/g;

            let m;

            while ((m = reg.exec(html.content)) !== null) {

                const vodId = m[1];
                const ep = m[2];
                const sid = m[3];
                const title = m[4].trim();

                if (!playMap[sid]) {
                    playMap[sid] = [];
                }

                playMap[sid].push(
                    `${title}$${vodId}-${ep}-${sid}`
                );
            }

            const from = [];
            const urls = [];

            Object.keys(playMap).forEach(sid => {
                from.push(`SID${sid}`);
                urls.push(playMap[sid].join("#"));
            });

            return JSON.stringify({
                list: [{
                    vod_id: id,
                    vod_name: "",
                    vod_play_from: from.join("$$$"),
                    vod_play_url: urls.join("$$$")
                }]
            });

        } catch (e) {

            return JSON.stringify({
                list: []
            });
        }
    },

    async play(flag, id, vipFlags) {

        try {

            const arr = id.split("-");

            const vodId = arr[0];
            const ep = arr[1];

            const pageUrl =
                `${this.host}/video/${vodId}-${ep}.html`;

            const html = await req(pageUrl);

            const match =
                /var player_aaaa=(\{.*?\})<\/script>/s.exec(
                    html.content
                );

            if (!match) {
                return JSON.stringify({});
            }

            const player = JSON.parse(match[1]);

            return JSON.stringify({
                parse: 0,
                playUrl: "",
                url: player.url
            });

        } catch (e) {

            return JSON.stringify({
                parse: 1,
                url: ""
            });
        }
    }
};
