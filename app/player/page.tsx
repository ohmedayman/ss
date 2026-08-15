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
} from 'lucide-react';

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

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

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

  // 2. Initialize Player (Register or Get Screen)
  const initPlayer = async () => {
    try {
      // Check query params for specific code or token
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get('code') || localStorage.getItem('sf_player_code') || '';
      const tokenParam = urlParams.get('token') || localStorage.getItem('sf_player_token') || '';

      let query = '';
      if (tokenParam) query = `token=${encodeURIComponent(tokenParam)}`;
      else if (codeParam) query = `code=${encodeURIComponent(codeParam)}`;

      const res = await fetch(`/api/player/init?${query}`);
      if (res.ok) {
        const data = await res.json();
        setRegistrationCode(data.registrationCode || data.screen?.registrationCode || '');
        setIsPaired(data.isPaired);
        setScreen(data.screen);

        if (data.screen?.registrationCode) {
          localStorage.setItem('sf_player_code', data.screen.registrationCode);
        }
        if (data.screen?.pairingToken) {
          localStorage.setItem('sf_player_token', data.screen.pairingToken);
        }

        // Generate QR Code for easy pairing
        const pairingUrl = `${window.location.origin}/?pair=${data.registrationCode || data.screen?.registrationCode}`;
        QRCode.toDataURL(pairingUrl, { width: 220, margin: 1 }, (err, url) => {
          if (!err && url) setQrDataUrl(url);
        });

        if (data.isPaired) {
          fetchContent(data.screen);
        }
      }
    } catch (e) {
      console.error('Failed to init player:', e);
      // Offline fallback: load cached content from localStorage
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
      const res = await fetch(`/api/player/sync?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        setContentPayload(data.content);
        setScreen(data.screen);
        setIsPaired(data.screen.isPaired);

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
      // Create canvas snapshot
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw basic preview elements
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`ScreenFlow Live Player: ${screen?.name || 'Active Screen'}`, 320, 160);

        ctx.fillStyle = '#22c55e';
        ctx.font = '16px Cairo, sans-serif';
        ctx.fillText(`● Online - ${new Date().toLocaleTimeString('ar-SA')}`, 320, 200);

        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        await fetch('/api/player/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            screenId: screen?.id,
            code: registrationCode,
            screenshotBase64: base64,
          }),
        });
      }
    } catch (e) {
      console.error('Screenshot capture failed:', e);
    }
  };

  // 7. SSE Real-time Events Listener
  useEffect(() => {
    initPlayer();

    // Heartbeat interval every 15s
    const hbInterval = setInterval(sendHeartbeat, 15000);

    // Online/Offline window listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(hbInterval);
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
          style={{ backgroundColor: template.backgroundColor || '#0f172a' }}
        >
          {/* Template Header */}
          {template.headerTitle && (
            <div className="h-14 bg-slate-900/90 border-b border-slate-700/80 px-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tv className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-black text-white">{template.headerTitle}</h2>
              </div>
              <div className="flex items-center gap-6 font-mono text-sm text-slate-300">
                <span className="font-bold text-white text-base">{currentTime}</span>
                <span>{hijriDate}</span>
              </div>
            </div>
          )}

          {/* Template Zones Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Area */}
            <div className="flex-1 p-6 flex flex-col justify-center items-center relative overflow-hidden bg-black/40">
              {currentItem ? (
                <>
                  {currentItem.media?.fileType === 'image' && (
                    <img
                      key={currentItem.id}
                      src={currentItem.media.fileUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-2xl shadow-2xl transition-opacity duration-700"
                    />
                  )}
                  {currentItem.media?.fileType === 'video' && (
                    <video
                      key={currentItem.id}
                      ref={videoRef}
                      src={currentItem.media.fileUrl}
                      autoPlay
                      muted={currentItem.isMuted}
                      loop
                      playsInline
                      className="w-full h-full object-cover rounded-2xl shadow-2xl"
                    />
                  )}
                </>
              ) : (
                <div className="text-center text-slate-500">
                  <Tv className="w-16 h-16 mx-auto mb-2 opacity-30" />
                  <p>جاري تحميل المحتوى...</p>
                </div>
              )}
            </div>

            {/* Sidebar Widgets (Queue & Clock) */}
            {template.layout === 'split_3_sidebar' && (
              <div className="w-96 bg-slate-900/95 border-r border-slate-800 p-6 flex flex-col justify-between space-y-6">
                {/* Queue Display Box */}
                <div className="bg-gradient-to-br from-indigo-900/90 via-slate-900 to-indigo-950 p-6 rounded-3xl border-2 border-indigo-500/40 text-center shadow-2xl">
                  <div className="flex items-center justify-center gap-2 text-indigo-300 font-bold text-sm mb-2">
                    <UsersRound className="w-5 h-5 text-amber-400" />
                    <span>الرقم المستدعى حالياً</span>
                  </div>
                  <div className="text-6xl font-black font-mono text-amber-400 tracking-wider my-2">
                    A-104
                  </div>
                  <div className="text-sm text-slate-200 font-semibold mt-2">
                    عيادة الاستشارات الطبية 3
                  </div>
                </div>

                {/* Live Clock & Weather Widget */}
                <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-indigo-400 text-xs font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>التوقيت والطقس المباشر</span>
                  </div>
                  <div className="text-3xl font-black font-mono text-white tracking-widest">
                    {currentTime}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
                    <CloudSun className="w-4 h-4 text-amber-400" />
                    <span>الرياض • 32°C سماء صافية</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Ticker Marquee */}
          <div className="h-12 bg-indigo-950/95 border-t border-indigo-900/50 flex items-center px-6 overflow-hidden">
            <div className="flex items-center gap-3 text-sm font-bold text-indigo-200 whitespace-nowrap animate-ticker">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 pulse-green" />
              <span className="text-amber-300">تنبيهات هامة:</span>
              <span>
                {template.zones?.find((z: any) => z.type === 'ticker')?.text ||
                  '🩺 نتمنى لكم وافر الصحة والعافية • مواعيد العمل الرسمية من 8:00 صباحاً حتى 10:00 مساءً • لحجز المواعيد يرجى مراجعة الاستقبال'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Direct Playlist Mode (Full Screen) */
        <div className="w-full h-full relative flex items-center justify-center bg-black">
          {currentItem ? (
            <>
              {currentItem.media?.fileType === 'image' && (
                <img
                  key={currentItem.id}
                  src={currentItem.media.fileUrl}
                  alt=""
                  className="w-full h-full object-cover animate-in fade-in duration-700"
                />
              )}

              {currentItem.media?.fileType === 'video' && (
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
              )}

              {currentItem.media?.fileType === 'web_url' && (
                <iframe
                  src={currentItem.media.fileUrl}
                  className="w-full h-full border-0"
                  title="Web Player"
                />
              )}

              {currentItem.media?.fileType === 'ticker_text' && (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-950 via-slate-900 to-[#0b0f19] flex items-center justify-center p-12 text-center">
                  <p className="text-3xl md:text-5xl font-black text-white max-w-4xl leading-relaxed">
                    {currentItem.media.customTickerText}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-slate-500">
              <Tv className="w-16 h-16 mx-auto mb-2 opacity-30 text-indigo-400" />
              <p className="text-sm font-semibold">بث المحتوى المباشر</p>
            </div>
          )}
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
    </div>
  );
}
