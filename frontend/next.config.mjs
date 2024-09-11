/** @type {import('next').NextConfig} */
const nextConfig = {
    optimizeFonts:true,
    reactStrictMode:false,
    compress:true,
    productionBrowserSourceMaps:true,
    distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
    ...(process.env.NODE_ENV === 'production' && {
        typescript: {
            ignoreBuildErrors: false
        },
        eslint: {
            ignoreDuringBuilds: false
        }
    })
};

export default nextConfig;
