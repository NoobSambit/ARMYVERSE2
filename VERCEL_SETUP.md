# Vercel Deployment Setup Guide

## Environment Variables Required

Add these environment variables in your Vercel dashboard (Settings → Environment Variables):

### Database
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/armyverse?retryWrites=true&w=majority
```

### Spotify API
```
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://your-domain.vercel.app/api/spotify/callback
NEXT_PUBLIC_SPOTIFY_SCOPES=user-read-private user-read-email user-top-read user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private
```

### YouTube API
```
YOUTUBE_API_KEY=your-youtube-api-key
NEXT_PUBLIC_YT_THUMB_CDN=ytimg.com
```

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Firebase Admin SDK (CRITICAL - This was missing!)
```
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----\n
```

### Cloudinary (for blog image uploads)
```
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## How to Get Firebase Admin SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Click **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. Extract the values:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters)

## Important Notes

- **FIREBASE_PRIVATE_KEY** must include the `\n` characters for line breaks
- Make sure to set the **NEXT_PUBLIC_SPOTIFY_REDIRECT_URI** to your actual Vercel domain
- All environment variables are case-sensitive
- After adding variables, redeploy your app

## Deployment Steps

1. Add all environment variables in Vercel dashboard
2. Push your code to trigger a new deployment
3. Test the profile functionality to ensure Firebase Admin SDK is working
