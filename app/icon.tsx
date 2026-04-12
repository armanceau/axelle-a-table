import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          color: '#9a3412',
          fontSize: 220,
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
