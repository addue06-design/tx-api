from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/detail")
def detail():
    vod_id = request.args.get("id")
    keyword = request.args.get("wd")
    
    # ------------------ 最低環境 A：TVBox 剛開機首頁 ------------------
    if not vod_id and not keyword:
        return jsonify({
            "class": [
                {"class_id": "test_class", "class_name": "測試分類"}
            ],
            "list": [
                {
                    "vod_id": "12345",
                    "vod_name": "最低環境測試影片",
                    "vod_pic": "https://www.dramasq.com.tr/statics/img/nopic.gif",
                    "vod_remarks": "點點看我",
                    "type_id": "test_class"
                }
            ]
        })

    # ------------------ 最低環境 B：點進詳情頁 ------------------
    if vod_id == "12345":
        return jsonify({
            "list": [
                {
                    "vod_id": "12345",
                    "vod_name": "最低環境測試影片",
                    "vod_play_from": "測試線路",
                    "vod_play_url": "第一集$https://tx-api.onrender.com/play"
                }
            ]
        })

    # ------------------ 最低環境 C：隨便搜都給同一個結果 ------------------
    if keyword:
        return jsonify({
            "list": [
                {
                    "vod_id": "12345",
                    "vod_name": f"你搜尋了: {keyword}",
                    "vod_pic": "https://www.dramasq.com.tr/statics/img/nopic.gif",
                    "vod_remarks": "搜尋保底測試"
                }
            ]
        })

    return jsonify({"list": []})

@app.route("/play")
def play():
    return jsonify({
        "parse": 0,
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"  # 這是網路開源的標準測試大雄兔影片
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
