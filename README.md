# ScreenFlow 📺✨
### المنصة العربية السحابية الاحترافية لإدارة الشاشات الرقمية (Digital Signage SaaS)

منصة **ScreenFlow** هي حل سحابي متكامل (Multi-Tenant SaaS) يُمكّن الشركات، المحلات، المطاعم، المقاهي، العيادات، والمكاتب من إدارة شبكة شاشاتهم الرقمية عن بُعد وبشكل فوري مع دعم كامل للغة العربية (RTL) وتجربة مستخدم عصرية وسلسة.

---

## 🌟 أبرز المميزات (Key Features)

### 1. اقتران الشاشات الفوري (Instant Screen Pairing)
- توليد كود تسجيل فريد (Registration Code: مثلاً `SF-2026`) لكل شاشة مع رمز استجابة سريعة **QR Code**.
- ربط الشاشة من لوحة التحكم بضغطة زر واحدة وبدء البث المباشر خلال ثوانٍ.

### 2. مشغل شاشات ذكي (Smart Web Player)
- يعمل بوضع ملء الشاشة (`F11` أو تلقائياً) على أي متصفح وشاشات التلفزيون الذكية (Smart TV).
- **يدعم العمل دون إنترنت (Offline Mode)**: يقوم بتخزين الوسائط محلياً في المتصفح والاستمرار في العرض عند انقطاع الشبكة، والمزامنة التلقائية فور عودة الاتصال.
- نبضات حياة مستمرة (Heartbeat) كل 15 ثانية لتحديث حالة الشاشة (Online / Offline).

### 3. التحكم عن بُعد والتحديث اللحظي (Real-Time Remote Control)
- إرسال أوامر فورية للشاشات عبر تقنية **Server-Sent Events (SSE)** و **Realtime Hub**:
  - تحديث المحتوى الفوري (Reload).
  - إعادة تشغيل المشغل (Reboot).
  - تفريغ الذاكرة المؤقتة (Clear Cache).
  - **التقاط لقطة شاشة حية (Remote Screenshot)** لما يعرضه التلفاز الآن.
  - ضبط مستوى الصوت والسطوع عن بُعد.

### 4. مكتبة الوسائط (Media Library)
- رفع وإدارة الصور (JPG, PNG, WebP) ومقاطع الفيديو (MP4).
- إضافة وتضمين صفحات الويب (Web URLs).
- إنشاء أشرطة إخبارية ونصوص إعلانية متحركة (Ticker Marquee).
- تنظيم المجلدات والتصنيفات، وفحص المساحة التخزينية المتبقية.

### 5. منشئ قوائم التشغيل (Playlists Sequencer)
- ترتيب عناصر العرض بالسحب والإفلات وتغيير الترتيب.
- تحديد مدة عرض كل صورة أو فيديو بدقة بالثواني.
- دعم التأثيرات الانتقالية (Fade, Slide Left, Slide Right, Zoom In).

### 6. الجدولة الزمنية المتقدمة (Scheduling Engine)
- تحديد تاريخ البداية والنهاية، وساعات العمل (مثلاً: من 08:00 صباحاً إلى 02:00 ظهراً).
- تحديد أيام الأسبوع المستهدفة (الأحد إلى الخميس، أو عطلات نهاية الأسبوع).
- أولوية الجداول الزمنية والتبديل التلقائي للمحتوى.

### 7. استوديو القوالب متعددة المناطق (Templates Studio)
- قوالب جاهزة:
  - **قالب العيادات والاستقبال**: منطقة فيديو رئيسية + شاشة أرقام انتظار + ودجة الساعة والطقس + شريط إخباري سفلي متحرك.
  - **قالب المطاعم والمقاهي (Menu Board)**.
  - **قالب الشاشات الكاملة (Full Screen Ads)**.

### 8. بنية تحتية مهيأة لنظام أرقام الانتظار (Queue Management Architecture)
- تم تصميم قاعدة البيانات والـ APIs لتستوعب مستقبلاً:
  - خدمات الطوابير وإصدار تذاكر العملاء (Tickets).
  - إدارة الفروع والمكاتب والشبابيك (Counters).
  - النداء الصوتي المباشر للعميل على الشاشات.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Frontend & Framework**: Next.js 15 (App Router), React, TypeScript.
- **Styling & UI**: Tailwind CSS v4, Cairo & Tajawal Google Fonts (Arabic Native RTL), Lucide Icons, Glassmorphism.
- **Real-Time Communication**: Server-Sent Events (SSE) & EventEmitter Realtime Hub.
- **Offline Storage**: Browser Cache Storage & LocalStorage.
- **Database & Architecture**: Multi-Tenant Schema Layer with atomic JSON persistence and relational models.

---

## 🚀 التشغيل والتثبيت المحلي (Getting Started)

### 1. تثبيت الاعتماديات:
```bash
npm install
```

### 2. تشغيل خادم التطوير:
```bash
npm run dev
```

افتح المتصفح على الرابط:
- **لوحة التحكم**: [http://localhost:3000](http://localhost:3000)
- **مشغل الشاشات (Web Player)**: [http://localhost:3000/player](http://localhost:3000/player)

### 3. بناء النسخة الإنتاجية:
```bash
npm run build
npm start
```

---

## 👤 حساب الدخول التجريبي الافتراضي (Demo Credentials)
- **البريد الإلكتروني**: `admin@screenflow.io`
- **كلمة المرور**: `admin123`
- **المؤسسة**: مجموعة الأفق للحلول الرقمية (Pro Plan)

---

## 📄 الترخيص
تم تطوير المشروع كمنصة SaaS رقمية احترافية.
