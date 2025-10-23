# YouTube Trending Section Troubleshooting

## Issue: "No songs available" showing for YouTube

### Step 1: Check if YouTube cron has run

Visit the debug page: `http://localhost:3001/test-trending`

This will show you:
- ✅ If YouTube database has data
- ✅ If Spotify database has data  
- ✅ What the APIs are returning
- ✅ Quick action buttons to trigger crons

### Step 2: Manually trigger the YouTube cron

**Option A: Using curl**
```bash
curl -X POST http://localhost:3001/api/youtube/kworb/cron
```

**Option B: Using the test page**
1. Visit `http://localhost:3001/test-trending`
2. Click "Trigger YouTube Cron" button
3. Wait 10-30 seconds for scraping to complete
4. Refresh the page

### Step 3: Verify data was scraped

Check the latest snapshot:
```bash
curl http://localhost:3001/api/youtube/kworb/latest
```

You should see:
```json
{
  "ok": true,
  "snapshot": {
    "dateKey": "2025-10-23",
    "artistGroups": [...]
  }
}
```

### Step 4: Test the API directly

```bash
# Test BTS (OT7)
curl "http://localhost:3001/api/trending/top-songs?platform=youtube&category=ot7&member=BTS"

# Test Jungkook (Solo)
curl "http://localhost:3001/api/trending/top-songs?platform=youtube&category=solo&member=Jungkook"
```

Expected response:
```json
{
  "ok": true,
  "platform": "youtube",
  "category": "ot7",
  "artist": "BTS",
  "songs": [
    {
      "rank": 1,
      "title": "BTS (방탄소년단) 'Dynamite' Official MV",
      "artist": "BTS",
      "thumbnail": "https://i.ytimg.com/vi/gdZLi9oWNZg/maxresdefault.jpg",
      "url": "https://www.youtube.com/watch?v=gdZLi9oWNZg",
      "yesterday": 553684,
      "views": 2006334400
    },
    ...
  ]
}
```

### Step 5: Check browser console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for logs starting with "YouTube API Response:"
4. Look for logs starting with "TopSongsGrid [youtube]:"

### Common Issues & Solutions

#### Issue: "YouTube API returned no songs or error"

**Cause:** Database not populated

**Solution:**
```bash
# Trigger the cron job
curl -X POST http://localhost:3001/api/youtube/kworb/cron

# Wait 30 seconds, then check
curl http://localhost:3001/api/youtube/kworb/latest
```

#### Issue: "Failed to fetch https://kworb.net..."

**Cause:** Network issue or rate limiting

**Solution:**
- Wait a few minutes and try again
- Check your internet connection
- kworb.net might be temporarily down

#### Issue: Images not loading

**Cause:** Next.js image domains not configured

**Solution:** Already configured in `next.config.js`:
```javascript
{
  protocol: 'https',
  hostname: 'i.ytimg.com',
  port: '',
  pathname: '/**',
}
```

If still not working, restart the dev server:
```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

#### Issue: Data showing in API but not in UI

**Cause:** React state not updating or component cache

**Solution:**
1. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for JavaScript errors
4. Restart dev server

### Debugging Checklist

- [ ] YouTube cron has run successfully
- [ ] `/api/youtube/kworb/latest` returns data
- [ ] `/api/trending/top-songs?platform=youtube&category=ot7` returns songs
- [ ] Browser console shows "YouTube API Response" with songs
- [ ] Browser console shows "TopSongsGrid [youtube]: Received X songs"
- [ ] No JavaScript errors in console
- [ ] Next.js image domains include `i.ytimg.com`
- [ ] Dev server is running without errors

### Still Not Working?

1. **Check MongoDB connection**
   ```bash
   # Make sure MONGODB_URI is set in .env.local
   echo $MONGODB_URI
   ```

2. **Check database directly**
   Visit: `http://localhost:3001/api/debug/trending`

3. **Full reset**
   ```bash
   # Stop the server
   # Clear Next.js cache
   rm -rf .next
   
   # Reinstall dependencies
   npm install
   
   # Restart
   npm run dev
   
   # Trigger both crons
   curl -X POST http://localhost:3001/api/spotify/kworb/cron
   curl -X POST http://localhost:3001/api/youtube/kworb/cron
   ```

4. **Check server logs**
   Look at the terminal where `npm run dev` is running for any error messages

### Production Deployment

For production (Vercel):

1. **Set environment variables**
   - `MONGODB_URI`
   - `CRON_SECRET`

2. **Set up cron jobs** in `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/spotify/kworb/cron",
         "schedule": "0 6 * * *"
       },
       {
         "path": "/api/youtube/kworb/cron",
         "schedule": "0 6 * * *"
       }
     ]
   }
   ```

3. **Manually trigger first run**:
   ```bash
   curl -X POST https://your-domain.com/api/youtube/kworb/cron \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### Success Indicators

When everything is working correctly:

1. ✅ `/test-trending` shows both databases have data
2. ✅ YouTube section shows 6 songs in a grid
3. ✅ #1 song is displayed in a 2x2 larger box
4. ✅ All thumbnails load properly
5. ✅ External links work when clicked
6. ✅ Switching between OT7 and Solo works
7. ✅ Selecting different members shows their songs
8. ✅ Browser console shows no errors

### Contact

If none of these solutions work, check:
- Next.js version compatibility
- Node.js version (should be 18+)
- MongoDB connection and credentials
- Network/firewall settings blocking kworb.net

## Quick Test Command

Run this to test everything at once:
```bash
#!/bin/bash
echo "Testing YouTube Trending..."
curl -s -X POST http://localhost:3001/api/youtube/kworb/cron && echo "✅ Cron triggered"
sleep 5
curl -s http://localhost:3001/api/youtube/kworb/latest | grep -q "artistGroups" && echo "✅ Data exists" || echo "❌ No data"
curl -s "http://localhost:3001/api/trending/top-songs?platform=youtube&category=ot7" | grep -q "Dynamite" && echo "✅ API works" || echo "❌ API failed"
```
