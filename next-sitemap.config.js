/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://armyverse.vercel.app',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    exclude: ['/api/*'],
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/api/*', '/admin/*'],
        },
      ],
      additionalSitemaps: [
        'https://armyverse.vercel.app/sitemap.xml',
      ],
    },
  }