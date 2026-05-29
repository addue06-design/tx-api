import re
import urllib.parse
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.dramasq.com.tr/"
}

@app.route("/detail")
def detail():
    vod_id = request.args.get("id")
    keyword = request.args.get("wd")  # TVBox 搜尋時帶入的關鍵字參數
    
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
                        "vod_play_url": vod_play_url
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
                    "vod_remarks": "點擊選集播放"
                })
                
            return jsonify({"list": vod_list})
            
        except Exception as e:
            return jsonify({"error": f"Search error: {str(e)}", "list": []})

    # ------------------ 情況 3：首頁初始化保底 ------------------
    return jsonify({
        "class": [
            {"class_id": "1", "class_name": "劇迷熱門連續劇"}
        ],
        "list": [
            {
                "vod_id": "46951",
                "vod_name": "逐玉 (雲端測試推薦，請點擊搜尋看更多)",
                "vod_pic": "https://www.dramasq.com.tr/statics/img/nopic.gif",
                "vod_remarks": "40集完結"
            }
        ],
        "page": 1,
        "pagecount": 1,
        "limit": 20,
        "total": 1
    })

@app.route("/play")
def play():
    # 🔥 【核心修復】絕對不可用空 pass！先回傳標準錯誤 JSON 釋放 TVBox 連線
    # 待你測試搜尋與詳情頁成功後，再把你的 DramasQ M3U8 暴力破解代碼覆蓋到這裡
    return jsonify({
        "parse": 0,
        "url": "https://p.test/error.m3u8",
        "msg": "請補齊此處的解密核心代碼"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
