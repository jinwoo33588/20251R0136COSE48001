/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',     // 주색상 (파란색)
        secondary: '#9333EA',   // 보조색상 (보라색)
        accent: '#F59E0B',      // 강조색 (노란색)
        muted: '#6B7280',        // 중간톤 회색
        background: '#F3F4F6',   // 기본 배경색
        surface: '#FFFFFF',      // 카드/입력창 배경
      },
      spacing: {
        '128': '32rem',          // 아주 큰 간격
        '144': '36rem',
      },
      fontSize: {
        'xxs': '0.65rem',         // extra extra small
      },
      borderRadius: {
        'xl': '1rem',             // 둥근 모서리
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.05)',  // 부드러운 그림자
      },
    },
  },
  plugins: [],
}
