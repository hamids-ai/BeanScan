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

### 2. Coffee Bean Profile (Auto-populated)
The following information is extracted/determined from the bag photo:

| Field | Format/Values | Data Source Method |
|-------|---------------|-------------------|
| Bag Name | Text | **OCR from bag** |
| Roaster Name | Text | **OCR from bag** |
| Roaster Location | City, State, Country | Perplexity API → Web Search → Manual Entry |
| Origins | Country 1, Country 2, etc. | Perplexity API → Web Search → Manual Entry |
| Roast Level | Light / Medium-Light / Medium / Medium-Dark / Dark | Perplexity API → Web Search → Manual Entry |
| Coffee Bean Varietal | e.g., Bourbon, Typica, Caturra | Perplexity API → Web Search → Manual Entry |
| Altitude | e.g., 1600m | Perplexity API → Web Search → Manual Entry |
| Processing Method | e.g., Washed, Natural, Honey, Anaerobic | Perplexity API → Web Search → Manual Entry |
| Flavor Profile | Tags/Text (e.g., Blueberry, Chocolate, Citrus) | Perplexity API → Web Search → Manual Entry |
| Body Profile | (Light/Medium/Full) & (Short Description) | Perplexity API → Web Search → Manual Entry |

**Data Retrieval Process:**

**Step 1: OCR Extraction**
- Extract Bag Name and Roaster Name from photo using OCR

**Step 2: Intelligent Lookup (for all other fields)**
1. **Primary Method - Perplexity API:**
   - Query: "[Roaster Name] [Bag Name] coffee specifications"
   - Parse structured response for all remaining fields

2. **Fallback Method - Web Search:**
   - If Perplexity fails or returns incomplete data
   - Query web search: "[Roaster Name] [Bag Name] coffee"
   - Parse search results for missing fields

3. **Manual Entry:**
   - If both automated methods fail for any field
   - Present user with form to manually enter missing data
   - Pre-fill any successfully retrieved fields

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
7. **Data Lookup** → Perplexity API retrieves coffee metadata (loading indicator)
8. **Fallback Processing** (if needed) → Web Search fills missing fields
9. **Review & Edit** → Pre-filled coffee profile with any missing fields highlighted for manual entry
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
4. Perplexity API attempts to fetch all other fields
5. Web Search fills any gaps (if needed)
6. Review auto-populated data
7. Manually enter any missing fields
8. Save to collection

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
  photoUrl: string,
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

### Coffee Data Retrieval Strategy
**Three-Tier Approach:**

1. **Primary: Perplexity API**
   - Query format: "[Roaster Name] [Bag Name] coffee specifications roast level origin varietal processing"
   - Advantages: Intelligent parsing, structured responses, current data
   - Returns: JSON-structured coffee metadata
   - Success rate target: 70-80%

2. **Fallback: Web Search**
   - Triggered when: Perplexity fails or returns incomplete data
   - Query format: "[Roaster Name] [Bag Name] coffee"
   - Parse: Search snippets and crawl roaster website if available
   - Success rate target: 15-20% of remaining failures

3. **Final Fallback: Manual Entry**
   - Triggered when: Both automated methods fail for specific fields
   - UX: Show form with empty fields or partial data
   - Allow: User to fill in missing information
   - Validate: Format/structure of user input

### Data Storage
**Multi-user support requires cloud-based storage:**
- **Required:** Cloud database to support user authentication and data isolation
- **Database options:**
  - PostgreSQL or MySQL for relational data (users, coffee records with foreign keys)
  - MongoDB for document-based storage
  - Firebase or Supabase for rapid development with built-in auth
- **Data access control:** Query filters to ensure users only access their own coffee records

### Tech Stack Recommendation
- **Frontend:** React (with artifact support for rapid prototyping, and the ability for responsive design on Mobile and Desktop)
- **Backend:** Node.js/Express, Python/FastAPI, or serverless functions
- **Authentication:** JWT tokens or session-based auth
- **Database:** PostgreSQL, MongoDB, Firebase, or Supabase (includes auth)
- **OCR Processing:** Tesseract.js or Claude API for Bag Name + Roaster Name
- **Primary Data Source:** Perplexity API
- **Fallback Data Source:** Web Search API (Google Custom Search, Bing, or SerpAPI)
- **Camera:** Browser MediaDevices API

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

#### 7. Image Storage
**Decision:** Yes, store original bag photos.
- Compress/optimize images to max 1MB per photo
- Display as thumbnail in collection view
- Full-size image on detail view
- Store in cloud storage (S3, Firebase Storage, etc.)

**Rationale:** Visual reference is valuable for memory, nostalgia, and quick identification. Storage costs are manageable with compression.

#### 8. Manual Coffee Entry
**Decision:** Yes, support manual entry without photo.
- Add "Add Manually" button alongside "Take Photo" option
- All fields become manual input (no OCR/API lookup)
- Optional: Allow uploading photo from gallery

**Rationale:** Flexibility for edge cases: gifted beans without bags, bulk beans, repackaged beans, beans from cafes, or users who prefer manual entry.

#### 9. Search/Filter
**Decision:** Implement comprehensive search and filter system.

**Search by:**
- Roaster name
- Bag name
- Origin/country
- Tasting notes (user-entered)

**Filter by:**
- Roast level (Light, Medium-Light, Medium, Medium-Dark, Dark)
- Rating (Great, Good, Neutral, Meh, Bad)
- Processing method (Washed, Natural, Honey, etc.)
- Origin/country

**Sort by:**
- Date added (newest/oldest)
- Rating (highest/lowest)
- Roaster name (alphabetical)

**Rationale:** Essential feature once users have 10-15+ coffees. Enables discovery and comparison.

#### 10. Duplicate Detection
**Decision:** Warn user but allow duplicates.
- Detect duplicates by matching: Roaster Name + Bag Name (case-insensitive)
- Show warning modal: "You may have already added this coffee. Would you like to view the existing entry?"
- Options: "View Existing" or "Add Anyway"
- Allow duplicate: User might legitimately buy the same coffee multiple times

**Rationale:** Helpful warning prevents accidental duplicates, but doesn't block legitimate re-purchases.

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
**Decision:** Allow saving with partial data, with clear UX indicators.

**Rules:**
- Minimum required: Bag Name, Roaster Name, + at least 1 additional field
- If only 2/8 fields: Prompt user "Would you like to add more details manually?"
- Show what was auto-populated vs. what needs manual entry
- Highlight missing fields in yellow with "Unknown" placeholder
- Allow saving incomplete records (users can update later)
- Display completeness indicator (e.g., "6/8 fields completed")

**Rationale:** Flexibility is key. Better to have partial data than force users to abandon entry. Users can research and update later.

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

**Version:** 2.0
**Last Updated:** January 8, 2026
**Changelog:** Answered all 20 open questions with detailed decisions and rationale
