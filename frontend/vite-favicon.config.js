import { defineConfig, loadEnv } from 'vite';
import { ViteFaviconsPlugin } from 'vite-plugin-favicon2';

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        base: '/favicon/site/',
        publicDir: false,
        build: {
            emptyOutDir: true,
            assetsDir: '',
            manifest: true,
            outDir: '../public/favicon/site/',
            rollupOptions: {
                input: {
                    dummy: './dummy.js',
                },
            },
        },
        plugins: [
            ViteFaviconsPlugin({
                logo: 'img/site/favicon.svg',
                inject: false,
                favicons: {
                    appName: env.SYSTEM_NAME,
                    appDescription: env.SYSTEM_NAME,
                    theme_color: '#c22a1b',
                },
            }),
        ],
    };
});
