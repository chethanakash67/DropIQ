import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #84cc16 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'Arial Black, Arial, sans-serif',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 16,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.5px',
          }}
        >
          D
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 9,
            fontWeight: 700,
            lineHeight: 1,
            marginTop: -1,
          }}
        >
          IQ
        </div>
      </div>
    ),
    { ...size }
  )
}
