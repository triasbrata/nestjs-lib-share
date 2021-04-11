import { PatternField } from "./pattern.type";

export interface PatternContainer<F extends PatternField = PatternField> {
  containerPattern: string
  patternType: "xpath" | "css",
  fields: F[];
}