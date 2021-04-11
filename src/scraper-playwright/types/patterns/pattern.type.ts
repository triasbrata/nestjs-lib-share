import { CleanerStepRules, CleanerType } from "@lib/entities/schemas/pipe-rule";

export interface PatternField{
  key: string;
  patternType: "xpath" | "css",
  returnType: "text"| "rawHTML"
  pipes: CleanerStepRules;
  patterns: string[];
}