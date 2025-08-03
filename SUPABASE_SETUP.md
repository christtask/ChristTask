# Supabase Environment Setup Guide

## 🔧 Environment Variables Required

Your project requires these environment variables to be set for Supabase authentication to work:

### Required Variables:
```bash
VITE_SUPABASE_URL=YOUR_ACTUAL_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_ACTUAL_ANON_KEY
```

## 🚨 Current Issues Identified

### 1. Missing Environment Variables
- **Problem**: Environment variables are not set in production
- **Effect**: Client falls back to mock client, causing 401 errors
- **Solution**: Set variables in Vercel dashboard

### 2. Authentication Flow Issues
- **Problem**: Mock client returns authentication errors when env vars missing
- **Effect**: Users can't sign up/sign in
- **Solution**: Ensure environment variables are properly configured

## 🔧 Setup Instructions

### For Local Development:
1. Create `.env.local` file in project root
2. Add the variables above
3. Restart your development server

### For Production (Vercel):
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add both variables with the values above
4. Redeploy your application

## 🧪 Testing

Use the `SupabaseTest` component to verify your setup:
1. Check environment variables are present
2. Test basic connection
3. Test authentication endpoints

## 📝 Notes

- The hardcoded credentials in `test-supabase.html` match your actual Supabase project
- Make sure to use the **anon key** (public key), not the service role key
- Environment variables must be prefixed with `VITE_` for Vite to expose them to the client 