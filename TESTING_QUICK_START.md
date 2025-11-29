# 🚀 Quick Start Testing Guide

## ⚡ Get Started in 5 Minutes

### Prerequisites
- ✅ Bun installed
- ✅ Expo Go app on your phone (or simulator)
- ✅ OpenAI API key

---

## Step 1: Environment Setup (2 min)

### 1.1 Add OpenAI API Key
Edit `env.local` and add your OpenAI key:
```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

### 1.2 Start the App
```bash
bun start
```

### 1.3 Verify API URL
Check console output for:
```
EXPO_PUBLIC_RORK_API_BASE_URL=https://xxxx.ngrok.io
```

If it's empty, the tunnel didn't start properly. Try:
```bash
bun start --tunnel
```

---

## Step 2: Basic Smoke Test (3 min)

### Test 1: Authentication ✅
1. Scan QR code with Expo Go
2. App should redirect to login screen
3. Click "Sign up"
4. Create a student account:
   - Email: `test@student.com`
   - Password: `Test123!`
   - Full name: `Test Student`
   - Grade: `10`
   - Board: `CBSE`

**Expected:** 
- ✅ Account created
- ✅ Redirected to onboarding

### Test 2: Onboarding ✅
1. Complete onboarding flow:
   - Welcome screen → Enter name
   - Select class: `10`
   - Select subjects: `Mathematics`, `Physics`
   - Rate subjects: Select any ratings
   - Pain points: (optional) Add some text
   - Click "Start Learning"

**Expected:**
- ✅ Redirected to student dashboard
- ✅ Shows your name
- ✅ Shows Level 1, 0 points, 0 streak

### Test 3: Run Diagnosis 🧪
1. Click "Diagnose My Gaps"
2. Select subject: `Mathematics`
3. Select rating: e.g., "Struggling"
4. Add pain points: e.g., "Quadratic equations"
5. Click "Run Diagnosis"
6. Wait for AI analysis (10-30 seconds)

**Expected:**
- ✅ Shows loading spinner
- ✅ AI identifies 2-3 gaps
- ✅ Awards 10 XP
- ✅ Shows gap cards with concepts

---

## 🎯 Critical Path Test (Complete Flow)

### Full User Journey (10 min)

#### 1. Complete Diagnosis → Bridge → Quiz
```
Dashboard → Diagnose Gaps → Select Subject → Run AI
  ↓
View Gaps → Select a Gap → Start Lesson
  ↓
Read Lesson → Complete Lesson → Get 20 XP
  ↓
Take Quiz → Answer Questions → Get 50 XP
  ↓
Check Badges → See "First Steps" unlocked
```

#### 2. Check Results
- Dashboard should show updated XP
- Progress card should show gaps
- Badges screen should show earned badges
- Profile should show new level (if enough XP)

---

## 🐛 Common Issues & Fixes

### Issue: "No base url found" error
**Fix:** 
- Restart app with `bun start`
- Check console for ngrok URL
- Verify `env.local` has `EXPO_PUBLIC_RORK_API_BASE_URL`

### Issue: AI calls failing
**Fix:**
- Check OpenAI API key in `env.local`
- Verify key has credits
- Check backend logs for errors

### Issue: Database errors
**Fix:**
- Verify Supabase credentials
- Check if tables exist (see DATABASE_SCHEMA.md)
- Run SQL setup scripts if needed

### Issue: Authentication not working
**Fix:**
- Clear Expo cache: `bun start --clear`
- Check Supabase is online
- Verify auth tables exist

---

## 📱 Device-Specific Testing

### iOS
- Test camera permissions for textbook help
- Test image picker
- Verify SafeAreaView works properly
- Check tab bar on iPhone X+ notch

### Android
- Test back button behavior
- Check permissions for camera/storage
- Verify keyboard doesn't cover inputs
- Test on different screen sizes

### Web
- Test on Chrome/Safari/Firefox
- Verify responsive design
- Check that platform checks work
- Test file upload

---

## ✅ Acceptance Criteria

### Must Pass (Before Production)
- [ ] User can sign up
- [ ] User can complete onboarding
- [ ] User can run diagnosis
- [ ] AI generates valid gaps
- [ ] User can complete a lesson
- [ ] User can take a quiz
- [ ] XP is awarded correctly
- [ ] Badges unlock properly
- [ ] Parent can create rewards
- [ ] Textbook help works with images

### Nice to Have
- [ ] Loading states are smooth
- [ ] Error messages are clear
- [ ] Animations are delightful
- [ ] Performance is good on low-end devices

---

## 🔍 What to Look For

### UI/UX
- ✅ No white flashes during navigation
- ✅ Loading states show immediately
- ✅ Error messages are user-friendly
- ✅ Buttons provide visual feedback
- ✅ Text is readable (proper contrast)

### Functionality
- ✅ Data persists after app restart
- ✅ Navigation works correctly
- ✅ Forms validate inputs
- ✅ API calls don't hang indefinitely
- ✅ Offline behavior is graceful

### Performance
- ✅ App launches quickly (< 3s)
- ✅ Navigation is smooth (60fps)
- ✅ AI responses come in < 30s
- ✅ No memory leaks
- ✅ Battery usage is reasonable

---

## 📊 Test Results Template

Copy this to track your testing:

```markdown
## Test Session: [Date]
**Tester:** [Name]
**Device:** [iPhone 15 / Android / Web]
**Duration:** [X minutes]

### Tests Passed ✅
- [ ] Authentication
- [ ] Onboarding
- [ ] Diagnosis
- [ ] Lessons
- [ ] Quizzes
- [ ] Badges
- [ ] Rewards
- [ ] Textbook Help

### Bugs Found 🐛
1. [Description]
   - Severity: High/Medium/Low
   - Steps to reproduce:
   - Expected:
   - Actual:

2. [Description]
   ...

### Notes 📝
- Performance observations:
- UX feedback:
- Suggestions:
```

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. Run full test checklist (see FUNCTIONALITY_TEST_REPORT.md)
2. Test edge cases
3. Perform security audit
4. Test on multiple devices
5. Get user feedback
6. Prepare for production deployment

### If Tests Fail ❌
1. Document the bug
2. Identify root cause
3. Fix the issue
4. Re-test
5. Verify fix didn't break other features

---

## 💡 Pro Tips

1. **Test with Real Data:** Use actual CBSE concepts and realistic pain points
2. **Test Edge Cases:** Try empty inputs, very long text, special characters
3. **Test Offline:** See how the app handles no network
4. **Test Interruptions:** What happens if user gets a call during onboarding?
5. **Test Performance:** Use a low-end device or slow network simulation

---

## 🆘 Need Help?

1. Check console logs (Expo DevTools)
2. Check backend logs (terminal running `bun start`)
3. Review FUNCTIONALITY_TEST_REPORT.md for known issues
4. Check DATABASE_SCHEMA.md if database errors occur
5. Review AUTHENTICATION.md for auth issues

---

**Happy Testing! 🎉**
