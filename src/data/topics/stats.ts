import type { TopicMap } from "../topicContent";

export const statsTopics: TopicMap = {
  "Descriptive statistics & distributions": {
    summary:
      "Descriptive statistics summarise a dataset's centre, spread and shape before any modelling begins.",
    keyPoints: [
      "Mean is sensitive to outliers; median is robust; mode suits categories.",
      "Variance/standard deviation measure spread; IQR = Q3 - Q1.",
      "Normal (bell), binomial (counts of successes), Poisson (rare events per interval).",
      "Skew tells you which tail is longer — right skew pulls the mean above the median.",
    ],
    syntax: {
      lang: "text",
      code: "variance = sum((x - mean)^2) / (n - 1)\nz = (x - mean) / sd",
    },
    diagram: `normal (symmetric)      right-skewed
     _-^-_                  _-^-_____
   _/     \\_              _/         \\____
  mean = median          median < mean

68% within 1 sd | 95% within 2 sd | 99.7% within 3 sd`,
  },

  "Conditional probability & Bayes theorem": {
    summary:
      "Conditional probability is the chance of A given that B happened. Bayes theorem flips the condition using the base rate.",
    keyPoints: [
      "P(A|B) = P(A and B) / P(B).",
      "Bayes: P(A|B) = P(B|A) P(A) / P(B).",
      "Independent events: P(A and B) = P(A) P(B).",
      "Rare diseases make a 99% accurate test still mostly false positives — base rate dominates.",
    ],
    syntax: {
      lang: "text",
      code: "P(sick|positive) = P(pos|sick)P(sick) / [P(pos|sick)P(sick) + P(pos|well)P(well)]",
    },
    diagram: `10,000 people, 1% sick, test 99% accurate
        sick 100 --> positive 99
        well 9900 -> positive 99  (1% false positive)
positive total 198 -> P(sick|positive) = 99/198 = 50%`,
  },

  "Central limit theorem & sampling": {
    summary:
      "The distribution of sample means approaches a normal distribution as sample size grows, whatever the population shape. This is why inference works.",
    keyPoints: [
      "Standard error = sd / sqrt(n) — accuracy improves with the square root of n.",
      "n >= 30 is the usual rule of thumb for the approximation.",
      "Sampling must be random; convenience samples bias every downstream estimate.",
      "Stratified sampling reduces variance when subgroups differ.",
    ],
    diagram: `population (skewed)     means of samples (n=30)
 |\\                          _-^-_
 | \\___                    _/     \\_
 +------                  normal, centred on mu
                          spread = sd/sqrt(n)`,
  },

  "Hypothesis testing, p-values, errors": {
    summary:
      "Assume the null hypothesis, then ask how surprising the data is. The p-value is that surprise, not the probability the null is true.",
    keyPoints: [
      "p = P(data this extreme | null true); p < alpha (usually 0.05) means reject the null.",
      "Type I error = false positive (alpha); Type II = false negative (beta); power = 1 - beta.",
      "t-test compares means, chi-square compares categorical counts, ANOVA compares 3+ groups.",
      "Testing many hypotheses inflates false positives — correct with Bonferroni/FDR.",
    ],
    diagram: `                 null true      null false
reject null      Type I (a)     correct (power)
keep null        correct        Type II (b)

null distribution
     _-^-_
   _/     \\_
 ---------|---**   ** = observed, tail area = p`,
  },

  "Confidence intervals": {
    summary:
      "A confidence interval is a range built so that, over many repeated samples, 95% of such intervals contain the true parameter.",
    keyPoints: [
      "CI = estimate ± z * standard error (z = 1.96 for 95%).",
      "It does NOT mean '95% probability the parameter is in this interval'.",
      "Wider interval = less certainty; increase n to narrow it.",
      "If a difference's CI includes 0, the effect is not significant at that level.",
    ],
    syntax: {
      lang: "text",
      code: "CI95 = mean ± 1.96 * (sd / sqrt(n))",
    },
    diagram: `estimate
   |----------o----------|
  low        mean       high
width shrinks as 1/sqrt(n):  n=100 -> half the width of n=25`,
  },

  "A/B testing design and pitfalls": {
    summary:
      "An A/B test randomly splits users between control and variant and compares one primary metric with a pre-declared sample size.",
    keyPoints: [
      "Fix the metric, minimum detectable effect and sample size before launching.",
      "Peeking and stopping early inflates false positives — decide the stopping rule up front.",
      "Randomise per user (not per session) and check the split is balanced.",
      "Watch novelty effects, seasonality and guardrail metrics like churn.",
    ],
    diagram: `users -> random split
   50% A (control)  conv 4.0%
   50% B (variant)  conv 4.6%
      |
  is the lift outside the CI? -> ship
  power check: n per arm from MDE + baseline + alpha/beta`,
  },

  "Correlation vs causation, confounders": {
    summary:
      "Correlation measures co-movement. Causation requires that changing X changes Y — usually only provable by a randomised experiment.",
    keyPoints: [
      "Pearson r in [-1, 1] captures linear association only.",
      "A confounder influences both variables and fakes a relationship.",
      "Simpson's paradox: a trend in aggregate reverses within subgroups.",
      "Randomisation breaks confounding; otherwise control for covariates.",
    ],
    diagram: `      temperature (confounder)
        /            \\
   ice cream       drownings
        \\____ r=0.9 ___/
   correlated, neither causes the other`,
  },
};
