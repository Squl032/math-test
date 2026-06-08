#!/bin/bash
# 把根目錄不再需要的舊檔案移到 temp/ 資料夾
# 素材已複製到 mobs/ 子資料夾，根目錄的舊版可以歸檔
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

mkdir -p temp

mv -v avatar.png           temp/ 2>/dev/null
mv -v avatar.jpeg          temp/ 2>/dev/null
mv -v chase.mp3            temp/ 2>/dev/null
mv -v MJ.png               temp/ 2>/dev/null
mv -v MJ-chase.mp3         temp/ 2>/dev/null
mv -v obunga.png           temp/ 2>/dev/null
mv -v obunga-chase.mp3     temp/ 2>/dev/null
mv -v mug-shot-michael-jackson.gif temp/ 2>/dev/null
mv -v setup.sh             temp/ 2>/dev/null

echo ""
echo "✅ 完成。根目錄現在只剩 index.html, style.css, bgm1.mp3, js/, mobs/"
echo "   舊檔案已移至 temp/ — 確認沒問題後可直接刪除 temp/ 資料夾。"
