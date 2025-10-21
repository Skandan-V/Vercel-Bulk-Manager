import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get dynamic parameters
    const title = searchParams.get('title') || 'Vercel Bulk Deployment Manager';
    const description = searchParams.get('description') || 'Powerful bulk deployment management tool for Vercel';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          {/* Gradient Background Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
            }}
          />

          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              zIndex: 1,
            }}
          >
            {/* Logo/Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '120px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                marginBottom: '40px',
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4)',
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>

            {/* Title */}
            <div
              style={{
                display: 'flex',
                fontSize: '64px',
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                marginBottom: '24px',
                lineHeight: 1.2,
                maxWidth: '1000px',
              }}
            >
              {title}
            </div>

            {/* Description */}
            <div
              style={{
                display: 'flex',
                fontSize: '32px',
                color: '#94a3b8',
                textAlign: 'center',
                maxWidth: '900px',
                lineHeight: 1.4,
                marginBottom: '40px',
              }}
            >
              {description}
            </div>

            {/* Footer/Branding */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Hyperdyn
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: '#64748b',
                }}
              >
                •
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: '#94a3b8',
                }}
              >
                by Skandan V
              </div>
            </div>
          </div>

          {/* Corner Badge */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#22c55e',
              }}
            />
            <div
              style={{
                fontSize: '20px',
                color: '#22c55e',
                fontWeight: '600',
              }}
            >
              Open Source
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
