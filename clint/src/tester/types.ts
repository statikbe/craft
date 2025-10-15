import { type } from 'os';

// Output Types
export type RenderType = 'cli' | 'json' | 'html' | 'html-snippet' | 'excel';
export type OutputType = 'a11yTester' | 'htmlTester' | 'linkTester' | 'headingTester' | 'compareLinksTester';

export type HTMLErrorMessage = {
  message: string;
  line?: number;
  column?: number;
  selector?: string;
  ruleId?: string;
  ruleUrl?: string;
  elementText?: string;
};

export type OutputTypeHTML = {
  url: string;
  errorMessages: HTMLErrorMessage[];
  numberOfErrors?: number;
  id?: string;
};

export type BrokenLink = {
  url: string;
  status: string;
  tag?: string;
  selector?: string;
  linkText?: string;
};

export type OutputTypeLink = {
  url: string;
  brokenLinks: BrokenLink[];
  okLinks?: BrokenLink[];
  numberOfErrors?: number;
  numberOfOKLinks?: number;
  id?: string;
};

export type A11yErrorMessage = {
  message: string;
  selector?: string;
  context?: string;
};

export type OutputTypeA11y = {
  url: string;
  errorMessages: A11yErrorMessage[];
  numberOfErrors?: number;
  level?: string;
  id?: string;
};

// Production Types
export type RunData = {
  tests: ProjectData[];
};

export type ProjectData = {
  sitemap: string;
  url: string;
  projectCode: string;
  slackChannel: string;
  tests: string[];
  frequency: number;
};

export type TestLog = {
  executions: Execution[];
};

export type Execution = {
  projectCode: string;
  created: string;
  date: string;
  results?: TestResult[];
};

export type TestResult = {
  filename: string;
  numberOfUrls: number;
  numberOfUrlsWithErrors: number;
  numberOfUrlsWithoutErrors?: number;
  type?: string;
  passed?: boolean;
  errorData?: OutputTypeHTML | OutputTypeLink | OutputTypeA11y;
};

export type NewError = {
  type: string;
  amount: number;
};
