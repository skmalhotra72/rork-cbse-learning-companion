# AI Integration Guide

## Overview

This guide documents the complete AI integration layer for the CBSE learning app. The AI system provides intelligent gap diagnosis, concept explanations, quiz generation, and vision-based textbook help.

---

## Architecture

### Core Components

1. **AI Service Module** (`services/aiService.ts`)
   - Centralized AI operations
   - Type-safe interfaces
   - Comprehensive error handling
   - Console logging for debugging

2. **System Prompts** (SYSTEM_PROMPTS constant)
   - Reusable, configurable prompts
   - Context-aware instructions
   - Consistent tone across features

3. **Type Definitions**
   - Strong typing for all inputs/outputs
   - Zod schemas for runtime validation
   - Proper message format types

---

## Features

### 1. DIAGNOSE_GAPS

**Purpose:** Analyze student's self-assessment and pain points to identify concept gaps.

**Input:**
```typescript
interface DiagnoseGapsInput {
  studentClass: CBSEClass;
  subject: Subject;
  painPoints: string[];
  selfRating: string;
}
```

**Output:**
```typescript
ConceptGap[] // Array of identified gaps
```

**Usage Example:**
```typescript
import { diagnoseGaps } from '@/services/aiService';

const gaps = await diagnoseGaps({
  studentClass: '10',
  subject: 'Mathematics',
  painPoints: ['quadratic equations', 'factorization'],
  selfRating: 'struggling'
});
```

**System Prompt Features:**
- Considers student's self-rating
- Analyzes pain points
- Maps to CBSE curriculum chapters
- Identifies 2-3 key gaps
- Determines severity (critical/moderate/minor)
- Lists prerequisites for each gap

---

### 2. EXPLAIN_CONCEPT

**Purpose:** Provide step-by-step explanations for specific concepts.

**Input:**
```typescript
interface ExplainConceptInput {
  subject: Subject;
  studentClass: CBSEClass;
  concept: string;
  studentQuestion: string;
}
```

**Output:**
```typescript
string // Clear explanation text
```

**Usage Example:**
```typescript
import { explainConcept } from '@/services/aiService';

const explanation = await explainConcept({
  subject: 'Physics',
  studentClass: '11',
  concept: 'Newton\'s Laws of Motion',
  studentQuestion: 'Why does an object at rest stay at rest?'
});
```

**System Prompt Features:**
- Patient, tutor-like tone
- Starts with basics
- Uses simple language
- Includes relatable examples
- Provides 1-2 memorable analogies
- Concise (150-250 words)

---

### 3. CREATE_QUIZ

**Purpose:** Generate multiple-choice questions to test understanding.

**Input:**
```typescript
interface CreateQuizInput {
  subject: Subject;
  studentClass: CBSEClass;
  concept: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionCount?: number;
}
```

**Output:**
```typescript
QuizQuestion[] // Array of quiz questions
```

**Usage Example:**
```typescript
import { generateQuiz } from '@/services/aiService';

const quiz = await generateQuiz({
  subject: 'Chemistry',
  studentClass: '12',
  concept: 'Chemical Bonding',
  difficulty: 'medium',
  questionCount: 5
});
```

**System Prompt Features:**
- CBSE exam style
- 4 options per question
- Clear explanations for correct answers
- Progressive difficulty
- No trick questions
- Genuine concept testing

---

### 4. MOTIVATIONAL_MESSAGE

**Purpose:** Generate personalized encouragement based on student progress.

**Input:**
```typescript
interface MotivationalMessageInput {
  studentName: string;
  recentProgress: {
    xp: number;
    level: number;
    streakDays: number;
    recentAchievement?: string;
  };
}
```

**Output:**
```typescript
string // Motivational message
```

**Usage Example:**
```typescript
import { generateMotivationalMessage } from '@/services/aiService';

const message = await generateMotivationalMessage({
  studentName: 'Priya',
  recentProgress: {
    xp: 350,
    level: 4,
    streakDays: 7,
    recentAchievement: 'Completed 5 quizzes'
  }
});
```

**System Prompt Features:**
- Personalized with student name
- Acknowledges specific progress
- Teen-friendly language
- Avoids clichés
- Short (2-3 sentences)
- Encouraging but authentic

---

### 5. VISION_TEXTBOOK_HELP

**Purpose:** Analyze textbook images and explain concepts with vision AI.

**Input:**
```typescript
interface VisionTextbookHelpInput {
  imageBase64: string;
  studentQuestion: string;
  subject: Subject;
  studentClass: CBSEClass;
}
```

**Output:**
```typescript
{
  explanation: string;
  relatedConcepts: string[];
}
```

**Usage Example:**
```typescript
import { analyzeTextbookImage } from '@/services/aiService';

const analysis = await analyzeTextbookImage({
  imageBase64: 'data:image/jpeg;base64,...',
  studentQuestion: 'I don\'t understand this diagram',
  subject: 'Biology',
  studentClass: '11'
});
```

**System Prompt Features:**
- Identifies concepts in images
- Explains in teen-friendly language
- Breaks down formulas/diagrams
- Suggests 2-3 related concepts
- Encouraging tone
- Non-judgmental

---

### 6. MICRO_LESSON

**Purpose:** Generate engaging, bite-sized lessons for specific concepts.

**Input:**
```typescript
interface MicroLessonInput {
  subject: Subject;
  studentClass: CBSEClass;
  concept: string;
  chapter: string;
}
```

**Output:**
```typescript
MicroLesson {
  id: string;
  gapId: string;
  title: string;
  content: string;
  examples: string[];
  completed: boolean;
}
```

**Usage Example:**
```typescript
import { generateMicroLesson } from '@/services/aiService';

const lesson = await generateMicroLesson({
  subject: 'Mathematics',
  studentClass: '10',
  concept: 'Quadratic Formula',
  chapter: 'Quadratic Equations'
});
```

**System Prompt Features:**
- Friendly tutor tone
- Starts with "why this matters"
- Step-by-step breakdown
- 2-3 concrete examples
- Real-life or CBSE textbook context
- Concise (200-300 words)
- Encouraging and positive

---

## Type System

### Message Types

```typescript
// Text message part
interface AITextMessage {
  type: 'text';
  text: string;
}

// Image message part (for vision)
interface AIImageMessage {
  type: 'image';
  image: string; // base64 encoded
}

// Combined message content
type AIMessageContent = string | (AITextMessage | AIImageMessage)[];

// User message
interface AIUserMessage {
  role: 'user';
  content: AIMessageContent;
}

// Assistant message
interface AIAssistantMessage {
  role: 'assistant';
  content: string;
}

// Combined message types
type AIMessage = AIUserMessage | AIAssistantMessage;
```

### Zod Schemas

All AI responses are validated using Zod schemas:

```typescript
const ConceptGapSchema = z.object({
  subject: z.string(),
  chapter: z.string(),
  concept: z.string(),
  severity: z.enum(['critical', 'moderate', 'minor']),
  description: z.string(),
  prerequisites: z.array(z.string()),
});

const QuizSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.number(),
    explanation: z.string(),
    concept: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
  })),
});

const MicroLessonSchema = z.object({
  title: z.string(),
  content: z.string(),
  examples: z.array(z.string()),
});

const VisionTextbookSchema = z.object({
  explanation: z.string(),
  relatedConcepts: z.array(z.string()),
});
```

---

## Error Handling

All AI functions implement comprehensive error handling:

```typescript
try {
  const result = await generateObject({
    messages: [{ role: "user", content: prompt }],
    schema: SomeSchema as any,
  });
  
  console.log('[AI Service] Success message');
  return processedResult;
} catch (error) {
  console.error('[AI Service] Error description:', error);
  throw new Error('User-friendly error message');
}
```

### Error Patterns

1. **Network Errors**: Caught and re-thrown with friendly messages
2. **Validation Errors**: Zod schema validation failures
3. **Timeout Errors**: Long-running AI requests
4. **Rate Limiting**: Too many requests

---

## Best Practices

### 1. Console Logging

All functions log their operations:

```typescript
console.log('[AI Service] Starting operation...');
console.log('[AI Service] Generated X items');
console.error('[AI Service] Error occurred:', error);
```

### 2. Input Objects

All functions use object parameters for maintainability:

```typescript
// ✅ Good
await diagnoseGaps({ studentClass, subject, painPoints, selfRating });

// ❌ Bad
await diagnoseGaps(studentClass, subject, painPoints, selfRating);
```

### 3. Type Safety

Always use TypeScript interfaces:

```typescript
const input: DiagnoseGapsInput = {
  studentClass: '10',
  subject: 'Mathematics',
  painPoints: ['quadratics'],
  selfRating: 'struggling'
};

const gaps = await diagnoseGaps(input);
```

### 4. Vision Support

For vision features, properly format images:

```typescript
const content: AIMessageContent = [
  { type: "text", text: prompt },
  { type: "image", image: base64Image }
];
```

---

## Integration Examples

### In React Components

```typescript
import { useState } from 'react';
import { diagnoseGaps } from '@/services/aiService';

function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleDiagnose = async () => {
    setLoading(true);
    setError('');
    
    try {
      const gaps = await diagnoseGaps({
        studentClass: '10',
        subject: 'Mathematics',
        painPoints: ['algebra'],
        selfRating: 'struggling'
      });
      
      // Process gaps...
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (/* UI */);
}
```

### In Backend/tRPC

```typescript
import { diagnoseGaps } from '@/services/aiService';

export const diagnoseGapsProcedure = protectedProcedure
  .input(z.object({
    studentClass: z.enum(['9', '10', '11', '12']),
    subject: z.string(),
    painPoints: z.array(z.string()),
    selfRating: z.string()
  }))
  .mutation(async ({ input }) => {
    const gaps = await diagnoseGaps(input);
    return gaps;
  });
```

---

## Testing

### Manual Testing

```typescript
// Test gap diagnosis
const testGaps = async () => {
  const gaps = await diagnoseGaps({
    studentClass: '10',
    subject: 'Mathematics',
    painPoints: ['solving equations', 'graphing'],
    selfRating: 'struggling'
  });
  
  console.log('Gaps:', gaps);
};

// Test quiz generation
const testQuiz = async () => {
  const quiz = await generateQuiz({
    subject: 'Physics',
    studentClass: '11',
    concept: 'Newton\'s Laws',
    difficulty: 'easy',
    questionCount: 3
  });
  
  console.log('Quiz:', quiz);
};
```

### Vision Testing

```typescript
const testVision = async () => {
  const base64 = 'data:image/jpeg;base64,...';
  
  const result = await analyzeTextbookImage({
    imageBase64: base64,
    studentQuestion: 'What is this formula?',
    subject: 'Chemistry',
    studentClass: '12'
  });
  
  console.log('Analysis:', result);
};
```

---

## Performance Considerations

1. **Caching**: Consider caching common quiz questions
2. **Debouncing**: Debounce user inputs before AI calls
3. **Loading States**: Always show loading indicators
4. **Timeouts**: Implement reasonable timeouts
5. **Retries**: Consider retry logic for transient failures

---

## Future Enhancements

- [ ] Add streaming support for long explanations
- [ ] Implement conversation history for follow-up questions
- [ ] Add difficulty adaptation based on quiz performance
- [ ] Support for audio explanations
- [ ] Multi-language support
- [ ] Personalized learning paths
- [ ] Progress-based prompt customization

---

## Troubleshooting

### Common Issues

**Issue**: "Failed to diagnose gaps"
- **Cause**: Network error or API timeout
- **Solution**: Check internet connection, retry

**Issue**: Empty or invalid responses
- **Cause**: Schema validation failure
- **Solution**: Check Zod schemas match AI output format

**Issue**: Vision analysis fails
- **Cause**: Image too large or invalid format
- **Solution**: Compress images, ensure base64 encoding

---

## Support

For questions or issues with AI integration:
1. Check console logs for detailed error messages
2. Review system prompts for context
3. Test with simple inputs first
4. Ensure proper type definitions

---

## Summary

The AI integration layer provides:
✅ Type-safe interfaces
✅ Comprehensive error handling  
✅ Reusable system prompts
✅ Vision support
✅ JSON output formatting
✅ Extensive logging
✅ Clean, maintainable code

All AI features are production-ready and follow best practices for React Native and TypeScript development.
