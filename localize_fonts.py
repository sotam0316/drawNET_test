import os
import re
import requests

css_path = r'c:\project\drawNET\static\css\lib\google-fonts.css'
fonts_dir = r'c:\project\drawNET\static\fonts'

if not os.path.exists(fonts_dir):
    os.makedirs(fonts_dir)

with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

urls = re.findall(r'url\((https://fonts\.gstatic\.com/s/[^)]+)\)', content)
urls = list(set(urls)) # Unique URLs

url_map = {}
for i, url in enumerate(urls):
    filename = url.split('/')[-1]
    local_path = os.path.join(fonts_dir, filename)
    print(f"Downloading {url} -> {filename}")
    try:
        r = requests.get(url)
        if r.status_code == 200:
            with open(local_path, 'wb') as f:
                f.write(r.content)
            url_map[url] = f"/static/fonts/{filename}"
    except Exception as e:
        print(f"Failed to download {url}: {e}")

# Update CSS
new_content = content
for url, local_url in url_map.items():
    new_content = new_content.replace(url, local_url)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Google Fonts localized successfully.")
