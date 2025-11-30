# DailyMath AI Implementation Plan

## Overview

This document outlines the complete plan to implement an end-to-end AI system for DailyMath using the Vercel AI SDK with Google Gemini models.

---

## Current Status

### What Exists (Already Implemented)
- Complete AI module structure at `modules/ai/`
- Question generation service with bilingual support
- Socratic tutoring with progressive hints
- Image analysis for handwritten solutions
- 6 tRPC procedures registered
- 5 React hooks for client usage
- Comprehensive type definitions

### What Needs Update
1. **Model Version**: Update from `gemini-2.0-flash` to `gemini-2.5-flash`
2. **Image Support**: Add base64 image support (currently URL-only)
3. **API Key**: Set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`
4. **Demo Page**: Create test page for verification
5. **Integration**: Wire AI into practice flow

---

## Implementation Steps

### Step 1: Update AI Configuration

Update `modules/ai/config/index.ts` to use `gemini-2.5-flash`:

```typescript
export const QUESTION_GENERATION_CONFIG: AIModelConfig = {
  model: "gemini-2.5-flash",  // Updated from gemini-2.0-flash
  temperature: 0.7,
  maxTokens: 1024,
};
```

### Step 2: Add Base64 Image Support

Update `modules/ai/server/services/image-analysis.service.ts`:
- Accept both URL and base64 data
- Support direct file uploads from client

### Step 3: Create API Test Endpoint

Create `app/api/ai/test/route.ts`:
- Simple endpoint to verify AI is working
- Returns a test question generation

### Step 4: Create AI Demo Page

Create `app/[locale]/(dashboard)/dev-ai/page.tsx`:
- Test question generation
- Test image analysis with file upload
- Test hint generation
- Display results in real-time

### Step 5: Wire into Practice Flow

Update practice module:
- Use AI-generated questions when exercise bank is empty
- Connect image upload to AI analysis
- Wire hint requests to Socratic tutor

---

## File Changes

### Files to Update

1. **`modules/ai/config/index.ts`**
   - Change model to `gemini-2.5-flash`

2. **`modules/ai/server/services/image-analysis.service.ts`**
   - Add base64 support
   - Improve error handling

3. **`modules/ai/server/procedures.ts`**
   - Add base64 image input option
   - Add test procedure

4. **`.env.local`**
   - Add `GOOGLE_GENERATIVE_AI_API_KEY`

### Files to Create

1. **`app/api/ai/test/route.ts`** - Quick test endpoint
2. **`app/[locale]/(dashboard)/dev-ai/page.tsx`** - Demo UI
3. **`modules/ai/ui/components/AITestPanel.tsx`** - Test component

---

## API Usage Examples

### Question Generation
```typescript
const question = await trpc.ai.generateQuestion.mutate({
  topicId: "derivatives-basics",
  difficulty: "medium",
  locale: "en",
});
```

### Image Analysis
```typescript
const analysis = await trpc.ai.analyzeImage.mutate({
  imageBase64: "data:image/jpeg;base64,/9j/4AAQ...",
  questionText: "Find the derivative of f(x) = x^3",
  correctAnswer: "3x^2",
  locale: "en",
});
```

### Hint Generation
```typescript
const hint = await trpc.ai.getHint.mutate({
  questionText: "Find the derivative of f(x) = x^3",
  correctAnswer: "3x^2",
  userAttempt: "x^2",
  previousHints: [],
  locale: "en",
});
```

---

## Testing Checklist

- [ ] API key is set and working
- [ ] Question generation returns valid structure
- [ ] Hebrew translations are correct
- [ ] Image analysis works with uploaded photos
- [ ] Hints are progressive and helpful
- [ ] Error handling works correctly
- [ ] Demo page displays all features

---

## Dependencies

Already installed:
- `ai`: ^5.0.104
- `@ai-sdk/google`: ^2.0.44
- `zod`: ^4.1.13

No additional dependencies needed.

---

## Security Notes

1. All AI procedures use `protectedProcedure` (require auth)
2. API key stored in environment variable (not client-side)
3. Input validation with Zod schemas
4. Rate limiting should be added for production

---

## Estimated Timeline

| Task | Duration |
|------|----------|
| Update config | 5 min |
| Add base64 support | 15 min |
| Create test endpoint | 10 min |
| Create demo page | 30 min |
| Wire into practice | 20 min |
| Testing | 15 min |
| **Total** | **~1.5 hours** |
