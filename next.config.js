/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Lets the dev server be opened by IP address (e.g. http://192.168.1.20:3000 from a phone or
  // tablet on the same Wi-Fi), not only localhost. Covers private network addresses and Mac
  // ".local" names. Development only; production builds ignore it.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
};

module.exports = nextConfig;
