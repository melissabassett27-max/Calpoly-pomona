import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const baseUrl = host.startsWith('http') ? host : `https://${host}`;
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/apply`, lastModified: new Date() },
    { url: `${baseUrl}/login`, lastModified: new Date() },
    { url: `${baseUrl}/register`, lastModified: new Date() },
  ];
}
