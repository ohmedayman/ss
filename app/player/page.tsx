'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Tv,
  Wifi,
  WifiOff,
  Maximize,
  Minimize,
  Sparkles,
  QrCode,
  Layers,
  Clock,
  CloudSun,
  UsersRound,
  RotateCw,
  Film,
  Type,
  ExternalLink,
  Repeat,
} from 'lucide-react';

function getFacebookEmbedUrl(url: string): string {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=1920&autoplay=1`;
}

function getEmbedUrl(url: string): string {
  const isFacebook = /facebook\.com|fb\.watch|fb\.com/i.test(url);
  return isFacebook ? getFacebookEmbedUrl(url) : url;
}

// QR Display component (renders QR code from URL)
function QrDisplay({ url }: { url: string }) {
  const [imgSrc, setImgSrc] = useState<string>('');

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { width: 160, margin: 1 }, (err, dataUrl) => {
      if (!err && dataUrl) setImgSrc(dataUrl);
    });
  }, [url]);

  if (!imgSrc) {
    return <div className="w-40 h-40 flex items-center justify-center text-slate-400"><QrCode className="w-12 h-12 animate-pulse" /></div>;
  }

  return <img src={imgSrc} alt="QR Code" className="w-40 h-40 rounded-lg" />;
}

export default function PlayerPage() {
  const [screen, setScreen] = useState<any | null>(null);
  const [registrationCode, setRegistrationCode] = useState<string>('');
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [contentPayload, setContentPayload] = useState<any | null>(null);
  const [currentPlayIndex, setCurrentPlayIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [hijriDate, setHijriDate] = useState<string>('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [currentQueueTicket, setCurrentQueueTicket] = useState<{ ticket: string; counter: string } | null>(null);
  const [showQueueTicket, setShowQueueTicket] = useState<boolean>(false);
  const [currentTransition, setCurrentTransition] = useState<string>('fade');
  const [playlistTransition, setPlaylistTransition] = useState<string>('animate-fade-in');
  const [prayerData, setPrayerData] = useState<any>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const weatherCacheRef = useRef<{ data: any; timestamp: number; city: string } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 1. Clock ticker
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ar-SA', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setHijriDate(
        now.toLocaleDateString('ar-SA-u-ca-islamic-umalqura', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1b. Play harmonic 3-tone chime sound using Web Audio API
  const playChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      const playTone = (freq: number, startTime: number, duration: number, vol: number = 0.35) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Harmonic Airport/Hospital 3-chord chime (D5 -> A5 -> D6)
      playTone(587.33, now, 0.25, 0.4);
      playTone(880.00, now + 0.18, 0.3, 0.45);
      playTone(1174.66, now + 0.38, 0.5, 0.5);
    } catch (e) {
      console.error('Chime failed:', e);
    }
  };

  // 1c. Professional Arabic TTS Queue Announcement ("عميل رقم 1، شباك المبيعات" - ElevenLabs AI Voice + Fallback)
  const speakQueueTicket = async (ticketNumber: string, counterName: string) => {
    try {
      playChime();

      // Format ticket and counter for natural Arabic speech:
      // If ticket is 'S-1' -> '1', if 'A-104' -> '104'
      const rawNum = ticketNumber.replace(/^[A-Za-z\u0600-\u06FF]-?/, '');
      const spokenNum = rawNum || ticketNumber;

      // Clean counter name (e.g. 'قسم المبيعات' -> 'شباك المبيعات' or counterName)
      let spokenCounter = counterName || 'شباك الخدمة';
      if (spokenCounter.startsWith('قسم ')) {
        spokenCounter = spokenCounter.replace('قسم ', 'شباك ');
      }

      // Exact phrasing requested: "عميل رقم 1، شباك المبيعات"
      const announcementText = `عميل رقم ${spokenNum}، ${spokenCounter}`;

      setCurrentQueueTicket({ ticket: ticketNumber, counter: spokenCounter });
      setShowQueueTicket(true);
      setTimeout(() => setShowQueueTicket(false), 12000);

      // 1. Attempt ElevenLabs Studio AI Voice first
      let playedElevenLabs = false;
      try {
        const res = await fetch('/api/queue/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: announcementText }),
        });

        if (res.ok && res.headers.get('content-type')?.includes('audio')) {
          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audio.volume = 1.0;
          setTimeout(() => {
            audio.play().catch(() => {});
            audio.onended = () => {
              setTimeout(() => {
                const repeatAudio = new Audio(audioUrl);
                repeatAudio.volume = 1.0;
                repeatAudio.play().catch(() => {});
              }, 600);
            };
          }, 650);
          playedElevenLabs = true;
        }
      } catch (e) {
        console.warn('ElevenLabs TTS not ready, falling back to Web Speech API:', e);
      }

      // 2. Fallback to Native Browser Speech Synthesis if ElevenLabs is not set or failed
      if (!playedElevenLabs) {
        setTimeout(() => {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const createUtterance = () => {
              const utterance = new SpeechSynthesisUtterance(announcementText);
              utterance.lang = 'ar-SA';
              utterance.rate = 0.88;
              utterance.pitch = 1.0;
              utterance.volume = 1.0;

              const voices = window.speechSynthesis.getVoices();
              const arabicVoice = voices.find(
                (v) =>
                  v.lang.startsWith('ar') ||
                  v.name.toLowerCase().includes('arabic') ||
                  v.name.toLowerCase().includes('maged') ||
                  v.name.toLowerCase().includes('laila') ||
                  v.name.toLowerCase().includes('tarik')
              );
              if (arabicVoice) utterance.voice = arabicVoice;

              return utterance;
            };

            const firstUtterance = createUtterance();

            // Repeat announcement once for maximum clarity in waiting halls
            firstUtterance.onend = () => {
              setTimeout(() => {
                const secondUtterance = createUtterance();
                window.speechSynthesis.speak(secondUtterance);
              }, 600);
            };

            window.speechSynthesis.speak(firstUtterance);
          }
        }, 700);
      }
    } catch (e) {
      console.error('TTS failed:', e);
    }
  };

  // 1d. Fetch Weather from wttr.in
  const fetchWeather = async (city: string = 'Riyadh') => {
    try {
      const now = Date.now();
      if (weatherCacheRef.current && weatherCacheRef.current.city === city && now - weatherCacheRef.current.timestamp < 10 * 60 * 1000) {
        setWeatherData(weatherCacheRef.current.data);
        return;
      }

      const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      if (res.ok) {
        const data = await res.json();
        const current = data.current_condition?.[0];
        if (current) {
          const weather = {
            temp: current.temp_C,
            condition: current.lang_ar?.[0]?.value || current.weatherDesc?.[0]?.value || '',
            icon: getWeatherIcon(current.weatherCode),
            city: city,
          };
          setWeatherData(weather);
          weatherCacheRef.current = { data: weather, timestamp: now, city };
        }
      }
    } catch (e) {
      console.error('Weather fetch failed:', e);
    }
  };

  const getWeatherIcon = (code: string): string => {
    const c = parseInt(code);
    if (c === 113) return '☀️';
    if (c === 116) return '⛅';
    if (c === 119 || c === 122) return '☁️';
    if (c >= 176 && c <= 299) return '🌧️';
    if (c >= 300 && c <= 399) return '❄️';
    if (c >= 386) return '⛈️';
    return '🌤️';
  };

  // 1e. Fetch Prayer Times from aladhan.com
  const fetchPrayerTimes = async () => {
    try {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=24.7136&longitude=46.6753&method=4`
      );
      if (res.ok) {
        const data = await res.json();
        const timings = data.data?.timings;
        if (timings) {
          const prayers = [
            { name: 'الفجر', time: timings.Fajr },
            { name: 'الشروق', time: timings.Sunrise },
            { name: 'الظهر', time: timings.Dhuhr },
            { name: 'العصر', time: timings.Asr },
            { name: 'المغرب', time: timings.Maghrib },
            { name: 'العشاء', time: timings.Isha },
          ];

          const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
          let next = prayers[0];
          for (const p of prayers) {
            const [h, m] = p.time.split(':').map(Number);
            const pMinutes = h * 60 + m;
            if (pMinutes > currentTimeMinutes) {
              next = p;
              break;
            }
            next = p;
          }

          const [nh, nm] = next.time.split(':').map(Number);
          const nextDate = new Date(now);
          nextDate.setHours(nh, nm, 0, 0);
          if (nextDate <= now) nextDate.setDate(nextDate.getDate() + 1);
          const diffMs = nextDate.getTime() - now.getTime();
          const diffH = Math.floor(diffMs / 3600000);
          const diffM = Math.floor((diffMs % 3600000) / 60000);
          const diffS = Math.floor((diffMs % 60000) / 1000);

          setNextPrayer({
            name: next.name,
            time: next.time,
            countdown: `${diffH}س ${diffM}د ${diffS}ث`,
          });
          setPrayerData({ prayers });
        }
      }
    } catch (e) {
      console.error('Prayer times fetch failed:', e);
    }
  };

  // 1f. Countdown Timer Effect
  useEffect(() => {
    if (!contentPayload?.template) return;
    const countdownZone = contentPayload.template.zones?.find((z: any) => z.type === 'countdown');
    if (!countdownZone?.options?.targetDate) {
      setCountdown('');
      return;
    }

    const targetDate = new Date(countdownZone.options.targetDate);

    const tick = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown('00:00:00:00');
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(
        `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [contentPayload]);

  // 1g. Prayer times polling
  useEffect(() => {
    if (!contentPayload?.template) return;
    const hasPrayerZone = contentPayload.template.zones?.some((z: any) => z.type === 'prayer_times');
    if (!hasPrayerZone) return;

    fetchPrayerTimes();
    const interval = setInterval(fetchPrayerTimes, 60000);
    return () => clearInterval(interval);
  }, [contentPayload]);

  // 1h. Weather polling
  useEffect(() => {
    if (!contentPayload?.template) return;
    const weatherZone = contentPayload.template.zones?.find((z: any) => z.type === 'weather');
    if (!weatherZone) return;

    const city = weatherZone.options?.city || 'Riyadh';
    fetchWeather(city);
    const interval = setInterval(() => fetchWeather(city), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [contentPayload]);

  // 2. Initialize Player (Register or Get Screen)
  const initPlayer = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlCode = urlParams.get('code') || urlParams.get('screen') || '';
      const urlToken = urlParams.get('token') || '';

      // If a specific screen code is in the URL, use ONLY that — ignore localStorage
      // This ensures opening /player?screen=SF-XXXX always shows THAT screen
      let codeParam = '';
      let tokenParam = '';

      if (urlCode) {
        codeParam = urlCode;
        tokenParam = '';
      } else if (urlToken) {
        tokenParam = urlToken;
        codeParam = '';
      } else {
        // No URL params — fall back to localStorage (returning to same screen)
        codeParam = localStorage.getItem('sf_player_code') || '';
        tokenParam = localStorage.getItem('sf_player_token') || '';
      }

      let query = '';
      if (tokenParam) query = `token=${encodeURIComponent(tokenParam)}`;
      else if (codeParam) query = `code=${encodeURIComponent(codeParam)}`;
      else {
        // No code at all — first time visitor, let init create a new screen
        const res = await fetch('/api/player/init');
        if (res.ok) {
          const data = await res.json();
          const code = data.registrationCode || data.screen?.registrationCode || '';
          setRegistrationCode(code);
          setIsPaired(data.isPaired);
          setScreen(data.screen);
          if (data.screen?.registrationCode) localStorage.setItem('sf_player_code', data.screen.registrationCode);
          if (data.screen?.pairingToken) localStorage.setItem('sf_player_token', data.screen.pairingToken);
          if (code) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('screen', code);
            window.history.replaceState({}, '', newUrl.toString());
          }
          if (data.isPaired) fetchContent(data.screen);
        }
        return;
      }

      const res = await fetch(`/api/player/init?${query}`);
      const data = await res.json();
      const code = data.registrationCode || data.screen?.registrationCode || codeParam;

      if (!res.ok || data.error) {
        console.error('Player init error:', data.error || 'Unknown error');
        setRegistrationCode(code);
        setIsPaired(false);
        setScreen(null);
        // Retry after 5 seconds
        setTimeout(() => initPlayer(), 5000);
        return;
      }

      setRegistrationCode(code);
      setIsPaired(data.isPaired);
      setScreen(data.screen);

      if (data.screen?.registrationCode) {
        localStorage.setItem('sf_player_code', data.screen.registrationCode);
      }
      if (data.screen?.pairingToken) {
        localStorage.setItem('sf_player_token', data.screen.pairingToken);
      }

      // Update URL to include screen code so refresh works
      if (code && !window.location.search.includes('screen=')) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('screen', code);
        window.history.replaceState({}, '', newUrl.toString());
      } else if (code && window.location.search.includes('code=')) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('code');
        newUrl.searchParams.set('screen', code);
        window.history.replaceState({}, '', newUrl.toString());
      }

      // Generate QR Code for easy pairing
      const pairingUrl = `${window.location.origin}/?pair=${code}`;
      QRCode.toDataURL(pairingUrl, { width: 220, margin: 1 }, (err, url) => {
        if (!err && url) setQrDataUrl(url);
      });

      if (data.isPaired) {
        fetchContent(data.screen);
      }
    } catch (e) {
      console.error('Failed to init player:', e);
      const cached = localStorage.getItem('sf_player_cached_content');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setContentPayload(parsed);
          setIsPaired(true);
        } catch (err) {}
      }
    }
  };

  // 3. Fetch Full Content & Sync
  const fetchContent = async (scrObj?: any) => {
    try {
      const scr = scrObj || screen;
      if (!scr) return;

      const code = scr.registrationCode;
      if (!code) return;

      const res = await fetch(`/api/player/sync?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        setContentPayload(data.content);
        setScreen(data.screen);
        setIsPaired(data.screen?.isPaired ?? true);

        // Persist pairing state for refresh
        if (data.screen?.pairingToken) {
          localStorage.setItem('sf_player_token', data.screen.pairingToken);
        }
        if (data.screen?.registrationCode) {
          localStorage.setItem('sf_player_code', data.screen.registrationCode);
        }

        // Cache content locally for offline playback
        localStorage.setItem('sf_player_cached_content', JSON.stringify(data.content));
        setIsOnline(true);
      }
    } catch (e) {
      console.error('Sync failed:', e);
      setIsOnline(false);
    }
  };

  // 4. Send Heartbeat & Process Pending Commands
  const sendHeartbeat = async () => {
    if (!screen && !registrationCode) return;
    try {
      const res = await fetch('/api/player/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenId: screen?.id,
          code: registrationCode,
          appVersion: 'v1.4.2 Smart Player',
          resolution: `${window.innerWidth}x${window.innerHeight}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsOnline(true);

        // Process pending remote commands
        if (data.pendingCommands && data.pendingCommands.length > 0) {
          for (const cmd of data.pendingCommands) {
            handleRemoteCommand(cmd.command, cmd.payload);
          }
        }
      }
    } catch (e) {
      setIsOnline(false);
    }
  };

  // 4b. Report Device Health
  const reportHealth = async () => {
    if (!screen && !registrationCode) return;
    try {
      const healthPayload: Record<string, any> = {
        screenId: screen?.id,
        code: registrationCode,
        uptimeHours: Math.floor(performance.now() / 3600000),
      };

      // Battery API
      try {
        const battery: any = await (navigator as any).getBattery?.();
        if (battery) {
          healthPayload.batteryLevel = Math.round(battery.level * 100);
          healthPayload.batteryCharging = battery.charging;
        }
      } catch (e) {}

      // Network info
      try {
        const conn: any = (navigator as any).connection;
        if (conn) {
          healthPayload.networkType = conn.effectiveType || conn.type || 'unknown';
          healthPayload.networkSpeedMbps = conn.downlink ? Math.round(conn.downlink * 10) : undefined;
        } else if (navigator.onLine) {
          healthPayload.networkType = 'wifi';
        } else {
          healthPayload.networkType = 'offline';
        }
      } catch (e) {
        healthPayload.networkType = navigator.onLine ? 'wifi' : 'offline';
      }

      // Memory (Chrome only)
      try {
        const perfMem: any = (performance as any).memory;
        if (perfMem) {
          healthPayload.memoryUsageMb = Math.round(perfMem.usedJSHeapSize / 1048576);
          healthPayload.memoryTotalMb = Math.round(perfMem.jsHeapSizeLimit / 1048576);
        }
      } catch (e) {}

      // Storage estimate
      try {
        if (navigator.storage?.estimate) {
          const est = await navigator.storage.estimate();
          healthPayload.storageUsedMb = Math.round((est.usage || 0) / 1048576);
          healthPayload.storageTotalMb = Math.round((est.quota || 0) / 1048576);
        }
      } catch (e) {}

      await fetch('/api/player/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(healthPayload),
      });
    } catch (e) {
      console.error('Health report failed:', e);
    }
  };

  // 5. Handle remote commands sent from dashboard
  const handleRemoteCommand = async (command: string, payload?: any) => {
    console.log('Received remote command:', command, payload);

    if (command === 'reload') {
      fetchContent();
    } else if (command === 'reboot') {
      window.location.reload();
    } else if (command === 'clear_cache') {
      localStorage.removeItem('sf_player_cached_content');
      fetchContent();
    } else if (command === 'take_screenshot') {
      captureAndUploadScreenshot();
    }
  };

  // 6. Capture Virtual Screenshot from Client Player
  const captureAndUploadScreenshot = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const container = playerContainerRef.current;
      if (!container) return;

      const canvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        scale: 0.5,
        backgroundColor: '#000',
        logging: false,
      });

      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      await fetch('/api/player/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenId: screen?.id,
          code: registrationCode,
          screenshotBase64: base64,
        }),
      });
    } catch (e) {
      console.error('Screenshot capture failed:', e);
    }
  };

  // 7. SSE Real-time Events Listener
  useEffect(() => {
    initPlayer();

    // Heartbeat interval every 15s
    const hbInterval = setInterval(sendHeartbeat, 15000);

    // Health report every 30s
    const healthInterval = setInterval(reportHealth, 30000);
    reportHealth(); // initial report

    // Online/Offline window listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(hbInterval);
      clearInterval(healthInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real-time EventSource listener
  useEffect(() => {
    if (!registrationCode && !screen?.id) return;

    const query = screen?.id ? `screenId=${screen.id}` : `code=${registrationCode}`;
    const sse = new EventSource(`/api/player/events?${query}`);

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'paired') {
          setIsPaired(true);
          // Persist pairing data so player survives refresh
          if (data.data?.pairingToken) {
            localStorage.setItem('sf_player_token', data.data.pairingToken);
          }
          if (data.data?.screenId) {
            setScreen((prev: any) => prev ? { ...prev, id: data.data.screenId, isPaired: true } : prev);
          }
          try {
            confetti({ particleCount: 100, spread: 80 });
          } catch (e) {}
          fetchContent();
        } else if (
          data.event === 'content_updated' ||
          data.event === 'playlist_updated' ||
          data.event === 'template_updated'
        ) {
          fetchContent();
        } else if (data.event === 'command') {
          handleRemoteCommand(data.data?.command, data.data?.payload);
        } else if (data.event === 'queue_called') {
          const t = data.data?.ticket;
          const ticketNumber = (typeof t === 'object' && t !== null) ? (t?.ticketNumber || 'A-104') : (data.data?.ticketNumber || data.data?.ticket || 'A-104');
          const counterName = (typeof t === 'object' && t !== null) ? (t?.counterNumber || t?.serviceName || 'الاستقبال') : (data.data?.counterName || data.data?.counter || 'الاستقبال');
          
          setCurrentQueueTicket({ ticket: ticketNumber, counter: counterName });
          setShowQueueTicket(true);
          speakQueueTicket(ticketNumber, counterName);
        } else if (data.event === 'unlinked') {
          setIsPaired(false);
          initPlayer();
        }
      } catch (e) {}
    };

    return () => {
      sse.close();
    };
  }, [registrationCode, screen?.id]);

  // 8. Playlist Sequencer Engine (Cycles items according to duration)
  useEffect(() => {
    if (!isPaired || !contentPayload?.playlist?.items) return;

    const items = contentPayload.playlist.items;
    if (items.length === 0) return;

    const currentItem = items[currentPlayIndex] || items[0];
    const durationMs = (currentItem.durationSeconds || 10) * 1000;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setCurrentPlayIndex((prev) => (prev + 1) % items.length);
    }, durationMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaired, contentPayload, currentPlayIndex]);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Transition class helper
  const getTransitionClass = (type: string): string => {
    switch (type) {
      case 'slide_up': return 'animate-slide-up';
      case 'slide_down': return 'animate-slide-down';
      case 'zoom_out': return 'animate-zoom-out';
      case 'flip': return 'animate-flip';
      default: return 'animate-fade-in';
    }
  };

  // Cycle transition type on index change
  useEffect(() => {
    const transitions = ['fade', 'slide_up', 'slide_down', 'zoom_out', 'flip'];
    const idx = currentPlayIndex % transitions.length;
    setPlaylistTransition(getTransitionClass(transitions[idx]));
  }, [currentPlayIndex]);

  // --- RENDERING VIEWS ---

  // A. Unpaired Screen View (Show Large Registration Code + QR + Instructions)
  if (!isPaired) {
    return (
      <div
        ref={playerContainerRef}
        className="w-screen h-screen bg-[#070b14] text-white flex flex-col justify-between p-8 select-none relative overflow-hidden font-['Cairo']"
      >
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">ScreenFlow</h1>
              <p className="text-xs text-indigo-300 font-medium">Smart Web Player • مشغل الشاشات الذكي</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-left font-mono text-sm text-slate-300">
              <div className="font-bold text-white text-base">{currentTime}</div>
              <div className="text-xs text-slate-400">{hijriDate}</div>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="ملء الشاشة"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Center Registration Card */}
        <div className="max-w-4xl mx-auto w-full z-10 my-auto">
          <div className="glass-panel rounded-3xl p-8 md:p-12 border border-indigo-500/30 shadow-2xl bg-slate-900/80 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* QR Code Section */}
            <div className="flex flex-col items-center shrink-0">
              <div className="p-4 bg-white rounded-2xl shadow-xl">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Pairing QR" className="w-44 h-44 rounded-lg" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                    <QrCode className="w-16 h-16 animate-pulse" />
                  </div>
                )}
              </div>
              <span className="text-xs text-indigo-300 font-semibold mt-3 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                امسح الكود للاقتران السريع
              </span>
            </div>

            {/* Registration Code & Instructions */}
            <div className="flex-1 text-right space-y-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  جاهز للاقتران والتشغيل
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  أدخل كود التسجيل في لوحة التحكم
                </h2>
              </div>

              {/* Huge Registration Code Box */}
              <div className="p-4 rounded-2xl bg-[#080d1a] border-2 border-indigo-500/40 text-center shadow-inner">
                <span className="text-xs text-slate-400 block mb-1">كود تسجيل الشاشة</span>
                <span className="font-mono text-4xl md:text-6xl font-black text-amber-400 tracking-widest selection:bg-none">
                  {registrationCode || 'SF-....'}
                </span>
              </div>

              {/* Step by step */}
              <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>افتح لوحة التحكم في متصفحك أو هاتفك.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>اضغط على <b>"ربط شاشة جديدة"</b> واكتب الكود أعلاه.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>ستبدأ الشاشة بعرض محتواك فورياً وبأعلى جودة.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-green" />
            <span>متصل بالسيرفر المباشر • بانتظار أمر الإقران</span>
          </div>
          <span className="font-mono">ScreenFlow OS v1.4.2</span>
        </div>
      </div>
    );
  }

  // B. Paired Screen Playback View
  const playlistItems = contentPayload?.playlist?.items || [];
  const currentItem = playlistItems[currentPlayIndex] || playlistItems[0];
  const template = contentPayload?.template;

  return (
    <div
      ref={playerContainerRef}
      className="w-screen h-screen bg-black text-white relative overflow-hidden select-none font-['Cairo'] flex flex-col justify-between"
    >
      {/* 1. If Template Mode (Multi-zone layout) */}
      {template ? (
        <div
          className="w-full h-full flex flex-col relative"
          style={{ backgroundColor: template.backgroundColor || '#0a0f1d' }}
        >
          {/* Template Header with Company Logo on the Right */}
          {(template.headerTitle || template.logoUrl) && (
            <div
              className="h-16 border-b px-8 flex items-center justify-between"
              style={{
                backgroundColor: template.sidebarColor || '#0f172a',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Right Side (in RTL): Company Logo + Facility Title */}
              <div className="flex items-center gap-4">
                {template.logoUrl ? (
                  <img
                    src={template.logoUrl}
                    alt="Logo"
                    className="h-10 max-w-[140px] object-contain rounded-lg bg-white/10 p-1 backdrop-blur-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                    <Tv className="w-5 h-5" />
                  </div>
                )}
                {template.headerTitle && (
                  <h2 className="text-xl font-black text-white tracking-wide">
                    {template.headerTitle}
                  </h2>
                )}
              </div>

              {/* Left Side: Live Clock & Date */}
              <div className="flex items-center gap-6 font-mono text-sm text-slate-300">
                <span className="font-bold text-white text-lg">{currentTime}</span>
                <span className="text-xs text-slate-400">{hijriDate}</span>
              </div>
            </div>
          )}

          {/* Template Zones Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Video / Content Area */}
            <div className="flex-1 p-6 flex flex-col justify-center items-center relative overflow-hidden bg-black/40">
              {currentItem && currentItem.media ? (
                <div key={`${currentItem.id}-${currentPlayIndex}`} className={`w-full h-full ${playlistTransition}`}>
                  {currentItem.media?.fileType === 'image' && (
                    <img
                      src={currentItem.media.fileUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-2xl shadow-2xl"
                    />
                  )}
                  {currentItem.media?.fileType === 'video' && (
                    <div className="relative w-full h-full">
                      <video
                        ref={videoRef}
                        src={currentItem.media.fileUrl}
                        autoPlay
                        muted={currentItem.isMuted !== undefined ? currentItem.isMuted : true}
                        loop
                        playsInline
                        className="w-full h-full object-cover rounded-2xl shadow-2xl"
                      />
                      <div className="absolute bottom-4 right-4 bg-black/50 rounded-full p-2">
                        <Repeat className="w-4 h-4 text-white/70" />
                      </div>
                    </div>
                  )}
                  {currentItem.media?.fileType === 'youtube_video' && (
                    <iframe
                      src={currentItem.media.customUrl || `https://www.youtube.com/embed/${currentItem.media.fileUrl?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || ''}?autoplay=1&mute=1&loop=1`}
                      className="w-full h-full rounded-2xl shadow-2xl border-0"
                      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  )}
                  {currentItem.media?.fileType === 'web_url' && (
                    <iframe
                      src={currentItem.media.fileUrl}
                      className="w-full h-full rounded-2xl shadow-2xl border-0"
                      sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  )}
                </div>
              ) : (
                /* High-Quality Fallback Video so screen is never blank */
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white">
                    فيديو العرض الترويجي
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Widgets (Dynamic Zones & Colors) */}
            {template.layout === 'split_3_sidebar' && (
              <div
                className="w-96 border-r p-6 flex flex-col justify-between space-y-6 overflow-y-auto"
                style={{
                  backgroundColor: template.sidebarColor || '#0f172a',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* 1. Queue Display Widget */}
                <div
                  className="p-6 rounded-3xl text-center shadow-2xl border transition-all"
                  style={{
                    backgroundColor: template.cardColor || '#1e1b4b',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div className="flex items-center justify-center gap-2 font-bold text-sm mb-2 text-indigo-200">
                    <UsersRound className="w-5 h-5 text-amber-400" />
                    <span>الرقم المستدعى حالياً</span>
                  </div>
                  <div
                    className="text-6xl font-black font-mono tracking-wider my-2"
                    style={{ color: template.accentColor || '#f59e0b' }}
                  >
                    {currentQueueTicket?.ticket || 'A-104'}
                  </div>
                  <div className="text-sm text-slate-200 font-semibold mt-2">
                    {currentQueueTicket?.counter || 'الاستقبال'}
                  </div>
                </div>

                {/* 2. Live Clock Widget */}
                <div
                  className="p-6 rounded-3xl text-center space-y-3 border shadow-xl"
                  style={{
                    backgroundColor: template.cardColor || '#1e1b4b',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex items-center justify-center gap-2 text-indigo-300 text-xs font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>التوقيت المباشر</span>
                  </div>
                  <div
                    className="text-3xl font-black font-mono tracking-widest"
                    style={{ color: template.textColor || '#ffffff' }}
                  >
                    {currentTime}
                  </div>
                  <div className="text-xs text-slate-400">{hijriDate}</div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Ticker Marquee with Custom Colors */}
          <div
            className="h-12 border-t flex items-center px-6 overflow-hidden"
            style={{
              backgroundColor: template.tickerBgColor || '#1e1b4b',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: template.tickerTextColor || '#e0e7ff',
            }}
          >
            <div className="flex items-center gap-3 text-sm font-bold whitespace-nowrap animate-ticker">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 pulse-green" />
              <span style={{ color: template.accentColor || '#f59e0b' }}>تنبيهات هامة:</span>
              <span>
                {template.zones?.find((z: any) => z.type === 'ticker')?.text ||
                  '🎉 مرحباً بكم في شاشات العرض الذكية • عروض حصرية ومستمرة يومياً في كافة الفروع'}
              </span>
            </div>
          </div>
        </div>
      ) : contentPayload?.liveStreamUrl ? (
        /* Live Stream Mode (Facebook Live / YouTube / Twitch) */
        <div className="w-full h-full bg-black flex items-center justify-center">
          <iframe
            src={contentPayload.liveStreamUrl.includes('facebook.com')
              ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(contentPayload.liveStreamUrl)}&show_text=false&width=1920&autoplay=1`
              : contentPayload.liveStreamUrl.includes('youtube.com') || contentPayload.liveStreamUrl.includes('youtu.be')
                ? contentPayload.liveStreamUrl.replace('watch?v=', 'embed/').replace('youtube.com', 'youtube.com/embed') + '?autoplay=1&mute=1'
                : contentPayload.liveStreamUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : contentPayload?.canvasLayers ? (
        /* Canvas Mode (Custom Layout) */
        <div
          className="w-full h-full relative"
          style={{ backgroundColor: contentPayload.canvasBackground || '#0f172a' }}
        >
          {contentPayload.canvasLayers
            .filter((l: any) => l.visible !== false)
            .sort((a: any, b: any) => a.zIndex - b.zIndex)
            .map((layer: any) => (
              <div
                key={layer.id}
                className="absolute"
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  width: `${layer.width}%`,
                  height: `${layer.height}%`,
                  zIndex: layer.zIndex,
                  opacity: layer.opacity ?? 1,
                  backgroundColor: layer.backgroundColor || 'transparent',
                  borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : undefined,
                }}
              >
                {layer.type === 'logo' && layer.fileUrl && (
                  <img src={layer.fileUrl} alt="" className="w-full h-full object-contain" />
                )}
                {layer.type === 'text' && (
                  <span
                    style={{
                      color: layer.fontColor || '#fff',
                      fontSize: layer.fontSize ? `${layer.fontSize}px` : '24px',
                      fontWeight: layer.fontWeight || 'normal',
                    }}
                    className="flex items-center justify-center w-full h-full px-3 text-center leading-tight"
                  >
                    {layer.text}
                  </span>
                )}
                {layer.type === 'clock' && (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <span className="font-mono font-bold text-white" style={{ fontSize: layer.fontSize ? `${layer.fontSize}px` : '48px' }}>
                      {currentTime}
                    </span>
                    <span className="text-white/60 text-sm mt-1">{hijriDate}</span>
                  </div>
                )}
                {layer.type === 'weather' && weatherData && (
                  <div className="flex flex-col items-center justify-center w-full h-full text-white">
                    <CloudSun className="w-10 h-10 text-amber-300" />
                    <span className="text-2xl font-bold mt-1">{weatherData.temperature}°</span>
                    <span className="text-sm text-white/60">{weatherData.description}</span>
                  </div>
                )}
                {layer.type === 'ticker' && (
                  <div className="w-full h-full flex items-center px-4 overflow-hidden" style={{ backgroundColor: layer.backgroundColor || '#1e293b' }}>
                    <div className="animate-ticker whitespace-nowrap text-white font-semibold" style={{ fontSize: layer.fontSize ? `${layer.fontSize}px` : '18px' }}>
                      {layer.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        /* 2. Direct Playlist Mode (Full Screen) */
        <div className="w-full h-full relative flex items-center justify-center bg-black">
          {currentItem ? (
            <div key={`${currentItem.id}-${currentPlayIndex}`} className={`w-full h-full ${playlistTransition}`}>
              {currentItem.media?.fileType === 'image' && (
                <img
                  src={currentItem.media.fileUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}

              {currentItem.media?.fileType === 'video' && (
                <div className="relative w-full h-full">
                  <video
                    key={currentItem.id}
                    ref={videoRef}
                    src={currentItem.media.fileUrl}
                    autoPlay
                    muted={currentItem.isMuted}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4 bg-black/50 rounded-full p-2">
                    <Repeat className="w-4 h-4 text-white/70" />
                  </div>
                </div>
              )}

              {currentItem.media?.fileType === 'youtube_video' && (
                <iframe
                  key={currentItem.id}
                  src={currentItem.media.customUrl || `https://www.youtube.com/embed/${currentItem.media.fileUrl?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || ''}?autoplay=1&mute=1&loop=1`}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                  title={currentItem.media.name || 'YouTube'}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              )}

              {currentItem.media?.fileType === 'live_stream' && (
                <iframe
                  key={currentItem.id}
                  src={currentItem.media.customUrl || currentItem.media.fileUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                  title={currentItem.media.name || 'Live Stream'}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              )}

              {currentItem.media?.fileType === 'audio' && (
                <div className="w-full h-full bg-gradient-to-br from-purple-950 via-slate-900 to-purple-950 flex items-center justify-center p-12">
                  <audio
                    key={currentItem.id}
                    src={currentItem.media.fileUrl}
                    autoPlay
                    loop
                  />
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto rounded-full bg-purple-600/20 flex items-center justify-center mb-4 animate-pulse">
                      <svg className="w-10 h-10 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                    <p className="text-xl font-bold text-white">{currentItem.media.name}</p>
                    <p className="text-sm text-purple-300 mt-1">صوتيات</p>
                  </div>
                </div>
              )}

              {currentItem.media?.fileType === 'web_url' && (() => {
                const url = currentItem.media.fileUrl || currentItem.media.customUrl || '';
                const isFacebook = /facebook\.com|fb\.watch|fb\.com/i.test(url);
                const embedUrl = isFacebook
                  ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=1920&autoplay=1`
                  : url;
                return (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
                    title={currentItem.media.name || 'Web Player'}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                );
              })()}

              {currentItem.media?.fileType === 'ticker_text' && (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-950 via-slate-900 to-[#0b0f19] flex items-center justify-center p-12 text-center">
                  <p className="text-3xl md:text-5xl font-black text-white max-w-4xl leading-relaxed">
                    {currentItem.media.customTickerText}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-500">
              <Tv className="w-16 h-16 mx-auto mb-2 opacity-30 text-indigo-400" />
              <p className="text-sm font-semibold">بث المحتوى المباشر</p>
            </div>
          )}
        </div>
      )}

      {/* Queue Ticket Overlay (shown when a ticket is called) */}
      {showQueueTicket && currentQueueTicket && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-br from-amber-500 via-amber-400 to-amber-600 p-12 rounded-[2rem] shadow-2xl text-center max-w-lg mx-4 animate-slide-up">
            <div className="bg-black/20 rounded-2xl p-8">
              <div className="text-white/80 text-lg font-bold mb-2">التذكرة المستدعاة</div>
              <div className="text-8xl font-black text-white font-mono tracking-wider mb-4 animate-digit-pulse">
                {currentQueueTicket.ticket}
              </div>
              <div className="w-16 h-1 bg-white/40 rounded-full mx-auto mb-4" />
              <div className="text-white/90 text-xl font-bold">{currentQueueTicket.counter}</div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Controls Overlay (Visible on mouse hover) */}
      <div className="absolute top-4 left-4 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 z-50">
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          title="ملء الشاشة (Fullscreen)"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        <button
          onClick={() => fetchContent()}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          title="تحديث المحتوى فورياً"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 px-2 text-xs font-mono">
          {isOnline ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-rose-500" title="Offline (Playing Cache)" />
          )}
          <span className="text-slate-300 font-bold">{screen?.registrationCode}</span>
        </div>
      </div>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(60px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-60px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes zoom-out {
          from { opacity: 0; transform: scale(1.3); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes flip {
          from { opacity: 0; transform: perspective(600px) rotateY(-90deg); }
          to { opacity: 1; transform: perspective(600px) rotateY(0deg); }
        }
        @keyframes digit-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out both;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out both;
        }
        .animate-slide-down {
          animation: slide-down 0.8s ease-out both;
        }
        .animate-zoom-out {
          animation: zoom-out 0.8s ease-out both;
        }
        .animate-flip {
          animation: flip 0.8s ease-out both;
        }
        .animate-digit-pulse {
          animation: digit-pulse 2s ease-in-out infinite;
        }
        .animate-ticker {
          animation: ticker-scroll 30s linear infinite;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .pulse-green {
          animation: pulse-green 2s ease-in-out infinite;
        }
        @keyframes pulse-green {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
