#!/bin/bash

# Test script for the new trending section
# Make this executable with: chmod +x scripts/test-trending.sh

echo "🧪 Testing Trending Section Components"
echo "======================================="

BASE_URL="${1:-http://localhost:3000}"

echo ""
echo "📊 Testing Spotify Cron (Manual Trigger)..."
curl -X POST "$BASE_URL/api/spotify/kworb/cron" -s | jq '.'

echo ""
echo "📺 Testing YouTube Cron (Manual Trigger)..."
curl -X POST "$BASE_URL/api/youtube/kworb/cron" -s | jq '.'

echo ""
echo "✅ Fetching Latest Spotify Snapshot..."
curl -X GET "$BASE_URL/api/spotify/kworb/latest" -s | jq '.ok, .snapshot.dateKey, (.snapshot.songsByArtist | length)'

echo ""
echo "✅ Fetching Latest YouTube Snapshot..."
curl -X GET "$BASE_URL/api/youtube/kworb/latest" -s | jq '.ok, .snapshot.dateKey, (.snapshot.artistGroups | length)'

echo ""
echo "🎵 Testing Top Songs API - BTS Spotify..."
curl -X GET "$BASE_URL/api/trending/top-songs?platform=spotify&category=ot7" -s | jq '.ok, .artist, (.songs | length)'

echo ""
echo "🎵 Testing Top Songs API - Jungkook Spotify..."
curl -X GET "$BASE_URL/api/trending/top-songs?platform=spotify&category=solo&member=Jungkook" -s | jq '.ok, .artist, (.songs | length)'

echo ""
echo "🎵 Testing Top Songs API - BTS YouTube..."
curl -X GET "$BASE_URL/api/trending/top-songs?platform=youtube&category=ot7" -s | jq '.ok, .artist, (.songs | length)'

echo ""
echo "🎵 Testing Top Songs API - V YouTube..."
curl -X GET "$BASE_URL/api/trending/top-songs?platform=youtube&category=solo&member=V" -s | jq '.ok, .artist, (.songs | length)'

echo ""
echo "✨ All tests complete!"
echo ""
echo "Next steps:"
echo "1. Check the output above for any errors"
echo "2. Visit $BASE_URL to see the new trending section"
echo "3. Toggle between OT7 and Solo modes"
echo "4. Select different members in Solo mode"
