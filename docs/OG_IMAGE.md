# OG Image Generation

This project uses a free external service for Open Graph image generation instead of custom API endpoints.

## How It Works

The OG images are generated using `og-image.vercel.app`, a free service that creates beautiful Open Graph images.

## Current Configuration

The project is configured to use:
- **Service**: `og-image.vercel.app`
- **Title**: "Vercel Bulk Deployment Manager"
- **Theme**: Dark
- **Font Size**: 100px
- **Icon**: Vercel triangle logo

## URL Structure

The OG image URL is structured as:
```
https://og-image.vercel.app/[TITLE].png?theme=dark&md=1&fontSize=100px&images=[ICON_URL]
```

## Current Image URL

```
https://og-image.vercel.app/Vercel%20Bulk%20Deployment%20Manager.png?theme=dark&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-white.svg
```

## Features

- ✅ **Free Service**: No custom API needed
- ✅ **Auto-scaling**: Images are always 1200x630px (optimal for social media)
- ✅ **Professional Design**: Clean, modern appearance
- ✅ **Fast**: Served from CDN for optimal performance
- ✅ **No Build Errors**: No dependency on complex Edge Functions

## Customization

To customize the OG image, modify the URL in `index.html`:

1. Change the title: Replace `Vercel%20Bulk%20Deployment%20Manager` with your URL-encoded title
2. Change theme: Use `?theme=light` for light theme
3. Change font size: Modify `fontSize=100px`
4. Change icon: Replace the `images` parameter with your icon URL (must be URL-encoded)

## How URLs Are Updated

The `index.html` file references:
- `og:image`: Points to the og-image.vercel.app URL
- `twitter:image`: Same URL for Twitter cards

## Testing

After deployment, test your OG image with:
- [OpenGraph.xyz](https://www.opengraph.xyz/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Facebook Debugger](https://developers.facebook.com/tools/debug/)

## Benefits of This Approach

- No custom API endpoints to maintain
- No Edge Function complexity
- No build errors related to unsupported modules
- Fast and reliable CDN delivery
- Easy to modify without code changes

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
