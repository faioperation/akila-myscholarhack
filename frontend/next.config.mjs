const nextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.myscholarhack.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'test9.fireai.agency',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                pathname: '/**',
            }
        ],
    },
};
export default nextConfig;
