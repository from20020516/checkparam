/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compiler: {
        /** @see https://nextjs.org/docs/messages/react-hydration-error */
        styledComponents: true,
    },
}

module.exports = nextConfig
