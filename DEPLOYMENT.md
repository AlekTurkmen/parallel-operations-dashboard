# Deployment Guide for Operations UI

This guide will walk you through deploying this application to GitHub and Vercel with a custom domain.

## 1. Push to GitHub

### Create a new repository on GitHub
1. Go to https://github.com/new
2. Name your repository `operations-ui`
3. Leave it as a public repository if you want to use Vercel's free tier
4. Click "Create repository"

### Push your local repository to GitHub
Run the following commands in your terminal:

```bash
# Add the remote repository
git remote add origin https://github.com/alekturkmen/operations-ui.git

# Push your code to the main branch
git push -u origin main
```

## 2. Deploy to Vercel

### Connect to Vercel
1. Go to https://vercel.com/
2. Sign up or log in (you can use your GitHub account)
3. Click "New Project"
4. Select the `operations-ui` repository
5. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `app`
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. Add Environment Variables:
   - Add any environment variables from your `.env` file (e.g., `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

7. Click "Deploy"

### Set up custom domain
1. After deployment, go to the project settings
2. Navigate to the "Domains" tab
3. Add your domain: `parallel.alekturkmen.com`
4. Follow the instructions to configure DNS settings:
   - Add a CNAME record pointing to `cname.vercel-dns.com`
   - Or use Vercel as your nameserver for automatic DNS configuration

5. Wait for DNS propagation (can take up to 48 hours, but usually much faster)

## 3. Verify the Deployment

1. Visit your custom domain: `https://parallel.alekturkmen.com`
2. Verify that all functionality works as expected
3. Check the console for any errors

## 4. Continuous Deployment

Vercel automatically deploys your application whenever you push changes to the GitHub repository.

To deploy updates:
```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will automatically detect the push and deploy the updated version.

## Troubleshooting

If you encounter any issues during deployment:

1. Check Vercel's deployment logs for errors
2. Verify that your environment variables are correctly set
3. Make sure your DNS settings are properly configured for the custom domain
4. Check that your project structure matches the configuration in vercel.json 