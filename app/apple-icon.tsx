import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          color: '#9a3412',
          fontSize: 90,
          fontWeight: 700,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        A
      </div>
    ),
    {
      ...size,
    }
  )
}
