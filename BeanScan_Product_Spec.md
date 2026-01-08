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
  - Rate limiting on login attempts to prevent brute force
  - Secure password reset flow (future consideration)

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
- **Optional enhancement:** Local caching for offline access (sync when online)

### Tech Stack Recommendation
- **Frontend:** React (with artifact support for rapid prototyping)
- **Backend:** Node.js/Express, Python/FastAPI, or serverless functions
- **Authentication:** JWT tokens or session-based auth
- **Database:** PostgreSQL, MongoDB, Firebase, or Supabase (includes auth)
- **OCR Processing:** Tesseract.js or Claude API for Bag Name + Roaster Name
- **Primary Data Source:** Perplexity API
- **Fallback Data Source:** Web Search API (Google Custom Search, Bing, or SerpAPI)
- **Camera:** Browser MediaDevices API

---

## Open Questions for Iteration

### Authentication & User Management
1. **Password Requirements:** What specific password complexity rules? (minimum length, special characters, etc.)
2. **Email Verification:** Should users verify their email before accessing the app?
3. **Password Reset:** How should password reset flow work? (email link, security questions, etc.)
4. **Remember Me:** Should there be a "remember me" option for persistent login?
5. **Account Deletion:** How should users delete their accounts? What happens to their data?
6. **Social Login:** Support for OAuth (Google, Apple, etc.) in addition to email/password?

### Coffee Tracking Features
7. **Image Storage:** Should we store the original bag photo? (Storage implications)
8. **Editing:** Can users manually add coffee without a photo?
9. **Search/Filter:** How should users find coffees in their collection? (by roaster, origin, rating, etc.)
10. **Duplicates:** What happens if user photographs the same bag twice?
11. **Export:** Should users be able to export their data (CSV, JSON)?
12. **Social Features:** Any sharing capabilities? (Future consideration)

### Technical & API
13. **API Rate Limits:** How to handle Perplexity API rate limits? Cache results? Daily limits?
14. **Data Accuracy Feedback:** Should users be able to flag incorrect auto-populated data to improve system?
15. **Partial Data UX:** How much manual entry is acceptable? If 5/8 fields fail, should we still proceed?
16. **Perplexity Query Optimization:** What's the best query format to get highest accuracy from Perplexity?
17. **Cost Management:** Budget for Perplexity API + Web Search API calls per coffee?
18. **Body Profile Description:** Should the short description be auto-generated or user-editable?
19. **Brew Log Reminders:** Should users get notifications to update their brew log after adding a coffee?
20. **Grind Setting Range:** What's the acceptable range for grind settings? (e.g., 0.0 - 100.0)?

---

**Version:** 1.2
**Last Updated:** January 8, 2026
