/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: 'fiery-mosquito-689.convex.cloud'
            }
        ]
    }
};

export default nextConfig;
