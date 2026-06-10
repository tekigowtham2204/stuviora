/**
 * Skill assessment (M2 / audit #11: "ship or remove" - shipped).
 *
 * A 5-question MCQ per category, graded on submit. Passing (4 of 5)
 * earns the verified-skill badge promised on the landing page. The
 * question bank is seeded and deterministic; the live path can later
 * rotate LLM-generated variants through the same grade function.
 *
 * Pure module: no I/O, fully unit-tested.
 */

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Index into options. Never shipped to the client. */
  answer: number;
}

export const PASS_THRESHOLD = 4;
export const QUESTIONS_PER_TEST = 5;

const BANK: Record<string, AssessmentQuestion[]> = {
  "content-copywriting": [
    { id: "cc1", prompt: "A client asks for SEO blog posts. What matters most for ranking?", options: ["Keyword stuffing every paragraph", "Search intent matched with clear structure and headings", "Maximum word count", "Many outbound links"], answer: 1 },
    { id: "cc2", prompt: "The brief says 'friendly tone'. Which opening fits best?", options: ["As per aforementioned considerations...", "Let us be honest: onboarding is where most apps lose people.", "This document outlines onboarding paradigms.", "ONBOARDING!!!"], answer: 1 },
    { id: "cc3", prompt: "What is a CTA?", options: ["A content tracking algorithm", "The call to action you want the reader to take", "A citation type annotation", "A type of headline font"], answer: 1 },
    { id: "cc4", prompt: "Before submitting a 1500-word article you should always...", options: ["Add more adjectives", "Run it through a thesaurus", "Check it against every requirement in the brief", "Shorten it to 500 words"], answer: 2 },
    { id: "cc5", prompt: "Plagiarism on a paid deliverable is...", options: ["Fine if you change a few words", "Acceptable with a citation", "Never acceptable; work must be original", "Allowed for definitions"], answer: 2 },
  ],
  "tech-development": [
    { id: "td1", prompt: "A client reports the page is slow. Your first step?", options: ["Rewrite it in another framework", "Measure: profile network and rendering to find the bottleneck", "Add a loading spinner", "Upgrade the server"], answer: 1 },
    { id: "td2", prompt: "Which belongs in version control?", options: ["node_modules", "API secret keys", "Source code and config templates", "Build artifacts"], answer: 2 },
    { id: "td3", prompt: "User input used in a database query must be...", options: ["Trimmed", "Parameterised or escaped to prevent injection", "Uppercased", "Logged"], answer: 1 },
    { id: "td4", prompt: "The brief says 'mobile responsive'. That means...", options: ["A separate mobile app", "Layout adapts across screen sizes", "Smaller fonts", "Removing images on phones"], answer: 1 },
    { id: "td5", prompt: "Before delivering a web project you should...", options: ["Delete the tests", "Verify the main flows work end to end", "Minify the README", "Remove error handling"], answer: 1 },
  ],
  "design-creative": [
    { id: "dc1", prompt: "A logo must work at small sizes. That favours...", options: ["Fine detail and thin lines", "Simple, distinct shapes with strong contrast", "Many gradients", "Photographic textures"], answer: 1 },
    { id: "dc2", prompt: "The client's brand uses warm earth tones. You should...", options: ["Use neon for contrast", "Stay inside the brand palette unless asked", "Convert everything to grayscale", "Pick your favourite colours"], answer: 1 },
    { id: "dc3", prompt: "What file should you deliver for a scalable logo?", options: ["JPEG", "Vector (SVG or AI) plus raster exports", "Screenshot", "GIF"], answer: 1 },
    { id: "dc4", prompt: "Visual hierarchy means...", options: ["Everything equally bold", "Guiding the eye: most important elements read first", "Alphabetical ordering", "Using one font size"], answer: 1 },
    { id: "dc5", prompt: "Client feedback says 'make it pop'. Best response?", options: ["Ignore it", "Ask what specifically feels flat: contrast, colour, scale?", "Add a drop shadow to everything", "Start over"], answer: 1 },
  ],
  "business-research": [
    { id: "br1", prompt: "A market-sizing estimate should always state...", options: ["Only the final number", "Assumptions and sources behind the number", "A precise figure to the rupee", "The competitor's revenue"], answer: 1 },
    { id: "br2", prompt: "Primary research means...", options: ["The first Google result", "Data you collect directly (surveys, interviews)", "Wikipedia", "Last year's report"], answer: 1 },
    { id: "br3", prompt: "In a slide deck for executives, each slide should...", options: ["Contain all your notes", "Make one clear point with supporting evidence", "Use 10+ bullet points", "Avoid numbers"], answer: 1 },
    { id: "br4", prompt: "A SWOT analysis covers...", options: ["Sales, wages, output, tax", "Strengths, weaknesses, opportunities, threats", "Software, websites, operations, training", "None of these"], answer: 1 },
    { id: "br5", prompt: "If data contradicts your hypothesis you should...", options: ["Hide the data", "Report it honestly and revise the conclusion", "Change the data", "Drop the project"], answer: 1 },
  ],
  "social-marketing": [
    { id: "sm1", prompt: "Reels engagement depends most on...", options: ["Posting at midnight", "A strong hook in the first 2 seconds", "Maximum hashtags", "Video length over 5 minutes"], answer: 1 },
    { id: "sm2", prompt: "A content calendar exists to...", options: ["Fill every day with posts", "Plan consistent, on-brand content against goals", "Track competitors", "Schedule ads only"], answer: 1 },
    { id: "sm3", prompt: "The client sells B2B software. Which platform usually fits best?", options: ["LinkedIn", "Snapchat", "Pinterest", "Tinder"], answer: 0 },
    { id: "sm4", prompt: "Engagement rate is...", options: ["Followers divided by posts", "Interactions relative to reach or followers", "Total likes ever", "Ad spend per click"], answer: 1 },
    { id: "sm5", prompt: "Before posting for a client you must...", options: ["Get approval per the agreed workflow", "Post fast and apologise later", "Use your personal account", "Buy followers"], answer: 0 },
  ],
  "data-ai": [
    { id: "da1", prompt: "Before analysing a dataset you should first...", options: ["Build a dashboard", "Inspect and clean it: missing values, types, outliers", "Run a regression", "Delete outliers blindly"], answer: 1 },
    { id: "da2", prompt: "Correlation between two variables means...", options: ["One causes the other", "They move together; causation needs more evidence", "The data is clean", "Nothing"], answer: 1 },
    { id: "da3", prompt: "The right chart for a share-of-total breakdown is usually...", options: ["Line chart", "Pie or stacked bar", "Scatter plot", "Histogram"], answer: 1 },
    { id: "da4", prompt: "An average can mislead when...", options: ["Data is symmetric", "The distribution is skewed by outliers", "n is large", "Units are rupees"], answer: 1 },
    { id: "da5", prompt: "Sharing a client's raw customer data publicly is...", options: ["Fine if anonymised by you informally", "A breach of confidentiality; never do it", "Good for your portfolio", "Required"], answer: 1 },
  ],
};

/** Questions for a category, without the answers (safe for the client). */
export function questionsFor(
  categorySlug: string
): Array<Omit<AssessmentQuestion, "answer">> | null {
  const qs = BANK[categorySlug];
  if (!qs) return null;
  return qs.map(({ id, prompt, options }) => ({ id, prompt, options }));
}

export interface AssessmentResult {
  total: number;
  correct: number;
  passed: boolean;
}

/** Grade submitted answers (map of questionId -> chosen option index). */
export function gradeAssessment(
  categorySlug: string,
  answers: Record<string, number>
): AssessmentResult | null {
  const qs = BANK[categorySlug];
  if (!qs) return null;
  const correct = qs.filter((q) => answers[q.id] === q.answer).length;
  return { total: qs.length, correct, passed: correct >= PASS_THRESHOLD };
}

export function assessableCategories(): string[] {
  return Object.keys(BANK);
}
