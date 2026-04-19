# Data Models (MVP)

## Experiment
```ts
type ExperimentVariant = "quiz" | "tools" | "hybrid";
type Experiment = {
  experimentName: "homepage_v1";
  variant: ExperimentVariant;
};
```

## Content store
```ts
type ContentType = "quiz" | "tool";

type Content = {
  id: string;
  type: ContentType;
  title: string;
  tags: string[];
  data: unknown; // quiz/tool-specific payload
};
```

### Quiz data (`data`)
```ts
type QuizData = {
  questions: Array<{
    id: string;
    prompt: string;
    options: Array<{ key: string; label: string }>;
  }>;
  resultMapping: {
    // minimal MVP: map answer combinations to resultId + tags
    [resultKey: string]: { resultId: string; tags: string[] };
  };
};
```

### Tool data (`data`)
```ts
type ToolData = {
  toolId: string;
  toolCategory: string;
  inputSchema: unknown; // MVP can be minimal
  outputSchema: unknown;
  staticTemplates?: string[]; // MVP fallback
};
```

## Recommendation rule output
```ts
type Recommendation = {
  quizIds: string[];
  toolIds: string[];
};
```
