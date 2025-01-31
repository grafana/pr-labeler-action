export type PullRequest = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [p: string]: any;
  body?: string | undefined;
  html_url?: string | undefined;
  number: number;
  title?: string;
};
