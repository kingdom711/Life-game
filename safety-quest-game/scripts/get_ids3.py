import urllib.request
import urllib.parse
import re

queries = [
    "화재감시자 역할 및 의무",
    "용접·용단 작업 화재 예방 수칙",
    "산업현장 화재 폭발 재해예방",
    "소화기구를 활용한 초기 화재 진압 요령",
    "화재 발생 시 비상 대피 및 피난 요령",
    "동절기 건설현장 난방기구 화재예방",
    "관리감독자의 역할과 임무 안전보건교육",
    "사업주와 근로자가 함께하는 위험성평가",
    "쉽게 알아보는 산업안전보건법",
    "중대재해처벌법의 이해와 안전보건관리체계",
    "앗차사고 발굴 우수 사례 및 활동",
    "안전보건관리책임자 및 안전관리자 현장 점검 요령",
    "작업 전 안전점검 TBM 실시 요령",
    "안전문화 정착을 위한 리더십"
]

with open("ids5.txt", "w", encoding="utf-8") as f:
    for q in queries:
        search_url = "https://www.youtube.com/results?search_query=" + urllib.parse.quote("안전보건공단 " + q)
        try:
            req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
            html = urllib.request.urlopen(req).read().decode('utf-8')
            video_ids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
            if video_ids:
                unique_ids = []
                for vid in video_ids:
                    if vid not in unique_ids:
                        unique_ids.append(vid)
                f.write(f"QUERY: {q}  --> ID: {unique_ids[0]}\n")
            else:
                f.write(f"QUERY: {q}  --> ID: NOT FOUND\n")
        except Exception as e:
            f.write(f"QUERY: {q}  --> ERROR: {str(e)}\n")
