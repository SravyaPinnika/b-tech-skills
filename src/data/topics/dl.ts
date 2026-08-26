import type { TopicMap } from "../topicContent";

export const dlTopics: TopicMap = {
  "Perceptrons, activations, backpropagation": {
    summary:
      "A neuron computes a weighted sum plus bias and passes it through a non-linear activation. Backpropagation applies the chain rule to get each weight's gradient.",
    keyPoints: [
      "Without a non-linear activation, stacked layers collapse into one linear layer.",
      "ReLU is the default hidden activation; sigmoid for binary output, softmax for multi-class.",
      "Forward pass computes loss; backward pass propagates dLoss/dW layer by layer.",
      "Vanishing gradients hit sigmoid/tanh deep stacks; ReLU and residual connections help.",
    ],
    syntax: {
      lang: "text",
      code: "z = W·x + b\na = ReLU(z) = max(0, z)\ndW = dLoss/da * da/dz * dz/dW",
    },
    diagram: `x1 --w1--\\
x2 --w2----> [ sum + b ] -> activation -> a
x3 --w3--/

forward  ------------------------->
backward <------ gradients --------`,
  },

  "Loss functions & optimisers (SGD, Adam)": {
    summary:
      "The loss scores predictions; the optimiser walks weights downhill along the gradient. The learning rate is the single most important hyperparameter.",
    keyPoints: [
      "Cross-entropy for classification, MSE/MAE for regression.",
      "SGD + momentum is stable and generalises well; Adam adapts per-parameter rates and converges faster.",
      "Too high a learning rate diverges; too low stalls — use warmup and schedulers.",
      "Batch size trades gradient noise for memory and step count.",
    ],
    syntax: {
      lang: "python",
      code: "opt = torch.optim.Adam(model.parameters(), lr=1e-3)\nloss = criterion(model(x), y)\nopt.zero_grad(); loss.backward(); opt.step()",
    },
    diagram: `loss surface (side view)
 |\\        lr too big: * -> * -> *  (bounces out)
 | \\    /  good lr:    * -> *  -> min
 |  \\__/   lr too small: *. . . (crawls)
 +--------- weight`,
  },

  "Regularisation: dropout, batch norm, early stopping": {
    summary:
      "Regularisation keeps a high-capacity network from memorising the training set.",
    keyPoints: [
      "Dropout randomly zeroes activations while training, disabled at inference.",
      "Batch norm normalises layer inputs, stabilising and speeding training.",
      "Early stopping halts when validation loss stops improving; keep the best checkpoint.",
      "Data augmentation and weight decay are usually the cheapest wins.",
    ],
    diagram: `train loss  \\____________
val loss     \\___
                  \\___/-----  <- stop here (early stopping)
                        epochs ->

dropout: [o o o o] -> [o x o x]  (x = dropped this step)`,
  },

  "CNNs and computer-vision pipelines": {
    summary:
      "Convolutional layers slide small learned filters over an image, sharing weights and detecting local patterns that combine into higher-level features.",
    keyPoints: [
      "Conv -> activation -> pooling blocks reduce spatial size while growing channel depth.",
      "Weight sharing gives translation invariance and far fewer parameters than a dense layer.",
      "Output size = (N - F + 2P)/S + 1 for kernel F, padding P, stride S.",
      "Early layers learn edges; deep layers learn objects.",
    ],
    diagram: `image 224x224x3
  -> conv+relu -> 112x112x32
  -> pool      -> 56x56x32
  -> conv+relu -> 56x56x64
  -> pool      -> 28x28x64
  -> flatten -> dense -> softmax`,
  },

  "RNN, LSTM and sequence modelling": {
    summary:
      "RNNs keep a hidden state across timesteps. LSTMs add gates and a cell state so gradients survive long sequences.",
    keyPoints: [
      "Vanilla RNNs suffer vanishing/exploding gradients over long ranges.",
      "LSTM gates: forget, input, output — they decide what to drop, add and expose.",
      "GRU merges gates: fewer parameters, similar accuracy.",
      "Sequential computation prevents parallelism, which is why transformers won.",
    ],
    diagram: `x1      x2      x3
 |       |       |
[h0]->[h1]--->[h2]--->[h3] -> output
       ^ same weights reused each step

LSTM cell: c_{t-1} --(x forget)--(+ input)--> c_t --> tanh --(x output)--> h_t`,
  },

  "Attention & transformer architecture": {
    summary:
      "Attention lets every token look at every other token and weight it by relevance, so context is gathered in one parallel step.",
    keyPoints: [
      "Attention(Q,K,V) = softmax(QKᵀ / √d) V.",
      "Multi-head attention runs several attention subspaces in parallel.",
      "Positional encodings restore order, which attention alone ignores.",
      "Each block = attention + feed-forward, each wrapped in residual + layer norm.",
    ],
    syntax: {
      lang: "text",
      code: "scores  = Q @ K.T / sqrt(d_k)\nweights = softmax(scores)\nout     = weights @ V",
    },
    diagram: `tokens:  The  cat  sat  on  mat
"sat" attends:
  The .05 | cat .60 | sat .20 | on .10 | mat .05
             ^ strongest link

block: x -> [LN -> MHA] +x -> [LN -> FFN] +x`,
  },

  "Transfer learning & fine-tuning": {
    summary:
      "Start from a model pretrained on huge data, then adapt it to your small dataset — far cheaper and usually more accurate than training from scratch.",
    keyPoints: [
      "Feature extraction: freeze the backbone, train only the new head.",
      "Fine-tuning: unfreeze top layers with a small learning rate.",
      "Small/similar dataset -> freeze more; large/different dataset -> unfreeze more.",
      "LoRA/adapters fine-tune a few million parameters instead of billions.",
    ],
    diagram: `pretrained backbone            new head
[ conv/transformer blocks ] --> [ dense -> classes ]
  frozen (or low lr)              trained from scratch`,
  },

  "Model evaluation and error analysis": {
    summary:
      "Track the metric that matches the goal, then read the actual mistakes — error analysis tells you what to fix next.",
    keyPoints: [
      "Hold out a test set touched only once; tune on validation.",
      "Inspect a sample of misclassified items and group failure causes.",
      "Compare against a human or trivial baseline before celebrating.",
      "Check calibration and per-slice performance, not just the global average.",
    ],
    diagram: `100 errors sampled
  blurry images .... 42  <- fix data / augment
  mislabelled ...... 25  <- clean labels
  rare class ....... 20  <- resample / weight
  genuinely hard .... 13  <- accept`,
  },
};
