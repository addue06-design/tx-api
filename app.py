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
    # 🔥 擴充參數接收，完美相容 PC 端 Freebox 與各版本 Android TV 盒子
    vod_id = request.args.get("id") or request.args.get("ids")
    keyword = request.args.get("wd") or request.args.get("keyword") or request.args.get("searchword")
    
    base_url = request.host_url.rstrip('/')

    # ================== 【情況 A：發起搜尋】 ==================
    if keyword:
        keyword = keyword.strip()
        encoded_keyword = urllib.parse.quote(keyword)
        search_url = f"https://www.dramasq.com.tr/vodsearch/-------------.html?wd={encoded_keyword}"
        
        try:
            r = requests.get(search_url, headers=headers, timeout=10)
            r.encoding = "utf-8"
            html = r.text
            
            # 🎯 終極雙重正則：確保通殺新舊版 DramasQ 搜尋結構
            pattern = r'href=[\'"]\/voddetail\/(\d+)\.html[\'"]\s+title=[\'"](.*?)[\'"]'
            matches = re.findall(pattern, html)
            
            if not matches:
                pattern_alt = r'href=[\'"]\/voddetail\/(\d+)\.html[\'"][^>]*>(.*?)<\/a>'
                matches = re.findall(pattern_alt, html)

            vod_list = []
            seen_ids = set()
            
            for v_id, v_name in matches:
                if v_id in seen_ids:
                    continue
                seen_ids.add(v_id)
                
                # 清理過長的 HTML 標籤或無效文字
                clean_name = re.sub(r'<[^>]+>', '', v_name).strip()
                if clean_name and len(clean_name) < 30 and "首頁" not in clean_name:
                    vod_list.append({
                        "vod_id": v_id,
                        "vod_name": clean_name,
                        "vod_pic": "https://www.dramasq.com.tr/statics/img/nopic.gif", 
                        "vod_remarks": "劇迷雲端免IP線"
                    })
                
            return jsonify({"list": vod_list})
            
        except Exception as e:
            return jsonify({"error": f"Search error: {str(e)}", "list": []})

    # ================== 【情況 B：進入影片詳情頁（撈集數）】 ==================
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
                # 保底生成 40 集
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

    # ================== 【情況 C：核心關鍵！首頁初始化保底】 ==================
    # 當 Freebox 使用 type: 1 剛載入站點時，會發送無參數請求。
    # 吐出固定的 class 分類與推薦影片，防止播放器因為解析不到欄位而報錯或死當！
    return jsonify({
        "class": [
            {"class_id": "1", "class_name": "劇迷熱門連續劇"}
        ],
        "list": [
            {
                "vod_id": "46951",
                "vod_name": "逐玉 (雲端測試推薦，請點擊搜尋看更多)",
                "vod_pic": "https://www.dramasq.com.tr/statics/img/nopic.gif",
                "vod_remarks": "點擊直接進入選集"
            }
        ],
        "page": 1,
        "pagecount": 1,
        "limit": 20,
        "total": 1
    })

@app.route("/play")
def play():
    # 🛠️ 這裡請塞入你原本實作好的 M3U8 暴力解密代碼！
    # 也就是回傳 {"url": "xxx.m3u8", "parse": 0, "header": {...}} 的那段。
    pass

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
