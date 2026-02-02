# Deployment Guide

## Overview

This project is automatically deployed to GitHub Pages using GitHub Actions. The deployment process is triggered by pushes to the `main` branch.

## How Deployment Works

The repository uses a modern GitHub Actions workflow (`.github/workflows/deploy-storybook.yml`) that:

1. **Triggers** on every push to the `main` branch
2. **Build Job**: Builds the React application using `npm run build`
3. **Artifact Upload**: Uploads the `./dist` folder as a GitHub Pages artifact
4. **Deploy Job**: Deploys the artifact to GitHub Pages using the modern Pages deployment action
5. **Publishes** the site to `https://<username>.github.io/<repository-name>/`

### Workflow Architecture

The workflow uses a two-job architecture:
- **Build Job**: Creates the production build and uploads it as an artifact
- **Deploy Job**: Downloads the artifact and deploys it to GitHub Pages

This approach provides better isolation, faster builds, and more reliable deployments.

## How to Redeploy After a Push

There are several ways to trigger a redeployment:

### Method 1: Push New Changes (Recommended)

The easiest way to redeploy is to push any change to the `main` branch:

```bash
# Make a small change (e.g., update documentation or add a comment)
git add .
git commit -m "Trigger redeploy"
git push origin main
```

### Method 2: Re-run the Failed Workflow (If Deployment Failed)

If a previous deployment failed and you want to retry without making code changes:

1. Go to your repository on GitHub: `https://github.com/DHCross/pathfinder-1st-edition-validator`
2. Click on the **Actions** tab
3. Find the failed workflow run
4. Click **Re-run jobs** → **Re-run all jobs**

### Method 3: Empty Commit

If you need to trigger a redeploy of the exact same code without making changes:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

This creates an empty commit that triggers the workflow without changing any files.

### Method 4: Manual Workflow Trigger (If Configured)

To enable manual deployment triggers, you can update the workflow file to include `workflow_dispatch`:

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:  # Add this line
```

After adding this, you can:
1. Go to **Actions** tab on GitHub
2. Select **Build & Deploy PF1e Workbench** workflow
3. Click **Run workflow** button
4. Choose the `main` branch
5. Click **Run workflow**

## Monitoring Deployments

### Check Deployment Status

1. Go to the **Actions** tab on GitHub
2. Look for the most recent workflow run
3. Status indicators:
   - ✅ **Green checkmark** - Deployment successful
   - ❌ **Red X** - Deployment failed
   - 🟡 **Yellow circle** - Deployment in progress

### View Deployment Logs

1. Click on a workflow run
2. You'll see two separate jobs:
   - **build**: Shows the build process and artifact upload
   - **deploy**: Shows the Pages deployment process
3. Expand each step to see detailed logs

### Understanding Job Status

- **Build Job**: If this fails, check for TypeScript errors, missing dependencies, or build configuration issues
- **Deploy Job**: If this fails, check for permissions issues, Pages configuration, or artifact problems

### Access the Deployed Site

After a successful deployment, your site will be available at:
```
https://dhcross.github.io/pathfinder-1st-edition-validator/
```

**Note:** It may take a few minutes for changes to appear after deployment completes.

## Troubleshooting

### Deployment Failed

If deployment fails:

1. Check the workflow logs in the Actions tab
2. Common issues:
   - **Build errors**: Fix TypeScript/compilation errors in your code
   - **Test failures**: Ensure all tests pass locally with `npm test`
   - **Dependencies**: Run `npm ci` locally to verify dependencies install correctly
   - **Permissions**: Ensure the repository has GitHub Pages enabled with proper permissions
   - **Missing .nojekyll file**: For non-Jekyll sites, add an empty `.nojekyll` file to the root
   - **Artifact errors**: Ensure the build job completes successfully and uploads the artifact
   - **Pages permissions**: Verify the workflow has `pages: write` and `id-token: write` permissions

### Common Modern Workflow Issues

#### "No artifacts named 'github-pages' were found"
- **Cause**: The build job failed or didn't upload the artifact
- **Fix**: Check the build job logs for errors, ensure `npm run build` succeeds

#### "Site contained a symlink that should be dereferenced"
- **Cause**: Build output contains symbolic links
- **Fix**: Configure build process to resolve symlinks or remove them

#### "Pages is not enabled for this repository"
- **Cause**: GitHub Pages not configured in repository settings
- **Fix**: Go to Settings → Pages → Enable GitHub Pages

### Changes Not Appearing

If you pushed to `main` but don't see changes:

1. Verify the workflow completed successfully (green checkmark in Actions)
2. Clear your browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check that you're viewing the correct URL
4. Wait a few minutes - GitHub Pages can have a slight delay

### GitHub Pages Not Enabled

If GitHub Pages is not set up:

1. Go to repository **Settings**
2. Navigate to **Pages** in the left sidebar
3. Under **Source**, select **GitHub Actions** (recommended for modern workflows)
4. Click **Save**

**Note**: The modern workflow uses GitHub Actions deployment, not branch deployment. Selecting "GitHub Actions" as the source allows the workflow to manage the deployment automatically.

## Local Development vs Production

### Local Development
```bash
npm run dev           # Start Vite dev server
npm run storybook     # Start Storybook on port 6006
```

### Production Build (Test Locally)
```bash
npm run build         # Build the app
npm run preview       # Preview the production build locally
```

This lets you test the production build before deploying.

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass: `npm test`
- [ ] Code builds successfully: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Preview the production build: `npm run preview`
- [ ] Review changes in the pull request
- [ ] Merge PR to `main` branch
- [ ] Monitor the deployment in GitHub Actions
- [ ] Verify the deployed site works as expected

## Quick Reference

| Action | Command |
|--------|---------|
| Trigger redeploy | Push any change to `main` |
| Empty commit redeploy | `git commit --allow-empty -m "Trigger redeploy" && git push origin main` |
| Check deployment status | Visit GitHub Actions tab |
| View deployed site | `https://dhcross.github.io/pathfinder-1st-edition-validator/` |
| Test build locally | `npm run build && npm run preview` |

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
