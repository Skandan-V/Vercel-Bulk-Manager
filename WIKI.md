# Vercel Bulk Deployment Manager - Wiki

## Table of Contents

1. [Getting Started](#getting-started)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Features](#features)
5. [Usage Guide](#usage-guide)
6. [API Integration](#api-integration)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Features](#advanced-features)
9. [Security](#security)
10. [Contributing](#contributing)

---

## Getting Started

### What is Vercel Bulk Deployment Manager?

Vercel Bulk Deployment Manager is a powerful web application that allows you to manage multiple Vercel deployments and projects efficiently. Built by **Skandan V** for **Hyperdyn**, this tool streamlines your deployment workflow by enabling bulk operations that would otherwise require multiple manual actions.

### Key Benefits

- ⚡ **Save Time**: Delete multiple deployments or projects in one action
- 🎯 **Smart Filtering**: Filter deployments by branch, state, date range, and search
- 🔒 **Secure**: Your API token is stored locally in your browser
- 📱 **Mobile Ready**: Fully responsive design works on all devices
- 🌙 **Dark Mode**: Beautiful dark/light theme support

---

## Installation

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager
- A Vercel account with API access

### Step 1: Clone the Repository

```bash
git clone https://github.com/skandan-v/vercel-bulk-manager.git
cd vercel-bulk-manager
```

### Step 2: Install Dependencies

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Step 4: Build for Production

```bash
npm run build
```

The production build will be created in the `dist` folder.

---

## Configuration

### Obtaining a Vercel API Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a descriptive name (e.g., "Bulk Manager")
4. Select the appropriate scope (Full Account recommended)
5. Copy the generated token
6. **Important**: Store this token securely - you won't be able to see it again

### Setting Up the Token in the App

1. Open the Vercel Bulk Deployment Manager
2. Paste your API token in the input field
3. Click "Save Token"
4. Your token is stored locally in `localStorage` - it never leaves your browser

### Environment Variables (Optional)

For production deployments, you can set:

```bash
# .env.local
VITE_API_BASE_URL=https://api.vercel.com
```

---

## Features

### 1. Bulk Delete Deployments

Delete multiple deployments at once instead of one-by-one.

**Benefits:**
- Clean up old preview deployments
- Remove failed builds quickly
- Maintain a tidy deployment history

### 2. Bulk Delete Projects

Remove multiple projects simultaneously.

**Use Cases:**
- Clean up test projects
- Remove client projects after handoff
- Archive old experiments

### 3. Smart Filtering

Filter deployments using multiple criteria:

- **Search**: Find deployments by URL or commit message
- **Branch**: Filter by Git branch name
- **State**: Show only READY, ERROR, BUILDING, or QUEUED deployments
- **Date Range**: Filter by deployment creation date

### 4. Environment Variables Management

View and manage environment variables for your projects:

- List all environment variables
- See values and targets (Production/Preview/Development)
- Manage secrets securely

### 5. Deployment Actions

Individual deployment actions:

- **Promote**: Promote a deployment to production
- **Redeploy**: Trigger a new deployment
- **View Logs**: Check deployment logs
- **Delete**: Remove a single deployment

### 6. Project Management

- View all your Vercel projects
- See framework information
- Check creation and update dates
- Direct links to Vercel dashboard

---

## Usage Guide

### Viewing Deployments

1. **Select a View Mode**:
   - Click "Manage Deployments" to view deployments for a specific project
   - Click "Manage Projects" to view all projects

2. **Choose a Project** (for deployment view):
   - Select a project from the dropdown
   - Deployments will load automatically

3. **Apply Filters** (optional):
   - Click the "Filters" button
   - Set your filtering criteria
   - See active filter count in the badge

### Deleting Deployments

1. Select deployments using checkboxes
2. Click "Delete Selected (X)" button
3. Confirm the deletion in the dialog
4. Wait for the deletion to complete
5. View success/error notifications

**Tip**: Use "Select All" checkbox to quickly select all visible deployments.

### Deleting Projects

1. Switch to "Manage Projects" view
2. Select projects using checkboxes
3. Click "Delete Selected (X)" button
4. **Warning**: This will delete all deployments, domains, and environment variables
5. Confirm the action
6. Projects will be deleted permanently

### Using Filters

#### Search Filter
Type in the search box to filter by:
- Deployment URL
- Git commit message

#### Branch Filter
Select a specific branch or "All Branches" to filter deployments.

#### State Filter
Choose deployment states:
- **READY**: Successfully deployed
- **ERROR**: Failed deployments
- **BUILDING**: Currently building
- **QUEUED**: Waiting to build
- **All States**: Show everything

#### Date Range Filter
1. Click the date range picker
2. Select start date (optional)
3. Select end date (optional)
4. Deployments within the range will be shown

---

## API Integration

### Vercel API Endpoints Used

The app integrates with the following Vercel API endpoints:

#### Projects
```
GET /v9/projects
GET /v9/projects/:id
DELETE /v9/projects/:id
GET /v9/projects/:id/env
```

#### Deployments
```
GET /v6/deployments?projectId=:id
DELETE /v13/deployments/:id
POST /v13/deployments/:id/promote
POST /v13/deployments (redeploy)
GET /v2/deployments/:id/events (logs)
```

#### User
```
GET /v2/user
```

### Authentication

All requests include the Bearer token:

```javascript
headers: {
  Authorization: `Bearer ${token}`
}
```

### Rate Limiting

Vercel API has rate limits. The app handles them by:
- Using `Promise.allSettled` for bulk operations
- Showing success/failure counts
- Allowing partial completions

---

## Troubleshooting

### Issue: "Failed to fetch projects"

**Possible Causes:**
- Invalid API token
- Token doesn't have required permissions
- Network connectivity issues

**Solutions:**
1. Verify your API token is correct
2. Generate a new token with Full Account access
3. Check your internet connection

### Issue: "Project links not working"

**Problem:** Links show as `https://vercel.com/dashboard/projects/prj_xxx`

**Solution:**
The app automatically fetches your Vercel username to generate correct URLs like `https://vercel.com/username/project-name`. If this fails, clear your localStorage and re-enter your token.

### Issue: "Table not scrolling on mobile"

**Solution:**
The tables are wrapped in scrollable containers. Swipe horizontally to view all columns.

### Issue: "Deployments not loading"

**Check:**
1. Is a project selected in the dropdown?
2. Does the project have any deployments?
3. Check browser console for errors
4. Verify API token is still valid

### Issue: "Dark mode not working"

**Solution:**
The theme is stored in localStorage. Try:
1. Toggle the theme button
2. Clear browser cache
3. Check system preferences

---

## Advanced Features

### Environment Variables

#### Viewing Environment Variables

1. Select a project
2. Click "Environment Variables" tab
3. View all variables with their:
   - Key
   - Value (masked by default)
   - Target (Production/Preview/Development)

#### Managing Variables

Currently view-only. To add/edit/delete:
- Use the Vercel Dashboard
- Or use the Vercel CLI

**Future Feature**: Full CRUD operations for environment variables

### Deployment Promotion

Promote any successful deployment to production:

1. Find the deployment you want to promote
2. Click the three-dot menu
3. Select "Promote to Production"
4. Confirm the action

### Redeployment

Trigger a new deployment with the same configuration:

1. Click the three-dot menu on any deployment
2. Select "Redeploy"
3. A new deployment will be created

### Viewing Logs

Check deployment logs for debugging:

1. Click the three-dot menu
2. Select "View Logs"
3. Logs will open in a dialog

---

## Security

### Token Storage

- **Location**: Browser's `localStorage`
- **Encryption**: Not encrypted (stored in plain text locally)
- **Transmission**: Never sent to any server except Vercel API
- **Removal**: Cleared when you click "Remove Token"

### Best Practices

1. **Use Scoped Tokens**: Create tokens with minimum required permissions
2. **Rotate Regularly**: Generate new tokens periodically
3. **Don't Share**: Never share your API token
4. **Revoke if Compromised**: Delete tokens immediately if exposed
5. **Use on Trusted Devices**: Only use on your personal devices

### Data Privacy

- ✅ No analytics or tracking
- ✅ No data sent to third-party services
- ✅ All operations happen client-side
- ✅ Direct communication with Vercel API only

---

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow existing code formatting
- Add comments for complex logic
- Keep components small and focused

### Testing

Before submitting a PR:

1. Test all features manually
2. Check mobile responsiveness
3. Verify dark/light themes
4. Test error handling
5. Check for TypeScript errors: `npm run build`

### Reporting Issues

Found a bug? [Open an issue](https://github.com/skandan-v/vercel-bulk-manager/issues) with:

- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser and OS information

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl/Cmd + K` | Focus search |
| `Esc` | Close dialogs |
| `Space` | Toggle checkbox (when focused) |
| `Tab` | Navigate between elements |

---

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | Latest 2 | ✅ Full |
| Firefox | Latest 2 | ✅ Full |
| Safari | Latest 2 | ✅ Full |
| Edge | Latest 2 | ✅ Full |
| Opera | Latest 2 | ✅ Full |

**Note**: Internet Explorer is not supported.

---

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Date Handling**: date-fns
- **Theme**: next-themes

---

## Roadmap

### Planned Features

- [ ] Full environment variable CRUD operations
- [ ] Deployment analytics and insights
- [ ] Export deployment data (CSV/JSON)
- [ ] Bulk deployment promotion
- [ ] Team management features
- [ ] Custom domain management
- [ ] Webhook integration
- [ ] Scheduled deployment cleanup
- [ ] Multi-account support
- [ ] Deployment comparison tool

---

## FAQ

### Q: Is this an official Vercel tool?

**A:** No, this is an independent tool created by Skandan V for Hyperdyn. It uses the official Vercel API.

### Q: Can I use this with team accounts?

**A:** Yes, as long as your API token has the required permissions for team resources.

### Q: Does this work with Vercel Pro/Enterprise?

**A:** Yes, it works with all Vercel plan types.

### Q: Can I recover deleted deployments?

**A:** No, deletions are permanent. Always double-check before confirming bulk deletions.

### Q: Is there a deployment limit?

**A:** The app can handle any number of deployments, but Vercel API rate limits may apply for very large operations.

### Q: Can I use this offline?

**A:** No, it requires an internet connection to communicate with the Vercel API.

### Q: How do I update the app?

**A:** Pull the latest changes from the repository and rebuild:
```bash
git pull origin main
npm install
npm run build
```

---

## Credits

### Developer
**Skandan V**
- GitHub: [@skandan-v](https://github.com/skandan-v)
- Portfolio: [skandan.dev](https://skandan.dev)
- Twitter: [@SkandanV](https://twitter.com/SkandanV)

### Company
**Hyperdyn**
- Website: [hyperdyn.com](https://hyperdyn.com)
- Building powerful developer tools

### Open Source
This project uses many excellent open-source libraries. See `package.json` for the complete list.

---

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

## Support

- 📧 Email: skandan@hyperdyn.com
- 🐛 Issues: [GitHub Issues](https://github.com/skandan-v/vercel-bulk-manager/issues)
- 📖 Docs: This Wiki
- 💬 Discussions: [GitHub Discussions](https://github.com/skandan-v/vercel-bulk-manager/discussions)

---

## Changelog

### v1.0.0 (October 2025)
- 🎉 Initial release
- ✅ Bulk deployment deletion
- ✅ Bulk project deletion
- ✅ Smart filtering system
- ✅ Environment variable viewer
- ✅ Mobile responsive design
- ✅ Dark/Light theme
- ✅ SEO optimized
- ✅ Hyperdyn branding

---

**Made with ❤️ by Skandan V at Hyperdyn**

For the latest updates, visit: [https://vercel-bulk-manager.hyperdyn.com](https://vercel-bulk-manager.hyperdyn.com)
