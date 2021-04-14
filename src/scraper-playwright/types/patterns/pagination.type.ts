import { PatternContainer } from "./pattern-container.type";
import { PatternField } from "./pattern.type";

export interface PatternPaginationField extends PatternField{
  key: "text"| "url";
  returnType: "text";
  
}
export interface PatternPagination extends PatternContainer<PatternPaginationField>{
  paginationType:"pager"|"lazy";
}