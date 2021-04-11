import { CleanerRuleTransformOpt, CleanerStepRules, PipeRule } from "@lib/entities/schemas/pipe-rule";
import { Type } from "class-transformer";
import { PatternContainer } from "./types/patterns/pattern-container.type";
import { PatternField } from "./types/patterns/pattern.type";

export class PatternContainerParser implements PatternContainer {
  patternType: "xpath" | "css";
  containerPattern: string;
  @Type(() => PatternParser)
  fields: PatternParser[];
}
export class PatternParser implements PatternField{
  returnType: "text" | "rawHTML";
  patternType: "xpath" | "css";
  key: string;
  @Type(() => PipeRule, CleanerRuleTransformOpt)
  pipes: CleanerStepRules;
  patterns: string[];
}