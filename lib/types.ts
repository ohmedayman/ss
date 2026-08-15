export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  storageLimitMb: number;
  storageUsedBytes: number;
  maxScreens: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export type ScreenOrientation = 'landscape' | 'portrait';
export type ScreenStatus = 'online' | 'offline';
export type ActiveContentType = 'playlist' | 'template' | 'media' | 'url' | 'queue_display';

export interface Screen {
  id: string;
  organizationId: string;
  branchId?: string;
  name: string;
  registrationCode: string; // e.g. "SF-8291"
  pairingToken?: string;
  isPaired: boolean;
  status: ScreenStatus;
  lastHeartbeatAt?: string;
  ipAddress?: string;
  appVersion?: string;
  orientation: ScreenOrientation;
  resolution: string; // e.g. "1920x1080"
  activeContentType: ActiveContentType;
  activeContentId?: string; // id of playlist, template, media or direct URL
  screenshotUrl?: string;
  lastScreenshotAt?: string;
  volume: number; // 0-100
  brightness: number; // 0-100
  healthReportedAt?: string;
  batteryLevel?: number; // 0-100, null if not applicable
  batteryCharging?: boolean;
  storageUsedMb?: number;
  storageTotalMb?: number;
  uptimeHours?: number;
  cpuUsage?: number; // 0-100
  memoryUsageMb?: number;
  memoryTotalMb?: number;
  networkType?: string; // wifi, ethernet, 4g, offline
  networkSpeedMbps?: number;
  temperatureC?: number; // device temperature
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type CommandType = 'reload' | 'reboot' | 'take_screenshot' | 'clear_cache' | 'push_content' | 'set_volume';

export interface ScreenCommand {
  id: string;
  screenId: string;
  organizationId: string;
  command: CommandType;
  payload?: Record<string, any>;
  status: 'pending' | 'delivered' | 'executed' | 'failed';
  createdAt: string;
  executedAt?: string;
}

export type MediaType = 'image' | 'video' | 'audio' | 'web_url' | 'youtube_video' | 'ticker_text' | 'document';

export interface MediaItem {
  id: string;
  organizationId: string;
  name: string;
  fileType: MediaType;
  fileUrl: string;
  thumbnailUrl?: string;
  customUrl?: string;
  fileSizeBytes: number;
  durationSeconds: number; // e.g. 10s for images, or video duration
  width?: number;
  height?: number;
  folder: string; // default "root"
  tags: string[];
  customTickerText?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransitionEffect = 'none' | 'fade' | 'slide_left' | 'slide_right' | 'zoom_in';

export interface PlaylistItem {
  id: string;
  playlistId: string;
  mediaId?: string;
  media?: MediaItem;
  customUrl?: string;
  customText?: string;
  orderIndex: number;
  durationSeconds: number;
  transition: TransitionEffect;
  isMuted: boolean;
}

export interface Playlist {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  isLoop: boolean;
  defaultTransition: TransitionEffect;
  totalDurationSeconds: number;
  items: PlaylistItem[];
  createdAt: string;
  updatedAt: string;
}

export type TemplateLayout = 'full' | 'split_2_horizontal' | 'split_2_vertical' | 'split_3_sidebar' | 'menu_board' | 'clinic_waiting' | 'retail_promo' | 'corporate' | 'mosque' | 'school' | 'gym';

export interface TemplateZoneConfig {
  id: string;
  title: string;
  type: 'media' | 'playlist' | 'clock' | 'weather' | 'ticker' | 'queue_display' | 'web_embed' | 'countdown' | 'qr_display' | 'social_feed' | 'prayer_times';
  contentId?: string;
  url?: string;
  text?: string;
  options?: Record<string, any>;
}

export interface ScreenTemplate {
  id: string;
  organizationId: string;
  name: string;
  layout: TemplateLayout;
  zones: TemplateZoneConfig[];
  backgroundColor?: string;
  headerTitle?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  organizationId: string;
  name: string;
  targetType: ActiveContentType;
  targetId: string; // ID of playlist/template/etc.
  screenIds: string[]; // which screens this schedule applies to (empty = all)
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g. "09:00")
  endTime: string; // HH:mm (e.g. "17:00")
  daysOfWeek: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  priority: number; // 1 = highest
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  organizationId: string;
  userId?: string;
  userName?: string;
  action: string;
  actionType: 'screen' | 'media' | 'playlist' | 'schedule' | 'auth' | 'settings' | 'system';
  details: string;
  ipAddress?: string;
  createdAt: string;
}

// Future Queue Management Models
export interface QueueService {
  id: string;
  organizationId: string;
  branchId?: string;
  name: string;
  codePrefix: string; // e.g. "A", "C"
  currentNumber: number;
  lastCalledNumber: number;
  averageWaitMinutes: number;
  isActive: boolean;
}

export interface QueueTicket {
  id: string;
  organizationId: string;
  serviceId: string;
  serviceName: string;
  ticketNumber: string; // e.g. "A-104"
  status: 'waiting' | 'called' | 'serving' | 'completed' | 'cancelled';
  counterNumber?: string;
  calledAt?: string;
  completedAt?: string;
  createdAt: string;
}
