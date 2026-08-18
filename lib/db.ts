import fs from 'fs';
import path from 'path';
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
      name: 'فيديو تحضير القهوة واللاتيه آرت',
      fileType: 'video',
      fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 14800000,
      durationSeconds: 15,
      width: 1920,
      height: 1080,
      folder: 'فيديو ترويجي',
      tags: ['قهوة', 'كافيه', 'فيديو'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: now,
    },
    {
      id: 'med-3',
      organizationId: orgId,
      name: 'قائمة المشروبات والقهوة المختصة (4K)',
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
    },
    {
      id: 'med-6',
      organizationId: orgId,
      name: 'فيديو شوي البرجر والوجبات الشهية',
      fileType: 'video',
      fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 15400000,
      durationSeconds: 15,
      width: 1920,
      height: 1080,
      folder: 'مطاعم وكافيهات',
      tags: ['برجر', 'وجبات', 'فيديو'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-7',
      organizationId: orgId,
      name: 'بوستر التخفيضات الكبرى 50% (Big Sale)',
      fileType: 'image',
      fileUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 2980000,
      durationSeconds: 10,
      width: 1920,
      height: 1080,
      folder: 'متاجر وتجزئة',
      tags: ['عروض', 'تخفيضات', 'متاجر'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-8',
      organizationId: orgId,
      name: 'فيديو عروض الأزياء والموضة العصرية',
      fileType: 'video',
      fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 16100000,
      durationSeconds: 15,
      width: 1920,
      height: 1080,
      folder: 'متاجر وتجزئة',
      tags: ['أزياء', 'موضة', 'فيديو'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-9',
      organizationId: orgId,
      name: 'بوستر العناية بالأسنان والرعاية الطبية',
      fileType: 'image',
      fileUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1920&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 2750000,
      durationSeconds: 12,
      width: 1920,
      height: 1080,
      folder: 'عيادات وصحة',
      tags: ['عيادات', 'أسنان', 'طب'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-10',
      organizationId: orgId,
      name: 'فيديو الرعاية الصحية لصالات الانتظار',
      fileType: 'video',
      fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 18900000,
      durationSeconds: 20,
      width: 1920,
      height: 1080,
      folder: 'عيادات وصحة',
      tags: ['عيادات', 'انتظار', 'توعية'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-11',
      organizationId: orgId,
      name: 'فيديو الأبراج والمشاريع العقارية الفاخرة',
      fileType: 'video',
      fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 16800000,
      durationSeconds: 15,
      width: 1920,
      height: 1080,
      folder: 'شركات وعقارات',
      tags: ['عقارات', 'أبراج', 'استثمار'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-12',
      organizationId: orgId,
      name: 'بوستر مؤتمر الأعمال والابتكار 2026',
      fileType: 'image',
      fileUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 3150000,
      durationSeconds: 10,
      width: 1920,
      height: 1080,
      folder: 'شركات وعقارات',
      tags: ['مؤتمر', 'أعمال', 'ابتكار'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-13',
      organizationId: orgId,
      name: 'شاشة البث الإخباري المباشر',
      fileType: 'web_url',
      fileUrl: 'https://www.alarabiya.net',
      thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=60',
      fileSizeBytes: 2048,
      durationSeconds: 45,
      folder: 'روابط ويب',
      tags: ['أخبار', 'عاجل', 'مباشر'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med-14',
      organizationId: orgId,
      name: 'شريط عروض المطاعم والوجبات السريعة',
      fileType: 'ticker_text',
      fileUrl: '',
      customTickerText: '🍔 عرض الغداء المميز: اطلب وجبة برجر دبل واحصل على مقبلات ومشروب مجاناً • نكهاتنا لا تُقاوم • خدمة التوصيل السريع متاحة عبر التطبيق',
      fileSizeBytes: 256,
      durationSeconds: 15,
      folder: 'نصوص إعلانية',
      tags: ['شريط', 'مطاعم', 'عروض'],
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
      id: 'tpl-store-tools',
      organizationId: orgId,
      name: 'قالب محل الأدوات المنزلية',
      layout: 'retail_promo',
      backgroundColor: '#1a1a2e',
      headerTitle: 'عالم الأدوات المنزلية - عروض لا تُفوَّت',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-tools-main', title: 'عرض المنتجات والعروض', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-tools-ticker', title: 'شريط العروض', type: 'ticker', text: '🔧 خصم 30% على جميع أدوات الكهرباء • شراء 3 أدوات واحصل على 1 مجاناً • توصيل مجاني للطلبات فوق 150 ريال' },
        { id: 'zone-tools-clock', title: 'الساعة وأوقات العمل', type: 'clock', options: { showWeather: true, city: 'الرياض' } },
        { id: 'zone-tools-qr', title: 'تواصل معنا', type: 'qr_display', options: { qrUrl: 'https://screenflow.app', label: 'للطلب والاستفسار' } }
      ],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: now,
    },
    {
      id: 'tpl-clinic-waiting',
      organizationId: orgId,
      name: 'قالب العيادات وصالات الانتظار',
      layout: 'split_3_sidebar',
      backgroundColor: '#0f172a',
      headerTitle: 'مجمع الأفق الطبي الاستشاري',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-main', title: 'المنطقة الرئيسية', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-sidebar-top', title: 'شاشة أرقام الانتظار', type: 'queue_display', options: { serviceCode: 'A', title: 'الرقم الحالي' } },
        { id: 'zone-sidebar-clock', title: 'الساعة والطقس', type: 'clock', options: { showWeather: true, city: 'الرياض' } },
        { id: 'zone-bottom-ticker', title: 'الشريط الإخباري', type: 'ticker', text: '🩺 نسعى دائماً لخدمتكم بأعلى معايير الرعاية الصحية • مواعيد العيادات المسائية تبدأ من الساعة 4:00 عصراً' }
      ],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: now,
    },
    {
      id: 'tpl-menu-board',
      organizationId: orgId,
      name: 'قالب المطاعم والمقاهي',
      layout: 'split_2_horizontal',
      backgroundColor: '#18181b',
      headerTitle: 'كافيه الأفق - النكهة الأصيلة',
      thumbnailUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-menu-media', title: 'عرض الأصناف', type: 'media', contentId: 'med-3' },
        { id: 'zone-menu-ticker', title: 'العروض الخاصة', type: 'ticker', text: '☕ احصل على كوكيز مجاني مع كل كوب قهوة مختصة • العرض ساري حتى نهاية الأسبوع!' }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-retail-promo',
      organizationId: orgId,
      name: 'قالب المتاجر والسوبرماركت',
      layout: 'retail_promo',
      backgroundColor: '#1e3a5f',
      headerTitle: 'هايبر ماركت الأفق - عروض لا تُفوَّت',
      thumbnailUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-retail-playlist', title: 'العرض الرئيسي', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-retail-countdown', title: 'عرض لحظي', type: 'countdown', options: { targetDate: '2026-12-31', label: 'نهاية العروض' } },
        { id: 'zone-retail-ticker', title: 'شريط العروض', type: 'ticker', text: '🛒 خصم 50% على جميع منتجات العناية بالبشرة • شراء 2احصل على 1 مجاناً على الخضروات والفواكه الطازجة' }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-electronics',
      organizationId: orgId,
      name: 'قالب متاجر الإلكترونيات',
      layout: 'split_2_vertical',
      backgroundColor: '#0a0a1a',
      headerTitle: 'محل الأفق للإلكترونيات',
      thumbnailUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-elec-main', title: 'عرض أحدث المنتجات', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-elec-ticker', title: 'العروض والخصومات', type: 'ticker', text: '📱 آيفون 16 برو بخصم 15% • سماعات AirPods بـ 399 ريال فقط • ضمان شامل لمدة سنتين على جميع الأجهزة' },
        { id: 'zone-elec-clock', title: 'الساعة', type: 'clock', options: { showWeather: true, city: 'الرياض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-real-estate',
      organizationId: orgId,
      name: 'قالب العقارات والتطوير العقاري',
      layout: 'corporate',
      backgroundColor: '#1a2332',
      headerTitle: 'شركة الأفق العقارية - أحلامك تبدأ من هنا',
      thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-re-main', title: 'مشاريعنا المميزة', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-re-ticker', title: 'فرص استثمارية', type: 'ticker', text: '🏢 فيلا فاخرة بحي الملقا بـ 1.2 مليون ريال • شقة استوديو في حي العليا 280 ألف ريال فقط • تقسيط حتى 5 سنوات بدون فوائد' },
        { id: 'zone-re-clock', title: 'الساعة والتقويم', type: 'clock', options: { showWeather: true, city: 'الرياض' } },
        { id: 'zone-re-qr', title: 'تصفح المشاريع', type: 'qr_display', options: { qrUrl: 'https://screenflow.app', label: 'تصفح العروض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-beauty-salon',
      organizationId: orgId,
      name: 'قالب الصالونات وغرف التجميل',
      layout: 'split_2_horizontal',
      backgroundColor: '#2d1b4e',
      headerTitle: 'صالون جلامور - جمالك أمانة',
      thumbnailUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-beauty-main', title: 'خدمات التجميل والعروض', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-beauty-ticker', title: 'العروض الحصرية', type: 'ticker', text: '💇‍♀️ قص وصبغة بـ 199 ريال فقط • مانيكير وباديكير مجاناً مع أي حجز • عرض العروسة: باقة كاملة بخصم 40%' },
        { id: 'zone-beauty-clock', title: 'الساعة وأوقات العمل', type: 'clock', options: { showWeather: true, city: 'الرياض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-hotel',
      organizationId: orgId,
      name: 'قالب الفنادق والمنتجعات',
      layout: 'corporate',
      backgroundColor: '#1a1a2e',
      headerTitle: 'فندق الأفق الذهبي - راحتك أولاً',
      thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-hotel-main', title: 'مرافق和服务 الفندق', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-hotel-ticker', title: 'العروض الفندقية', type: 'ticker', text: '🏨 غرفة مميزة بـ 299 ريال شامل الإفطار • باقة عائلية 3 ليالي بسعر 2 • وصول مبكر ومغادرة متأخرة مجاناً' },
        { id: 'zone-hotel-clock', title: 'الساعة ودرجة الحرارة', type: 'clock', options: { showWeather: true, city: 'الرياض' } },
        { id: 'zone-hotel-qr', title: 'حجز مباشر', type: 'qr_display', options: { qrUrl: 'https://screenflow.app', label: 'احجز الآن' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-pharmacy',
      organizationId: orgId,
      name: 'قالب الصيدليات',
      layout: 'split_2_vertical',
      backgroundColor: '#0a3d2a',
      headerTitle: 'صيدلية الشفاء - صحتك تبدأ من هنا',
      thumbnailUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-pharma-main', title: 'خدمات الصيدلية', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-pharma-ticker', title: 'نصائح صحية وعروض', type: 'ticker', text: '💊 فيتامينات مناعية بخصم 25% • قياس ضغط الدم مجاني يومياً • استشارة صيدلانية مجانية لجميع المرضى' },
        { id: 'zone-pharma-clock', title: 'الساعة وأوقات العمل', type: 'clock', options: { showWeather: true, city: 'الرياض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-school',
      organizationId: orgId,
      name: 'قالب المدارس والجامعات',
      layout: 'corporate',
      backgroundColor: '#1a2744',
      headerTitle: 'أكاديمية المستقبل - نبني الغد',
      thumbnailUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-school-main', title: 'أخبار المدرسة والأنشطة', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-school-ticker', title: 'إعلانات دراسية', type: 'ticker', text: '📚 امتحانات الفصل تبدأ الأسبوع القادم • مسابقة العلوم الأسبوع المقبل • رحلة ميدانية للطلاب يوم الخميس' },
        { id: 'zone-school-clock', title: 'الساعة والتقويم الدراسي', type: 'clock', options: { showWeather: true, city: 'الرياض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-car-showroom',
      organizationId: orgId,
      name: 'قالب معارض السيارات',
      layout: 'split_2_horizontal',
      backgroundColor: '#0a0a0a',
      headerTitle: 'معرض السيارات الأرقى',
      thumbnailUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-car-main', title: 'أحدث الموديلات', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-car-ticker', title: 'عروض السيارات', type: 'ticker', text: '🚗 تويوتا كامري 2026 بقسط 1,800 شهرياً • تأمين شامل مجاني لمدة سنة • صيانة مجانية لأول 30,000 كم' },
        { id: 'zone-car-clock', title: 'الساعة', type: 'clock', options: { showWeather: true, city: 'الرياض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-wedding',
      organizationId: orgId,
      name: 'قالب قاعات الأفراح والمناسبات',
      layout: 'full',
      backgroundColor: '#2d1b4e',
      headerTitle: 'قاعة الماسة - احتفالات لا تُنسى',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-wed-main', title: 'صور ومقاطع فيديو', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-wed-ticker', title: 'رسائل التهنئة', type: 'ticker', text: '🎉 مبارك للعروس والعريس • نتمنى لكم حياة سعيدة • اليوم نحتفل بزفاف الأسرة الكريمة' },
        { id: 'zone-wed-clock', title: 'الساعة والتقويم', type: 'clock', options: { showWeather: false } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-gym',
      organizationId: orgId,
      name: 'قالب الصالات الرياضية',
      layout: 'gym',
      backgroundColor: '#18181b',
      headerTitle: 'صالة فيت برو - تحدي جديد كل يوم',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-gym-playlist', title: 'فيديوهات التمارين', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-gym-countdown', title: 'التمارين القادمة', type: 'countdown', options: { targetDate: '2026-12-31', label: 'بداية التمرين' } },
        { id: 'zone-gym-clock', title: 'الساعة وأوقات العمل', type: 'clock', options: { showWeather: true, city: 'الرياض' } },
        { id: 'zone-gym-ticker', title: 'نصائح رياضية', type: 'ticker', text: '💪 تمرين اليوم: قوة الأطراف العلوية • نصيحة: اشرب 3 لتر ماء يومياً • عرض الأعضاء الجدد: دورة تأهيل مجانية' }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-mosque',
      organizationId: orgId,
      name: 'قالب المساجد',
      layout: 'mosque',
      backgroundColor: '#1a4731',
      headerTitle: 'مسجد الرحمة - أوقات الصلاة',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-mosque-prayer', title: 'أوقات الصلاة', type: 'prayer_times', options: { city: 'الرياض', method: 'UmmAlQura' } },
        { id: 'zone-mosque-clock', title: 'الساعة والتاريخ الهجري', type: 'clock', options: { showWeather: false } },
        { id: 'zone-mosque-ticker', title: 'إعلانات المسجد', type: 'ticker', text: '🕌 صلاة الجمعة الساعة 12:15 ظهراً • درس ديني بعد صلاة المغرب يومياً' }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-corporate',
      organizationId: orgId,
      name: 'قالب الشركات والمكاتب',
      layout: 'corporate',
      backgroundColor: '#0f172a',
      headerTitle: 'شركة الأفق للحلول الرقمية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-corp-playlist', title: 'مشاريع وإنجازات', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-corp-clock', title: 'الساعة والتقويم', type: 'clock', options: { showWeather: true, city: 'الرياض' } },
        { id: 'zone-corp-ticker', title: 'أخبار الشركة', type: 'ticker', text: '📊 نتائج الربع الأول: نمو 35% • إطلاق منصة جديدة للتجارة الإلكترونية قريباً • توظيف 20 موظف جديد' },
        { id: 'zone-corp-qr', title: 'تواصل معنا', type: 'qr_display', options: { qrUrl: 'https://screenflow.app', label: 'امسح للطلب' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-restaurant-menu',
      organizationId: orgId,
      name: 'قالب سوالف المنيو',
      layout: 'menu_board',
      backgroundColor: '#1c1917',
      headerTitle: 'مطعم الديوان - أشهى المأكولات العربية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-restaurant-media', title: 'عرض الأصناف', type: 'media', contentId: 'med-3' },
        { id: 'zone-restaurant-ticker', title: 'العروض والخصومات', type: 'ticker', text: '🍽️ عرض الغداء المميز: وجبة كاملة بـ 39 ريال فقط! • مشروبات مجانية مع الوجبات العائلية' },
        { id: 'zone-restaurant-clock', title: 'الساعة', type: 'clock', options: { showWeather: false } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-lunch-offers',
      organizationId: orgId,
      name: 'قالب عروض الغداء السريع',
      layout: 'split_2_horizontal',
      backgroundColor: '#2d1517',
      headerTitle: 'مطعم فست فود - وجبات سريعة لذيذة',
      thumbnailUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-lunch-media', title: 'الوجبات والمقوات', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-lunch-ticker', title: 'عروض الغداء', type: 'ticker', text: '🍔 برجر + بطاطس + مشروب = 29 ريال فقط! • عرض العائلة: 4 وجبات بـ 99 ريال • خصم 20% على الطلبات الإلكترونية' },
        { id: 'zone-lunch-clock', title: 'الساعة', type: 'clock', options: { showWeather: true, city: 'الرياض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-fresh-produce',
      organizationId: orgId,
      name: 'قالب الخضروات والفواكه الطازجة',
      layout: 'retail_promo',
      backgroundColor: '#1a3320',
      headerTitle: 'سوق الطازج - فواكه وخضروات طازجة يومياً',
      thumbnailUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-fresh-media', title: 'عرض المنتجات الطازجة', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-fresh-ticker', title: 'عروض يومية', type: 'ticker', text: '🍎 تفاح طازج 2 كيلو بـ 10 ريال • موز بـ 5 ريال للكيلو • عصير طبيعي بـ 8 ريال فقط' },
        { id: 'zone-fresh-clock', title: 'الساعة', type: 'clock', options: { showWeather: true, city: 'الرياض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-bakery',
      organizationId: orgId,
      name: 'قالب المخابز والحلويات',
      layout: 'split_2_vertical',
      backgroundColor: '#3d2b1f',
      headerTitle: 'مخبز الطازج - طعم أصيل منذ 1985',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-bakery-media', title: 'المنتجات والمعجنات', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-bakery-ticker', title: 'العروض اليومية', type: 'ticker', text: '🥐 كرواسون طازج بـ 3 ريال • عرض العائلة: 2 خبز عربي + صامولي بـ 5 ريال • كعكة اليوم 15 ريال فقط' },
        { id: 'zone-bakery-clock', title: 'الساعة وأوقات العمل', type: 'clock', options: { showWeather: true, city: 'الرياض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-clothing',
      organizationId: orgId,
      name: 'قالب متاجر الملابس',
      layout: 'split_2_horizontal',
      backgroundColor: '#1a1a2e',
      headerTitle: 'بوتيك الأناقة - ستايلك يعكس شخصيتك',
      thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-clothes-media', title: 'أحدث الموديلات', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-clothes-ticker', title: 'عروض الموضة', type: 'ticker', text: '👗 تخفيضات نهاية الموسم: خصم حتى 60% • شراء 3 قطع والرابعة مجاناً • تشكيلة الصيف الجديدة وصلت!' },
        { id: 'zone-clothes-clock', title: 'الساعة', type: 'clock', options: { showWeather: true, city: 'الرياض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-jewelry',
      organizationId: orgId,
      name: 'قالب محلات المجوهرات',
      layout: 'full',
      backgroundColor: '#1a1510',
      headerTitle: 'دار الماس - جمال لا ينتهي',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515562141589-67f0d569b62e?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-jewelry-media', title: 'مجوهرات مميزة', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-jewelry-ticker', title: 'عروض ذهبية', type: 'ticker', text: '💍 خاتم الماس بخصم 20% • سلسلة ذهب عيار 21 بـ 2,500 ريال • تأمين مجاني على جميع المشتريات' },
        { id: 'zone-jewelry-clock', title: 'الساعة', type: 'clock', options: { showWeather: true, city: 'الرياض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-spa',
      organizationId: orgId,
      name: 'قالب منتجعات السبا والاسترخاء',
      layout: 'split_2_horizontal',
      backgroundColor: '#2d1b4e',
      headerTitle: 'منتجع سيل فير - استرخاء تام',
      thumbnailUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-spa-media', title: 'خدمات الاسترخاء', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-spa-ticker', title: 'عروض السبا', type: 'ticker', text: '🧖 جلسة مساج/swedish بـ 199 ريال • باقة العروسين الكاملة بخصم 30% • جلسة فردية مجانية مع أي باقة عائلية' },
        { id: 'zone-spa-clock', title: 'الساعة وأوقات العمل', type: 'clock', options: { showWeather: true, city: 'الرياض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tpl-icecream',
      organizationId: orgId,
      name: 'قالب محلات الآيس كريم والحلويات الباردة',
      layout: 'split_2_vertical',
      backgroundColor: '#1a2a3a',
      headerTitle: 'كريماtoFloat - حلوة الحياة',
      thumbnailUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=60',
      zones: [
        { id: 'zone-ice-media', title: 'نكهاتنا المميزة', type: 'playlist', contentId: 'pl-general-ads' },
        { id: 'zone-ice-ticker', title: 'الحلاو)', type: 'ticker', text: '🍦 قهوة تركية بـ 12 ريال • 3 كرات آيس كريم بـ 18 ريال • عرض الصيف: وجبتين والثالثة مجاناً' },
        { id: 'zone-ice-clock', title: 'الساعة', type: 'clock', options: { showWeather: true, city: 'الرياض' } }
      ],
      createdAt: now,
      updatedAt: now,
    },
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
    { id: 'qs-1', organizationId: orgId, branchId: branchRiyadh, name: 'قسم المبيعات', codePrefix: 'S', currentNumber: 12, lastCalledNumber: 12, averageWaitMinutes: 3, isActive: true },
    { id: 'qs-2', organizationId: orgId, branchId: branchRiyadh, name: 'قسم الخدمات والتركيب', codePrefix: 'T', currentNumber: 5, lastCalledNumber: 5, averageWaitMinutes: 10, isActive: true },
    { id: 'qs-3', organizationId: orgId, branchId: branchRiyadh, name: 'قسم الشكاوى والمرتجعات', codePrefix: 'R', currentNumber: 3, lastCalledNumber: 3, averageWaitMinutes: 5, isActive: true },
  ];

  const defaultQueueTickets: QueueTicket[] = [
    { id: 'tkt-1', organizationId: orgId, serviceId: 'qs-1', serviceName: 'قسم المبيعات', ticketNumber: 'S-12', status: 'serving', counterNumber: 'شباك 1', calledAt: new Date(Date.now() - 120000).toISOString(), createdAt: new Date(Date.now() - 600000).toISOString() },
    { id: 'tkt-2', organizationId: orgId, serviceId: 'qs-1', serviceName: 'قسم المبيعات', ticketNumber: 'S-11', status: 'waiting', createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: 'tkt-3', organizationId: orgId, serviceId: 'qs-2', serviceName: 'قسم الخدمات والتركيب', ticketNumber: 'T-5', status: 'serving', counterNumber: 'شباك 2', calledAt: new Date(Date.now() - 60000).toISOString(), createdAt: new Date(Date.now() - 400000).toISOString() }
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
  updateMedia(id: string, updates: Partial<MediaItem>): Promise<MediaItem | null>;
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

  getBranches(orgId: string): Promise<Branch[]>;
  createBranch(branch: Omit<Branch, 'id'>): Promise<Branch>;
  deleteBranch(id: string, orgId: string): Promise<boolean>;

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
  getQueueServiceById(id: string): Promise<QueueService | undefined>;
  createQueueService(service: QueueService): Promise<QueueService>;
  updateQueueService(id: string, updates: Partial<QueueService>): Promise<void>;
  deleteQueueService(id: string, orgId: string): Promise<boolean>;
  getQueueTickets(orgId: string): Promise<QueueTicket[]>;
  createQueueTicket(ticket: QueueTicket): Promise<void>;
  callNextTicket(serviceId: string, counterNumber: string): Promise<QueueTicket | null>;

  seedIfEmpty(): Promise<void>;
}

function genId(prefix: string): string {
  return prefix + '-' + Math.random().toString(36).substring(2, 9);
}

declare global {
  var __screenflow_db_data: DatabaseSchema | undefined;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

function loadPersistedData(): DatabaseSchema {
  if (global.__screenflow_db_data) {
    return global.__screenflow_db_data;
  }
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.organizations && parsed.organizations.length > 0) {
        global.__screenflow_db_data = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read data/db.json:', e);
  }
  const initial = getInitialData();
  global.__screenflow_db_data = initial;
  savePersistedData(initial);
  return initial;
}

function savePersistedData(data: DatabaseSchema) {
  global.__screenflow_db_data = data;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Might fail on read-only serverless environments, which is fine since global.__screenflow_db_data holds memory
  }
}

// ============================================================
// Local (in-memory + disk persistence) fallback implementation
// ============================================================
class LocalDatabase implements Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = loadPersistedData();
  }

  private save() {
    savePersistedData(this.data);
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
    this.save();
    return newScreen;
  }
  async updateScreen(id: string, updates: Partial<Screen>) {
    const idx = this.data.screens.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.screens[idx] = { ...this.data.screens[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.screens[idx];
  }
  async deleteScreen(id: string, orgId: string) {
    const prev = this.data.screens.length;
    this.data.screens = this.data.screens.filter(s => !(s.id === id && s.organizationId === orgId));
    this.save();
    return this.data.screens.length < prev;
  }

  async addCommand(cmd: Omit<ScreenCommand, 'id' | 'createdAt'>) {
    const newCmd: ScreenCommand = { ...cmd, id: genId('cmd'), createdAt: new Date().toISOString() };
    this.data.screenCommands.push(newCmd);
    this.save();
    return newCmd;
  }
  async getPendingCommands(screenId: string) {
    return this.data.screenCommands.filter(c => c.screenId === screenId && c.status === 'pending');
  }
  async markCommandExecuted(commandId: string) {
    const cmd = this.data.screenCommands.find(c => c.id === commandId);
    if (cmd) { cmd.status = 'executed'; cmd.executedAt = new Date().toISOString(); this.save(); }
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
    this.save();
    return newMedia;
  }
  async updateMedia(id: string, updates: Partial<MediaItem>) {
    const idx = this.data.media.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.data.media[idx] = { ...this.data.media[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.media[idx];
  }
  async deleteMedia(id: string, orgId: string) {
    const item = this.data.media.find(m => m.id === id && m.organizationId === orgId);
    if (!item) return false;
    this.data.media = this.data.media.filter(m => m.id !== id);
    const org = this.data.organizations.find(o => o.id === orgId);
    if (org) org.storageUsedBytes = Math.max(0, org.storageUsedBytes - item.fileSizeBytes);
    this.save();
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
    this.save();
    return newPl;
  }
  async updatePlaylist(id: string, updates: Partial<Playlist>) {
    const idx = this.data.playlists.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.playlists[idx] = { ...this.data.playlists[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.playlists[idx];
  }
  async deletePlaylist(id: string, orgId: string) {
    const prev = this.data.playlists.length;
    this.data.playlists = this.data.playlists.filter(p => !(p.id === id && p.organizationId === orgId));
    this.save();
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
    this.save();
    return newTpl;
  }
  async updateTemplate(id: string, updates: Partial<ScreenTemplate>) {
    const idx = this.data.templates.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.templates[idx] = { ...this.data.templates[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.templates[idx];
  }
  async deleteTemplate(id: string, orgId: string) {
    const prev = this.data.templates.length;
    this.data.templates = this.data.templates.filter(t => !(t.id === id && t.organizationId === orgId));
    this.save();
    return this.data.templates.length < prev;
  }

  async getSchedules(orgId: string) {
    return this.data.schedules.filter(s => s.organizationId === orgId);
  }
  async createSchedule(sch: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) {
    const newSch: Schedule = { ...sch, id: genId('sch'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.data.schedules.unshift(newSch);
    this.save();
    return newSch;
  }
  async updateSchedule(id: string, updates: Partial<Schedule>) {
    const idx = this.data.schedules.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.schedules[idx] = { ...this.data.schedules[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.schedules[idx];
  }
  async deleteSchedule(id: string, orgId: string) {
    const prev = this.data.schedules.length;
    this.data.schedules = this.data.schedules.filter(s => !(s.id === id && s.organizationId === orgId));
    this.save();
    return this.data.schedules.length < prev;
  }

  async getBranches(orgId: string) {
    return this.data.branches.filter(b => b.organizationId === orgId);
  }
  async createBranch(branch: Omit<Branch, 'id'>) {
    const newBranch: Branch = { ...branch, id: 'br-' + Math.random().toString(36).substring(2, 8) };
    this.data.branches.push(newBranch);
    this.save();
    return newBranch;
  }
  async deleteBranch(id: string, orgId: string) {
    const prev = this.data.branches.length;
    this.data.branches = this.data.branches.filter(b => !(b.id === id && b.organizationId === orgId));
    this.save();
    return this.data.branches.length < prev;
  }

  async logActivity(log: Omit<ActivityLog, 'id' | 'createdAt'>) {
    const newLog: ActivityLog = { ...log, id: genId('log'), createdAt: new Date().toISOString() };
    this.data.activityLogs.unshift(newLog);
    if (this.data.activityLogs.length > 200) this.data.activityLogs.pop();
    this.save();
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
    this.save();
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
    this.save();
    return this.data.users[idx];
  }
  async createUser(user: User) {
    this.data.users.push(user);
    this.save();
    return user;
  }
  async createOrganization(org: Organization) {
    this.data.organizations.push(org);
    this.save();
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
    this.save();
  }

  async getQueueServices(orgId: string) {
    return this.data.queueServices.filter(q => q.organizationId === orgId);
  }
  async getQueueServiceById(id: string) {
    return this.data.queueServices.find(q => q.id === id);
  }
  async createQueueService(service: QueueService) {
    this.data.queueServices.push(service);
    this.save();
    return service;
  }
  async updateQueueService(id: string, updates: Partial<QueueService>) {
    const svc = this.data.queueServices.find(q => q.id === id);
    if (svc) { Object.assign(svc, updates); this.save(); }
  }
  async deleteQueueService(id: string, orgId: string) {
    this.data.queueServices = this.data.queueServices.filter(q => !(q.id === id && q.organizationId === orgId));
    this.save();
    return true;
  }
  async getQueueTickets(orgId: string) {
    return this.data.queueTickets.filter(t => t.organizationId === orgId);
  }
  async createQueueTicket(ticket: QueueTicket) {
    this.data.queueTickets.push(ticket);
    this.save();
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
    this.save();
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

    for (const key of Object.keys(seed) as (keyof DatabaseSchema)[]) {
      const items = seed[key];
      const col = fs.collection(COLLECTIONS[key]);
      for (const item of items as any[]) {
        try {
          const cleaned = Object.fromEntries(
            Object.entries(item).filter(([_, v]) => v !== undefined)
          );
          await col.doc(item.id).set(cleaned, { merge: true });
        } catch (e) {
          console.error(`seedIfEmpty: failed to seed ${key}/${item.id}:`, e);
        }
      }
    }
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
    const cleaned = Object.fromEntries(
      Object.entries(data as Record<string, any>).filter(([_, v]) => v !== undefined)
    );
    await fs.collection(collection).doc(id).set({ ...cleaned, id } as object, { merge: true });
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
  async updateMedia(id: string, updates: Partial<MediaItem>) {
    const existing = await this.getById<MediaItem>(COLLECTIONS.media, id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.media, id, updated);
    return updated;
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

  async getBranches(orgId: string) {
    return this.list<Branch>(COLLECTIONS.branches, 'organizationId', orgId);
  }
  async createBranch(branch: Omit<Branch, 'id'>) {
    const newBranch: Branch = { ...branch, id: 'br-' + Math.random().toString(36).substring(2, 8) };
    await this.setDoc(COLLECTIONS.branches, newBranch.id, newBranch);
    return newBranch;
  }
  async deleteBranch(id: string, orgId: string) {
    const existing = await this.getById<Branch>(COLLECTIONS.branches, id);
    if (!existing || existing.organizationId !== orgId) return false;
    await (await getDb()).collection(COLLECTIONS.branches).doc(id).delete();
    return true;
  }

  async logActivity(log: Omit<ActivityLog, 'id' | 'createdAt'>) {
    const newLog: ActivityLog = { ...log, id: genId('log'), createdAt: new Date().toISOString() };
    await this.setDoc(COLLECTIONS.activityLogs, newLog.id, newLog);
    return newLog;
  }
  async getActivityLogs(orgId: string, limit = 50) {
    const fs = await getDb();
    const snap = await fs.collection(COLLECTIONS.activityLogs)
      .where('organizationId', '==', orgId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs
      .map((d: any) => ({ ...(d.data() as object), id: d.id }) as ActivityLog);
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
    const cleaned = Object.fromEntries(
      Object.entries(data as Record<string, any>).filter(([_, v]) => v !== undefined)
    );
    await fs.collection(collection).doc(id).set({ ...cleaned, id } as object, { merge: true });
  }

  async getQueueServices(orgId: string) {
    return this.list<QueueService>(COLLECTIONS.queueServices, 'organizationId', orgId);
  }
  async getQueueServiceById(id: string) {
    return this.getById<QueueService>(COLLECTIONS.queueServices, id);
  }
  async createQueueService(service: QueueService) {
    await this.setDoc(COLLECTIONS.queueServices, service.id, service);
    return service;
  }
  async updateQueueService(id: string, updates: Partial<QueueService>) {
    await this.setDoc(COLLECTIONS.queueServices, id, updates);
  }
  async deleteQueueService(id: string, orgId: string) {
    const fs = await getDb();
    await fs.collection(COLLECTIONS.queueServices).doc(id).delete();
    return true;
  }
  async getQueueTickets(orgId: string) {
    return this.list<QueueTicket>(COLLECTIONS.queueTickets, 'organizationId', orgId);
  }
  async createQueueTicket(ticket: QueueTicket) {
    await this.setDoc(COLLECTIONS.queueTickets, ticket.id, ticket);
  }
  async callNextTicket(serviceId: string, counterNumber: string) {
    const fs = await getDb();
    const serviceRef = fs.collection(COLLECTIONS.queueServices).doc(serviceId);
    let ticket: QueueTicket | null = null;
    await fs.runTransaction(async (txn: any) => {
      const snap = await txn.get(serviceRef);
      if (!snap.exists) return;
      const service = snap.data() as QueueService;
      const newNumber = (service.currentNumber || 0) + 1;
      txn.update(serviceRef, { currentNumber: newNumber, lastCalledNumber: newNumber });
      ticket = {
        id: genId('tkt'), organizationId: service.organizationId, serviceId: service.id, serviceName: service.name,
        ticketNumber: `${service.codePrefix}-${newNumber}`, status: 'called', counterNumber,
        calledAt: new Date().toISOString(), createdAt: new Date().toISOString(),
      };
      txn.set(fs.collection(COLLECTIONS.queueTickets).doc(ticket.id), ticket);
    });
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
