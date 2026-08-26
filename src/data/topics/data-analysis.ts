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
  },
};
