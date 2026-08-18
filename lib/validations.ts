import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح').min(1, 'البريد الإلكتروني مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  email: z.string().email('البريد الإلكتروني غير صحيح').min(1, 'البريد الإلكتروني مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
  organizationName: z.string().min(2, 'اسم المؤسسة مطلوب').max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  newPassword: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'الاسم مطلوب').max(100),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().optional(),
});

export const screenSchema = z.object({
  name: z.string().min(2, 'اسم الشاشة مطلوب').max(100),
  orientation: z.enum(['landscape', 'portrait']),
  volume: z.number().min(0).max(100),
  notes: z.string().optional(),
  liveStreamUrl: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
});

export const scheduleSchema = z.object({
  name: z.string().min(2, 'اسم الجدول مطلوب').max(100),
  targetType: z.enum(['playlist', 'template']),
  targetId: z.string().min(1, 'الهدف مطلوب'),
  startDate: z.string().min(1, 'تاريخ البداية مطلوب'),
  endDate: z.string().min(1, 'تاريخ النهاية مطلوب'),
  startTime: z.string().min(1, 'وقت البداية مطلوب'),
  endTime: z.string().min(1, 'وقت النهاية مطلوب'),
  daysOfWeek: z.array(z.number()).min(1, 'يوم واحد على الأقل مطلوب'),
  screenIds: z.array(z.string()),
  isActive: z.boolean(),
});

export const queueServiceSchema = z.object({
  name: z.string().min(2, 'اسم القسم مطلوب').max(100),
  codePrefix: z.string().min(1, 'الرمز مطلوب').max(2),
});

export const branchSchema = z.object({
  name: z.string().min(2, 'اسم الفرع مطلوب').max(100),
  city: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ScreenFormData = z.infer<typeof screenSchema>;
export type ScheduleFormData = z.infer<typeof scheduleSchema>;
export type QueueServiceFormData = z.infer<typeof queueServiceSchema>;
export type BranchFormData = z.infer<typeof branchSchema>;
