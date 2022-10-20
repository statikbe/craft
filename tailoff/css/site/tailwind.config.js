const defaultTheme = require('tailwindcss/defaultTheme');

const colorShade = require('../../tailwind/color-shades');
// const underlineAnimation = require('./tailoff/tailwind/underline-animation');

const siteColors = {
    primary: {
        DEFAULT: '#EE4737',
        contrast: '#ffffff',
        hover: '#f27266',
        hoverContrast: '#ffffff',
    },
    secondary: {
        DEFAULT: '#0409a6',
        contrast: '#ffffff',
        hover: '#050cd8',
        hoverContrast: '#ffffff',
    },
};

module.exports = {
    content: [`tailoff/js/**/*.{ts,js}`, `templates/_site/**/*`, `templates/jsPlugins/**/*`],
    theme: {
        borderWidth: {
            DEFAULT: '1px',
            0: '0',
            1: '1px',
            2: '2px',
            3: '3px',
        },
        container: {
            center: true,
            padding: defaultTheme.spacing['4'],
        },
        fontFamily: {
            accent: 'serif',
            base: 'sans-serif',
        },
        screens: {
            xs: '480px',
            sm: '660px',
            md: '820px',
            lg: '980px',
            xl: '1200px',
        },
        extend: {
            colors: {
                ...siteColors,
                black: '#333333',
                light: '#f5f5f5',
            },
            screens: {
                print: { raw: 'print' },
            },
            minWidth: {
                searchbox: '225px',
            },
            maxWidth: {
                flyout: '90vw',
                modal: '725px',
                logo: '150px',
            },
            fontSize: {
                'xs': ['0.75rem', '1rem'], // 12px - 16px
                'sm': ['0.875rem', '1.25rem'], // 14px - 20px
                'base': ['1rem', '1.5rem'], // 16px - 24px
                'lg': ['1.125rem', '1.75rem'], // 18px - 28px
                'xl': ['1.25rem', '1.75rem'], // 20px - 28px
                '2xl': ['1.5rem', '2rem'], // 24px - 32px
                '3xl': ['1.875rem', '2.25rem'], // 30px - 36px
                '4xl': ['2.25rem', '2.5rem'], // 36px - 40px
                '5xl': ['3rem', '1'], // 48px - 1
                '6xl': ['3.75rem', '1'], // 60px - 1
                '7xl': ['4.5rem', '1'], // 72px - 1
                '8xl': ['6rem', '1'], // 96px - 1
                '9xl': ['8rem', '1'], // 128px - 1
            },
            zIndex: {
                99: '99',
                100: '100',
            },
            boxShadow: {
                card: '0 0 30px 0 rgba(0,0,0,0.15)',
            },
            inset: {
                '1/2': '50%',
            },
        },
    },
    plugins: [
        colorShade(siteColors),
        // underlineAnimation,
    ],
};
