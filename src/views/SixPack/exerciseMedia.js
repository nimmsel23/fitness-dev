export const SIXPACK_VIDEO_URLS_KEY = 'fitness-sixpack-video-urls-v1';
export function loadVideoUrls() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SIXPACK_VIDEO_URLS_KEY) || '{}');
    return saved && !Array.isArray(saved) && typeof saved === 'object' ? saved : {};
  } catch { return {}; }
}
export function playableVideoUrl(value) {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  return url && (/^https:\/\//i.test(url) || (url.startsWith('/') && !url.startsWith('//')) || /^\.\.?\//.test(url)) ? url : null;
}

export function videoDescriptor(value) {
  const url = playableVideoUrl(value);
  if (!url) return null;
  if (/^https:\/\//i.test(url)) {
    let parsed;
    try { parsed = new URL(url); } catch { return null; }
    let id;
    if (['www.youtube.com', 'youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com'].includes(parsed.hostname)) {
      id = parsed.searchParams.get('v') || parsed.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];
      if (!/^[\w-]{11}$/.test(id || '')) return null;
    } else if (parsed.hostname === 'youtu.be') {
      id = parsed.pathname.slice(1);
      if (!/^[\w-]{11}$/.test(id)) return null;
    }
    if (id && /^[\w-]{11}$/.test(id)) return { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&mute=1` };
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(parsed.hostname)) {
      const match = parsed.pathname.match(/^\/(?:video\/)?(\d+)$/);
      return match ? { kind: 'embed', src: `https://player.vimeo.com/video/${match[1]}?dnt=1&muted=1` } : null;
    }
  }
  return { kind: 'file', src: url };
}
