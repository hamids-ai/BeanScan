# BeanScan Core Test Plan

---

## TC-01: New User Registration

**Description:** A new user can successfully create an account and land on their empty collection.

**Steps:**
1. Open the app and tap "Create Account" on the Welcome screen.
2. Enter a name, a valid email, and a password meeting all requirements (8+ chars, uppercase, lowercase, number).
3. Tap "Create Account."

**Expected Result:** Account is created, user is automatically logged in, and the Collection screen is shown with an empty state message.

---

## TC-02: User Login

**Description:** A registered user can log in with valid credentials.

**Steps:**
1. Open the app and tap "Sign In" on the Welcome screen.
2. Enter a valid registered email and password.
3. Tap "Sign In."

**Expected Result:** User is authenticated and navigated to the Collection screen.

---

## TC-03: User Logout

**Description:** A logged-in user can sign out and is returned to the Welcome screen.

**Steps:**
1. Log in and navigate to the Collection screen.
2. Tap the logout/sign-out button.

**Expected Result:** Session is cleared and the Welcome screen is shown.

---

## TC-04: Unauthenticated Route Redirect

**Description:** Accessing a protected screen without being logged in redirects to the Welcome screen.

**Steps:**
1. While logged out, navigate directly to `/collection` (or any protected route) in the browser.

**Expected Result:** User is redirected to the Welcome screen and cannot access protected content.

---

## TC-05: Registration — Invalid Password

**Description:** Registration fails if the password does not meet all requirements.

**Steps:**
1. Go to the Register screen.
2. Enter a valid name and email.
3. Enter a weak password (e.g., `password` — no uppercase or number).
4. Tap "Create Account."

**Expected Result:** An inline error message describes the unmet requirement(s) and the account is not created.

---

## TC-06: Registration — Duplicate Email

**Description:** Registration fails if the email address is already in use.

**Steps:**
1. Go to the Register screen.
2. Enter the name, email, and a valid password for an account that already exists.
3. Tap "Create Account."

**Expected Result:** An error message reads "An account with this email already exists." No new account is created.

---

## TC-07: Add Coffee — Manual Entry (Happy Path)

**Description:** A user can add a new coffee by filling in the form manually.

**Steps:**
1. From the Collection screen, tap the "+" button.
2. Tap "Add Manually."
3. Enter a Bag Name and Roaster Name (required fields). Optionally fill other fields.
4. Tap "Save."

**Expected Result:** The coffee is saved and the Coffee Detail screen is shown with the entered data.

---

## TC-08: Add Coffee — Photo Capture (OCR Success)

**Description:** A user can add a coffee by photographing the bag; AI extracts and populates the form.

**Steps:**
1. From the Collection screen, tap "+" → "Take Photo."
2. Take a clear photo of a coffee bag label (or upload one).
3. Wait for the loading steps: "Reading bag label..." → "Looking up coffee details..."
4. Review the pre-populated Coffee Form and tap "Save."

**Expected Result:** The bag name and roaster are extracted by OCR; additional details (roast level, origin, flavor profile, etc.) are populated by AI. Coffee is saved and the detail view is shown.

---

## TC-09: Add Coffee — OCR Failure Falls Back to Manual

**Description:** If OCR cannot read the bag, the user is given a warning and proceeds to an empty manual form.

**Steps:**
1. Tap "+" → "Take Photo."
2. Upload a blurry or unreadable image (e.g., a solid-color photo with no text).
3. Observe the loading state.

**Expected Result:** A warning indicator is shown on the loading screen, and the user is navigated to the Coffee Form with empty fields to fill in manually.

---

## TC-10: View Coffee Collection

**Description:** All saved coffees appear in the collection, ordered newest first.

**Steps:**
1. Add at least two coffees at different times.
2. Navigate to the Collection screen.

**Expected Result:** Both coffees appear as cards showing name, roaster, rating badge (if set), and date added. The most recently added coffee appears first.

---

## TC-11: View Coffee Detail

**Description:** Tapping a coffee card opens its full detail view with AI data and brew log sections.

**Steps:**
1. Tap any coffee card on the Collection screen.

**Expected Result:** The Coffee Detail screen shows the AI-populated section (purple) with specs like roast level, origin, varietal, and flavor tags, and the Brew Log section (amber). If no brew log exists, an "Add Brew Log" button is shown.

---

## TC-12: Add Brew Log (Happy Path)

**Description:** A user can add a brew log with a grind setting and save it successfully.

**Steps:**
1. Open a coffee's detail view.
2. Tap "Add Brew Log."
3. Enter a valid grind setting (e.g., `15.5`), select a rating, and add tasting notes.
4. Tap "Save."

**Expected Result:** The Brew Log section on the Coffee Detail screen shows the entered grind setting, rating, tasting notes, and a "Last updated" timestamp.

---

## TC-13: Edit Existing Brew Log

**Description:** A user can update a previously saved brew log.

**Steps:**
1. Open a coffee that already has a brew log.
2. Tap "Edit Brew Log."
3. Change the grind setting and/or rating.
4. Tap "Save."

**Expected Result:** The updated values are reflected on the Coffee Detail screen and the "Last updated" timestamp is refreshed.

---

## TC-14: Brew Log — Missing Grind Setting

**Description:** Saving a brew log without a grind setting shows a validation error.

**Steps:**
1. Open a coffee's detail view and tap "Add Brew Log" (or "Edit Brew Log").
2. Leave the Grind Setting field empty.
3. Tap "Save."

**Expected Result:** An inline error message reads "Grind setting must be a positive number (e.g. 15.5)." The brew log is not saved.

---

## TC-15: Daily Add Limit Enforcement

**Description:** A user cannot add more than 20 coffees in a single UTC day.

**Steps:**
1. Add 20 coffees in one day (manually, for speed).
2. Attempt to add a 21st coffee and tap "Save."

**Expected Result:** The app displays an error: "You have reached the daily limit of 20 coffees. Please try again tomorrow." The 21st coffee is not saved.

---

## TC-16: Camera Permission Denied

**Description:** If the user denies camera access, a clear error message is shown instead of a broken capture screen.

**Steps:**
1. On a device/browser where camera permissions have been denied for this app, tap "+" → "Take Photo."
2. Observe the Capture screen.

**Expected Result:** An error message is displayed: "Camera access was denied. Please allow camera access and reload." The app does not crash or show a blank screen.

---

## TC-17: Image Too Large (>5MB)

**Description:** Uploading an image over 5MB is rejected with an error before OCR is attempted.

**Steps:**
1. Tap "+" → "Take Photo."
2. Use the upload option to select an image file larger than 5MB.

**Expected Result:** The app displays an error indicating the image is too large and does not proceed to OCR processing.

---

## TC-18: Partial OCR Data (One Field Extracted)

**Description:** If OCR extracts only one of the two fields, the user is warned and can fill in the missing field manually.

**Steps:**
1. Tap "+" → "Take Photo."
2. Upload an image where only the roaster name (or only the bag name) is legible.
3. Observe the loading state and the resulting Coffee Form.

**Expected Result:** A warning indicator is shown on the loading screen. The Coffee Form is pre-populated with whichever field was extracted; the other field is empty for the user to fill in.

---

## TC-19: Clear All on Brew Log Form

**Description:** The "Clear All" button resets every field in the Brew Log form.

**Steps:**
1. Open a coffee's brew log (add or edit).
2. Fill in multiple fields: grind setting, rating, tasting notes, body notes, and dates.
3. Tap "Clear All."

**Expected Result:** All fields are reset to empty/blank. No data is saved until "Save" is tapped.

---

## TC-20: Login Rate Limiting

**Description:** Repeatedly failing to log in triggers a rate-limit error from Supabase Auth.

**Steps:**
1. Go to the Login screen.
2. Enter a valid email but an incorrect password.
3. Tap "Sign In" repeatedly in quick succession (5+ times within a minute).

**Expected Result:** After several failed attempts, the app displays a rate-limit error (e.g., "Too many attempts, please try again later.") and login is temporarily blocked.
