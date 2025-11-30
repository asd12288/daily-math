"use client";

// AI Demo Page - Test all AI features
// Route: /[locale]/dev-ai

import { useState, useRef } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/shared/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";
import { Icon } from "@iconify/react";
import {
  useTodaySet,
  useTriggerDailyGeneration,
  useTriggerReminderEmail,
} from "@/modules/practice/hooks";

export default function AITestPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
          <Icon icon="tabler:brain" className="text-white" height={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Testing Dashboard
          </h1>
          <p className="text-gray-500">Test all AI features end-to-end</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyGenerationTrigger />
        <ConnectionTest />
        <QuestionGenerator />
        <ImageAnalyzer />
        <HintGenerator />
      </div>
    </div>
  );
}

function ConnectionTest() {
  const testQuery = trpc.ai.testConnection.useQuery(undefined, {
    enabled: false,
    retry: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="tabler:plug-connected" height={20} />
          Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Test if the AI service is properly connected and responding.
        </p>

        <Button
          onClick={() => testQuery.refetch()}
          isLoading={testQuery.isFetching}
          variant="primary"
        >
          Test Connection
        </Button>

        {testQuery.data && (
          <div
            className={`p-4 rounded-lg ${
              testQuery.data.success
                ? "bg-success-50 border border-success-200"
                : "bg-error-50 border border-error-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon
                icon={testQuery.data.success ? "tabler:check" : "tabler:x"}
                className={
                  testQuery.data.success ? "text-success-600" : "text-error-600"
                }
                height={20}
              />
              <span
                className={`font-medium ${
                  testQuery.data.success ? "text-success-700" : "text-error-700"
                }`}
              >
                {testQuery.data.success ? "Connected!" : "Connection Failed"}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Model: {testQuery.data.model}
            </p>
            <p className="text-sm text-gray-600">
              Response: {testQuery.data.message}
            </p>
          </div>
        )}

        {testQuery.error && (
          <div className="p-4 rounded-lg bg-error-50 border border-error-200">
            <p className="text-error-700 text-sm">{testQuery.error.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuestionGenerator() {
  const [topicId, setTopicId] = useState("basic-equations");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );

  const generateMutation = trpc.ai.generateQuestion.useMutation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="tabler:math" height={20} />
          Question Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Topic ID
          </label>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600"
          >
            <optgroup label="Foundations">
              <option value="order-of-operations">Order of Operations</option>
              <option value="fractions-decimals">Fractions & Decimals</option>
              <option value="basic-equations">Basic Equations</option>
            </optgroup>
            <optgroup label="Linear">
              <option value="linear-equations-one-var">Linear Equations (One Variable)</option>
              <option value="linear-word-problems">Linear Word Problems</option>
              <option value="systems-of-equations">Systems of Equations</option>
            </optgroup>
            <optgroup label="Polynomials">
              <option value="expanding-expressions">Expanding Expressions</option>
              <option value="factoring-basics">Factoring Basics</option>
              <option value="factoring-trinomials">Factoring Trinomials</option>
            </optgroup>
            <optgroup label="Quadratics">
              <option value="quadratic-by-factoring">Solving by Factoring</option>
              <option value="quadratic-formula">Quadratic Formula</option>
              <option value="quadratic-word-problems">Quadratic Word Problems</option>
            </optgroup>
            <optgroup label="Functions">
              <option value="function-notation">Function Notation</option>
              <option value="domain-range">Domain & Range</option>
              <option value="basic-graphing">Basic Graphing</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Difficulty
          </label>
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  difficulty === d
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() =>
            generateMutation.mutate({ topicId, difficulty, locale: "en" })
          }
          isLoading={generateMutation.isPending}
          variant="primary"
        >
          Generate Question
        </Button>

        {generateMutation.data && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
            <div>
              <span className="text-xs font-medium text-gray-500">
                QUESTION
              </span>
              <p className="text-gray-900 dark:text-white font-medium">
                {generateMutation.data.questionText}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">
                QUESTION (Hebrew)
              </span>
              <p className="text-gray-900 dark:text-white" dir="rtl">
                {generateMutation.data.questionTextHe}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">ANSWER</span>
              <p className="text-success-600 font-mono">
                {generateMutation.data.correctAnswer}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">HINT</span>
              <p className="text-gray-600 dark:text-gray-400 italic">
                {generateMutation.data.hint}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">
                SOLUTION STEPS
              </span>
              <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400">
                {generateMutation.data.solutionSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-500">
                Difficulty:{" "}
                <span className="font-medium">
                  {generateMutation.data.difficulty}
                </span>
              </span>
              <span className="text-gray-500">
                Est. Time:{" "}
                <span className="font-medium">
                  {generateMutation.data.estimatedMinutes} min
                </span>
              </span>
            </div>
          </div>
        )}

        {generateMutation.error && (
          <div className="p-4 rounded-lg bg-error-50 border border-error-200">
            <p className="text-error-700 text-sm">
              {generateMutation.error.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ImageAnalyzer() {
  const [imageData, setImageData] = useState<string>("");
  const [questionText, setQuestionText] = useState(
    "Find the derivative of f(x) = x^3 + 2x"
  );
  const [correctAnswer, setCorrectAnswer] = useState("3x^2 + 2");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = trpc.ai.analyzeImage.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageData(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="tabler:photo-scan" height={20} />
          Image Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Upload Handwritten Solution
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon icon="tabler:upload" className="mr-2" />
              Choose Image
            </Button>
            {imageData && (
              <span className="text-sm text-success-600 flex items-center">
                <Icon icon="tabler:check" className="mr-1" />
                Image loaded
              </span>
            )}
          </div>
        </div>

        {imageData && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic user-uploaded image with data URL */}
            <img
              src={imageData}
              alt="Uploaded solution"
              className="w-full max-h-48 object-contain rounded-lg border"
            />
            <button
              onClick={() => setImageData("")}
              className="absolute top-2 right-2 p-1 bg-error-500 text-white rounded-full"
            >
              <Icon icon="tabler:x" height={16} />
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Question Text
          </label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Correct Answer
          </label>
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <Button
          onClick={() =>
            analyzeMutation.mutate({
              imageData,
              questionText,
              correctAnswer,
              locale: "en",
            })
          }
          isLoading={analyzeMutation.isPending}
          disabled={!imageData}
          variant="primary"
        >
          Analyze Solution
        </Button>

        {analyzeMutation.data && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
            <div className="flex items-center gap-2">
              <Icon
                icon={
                  analyzeMutation.data.isCorrect
                    ? "tabler:check-circle"
                    : "tabler:x-circle"
                }
                className={
                  analyzeMutation.data.isCorrect
                    ? "text-success-500"
                    : "text-error-500"
                }
                height={24}
              />
              <span
                className={`font-medium ${
                  analyzeMutation.data.isCorrect
                    ? "text-success-600"
                    : "text-error-600"
                }`}
              >
                {analyzeMutation.data.isCorrect === true
                  ? "Correct!"
                  : analyzeMutation.data.isCorrect === false
                    ? "Incorrect"
                    : "Could not determine"}
              </span>
            </div>

            {analyzeMutation.data.extractedAnswer && (
              <div>
                <span className="text-xs font-medium text-gray-500">
                  EXTRACTED ANSWER
                </span>
                <p className="text-gray-900 dark:text-white font-mono">
                  {analyzeMutation.data.extractedAnswer}
                </p>
              </div>
            )}

            <div>
              <span className="text-xs font-medium text-gray-500">
                FEEDBACK
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {analyzeMutation.data.feedback}
              </p>
            </div>

            {analyzeMutation.data.stepsIdentified.length > 0 && (
              <div>
                <span className="text-xs font-medium text-gray-500">
                  STEPS IDENTIFIED
                </span>
                <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400">
                  {analyzeMutation.data.stepsIdentified.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {analyzeMutation.data.errors.length > 0 && (
              <div>
                <span className="text-xs font-medium text-error-500">
                  ERRORS FOUND
                </span>
                <ul className="list-disc list-inside text-sm text-error-600">
                  {analyzeMutation.data.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {analyzeMutation.data.suggestions.length > 0 && (
              <div>
                <span className="text-xs font-medium text-primary-500">
                  SUGGESTIONS
                </span>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  {analyzeMutation.data.suggestions.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {analyzeMutation.error && (
          <div className="p-4 rounded-lg bg-error-50 border border-error-200">
            <p className="text-error-700 text-sm">
              {analyzeMutation.error.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HintGenerator() {
  const [questionText, setQuestionText] = useState("Solve for x: 2x + 5 = 13");
  const [correctAnswer, setCorrectAnswer] = useState("x = 4");
  const [userAttempt, setUserAttempt] = useState("");
  const [hints, setHints] = useState<string[]>([]);

  const hintMutation = trpc.ai.getHint.useMutation({
    onSuccess: (data) => {
      setHints((prev) => [...prev, data.hint]);
    },
  });

  const resetHints = () => {
    setHints([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="tabler:bulb" height={20} />
          Hint Generator (Socratic Tutor)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Question
          </label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => {
              setQuestionText(e.target.value);
              resetHints();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Correct Answer (hidden from student)
          </label>
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => {
              setCorrectAnswer(e.target.value);
              resetHints();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Student&apos;s Attempt (optional)
          </label>
          <input
            type="text"
            value={userAttempt}
            onChange={(e) => setUserAttempt(e.target.value)}
            placeholder="What the student has tried so far..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() =>
              hintMutation.mutate({
                questionText,
                correctAnswer,
                userAttempt: userAttempt || undefined,
                previousHints: hints,
                locale: "en",
              })
            }
            isLoading={hintMutation.isPending}
            variant="primary"
          >
            Get Hint #{hints.length + 1}
          </Button>

          {hints.length > 0 && (
            <Button variant="outline" onClick={resetHints}>
              Reset Hints
            </Button>
          )}
        </div>

        {hints.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-500">
              HINTS ({hints.length})
            </span>
            {hints.map((hint, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-primary-600">
                    Hint
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{hint}</p>
              </div>
            ))}
          </div>
        )}

        {hintMutation.error && (
          <div className="p-4 rounded-lg bg-error-50 border border-error-200">
            <p className="text-error-700 text-sm">
              {hintMutation.error.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DailyGenerationTrigger() {
  const { dailySet, isLoading: isLoadingSet, refetch } = useTodaySet();
  const {
    trigger: triggerGeneration,
    isTriggering: isGenerating,
    result: generationResult,
    error: generationError,
  } = useTriggerDailyGeneration();
  const {
    trigger: triggerEmail,
    isTriggering: isSendingEmail,
    result: emailResult,
    error: emailError,
  } = useTriggerReminderEmail();

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="tabler:calendar-plus" height={20} />
          Daily Generation Trigger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Manually trigger daily set generation and email notifications for
          testing. This simulates what the cron jobs do automatically.
        </p>

        {/* Current Daily Set Status */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Current Daily Set Status
          </h4>
          {isLoadingSet ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : dailySet ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-gray-500">Date</span>
                <p className="text-sm font-medium">{dailySet.date}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Problems</span>
                <p className="text-sm font-medium">
                  {dailySet.completedCount}/{dailySet.totalProblems}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Status</span>
                <p
                  className={`text-sm font-medium ${dailySet.isCompleted ? "text-success-600" : "text-warning-600"}`}
                >
                  {dailySet.isCompleted ? "Completed" : "In Progress"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Focus Topic</span>
                <p className="text-sm font-medium truncate">
                  {dailySet.focusTopicName}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No daily set found. Click &quot;Generate Daily Set&quot; to
              create one.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => triggerGeneration()}
            isLoading={isGenerating}
            variant="primary"
          >
            <Icon icon="tabler:sparkles" className="mr-2" height={18} />
            Generate Daily Set
          </Button>

          <Button
            onClick={() => triggerEmail()}
            isLoading={isSendingEmail}
            variant="outline"
            disabled={!dailySet}
          >
            <Icon icon="tabler:mail" className="mr-2" height={18} />
            Send Reminder Email
          </Button>

          <Button onClick={() => refetch()} variant="ghost">
            <Icon icon="tabler:refresh" className="mr-2" height={18} />
            Refresh Status
          </Button>
        </div>

        {/* Generation Result */}
        {generationResult && (
          <div
            className={`p-4 rounded-lg ${
              generationResult.success
                ? "bg-success-50 border border-success-200"
                : "bg-error-50 border border-error-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon
                icon={
                  generationResult.success ? "tabler:check" : "tabler:alert-circle"
                }
                className={
                  generationResult.success ? "text-success-600" : "text-error-600"
                }
                height={20}
              />
              <span
                className={`font-medium ${
                  generationResult.success
                    ? "text-success-700"
                    : "text-error-700"
                }`}
              >
                {generationResult.message}
              </span>
            </div>
            {generationResult.dailySet && (
              <div className="text-sm text-gray-600">
                <p>
                  Generated {generationResult.dailySet.totalProblems} problems
                </p>
                <p>Focus topic: {generationResult.dailySet.focusTopicName}</p>
              </div>
            )}
          </div>
        )}

        {/* Email Result */}
        {emailResult && (
          <div
            className={`p-4 rounded-lg ${
              emailResult.success
                ? "bg-success-50 border border-success-200"
                : "bg-error-50 border border-error-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon
                icon={emailResult.success ? "tabler:check" : "tabler:alert-circle"}
                className={
                  emailResult.success ? "text-success-600" : "text-error-600"
                }
                height={20}
              />
              <span
                className={`font-medium ${
                  emailResult.success ? "text-success-700" : "text-error-700"
                }`}
              >
                {emailResult.message}
              </span>
            </div>
          </div>
        )}

        {/* Errors */}
        {generationError && (
          <div className="p-4 rounded-lg bg-error-50 border border-error-200">
            <p className="text-error-700 text-sm">{generationError.message}</p>
          </div>
        )}
        {emailError && (
          <div className="p-4 rounded-lg bg-error-50 border border-error-200">
            <p className="text-error-700 text-sm">{emailError.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
