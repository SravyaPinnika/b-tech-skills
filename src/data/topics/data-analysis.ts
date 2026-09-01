import type { TopicMap } from "../topicContent";

export const dataAnalysisTopics: TopicMap = {
  "Pandas / NumPy data wrangling": {
    summary:
      "NumPy gives vectorised numeric arrays; pandas adds labelled DataFrames with filtering, grouping and joining.",
    keyPoints: [
      "Vectorise — loops over rows are orders of magnitude slower than column operations.",
      "Use .loc for label indexing and .iloc for positions; avoid chained assignment.",
      "groupby -> agg is the workhorse for summaries.",
      "merge() mirrors SQL joins: inner, left, right, outer.",
    ],
    syntax: {
      lang: "python",
      code: "df = pd.read_csv('sales.csv')\ntop = (df[df.amount > 0]\n       .groupby('region')['amount']\n       .agg(['sum','mean'])\n       .sort_values('sum', ascending=False))",
    },
    diagram: `raw CSV -> DataFrame
  filter  ->  select rows
  assign  ->  new columns
  groupby ->  region | sum | mean
  merge   ->  join another table`,
    deepDive: [
      "NumPy arrays store data in contiguous, typed memory blocks, which lets operations run as fast, low-level loops in C rather than slow Python-level loops. This is why 'vectorising' — writing df['amount'] * 1.1 instead of looping row by row with a Python for-loop — can be 50-100x faster on large datasets; pandas is built on top of NumPy and inherits this same performance model for numeric columns.",
      "pandas adds labels (row index and column names) on top of NumPy arrays, plus tools for handling missing data, mixed types, and relational operations like groupby and merge. Understanding .loc (label-based selection, inclusive of the end label in slices) versus .iloc (purely positional, exclusive of the end like Python slicing) prevents a large class of off-by-one and silent-wrong-column bugs. Chained assignment (df[df.x > 0]['y'] = 1) is dangerous because pandas cannot guarantee whether the intermediate result is a view or a copy of the original data, so it may silently fail to update anything — the fix is a single .loc call: df.loc[df.x > 0, 'y'] = 1.",
      "groupby follows a split-apply-combine pattern: pandas splits the DataFrame into groups by the given key(s), applies an aggregation (or transformation) function to each group independently, then combines the results back into a single structure. merge() mirrors SQL joins directly — inner keeps only matching keys in both tables, left/right keep all rows from one side filling unmatched columns with NaN, and outer keeps everything from both sides. Choosing the wrong join type is one of the most common silent-data-loss bugs in analysis pipelines, since an inner join can quietly drop rows that don't have a match.",
    ],
    example: {
      title: "Finding top-selling region with groupby and sort",
      steps: [
        "Load sales.csv into a DataFrame with pd.read_csv.",
        "Filter to keep only positive amounts: df[df.amount > 0].",
        "Group the filtered rows by 'region' and select the 'amount' column.",
        "Aggregate with .agg(['sum', 'mean']) to get total and average sales per region.",
        "Sort by 'sum' descending to see the top-performing region first.",
      ],
      result: "A small DataFrame indexed by region showing total and average sales, sorted so the top-selling region appears in the first row.",
    },
    mistakes: [
      { mistake: "Looping over DataFrame rows with iterrows() for numeric calculations.", fix: "Vectorise with column-wise operations (df['a'] + df['b']) or .apply() only when a true vectorised option doesn't exist." },
      { mistake: "Using chained indexing like df[df.x>0]['y'] = 1 and getting a SettingWithCopyWarning.", fix: "Use a single .loc call: df.loc[df.x > 0, 'y'] = 1, which avoids ambiguity about views vs copies." },
      { mistake: "Defaulting to an inner join and silently losing unmatched rows.", fix: "Explicitly choose the join type (how='left'/'outer') based on whether you need to keep unmatched rows, and check row counts before/after merging." },
    ],
    interviewQA: [
      { q: "What is the difference between .loc and .iloc in pandas?", a: ".loc selects rows/columns by label (and includes the end label in a slice), while .iloc selects by integer position (and excludes the end, like standard Python slicing)." },
      { q: "Explain the split-apply-combine pattern behind groupby.", a: "pandas splits the DataFrame into groups based on the key column(s), applies a function (like sum or a custom aggregation) independently to each group, then combines the results into a new DataFrame or Series indexed by the group keys." },
      { q: "Why is vectorisation faster than looping in pandas/NumPy?", a: "Vectorised operations run as compiled, low-level loops over contiguous memory in C, avoiding the overhead of the Python interpreter executing each iteration individually, which is very expensive at scale." },
      { q: "What are the different types of joins in pandas merge()?", a: "inner (only matching keys in both), left (all left rows, matched right columns or NaN), right (all right rows), and outer (all rows from both, unmatched filled with NaN) — mirroring SQL join semantics." },
    ],
    practice: [
      "Load a CSV and compute total and average sales per category using groupby and agg.",
      "Compare timing of a for-loop versus a vectorised operation on a 1-million-row column.",
      "Merge two DataFrames (orders and customers) using left, inner, and outer joins and compare row counts.",
      "Fix a SettingWithCopyWarning in a small buggy script using .loc.",
      "Pivot a long-format sales DataFrame into a wide format with pivot_table.",
    ],
  },

  "Missing data & outlier strategy": {
    summary:
      "Decide per column whether missing values are random or meaningful, then drop, impute or flag them — never silently.",
    keyPoints: [
      "Drop rows only when few and randomly missing; drop columns above ~50% missing.",
      "Impute with median (numeric), mode (categorical), or a model; add an is_missing flag.",
      "Detect outliers with IQR (1.5x) or z-score > 3; investigate before deleting.",
      "Winsorise or log-transform heavy tails instead of removing real extremes.",
    ],
    syntax: {
      lang: "python",
      code: "df['age'] = df['age'].fillna(df['age'].median())\nq1, q3 = df.amt.quantile([.25, .75]); iqr = q3 - q1\nmask = df.amt.between(q1 - 1.5*iqr, q3 + 1.5*iqr)",
    },
    diagram: `box plot
   |----[ Q1 | med | Q3 ]----|   o    o
   lower fence         upper fence  outliers
   Q1-1.5*IQR          Q3+1.5*IQR`,
    deepDive: [
      "Missing data is not a single problem — the correct handling depends on the mechanism behind it. Data missing completely at random (MCAR) has no pattern and dropping it introduces little bias if the amount is small. Data missing at random (MAR) depends on other observed variables (e.g. income missing more often for younger respondents) and can be reasonably imputed using those other variables. Data missing not at random (MNAR) depends on the unobserved value itself (e.g. people with very high income refusing to disclose it) and is the hardest case — imputation can systematically bias results unless you model the missingness process explicitly.",
      "Imputation choice matters: mean/median imputation preserves the central tendency but artificially shrinks variance and can dampen real relationships if a large fraction of a column is imputed; model-based imputation (e.g. regression or k-NN imputation) captures relationships between features but can leak information if not done inside a cross-validation fold. Adding an 'is_missing' indicator column alongside the imputed value is a cheap way to let downstream models learn if the act of being missing itself carries signal (which it often does, e.g. someone skipping an income question).",
      "Outlier handling should start with investigation, not deletion — an extreme value could be a genuine rare event (a huge but real transaction), a data entry error (age = 200), or a different population altogether (a corporate account mixed into consumer data). IQR-based fences (values beyond 1.5x IQR from Q1/Q3) work well for skewed data since they don't assume normality, while z-score > 3 assumes roughly normal data and is sensitive to the very outliers you're trying to detect (since they also inflate the mean and sd used to compute the z-score). For heavy-tailed but genuine data, winsorising (capping extreme values at a percentile) or log-transforming preserves the signal from the tail while limiting its leverage on downstream statistics or models.",
    ],
    example: {
      title: "Cleaning a customer age column with imputation and outlier capping",
      steps: [
        "Column 'age' has 5% missing values and a few impossible entries like 250 and -3.",
        "First fix impossible values: treat age < 0 or age > 110 as missing (set to NaN), not as real data.",
        "Compute the median age of the remaining valid entries, e.g. 34.",
        "Fill all NaN values (original missing + impossible entries) with the median 34, and add a new column age_was_missing (1/0).",
        "Separately, compute IQR-based fences for a different skewed column (transaction amount) and cap values beyond the fences instead of deleting rows.",
      ],
      result: "The age column has no missing or impossible values, retains information about which rows were imputed, and extreme transaction amounts are capped rather than deleted, preserving all rows.",
    },
    mistakes: [
      { mistake: "Dropping every row with any missing value, losing large portions of the dataset.", fix: "Only drop rows when missingness is small and random; otherwise impute and consider whether an entire column should be dropped instead of many rows." },
      { mistake: "Deleting outliers automatically without checking if they are genuine extreme values or data errors.", fix: "Investigate flagged outliers individually or in small batches before deciding to cap, transform, or remove them." },
      { mistake: "Using z-score > 3 on a heavily skewed (non-normal) column to detect outliers.", fix: "Use IQR-based fences for skewed distributions; reserve z-score methods for roughly normal columns." },
    ],
    interviewQA: [
      { q: "What are the three types of missing data mechanisms?", a: "MCAR (missing completely at random, no pattern), MAR (missing at random, depends on other observed variables), and MNAR (missing not at random, depends on the missing value itself) — the handling strategy should match the mechanism." },
      { q: "Why might mean imputation be problematic?", a: "It preserves the mean but artificially reduces variance and can weaken true correlations with other variables, especially when a large share of values are imputed the same way." },
      { q: "How do you detect outliers using the IQR method?", a: "Compute Q1 and Q3 (25th and 75th percentiles), then IQR = Q3 - Q1. Any value below Q1 - 1.5*IQR or above Q3 + 1.5*IQR is flagged as a potential outlier." },
      { q: "When would you winsorise data instead of removing outliers?", a: "When the outliers are genuine, meaningful values but you want to limit their disproportionate influence on statistics like the mean or on a model's coefficients, without losing the row entirely." },
    ],
    practice: [
      "Load a dataset with missing values and try three strategies (drop, median-impute, model-impute) and compare summary statistics.",
      "Add an is_missing flag column and check if it correlates with the target variable.",
      "Detect outliers in a skewed column using both IQR and z-score methods and compare which rows get flagged.",
      "Winsorise a column at the 1st/99th percentile and compare the mean before and after.",
    ],
  },

  "Exploratory data analysis workflow": {
    summary:
      "EDA is a repeatable sequence: understand shape, check quality, look at distributions, then relationships.",
    keyPoints: [
      "Start with shape, dtypes, describe(), null counts and duplicate rows.",
      "Univariate first (histograms, value_counts), then bivariate (scatter, boxplot by category).",
      "Check the target's balance and its correlation with candidate features.",
      "Write down every question the data raises — those become the findings.",
    ],
    diagram: `1 shape/dtypes -> 2 nulls & dupes -> 3 distributions
       -> 4 relationships -> 5 hypotheses -> 6 charts for the story`,
    deepDive: [
      "Exploratory data analysis is not aimless poking around — it is a disciplined sequence designed to build trust in the data before you model it or draw conclusions from it. The first pass is purely structural: how many rows and columns, what data types does each column have, are numeric columns actually stored as strings, are there duplicate rows or duplicate keys that should be unique. Skipping this step is how silent bugs (like a 'price' column stored as text with commas) slip into an entire analysis undetected.",
      "Once the structure is understood, univariate analysis examines each variable on its own — histograms for numeric columns reveal shape, skew and unexpected spikes (a common one: a suspicious cluster of exact zeros or a max value like 9999 signalling a sentinel/placeholder value); value_counts() for categorical columns reveals cardinality and rare categories that might need grouping into 'other'. Only after understanding each variable individually should you move to bivariate/multivariate analysis — scatter plots for two numeric variables, boxplots of a numeric variable split by a categorical one, and a correlation matrix or crosstab for detecting relationships worth deeper investigation or feature engineering.",
      "A crucial and often skipped step is checking the target variable itself if the eventual goal is prediction: is it balanced or rare (a 2% positive rate means accuracy is a useless metric), and which features show an early relationship with it (helping prioritise which cleaning/feature-engineering effort matters most). Good EDA produces a living list of questions and hypotheses — 'why do 12% of orders have a negative amount', 'why does region X have no data before 2022' — because those anomalies, once resolved, often turn into the most valuable findings of the entire analysis, more so than the final polished charts.",
    ],
    example: {
      title: "EDA on a customer churn dataset",
      steps: [
        "Run df.shape, df.dtypes, df.info() to see 10,000 rows, 15 columns, and that 'TotalCharges' is oddly stored as an object (string) type.",
        "Check df.isnull().sum() and df.duplicated().sum(): find 11 missing TotalCharges values and 0 duplicate rows.",
        "Plot histograms for tenure and MonthlyCharges; notice tenure has a spike at 0 (new customers) and another near 72 (long-tenured).",
        "Cross-tabulate churn rate by contract type; find month-to-month customers churn far more than yearly-contract customers.",
        "Note the finding: 'contract type is a strong candidate feature for churn prediction' and flag TotalCharges for a dtype fix before modelling.",
      ],
      result: "A clear list of data-quality fixes (dtype conversion, 11 missing values) plus an early, useful insight that contract type strongly relates to churn, ready to guide feature engineering.",
    },
    mistakes: [
      { mistake: "Jumping straight to modelling without checking dtypes, nulls, or duplicates first.", fix: "Always run shape/dtypes/describe/null-counts/duplicate-checks as the very first step, before any visualisation or modelling." },
      { mistake: "Only looking at overall distributions and skipping the relationship with the target variable.", fix: "Explicitly check how each candidate feature relates to the target (crosstabs, grouped means, correlation) early in the EDA process." },
      { mistake: "Treating EDA as a one-off task done purely to produce a few charts for a report.", fix: "Treat EDA as an ongoing habit that generates hypotheses and data-quality fixes, not just a slide deck of pretty charts." },
    ],
    interviewQA: [
      { q: "What is the typical order of steps in an EDA workflow?", a: "Check shape and dtypes, then nulls/duplicates, then univariate distributions, then bivariate/multivariate relationships, then form hypotheses, and finally build charts that communicate the key findings." },
      { q: "Why do you check the target variable's balance early in EDA?", a: "Because a highly imbalanced target (e.g. 2% fraud) changes which metrics are meaningful (accuracy becomes misleading) and which modelling techniques (resampling, class weights) are needed later." },
      { q: "How would you spot a placeholder/sentinel value during EDA?", a: "Look for unusual spikes at round numbers or extremes in a histogram (like many values exactly at 9999 or 0) that don't fit the rest of the distribution's shape — these often represent 'unknown' encoded as a number." },
      { q: "Why is EDA important even if you plan to use an automated ML pipeline?", a: "Automated pipelines can't tell you if a column's meaning is wrong, if there's leakage, or if missingness is meaningful — EDA catches these domain and data-quality issues that pure statistics can miss." },
    ],
    practice: [
      "Perform a full EDA pass (shape, dtypes, nulls, duplicates, distributions) on a public dataset like Titanic or Telco Churn.",
      "Find and document at least 3 data quality issues in a raw dataset before doing any modelling.",
      "Create a correlation heatmap and identify the top 3 features most related to a chosen target.",
      "Write a one-paragraph summary of the 'story' the data tells after completing EDA on a dataset of your choice.",
    ],
  },

  "Matplotlib, Seaborn, Plotly": {
    summary:
      "Matplotlib is the low-level engine, Seaborn gives statistical defaults, Plotly gives interactive charts for dashboards.",
    keyPoints: [
      "Chart choice: trend over time -> line; compare categories -> bar; distribution -> histogram/box; relationship -> scatter.",
      "Never use a pie chart for more than a few slices; avoid dual axes.",
      "Always label axes, add units and start bar axes at zero.",
      "One message per chart; annotate the point you want remembered.",
    ],
    syntax: {
      lang: "python",
      code: "import seaborn as sns\nsns.barplot(data=df, x='region', y='amount')\nplt.ylabel('Revenue (INR)'); plt.title('Revenue by region')",
    },
    diagram: `question               chart
--------------------------------
change over time    -> line
compare groups      -> bar
spread / outliers   -> box / hist
x vs y relation     -> scatter
part of whole (2-3) -> stacked bar`,
    deepDive: [
      "These three libraries sit at different levels of abstraction and serve different purposes rather than competing directly. Matplotlib is the foundational plotting engine in Python — everything else (Seaborn, pandas .plot(), even Plotly's static export) is built on it or inspired by its API — and it gives you full pixel-level control at the cost of more verbose code for common statistical charts. Seaborn wraps Matplotlib with sensible statistical defaults (automatic aggregation, confidence bands, colour palettes tuned for categorical and continuous data) so a boxplot-by-category or a regression line with a confidence band takes one line instead of twenty.",
      "Plotly targets interactivity — hover tooltips, zoom, pan, and easy export to HTML/dashboards (via Dash) — which makes it the natural choice when the chart's audience will explore the data themselves rather than just read a static image in a report or slide. The trade-off is that Plotly charts are heavier (larger file size, need a JS runtime to render), so for a printed report or a paper, a clean static Matplotlib/Seaborn figure is usually more appropriate.",
      "Regardless of library, chart design principles stay the same and are what interviewers actually probe: match the chart type to the question being asked (a line for trend, a bar for comparison across categories, a histogram/box for spread, a scatter for relationship between two continuous variables), avoid chart types that visually distort magnitude (pie charts beyond 3-4 slices become unreadable, and truncated bar axes exaggerate small differences), and design every chart around one clear message with a title that states the conclusion rather than a generic label like 'Sales by Region'.",
    ],
    example: {
      title: "Choosing and building the right chart for a churn dashboard",
      steps: [
        "Question: 'How does churn rate change over the last 12 months?' -> chart type: line chart (trend over time).",
        "Question: 'Which contract type churns the most?' -> chart type: bar chart comparing churn rate across 3 contract categories.",
        "Question: 'What does the distribution of tenure look like among churned vs retained customers?' -> chart type: overlaid histograms or boxplots split by churn status.",
        "Build the bar chart with sns.barplot(data=df, x='contract_type', y='churn_rate'), label the y-axis 'Churn rate (%)', start axis at 0, and title it 'Month-to-month customers churn 3x more than yearly contracts'.",
        "Export as a static PNG for the report since the audience is executives reading a slide, not exploring interactively.",
      ],
      result: "Three purpose-built charts, each answering one specific question clearly, with a conclusion-stating title rather than a generic label.",
    },
    mistakes: [
      { mistake: "Using a pie chart with 8+ slices to show category breakdown.", fix: "Switch to a sorted horizontal bar chart, which is far easier to compare precisely than pie slices." },
      { mistake: "Truncating the y-axis of a bar chart to exaggerate a small difference.", fix: "Always start bar chart axes at zero; use a line chart or a zoomed inset only when explicitly labelled as such." },
      { mistake: "Giving every chart a generic title like 'Sales by Region' instead of stating the finding.", fix: "Title the chart with the takeaway, e.g. 'South region grew 40% faster than the national average'." },
    ],
    interviewQA: [
      { q: "When would you use Plotly instead of Matplotlib/Seaborn?", a: "When the audience needs interactivity — hovering for exact values, zooming, or embedding in a live dashboard — Plotly is preferable. For static reports, papers, or slides, Matplotlib/Seaborn is lighter-weight and equally effective." },
      { q: "Why is a pie chart usually a poor choice for more than a few categories?", a: "Human eyes are much worse at comparing angles/areas than lengths, so beyond 3-4 slices, a pie chart becomes hard to read accurately — a sorted bar chart communicates the same comparison far more precisely." },
      { q: "Why should bar chart axes start at zero?", a: "Because bar length is perceived as directly proportional to the value; truncating the axis exaggerates differences and can visually mislead the viewer about the true magnitude of change." },
      { q: "How do you decide which chart type to use for a given question?", a: "Match the chart to the analytical question: time trend -> line, category comparison -> bar, distribution/spread -> histogram or box, relationship between two numeric variables -> scatter, and part-of-whole with very few categories -> pie or stacked bar." },
    ],
    practice: [
      "Recreate the same dataset as a bar chart, a pie chart, and a truncated-axis bar chart, and compare how misleading each looks.",
      "Build an interactive Plotly scatter plot with hover tooltips showing extra columns.",
      "Use Seaborn to plot a boxplot of a numeric variable split by a categorical variable.",
      "Take a poorly labelled chart (no title, no axis labels) and redesign it following the one-message-per-chart principle.",
    ],
  },

  "Dashboarding with Power BI or Tableau": {
    summary:
      "A dashboard answers a recurring question at a glance: headline KPIs on top, breakdowns below, filters on the side.",
    keyPoints: [
      "Model data as a star schema (fact table + dimensions) before building visuals.",
      "DAX measures in Power BI are calculated at query time; avoid row-by-row calculated columns.",
      "Limit to 5-7 visuals per page and one clear hierarchy of importance.",
      "Define refresh cadence and row-level security up front.",
    ],
    diagram: `+-----------------------------------+
| KPI  KPI  KPI      (headline)     |
+-------------------+---------------+
| trend line        | top-10 bar    |
+-------------------+---------------+
| detail table              filters |
+-----------------------------------+`,
    deepDive: [
      "Good dashboards start with data modelling, not visuals. A star schema — one central fact table (transactions, orders, events, each row an occurrence) connected to several dimension tables (customer, product, date, region) via foreign keys — keeps the model simple, fast to query, and easy for filters/slicers to propagate correctly across every visual on the page. Flattening everything into one giant wide table instead seems easier at first but causes duplicated dimension data, slower refreshes, and filter/aggregation bugs (like double-counting) as the dashboard grows.",
      "In Power BI specifically, the distinction between calculated columns and DAX measures matters a lot: a calculated column is computed once per row at data-refresh time and stored, which is fine for static per-row attributes (like extracting a year from a date) but wasteful and inflexible for aggregations; a measure is computed dynamically at query time based on whatever filter context is currently applied (the selected date range, region, etc.), which is what lets a single 'Total Revenue' measure correctly recompute itself whether you've sliced by region, by month, or both at once. Preferring measures over row-by-row columns for anything that needs to respond to filters is a core Power BI performance and correctness skill.",
      "Dashboard layout should mirror how people actually scan a page: the most important, most aggregated numbers (headline KPIs like total revenue, growth %, active users) belong at the top-left where eyes land first, supporting trends and breakdowns come next, and fine-grained detail tables or filters live at the edges for people who want to dig deeper. Limiting a page to 5-7 visuals and establishing one clear visual hierarchy (size, colour, position signalling importance) prevents the common failure mode of a cluttered dashboard where every metric competes for attention and none stands out. Operational concerns — how often the underlying data refreshes, and who is allowed to see which rows via row-level security — need to be designed in from the start, since retrofitting security or refresh logic onto a live, widely used dashboard is disruptive.",
    ],
    example: {
      title: "Designing a sales performance dashboard",
      steps: [
        "Model the data as a star schema: fact_sales (order_id, date_key, product_key, customer_key, amount) linked to dim_date, dim_product, dim_customer.",
        "Create a DAX measure Total Revenue = SUM(fact_sales[amount]) instead of a calculated column, so it responds correctly to any slicer.",
        "Add a second measure Revenue Growth % = DIVIDE([Total Revenue] - [Total Revenue LY], [Total Revenue LY]) using time intelligence.",
        "Lay out the page: top row shows 3 KPI cards (Total Revenue, Growth %, Active Customers); middle row shows a trend line and a top-10-products bar chart; bottom row has a detail table and region/date filters on the side.",
        "Set the dataset to refresh nightly and apply row-level security so regional managers only see their own region's rows.",
      ],
      result: "A dashboard that loads quickly, updates correctly under any filter combination, and shows each manager only their relevant data.",
    },
    mistakes: [
      { mistake: "Building one giant flat table instead of a star schema, causing double-counted totals when multiple dimensions are joined in.", fix: "Model fact and dimension tables separately and connect them with proper relationships (star schema) before building visuals." },
      { mistake: "Using calculated columns for aggregations that need to respond to filters.", fix: "Use DAX measures for anything that should recompute based on the current filter/slicer context; reserve calculated columns for static per-row attributes." },
      { mistake: "Cramming 15+ visuals onto one dashboard page with no clear priority.", fix: "Limit each page to 5-7 visuals with a clear top-to-bottom hierarchy of importance, and split into multiple pages if needed." },
    ],
    interviewQA: [
      { q: "What is a star schema and why use it for dashboards?", a: "A star schema has a central fact table of measurable events connected to several dimension tables via keys. It keeps the model simple and avoids duplicated data, and lets filters on any dimension correctly propagate to aggregations in the fact table." },
      { q: "What's the difference between a calculated column and a DAX measure in Power BI?", a: "A calculated column is computed once per row at refresh time and stored in the model; a measure is computed dynamically at query time based on the current filter context, making it the right choice for aggregations that need to respond to slicers." },
      { q: "How would you design the layout of an executive dashboard?", a: "Place the most important, most aggregated KPIs at the top where eyes land first, put supporting trends and breakdowns in the middle, and keep detailed tables or filters at the edges — limiting the page to a handful of visuals with one clear hierarchy." },
      { q: "What operational aspects should you plan before shipping a dashboard?", a: "Data refresh cadence (how current does it need to be) and row-level security (who can see which rows), since these are hard to retrofit once the dashboard is in wide use." },
    ],
    practice: [
      "Design a star schema (on paper) for an e-commerce dataset with orders, customers, products, and dates.",
      "Build a Power BI/Tableau report with at least one measure that changes correctly when you apply a slicer.",
      "Critique a poorly designed public dashboard and list 3 layout improvements you would make.",
      "Set up row-level security in Power BI so two different sample users see different rows of the same report.",
    ],
  },

  "Excel for quick analysis rounds": {
    summary:
      "Many analyst rounds are still Excel: clean a sheet, pivot it, and answer questions in minutes.",
    keyPoints: [
      "Know VLOOKUP/XLOOKUP, INDEX+MATCH, SUMIFS/COUNTIFS, IFERROR.",
      "PivotTables for grouping; slicers for filtering.",
      "Remove duplicates, Text-to-Columns and Flash Fill for cleanup.",
      "Conditional formatting to surface outliers instantly.",
    ],
    syntax: {
      lang: "text",
      code: "=SUMIFS(Amount, Region, \"South\", Date, \">=\"&DATE(2026,1,1))\n=XLOOKUP(A2, IDs, Names, \"not found\")",
    },
    diagram: `raw sheet -> clean (dupes, types) -> PivotTable
                                        rows: Region
                                        vals: SUM(Amount)
                                        filter: Year`,
    deepDive: [
      "Excel remains a common first-round filter for analyst roles precisely because it forces you to demonstrate the same logical steps as a full data pipeline — cleaning, joining/looking-up, aggregating, and presenting — under time pressure and without the safety net of a script you can silently debug. Lookup functions are the most tested skill: VLOOKUP only searches left-to-right and breaks if columns are inserted, INDEX+MATCH is more flexible (can look left, is more robust to column insertion) and was the professional standard for years, and XLOOKUP (newer Excel/365) fixes VLOOKUP's limitations directly with a cleaner syntax and a built-in 'not found' fallback — knowing all three, and why XLOOKUP is now generally preferred, is a strong signal in an interview.",
      "SUMIFS/COUNTIFS/AVERAGEIFS let you aggregate with multiple conditions without needing a full pivot, which is faster for a single specific question (e.g. 'total sales in the South region after Jan 2026'), while PivotTables are the right tool when you need to explore many combinations of grouping and aggregation interactively — dragging fields between rows, columns, values and filters — without writing any formulas at all. Wrapping formulas in IFERROR (or IFNA) is a small habit that prevents a single missing lookup from breaking an entire downstream calculation chain with a cascading #N/A.",
      "Before any analysis, data must actually be clean: Remove Duplicates catches exact repeated rows, Text-to-Columns splits a single messy column (like 'City, State') into separate fields using a delimiter, and Flash Fill (Ctrl+E) can pattern-match and auto-complete many text transformations (extracting a first name from a full name) without any formula at all. Conditional formatting (colour scales, data bars, or custom rules like highlighting values beyond 2 standard deviations) turns a wall of numbers into something scannable in seconds, which is often exactly what's being tested in a timed round — can you find the anomaly quickly, not just compute a number correctly.",
    ],
    example: {
      title: "Answering 'What were South region sales in Q1 2026?' quickly in Excel",
      steps: [
        "Open the raw sales sheet; first check for duplicate rows using Data > Remove Duplicates.",
        "Confirm the Date column is a real date type, not text (dates right-aligned = numeric/date type in Excel).",
        "Write =SUMIFS(Amount, Region, \"South\", Date, \">=\"&DATE(2026,1,1), Date, \"<\"&DATE(2026,4,1)) in a blank cell.",
        "Cross-check the result by building a quick PivotTable: rows = Region, values = Sum of Amount, filter = Quarter/Year, and comparing the South row.",
        "Both numbers match, confirming the formula and giving confidence in the answer.",
      ],
      result: "A verified total for South region Q1 2026 sales, cross-checked by two independent methods (formula and PivotTable).",
    },
    mistakes: [
      { mistake: "Using VLOOKUP and then inserting a new column, which silently breaks the hardcoded column index.", fix: "Use INDEX+MATCH or XLOOKUP, which reference columns by position/name in a way that's robust to structural changes." },
      { mistake: "Treating dates or numbers stored as text as if they were numeric, causing SUMIFS/formulas to silently return 0.", fix: "Check alignment (numbers/dates right-align by default) or use ISTEXT/VALUE to confirm and fix the data type before aggregating." },
      { mistake: "Manually scanning for outliers or errors in a large sheet instead of using conditional formatting.", fix: "Apply conditional formatting (colour scale, top/bottom rules, or a custom outlier formula) to surface anomalies instantly." },
    ],
    interviewQA: [
      { q: "What is the difference between VLOOKUP, INDEX+MATCH, and XLOOKUP?", a: "VLOOKUP searches left-to-right only and breaks if columns shift. INDEX+MATCH is more flexible, can look in either direction, and is robust to column insertion. XLOOKUP (newer Excel) combines the best of both with simpler syntax and a built-in not-found fallback, and is now generally preferred." },
      { q: "When would you use SUMIFS versus a PivotTable?", a: "SUMIFS is faster for answering one specific, well-defined question with known conditions. A PivotTable is better when you need to explore multiple groupings and aggregations interactively without writing formulas." },
      { q: "How do you quickly clean messy data in Excel?", a: "Use Remove Duplicates for exact repeated rows, Text-to-Columns to split combined fields by a delimiter, and Flash Fill to pattern-match text transformations automatically." },
      { q: "How would you find outliers in a large Excel dataset quickly?", a: "Apply conditional formatting such as a colour scale or a custom rule flagging values beyond a z-score or IQR threshold, which visually highlights anomalies without manual scanning." },
    ],
    practice: [
      "Build a lookup table and solve the same problem with VLOOKUP, INDEX+MATCH, and XLOOKUP; compare robustness after inserting a column.",
      "Clean a messy sample sheet (duplicates, mixed types, combined fields) end to end.",
      "Create a PivotTable with rows, columns, values and a slicer on a sample sales dataset.",
      "Apply conditional formatting to highlight outliers in a numeric column using a custom formula.",
    ],
  },

  "Storytelling and executive summaries": {
    summary:
      "Lead with the answer, then the evidence, then the recommendation. Executives read the first line and the chart title.",
    keyPoints: [
      "Structure: situation -> finding -> impact -> recommendation -> next step.",
      "Quantify impact in money, time or users, not in percentages alone.",
      "Chart titles should state the conclusion, not the variable names.",
      "State assumptions and data limits explicitly — it builds trust.",
    ],
    diagram: `SLIDE 1  "South region drove 38% of Q2 revenue growth"
   supporting chart (annotated)
   3 bullets of evidence
   1 recommendation + owner + date`,
    deepDive: [
      "Data storytelling flips the order most analysts naturally use when doing the work. While you build an analysis bottom-up — data, then charts, then patterns, then conclusion — you must present it top-down: state the conclusion or recommendation first (the 'answer'), then show the evidence that supports it, because a busy executive audience decides in the first ten seconds whether to keep listening, and they need to know what to do with the information before they see how you got there. This is often called the 'pyramid principle': lead with the takeaway, support with grouped evidence, back that with detail available on request.",
      "Quantifying impact in concrete business terms (rupees saved, hours reduced, users retained) rather than abstract percentages is what makes a finding actionable rather than merely interesting — '12% improvement' is vague until translated into '12% improvement means roughly 40 lakh rupees in additional monthly revenue', which is the number that actually drives a decision. Every chart shown should carry a title that states the finding in plain language ('Churn is concentrated in month-to-month contracts') instead of a generic label ('Churn by Contract Type'), because many readers will only ever read chart titles and headline numbers, never the surrounding paragraph.",
      "Trust is built as much by what you admit you don't know as by what you claim to know: explicitly stating assumptions (e.g. 'this projection assumes current growth rate holds'), data limitations (e.g. 'excludes the 8% of transactions with missing region data'), and confidence level prevents a recommendation from being overturned later by a stakeholder who spots a caveat you hid. A strong executive summary always ends with a specific, ownable next step (who does what, by when) rather than a vague call to 'continue monitoring', because ambiguous recommendations rarely get acted on.",
    ],
    example: {
      title: "Turning an analysis into an executive summary slide",
      steps: [
        "Raw finding from analysis: 'South region grew revenue by 18% QoQ, above the 6% company average, driven mostly by a new product line'.",
        "Rewrite as a headline: 'South region drove 38% of total Q2 revenue growth — expand the new product line nationally'.",
        "Choose one supporting chart: a bar chart of revenue growth by region, annotated pointing at South, titled with the same headline conclusion.",
        "Add 3 bullets of evidence: growth rate comparison, product-line contribution breakdown, and a note on data limitations (one week of Q2 data was estimated due to a system migration).",
        "End with a specific recommendation: 'Roll out the new product line to North and West by end of Q3; owner: regional sales lead; review in 6 weeks'.",
      ],
      result: "A one-slide executive summary that leads with the conclusion, is backed by one annotated chart and three evidence bullets, states a caveat, and ends with an ownable next step.",
    },
    mistakes: [
      { mistake: "Presenting the analysis in the order it was done (data -> methodology -> findings -> conclusion).", fix: "Flip the order for presentation: state the conclusion/recommendation first, then support it with evidence — save methodology detail for an appendix or Q&A." },
      { mistake: "Reporting impact only as a percentage without translating it to business terms.", fix: "Always convert the headline number into money, time, or users wherever possible, since that is what drives decisions." },
      { mistake: "Ending a summary with a vague call to action like 'keep monitoring the situation'.", fix: "State a specific next step with an owner and a timeline, so the recommendation can actually be acted on." },
    ],
    interviewQA: [
      { q: "What is the 'pyramid principle' in data storytelling?", a: "It means leading with the main conclusion or recommendation first, then supporting it with grouped evidence, and only providing full methodology/detail on request — the opposite order from how the analysis itself was built." },
      { q: "Why should chart titles state a conclusion rather than a variable name?", a: "Because many readers only skim titles and headline numbers; a conclusion-stating title ('Churn concentrated in month-to-month plans') communicates the insight even to someone who never reads the surrounding text." },
      { q: "Why is quantifying impact in money or time better than reporting only percentages?", a: "Percentages are abstract and don't directly indicate business significance; converting to concrete units like revenue or hours saved makes the finding immediately actionable for decision-makers." },
      { q: "Why should you state assumptions and data limitations in an executive summary?", a: "It builds credibility and pre-empts objections — a recommendation with disclosed caveats is more trustworthy and defensible than one that appears to hide uncertainty." },
    ],
    practice: [
      "Take a completed analysis you've done and rewrite its conclusion as a single headline sentence.",
      "Redesign a chart title from a generic label to a conclusion-stating one.",
      "Write a 5-bullet executive summary (situation, finding, impact, recommendation, next step) for a dataset of your choice.",
      "Practice explaining a finding's business impact in rupees/time/users instead of only percentages.",
    ],
  },
};
