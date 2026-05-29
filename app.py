from flask import Flask, jsonify, request
import requests
import re
import urllib.parse

app = Flask(__name__)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Referer": "https://www.dramasq.com.tr/",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7"
}

@app.route("/detail")
def detail():
    vod_id = request.args.get("id")
    if not vod_id:
        return jsonify({"list": []})

    detail_url = f"https://www.dramasq.com.tr/voddetail/{vod_id}.html"
    
    try:
        r = requests.get(detail_url, headers=headers, timeout=10)
        r.encoding = "utf-8"
        html = r.text
        
        title_match = re.search(r'<title>(.*?)線上看', html)
        vod_name = title_match.group(1).strip() if title_match else "DramasQ 影片"
        
        # 精準匹配所有集數連結
        pattern = r'href=[\'"]\/video\/' + re.escape(vod_id) + r'-(\d+)\.html.*?[\'"][^>]*>(.*?)<\/a>'
        ep_matches = re.findall(pattern, html)
        
        # 🔥 動態獲取當前服務的基礎網址 (在本地會是 http://127.0.0.1:5000/，在雲端會是 https://tx-api.onrender.com/)
        base_url = request.host_url.rstrip('/')
        
        play_list = []
        seen_eps = set()
        
        if ep_matches:
            for ep_num, ep_title in ep_matches:
                if ep_num in seen_eps:
                    continue
                seen_eps.add(ep_num)
                
                clean_title = re.sub(r'<[^>]+>', '', ep_title).strip()
                if not clean_title.startswith("get") and not clean_title.startswith("第"):
                    clean_title = f"第{ep_num}集"
                elif clean_title.startswith("get"):
                    clean_title = f"第{ep_num}集"
                    
                # 🛠️ 將 127.0.0.1 改為動態網址 base_url
                play_url = f"{base_url}/play?id={vod_id}&ep={ep_num}"
                play_list.append(f"{clean_title}${play_url}")
        else:
            for ep in range(1, 41):
                # 🛠️ 保底邏輯也同步改為動態網址
                play_url = f"{base_url}/play?id={vod_id}&ep={ep}"
                play_list.append(f"第{ep}集${play_url}")

        vod_play_url = "#".join(play_list)

        return jsonify({
            "list": [
                {
                    "vod_id": vod_id,
                    "vod_name": vod_name,
                    "vod_play_from": "DramaQ線路",
                    "vod_play_url": vod_play_url
                }
            ]
        })

    except Exception as e:
        return jsonify({"error": str(e), "list": []})


@app.route("/play")
def play():
    vod_id = request.args.get("id")
    ep = request.args.get("ep")
    url = f"https://www.dramasq.com.tr/video/{vod_id}-{ep}.html"
    
    try:
        r = requests.get(url, headers=headers, timeout=10)
        r.encoding = "utf-8"
        html = r.text
        
        # 🔥 終極大絕招：繞過整段 JSON，直接狙擊 player_aaaa 內部的 "url":"..." 欄位
        # 匹配 "url":"https://..." 或 "url":"\/..."
        url_match = re.search(r'var\s+player_aaaa\s*=\s*\{.*?"url"\s*:\s*["\']([^"\']+)["\']', html, re.DOTALL)
        
        if url_match:
            raw_url = url_match.group(1)
            # 修正反斜線
            real_url = raw_url.replace("\\/", "/")
            
            # URL 解碼保險
            if "%" in real_url:
                real_url = urllib.parse.unquote(real_url)
                
            print(f"🎉 成功直出 M3U8：{real_url}")
            
            # 返回標準 TVBox 播放格式
            return jsonify({
                "parse": 0,
                "url": real_url,
                "header": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Referer": "https://www.dramasq.com.tr/"
                }
            })
            
        # 保底備用：全域硬撈
        raw_urls = re.findall(r'(https?://[^\s\'"\n<>]+?\.m3u8[^\s\'"\n<>]*)', html)
        if raw_urls:
            real_url = raw_urls[0].replace("\\/", "/")
            return jsonify({"parse": 0, "url": real_url})

        # 真的找不到，交給 TVBox 解析器器
        return jsonify({"parse": 1, "url": url})
        
    except Exception as e:
        return jsonify({"parse": 1, "url": url, "error": str(e)})


if __name__ == "__main__":
    # 允許局域網內其他設備（如電視、手機）訪問，建議改為 0.0.0.0
    app.run(host="0.0.0.0", port=5000, debug=True)