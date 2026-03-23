# BeanScan - Product Specification Document

## Product Overview

**Product Name:** BeanScan
**Tagline:** Your personal coffee bean journal
**Target User:** Home baristas who want to track and remember their coffee experiences

**Vision Statement:**
BeanScan empowers home baristas to maintain a comprehensive record of every coffee they try, making it easy to remember what they loved, refine their brewing technique, and discover their preferences over time.

---

## Core Features

### 1. Photo Capture & Bean Recognition
- Users photograph their coffee bag
- AI analyzes the image to extract text and identify the coffee
- System automatically populates coffee metadata
- **Display Photo:** The app displays a professional product photo from the roaster's website or a legitimate coffee source (retrieved via API lookup), NOT the user's photo. This ensures high-quality, visually appealing images throughout the app.

### 2. Coffee Bean Profile (Auto-populated)
The following information is extracted/determined from the bag photo:

| Field | Format/Values | Data Source Method |
|-------|---------------|-------------------|
| Bag Name | Text | **OCR from bag** |
| Roaster Name | Text | **OCR from bag** |
| Roaster Location | City, State, Country | Roaster site → Retail sites → AI agent → Manual Entry |
| Origins | Country 1, Country 2, etc. | Roaster site → Retail sites → AI agent → Manual Entry |
| Roast Level | Light / Medium-Light / Medium / Medium-Dark / Dark | Roaster site → Retail sites → AI agent → Manual Entry |
| Coffee Bean Varietal | e.g., Bourbon, Typica, Caturra | Roaster site → Retail sites → AI agent → Manual Entry |
| Altitude | e.g., 1600m | Roaster site → Retail sites → AI agent → Manual Entry |
| Processing Method | e.g., Washed, Natural, Honey, Anaerobic | Roaster site → Retail sites → AI agent → Manual Entry |
| Flavor Profile | Tags/Text (e.g., Blueberry, Chocolate, Citrus) | Roaster site → Retail sites → AI agent → Manual Entry |
| Body Profile | (Light/Medium/Full) & (Short Description) | Roaster site → Retail sites → AI agent → Manual Entry |
| Product Photo | URL to professional image | Roaster site → Retail sites → Placeholder |

**Data Retrieval Process:**

**Step 1: OCR Extraction**
- Extract Bag Name and Roaster Name from photo using OCR

**Step 2: Intelligent Lookup (for all other fields)**
The lookup runs a three-phase pipeline, each phase filling in fields the previous phase missed:

1. **Phase 1 — Roaster's Website (highest trust):**
   - Search for and scrape the roaster's own product page
   - Values found here are never overwritten by later phases

2. **Phase 2 — Popular Coffee Retail Sites:**
   - Check in this order: drinktrade.com → beanbox.com → wholelattelove.com → mistobox.com → coffeereview.com
   - Each site fills only fields still missing after Phase 1

3. **Phase 3 — AI Agent (obscure roasters only):**
   - Runs only if fields remain null after Phases 1 and 2
   - An AI agent searches the broader web to infer missing values
   - Fields sourced from this phase are marked as "AI inferred" in the UI

4. **Manual Entry:**
   - If all three phases fail to populate a field, it is left null
   - User sees the form pre-filled with whatever was found and can fill in any remaining fields manually

**Field-Specific Formats:**
- **Roaster Location:** City, State/Province, Country (e.g., "Portland, OR, USA" or "Melbourne, VIC, Australia")
- **Origins:** Comma-separated countries/regions (e.g., "Ethiopia, Kenya" or "Colombia, Huila")
- **Roast Level:** Dropdown selection from: Light, Medium-Light, Medium, Medium-Dark, Dark
- **Altitude:** Numeric value with 'm' suffix (e.g., "1600m", "1400-1800m")
- **Body Profile:** Category (Light/Medium/Full) + descriptive text (e.g., "Medium - Smooth with balanced mouthfeel")

### 3. User Authentication & Multi-User Support
BeanScan supports multiple users with individual accounts and separate coffee collections:

**User Registration:**
- Required fields:
  - Name (full name or display name)
  - Email (must be valid email format)
  - Password (secure password requirements)
- Each user gets a unique account
- Email must be unique across all users

**User Login:**
- Required credentials:
  - Email
  - Password
- Session management for authenticated users
- Secure password validation

**Data Isolation:**
- Each user has their own private coffee collection
- Coffee records are associated with the user who created them
- Users can only view and edit their own coffee data
- No data sharing between users (unless future social features are added)

### 4. Brew Log (User Input)
For each coffee bag, there is ONE brew log that can be edited and updated at any time:

| Field | Type | Input Method | Required | Notes |
|-------|------|--------------|----------|-------|
| Date | Date | Date Picker | Optional | When the coffee was brewed (structured date selection) |
| Roast Date | Date | Date Picker | Optional | When the beans were roasted (structured date selection) |
| Grind Setting | Float | Number Input | **Required** | One decimal point only (e.g., "4.0", "4.1", "15.5") |
| Rating | Select | Dropdown Menu | Optional | Options: Great / Good / Neutral / Meh / Bad |
| Tasting Notes | Text | Text Area | Optional | User's personal flavor impressions (free-form text) |
| Body Notes | Text | Text Area | Optional | User's personal notes on mouthfeel and body |
| Last Updated | Timestamp | Auto-generated | N/A | Automatically recorded when brew log is saved |

**Input Validation:**
- **Date & Roast Date:** Must use native date picker UI (no manual text entry)
- **Grind Setting:**
  - Format: Float with exactly one decimal place (e.g., 4.0, 15.5, 22.3)
  - Validation: Must match pattern `^\d+\.\d$` (e.g., 4.0, 15.5, 100.0)
  - Required field - cannot save brew log without this value
- **Rating:** Dropdown with five predefined options only

**Note:** Users can update any field in the brew log at any time. The "Last Updated" timestamp automatically updates whenever changes are saved.

---

## User Flow

### First-Time User Journey
1. **Welcome Screen** → Brief intro to BeanScan
2. **User Registration** → Enter name, email, and password
3. **Account Created** → Confirmation message and automatic login
4. **Add First Coffee** → Prompt to take photo of bag
5. **Photo Capture** → Camera interface
6. **OCR Processing** → Extract Bag Name and Roaster Name (loading state)
7. **Data Lookup** → 3-phase pipeline runs with live progress indicator:
   - Step 1: "Looking up roaster site..."
   - Step 2: "Checking popular coffee retail sites..."
   - Step 3: "Searching the web for more details..." (only if needed)
8. **Review & Edit** → Pre-filled coffee profile; fields sourced from the AI agent are labeled "AI inferred"; missing fields shown as blank for manual entry
10. **Save Coffee** → Coffee added to collection
11. **Add/Edit Brew Log** (Optional) → Add initial brew notes
12. **View Collection** → See saved coffees

### Returning User Journey
1. **Welcome Screen** → Show login option
2. **User Login** → Enter email and password
3. **Authentication** → Validate credentials
4. **View Collection** → Access personal coffee collection

### Adding a New Coffee
1. Tap "Add Coffee" button
2. Take photo of bag
3. OCR extracts Bag Name + Roaster Name
4. 3-phase lookup pipeline runs with live progress indicator
5. Review auto-populated data; "AI inferred" label shown on any fields sourced from Phase 3
6. Manually enter any remaining null fields if desired
7. Save to collection

### Adding or Editing Brew Log
1. Select coffee from collection
2. If brew log exists, tap "Edit Brew Log" / If no brew log, tap "Add Brew Log"
3. Fill in or update brew details:
   - Select brew date using date picker
   - Select roast date using date picker
   - Enter grind setting (float with one decimal, required)
   - Select rating from dropdown menu
   - Add/edit tasting notes
4. Save brew log
5. "Last Updated" timestamp is automatically recorded
6. View updated coffee card with brew information

---

## Data Model

### User Record
```
{
  id: unique_id,
  name: string,
  email: string, // unique, used for login
  password: string, // hashed and salted
  dateCreated: timestamp,
  lastLogin: timestamp
}
```

### Coffee Bean Record
```
{
  id: unique_id,
  userId: string, // foreign key to User.id
  bagName: string,
  roasterName: string,
  roasterLocation: string, // City, State, Country
  origins: string, // Country 1, Country 2, etc.
  roastLevel: enum, // Light, Medium-Light, Medium, Medium-Dark, Dark
  varietal: string,
  altitude: string, // e.g., "1600m"
  processingMethod: string, // e.g., Washed, Natural, Honey
  flavorProfile: array/string,
  bodyProfile: {
    category: enum, // Light, Medium, Full
    description: string
  },
  photoUrl: string, // URL to professional product photo from roaster (not user photo)
  dateAdded: timestamp,
  brewLog: {
    brewDate: date, // structured date picker
    roastDate: date, // structured date picker
    grindSetting: float, // required, one decimal point (e.g., 4.0, 15.5)
    rating: enum, // Great, Good, Neutral, Meh, Bad - dropdown
    tastingNotes: text,
    lastUpdated: timestamp
  }
}
```

**Notes:**
- The `brewLog` object is embedded directly in the coffee record. It can be null/empty if the user hasn't added brew information yet.
- Each coffee record is associated with a user via the `userId` field. Users can only access their own coffee records.

---

## Technical Considerations

### User Authentication & Security
- **Password Storage:** Passwords must be hashed and salted (use bcrypt or similar)
- **Session Management:** JWT tokens or session cookies for authenticated users
- **Email Validation:** Validate email format and uniqueness during registration
- **Password Requirements:** Minimum length, complexity requirements (to be defined)
- **Security Best Practices:**
  - HTTPS required for all authentication endpoints
  - Protection against common attacks (SQL injection, XSS, CSRF)
  - Rate limiting on login attempts to prevent brute force. Maximum of 5 attempts for a 1 minute session.

### Image Recognition Approach
- **OCR Processing:** Extract only Bag Name and Roaster Name from photo
- **Recommended Library:** Tesseract.js or Claude API vision capabilities for text extraction
- **Output:** Two text fields (Bag Name, Roaster Name)

### Lookup Progress Indicator
During the coffee lookup, the app displays a 3-step visual progress indicator with a live status message that updates as each phase runs:

| Phase | Status Message |
|---|---|
| Phase 1 running | "Looking up roaster site..." |
| Phase 2 running | "Checking popular coffee retail sites..." |
| Phase 3 running | "Searching the web for more details..." |

- Both the step indicator (showing steps 1–3) and the status text update in real time
- The indicator remains visible until the lookup completes and the form is populated
- Phase 3 step only appears if Phase 3 actually runs

### "AI Inferred" Field Annotation
Any coffee field whose value was sourced from Phase 3 (the AI agent) is annotated with an **"AI inferred"** label in two places:

1. **Inline on the coffee form (CoffeeFormScreen)** — shown before the user saves, so they can review and correct the value if needed
2. **On the Coffee Detail screen** — shown as a persistent label after the coffee is saved, indicating lower confidence than values sourced directly from the roaster or retail sites

Fields sourced from Phase 1 or Phase 2 receive no annotation — they are treated as reliable.

### Missing Field Display
- Fields with no value (`null` in the database) are displayed as **"N/A"** throughout the UI
- This is a display-only rule — the database always stores `null` for missing fields

### Coffee Bag Thumbnail Images
**Lookup (backend — `lookup-coffee` edge function):**
- Claude is asked to return a `photoUrl` pointing to a professional coffee bag image, checked in priority order:
  1. Roaster's official website
  2. drinktrade.com
  3. beanbox.com
  4. mistobox.com
  5. driftaway.coffee
- The URL is validated via HTTP HEAD request: must return HTTP 200 and a `Content-Type: image/*` header
- If validation fails or Claude returns null, `photo_url` is stored as null in the database

**Placeholder (frontend):**
- When `photo_url` is null, render a generic coffee bag graphic (bundled SVG/PNG, no external image)
- Overlay the first 2 letters of the bag name (uppercase) centered on the graphic
- Implemented as a shared `<CoffeeThumbnail>` component reused across screens

**Usage:**
- Collection screen: 72×72px thumbnail on each coffee card
- Coffee Detail screen: larger prominent image, same `photo_url` value

### Coffee Data Retrieval Strategy
**Three-Phase Pipeline** (see Tech_Architecture.md Section 6 for full implementation detail):

1. **Phase 1 — Roaster's Website (highest trust)**
   - Searches for and scrapes the roaster's own product page
   - Values found here take precedence over all other sources
   - `photoUrl` sourced here is always preferred

2. **Phase 2 — Popular Coffee Retail Sites**
   - Checks in fixed order: drinktrade.com → beanbox.com → wholelattelove.com → mistobox.com → coffeereview.com
   - Each site fills only fields still null after Phase 1
   - `photoUrl` sourced here used only if Phase 1 did not provide one

3. **Phase 3 — AI Agent (obscure roasters only)**
   - Runs only if fields remain null after Phases 1 and 2
   - Claude agent searches the broader web iteratively to infer missing values
   - Fields filled by this phase are tagged as `inferredFields` in the API response
   - UI displays "AI inferred" label on these fields so users can review and correct

4. **Manual Entry**
   - Any field still null after all three phases is left blank for the user to fill in
   - Only Bag Name and Roaster Name are required; all other fields are optional

### Data Storage
**Multi-user support requires cloud-based storage:**
- **Required:** Cloud database to support user authentication and data isolation
- **Database options:**
  - PostgreSQL or MySQL for relational data (users, coffee records with foreign keys)
  - MongoDB for document-based storage
  - Firebase or Supabase for rapid development with built-in auth
- **Data access control:** Query filters to ensure users only access their own coffee records

### Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | React | Responsive design for mobile and desktop |
| **Backend** | TypeScript | Type-safe server-side development |
| **Authentication** | JWT tokens | Session-based auth with secure token management |
| **Database** | PostgreSQL, Firebase, or Supabase | Cloud-based with built-in auth options |
| **OCR Processing** | Tesseract.js or Claude API | For Bag Name + Roaster Name extraction |
| **Primary Data Source** | Perplexity API | Intelligent coffee metadata lookup |
| **Fallback Data Source** | Web Search API | Google Custom Search, Bing, or SerpAPI |
| **Camera** | Browser MediaDevices API | Native camera access for photo capture |

---

## Development Milestones

### Milestone 1: Design Wireframes
**Focus:** Establish the foundational design and architecture of the application.

**Deliverables:**
- User flow diagrams for all core journeys (registration, login, add coffee, brew log)
- Navigation structure and hierarchy
- Information architecture defining data organization and relationships
- Content strategy outlining text, labels, and messaging
- Low-fidelity wireframes for all screens
- Interaction patterns and state transitions

**Exit Criteria:**
- All user flows documented and approved
- Wireframes cover 100% of defined features
- Navigation and IA validated against user stories

---

### Milestone 2: Visual User Interface
**Focus:** Develop the complete visual design and interactive UI components.

**Deliverables:**
- Design system (colors, typography, spacing, components)
- High-fidelity mockups for all screens
- Interactive prototype demonstrating key user flows
- Responsive designs for mobile and desktop viewports
- UI component library in React

**Exit Criteria:**
- All screens designed and reviewed
- Component library implemented and documented

---

### Milestone 3: Backend & API Integration
**Focus:** Build the server infrastructure and integrate all data lookup services.

**Deliverables:**
- TypeScript backend server setup
- User authentication system (registration, login, session management)
- Database schema and migrations
- OCR integration (Tesseract.js or Claude API)
- Perplexity API integration for coffee metadata lookup
- Web Search API fallback implementation
- Image upload and storage pipeline
- API endpoints for all CRUD operations

**Exit Criteria:**
- All API endpoints functional and tested
- OCR successfully extracts bag/roaster names
- Perplexity API returns structured coffee data
- Fallback chain (Perplexity → Web Search → Manual) working
- Authentication flow secure and complete

---

## Answered Questions & Decisions

### Authentication & User Management

#### 1. Password Requirements
**Decision:**
- Minimum 8 characters
- At least one uppercase letter, one lowercase letter, one number
- Special characters encouraged but optional

**Rationale:** Balanced security without being overly burdensome for a personal app.

#### 2. Email Verification
**Decision:** Not in MVP. Consider for Phase 2.

#### 3. Password Reset
**Decision:** Not in MVP. Consider for Phase 2.

#### 4. Remember Me
**Decision:** Not in MVP. Consider for Phase 2.

#### 5. Account Deletion
**Decision:** Not in MVP. Consider for Phase 2.

#### 6. Social Login
**Decision:** Not in MVP. Consider for Phase 2.
- Phase 1: Email/password authentication only


---

### Coffee Tracking Features

#### 7. Image Storage & Display
**Decision:** User photos are for OCR processing only; display uses professional images.

**User-Taken Photos:**
- Used solely for OCR text extraction (bag name, roaster name)
- Not stored long-term after processing
- Processed and discarded to minimize storage costs

**Display Photos — Source Requirements:**
- Only use professional product photos sourced from the roaster's official website or a reputable coffee retail site (drinktrade.com, beanbox.com, mistobox.com, driftaway.coffee)
- The photo must show a coffee bag only — no lifestyle shots, cups, brewing equipment, or people
- URL must be validated at lookup time (HTTP HEAD request confirming a 200 response and `image/*` content type) before being stored
- If no valid image is found, store null and display the placeholder (see below)

**Placeholder — No Image Found:**
- Display a gradient placeholder derived deterministically from the coffee bag name (same name always produces the same colors)
- Gradient style varies across four types: diagonal linear, radial burst, 3-stop linear, radial ellipse — making each coffee visually distinct
- Colors are drawn from the app's design token palette (primary teal, indigo, violet, amber, emerald, blue, orange)
- Overlay the first 2 letters of the bag name (e.g., "Sa" for "Sample Roast"), uppercase, with a contrasting palette color
- Placeholder is used consistently in both the Collection screen and the Coffee Detail screen
- Each coffee card in the Collection screen also has a colored left border accent drawn from the same palette color as its placeholder
- The Coffee Detail screen shows a colored glow around the image container using the same accent color

**Display Dimensions:**
- Collection screen thumbnail: 72×72px square, cropped to fill
- Coffee Detail screen: larger format (full-width or prominent image area), same aspect ratio
- Both views use the same `photo_url` value — no separate image stored per context

**Rationale:** Professional photos ensure consistent, high-quality visual presentation throughout the app. User photos often have poor lighting, angles, or quality that would detract from the user experience. Restricting to coffee-bag-only images maintains visual consistency across the collection.

#### 8. Manual Coffee Entry
**Decision:** Yes, support manual entry without photo.
- Add "Add Manually" button alongside "Take Photo" option
- All fields become manual input (no OCR/API lookup)
- Optional: Allow uploading photo from gallery

**Rationale:** Flexibility for edge cases: gifted beans without bags, bulk beans, repackaged beans, beans from cafes, or users who prefer manual entry.

#### 9. Delete Coffee
**Decision:** Supported in MVP. Accessible from the Coffee Detail screen only — not from the Collection screen.

**Behavior:**
- A "Delete Coffee" button is shown at the bottom of the Coffee Detail screen
- Tapping it shows an inline confirmation ("Delete this coffee from your collection?") with Cancel and Yes, Delete buttons
- On confirmation, the coffee record is permanently deleted from the database
- User is navigated back to the Collection screen after deletion
- The button is intentionally de-emphasized (small, muted color) to prevent accidental taps

**Rationale:** Delete is a destructive action and should require intentional navigation to the detail screen plus an explicit confirmation step. Keeping it off the Collection screen prevents accidental mass deletions.

#### 10. Search/Filter
**Decision:** Future improvement. Not in MVP.

#### 10. Duplicate Detection
**Decision:** Not in MVP. Future improvement.

#### 11. Data Export
**Decision:** Not in MVP. Potential Phase 3 feature.

#### 12. Social Features
**Decision:** Not in MVP. Potential Phase 3 feature.

---

### Technical & API

#### 13. API Rate Limits
**Decision:** Implement caching and user limits.

**Strategy:**
- Cache Perplexity API results by roaster name + bag name combination
- Cache duration: 90 days (coffee specs rarely change)
- Daily user limit: 20 new coffees per day (prevents abuse)
- If user hits limit: Skip API calls, show manual entry form with helpful message
- If API returns rate limit error: Fall back to manual entry gracefully

**Rationale:** Cost control while accommodating legitimate use. Most home baristas won't add 20 coffees in a day.

#### 14. Data Accuracy Feedback
**Decision:** Not for MVP. Potential Phase 2 feature.

#### 15. Partial Data UX
**Decision:** Allow saving with partial data. Only Bag Name and Roaster Name are required. All other fields are optional and can be left empty or filled in later.

#### 16. Perplexity Query Optimization
**Decision:** Start with structured query, iterate based on results.

**Initial Query Format:**
```
[Roaster Name] [Bag Name] coffee bean specifications: origin country, roast level, varietal, altitude, processing method, flavor notes, body profile
```

**Request Format:**
- Ask for structured response or JSON format if possible
- Include current year or "recent" to prioritize fresh results


#### 17. Cost Management
**Decision:** Budget and monitor closely during beta.

**Cost Estimates:**
- Perplexity API: ~$0.02-0.05 per query
- Web Search fallback: ~$0.01 per search
- Total per coffee: ~$0.10 maximum (including retries)

**Strategy:**
- Set monthly budget cap based on projected user base
- Monitor costs per user in beta phase
- Implement caching aggressively (90-day cache)
- Consider tiered pricing: Free tier (X coffees/month), Premium tier (unlimited)

**Rationale:** Need real-world usage data to optimize costs. Caching reduces repeat queries significantly.

#### 18. Body Profile Description
**Decision:** Auto-generated with user edit capability.

**Behavior:**
- Primary: Auto-generated from Perplexity API or web search
- User can click "Edit" button to modify description
- If edited, show "(edited)" indicator
- Save both original and edited versions (for future ML training)

**Rationale:** Best of both worlds—convenience of automation with flexibility to correct or personalize.

#### 19. Brew Log Reminders
**Decision:** Optional feature, default OFF.

**Implementation:**
- Settings toggle: "Brew Log Reminders" (default: OFF)
- If enabled: Send one gentle reminder 1 week after adding coffee
- Reminder text: "How did [Coffee Name] taste? Add your brew notes."
- Frequency cap: Maximum one notification per week across all coffees
- Easy opt-out: "Don't remind me about this coffee" option

**Rationale:** Some users appreciate prompts, others find notifications annoying. Make it opt-in to respect user preferences.

#### 20. Grind Setting Range
**Decision:** No hard limits, flexible validation.

**Validation Rules:**
- Must be positive number with exactly one decimal place
- Format: `^\d+\.\d$` (e.g., 4.0, 15.5, 100.0)
- Acceptable range: 0.1 to 999.9 (effectively no upper limit)

**Why No Hard Limits:**
- Hand grinders (e.g., Comandante, 1Zpresso): typically 0.0-30.0
- Baratza Encore: 1-40
- Commercial grinders: Can go to 100+
- Different grinders use vastly different scales

**Rationale:** Grinders have no universal scale. Flexibility accommodates all grinder types. Users track settings for their specific grinder.

---

**Version:** 2.6
**Last Updated:** March 23, 2026
**Changelog:**
- v2.6: Replaced Perplexity/web search lookup with 3-phase roaster-first pipeline; added Lookup Progress Indicator requirement (3-step visual + per-phase status messages); added "AI Inferred" field annotation requirement (inline on form and Coffee Detail screen); added Missing Field Display rule (null shown as "N/A" in UI)
- v2.5: Updated placeholder spec to gradient-based design (palette colors, 4 gradient styles, accent border on collection cards, glow on detail screen); added Delete Coffee requirement (detail screen only, inline confirmation)
- v2.4: Expanded image requirements — source rules (roaster website or drinktrade.com, coffee bag only), URL validation, placeholder spec (generic bag graphic + 2-letter initials), display dimensions for collection and detail screens; added Coffee Bag Thumbnail Images technical section
- v2.3: Removed accessibility (WCAG 2.1 AA) requirement and user-testing exit criterion from M2; moved search/filter and duplicate detection to future improvements; simplified partial data UX
- v2.2: Updated image display requirement - use professional roaster photos instead of user-taken photos
- v2.1: Added Tech Stack specification (React frontend, TypeScript backend) and 3 Development Milestones
- v2.0: Answered all 20 open questions with detailed decisions and rationale
