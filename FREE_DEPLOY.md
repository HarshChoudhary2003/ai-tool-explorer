# How to Deploy for FREE (No BS Guide)

You can host this entire app for **$0** using Vercel (Frontend) and Supabase (Backend).

## 1. Push Code to GitHub
1. Create a new repository on [GitHub.com](https://github.com/new).
2. Run these commands in your terminal to upload your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```

## 2. Deploy Backend (Supabase)
Check if your live Supabase database actually has tables. 
- **If YES:** Skip to step 3.
- **If NO:** Go to your Supabase Dashboard > SQL Editor > New Query.
- Copy the content of `supabase/migrations/20251206071211_...sql` and Paste it there. Click **Run**.

**Deploy the Edge Function (Recommendation Engine):**
Run this in your terminal:
```bash
npx supabase logins
npx supabase link --project-ref sdpaofrxayalnatcxfzu
npx supabase functions deploy recommend-tools --no-verify-jwt
```
*Note: If `npx` fails, just copy the code from `supabase/functions/recommend-tools/index.ts` and paste it into the Supabase Dashboard > Edge Functions > Create new function named `recommend-tools`.*

## 3. Deploy Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com/signup) and sign up with GitHub.
2. Click **"Add New Project"** and select your GitHub repo.
3. In **Environment Variables section**, add these two from your `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Click **Deploy**.

**That's it. Your app is live.**
