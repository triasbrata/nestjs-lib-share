export interface PatternThreadPage {
  FIRST_POST_CONTENT_PATTERN: string;
  FIRST_POST_DATE_PATTERN: string;
  FIRST_POST_DATE_GENERIC_PATTERN: string;
  FIRST_POST_AUTHOR: string;
}

export interface PatternIndexPage extends Record<string, string> {
  THREAD_NODE_PATTERN: string;
  THREAD_ID_PATTERN: string;
  THREAD_TITLE_PATTERN: string;
  THREAD_LINK_PATTERN: string;
  THREAD_LINK_EXC_PARAMS: string;
  THREAD_REPLIES_PATTERN: string;
  THREAD_VIEWS_PATTERN: string;
  THREAD_LAST_POST_PATTERN: string;
  THREAD_LAST_POST_DATE_PATTERN: string;
  PAGINATION_NODE_PATTERN: string;
  PAGINATION_LABEL_PATTERN: string;
  PAGINATION_LINK_PATTERN: string;
}

export interface PatternFieldSubForum {
  domain: string;
  index_page: PatternIndexPage;
  thread_page: PatternThreadPage;
}
