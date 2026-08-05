import json, urllib.request
video_id = '03115cf24b734d7da6dc338bb730ab41'
url = f'http://127.0.0.1:8001/api/v1/pose-result/{video_id}'
with urllib.request.urlopen(url, timeout=20) as r:
    data = json.load(r)
print(json.dumps(data, indent=2)[:20000])
