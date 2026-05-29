import re
import urllib.parse
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# 🏷️ 版本註記（方便你等一下辨識）
VERSION = "v1.0.4-Ultimate-Fix"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.dramasq.com.tr/"
}

# 🎯 核心修正 1：讓根目錄 (/) 與 /detail 跑同一套邏輯，徹底堵死 404 造成的空白畫面！
@app.route("/")
@app.route("/detail")
def detail():
    vod_id = request.args.get("id")
    keyword = request.args.get("wd")
    
    base_url = request.host_url.rstrip('/')

    # ------------------ 情況 1：點進影片詳情頁（撈集數） ------------------
    if vod_id:
        detail_url = f"https://www.dramasq.com.tr/voddetail/{vod_id}.html"
        try:
            r = requests.get(detail_url, headers=headers, timeout=10)
            r.encoding = "utf-8"
            html = r.text
            
            title_match = re.search(r'<title>(.*?)線上看', html)
            vod_name = title_match.group(1).strip() if title_match else "DramasQ 影片"
            
            pattern = r'href=[\'"]\/video\/' + re.escape(vod_id) + r'-(\d+)\.html.*?[\'"][^>]*>(.*?)<\/a>'
            ep_matches = re.findall(pattern, html)
            
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
                        
                    play_url = f"{base_url}/play?id={vod_id}&ep={ep_num}"
                    play_list.append(f"{clean_title}${play_url}")
            else:
                for ep in range(1, 41):
                    play_url = f"{base_url}/play?id={vod_id}&ep={ep}"
                    play_list.append(f"第{ep}集${play_url}")

            vod_play_url = "#".join(play_list)

            return jsonify({
                "list": [
                    {
                        "vod_id": vod_id,
                        "vod_name": vod_name,
                        "vod_play_from": "DramaQ線路",
                        "vod_play_url": vod_play_url,
                        "type_id": "1",
                        "type_name": f"劇迷 ({VERSION})",
                        "vod_pic": "https://www.dramasq.com.tr/statics/img/nopic.gif",
                        "vod_remarks": VERSION
                    }
                ]
            })

        except Exception as e:
            return jsonify({"error": f"Detail error: {str(e)}", "list": []})

    # ------------------ 情況 2：TVBox 發起搜尋 ------------------
    if keyword:
        encoded_keyword = urllib.parse.quote(keyword.strip())
        search_url = f"https://www.dramasq.com.tr/vodsearch/-------------.html?wd={encoded_keyword}"
        
        try:
            r = requests.get(search_url, headers=headers, timeout=10)
            r.encoding = "utf-8"
            html = r.text
            
            pattern = r'href=[\'"]\/voddetail\/(\d+)\.html[\'"]\s+title=[\'"](.*?)[\'"]'
            matches = re.findall(pattern, html)
            
            if not matches:
                pattern_alt = r'href=[\'"]\/voddetail\/(\d+)\.html[\'"].*?>(.*?)<\/a>'
                matches = re.findall(pattern_alt, html)

            vod_list = []
            seen_ids = set()
            
            for v_id, v_name in matches:
                if v_id in seen_ids:
                    continue
                seen_ids.add(v_id)
                
                clean_name = re.sub(r'<[^>]+>', '', v_name).strip()
                
                vod_list.append({
                    "vod_id": v_id,
                    "vod_name": clean_name,
                    "vod_pic": "https://www.dramasq.com.tr/statics/img/nopic.gif",
                    "vod_remarks": f"點擊選集 ({VERSION})",
                    "type_id": "1",
                    "type_name": "連續劇"
                })
                
            return jsonify({
                "list": vod_list,
                "page": 1,
                "pagecount": 1,
                "limit": len(vod_list),
                "total": len(vod_list)
            })
            
        except Exception as e:
            return jsonify({"error": f"Search error: {str(e)}", "list": []})

    # ------------------ 情況 3：首頁初始化保底（什麼參數都沒帶） ------------------
    # 這裡提供最標準、最寬容的 CMS 回傳格式
    return jsonify({
        "class": [
            {"class_id": "1", "class_name": f"劇迷熱門({VERSION})"}
        ],
        "list": [
            {
                "vod_id": "46951",
                "vod_name": f"逐玉 ({VERSION} 測試推薦)",
                "vod_pic": "https://www.dramasq.com.tr/statics/img/nopic.gif",
                "vod_remarks": f"核心版本: {VERSION}",
                "type_id": "1",
                "type_name": "連續劇"
            }
        ],
        "page": 1,
        "pagecount": 1,
        "limit": 20,
        "total": 1
    })

@app.route("/play")
def play():
    return jsonify({
        "parse": 0,
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
