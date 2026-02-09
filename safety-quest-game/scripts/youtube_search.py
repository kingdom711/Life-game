"""
YouTube 안전교육 영상 검색 스크립트
====================================
Google YouTube Data API v3를 사용하여 산업안전 교육 영상을 검색합니다.

사용법:
    python youtube_search.py                          # 기본 안전교육 카테고리 전체 검색
    python youtube_search.py -q "끼임 예방"            # 특정 키워드 검색
    python youtube_search.py -c pinch                  # 카테고리별 검색
    python youtube_search.py -q "추락 예방" -n 10      # 결과 개수 지정
    python youtube_search.py --list-categories         # 카테고리 목록 보기

환경변수:
    YOUTUBE_API_KEY: Google API 키 (필수)
    - Google Cloud Console(https://console.cloud.google.com)에서 발급
    - YouTube Data API v3 활성화 필요
"""

import argparse
import io
import json
import os
import sys
from datetime import datetime

# Windows cp949 인코딩 이슈 방지 (이모지 등 유니코드 출력)
if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

try:
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("[오류] google-api-python-client가 설치되지 않았습니다.")
    print("  설치: pip install google-api-python-client")
    sys.exit(1)


# 안전교육 카테고리별 검색 키워드
SAFETY_CATEGORIES = {
    "fall": {
        "name": "추락 예방",
        "keywords": [
            "산업안전 추락 예방 교육",
            "사다리 작업 안전 수칙",
            "고소작업 안전 교육",
            "개구부 추락 예방",
        ],
    },
    "collision": {
        "name": "부딪힘 예방",
        "keywords": [
            "지게차 충돌 예방 교육",
            "산업안전 부딪힘 예방",
            "작업장 충돌사고 예방",
        ],
    },
    "pinch": {
        "name": "끼임 예방",
        "keywords": [
            "기계 끼임 예방 교육",
            "산업안전 끼임사고 예방",
            "회전체 끼임 안전 교육",
            "LOTO 잠금장치 교육",
        ],
    },
    "fire": {
        "name": "화재 안전",
        "keywords": [
            "소화기 사용법 교육",
            "산업현장 화재 예방",
            "화재 대피 훈련",
        ],
    },
    "ppe": {
        "name": "개인보호구",
        "keywords": [
            "안전모 착용법 교육",
            "안전대 착용 점검",
            "개인보호구 착용 교육",
        ],
    },
    "electrical": {
        "name": "전기 안전",
        "keywords": [
            "전기 안전 교육",
            "감전사고 예방 교육",
            "전기 작업 안전수칙",
        ],
    },
    "confined": {
        "name": "밀폐공간",
        "keywords": [
            "밀폐공간 작업 안전 교육",
            "밀폐공간 질식사고 예방",
        ],
    },
    "chemical": {
        "name": "화학물질",
        "keywords": [
            "화학물질 안전 교육",
            "MSDS 교육",
            "유해화학물질 취급 안전",
        ],
    },
}


def load_env_file():
    """프로젝트 .env 파일에서 환경변수를 로드합니다."""
    # scripts/ 디렉토리의 상위 = 프로젝트 루트
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(project_root, ".env")

    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip()
                # 기존 환경변수가 없을 때만 .env 값 사용
                if key and key not in os.environ:
                    os.environ[key] = value


def get_api_key():
    """환경변수 또는 .env 파일에서 API 키를 가져옵니다."""
    load_env_file()
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        print("=" * 60)
        print("[오류] YOUTUBE_API_KEY가 설정되지 않았습니다.")
        print()
        print("프로젝트 루트의 .env 파일에 아래 항목을 추가하세요:")
        print("  YOUTUBE_API_KEY=YOUR_API_KEY")
        print()
        print("또는 환경변수로 직접 설정:")
        print("  Windows CMD:  set YOUTUBE_API_KEY=YOUR_API_KEY")
        print("  Windows PS:   $env:YOUTUBE_API_KEY='YOUR_API_KEY'")
        print("  Linux/Mac:    export YOUTUBE_API_KEY=YOUR_API_KEY")
        print("=" * 60)
        sys.exit(1)
    return api_key


def search_youtube(youtube, query, max_results=5):
    """YouTube에서 영상을 검색하고 결과를 반환합니다."""
    try:
        request = youtube.search().list(
            q=query,
            part="snippet",
            type="video",
            maxResults=max_results,
            order="relevance",
            relevanceLanguage="ko",
            videoDuration="medium",  # 4~20분 영상 (교육용 적합)
            safeSearch="strict",
        )
        response = request.execute()
        return response.get("items", [])
    except HttpError as e:
        print(f"[API 오류] {e}")
        return []


def get_video_details(youtube, video_ids):
    """영상의 상세 정보(조회수, 좋아요, 길이 등)를 가져옵니다."""
    if not video_ids:
        return {}

    try:
        request = youtube.videos().list(
            part="contentDetails,statistics",
            id=",".join(video_ids),
        )
        response = request.execute()

        details = {}
        for item in response.get("items", []):
            vid = item["id"]
            stats = item.get("statistics", {})
            content = item.get("contentDetails", {})
            details[vid] = {
                "duration": parse_duration(content.get("duration", "PT0S")),
                "viewCount": int(stats.get("viewCount", 0)),
                "likeCount": int(stats.get("likeCount", 0)),
            }
        return details
    except HttpError as e:
        print(f"[API 오류] 상세 정보 조회 실패: {e}")
        return {}


def parse_duration(duration_str):
    """ISO 8601 duration을 '분:초' 형식으로 변환합니다."""
    import re

    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration_str)
    if not match:
        return "알 수 없음"

    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)

    if hours > 0:
        return f"{hours}:{minutes:02d}:{seconds:02d}"
    return f"{minutes}:{seconds:02d}"


def format_view_count(count):
    """조회수를 읽기 쉬운 형태로 변환합니다."""
    if count >= 10000:
        return f"{count // 10000}만"
    elif count >= 1000:
        return f"{count / 1000:.1f}천"
    return str(count)


def print_results(results, details, query):
    """검색 결과를 포맷팅하여 출력합니다."""
    if not results:
        print(f"  '{query}'에 대한 검색 결과가 없습니다.\n")
        return []

    formatted = []
    for i, item in enumerate(results, 1):
        snippet = item["snippet"]
        video_id = item["id"]["videoId"]
        title = snippet["title"]
        channel = snippet["channelTitle"]
        published = snippet["publishedAt"][:10]
        url = f"https://www.youtube.com/watch?v={video_id}"

        detail = details.get(video_id, {})
        duration = detail.get("duration", "알 수 없음")
        views = format_view_count(detail.get("viewCount", 0))
        likes = detail.get("likeCount", 0)

        print(f"  [{i}] {title}")
        print(f"      채널: {channel} | 길이: {duration} | 조회수: {views} | 좋아요: {likes}")
        print(f"      게시일: {published}")
        print(f"      URL: {url}")
        print(f"      영상 ID: {video_id}")
        print()

        formatted.append({
            "title": title,
            "videoId": video_id,
            "channel": channel,
            "duration": duration,
            "viewCount": detail.get("viewCount", 0),
            "likeCount": likes,
            "publishedAt": published,
            "url": url,
        })

    return formatted


def search_by_category(youtube, category_key, max_results=5):
    """카테고리별로 검색을 수행합니다."""
    category = SAFETY_CATEGORIES.get(category_key)
    if not category:
        print(f"[오류] 알 수 없는 카테고리: {category_key}")
        print(f"  사용 가능: {', '.join(SAFETY_CATEGORIES.keys())}")
        return []

    print(f"\n{'=' * 60}")
    print(f"  카테고리: {category['name']}")
    print(f"{'=' * 60}\n")

    all_results = []
    for keyword in category["keywords"]:
        print(f"--- 검색: \"{keyword}\" ---\n")
        results = search_youtube(youtube, keyword, max_results)
        video_ids = [item["id"]["videoId"] for item in results]
        details = get_video_details(youtube, video_ids)
        formatted = print_results(results, details, keyword)
        all_results.extend(formatted)

    return all_results


def search_all_categories(youtube, max_results=3):
    """모든 카테고리를 순회하며 검색합니다."""
    all_results = {}
    for key, category in SAFETY_CATEGORIES.items():
        print(f"\n{'=' * 60}")
        print(f"  [{key.upper()}] {category['name']}")
        print(f"{'=' * 60}\n")

        category_results = []
        for keyword in category["keywords"][:2]:  # 카테고리당 상위 2개 키워드만
            print(f"--- 검색: \"{keyword}\" ---\n")
            results = search_youtube(youtube, keyword, max_results)
            video_ids = [item["id"]["videoId"] for item in results]
            details = get_video_details(youtube, video_ids)
            formatted = print_results(results, details, keyword)
            category_results.extend(formatted)

        all_results[key] = category_results

    return all_results


def save_results(results, filename=None):
    """검색 결과를 JSON 파일로 저장합니다."""
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"youtube_search_results_{timestamp}.json"

    output_path = os.path.join(os.path.dirname(__file__), filename)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n[저장 완료] {output_path}")
    return output_path


def main():
    parser = argparse.ArgumentParser(
        description="YouTube 안전교육 영상 검색 도구",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  python youtube_search.py -q "끼임 예방 교육"        특정 키워드 검색
  python youtube_search.py -c pinch                    카테고리별 검색
  python youtube_search.py -c pinch -n 10              결과 10개 출력
  python youtube_search.py --all                       전체 카테고리 검색
  python youtube_search.py -q "추락 예방" --save       결과를 JSON 저장
  python youtube_search.py --list-categories           카테고리 목록
        """,
    )

    parser.add_argument("-q", "--query", type=str, help="검색 키워드")
    parser.add_argument(
        "-c",
        "--category",
        type=str,
        choices=list(SAFETY_CATEGORIES.keys()),
        help="안전교육 카테고리",
    )
    parser.add_argument("-n", "--max-results", type=int, default=5, help="최대 결과 수 (기본: 5)")
    parser.add_argument("--all", action="store_true", help="전체 카테고리 검색")
    parser.add_argument("--save", action="store_true", help="결과를 JSON 파일로 저장")
    parser.add_argument("--list-categories", action="store_true", help="카테고리 목록 보기")

    args = parser.parse_args()

    # 카테고리 목록 출력
    if args.list_categories:
        print("\n안전교육 카테고리 목록:")
        print("-" * 40)
        for key, cat in SAFETY_CATEGORIES.items():
            keywords_str = ", ".join(cat["keywords"][:2])
            print(f"  {key:12s} | {cat['name']} ({keywords_str} ...)")
        print()
        return

    # API 키 확인 및 YouTube 서비스 빌드
    api_key = get_api_key()
    youtube = build("youtube", "v3", developerKey=api_key)

    print(f"\n  YouTube 안전교육 영상 검색")
    print(f"  검색 시각: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    results = None

    if args.query:
        # 키워드 직접 검색
        print(f"--- 검색: \"{args.query}\" ---\n")
        search_results = search_youtube(youtube, args.query, args.max_results)
        video_ids = [item["id"]["videoId"] for item in search_results]
        details = get_video_details(youtube, video_ids)
        results = print_results(search_results, details, args.query)

    elif args.category:
        # 카테고리별 검색
        results = search_by_category(youtube, args.category, args.max_results)

    elif args.all:
        # 전체 카테고리 검색
        results = search_all_categories(youtube, max_results=3)

    else:
        # 기본: 끼임 예방 카테고리 검색
        print("[기본 검색] 끼임 예방 교육 영상\n")
        results = search_by_category(youtube, "pinch", args.max_results)

    # JSON 저장
    if args.save and results:
        save_results(results)

    print("-" * 60)
    print("  검색 완료")
    print("-" * 60)


if __name__ == "__main__":
    main()
