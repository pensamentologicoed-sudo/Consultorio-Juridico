/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#fffbf0',
                    100: '#fceeb5',
                    200: '#e6c86e',
                    300: '#D4AF37',
                    400: '#c19a2e',
                    500: '#a88528',
                    600: '#131313',
                    700: '#000000',
                    800: '#262626',
                    900: '#171717',
                    950: '#0a0a0a',
                },
                blue: {
                    50: '#fffbf0',
                    100: '#fceeb5',
                    200: '#e6c86e',
                    300: '#D4AF37',
                    400: '#c19a2e',
                    500: '#a88528',
                    600: '#131313',
                    700: '#000000',
                    800: '#262626',
                    900: '#050505',
                    950: '#0a0a0a',
                }
            }
        }
    },
    plugins: [],
}
