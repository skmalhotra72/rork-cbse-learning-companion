import { generateText, generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";
import {
  Subject,
  CBSEClass,
  ConceptGap,
  QuizQuestion,
  MicroLesson,
  CHAPTER_DATA,
} from "@/constants/cbse";

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

export async function diagnoseGaps(
  studentClass: CBSEClass,
  subject: Subject,
  painPoints: string[],
  selfRating: string
): Promise<ConceptGap[]> {
  console.log(`[AI Service] Diagnosing gaps for ${subject} - Class ${studentClass}`);
  
  const chapters = CHAPTER_DATA[subject]?.[studentClass] || [];
  const chapterList = chapters.map((ch) => `${ch.name} (ID: ${ch.id})`).join(', ');

  const prompt = `You are an expert CBSE educator for Class ${studentClass} ${subject}.

Student's self-rating: ${selfRating}
Student's reported pain points: ${painPoints.length > 0 ? painPoints.join('; ') : 'None specified'}

Available chapters for Class ${studentClass} ${subject}: ${chapterList}

Analyze the student's pain points and self-rating. Identify 2-3 concept gaps where the student is struggling.

For each gap:
1. Identify the specific chapter and concept
2. Determine severity (critical/moderate/minor) based on how fundamental the concept is
3. Provide a clear description of what the student is missing
4. List 1-3 prerequisite concepts they need to review first

Return 2-3 concept gaps.`;

  try {
    const result = await generateObject({
      messages: [{ role: "user", content: prompt }],
      schema: z.object({
        gaps: z.array(ConceptGapSchema),
      }) as any,
    });

    console.log(`[AI Service] Diagnosed ${(result as any).gaps.length} gaps`);

    return (result as any).gaps.map((gap: any, index: number) => ({
      id: `gap_${Date.now()}_${index}`,
      subject,
      chapter: gap.chapter,
      concept: gap.concept,
      severity: gap.severity,
      description: gap.description,
      prerequisites: gap.prerequisites,
      detectedAt: Date.now(),
    }));
  } catch (error) {
    console.error('[AI Service] Error diagnosing gaps:', error);
    throw new Error('Failed to diagnose gaps. Please try again.');
  }
}

export async function generateMicroLesson(
  subject: Subject,
  studentClass: CBSEClass,
  concept: string,
  chapter: string
): Promise<MicroLesson> {
  console.log(`[AI Service] Generating micro-lesson for ${concept}`);

  const prompt = `You are a friendly CBSE tutor teaching Class ${studentClass} ${subject}.

Create a short, engaging micro-lesson for the concept: "${concept}" from chapter "${chapter}".

Guidelines:
- Use simple, teen-friendly language (no condescending tone)
- Start with "why this matters" to build motivation
- Break down the concept step-by-step
- Use 2-3 concrete examples from real life or CBSE textbook context
- Keep it concise (200-300 words for content)
- Be encouraging and positive

Return:
- title: A catchy title for the lesson
- content: The main lesson explanation
- examples: Array of 2-3 example problems or scenarios`;

  try {
    const result = await generateObject({
      messages: [{ role: "user", content: prompt }],
      schema: MicroLessonSchema as any,
    });

    console.log(`[AI Service] Generated lesson: ${(result as any).title}`);

    return {
      id: `lesson_${Date.now()}`,
      gapId: '',
      title: (result as any).title,
      content: (result as any).content,
      examples: (result as any).examples,
      completed: false,
    };
  } catch (error) {
    console.error('[AI Service] Error generating lesson:', error);
    throw new Error('Failed to generate lesson. Please try again.');
  }
}

export async function generateQuiz(
  subject: Subject,
  studentClass: CBSEClass,
  concept: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  questionCount: number = 5
): Promise<QuizQuestion[]> {
  console.log(`[AI Service] Generating ${difficulty} quiz for ${concept}`);

  const prompt = `You are a CBSE exam question setter for Class ${studentClass} ${subject}.

Create ${questionCount} multiple-choice questions to test understanding of: "${concept}".

Requirements:
- Difficulty level: ${difficulty}
- Each question should have 4 options
- Mark the correct answer (0-3 index)
- Provide a clear, educational explanation for the correct answer
- Questions should progressively test understanding
- Use CBSE exam style and terminology
- Avoid trick questions; focus on genuine concept understanding

Return exactly ${questionCount} questions.`;

  try {
    const result = await generateObject({
      messages: [{ role: "user", content: prompt }],
      schema: QuizSchema as any,
    });

    console.log(`[AI Service] Generated ${(result as any).questions.length} quiz questions`);

    return (result as any).questions.map((q: any, index: number) => ({
      id: `q_${Date.now()}_${index}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      concept: q.concept,
      difficulty: q.difficulty,
    }));
  } catch (error) {
    console.error('[AI Service] Error generating quiz:', error);
    throw new Error('Failed to generate quiz. Please try again.');
  }
}

export async function analyzeTextbookImage(
  imageBase64: string,
  studentQuestion: string,
  subject: Subject,
  studentClass: CBSEClass
): Promise<{ explanation: string; relatedConcepts: string[] }> {
  console.log(`[AI Service] Analyzing textbook image for ${subject}`);

  const prompt = `You are a helpful CBSE tutor for Class ${studentClass} ${subject}.

The student is stuck on this textbook page and asks: "${studentQuestion}"

Analyze the image and:
1. Identify what concept/topic is shown
2. Explain the concept in simple, teen-friendly language
3. Break down any complex formulas or diagrams
4. Suggest 2-3 related concepts they should review to understand this better

Be encouraging and avoid making the student feel bad about not understanding.`;

  try {
    const result = await generateObject({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", image: imageBase64 },
          ],
        },
      ],
      schema: z.object({
        explanation: z.string(),
        relatedConcepts: z.array(z.string()),
      }) as any,
    });

    console.log(`[AI Service] Analyzed image, found ${(result as any).relatedConcepts.length} related concepts`);

    return result as { explanation: string; relatedConcepts: string[] };
  } catch (error) {
    console.error('[AI Service] Error analyzing image:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
}

export async function generateMotivationalMessage(
  studentName: string,
  recentProgress: {
    xp: number;
    level: number;
    streakDays: number;
    recentAchievement?: string;
  }
): Promise<string> {
  console.log(`[AI Service] Generating motivational message for ${studentName}`);

  const prompt = `You are an encouraging learning coach for a CBSE student named ${studentName}.

Recent progress:
- Level: ${recentProgress.level}
- Total XP: ${recentProgress.xp}
- Learning streak: ${recentProgress.streakDays} days
${recentProgress.recentAchievement ? `- Recent achievement: ${recentProgress.recentAchievement}` : ''}

Generate a short (2-3 sentences), personalized, uplifting message that:
1. Acknowledges their effort and progress
2. Encourages them to keep going
3. Uses teen-friendly, genuine language (not cheesy or over-the-top)

Be authentic and avoid clichés.`;

  try {
    const message = await generateText({ messages: [{ role: "user", content: prompt }] });
    console.log(`[AI Service] Generated motivational message`);
    return message;
  } catch (error) {
    console.error('[AI Service] Error generating message:', error);
    return `Hey ${studentName}! Great work keeping up the learning. Every step forward counts! 💪`;
  }
}

export async function explainConcept(
  subject: Subject,
  studentClass: CBSEClass,
  concept: string,
  studentQuestion: string
): Promise<string> {
  console.log(`[AI Service] Explaining concept: ${concept}`);

  const prompt = `You are a patient CBSE tutor for Class ${studentClass} ${subject}.

A student asks about "${concept}": "${studentQuestion}"

Provide a clear, step-by-step explanation that:
1. Starts with the basics
2. Uses simple language and relatable examples
3. Addresses their specific question
4. Includes 1-2 analogies to make it memorable
5. Is encouraging and supportive

Keep it concise (150-250 words).`;

  try {
    const explanation = await generateText({ messages: [{ role: "user", content: prompt }] });
    console.log(`[AI Service] Generated explanation`);
    return explanation;
  } catch (error) {
    console.error('[AI Service] Error explaining concept:', error);
    throw new Error('Failed to explain concept. Please try again.');
  }
}
