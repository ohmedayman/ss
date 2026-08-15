import { getDb, isFirebaseConfigured } from './firebase/admin';
import type { CollectionReference, Query } from 'firebase-admin/firestore';
import {
  Organization,
  User,
  Branch,
  Screen,
  ScreenCommand,
  MediaItem,
  Playlist,
  PlaylistItem,
  ScreenTemplate,
  Schedule,
  ActivityLog,
  QueueService,
  QueueTicket,
  CommandType,
} from './types';

export interface DatabaseSchema {
  organizations: Organization[];
  users: User[];
  branches: Branch[];
  screens: Screen[];
  screenCommands: ScreenCommand[];
  media: MediaItem[];
  playlists: Playlist[];
  templates: ScreenTemplate[];
  schedules: Schedule[];
  activityLogs: ActivityLog[];
  queueServices: QueueService[];
  queueTickets: QueueTicket[];
}

export const DEFAULT_ORG_ID = 'org-screenflow-demo';
export const DEFAULT_USER_ID = 'usr-admin-1';

// ============================================================
// In-memory seed data (used as a local fallback + to seed Firestore)
// ============================================================
function getInitialData(): DatabaseSchema {
  const now = new Date().toISOString();
  const orgId = DEFAULT_ORG_ID;
  const userId = DEFAULT_USER_ID;
  const branchRiyadh = 'br-riyadh-main';
  const branchJeddah = 'br-jeddah-1';

  const defaultMedia: MediaItem[] = [
    {
      id: 'med-1',
      organizationId: orgId,
      name: 'عرض الصيف الترويجي 2026',
      fileType: 'image',
      fileUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 2450000,
      durationSeconds: 10,
      width: 1920,
      height: 1080,
      folder: 'إعلانات',
      tags: ['صيف', 'خصومات', 'رئيسي'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      updatedAt: now,
    },
    {
      id: 'med-2',
      organizationId: orgId,
      name: 'فيديو تقديم المنتجات الذكية',
      fileType: 'video',
      fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 14800000,
      durationSeconds: 15,
      width: 1920,
      height: 1080,
      folder: 'فيديو',
      tags: ['منتجات', 'فيديو', 'جودة_عالية'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: now,
    },
    {
      id: 'med-3',
      organizationId: orgId,
      name: 'قائمة المشروبات والقهوة المختصة',
      fileType: 'image',
      fileUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 3120000,
      durationSeconds: 12,
      width: 1920,
      height: 1080,
      folder: 'قوائم الطعام',
      tags: ['قهوة', 'منيو', 'مطاعم'],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: now,
    },
    {
      id: 'med-4',
      organizationId: orgId,
      name: 'شريط الأخبار والتنبيهات المباشر',
      fileType: 'ticker_text',
      fileUrl: '',
      customTickerText: '🎉 مرحباً بكم في منصة ScreenFlow - خصم خاص 20% على جميع اشتراكات الشركات والمتاجر خلال هذا الشهر! 🌟 نتمنى لكم تجربة مميزة وممتعة.',
      fileSizeBytes: 256,
      durationSeconds: 20,
      folder: 'نصوص إعلانية',
      tags: ['شريط_متحرك', 'تنبيهات'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-5',
      organizationId: orgId,
      name: 'موقع طقس الخليج والمناخ',
      fileType: 'web_url',
      fileUrl: 'https://weather.com',
      thumbnailUrl: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 1024,
      durationSeconds: 30,
      folder: 'روابط ويب',
      tags: ['طقس', 'موقع'],
      createdAt: now,
      updatedAt: now,
    }
  ];

  const defaultPlaylists: Playlist[] = [
    {
      id: 'pl-general-ads',
      organizationId: orgId,
      name: 'قائمة الإعلانات الرئيسية (Main Ads Playlist)',
      description: 'تعرض عروض الصيف وفيديو المنتجات وقائمة القهوة بالتناوب',
      isLoop: true,
      defaultTransition: 'fade',
      totalDurationSeconds: 37,
      items: [
        {
          id: 'pli-1', playlistId: 'pl-general-ads', mediaId: 'med-1', media: defaultMedia[0],
          orderIndex: 0, durationSeconds: 10, transition: 'fade', isMuted: true,
        },
        {
          id: 'pli-2', playlistId: 'pl-general-ads', mediaId: 'med-2', media: defaultMedia[1],
          orderIndex: 1, durationSeconds: 15, transition: 'slide_left', isMuted: false,
        },
        {
          id: 'pli-3', playlistId: 'pl-general-ads', mediaId: 'med-3', media: defaultMedia[2],
          orderIndex: 2, durationSeconds: 12, transition: 'fade', isMuted: true,
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: now,
    },
    {
      id: 'pl-offers-morning',
      organizationId: orgId,
      name: 'قائمة العروض الصباحية',
      description: 'قائمة خاصة بساعات الصباح الباكر',
      isLoop: true,
      defaultTransition: 'slide_right',
      totalDurationSeconds: 22,
      items: [
        {
          id: 'pli-4', playlistId: 'pl-offers-morning', mediaId: 'med-3', media: defaultMedia[2],
          orderIndex: 0, durationSeconds: 12, transition: 'fade', isMuted: true,
        },
        {
          id: 'pli-5', playlistId: 'pl-offers-morning', mediaId: 'med-1', media: defaultMedia[0],
          orderIndex: 1, durationSeconds: 10, transition: 'slide_left', isMuted: true,
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: now,
    }
  ];

  const defaultTemplates: ScreenTemplate[] = [
    {
      id: 'tpl-clinic-waiting',
      organizationId: orgId,
      name: 'قالب العيادات وصالات الانتظار (مع أرقام الانتظار والطقس)',
      layout: 'split_3_sidebar',
      backgroundColor: '#0f172a',
      headerTitle: 'مجمع الأفق الطبي الاستشاري',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-main', title: 'المنطقة الرئيسية (فيديو وتوعية صحية)', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-sidebar-top', title: 'شاشة أرقام الانتظار الحالية', type: 'queue_display', options: { serviceCode: 'A', title: 'الرقم الحالي' } },
        { id: 'zone-sidebar-clock', title: 'الساعة والطقس والتقويم الهجري', type: 'clock', options: { showWeather: true, city: 'الرياض' } },
        { id: 'zone-bottom-ticker', title: 'الشريط الإخباري المتحرك', type: 'ticker', text: '🩺 نسعى دائماً لخدمتكم بأعلى معايير الرعاية الصحية • مواعيد العيادات المسائية تبدأ من الساعة 4:00 عصراً • للشكاوى والاستفسارات اتصل على الرقم المجاني 800-12345' }
      ],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: now,
    },
    {
      id: 'tpl-menu-board',
      organizationId: orgId,
      name: 'قالب شاشات المطاعم والمقاهي (Menu Board)',
      layout: 'split_2_horizontal',
      backgroundColor: '#18181b',
      headerTitle: 'كافيه الأفق - النكهة الأصيلة',
      thumbnailUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-menu-media', title: 'عرض الأصناف والوجبات', type: 'media', contentId: 'med-3' },
        { id: 'zone-menu-ticker', title: 'العروض الخاصة والخصومات', type: 'ticker', text: '☕ احصل على كوكيز مجاني مع كل كوب قهوة مختصة • العرض ساري حتى نهاية الأسبوع!' }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: genId('tpl'),
      organizationId: orgId,
      name: 'قالب المطاعم والمقاهي (Restaurant Menu Board)',
      layout: 'menu_board',
      backgroundColor: '#1c1917',
      headerTitle: 'مطعم الديوان - أشهى المأكولات العربية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-restaurant-media', title: 'عرض الأصناف والوجبات', type: 'media', contentId: 'med-3' },
        { id: 'zone-restaurant-ticker', title: 'العروض والخصومات', type: 'ticker', text: '🍽️ عرض الغداء المميز: وجبة كاملة بـ 39 ريال فقط! • مشروبات مجانية مع الوجبات العائلية • الخصم يشمل جميع أصناف القائمة الجديدة' },
        { id: 'zone-restaurant-clock', title: 'الساعة وساعات العمل', type: 'clock', options: { showWeather: false } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: genId('tpl'),
      organizationId: orgId,
      name: 'قالب المتاجر والسوبرماركت (Retail Promo)',
      layout: 'retail_promo',
      backgroundColor: '#1e3a5f',
      headerTitle: 'هايبر ماركت الأفق - عروض لا تُفوَّت',
      thumbnailUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-retail-playlist', title: 'العرض الرئيسي للمنتجات', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-retail-countdown', title: 'العرض اللحظي - سعر خاص لفترة محدودة', type: 'countdown', options: { targetDate: '2026-12-31', label: 'نهاية العروض' } },
        { id: 'zone-retail-ticker', title: 'شريط عروض المتجر', type: 'ticker', text: '🛒 خصم 50% على جميع منتجات العناية بالبشرة • شراء 2احصل على 1 مجاناً على الخضروات والفواكه الطازجة • عرض نهاية الأسبوع: توصيل مجاني للطلبات فوق 200 ريال' }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: genId('tpl'),
      organizationId: orgId,
      name: 'قالب الشركات والمكاتب (Corporate)',
      layout: 'corporate',
      backgroundColor: '#0f172a',
      headerTitle: 'شركة الأفق للحلول الرقمية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-corp-playlist', title: 'عرض مشاريع وإنجازات الشركة', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-corp-clock', title: 'الساعة والتقويم', type: 'clock', options: { showWeather: true, city: 'الرياض' } },
        { id: 'zone-corp-ticker', title: 'آخر أخبار الشركة والقطاع', type: 'ticker', text: '📊 نتائج الربع الأول: نمو 35% في الإيرادات • إطلاق منصة جديدة للتجارة الإلكترونية قريباً • توظيف 20 موظف جديد في أقسام التطوير والتصميم' },
        { id: 'zone-corp-qr', title: 'تواصل معنا عبر QR', type: 'qr_display', options: { qrUrl: 'https://screenflow.app', label: 'امسح للطلب' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: genId('tpl'),
      organizationId: orgId,
      name: 'قالب المساجد (Mosque)',
      layout: 'mosque',
      backgroundColor: '#1a4731',
      headerTitle: 'مسجد الرحمة - أوقات الصلاة',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-mosque-prayer', title: 'أوقات الصلاة الحالية والقادمة', type: 'prayer_times', options: { city: 'الرياض', method: 'UmmAlQura' } },
        { id: 'zone-mosque-clock', title: 'الساعة والتاريخ الهجري', type: 'clock', options: { showWeather: false } },
        { id: 'zone-mosque-ticker', title: 'إعلانات المسجد وال activities', type: 'ticker', text: '🕌 صلاة الجمعة الساعة 12:15 ظهراً • درس ديني بعد صلاة المغرب يومياً • مجمع الخيرات مفتوح للنساء يوم السبت والأحد من 9 صباحاً' }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: genId('tpl'),
      organizationId: orgId,
      name: 'قالب الصالات الرياضية (Gym)',
      layout: 'gym',
      backgroundColor: '#18181b',
      headerTitle: 'صالة فيت برو - تحدي جديد كل يوم',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-gym-playlist', title: 'فيديوهات التمارين والتدريب', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-gym-countdown', title: 'التمارين الجماعية القادمة', type: 'countdown', options: { targetDate: '2026-12-31', label: 'بداية التمرين' } },
        { id: 'zone-gym-clock', title: 'الساعة وأوقات العمل', type: 'clock', options: { showWeather: true, city: 'الرياض' } },
        { id: 'zone-gym-ticker', title: 'نصائح رياضية وhealth tips', type: 'ticker', text: '💪 تمرين اليوم: قوة الأطراف العلوية - 4 مجموعات x 12 تكرار • نصيحة: اشرب 3 لتر ماء يومياً • عرض الأعضاء الجدد: دورة تأهيل مجانية مع أي اشتراك سنوي' }
      ],
      createdAt: now,
      updatedAt: now,
    }
  ];

  const defaultScreens: Screen[] = [
    {
      id: 'scr-1', organizationId: orgId, branchId: branchRiyadh, name: 'شاشة الاستقبال الرئيسية - الرياض',
      registrationCode: 'SF-1082', pairingToken: 'tok_scr_1_demo', isPaired: true, status: 'online',
      lastHeartbeatAt: new Date(Date.now() - 5000).toISOString(), ipAddress: '192.168.1.105', appVersion: 'v1.4.2',
      orientation: 'landscape', resolution: '1920x1080', activeContentType: 'playlist', activeContentId: 'pl-general-ads',
      screenshotUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=640&q=70',
      lastScreenshotAt: new Date(Date.now() - 60000).toISOString(), volume: 80, brightness: 100,
      notes: 'مثبتة على الجدار في المدخل الرئيسي بجوار المصاعد', tags: ['استقبال', 'الرياض', 'رئيسية'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(), updatedAt: now,
    },
    {
      id: 'scr-2', organizationId: orgId, branchId: branchRiyadh, name: 'شاشة صالة الانتظار والعيادات',
      registrationCode: 'SF-4491', pairingToken: 'tok_scr_2_demo', isPaired: true, status: 'online',
      lastHeartbeatAt: new Date(Date.now() - 12000).toISOString(), ipAddress: '192.168.1.112', appVersion: 'v1.4.2',
      orientation: 'landscape', resolution: '1920x1080', activeContentType: 'template', activeContentId: 'tpl-clinic-waiting',
      screenshotUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=640&q=70',
      lastScreenshotAt: new Date(Date.now() - 180000).toISOString(), volume: 65, brightness: 90,
      notes: 'شاشة الانتظار المربوطة بنظام التنبيه الصوتي وأرقام الانتظار', tags: ['عيادات', 'انتظار', 'صوت'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), updatedAt: now,
    },
    {
      id: 'scr-3', organizationId: orgId, branchId: branchJeddah, name: 'شاشة المنيو والعروض - فرع جدة',
      registrationCode: 'SF-7734', pairingToken: 'tok_scr_3_demo', isPaired: true, status: 'offline',
      lastHeartbeatAt: new Date(Date.now() - 3600000 * 3).toISOString(), ipAddress: '10.0.4.15', appVersion: 'v1.4.0',
      orientation: 'portrait', resolution: '1080x1920', activeContentType: 'template', activeContentId: 'tpl-menu-board',
      screenshotUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=640&q=70',
      lastScreenshotAt: new Date(Date.now() - 3600000 * 4).toISOString(), volume: 0, brightness: 85,
      notes: 'شاشة عمودية بجانب الكاشير', tags: ['جدة', 'منيو', 'عمودية'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(), updatedAt: now,
    },
    {
      id: 'scr-unpaired-demo', organizationId: orgId, name: 'شاشة تجريبية جديدة (جاهزة للاقتران)',
      registrationCode: 'SF-2026', isPaired: false, status: 'offline',
      orientation: 'landscape', resolution: '1920x1080', activeContentType: 'playlist', volume: 75, brightness: 100,
      notes: 'افتح صفحة /player وأدخل كود SF-2026 لربطها وتجربة البث المباشر فوراً', tags: ['جديدة', 'غير_مقترنة'],
      createdAt: now, updatedAt: now,
    }
  ];

  const defaultSchedules: Schedule[] = [
    {
      id: 'sch-1', organizationId: orgId, name: 'جدول العروض الصباحية (الأحد إلى الخميس)',
      targetType: 'playlist', targetId: 'pl-offers-morning', screenIds: ['scr-1'],
      startDate: '2026-01-01', endDate: '2026-12-31', startTime: '08:00', endTime: '12:00',
      daysOfWeek: [0, 1, 2, 3, 4], priority: 1, isActive: true,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), updatedAt: now,
    }
  ];

  const defaultLogs: ActivityLog[] = [
    { id: 'log-1', organizationId: orgId, userId, userName: 'أحمد عبد الله', action: 'إسناد قائمة تشغيل', actionType: 'playlist', details: 'تم تعيين قائمة "قائمة الإعلانات الرئيسية" على شاشة الاستقبال الرئيسية', ipAddress: '192.168.1.50', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'log-2', organizationId: orgId, userId, userName: 'أحمد عبد الله', action: 'إرسال أمر للشاشة', actionType: 'screen', details: 'إرسال أمر تحديث فوري (Reload) إلى شاشة صالة الانتظار', ipAddress: '192.168.1.50', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
    { id: 'log-3', organizationId: orgId, userId, userName: 'أحمد عبد الله', action: 'رفع وسائط جديدة', actionType: 'media', details: 'تم رفع صورة "عرض الصيف الترويجي 2026"', ipAddress: '192.168.1.50', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
    { id: 'log-4', organizationId: orgId, userId, userName: 'أحمد عبد الله', action: 'تسجيل دخول ناجح', actionType: 'auth', details: 'تم تسجيل الدخول إلى لوحة التحكم بنجاح', ipAddress: '192.168.1.50', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() }
  ];

  const defaultQueueServices: QueueService[] = [
    { id: 'qs-1', organizationId: orgId, branchId: branchRiyadh, name: 'عيادة الاستشارات العامة', codePrefix: 'A', currentNumber: 104, lastCalledNumber: 104, averageWaitMinutes: 8, isActive: true },
    { id: 'qs-2', organizationId: orgId, branchId: branchRiyadh, name: 'قسم المختبر والتحاليل', codePrefix: 'B', currentNumber: 42, lastCalledNumber: 42, averageWaitMinutes: 5, isActive: true },
    { id: 'qs-3', organizationId: orgId, branchId: branchRiyadh, name: 'الصيدلية وصرف الأدوية', codePrefix: 'C', currentNumber: 78, lastCalledNumber: 78, averageWaitMinutes: 4, isActive: true }
  ];

  const defaultQueueTickets: QueueTicket[] = [
    { id: 'tkt-1', organizationId: orgId, serviceId: 'qs-1', serviceName: 'عيادة الاستشارات العامة', ticketNumber: 'A-104', status: 'serving', counterNumber: 'عيادة 3', calledAt: new Date(Date.now() - 120000).toISOString(), createdAt: new Date(Date.now() - 600000).toISOString() },
    { id: 'tkt-2', organizationId: orgId, serviceId: 'qs-1', serviceName: 'عيادة الاستشارات العامة', ticketNumber: 'A-105', status: 'waiting', createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: 'tkt-3', organizationId: orgId, serviceId: 'qs-2', serviceName: 'قسم المختبر والتحاليل', ticketNumber: 'B-42', status: 'serving', counterNumber: 'مختبر 1', calledAt: new Date(Date.now() - 60000).toISOString(), createdAt: new Date(Date.now() - 400000).toISOString() }
  ];

  return {
    organizations: [
      { id: orgId, name: 'مجموعة الأفق للحلول الرقمية', slug: 'al-ofuq', logoUrl: '', plan: 'pro', storageLimitMb: 10240, storageUsedBytes: 20370000, maxScreens: 25, createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(), updatedAt: now }
    ],
    users: [
      { id: userId, organizationId: orgId, email: 'admin@screenflow.io', fullName: 'أحمد بن عبد الله آل سعود', role: 'owner', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', phone: '+966 50 123 4567', isActive: true, lastLoginAt: now, createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString() }
    ],
    branches: [
      { id: branchRiyadh, organizationId: orgId, name: 'الفرع الرئيسي - الرياض (طريق الملك فهد)', city: 'الرياض', address: 'برج الأفق، الطابق 14', phone: '011-4567890', isActive: true },
      { id: branchJeddah, organizationId: orgId, name: 'فرع جدة (حي الروضة)', city: 'جدة', address: 'شارع الأمير سلطان', phone: '012-6543210', isActive: true }
    ],
    screens: defaultScreens,
    screenCommands: [],
    media: defaultMedia,
    playlists: defaultPlaylists,
    templates: defaultTemplates,
    schedules: defaultSchedules,
    activityLogs: defaultLogs,
    queueServices: defaultQueueServices,
    queueTickets: defaultQueueTickets,
  };
}

export { getInitialData };

// ============================================================
// Common Database interface (all methods async for serverless)
// ============================================================
export interface Database {
  getData(): Promise<DatabaseSchema>;

  getScreens(orgId: string): Promise<Screen[]>;
  getScreenById(id: string): Promise<Screen | undefined>;
  getScreenByCode(code: string): Promise<Screen | undefined>;
  getScreenByToken(token: string): Promise<Screen | undefined>;
  createScreen(data: Omit<Screen, 'id' | 'createdAt' | 'updatedAt'>): Promise<Screen>;
  updateScreen(id: string, updates: Partial<Screen>): Promise<Screen | null>;
  deleteScreen(id: string, orgId: string): Promise<boolean>;

  addCommand(cmd: Omit<ScreenCommand, 'id' | 'createdAt'>): Promise<ScreenCommand>;
  getPendingCommands(screenId: string): Promise<ScreenCommand[]>;
  markCommandExecuted(commandId: string): Promise<void>;

  getMedia(orgId: string): Promise<MediaItem[]>;
  getMediaById(id: string): Promise<MediaItem | undefined>;
  createMedia(item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaItem>;
  deleteMedia(id: string, orgId: string): Promise<boolean>;

  getPlaylists(orgId: string): Promise<Playlist[]>;
  getPlaylistById(id: string): Promise<Playlist | undefined>;
  createPlaylist(pl: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Playlist>;
  updatePlaylist(id: string, updates: Partial<Playlist>): Promise<Playlist | null>;
  deletePlaylist(id: string, orgId: string): Promise<boolean>;

  getTemplates(orgId: string): Promise<ScreenTemplate[]>;
  getTemplateById(id: string): Promise<ScreenTemplate | undefined>;
  createTemplate(tpl: Omit<ScreenTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScreenTemplate>;
  updateTemplate(id: string, updates: Partial<ScreenTemplate>): Promise<ScreenTemplate | null>;
  deleteTemplate(id: string, orgId: string): Promise<boolean>;

  getSchedules(orgId: string): Promise<Schedule[]>;
  createSchedule(sch: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule>;
  updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule | null>;
  deleteSchedule(id: string, orgId: string): Promise<boolean>;

  logActivity(log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog>;
  getActivityLogs(orgId: string, limit?: number): Promise<ActivityLog[]>;

  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: Organization): Promise<Organization>;
  updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;
  createUser(user: User): Promise<User>;

  setDocument(collection: string, id: string, data: object): Promise<void>;

  getQueueServices(orgId: string): Promise<QueueService[]>;
  getQueueTickets(orgId: string): Promise<QueueTicket[]>;
  callNextTicket(serviceId: string, counterNumber: string): Promise<QueueTicket | null>;

  seedIfEmpty(): Promise<void>;
}

function genId(prefix: string): string {
  return prefix + '-' + Math.random().toString(36).substring(2, 9);
}

// ============================================================
// Local (in-memory) fallback implementation
// ============================================================
class LocalDatabase implements Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = getInitialData();
  }

  async seedIfEmpty() {}

  async getData(): Promise<DatabaseSchema> {
    return this.data;
  }

  async getScreens(orgId: string) {
    return this.data.screens.filter(s => s.organizationId === orgId);
  }
  async getScreenById(id: string) {
    return this.data.screens.find(s => s.id === id);
  }
  async getScreenByCode(code: string) {
    const clean = code.trim().toUpperCase();
    return this.data.screens.find(s => s.registrationCode.toUpperCase() === clean);
  }
  async getScreenByToken(token: string) {
    return this.data.screens.find(s => s.pairingToken === token);
  }
  async createScreen(screenData: Omit<Screen, 'id' | 'createdAt' | 'updatedAt'>) {
    const newScreen: Screen = {
      ...screenData,
      id: genId('scr'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.screens.unshift(newScreen);
    return newScreen;
  }
  async updateScreen(id: string, updates: Partial<Screen>) {
    const idx = this.data.screens.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.screens[idx] = { ...this.data.screens[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.data.screens[idx];
  }
  async deleteScreen(id: string, orgId: string) {
    const prev = this.data.screens.length;
    this.data.screens = this.data.screens.filter(s => !(s.id === id && s.organizationId === orgId));
    return this.data.screens.length < prev;
  }

  async addCommand(cmd: Omit<ScreenCommand, 'id' | 'createdAt'>) {
    const newCmd: ScreenCommand = { ...cmd, id: genId('cmd'), createdAt: new Date().toISOString() };
    this.data.screenCommands.push(newCmd);
    return newCmd;
  }
  async getPendingCommands(screenId: string) {
    return this.data.screenCommands.filter(c => c.screenId === screenId && c.status === 'pending');
  }
  async markCommandExecuted(commandId: string) {
    const cmd = this.data.screenCommands.find(c => c.id === commandId);
    if (cmd) { cmd.status = 'executed'; cmd.executedAt = new Date().toISOString(); }
  }

  async getMedia(orgId: string) {
    return this.data.media.filter(m => m.organizationId === orgId);
  }
  async getMediaById(id: string) {
    return this.data.media.find(m => m.id === id);
  }
  async createMedia(item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const newMedia: MediaItem = { ...item, id: genId('med'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.data.media.unshift(newMedia);
    const org = this.data.organizations.find(o => o.id === item.organizationId);
    if (org) org.storageUsedBytes += item.fileSizeBytes;
    return newMedia;
  }
  async deleteMedia(id: string, orgId: string) {
    const item = this.data.media.find(m => m.id === id && m.organizationId === orgId);
    if (!item) return false;
    this.data.media = this.data.media.filter(m => m.id !== id);
    const org = this.data.organizations.find(o => o.id === orgId);
    if (org) org.storageUsedBytes = Math.max(0, org.storageUsedBytes - item.fileSizeBytes);
    return true;
  }

  async getPlaylists(orgId: string) {
    return this.data.playlists.filter(p => p.organizationId === orgId);
  }
  async getPlaylistById(id: string) {
    return this.data.playlists.find(p => p.id === id);
  }
  async createPlaylist(pl: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>) {
    const newPl: Playlist = { ...pl, id: genId('pl'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.data.playlists.unshift(newPl);
    return newPl;
  }
  async updatePlaylist(id: string, updates: Partial<Playlist>) {
    const idx = this.data.playlists.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.playlists[idx] = { ...this.data.playlists[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.data.playlists[idx];
  }
  async deletePlaylist(id: string, orgId: string) {
    const prev = this.data.playlists.length;
    this.data.playlists = this.data.playlists.filter(p => !(p.id === id && p.organizationId === orgId));
    return this.data.playlists.length < prev;
  }

  async getTemplates(orgId: string) {
    return this.data.templates.filter(t => t.organizationId === orgId);
  }
  async getTemplateById(id: string) {
    return this.data.templates.find(t => t.id === id);
  }
  async createTemplate(tpl: Omit<ScreenTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTpl: ScreenTemplate = { ...tpl, id: genId('tpl'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.data.templates.unshift(newTpl);
    return newTpl;
  }
  async updateTemplate(id: string, updates: Partial<ScreenTemplate>) {
    const idx = this.data.templates.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.templates[idx] = { ...this.data.templates[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.data.templates[idx];
  }
  async deleteTemplate(id: string, orgId: string) {
    const prev = this.data.templates.length;
    this.data.templates = this.data.templates.filter(t => !(t.id === id && t.organizationId === orgId));
    return this.data.templates.length < prev;
  }

  async getSchedules(orgId: string) {
    return this.data.schedules.filter(s => s.organizationId === orgId);
  }
  async createSchedule(sch: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) {
    const newSch: Schedule = { ...sch, id: genId('sch'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.data.schedules.unshift(newSch);
    return newSch;
  }
  async updateSchedule(id: string, updates: Partial<Schedule>) {
    const idx = this.data.schedules.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.schedules[idx] = { ...this.data.schedules[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.data.schedules[idx];
  }
  async deleteSchedule(id: string, orgId: string) {
    const prev = this.data.schedules.length;
    this.data.schedules = this.data.schedules.filter(s => !(s.id === id && s.organizationId === orgId));
    return this.data.schedules.length < prev;
  }

  async logActivity(log: Omit<ActivityLog, 'id' | 'createdAt'>) {
    const newLog: ActivityLog = { ...log, id: genId('log'), createdAt: new Date().toISOString() };
    this.data.activityLogs.unshift(newLog);
    if (this.data.activityLogs.length > 200) this.data.activityLogs.pop();
    return newLog;
  }
  async getActivityLogs(orgId: string, limit = 50) {
    return this.data.activityLogs.filter(l => l.organizationId === orgId).slice(0, limit);
  }

  async getOrganization(id: string) {
    return this.data.organizations.find(o => o.id === id);
  }
  async updateOrganization(id: string, updates: Partial<Organization>) {
    const idx = this.data.organizations.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.data.organizations[idx] = { ...this.data.organizations[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.data.organizations[idx];
  }
  async getUser(id: string) {
    return this.data.users.find(u => u.id === id);
  }
  async getUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  async updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    return this.data.users[idx];
  }
  async createUser(user: User) {
    this.data.users.push(user);
    return user;
  }
  async createOrganization(org: Organization) {
    this.data.organizations.push(org);
    return org;
  }
  async setDocument(collection: string, id: string, data: object) {
    // Generic document set for seeding
    const anyData = this.data as any;
    if (!anyData[collection]) anyData[collection] = [];
    const arr = anyData[collection] as any[];
    const idx = arr.findIndex((d: any) => d.id === id);
    if (idx >= 0) arr[idx] = { ...arr[idx], ...data, id };
    else arr.push({ ...data, id });
  }

  async getQueueServices(orgId: string) {
    return this.data.queueServices.filter(q => q.organizationId === orgId);
  }
  async getQueueTickets(orgId: string) {
    return this.data.queueTickets.filter(t => t.organizationId === orgId);
  }
  async callNextTicket(serviceId: string, counterNumber: string) {
    const service = this.data.queueServices.find(s => s.id === serviceId);
    if (!service) return null;
    service.currentNumber += 1;
    service.lastCalledNumber = service.currentNumber;
    const ticketNumber = `${service.codePrefix}-${service.currentNumber}`;
    const newTicket: QueueTicket = {
      id: genId('tkt'), organizationId: service.organizationId, serviceId: service.id, serviceName: service.name,
      ticketNumber, status: 'called', counterNumber, calledAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    };
    this.data.queueTickets.unshift(newTicket);
    return newTicket;
  }
}

// ============================================================
// Firestore implementation (production / Vercel)
// ============================================================
const COLLECTIONS = {
  organizations: 'organizations',
  users: 'users',
  branches: 'branches',
  screens: 'screens',
  screenCommands: 'screen_commands',
  media: 'media',
  playlists: 'playlists',
  templates: 'templates',
  schedules: 'schedules',
  activityLogs: 'activity_logs',
  queueServices: 'queue_services',
  queueTickets: 'queue_tickets',
} as const;

class FirestoreDatabase implements Database {
  async seedIfEmpty() {
    const seed = getInitialData();
    const fs = await getDb();

    const orgSnap = await fs.collection(COLLECTIONS.organizations).get();
    if (!orgSnap.empty) return;

    const batch = fs.batch();
    (Object.keys(seed) as (keyof DatabaseSchema)[]).forEach((key) => {
      const items = seed[key];
      const col = fs.collection(COLLECTIONS[key]) as CollectionReference;
      items.forEach((item: any) => {
        const docRef = col.doc(item.id);
        batch.set(docRef, { ...item });
      });
    });
    await batch.commit();
  }

  private async list<T>(collection: string, field?: string, value?: string): Promise<T[]> {
    const fs = await getDb();
    let query: Query = fs.collection(collection);
    if (field && value !== undefined) query = query.where(field, '==', value);
    const snap = await query.get();
    return snap.docs.map(d => ({ ...(d.data() as object), id: d.id }) as T);
  }

  private async getById<T>(collection: string, id: string): Promise<T | undefined> {
    const fs = await getDb();
    const doc = await fs.collection(collection).doc(id).get();
    if (!doc.exists) return undefined;
    return { ...(doc.data() as object), id: doc.id } as T;
  }

  private async setDoc(collection: string, id: string, data: object) {
    const fs = await getDb();
    await fs.collection(collection).doc(id).set({ ...data, id } as object, { merge: true });
  }

  async getData(): Promise<DatabaseSchema> {
    const [organizations, users, branches, screens, screenCommands, media, playlists, templates, schedules, activityLogs, queueServices, queueTickets] = await Promise.all([
      this.list<Organization>(COLLECTIONS.organizations),
      this.list<User>(COLLECTIONS.users),
      this.list<Branch>(COLLECTIONS.branches),
      this.list<Screen>(COLLECTIONS.screens),
      this.list<ScreenCommand>(COLLECTIONS.screenCommands),
      this.list<MediaItem>(COLLECTIONS.media),
      this.list<Playlist>(COLLECTIONS.playlists),
      this.list<ScreenTemplate>(COLLECTIONS.templates),
      this.list<Schedule>(COLLECTIONS.schedules),
      this.list<ActivityLog>(COLLECTIONS.activityLogs),
      this.list<QueueService>(COLLECTIONS.queueServices),
      this.list<QueueTicket>(COLLECTIONS.queueTickets),
    ]);
    return { organizations, users, branches, screens, screenCommands, media, playlists, templates, schedules, activityLogs, queueServices, queueTickets };
  }

  async getScreens(orgId: string) {
    return this.list<Screen>(COLLECTIONS.screens, 'organizationId', orgId);
  }
  async getScreenById(id: string) {
    return this.getById<Screen>(COLLECTIONS.screens, id);
  }
  async getScreenByCode(code: string) {
    const clean = code.trim().toUpperCase();
    const fs = await getDb();
    const snap = await fs.collection(COLLECTIONS.screens).where('registrationCode', '==', clean).get();
    const doc = snap.docs[0];
    return doc ? ({ ...(doc.data() as object), id: doc.id } as Screen) : undefined;
  }
  async getScreenByToken(token: string) {
    const fs = await getDb();
    const snap = await fs.collection(COLLECTIONS.screens).where('pairingToken', '==', token).get();
    const doc = snap.docs[0];
    return doc ? ({ ...(doc.data() as object), id: doc.id } as Screen) : undefined;
  }
  async createScreen(data: Omit<Screen, 'id' | 'createdAt' | 'updatedAt'>) {
    const screen: Screen = { ...data, id: genId('scr'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.screens, screen.id, screen);
    return screen;
  }
  async updateScreen(id: string, updates: Partial<Screen>) {
    const existing = await this.getById<Screen>(COLLECTIONS.screens, id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.screens, id, updated);
    return updated;
  }
  async deleteScreen(id: string, orgId: string) {
    const existing = await this.getById<Screen>(COLLECTIONS.screens, id);
    if (!existing || existing.organizationId !== orgId) return false;
    await (await getDb()).collection(COLLECTIONS.screens).doc(id).delete();
    return true;
  }

  async addCommand(cmd: Omit<ScreenCommand, 'id' | 'createdAt'>) {
    const newCmd: ScreenCommand = { ...cmd, id: genId('cmd'), createdAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.screenCommands, newCmd.id, newCmd);
    return newCmd;
  }
  async getPendingCommands(screenId: string) {
    const fs = await getDb();
    const snap = await fs.collection(COLLECTIONS.screenCommands).where('status', '==', 'pending').get();
    return snap.docs
      .map((d: any) => ({ ...(d.data() as object), id: d.id }) as ScreenCommand)
      .filter((c: ScreenCommand) => c.screenId === screenId);
  }
  async markCommandExecuted(commandId: string) {
    const existing = await this.getById<ScreenCommand>(COLLECTIONS.screenCommands, commandId);
    if (existing) {
      await this.setDoc(COLLECTIONS.screenCommands, commandId, { ...existing, status: 'executed', executedAt: new Date().toISOString() });
    }
  }

  async getMedia(orgId: string) {
    return this.list<MediaItem>(COLLECTIONS.media, 'organizationId', orgId);
  }
  async getMediaById(id: string) {
    return this.getById<MediaItem>(COLLECTIONS.media, id);
  }
  async createMedia(item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const newMedia: MediaItem = { ...item, id: genId('med'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.media, newMedia.id, newMedia);
    const org = await this.getById<Organization>(COLLECTIONS.organizations, item.organizationId);
    if (org) await this.setDoc(COLLECTIONS.organizations, org.id, { ...org, storageUsedBytes: (org.storageUsedBytes || 0) + item.fileSizeBytes });
    return newMedia;
  }
  async deleteMedia(id: string, orgId: string) {
    const item = await this.getById<MediaItem>(COLLECTIONS.media, id);
    if (!item || item.organizationId !== orgId) return false;
    await (await getDb()).collection(COLLECTIONS.media).doc(id).delete();
    const org = await this.getById<Organization>(COLLECTIONS.organizations, orgId);
    if (org) await this.setDoc(COLLECTIONS.organizations, org.id, { ...org, storageUsedBytes: Math.max(0, (org.storageUsedBytes || 0) - item.fileSizeBytes) });
    return true;
  }

  async getPlaylists(orgId: string) {
    return this.list<Playlist>(COLLECTIONS.playlists, 'organizationId', orgId);
  }
  async getPlaylistById(id: string) {
    return this.getById<Playlist>(COLLECTIONS.playlists, id);
  }
  async createPlaylist(pl: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>) {
    const newPl: Playlist = { ...pl, id: genId('pl'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.playlists, newPl.id, newPl);
    return newPl;
  }
  async updatePlaylist(id: string, updates: Partial<Playlist>) {
    const existing = await this.getById<Playlist>(COLLECTIONS.playlists, id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.playlists, id, updated);
    return updated;
  }
  async deletePlaylist(id: string, orgId: string) {
    const existing = await this.getById<Playlist>(COLLECTIONS.playlists, id);
    if (!existing || existing.organizationId !== orgId) return false;
    await (await getDb()).collection(COLLECTIONS.playlists).doc(id).delete();
    return true;
  }

  async getTemplates(orgId: string) {
    return this.list<ScreenTemplate>(COLLECTIONS.templates, 'organizationId', orgId);
  }
  async getTemplateById(id: string) {
    return this.getById<ScreenTemplate>(COLLECTIONS.templates, id);
  }
  async createTemplate(tpl: Omit<ScreenTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTpl: ScreenTemplate = { ...tpl, id: genId('tpl'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.templates, newTpl.id, newTpl);
    return newTpl;
  }
  async updateTemplate(id: string, updates: Partial<ScreenTemplate>) {
    const existing = await this.getById<ScreenTemplate>(COLLECTIONS.templates, id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.templates, id, updated);
    return updated;
  }
  async deleteTemplate(id: string, orgId: string) {
    const existing = await this.getById<ScreenTemplate>(COLLECTIONS.templates, id);
    if (!existing || existing.organizationId !== orgId) return false;
    await (await getDb()).collection(COLLECTIONS.templates).doc(id).delete();
    return true;
  }

  async getSchedules(orgId: string) {
    return this.list<Schedule>(COLLECTIONS.schedules, 'organizationId', orgId);
  }
  async createSchedule(sch: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) {
    const newSch: Schedule = { ...sch, id: genId('sch'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.schedules, newSch.id, newSch);
    return newSch;
  }
  async updateSchedule(id: string, updates: Partial<Schedule>) {
    const existing = await this.getById<Schedule>(COLLECTIONS.schedules, id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.schedules, id, updated);
    return updated;
  }
  async deleteSchedule(id: string, orgId: string) {
    const existing = await this.getById<Schedule>(COLLECTIONS.schedules, id);
    if (!existing || existing.organizationId !== orgId) return false;
    await (await getDb()).collection(COLLECTIONS.schedules).doc(id).delete();
    return true;
  }

  async logActivity(log: Omit<ActivityLog, 'id' | 'createdAt'>) {
    const newLog: ActivityLog = { ...log, id: genId('log'), createdAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.activityLogs, newLog.id, newLog);
    return newLog;
  }
  async getActivityLogs(orgId: string, limit = 50) {
    const fs = await getDb();
    const snap = await fs.collection(COLLECTIONS.activityLogs).where('organizationId', '==', orgId).get();
    return snap.docs
      .map((d: any) => ({ ...(d.data() as object), id: d.id }) as ActivityLog)
      .sort((a: ActivityLog, b: ActivityLog) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, limit);
  }

  async getOrganization(id: string) {
    return this.getById<Organization>(COLLECTIONS.organizations, id);
  }
  async updateOrganization(id: string, updates: Partial<Organization>) {
    const existing = await this.getById<Organization>(COLLECTIONS.organizations, id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.organizations, id, updated);
    return updated;
  }
  async getUser(id: string) {
    return this.getById<User>(COLLECTIONS.users, id);
  }
  async getUserByEmail(email: string) {
    const fs = await getDb();
    const snap = await fs.collection(COLLECTIONS.users).where('email', '==', email.toLowerCase()).get();
    const doc = snap.docs[0];
    return doc ? ({ ...(doc.data() as object), id: doc.id } as User) : undefined;
  }
  async updateUser(id: string, updates: Partial<User>) {
    const existing = await this.getById<User>(COLLECTIONS.users, id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    await this.setDoc(COLLECTIONS.users, id, updated);
    return updated;
  }
  async createUser(user: User) {
    await this.setDoc(COLLECTIONS.users, user.id, user);
    return user;
  }
  async createOrganization(org: Organization) {
    await this.setDoc(COLLECTIONS.organizations, org.id, org);
    return org;
  }
  async setDocument(collection: string, id: string, data: object) {
    const fs = await getDb();
    await fs.collection(collection).doc(id).set({ ...data, id } as object, { merge: true });
  }

  async getQueueServices(orgId: string) {
    return this.list<QueueService>(COLLECTIONS.queueServices, 'organizationId', orgId);
  }
  async getQueueTickets(orgId: string) {
    return this.list<QueueTicket>(COLLECTIONS.queueTickets, 'organizationId', orgId);
  }
  async callNextTicket(serviceId: string, counterNumber: string) {
    const service = await this.getById<QueueService>(COLLECTIONS.queueServices, serviceId);
    if (!service) return null;
    const newNumber = (service.currentNumber || 0) + 1;
    await this.setDoc(COLLECTIONS.queueServices, serviceId, { ...service, currentNumber: newNumber, lastCalledNumber: newNumber });
    const ticket: QueueTicket = {
      id: genId('tkt'), organizationId: service.organizationId, serviceId: service.id, serviceName: service.name,
      ticketNumber: `${service.codePrefix}-${newNumber}`, status: 'called', counterNumber,
      calledAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    };
    await this.setDoc(COLLECTIONS.queueTickets, ticket.id, ticket);
    return ticket;
  }
}

// ============================================================
// Singleton selection
// ============================================================
declare global {
  var __screenflow_db: Database | undefined;
}

export const db: Database = isFirebaseConfigured() ? new FirestoreDatabase() : new LocalDatabase();

export function isUsingFirestore(): boolean {
  return isFirebaseConfigured();
}
