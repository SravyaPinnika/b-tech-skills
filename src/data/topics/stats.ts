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
    deepDive: [
      "Choosing a summary statistic depends on the question you are answering, not just what is easy to compute. Mean is the natural choice when you plan to add or average values further (like total revenue estimates), but it gets dragged by a handful of extreme values — a single billionaire in a room changes the average income drastically while the median barely moves. That is why income, house prices and response times are usually reported with medians in real reporting: the underlying distribution is right-skewed with a long tail.",
      "Variance and standard deviation quantify spread in the same units as the data (sd) or squared units (variance), which is why sd is preferred for interpretation while variance is preferred for algebra (it decomposes additively across independent sources, which is the basis of ANOVA and error propagation). The n-1 denominator (Bessel's correction) exists because using the sample mean to compute deviations already 'uses up' one degree of freedom, so dividing by n would systematically underestimate the true population variance.",
      "Recognising the shape of a distribution tells you which statistics and which downstream tests are even valid. A binomial applies to a fixed number of independent yes/no trials with a constant success probability (like conversions per 100 visitors); Poisson applies to counts of rare, independent events in a fixed window (like server errors per hour) and its variance always equals its mean — a useful sanity check. The normal distribution matters not because everything is naturally bell-shaped but because the Central Limit Theorem forces sums and averages of many independent effects into a bell shape, which is why so many statistical tools assume normality of an estimator even when raw data is skewed.",
    ],
    example: {
      title: "Comparing mean and median on skewed salary data",
      steps: [
        "Salaries (in lakhs): 4, 5, 5, 6, 6, 7, 40.",
        "Mean = (4+5+5+6+6+7+40)/7 = 73/7 ≈ 10.43 lakhs.",
        "Sort and find median: middle value of 7 sorted numbers is the 4th = 6 lakhs.",
        "Notice the outlier (40) pulls the mean far above where most employees actually sit.",
        "Report median (6 lakhs) as the 'typical' salary; report mean only alongside a note about the outlier.",
      ],
      result: "Median (6L) represents the typical employee far better than the mean (10.43L), which is inflated by one outlier.",
    },
    mistakes: [
      { mistake: "Reporting only the mean for skewed data (salaries, prices, latencies).", fix: "Always check skew first; report median (and IQR) alongside or instead of the mean when outliers exist." },
      { mistake: "Dividing by n instead of n-1 when computing sample variance.", fix: "Use n-1 (Bessel's correction) for sample variance/sd; use n only when you truly have the entire population." },
      { mistake: "Assuming any bell-ish histogram is 'normal enough' without checking.", fix: "Use a Q-Q plot or a formal normality test (Shapiro-Wilk) before relying on normal-based methods." },
    ],
    interviewQA: [
      { q: "Why do we divide by n-1 instead of n for sample variance?", a: "Because the sample mean is estimated from the same data, it minimises the sum of squared deviations, so using it slightly understates true variance. Dividing by n-1 (Bessel's correction) corrects this bias and gives an unbiased estimator of the population variance." },
      { q: "When would you prefer median over mean?", a: "When the data has outliers or is skewed, such as income, house prices, or response times — the median describes the 'typical' value without being dragged by extreme points." },
      { q: "What is the difference between binomial and Poisson distributions?", a: "Binomial models the count of successes in a fixed number of independent trials with constant probability p. Poisson models the count of rare independent events in a fixed interval of time/space, parameterised only by the rate (mean = variance)." },
      { q: "What does the empirical rule (68-95-99.7) tell you?", a: "For a normal distribution, about 68% of values fall within 1 standard deviation of the mean, 95% within 2, and 99.7% within 3 — useful for quick outlier flags and sanity checks on spread." },
    ],
    practice: [
      "Compute mean, median, mode, variance and IQR for a small dataset by hand and then verify with pandas .describe().",
      "Plot a histogram of a real dataset (e.g. movie ratings) and identify its skew direction visually.",
      "Simulate 1000 dice rolls and check how close the sample mean/variance are to the theoretical values.",
      "Find a real-world Poisson-like process (calls per hour, typos per page) and estimate its rate.",
      "Explain in one paragraph why standard deviation is more interpretable than variance.",
    ],
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
    deepDive: [
      "Conditional probability restricts the sample space: once you know B happened, you only care about the slice of the world where B is true, and ask what fraction of that slice also has A. This single idea underlies spam filters, medical testing, search ranking and recommendation systems — anywhere you update a belief after observing evidence.",
      "Bayes theorem is just conditional probability rearranged so you can compute P(A|B) when you only know P(B|A) — which is common because P(B|A) (the likelihood, e.g. 'probability of a positive test given you are sick') is usually what gets measured in a lab, while P(A|B) (the posterior, e.g. 'probability you are sick given a positive test') is what you actually want to know. The denominator P(B) is the total probability of the evidence across all cases (sick and well), computed by the law of total probability.",
      "The base rate fallacy is the single most common conceptual trap: people confuse P(A|B) with P(B|A). A '99% accurate' test sounds almost certain, but if the condition being tested for is rare, most positive results will still be false positives, because the enormous pool of healthy people generates more false positives in absolute numbers than the tiny pool of sick people generates true positives. This is why doctors run a second, different test to confirm a positive result — it changes the prior for the second calculation.",
    ],
    example: {
      title: "Spam filter using Bayes theorem",
      steps: [
        "Prior: P(spam) = 0.4, P(not spam) = 0.6.",
        "Word 'free' appears in 50% of spam emails: P(free|spam) = 0.5.",
        "Word 'free' appears in 5% of legit emails: P(free|not spam) = 0.05.",
        "P(free) = 0.5*0.4 + 0.05*0.6 = 0.2 + 0.03 = 0.23.",
        "P(spam|free) = 0.2 / 0.23 ≈ 0.87.",
      ],
      result: "An email containing 'free' is about 87% likely to be spam, even though only 40% of all emails are spam.",
    },
    mistakes: [
      { mistake: "Confusing P(A|B) with P(B|A) (the prosecutor's fallacy).", fix: "Always write out which event is the 'given' condition and apply Bayes theorem explicitly rather than reasoning by intuition." },
      { mistake: "Ignoring the base rate (prior probability) when interpreting test results.", fix: "Always fold in P(A) — a low base rate keeps the posterior low even for an accurate test; use a tree/table like the 10,000-people example." },
      { mistake: "Assuming events are independent without checking.", fix: "Only multiply P(A)P(B) when there is a real reason (random assignment, physically unrelated processes); otherwise compute the joint or conditional directly." },
    ],
    interviewQA: [
      { q: "State Bayes theorem and explain each term.", a: "P(A|B) = P(B|A)P(A) / P(B). P(A) is the prior belief before evidence, P(B|A) is the likelihood of the evidence given A, P(B) is the total probability of the evidence, and P(A|B) is the updated posterior belief after seeing the evidence." },
      { q: "A test is 99% accurate and the disease affects 1 in 10,000 people. If someone tests positive, are they likely sick?", a: "No — using Bayes theorem with such a low base rate, the vast majority of positives come from the huge healthy population's 1% false-positive rate, so the posterior probability of actually being sick remains low, often well under 50%." },
      { q: "What is the difference between independent and mutually exclusive events?", a: "Independent events do not affect each other's probability (P(A|B) = P(A)); mutually exclusive events cannot both happen (P(A and B) = 0). Mutually exclusive events with nonzero probability are actually strongly dependent, not independent." },
      { q: "Give a real-world application of Bayes theorem.", a: "Spam filtering, medical diagnosis interpretation, spell/autocorrect suggestion ranking, and A/B test posterior estimation in Bayesian statistics." },
    ],
    practice: [
      "Work through the classic disease-testing example with different base rates (1%, 0.1%, 10%) and observe how the posterior changes.",
      "Build a tiny naive Bayes spam classifier on a toy dataset of 10 emails.",
      "Explain the Monty Hall problem using Bayes theorem.",
      "Compute P(A|B) and P(B|A) for a deck-of-cards example and show they differ.",
    ],
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
    deepDive: [
      "The Central Limit Theorem (CLT) is one of the few genuinely surprising results in statistics: no matter how oddly shaped the original population is (skewed, bimodal, uniform), if you repeatedly draw samples of size n and compute their means, the distribution of those means converges to a normal distribution as n grows. This is what licenses using z-scores, confidence intervals and t-tests on averages even when the underlying raw data is nowhere near normal.",
      "The rate of convergence depends on how far the population is from normal — a heavily skewed population needs a larger n before the sampling distribution of the mean looks normal, which is the origin of the informal n>=30 rule of thumb (for mild skew it can be much smaller, for heavy-tailed distributions it may need to be much larger). The standard error, sd/sqrt(n), shrinks with the square root of the sample size, not linearly — so to halve your uncertainty you need four times the data, which is an important cost/benefit fact when planning studies or experiments.",
      "Sampling technique matters just as much as sample size. A large but biased sample (e.g. an online poll that only reaches smartphone users) gives you a precise estimate of the wrong quantity — precision is not the same as accuracy. Random sampling ensures every unit has a known chance of selection so the sample mean is an unbiased estimator of the population mean; stratified sampling further improves precision by sampling proportionally within known subgroups (e.g. by region or age band) so that subgroup variation does not inflate the overall standard error.",
    ],
    example: {
      title: "Estimating average delivery time via repeated sampling",
      steps: [
        "Population of delivery times is right-skewed with true mean 40 min, sd 20 min.",
        "Draw a random sample of n = 25 orders; compute its mean, say 43 min.",
        "Standard error = 20/sqrt(25) = 4 min.",
        "Repeat this sampling process many times (conceptually); the sample means cluster in a bell curve around 40 min with spread 4 min, even though raw delivery times are skewed.",
        "Use this normal approximation to build a 95% CI: 43 ± 1.96*4 ≈ (35.2, 50.8) minutes.",
      ],
      result: "Even though individual delivery times are skewed, the sampling distribution of the mean is approximately normal, letting us build a valid confidence interval.",
    },
    mistakes: [
      { mistake: "Believing CLT means the raw data itself becomes normal with a large n.", fix: "CLT applies to the sampling distribution of the mean (or sum), not to individual data points — raw data keeps its original shape." },
      { mistake: "Using a convenience sample (e.g. only surveying friends) and treating it as representative.", fix: "Use random or stratified sampling; explicitly state sampling method and possible biases in any report." },
      { mistake: "Thinking doubling the sample size halves the standard error.", fix: "Remember SE scales with sqrt(n); to halve SE you need 4x the sample size." },
    ],
    interviewQA: [
      { q: "State the Central Limit Theorem in your own words.", a: "For a sufficiently large sample size, the distribution of the sample mean (or sum) of independent, identically distributed random variables approaches a normal distribution, regardless of the shape of the original population distribution." },
      { q: "Why does standard error decrease with sample size?", a: "Standard error = population sd / sqrt(n). As n increases, random fluctuations in individual observations average out more, so the sample mean becomes a more precise estimate of the true mean; the sqrt relationship means diminishing returns on adding more data." },
      { q: "Why is CLT important for hypothesis testing?", a: "It justifies using normal-distribution-based tools (z-tests, t-tests, confidence intervals) on sample means even when the underlying population is not normal, as long as the sample size is reasonably large." },
      { q: "What is the difference between random sampling and stratified sampling?", a: "Random sampling gives every unit an equal chance of selection from the whole population. Stratified sampling divides the population into subgroups (strata) and samples from each proportionally, which reduces variance when subgroups differ meaningfully." },
    ],
    practice: [
      "Simulate rolling a die 1000 times, take samples of size 5, 30, and 100, and plot the distribution of sample means for each.",
      "Explain why exit polls can be wrong despite large sample sizes (hint: sampling bias, not sample size).",
      "Compute standard error for n = 10, 40, 160 and observe the sqrt(n) relationship.",
      "Design a stratified sampling plan for surveying student satisfaction across 4 departments of very different sizes.",
    ],
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
    deepDive: [
      "Hypothesis testing is a structured way of asking 'could this result plausibly have happened by chance alone?' You start by assuming the null hypothesis (usually 'no effect' or 'no difference') is true, then compute how likely it is to see data at least as extreme as what you observed under that assumption — that likelihood is the p-value. A small p-value means the observed data would be rare if the null were true, giving you grounds to reject the null; it is emphatically not the probability that the null hypothesis itself is true, which is a very common misinterpretation.",
      "The alpha level (commonly 0.05) is a threshold you choose before running the test, representing how often you are willing to falsely reject a true null hypothesis (Type I error) across repeated experiments. Type II error (beta) is the opposite mistake — failing to detect a real effect — and power (1 - beta) is your ability to detect a real effect of a given size; power depends on sample size, effect size, and alpha, and is something you should calculate before running a study, not after.",
      "Choosing the right test depends on the data type and number of groups: a t-test compares means between one or two groups (paired or independent), chi-square tests independence/association between categorical variables, and ANOVA extends the t-test idea to three or more groups by comparing variance between groups to variance within groups. When you run many tests at once (e.g. testing 20 features against a target), the chance of at least one false positive balloons well above alpha — this is the multiple comparisons problem, corrected with methods like Bonferroni (stricter per-test alpha) or the less conservative Benjamini-Hochberg FDR procedure.",
    ],
    example: {
      title: "One-sample t-test on average study hours",
      steps: [
        "Claim (null hypothesis): average study hours per week = 10.",
        "Sample of 25 students has mean = 11.2 hours, sd = 3 hours.",
        "Compute t = (11.2 - 10) / (3/sqrt(25)) = 1.2 / 0.6 = 2.0.",
        "Look up/compute p-value for t = 2.0 with df = 24, two-tailed: p ≈ 0.057.",
        "Since p (0.057) > alpha (0.05), fail to reject the null — not enough evidence average differs from 10.",
      ],
      result: "We do not have statistically significant evidence at the 5% level that the true average study time differs from 10 hours, even though the sample mean was higher.",
    },
    mistakes: [
      { mistake: "Interpreting the p-value as 'the probability the null hypothesis is true'.", fix: "State it correctly: p-value is the probability of seeing data this extreme (or more) if the null were true — it says nothing directly about the probability of the hypothesis." },
      { mistake: "Running many tests and reporting only the significant ones ('p-hacking').", fix: "Pre-register hypotheses, correct for multiple comparisons (Bonferroni/FDR), and report all tests run, not just the significant subset." },
      { mistake: "Treating p = 0.049 as meaningfully different from p = 0.051.", fix: "Treat alpha as a soft guideline, not a hard cliff; report effect size and confidence intervals alongside the p-value for context." },
    ],
    interviewQA: [
      { q: "What is a p-value, in plain language?", a: "It is the probability of observing data as extreme as (or more extreme than) what you got, assuming the null hypothesis is true. A small p-value suggests the data is unusual under the null, giving evidence against it." },
      { q: "Explain Type I and Type II errors with an example.", a: "Type I error is rejecting a true null hypothesis — like convicting an innocent person (false positive). Type II error is failing to reject a false null hypothesis — like acquitting a guilty person (false negative). Alpha controls Type I error rate; power (1-beta) reflects ability to avoid Type II errors." },
      { q: "When would you use a chi-square test versus a t-test?", a: "Chi-square tests association between two categorical variables (e.g. gender vs. product preference) using counts. A t-test compares the means of a continuous variable between one or two groups." },
      { q: "Why is running 20 hypothesis tests at alpha=0.05 risky?", a: "Even if all null hypotheses are true, the probability of at least one false positive across 20 independent tests is roughly 1-(0.95)^20 ≈ 64%. Correction methods like Bonferroni or FDR are needed to control the overall error rate." },
    ],
    practice: [
      "Run a one-sample t-test in Python/R on a small dataset and interpret the p-value in plain English.",
      "Simulate 100 hypothesis tests on truly random (null-true) data at alpha=0.05 and count how many are falsely significant.",
      "Explain the difference between statistical significance and practical significance using a real example.",
      "Design an experiment and compute the required sample size for 80% power to detect a given effect size.",
    ],
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
    deepDive: [
      "A confidence interval expresses the uncertainty in a point estimate by giving a plausible range for the true population parameter. The '95% confidence' refers to the long-run procedure: if you repeated the sampling and interval-construction process many times, 95% of the resulting intervals would contain the true (fixed but unknown) parameter. This is subtly but importantly different from saying 'there is a 95% probability the true value lies in this particular interval' — once the interval is computed, the true parameter either is or is not in it; the randomness lives in the sampling process, not in the fixed parameter.",
      "The width of a CI is governed by three things: the confidence level (higher confidence needs a wider interval — 99% CIs are always wider than 95% CIs for the same data), the variability of the underlying data (sd), and the sample size (n, through the standard error sd/sqrt(n)). This creates a natural trade-off: you can get a narrower, more useful interval by either collecting more data or accepting less confidence, but you cannot get both narrow and highly confident intervals for free.",
      "Confidence intervals are often more informative than a bare p-value because they convey both statistical and practical significance in one picture — a tiny p-value paired with a CI like (0.001, 0.002) tells you the effect is statistically real but practically negligible, while a CI like (5, 50) tells you the effect is real but you don't yet know its size precisely. When comparing two groups, if the CI for the difference includes zero, that is equivalent to failing to reject the null hypothesis of no difference at the corresponding significance level.",
    ],
    example: {
      title: "Building a 95% CI for average app session length",
      steps: [
        "Sample of n = 64 users has mean session length = 12.5 minutes, sd = 4 minutes.",
        "Standard error = 4 / sqrt(64) = 4/8 = 0.5 minutes.",
        "Margin of error = 1.96 * 0.5 = 0.98 minutes.",
        "CI = 12.5 ± 0.98 = (11.52, 13.48) minutes.",
        "Interpretation: we are 95% confident the true average session length across all users lies between 11.52 and 13.48 minutes.",
      ],
      result: "The 95% confidence interval for average session length is approximately (11.5, 13.5) minutes.",
    },
    mistakes: [
      { mistake: "Saying 'there is a 95% probability the true mean lies in this interval'.", fix: "Say instead: '95% of intervals built this way, across repeated sampling, would contain the true mean' — the parameter is fixed, only the interval is random." },
      { mistake: "Assuming a wider CI is always bad.", fix: "A wide CI honestly reflects high uncertainty (often from small n); the fix for a too-wide CI is more data, not reinterpreting the number." },
      { mistake: "Comparing two groups' CIs by eye and declaring significance only if they don't overlap at all.", fix: "Compute the CI of the difference directly (or run a formal test) — overlapping individual CIs can still correspond to a significant difference and vice versa." },
    ],
    interviewQA: [
      { q: "What does a 95% confidence interval actually mean?", a: "If you repeated the sampling and CI-construction process many times, about 95% of the resulting intervals would contain the true population parameter. It does not mean a 95% probability the parameter lies in this specific interval." },
      { q: "How does sample size affect the confidence interval width?", a: "Larger sample size reduces the standard error (sd/sqrt(n)), which narrows the confidence interval — precision improves with the square root of the sample size." },
      { q: "How are confidence intervals related to hypothesis tests?", a: "A CI for a difference that excludes zero corresponds to rejecting the null hypothesis of no difference at the complementary significance level (e.g., a 95% CI excluding 0 corresponds to p < 0.05)." },
      { q: "Why might you prefer reporting a CI over just a p-value?", a: "A CI conveys both the size and precision of an effect, letting you judge practical significance, whereas a p-value alone only indicates whether an effect is statistically detectable." },
    ],
    practice: [
      "Compute a 95% and 99% CI for the same sample and compare their widths.",
      "Simulate 100 samples from a known population, build a 95% CI each time, and count how many actually contain the true mean.",
      "Explain, using an example, why a CI including zero implies 'not significant'.",
      "Calculate the sample size needed to achieve a margin of error of 1 minute in the session-length example above.",
    ],
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
    deepDive: [
      "A well-designed A/B test is really just a randomised controlled experiment applied to a product change. Randomisation is what allows you to attribute any observed difference in the metric to the change itself rather than to confounding factors — if users self-selected into variants, differences could be explained by who chose what rather than the treatment. Everything upstream of the split (device, geography, time of signup) should be balanced by the randomisation; checking this balance (an A/A test or balance table) is a useful sanity check before trusting the results.",
      "Before launching, you need to fix three things: the single primary metric you will judge success on (secondary/guardrail metrics are fine to monitor but should not be used to cherry-pick a win), the minimum detectable effect (MDE) you actually care about business-wise, and the sample size/duration needed to detect that MDE with acceptable power (commonly 80%) at your chosen alpha. Skipping this step and just 'running it for a while' invites both underpowered null results and the temptation to stop early once results happen to look good.",
      "Peeking — checking results repeatedly and stopping as soon as p < 0.05 — is one of the most damaging practical mistakes because it inflates the true false-positive rate far above the nominal alpha; every additional look at the data is another chance for noise to cross the significance threshold. The fix is either to commit to a fixed sample size/duration decided in advance, or to use a sequential testing method (like alpha-spending or Bayesian bandits) designed to allow early stopping without inflating error rates. Other pitfalls include novelty effects (users react to any change, positively or negatively, at first, so effects can decay), seasonality (weekday vs weekend behaviour differs), and neglecting guardrail metrics (a variant might boost clicks but tank retention or increase churn).",
    ],
    example: {
      title: "Testing a new checkout button colour",
      steps: [
        "Baseline conversion rate is 4%; you want to detect a lift to at least 4.5% (MDE = 0.5pp) with 80% power, alpha = 0.05.",
        "A sample size calculator says you need about 30,000 users per arm.",
        "Randomly assign incoming users 50/50 to control (old button) and variant (new button); run for 2 full weeks to cover weekday/weekend cycles.",
        "Do not check significance daily and stop early; wait until the pre-committed sample size and duration are reached.",
        "At the end: control converts at 4.0%, variant at 4.6%; the 95% CI for the lift is (0.1pp, 1.1pp), excluding 0.",
      ],
      result: "The new button produces a statistically significant lift in conversion, and since the pre-registered sample size was respected, the result is trustworthy enough to ship.",
    },
    mistakes: [
      { mistake: "Peeking at results daily and stopping the moment p < 0.05.", fix: "Fix the sample size/duration in advance, or use a proper sequential testing method that controls for repeated looks." },
      { mistake: "Randomising by session instead of by user, so the same user can land in both groups.", fix: "Randomise on a stable user id (e.g. account id or persistent cookie) so each user consistently sees one variant." },
      { mistake: "Declaring victory based on a metric that was not chosen as primary before the test started.", fix: "Pre-register the single primary metric; treat all other metrics as exploratory/guardrails, not proof of success." },
    ],
    interviewQA: [
      { q: "Why is randomisation essential in A/B testing?", a: "It ensures that, on average, both groups are identical in every respect except the treatment, so any observed difference in the metric can be causally attributed to the treatment rather than confounding factors." },
      { q: "What is 'peeking' and why is it a problem?", a: "Peeking means repeatedly checking test results and stopping as soon as a significant result appears. This inflates the actual false-positive rate well beyond the nominal alpha because each additional check is another opportunity for random noise to look significant." },
      { q: "How do you decide the required sample size for an A/B test?", a: "Using the baseline conversion rate, the minimum detectable effect you care about, your desired significance level (alpha) and power (usually 80%), plugged into a power/sample-size formula or calculator." },
      { q: "What is a guardrail metric and why do you need one?", a: "A guardrail metric (e.g. churn, latency, complaint rate) is monitored to ensure the variant does not harm the business in ways the primary metric wouldn't catch, even if the primary metric improves." },
    ],
    practice: [
      "Use an online sample-size calculator to compute required n for a baseline of 5% and MDE of 1pp.",
      "Simulate an A/B test in Python where the null is true and show how often 'peeking daily' produces a false significant result versus a fixed-duration test.",
      "Design an A/B test plan (metric, MDE, sample size, duration, guardrails) for a pricing page change.",
      "Explain the difference between statistical significance and business significance in an A/B test result.",
    ],
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
    deepDive: [
      "Correlation quantifies how two variables move together, most commonly via Pearson's r, which ranges from -1 (perfect negative linear relationship) to +1 (perfect positive linear relationship), with 0 meaning no linear relationship. It is crucial to remember 'linear' — two variables can have a strong nonlinear relationship (like a U-shape) while Pearson r reports something close to zero, which is why you should always look at a scatter plot rather than trust the number alone.",
      "Causation is a much stronger claim: it means intervening on X (actually changing it) changes Y. Observational correlation cannot establish this on its own because of the ever-present possibility of a confounder — a third variable that influences both X and Y, creating an association between them even though neither causes the other. The classic example is ice cream sales and drowning deaths both rising with temperature; ice cream doesn't cause drownings, hot weather causes both to rise independently.",
      "Randomised controlled experiments are the gold standard for establishing causation because random assignment breaks the link between the treatment and any potential confounder — by construction, treatment and control groups are statistically identical in expectation on every other variable, known or unknown. When randomisation is not possible (e.g. studying the effect of smoking on cancer), researchers must instead control for known confounders statistically (regression adjustment, matching, instrumental variables) and remain cautious about unmeasured confounders. Simpson's paradox is a related trap where a trend that holds in the aggregate data reverses or disappears when the data is split by a relevant subgroup (e.g. a treatment appears worse overall but better in every individual subgroup), usually because subgroup sizes are unevenly distributed between the compared groups.",
    ],
    example: {
      title: "Simpson's paradox in hospital treatment outcomes",
      steps: [
        "Hospital A treats 100 mild cases (90 recover) and 900 severe cases (600 recover) -> overall 690/1000 = 69% recovery.",
        "Hospital B treats 900 mild cases (870 recover) and 100 severe cases (50 recover) -> overall 920/1000 = 92% recovery.",
        "At first glance Hospital B looks better overall.",
        "But within mild cases: A recovers 90%, B recovers 96.7% (B still better); within severe cases: A recovers 66.7%, B recovers 50% (A actually better here).",
        "The aggregate favoured B mainly because B treated far more easy (mild) cases, masking that A did better with severe cases.",
      ],
      result: "Splitting by case severity reverses part of the conclusion — Hospital A is actually better for severe cases despite a lower overall recovery rate, illustrating Simpson's paradox.",
    },
    mistakes: [
      { mistake: "Concluding X causes Y purely from a strong correlation.", fix: "Look for confounders, check temporal order, and ideally run a randomised experiment before making a causal claim." },
      { mistake: "Relying only on Pearson r without plotting the data, missing a nonlinear relationship.", fix: "Always visualise with a scatter plot; use Spearman correlation or nonlinear models when the relationship is not a straight line." },
      { mistake: "Aggregating data across unequal-sized subgroups and drawing conclusions without checking for Simpson's paradox.", fix: "Break down results by relevant subgroups (segment, cohort, severity) before trusting an aggregate comparison." },
    ],
    interviewQA: [
      { q: "Why doesn't correlation imply causation? Give an example.", a: "Correlation only shows two variables move together, which can be due to a third confounding factor. Example: ice cream sales and drowning deaths are correlated because both increase with hot weather, not because one causes the other." },
      { q: "What is a confounding variable?", a: "A variable that influences both the independent and dependent variable, creating a spurious association between them if not controlled for, e.g. age influencing both income and health outcomes." },
      { q: "How does randomisation help establish causation?", a: "Random assignment ensures that, on average, all other variables (known and unknown) are balanced between treatment and control groups, so any difference in outcome can be attributed to the treatment itself." },
      { q: "What is Simpson's paradox?", a: "A phenomenon where a trend present in aggregated data disappears or reverses when the data is broken into meaningful subgroups, usually caused by uneven subgroup sizes between the groups being compared." },
    ],
    practice: [
      "Find a spurious correlation online (e.g. tylervigen.com) and explain the likely confounder.",
      "Compute Pearson and Spearman correlation for a nonlinear dataset and compare the two values.",
      "Construct your own numeric example of Simpson's paradox with two subgroups.",
      "Design a randomised experiment to test whether a study technique causes higher exam scores, addressing at least one potential confounder.",
    ],
  },
};
