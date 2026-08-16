// URL validation and content safety utilities

// Allowed domains for web_url content
const ALLOWED_WEB_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'vimeo.com',
  'www.vimeo.com',
  'dailymotion.com',
  'www.dailymotion.com',
  'twitch.tv',
  'www.twitch.tv',
  'facebook.com',
  'www.facebook.com',
  'web.facebook.com',
  'instagram.com',
  'www.instagram.com',
  'twitter.com',
  'www.twitter.com',
  'x.com',
  'www.x.com',
  'tiktok.com',
  'www.tiktok.com',
  'linkedin.com',
  'www.linkedin.com',
  'weather.com',
  'www.weather.com',
  'accuweather.com',
  'www.accuweather.com',
  'timeanddate.com',
  'www.timeanddate.com',
  'google.com',
  'www.google.com',
  'maps.google.com',
  'docs.google.com',
  'slides.google.com',
  'raw.githubusercontent.com',
  'images.unsplash.com',
  'unsplash.com',
];

// Blocked patterns (malicious / phishing)
const BLOCKED_PATTERNS = [
  /javascript:/i,
  /data:text\/html/i,
  /vbscript:/i,
  /file:\/\//i,
  /<script/i,
  /onerror=/i,
  /onload=/i,
  /onclick=/i,
];

export function isUrlSafe(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Check for blocked patterns (XSS, etc.)
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(url)) return false;
  }

  // Must be http or https
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
  } catch {
    return false;
  }

  return true;
}

export function isDomainAllowed(url: string, allowedDomains: string[] = ALLOWED_WEB_DOMAINS): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    return allowedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

export function getYoutubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getSafeIframeSandbox(mediaType: string): string {
  switch (mediaType) {
    case 'youtube_video':
      return 'allow-scripts allow-same-origin allow-presentation allow-popups';
    case 'web_url':
      return 'allow-scripts allow-same-origin allow-presentation allow-forms allow-popups';
    default:
      return 'allow-scripts allow-same-origin';
  }
}
