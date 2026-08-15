import fs from 'fs';
import path from 'path';
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

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Default Seed Data
function getInitialData(): DatabaseSchema {
  const now = new Date().toISOString();
  const orgId = 'org-screenflow-demo';
  const userId = 'usr-admin-1';
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
          id: 'pli-1',
          playlistId: 'pl-general-ads',
          mediaId: 'med-1',
          media: defaultMedia[0],
          orderIndex: 0,
          durationSeconds: 10,
          transition: 'fade',
          isMuted: true,
        },
        {
          id: 'pli-2',
          playlistId: 'pl-general-ads',
          mediaId: 'med-2',
          media: defaultMedia[1],
          orderIndex: 1,
          durationSeconds: 15,
          transition: 'slide_left',
          isMuted: false,
        },
        {
          id: 'pli-3',
          playlistId: 'pl-general-ads',
          mediaId: 'med-3',
          media: defaultMedia[2],
          orderIndex: 2,
          durationSeconds: 12,
          transition: 'fade',
          isMuted: true,
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
          id: 'pli-4',
          playlistId: 'pl-offers-morning',
          mediaId: 'med-3',
          media: defaultMedia[2],
          orderIndex: 0,
          durationSeconds: 12,
          transition: 'fade',
          isMuted: true,
        },
        {
          id: 'pli-5',
          playlistId: 'pl-offers-morning',
          mediaId: 'med-1',
          media: defaultMedia[0],
          orderIndex: 1,
          durationSeconds: 10,
          transition: 'slide_left',
          isMuted: true,
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
        {
          id: 'zone-main',
          title: 'المنطقة الرئيسية (فيديو وتوعية صحية)',
          type: 'playlist',
          contentId: 'pl-general-ads',
        },
        {
          id: 'zone-sidebar-top',
          title: 'شاشة أرقام الانتظار الحالية',
          type: 'queue_display',
          options: { serviceCode: 'A', title: 'الرقم الحالي' }
        },
        {
          id: 'zone-sidebar-clock',
          title: 'الساعة والطقس والتقويم الهجري',
          type: 'clock',
          options: { showWeather: true, city: 'الرياض' }
        },
        {
          id: 'zone-bottom-ticker',
          title: 'الشريط الإخباري المتحرك',
          type: 'ticker',
          text: '🩺 نسعى دائماً لخدمتكم بأعلى معايير الرعاية الصحية • مواعيد العيادات المسائية تبدأ من الساعة 4:00 عصراً • للشكاوى والاستفسارات اتصل على الرقم المجاني 800-12345'
        }
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
        {
          id: 'zone-menu-media',
          title: 'عرض الأصناف والوجبات',
          type: 'media',
          contentId: 'med-3',
        },
        {
          id: 'zone-menu-ticker',
          title: 'العروض الخاصة والخصومات',
          type: 'ticker',
          text: '☕ احصل على كوكيز مجاني مع كل كوب قهوة مختصة • العرض ساري حتى نهاية الأسبوع!'
        }
      ],
      createdAt: now,
      updatedAt: now,
    }
  ];

  const defaultScreens: Screen[] = [
    {
      id: 'scr-1',
      organizationId: orgId,
      branchId: branchRiyadh,
      name: 'شاشة الاستقبال الرئيسية - الرياض',
      registrationCode: 'SF-1082',
      pairingToken: 'tok_scr_1_demo',
      isPaired: true,
      status: 'online',
      lastHeartbeatAt: new Date(Date.now() - 5000).toISOString(),
      ipAddress: '192.168.1.105',
      appVersion: 'v1.4.2',
      orientation: 'landscape',
      resolution: '1920x1080',
      activeContentType: 'playlist',
      activeContentId: 'pl-general-ads',
      screenshotUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=640&q=70',
      lastScreenshotAt: new Date(Date.now() - 60000).toISOString(),
      volume: 80,
      brightness: 100,
      notes: 'مثبتة على الجدار في المدخل الرئيسي بجوار المصاعد',
      tags: ['استقبال', 'الرياض', 'رئيسية'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      updatedAt: now,
    },
    {
      id: 'scr-2',
      organizationId: orgId,
      branchId: branchRiyadh,
      name: 'شاشة صالة الانتظار والعيادات',
      registrationCode: 'SF-4491',
      pairingToken: 'tok_scr_2_demo',
      isPaired: true,
      status: 'online',
      lastHeartbeatAt: new Date(Date.now() - 12000).toISOString(),
      ipAddress: '192.168.1.112',
      appVersion: 'v1.4.2',
      orientation: 'landscape',
      resolution: '1920x1080',
      activeContentType: 'template',
      activeContentId: 'tpl-clinic-waiting',
      screenshotUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=640&q=70',
      lastScreenshotAt: new Date(Date.now() - 180000).toISOString(),
      volume: 65,
      brightness: 90,
      notes: 'شاشة الانتظار المربوطة بنظام التنبيه الصوتي وأرقام الانتظار',
      tags: ['عيادات', 'انتظار', 'صوت'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      updatedAt: now,
    },
    {
      id: 'scr-3',
      organizationId: orgId,
      branchId: branchJeddah,
      name: 'شاشة المنيو والعروض - فرع جدة',
      registrationCode: 'SF-7734',
      pairingToken: 'tok_scr_3_demo',
      isPaired: true,
      status: 'offline',
      lastHeartbeatAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      ipAddress: '10.0.4.15',
      appVersion: 'v1.4.0',
      orientation: 'portrait',
      resolution: '1080x1920',
      activeContentType: 'template',
      activeContentId: 'tpl-menu-board',
      screenshotUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=640&q=70',
      lastScreenshotAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      volume: 0,
      brightness: 85,
      notes: 'شاشة عمودية بجانب الكاشير',
      tags: ['جدة', 'منيو', 'عمودية'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
      updatedAt: now,
    },
    {
      id: 'scr-unpaired-demo',
      organizationId: orgId,
      name: 'شاشة تجريبية جديدة (جاهزة للاقتران)',
      registrationCode: 'SF-2026',
      isPaired: false,
      status: 'offline',
      orientation: 'landscape',
      resolution: '1920x1080',
      activeContentType: 'playlist',
      volume: 75,
      brightness: 100,
      notes: 'افتح صفحة /player وأدخل كود SF-2026 لربطها وتجربة البث المباشر فوراً',
      tags: ['جديدة', 'غير_مقترنة'],
      createdAt: now,
      updatedAt: now,
    }
  ];

  const defaultSchedules: Schedule[] = [
    {
      id: 'sch-1',
      organizationId: orgId,
      name: 'جدول العروض الصباحية (الأحد إلى الخميس)',
      targetType: 'playlist',
      targetId: 'pl-offers-morning',
      screenIds: ['scr-1'],
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      startTime: '08:00',
      endTime: '12:00',
      daysOfWeek: [0, 1, 2, 3, 4], // Sun - Thu
      priority: 1,
      isActive: true,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: now,
    }
  ];

  const defaultLogs: ActivityLog[] = [
    {
      id: 'log-1',
      organizationId: orgId,
      userId: userId,
      userName: 'أحمد عبد الله',
      action: 'إسناد قائمة تشغيل',
      actionType: 'playlist',
      details: 'تم تعيين قائمة "قائمة الإعلانات الرئيسية" على شاشة الاستقبال الرئيسية',
      ipAddress: '192.168.1.50',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'log-2',
      organizationId: orgId,
      userId: userId,
      userName: 'أحمد عبد الله',
      action: 'إرسال أمر للشاشة',
      actionType: 'screen',
      details: 'إرسال أمر تحديث فوري (Reload) إلى شاشة صالة الانتظار',
      ipAddress: '192.168.1.50',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'log-3',
      organizationId: orgId,
      userId: userId,
      userName: 'أحمد عبد الله',
      action: 'رفع وسائط جديدة',
      actionType: 'media',
      details: 'تم رفع صورة "عرض الصيف الترويجي 2026"',
      ipAddress: '192.168.1.50',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'log-4',
      organizationId: orgId,
      userId: userId,
      userName: 'أحمد عبد الله',
      action: 'تسجيل دخول ناجح',
      actionType: 'auth',
      details: 'تم تسجيل الدخول إلى لوحة التحكم بنجاح',
      ipAddress: '192.168.1.50',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    }
  ];

  const defaultQueueServices: QueueService[] = [
    {
      id: 'qs-1',
      organizationId: orgId,
      branchId: branchRiyadh,
      name: 'عيادة الاستشارات العامة',
      codePrefix: 'A',
      currentNumber: 104,
      lastCalledNumber: 104,
      averageWaitMinutes: 8,
      isActive: true,
    },
    {
      id: 'qs-2',
      organizationId: orgId,
      branchId: branchRiyadh,
      name: 'قسم المختبر والتحاليل',
      codePrefix: 'B',
      currentNumber: 42,
      lastCalledNumber: 42,
      averageWaitMinutes: 5,
      isActive: true,
    },
    {
      id: 'qs-3',
      organizationId: orgId,
      branchId: branchRiyadh,
      name: 'الصيدلية وصرف الأدوية',
      codePrefix: 'C',
      currentNumber: 78,
      lastCalledNumber: 78,
      averageWaitMinutes: 4,
      isActive: true,
    }
  ];

  const defaultQueueTickets: QueueTicket[] = [
    {
      id: 'tkt-1',
      organizationId: orgId,
      serviceId: 'qs-1',
      serviceName: 'عيادة الاستشارات العامة',
      ticketNumber: 'A-104',
      status: 'serving',
      counterNumber: 'عيادة 3',
      calledAt: new Date(Date.now() - 120000).toISOString(),
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 'tkt-2',
      organizationId: orgId,
      serviceId: 'qs-1',
      serviceName: 'عيادة الاستشارات العامة',
      ticketNumber: 'A-105',
      status: 'waiting',
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 'tkt-3',
      organizationId: orgId,
      serviceId: 'qs-2',
      serviceName: 'قسم المختبر والتحاليل',
      ticketNumber: 'B-42',
      status: 'serving',
      counterNumber: 'مختبر 1',
      calledAt: new Date(Date.now() - 60000).toISOString(),
      createdAt: new Date(Date.now() - 400000).toISOString(),
    }
  ];

  return {
    organizations: [
      {
        id: orgId,
        name: 'مجموعة الأفق للحلول الرقمية',
        slug: 'al-ofuq',
        logoUrl: '',
        plan: 'pro',
        storageLimitMb: 10240, // 10 GB
        storageUsedBytes: 20370000, // ~20.3 MB
        maxScreens: 25,
        createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
        updatedAt: now,
      }
    ],
    users: [
      {
        id: userId,
        organizationId: orgId,
        email: 'admin@screenflow.io',
        fullName: 'أحمد بن عبد الله آل سعود',
        role: 'owner',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        phone: '+966 50 123 4567',
        isActive: true,
        lastLoginAt: now,
        createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
      }
    ],
    branches: [
      {
        id: branchRiyadh,
        organizationId: orgId,
        name: 'الفرع الرئيسي - الرياض (طريق الملك فهد)',
        city: 'الرياض',
        address: 'برج الأفق، الطابق 14',
        phone: '011-4567890',
        isActive: true,
      },
      {
        id: branchJeddah,
        organizationId: orgId,
        name: 'فرع جدة (حي الروضة)',
        city: 'جدة',
        address: 'شارع الأمير سلطان',
        phone: '012-6543210',
        isActive: true,
      }
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

class Database {
  private data: DatabaseSchema;
  private isSaving: boolean = false;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.error('Error loading database file, falling back to seed data:', e);
    }
    const seed = getInitialData();
    this.saveDataDirect(seed);
    return seed;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  public save() {
    if (this.isSaving) return;
    this.isSaving = true;
    setTimeout(() => {
      this.saveDataDirect(this.data);
      this.isSaving = false;
    }, 50);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // --- Screens operations ---
  public getScreens(orgId: string): Screen[] {
    return this.data.screens.filter(s => s.organizationId === orgId);
  }

  public getScreenById(id: string): Screen | undefined {
    return this.data.screens.find(s => s.id === id);
  }

  public getScreenByCode(code: string): Screen | undefined {
    const clean = code.trim().toUpperCase();
    return this.data.screens.find(s => s.registrationCode.toUpperCase() === clean);
  }

  public getScreenByToken(token: string): Screen | undefined {
    return this.data.screens.find(s => s.pairingToken === token);
  }

  public createScreen(screenData: Omit<Screen, 'id' | 'createdAt' | 'updatedAt'>): Screen {
    const newScreen: Screen = {
      ...screenData,
      id: 'scr-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.screens.unshift(newScreen);
    this.save();
    return newScreen;
  }

  public updateScreen(id: string, updates: Partial<Screen>): Screen | null {
    const idx = this.data.screens.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.screens[idx] = {
      ...this.data.screens[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.screens[idx];
  }

  public deleteScreen(id: string, orgId: string): boolean {
    const prevLen = this.data.screens.length;
    this.data.screens = this.data.screens.filter(s => !(s.id === id && s.organizationId === orgId));
    const deleted = this.data.screens.length < prevLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Commands ---
  public addCommand(cmd: Omit<ScreenCommand, 'id' | 'createdAt'>): ScreenCommand {
    const newCmd: ScreenCommand = {
      ...cmd,
      id: 'cmd-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.data.screenCommands.push(newCmd);
    this.save();
    return newCmd;
  }

  public getPendingCommands(screenId: string): ScreenCommand[] {
    return this.data.screenCommands.filter(c => c.screenId === screenId && c.status === 'pending');
  }

  public markCommandExecuted(commandId: string) {
    const cmd = this.data.screenCommands.find(c => c.id === commandId);
    if (cmd) {
      cmd.status = 'executed';
      cmd.executedAt = new Date().toISOString();
      this.save();
    }
  }

  // --- Media ---
  public getMedia(orgId: string): MediaItem[] {
    return this.data.media.filter(m => m.organizationId === orgId);
  }

  public getMediaById(id: string): MediaItem | undefined {
    return this.data.media.find(m => m.id === id);
  }

  public createMedia(item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): MediaItem {
    const newMedia: MediaItem = {
      ...item,
      id: 'med-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.media.unshift(newMedia);
    
    // Update org storage
    const org = this.data.organizations.find(o => o.id === item.organizationId);
    if (org) {
      org.storageUsedBytes += item.fileSizeBytes;
    }
    
    this.save();
    return newMedia;
  }

  public deleteMedia(id: string, orgId: string): boolean {
    const item = this.data.media.find(m => m.id === id && m.organizationId === orgId);
    if (!item) return false;
    
    this.data.media = this.data.media.filter(m => m.id !== id);
    const org = this.data.organizations.find(o => o.id === orgId);
    if (org) {
      org.storageUsedBytes = Math.max(0, org.storageUsedBytes - item.fileSizeBytes);
    }
    this.save();
    return true;
  }

  // --- Playlists ---
  public getPlaylists(orgId: string): Playlist[] {
    return this.data.playlists.filter(p => p.organizationId === orgId);
  }

  public getPlaylistById(id: string): Playlist | undefined {
    return this.data.playlists.find(p => p.id === id);
  }

  public createPlaylist(pl: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>): Playlist {
    const newPl: Playlist = {
      ...pl,
      id: 'pl-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.playlists.unshift(newPl);
    this.save();
    return newPl;
  }

  public updatePlaylist(id: string, updates: Partial<Playlist>): Playlist | null {
    const idx = this.data.playlists.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.playlists[idx] = {
      ...this.data.playlists[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.playlists[idx];
  }

  public deletePlaylist(id: string, orgId: string): boolean {
    const prev = this.data.playlists.length;
    this.data.playlists = this.data.playlists.filter(p => !(p.id === id && p.organizationId === orgId));
    const deleted = this.data.playlists.length < prev;
    if (deleted) this.save();
    return deleted;
  }

  // --- Templates ---
  public getTemplates(orgId: string): ScreenTemplate[] {
    return this.data.templates.filter(t => t.organizationId === orgId);
  }

  public getTemplateById(id: string): ScreenTemplate | undefined {
    return this.data.templates.find(t => t.id === id);
  }

  public createTemplate(tpl: Omit<ScreenTemplate, 'id' | 'createdAt' | 'updatedAt'>): ScreenTemplate {
    const newTpl: ScreenTemplate = {
      ...tpl,
      id: 'tpl-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.templates.unshift(newTpl);
    this.save();
    return newTpl;
  }

  public updateTemplate(id: string, updates: Partial<ScreenTemplate>): ScreenTemplate | null {
    const idx = this.data.templates.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.templates[idx] = {
      ...this.data.templates[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.templates[idx];
  }

  public deleteTemplate(id: string, orgId: string): boolean {
    const prev = this.data.templates.length;
    this.data.templates = this.data.templates.filter(t => !(t.id === id && t.organizationId === orgId));
    const deleted = this.data.templates.length < prev;
    if (deleted) this.save();
    return deleted;
  }

  // --- Schedules ---
  public getSchedules(orgId: string): Schedule[] {
    return this.data.schedules.filter(s => s.organizationId === orgId);
  }

  public createSchedule(sch: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Schedule {
    const newSch: Schedule = {
      ...sch,
      id: 'sch-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.schedules.unshift(newSch);
    this.save();
    return newSch;
  }

  public updateSchedule(id: string, updates: Partial<Schedule>): Schedule | null {
    const idx = this.data.schedules.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.schedules[idx] = {
      ...this.data.schedules[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.schedules[idx];
  }

  public deleteSchedule(id: string, orgId: string): boolean {
    const prev = this.data.schedules.length;
    this.data.schedules = this.data.schedules.filter(s => !(s.id === id && s.organizationId === orgId));
    const deleted = this.data.schedules.length < prev;
    if (deleted) this.save();
    return deleted;
  }

  // --- Activity Logs ---
  public logActivity(log: Omit<ActivityLog, 'id' | 'createdAt'>) {
    const newLog: ActivityLog = {
      ...log,
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.data.activityLogs.unshift(newLog);
    if (this.data.activityLogs.length > 200) {
      this.data.activityLogs.pop();
    }
    this.save();
    return newLog;
  }

  public getActivityLogs(orgId: string, limit = 50): ActivityLog[] {
    return this.data.activityLogs.filter(l => l.organizationId === orgId).slice(0, limit);
  }

  // --- Organizations & Users ---
  public getOrganization(id: string): Organization | undefined {
    return this.data.organizations.find(o => o.id === id);
  }

  public updateOrganization(id: string, updates: Partial<Organization>): Organization | null {
    const idx = this.data.organizations.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.data.organizations[idx] = {
      ...this.data.organizations[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.organizations[idx];
  }

  public getUser(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
    };
    this.save();
    return this.data.users[idx];
  }

  // --- Future Queue Services ---
  public getQueueServices(orgId: string): QueueService[] {
    return this.data.queueServices.filter(q => q.organizationId === orgId);
  }

  public getQueueTickets(orgId: string): QueueTicket[] {
    return this.data.queueTickets.filter(t => t.organizationId === orgId);
  }

  public callNextTicket(serviceId: string, counterNumber: string): QueueTicket | null {
    const service = this.data.queueServices.find(s => s.id === serviceId);
    if (!service) return null;
    
    service.currentNumber += 1;
    service.lastCalledNumber = service.currentNumber;
    
    const ticketNumber = `${service.codePrefix}-${service.currentNumber}`;
    const newTicket: QueueTicket = {
      id: 'tkt-' + Math.random().toString(36).substring(2, 9),
      organizationId: service.organizationId,
      serviceId: service.id,
      serviceName: service.name,
      ticketNumber,
      status: 'called',
      counterNumber,
      calledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.data.queueTickets.unshift(newTicket);
    this.save();
    return newTicket;
  }
}

// Global Singleton for Database
declare global {
  var __screenflow_db: Database | undefined;
}

export const db = global.__screenflow_db || new Database();
if (process.env.NODE_ENV !== 'production') {
  global.__screenflow_db = db;
}
