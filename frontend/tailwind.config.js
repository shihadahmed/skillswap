/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/context/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F46E5', // Electric Indigo — primary CTA, highlights, active
          hover: '#4338CA', // hover / interactive
        },
        accent: '#7C3AED', // Electric Violet — badge, tag, gradient
        bg: '#FAFAFB', // main background
        surface: '#FFFFFF', // card / modal / container
        ink: '#0F172A', // primary text / headings
        muted: '#64748B', // secondary text
        line: '#E2E8F0', // border / divider
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.06)',
        glow: '0 10px 30px rgba(79,70,229,0.25)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
