type HugoFrontMatter = {
  date: string;
  title: string;
  description: string;
  slug: string;
  tags: string;
  categories: string;
  keywords: string;
  summary: string;
  url: string;
};

type HugoContent = {
  frontMatter: HugoFrontMatter;
  body: string;
  title: string;
  uri: string;
  filePath: string;
  isDraft: boolean;
  isEmpty: boolean;
};

type LyraDoc = {
  title: string;
  body: string;
  uri: string;
  meta: HugoFrontMatter;
};

type LyraOptions = {
  indexFilePath?: string;
  indexDefaultLang?: string;
  indexFormat?: string;
};

type IndexResult = {
  indexFilePath: string;
  foundDocuments: number;
  indexed: number;
  docs?: LyraDoc[];
};

export { IndexResult, LyraDoc, LyraOptions, HugoContent as HugoPost, HugoFrontMatter };
