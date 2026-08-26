import type { TopicMap } from "../topicContent";

export const mlTopics: TopicMap = {
  "Supervised vs unsupervised learning": {
    summary:
      "Supervised learning maps inputs to known labels; unsupervised learning finds structure in unlabelled data.",
    keyPoints: [
      "Supervised: classification (discrete label) and regression (continuous value).",
      "Unsupervised: clustering, dimensionality reduction, anomaly detection.",
      "Semi-supervised uses a small labelled set plus a large unlabelled set.",
      "Label cost usually decides which family you can actually use.",
    ],
    diagram: `labelled data?
   |
   +-- yes --> supervised --> discrete label? --> classification
   |                        \\-> number?       --> regression
   |
   +-- no  --> unsupervised --> groups?      --> clustering
                             \\-> fewer dims? --> PCA / t-SNE`,
  },

  "Linear & logistic regression, regularisation": {
    summary:
      "Linear regression fits a straight line by minimising squared error. Logistic regression pushes that line through a sigmoid to output a probability.",
    keyPoints: [
      "Linear: y = w·x + b, loss = mean squared error.",
      "Logistic: p = 1 / (1 + e^-(w·x+b)), loss = binary cross-entropy.",
      "L2 (ridge) shrinks weights; L1 (lasso) drives some weights to exactly zero (feature selection).",
      "Always scale features before regularising — penalties are scale sensitive.",
    ],
    syntax: {
      lang: "text",
      code: "MSE  = (1/n) * sum((y - y_hat)^2)\nRidge = MSE + lambda * sum(w^2)\nLasso = MSE + lambda * sum(|w|)",
    },
    diagram: `linear                 logistic
 y                      p
 |     *                1 |      ____
 |   */                   |    _/
 | */                  0.5|   /
 |/  *                    | _/
 +--------- x           0 +/--------- x`,
  },

  "Decision trees, random forest, gradient boosting": {
    summary:
      "A decision tree splits data on the feature that best reduces impurity. Forests average many trees; boosting builds trees that fix the previous one's errors.",
    keyPoints: [
      "Split criteria: Gini impurity or entropy (classification), variance (regression).",
      "A single deep tree overfits; limit depth, min samples per leaf, or prune.",
      "Random forest = bagging + random feature subsets -> variance reduction, parallel training.",
      "Boosting (XGBoost/LightGBM) = sequential, fits residuals -> bias reduction, needs learning-rate tuning.",
    ],
    diagram: `TREE                BAGGING (forest)       BOOSTING
  age<30?            T1 T2 T3 ... Tn        T1 -> resid -> T2 -> resid -> T3
  /    \\             \\  |  /  ... /               (sequential)
yes     no             average vote
 |       |
buy    salary>50k?`,
  },

  "SVM & kernel intuition": {
    summary:
      "An SVM finds the hyperplane with the largest margin between classes. Kernels compute similarity in a higher-dimensional space without building it.",
    keyPoints: [
      "Support vectors are the few points that touch the margin and define the boundary.",
      "C controls the margin/violation trade-off: small C = wider margin, more slack.",
      "RBF kernel handles non-linear boundaries; gamma sets how local each point's influence is.",
      "Scale features — SVMs are distance based.",
    ],
    diagram: `  o o   |     x x
  o     |  m   x       | = hyperplane
  o  o  | a |    x     m/a = margin band
        |           x
support vectors = points on the dashed margin lines`,
  },

  "Clustering: k-means, hierarchical, DBSCAN": {
    summary:
      "Clustering groups similar points without labels. Each algorithm assumes a different cluster shape.",
    keyPoints: [
      "k-means: pick k, assign to nearest centroid, recompute — assumes round, similar-sized clusters.",
      "Choose k with the elbow method or silhouette score.",
      "Hierarchical: merge closest pairs into a dendrogram; cut it at any height.",
      "DBSCAN: density based, finds arbitrary shapes and labels outliers as noise, no k needed.",
    ],
    diagram: `k-means         hierarchical        DBSCAN
 (o o)          |   ___            ooooo  . <- noise
  C1            |  |   |          o     o
 (x x)          | _|_  |_         ooooo
  C2            A  B  C  D      arbitrary shape`,
  },

  "Dimensionality reduction: PCA, t-SNE": {
    summary:
      "Reduce feature count while keeping information. PCA keeps directions of maximum variance; t-SNE preserves local neighbourhoods for visualisation.",
    keyPoints: [
      "PCA is linear, deterministic, invertible-ish, and needs standardised features.",
      "Pick components by cumulative explained variance (e.g. 95%).",
      "t-SNE/UMAP are for plotting only — distances between clusters are not meaningful.",
      "Reducing dimensions fights the curse of dimensionality and speeds training.",
    ],
    diagram: `original 2D            PCA rotation
  x2   * *              PC1 -> direction of max variance
  |   * *  *            PC2 -> orthogonal, less variance
  |  * *                keep PC1 only => 2D becomes 1D
  +--------- x1`,
  },

  "Feature engineering & data leakage": {
    summary:
      "Features carry most of the model's performance. Leakage is when training data contains information unavailable at prediction time — it inflates scores and fails in production.",
    keyPoints: [
      "Common features: scaling, one-hot/target encoding, binning, ratios, date parts, text vectors.",
      "Fit scalers and encoders on train only, then transform validation/test.",
      "Time series must be split chronologically — never shuffle.",
      "A suspiciously perfect score almost always means leakage.",
    ],
    syntax: {
      lang: "python",
      code: "scaler.fit(X_train)          # fit on train only\nX_train = scaler.transform(X_train)\nX_test  = scaler.transform(X_test)",
    },
    diagram: `WRONG                        RIGHT
fit scaler on all data       split first
        |                        |
     split                  fit on train
        |                        |
  test stats leaked         transform test`,
  },

  "Cross-validation and metric selection": {
    summary:
      "Cross-validation estimates generalisation by rotating which fold is held out. The metric must match the business cost of each error type.",
    keyPoints: [
      "k-fold (k=5/10); stratified k-fold keeps class ratios; TimeSeriesSplit for temporal data.",
      "Accuracy is misleading on imbalanced data — use precision, recall, F1 or PR-AUC.",
      "Precision = of predicted positives, how many were right; recall = of actual positives, how many we caught.",
      "Regression: MAE (robust), RMSE (penalises big misses), R².",
    ],
    diagram: `5-fold CV
fold1 [TEST][ tr ][ tr ][ tr ][ tr ]
fold2 [ tr ][TEST][ tr ][ tr ][ tr ]
fold3 [ tr ][ tr ][TEST][ tr ][ tr ]
...            score = mean of folds

confusion matrix     pred+   pred-
       actual+        TP      FN
       actual-        FP      TN`,
  },

  "Bias-variance trade-off, overfitting control": {
    summary:
      "Bias is error from an oversimple model; variance is error from sensitivity to the training sample. Total error is minimised between the two.",
    keyPoints: [
      "High bias = underfit: train and validation error both high.",
      "High variance = overfit: low train error, high validation error.",
      "Fix overfitting with more data, regularisation, simpler models, dropout, early stopping.",
      "Fix underfitting with more features, more capacity, less regularisation.",
    ],
    diagram: `error
  |\\                       total
  | \\        _____________/
  |  \\    __/  variance
  |   \\__/
  |  bias
  +------------------------- model complexity
        ^ sweet spot`,
  },
};
