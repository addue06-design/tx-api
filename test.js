export default {

    async init(ext) {
    },

    async home(filter) {
        return JSON.stringify({
            class: [
                {
                    type_id: "1",
                    type_name: "測試"
                }
            ]
        });
    },

    async search(wd, quick, pg) {

        return JSON.stringify({
            list: [
                {
                    vod_id: "123",
                    vod_name: "JS測試成功",
                    vod_pic: "",
                    vod_remarks: ""
                }
            ]
        });
    },

    async detail(id) {

        return JSON.stringify({
            list: [{
                vod_id: id,
                vod_name: "JS測試成功",
                vod_play_from: "測試",
                vod_play_url: "播放測試$test"
            }]
        });
    },

    async play(flag, id, vipFlags) {

        return JSON.stringify({
            parse: 0,
            url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        });
    }
}
