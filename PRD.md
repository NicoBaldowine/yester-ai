# 🧾 Yester.ai — Product Requirements Document (PRD)

## 1. Executive Summary

Yester.ai is an AI-powered mobile application that transforms how people explore and learn about history. By combining intelligent content curation with an intuitive mobile-first interface, users can discover the most significant historical events from any period between 0 CE and 2025 CE, organized by themes and geographical regions.

**Version:** 1.0 MVP  
**Target Launch:** Q2 2025  
**Platform:** Mobile (iOS/Android via React Native)

---

## 2. Product Vision & Goals

### Vision Statement
To make history accessible, engaging, and personally relevant by delivering AI-curated historical content through a beautifully designed mobile experience.

### Primary Goals
- **Accessibility**: Make historical knowledge accessible to users of all educational backgrounds
- **Engagement**: Create an emotionally rich, discovery-driven learning experience
- **Personalization**: Deliver relevant content based on user interests and exploration patterns
- **Performance**: Provide a smooth, native-quality mobile experience with fast load times

### Success Metrics
**Primary KPIs:**
- Monthly Active Users (MAU): 50K within 6 months
- Session Duration: Average 8+ minutes per session
- Content Engagement: 70%+ of users explore beyond initial year selection
- User Retention: 40% Day-7 retention, 20% Day-30 retention

**Secondary KPIs:**
- Bookmark Usage: 30%+ of active users bookmark content
- Category Exploration: Users explore average 3+ categories per session
- Time Period Diversity: Users explore events across 5+ different centuries

---

## 3. Target Audience

### Primary Personas

**1. The Curious Learner (25-45 years old)**
- Professionals seeking intellectual stimulation during commute/downtime
- Values bite-sized, high-quality content
- Motivated by discovery and personal growth

**2. The History Enthusiast (35-65 years old)**
- Has existing interest in history but wants deeper insights
- Appreciates expert curation and AI-powered analysis
- Values comprehensive coverage across time periods and regions

**3. The Casual Explorer (18-35 years old)**
- Socially-driven learner who enjoys sharing interesting discoveries
- Attracted to visually appealing, easily digestible content
- Values modern UX and seamless mobile experience

---

## 4. Core Features & Requirements

### 4.1 🔐 Authentication System
**Priority:** P0 (MVP Critical)

**Features:**
- Email/password registration and login via Supabase Auth
- Social login options (Google, Apple) for frictionless onboarding
- Password reset functionality
- Secure session management with automatic token refresh
- Profile creation with basic preferences (regions of interest, favorite time periods)

**User Flow:**
1. App launch → Login/Register screen
2. New users: Register → Email verification → Profile setup → Year selection
3. Returning users: Auto-login → Last viewed content or Year selection

**Technical Requirements:**
- Implement Supabase Auth with row-level security
- Secure token storage using device keychain
- Offline authentication state persistence

### 4.2 📆 Year Selection & Navigation
**Priority:** P0 (MVP Critical)

**Features:**
- Interactive year picker spanning 0 CE to 2025 CE
- Multiple navigation modes:
  - Scrollable year list with decade groupings
  - Direct year input search
  - "Jump to" quick access for major historical periods
- Visual indicators for years with rich content
- Smooth animations and gestures

**UX Requirements:**
- Haptic feedback on year selection
- Loading states with skeleton UI
- Clear visual hierarchy showing selected year
- Quick access to recent years (last 100 years) vs. ancient history

### 4.3 📚 Content Discovery & Display
**Priority:** P0 (MVP Critical)

**Content Structure:**
- **Top Event:** Full-width hero card with large image, title, and summary
- **Secondary Events (2):** Half-width cards with smaller images and titles
- **Categories:** Politics, Science, Culture, Religion, Technology, Economics, Natural Disasters
- **Regions:** Global, Europe, Asia, Africa, Americas, Oceania

**Content Requirements:**
- AI-generated summaries (150-300 words) using Gemini 2.0 Flash
- High-quality historical images sourced from public domain collections
- Emotional storytelling with emojis and engaging narrative style
- Source attribution and historical accuracy verification

**Display Features:**
- Infinite scroll for exploring more events within the year
- Filtering by category and region
- Related events suggestions
- "This Day in History" feature for current date

### 4.4 🔖 User Engagement Features
**Priority:** P0 (MVP Critical)

**Bookmarking System:**
- Save favorite events for later reading
- Personal collection organization
- Offline access to bookmarked content

**Feedback & Interaction:**
- "Interesting" vs. "Not Relevant" feedback for content curation
- Share events via social media or messaging
- In-app rating system for content quality

### 4.5 🔍 Search & Discovery
**Priority:** P1 (Post-MVP)

**Features:**
- Full-text search across all historical content
- Semantic search powered by AI for concept-based queries
- Advanced filters (time period, region, category, importance level)
- Search suggestions and auto-complete
- Trending searches and popular periods

### 4.6 📊 Personal Analytics
**Priority:** P1 (Post-MVP)

**Features:**
- Personal learning dashboard showing exploration patterns
- Achievements and milestones (e.g., "Time Traveler: Explored 10 centuries")
- Personalized content recommendations based on reading history
- Learning streaks and engagement statistics

---

## 5. Technical Architecture

### 5.1 Frontend Stack
```
Framework: React Native with Expo (SDK 50+)
Navigation: Expo Router with file-based routing
State Management: Zustand for client state
UI Components: Custom component library with design system
Styling: NativeWind (Tailwind CSS for React Native)
Animations: Reanimated 3 + Moti
Icons: Lucide React Native
```

### 5.2 Backend & Services
```
Database: Supabase (PostgreSQL)
Authentication: Supabase Auth
File Storage: Supabase Storage for images
CDN: Supabase CDN for content delivery
AI Services: 
  - Primary: Google Gemini 2.0 Flash (content generation)
  - Secondary: Claude 3.5 Sonnet (deep analysis, post-MVP)
```

### 5.3 API & Data Management
```
HTTP Client: Axios with retry logic and request/response interceptors
Caching: React Query for server state management
Offline Support: React Query with persistence layer
Real-time Updates: Supabase Realtime for live content updates
```

### 5.4 Database Schema (Core Tables)
```sql
-- Users and profiles
users (Supabase Auth)
profiles (id, user_id, preferences, created_at, updated_at)

-- Historical content
events (id, year, title, summary, category, region, importance_score, image_url, sources, created_at)
bookmarks (id, user_id, event_id, created_at)
user_feedback (id, user_id, event_id, feedback_type, created_at)

-- Analytics and recommendations
user_activity (id, user_id, event_id, action_type, session_id, created_at)
content_analytics (event_id, view_count, bookmark_count, share_count, avg_rating)
```

---

## 6. User Experience Flow

### 6.1 First-Time User Journey
1. **Onboarding:** Welcome screen → Sign up → Email verification
2. **Profile Setup:** Select interests (regions, time periods, categories)
3. **Tutorial:** Quick interactive guide to year selection and content exploration
4. **First Discovery:** Suggested starting year based on preferences
5. **Content Engagement:** Explore events → Bookmark favorites → Share discoveries

### 6.2 Returning User Journey
1. **Launch:** Auto-login → Last viewed content or personalized recommendations
2. **Exploration:** Year selection → Category/region filtering → Content consumption
3. **Deep Dive:** Related events → Bookmark → Share → Provide feedback

### 6.3 Key Interaction Patterns
- **Gesture Navigation:** Swipe between events, pull-to-refresh, long-press for quick actions
- **Progressive Disclosure:** Summary → Full content → Sources → Related events
- **Contextual Actions:** Bookmark, share, and feedback options visible when relevant

---

## 7. Non-Functional Requirements

### 7.1 Performance
- **Load Time:** Initial content loads within 2 seconds on 4G connection
- **Responsiveness:** UI interactions respond within 100ms
- **Memory Usage:** App uses less than 200MB RAM during normal operation
- **Battery Optimization:** Efficient background processing and image loading

### 7.2 Scalability
- **Content Volume:** Support for 100K+ historical events across all time periods
- **User Base:** Architecture supports 100K+ concurrent users
- **API Rate Limits:** Implement intelligent caching and rate limiting
- **Database Performance:** Optimized queries with proper indexing

### 7.3 Security & Privacy
- **Data Encryption:** All data encrypted in transit and at rest
- **Privacy Compliance:** GDPR and CCPA compliant data handling
- **Authentication Security:** Multi-layer security with Supabase RLS
- **Content Moderation:** AI-powered content filtering for appropriateness

### 7.4 Accessibility
- **Screen Reader Support:** Full VoiceOver/TalkBack compatibility
- **Visual Accessibility:** Support for dynamic text sizing and high contrast
- **Motor Accessibility:** Large touch targets and gesture alternatives
- **Cognitive Accessibility:** Clear navigation and consistent interaction patterns

---

## 8. Content Strategy

### 8.1 Content Sources & Quality
- **Primary Sources:** Verified historical databases, academic institutions, museums
- **AI Enhancement:** Gemini 2.0 Flash for content generation and fact verification
- **Editorial Review:** Historical accuracy verification by subject matter experts
- **Update Cycle:** Monthly content refreshes and corrections

### 8.2 Content Categories & Coverage
**By Time Period:**
- Ancient History (0-500 CE): 15% of content
- Medieval Period (500-1500 CE): 20% of content
- Early Modern (1500-1800 CE): 25% of content
- Modern Era (1800-2000 CE): 35% of content
- Contemporary (2000-2025 CE): 5% of content

**By Region (Balanced Global Coverage):**
- Europe: 25%
- Asia: 25%
- Americas: 20%
- Africa: 15%
- Middle East: 10%
- Oceania: 5%

### 8.3 Content Guidelines
- **Tone:** Conversational yet informative, avoiding academic jargon
- **Length:** 150-300 words for main summaries, 50-100 words for secondary events
- **Visual Standards:** High-resolution historical images, consistent aspect ratios
- **Sensitivity:** Respectful treatment of difficult historical topics

---

## 9. Monetization Strategy (Future Considerations)

### 9.1 Freemium Model
- **Free Tier:** Access to basic content, limited daily events, standard regions
- **Premium Tier ($4.99/month):** Unlimited access, advanced search, exclusive content, offline mode
- **Family Plan ($9.99/month):** Up to 6 accounts with parental controls

### 9.2 Additional Revenue Streams
- **Educational Partnerships:** Licensing content to schools and universities
- **Sponsored Content:** Historically relevant educational content from museums
- **Merchandise:** Historical timeline posters, books, educational materials

---

## 10. Development Roadmap

### Phase 1: MVP Development (3 months)
**Core Features:**
- Authentication system
- Year selection and navigation
- Basic content display (top 3 events per year)
- Bookmarking functionality
- Basic categories and regions

**Technical Milestones:**
- Supabase backend setup and database design
- React Native app foundation with Expo
- Gemini API integration for content generation
- Basic UI/UX implementation

### Phase 2: Enhanced Discovery (2 months)
**Features:**
- Advanced filtering and search
- Personalized recommendations
- Social sharing capabilities
- User feedback system

**Technical Improvements:**
- Performance optimization
- Offline content caching
- Enhanced loading states and animations

### Phase 3: Intelligence & Analytics (2 months)
**Features:**
- AI-powered content insights using Claude 3.5 Sonnet
- Personal learning analytics
- Achievement system
- Advanced personalization

**Platform Expansion:**
- iOS App Store and Google Play Store submissions
- User testing and feedback incorporation
- Marketing website development

---

## 11. Risk Assessment & Mitigation

### 11.1 Technical Risks
**Risk:** AI content quality and accuracy
**Mitigation:** Multi-layer verification, expert review process, user feedback loops

**Risk:** Database performance at scale
**Mitigation:** Proper indexing, caching strategies, database optimization

**Risk:** Third-party API dependencies (Gemini, Supabase)
**Mitigation:** Fallback systems, rate limit handling, service monitoring

### 11.2 Business Risks
**Risk:** Content copyright and licensing issues
**Mitigation:** Use public domain sources, proper attribution, legal review

**Risk:** User acquisition and retention challenges
**Mitigation:** Strong onboarding experience, viral sharing features, content quality focus

**Risk:** Competition from established educational apps
**Mitigation:** Unique AI-powered curation, superior UX, niche focus on historical exploration

---

## 12. Success Criteria & Launch Readiness

### 12.1 MVP Launch Criteria
**Technical Readiness:**
- [ ] All P0 features fully implemented and tested
- [ ] Performance benchmarks met (load times, responsiveness)
- [ ] Security audit completed
- [ ] App store submission requirements met

**Content Readiness:**
- [ ] Minimum 10,000 historical events across all time periods
- [ ] Content quality review completed
- [ ] Image assets properly licensed and optimized

**User Experience:**
- [ ] Usability testing completed with target demographics
- [ ] Accessibility standards compliance verified
- [ ] Onboarding flow optimized for conversion

### 12.2 Post-Launch Success Indicators (30 days)
- User acquisition rate of 1,000+ new users per week
- Average session duration of 5+ minutes
- Content engagement rate of 60%+
- App store rating of 4.2+ stars
- Crash rate below 0.1%

---

## 13. Appendices

### A. Competitive Analysis
**Direct Competitors:**
- Timeline - World History (limited AI features)
- History Timeline (basic timeline interface)
- World History Atlas (map-focused)

**Competitive Advantages:**
- AI-powered content curation and personalization
- Mobile-first design with superior UX
- Comprehensive global and temporal coverage
- Emotional storytelling approach

### B. Technical Specifications
**Minimum Device Requirements:**
- iOS: iOS 13.0+, iPhone 8+
- Android: Android 8.0+ (API level 26), 3GB+ RAM
- Network: 3G connection minimum, 4G recommended

**App Size & Performance:**
- Initial download size: <50MB
- Maximum runtime memory: 200MB
- Offline storage: Up to 500MB for bookmarked content

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Next Review:** February 2025 