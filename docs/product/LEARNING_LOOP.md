# Learning Loop

1. Input concept
2. Break into concept nodes
3. Explain each node in my own words
4. Evaluate explanation
5. Mark weak nodes
6. Generate simpler explanation / analogy / review questions
7. Review later
8. Improve score
9. Store/export learning session

## Learning State

```ts
type LearningState =
  | "unknown"
  | "read"
  | "explained"
  | "verified"
  | "review_due"
  | "reviewed"
  | "mastered";
```

## Completion Criteria

A concept is not complete because it exists in a graph.

A concept is complete when I can explain it simply and pass review later.
