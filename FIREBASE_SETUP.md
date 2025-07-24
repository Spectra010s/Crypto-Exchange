# 🔥 Firebase Setup Guide

## 🚨 Common Issues & Solutions

### ❌ "Auth domain not found" Error

This error typically occurs when:
1. **Domain not authorized** in Firebase Console
2. **Incorrect auth domain** in configuration
3. **Google Sign-in not enabled** in Firebase Console

## 📋 Complete Setup Steps

### 1. Firebase Console Configuration

#### A. Project Settings
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new one)
3. Go to **Project Settings** (⚙️ gear icon)
4. Scroll to **Your apps** section
5. Select your web app or add new web app

#### B. Get Configuration
Copy these values from Firebase Console:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com", // ⚠️ Critical!
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-ABCDEF1234"
};
```

### 2. Authentication Setup

#### A. Enable Authentication
1. Go to **Authentication** > **Get started**
2. Click **Sign-in method** tab
3. Enable these providers:
   - ✅ **Email/Password** - Click and enable
   - ✅ **Google** - Click, enable, and configure

#### B. Google Sign-in Configuration
1. Click on **Google** provider
2. Enable the toggle
3. **Project support email** - Select your email
4. **Save** the configuration

#### C. Authorized Domains
1. Go to **Authentication** > **Settings** tab
2. Scroll to **Authorized domains**
3. Add these domains:
   - `localhost` (for development)
   - `your-domain.com` (for production)
   - `your-vercel-app.vercel.app` (if using Vercel)

### 3. Environment Variables Setup

Create `.env.local` file in your project root:

```bash
# Get these from Firebase Console > Project Settings > General > Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
```

### 4. Google Cloud Console (for Google Sign-in)

#### A. OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **OAuth consent screen**
4. Configure consent screen:
   - **App name**: Your app name
   - **User support email**: Your email
   - **Developer contact**: Your email

#### B. OAuth 2.0 Client IDs
1. Go to **APIs & Services** > **Credentials**
2. Find your OAuth 2.0 Client ID
3. Add authorized domains:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)

## 🔧 Troubleshooting Checklist

### ✅ Quick Fixes

1. **Clear browser cache** and cookies
2. **Restart development server**: `pnpm dev`
3. **Check environment variables** are loaded: `console.log(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)`

### ✅ Verification Steps

```javascript
// Add this to your component to debug
console.log("Firebase Config:", {
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});
```

### ✅ Common Errors & Solutions

| Error | Solution |
|-------|----------|
| `auth domain not found` | Check authorized domains in Firebase Console |
| `popup blocked` | Allow popups or use redirect method |
| `invalid api key` | Verify API key in environment variables |
| `project not found` | Check project ID matches Firebase Console |

## 🚀 Testing Authentication

### 1. Test Email/Password
```bash
# Create test account
email: test@example.com
password: TestPassword123!
```

### 2. Test Google Sign-in
- Click "Continue with Google"
- Should open Google popup
- Select account and authorize

## 📱 Production Deployment

### Vercel
1. Add environment variables in Vercel dashboard
2. Add Vercel domain to Firebase authorized domains
3. Redeploy application

### Other Platforms
1. Set environment variables in platform
2. Add domain to Firebase authorized domains
3. Update OAuth consent screen if needed

## 🆘 Still Having Issues?

1. **Check Firebase Console logs**: Authentication > Events
2. **Browser console errors**: F12 > Console tab
3. **Network tab**: Check for failed requests
4. **Firebase status**: [Firebase Status Page](https://status.firebase.google.com/)

## 📞 Contact Support

If you're still experiencing issues:
1. Check Firebase documentation
2. Firebase community forums
3. Stack Overflow with `firebase` tag