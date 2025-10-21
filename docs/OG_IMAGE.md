# Dynamic OG Image Generation

This project uses `@vercel/og` to generate Open Graph images dynamically. No need to create or replace static images!

## How It Works

The OG image is generated on-the-fly at `/api/og` endpoint using Vercel's Edge Functions.

## Usage

### Default Image

The default OG image is automatically generated with:
- Title: "Vercel Bulk Deployment Manager"
- Description: "Powerful bulk deployment management tool for Vercel"
- Hyperdyn branding
- Modern gradient design

Access it at: `https://your-domain.com/api/og`

### Custom Parameters

You can customize the OG image by passing URL parameters:

```
/api/og?title=Your Custom Title&description=Your custom description
```

#### Examples:

**Custom Title:**
```
/api/og?title=Manage 1000+ Deployments Easily
```

**Custom Title and Description:**
```
/api/og?title=Vercel Manager Pro&description=Enterprise deployment management
```

## Features

- ✅ **Dynamic Generation**: No static image files needed
- ✅ **Auto-scaling**: Images are always 1200x630px (optimal for social media)
- ✅ **Branding**: Hyperdyn branding automatically included
- ✅ **Modern Design**: Beautiful gradient background with rocket icon
- ✅ **Fast**: Generated at the edge for optimal performance

## Local Development

The OG image generation works automatically when deployed to Vercel. For local testing:

1. Run your dev server: `npm run dev`
2. Visit: `http://localhost:3001/api/og`
3. You'll see a JSON response (Edge Functions run on Vercel)

## Customization

Edit `/api/og.tsx` to customize:
- Colors and gradients
- Logo/icon
- Typography
- Layout
- Additional parameters

## How URLs Are Updated

The `index.html` file automatically references:
- `og:image`: `/api/og`
- `twitter:image`: `/api/og`

When deployed to Vercel, these resolve to your full domain URL.

## Testing

After deployment, test your OG image with:
- [OpenGraph.xyz](https://www.opengraph.xyz/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Facebook Debugger](https://developers.facebook.com/tools/debug/)

## Benefits Over Static Images

1. **No Manual Updates**: Change text without editing images
2. **Consistent Branding**: Automatic Hyperdyn branding
3. **Multiple Variations**: Generate different images per page
4. **Always Fresh**: No caching issues with outdated images
5. **Smaller Repo**: No large image files in git

## Example Output

The generated image includes:
- Black dotted background pattern
- Blue/purple gradient overlay
- Rocket icon in gradient box
- Large title text (64px)
- Subtitle/description (32px)
- Hyperdyn branding
- "Open Source" badge
- Professional shadows and effects

---

**Note**: Edge Functions are only available on Vercel. If deploying elsewhere, consider using a static OG image or alternative OG image generation service.
