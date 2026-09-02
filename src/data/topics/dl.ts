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
    deepDive: [
      "A single perceptron is a linear classifier: it can only separate data with a straight line (or hyperplane). The historical XOR problem showed this limitation directly — no single line separates XOR outputs, which is why multi-layer networks with non-linear activations were needed. Once you stack layers and insert a non-linearity between them, the network can approximate arbitrarily complex decision boundaries, which is the content of the universal approximation theorem.",
      "Backpropagation is not a separate algorithm from gradient descent — it is just an efficient way to compute the gradient of the loss with respect to every weight, using the chain rule and reusing intermediate results (the computational graph). Each layer only needs to know the local gradient of its own operation and the gradient flowing in from the layer above; multiplying these gives the gradient to pass further back. This reuse is what makes training networks with millions of parameters computationally feasible instead of recomputing everything from scratch for every weight.",
      "The choice of activation function has direct consequences for training dynamics. Sigmoid and tanh saturate for large positive or negative inputs, meaning their derivative approaches zero, so gradients shrink as they are multiplied backward through many layers — the vanishing gradient problem. ReLU avoids saturation on the positive side and is cheap to compute, but it can 'die' (always output zero) if a large gradient pushes its bias very negative. Variants like Leaky ReLU, ELU, and GELU (used in transformers) address this by allowing a small negative slope or a smoother curve near zero.",
      "In practice, weight initialization matters as much as activation choice. Xavier/Glorot initialization is tuned for sigmoid/tanh, while He initialization is tuned for ReLU, both aiming to keep the variance of activations and gradients roughly constant across layers so that neither vanishing nor exploding gradients dominate early in training.",
    ],
    example: {
      title: "Forward and backward pass through a 1-neuron network",
      steps: [
        "Input x = 2, weight w = 0.5, bias b = 0, target y = 1.",
        "Forward: z = w*x + b = 1.0.",
        "Apply activation: a = ReLU(1.0) = 1.0.",
        "Compute loss: L = (a - y)^2 = (1.0 - 1)^2 = 0.",
        "Since loss is already 0, dL/da = 2*(a-y) = 0, so no weight update occurs this step.",
        "Now try x = 2, w = 0.1: z = 0.2, a = 0.2, L = (0.2-1)^2 = 0.64.",
        "Backward: dL/da = -1.6, da/dz = 1 (ReLU active), dz/dw = x = 2, so dL/dw = -1.6*1*2 = -3.2; update w = w - lr*dL/dw increases w toward the target.",
      ],
      result: "The gradient sign shows the weight must increase to raise the output toward the target, which is exactly what gradient descent does on the next step.",
    },
    mistakes: [
      { mistake: "Using no activation function (or only linear activations) between layers.", fix: "Insert a non-linearity like ReLU after every hidden linear layer; otherwise the whole network is mathematically equivalent to one linear layer." },
      { mistake: "Forgetting to zero out gradients before calling backward() in each training step.", fix: "Call optimizer.zero_grad() before loss.backward(), since gradients accumulate by default in frameworks like PyTorch." },
      { mistake: "Initializing all weights to zero.", fix: "Use random initialization (He/Xavier) so neurons break symmetry and learn different features." },
      { mistake: "Ignoring exploding gradients in deep or recurrent networks.", fix: "Apply gradient clipping (clip by norm) and monitor gradient magnitudes during training." },
    ],
    interviewQA: [
      { q: "Why can't a neural network with only linear activations learn non-linear functions?", a: "Composing linear functions always yields another linear function (matrix multiplication is associative), so no matter how many linear layers you stack, the network can only represent linear decision boundaries. A non-linear activation between layers is what allows the network to approximate arbitrary functions." },
      { q: "Explain backpropagation in one sentence and why it's efficient.", a: "Backpropagation computes gradients of the loss with respect to every weight by applying the chain rule from the output back to the input, reusing intermediate derivatives so the cost is proportional to one forward and one backward pass, not to the number of weights individually." },
      { q: "What is the vanishing gradient problem and how do you mitigate it?", a: "In deep networks with saturating activations like sigmoid/tanh, gradients shrink multiplicatively as they propagate backward, so early layers barely update. Mitigations include ReLU-family activations, batch normalization, residual/skip connections, and careful weight initialization." },
      { q: "Why do we use ReLU instead of sigmoid in hidden layers?", a: "ReLU does not saturate for positive inputs, so gradients flow more freely, it is cheaper to compute (no exponential), and it induces sparsity in activations, which empirically speeds up and stabilizes training of deep networks." },
    ],
    practice: [
      "Implement a 2-layer neural network from scratch in NumPy, including manual forward and backward passes, and train it on XOR.",
      "Derive by hand the gradient of a sigmoid cross-entropy loss with respect to the pre-activation logit.",
      "Compare training curves of a deep MLP with sigmoid vs ReLU activations on MNIST and observe vanishing gradients.",
      "Implement gradient checking (numerical vs analytical gradients) to debug a custom backward pass.",
    ],
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
    deepDive: [
      "The loss function encodes what 'good' means for the task and must be differentiable so gradients can be computed. Cross-entropy loss is derived from maximum likelihood estimation under a categorical distribution and penalizes confident wrong predictions heavily because of the log term, which is why it is preferred over MSE for classification — MSE gives weak gradients when predictions are far from the target but saturated through a sigmoid/softmax.",
      "Plain SGD updates weights using only the current mini-batch gradient, which is noisy. Momentum accumulates an exponentially decaying moving average of past gradients, which smooths the trajectory and helps escape shallow local minima or saddle points, acting like a ball rolling downhill with inertia. Adam goes further: it keeps a running average of both the gradient (first moment) and the squared gradient (second moment) for every parameter, effectively giving each parameter its own adaptive learning rate. This makes Adam converge fast especially on sparse or noisy gradients, common in NLP.",
      "Despite Adam's popularity, plain SGD with momentum often generalizes better on large vision tasks because Adam's adaptive per-parameter scaling can converge to sharper minima that don't generalize as well. AdamW decouples weight decay from the gradient-based update, fixing a subtle bug in the original Adam+L2 combination and is now the default for training transformers.",
      "Learning rate schedules matter more than the base optimizer choice in many cases. Warmup (gradually increasing the LR at the start) prevents early instability when the model's weights are still close to their random initialization and gradients can be very large. Cosine decay or step decay schedules then reduce the LR as training progresses so that the optimizer settles into a minimum rather than oscillating around it.",
    ],
    example: {
      title: "Dry run of one Adam update step",
      steps: [
        "Parameter w = 1.0, gradient g = 0.4, lr = 0.001, beta1 = 0.9, beta2 = 0.999, eps = 1e-8, m0 = 0, v0 = 0.",
        "Update biased first moment: m1 = 0.9*0 + 0.1*0.4 = 0.04.",
        "Update biased second moment: v1 = 0.999*0 + 0.001*(0.4^2) = 0.00016.",
        "Bias-correct: m_hat = m1 / (1 - 0.9^1) = 0.4, v_hat = v1 / (1 - 0.999^1) = 0.16.",
        "Compute update: delta = lr * m_hat / (sqrt(v_hat) + eps) = 0.001 * 0.4 / (0.4 + 1e-8) ≈ 0.001.",
        "New weight: w1 = w - delta = 1.0 - 0.001 = 0.999.",
      ],
      result: "The weight moves a small, well-scaled step in the direction that reduces the loss, and this scale stays roughly consistent even if raw gradient magnitudes vary a lot between parameters.",
    },
    mistakes: [
      { mistake: "Using MSE loss for a multi-class classification problem.", fix: "Use cross-entropy loss with softmax outputs; MSE gives poor gradients for classification and does not correspond to a proper probabilistic model." },
      { mistake: "Picking a single fixed learning rate for the whole training run without any schedule.", fix: "Use warmup plus a decay schedule (cosine or step) so training is stable early and converges precisely later." },
      { mistake: "Assuming Adam always outperforms SGD.", fix: "Benchmark both; for large-scale vision tasks SGD+momentum often generalizes better, while Adam/AdamW is usually better for transformers and sparse gradients." },
      { mistake: "Not clipping gradients when training RNNs or very deep networks, causing loss to become NaN.", fix: "Apply gradient norm clipping (e.g., clip_grad_norm_) before the optimizer step." },
    ],
    interviewQA: [
      { q: "Why is cross-entropy preferred over MSE for classification?", a: "Cross-entropy comes from maximizing the likelihood of the correct class under a softmax output and produces much stronger, well-behaved gradients when predictions are wrong, especially near saturation, whereas MSE gradients vanish in that regime and don't align with the probabilistic interpretation of classification." },
      { q: "How does Adam differ from SGD with momentum?", a: "SGD with momentum accumulates a moving average of the gradient to smooth updates using one global learning rate. Adam additionally tracks a moving average of squared gradients to adapt the effective learning rate per parameter, making it converge faster on noisy or sparse gradients, at some cost to generalization compared to well-tuned SGD." },
      { q: "What happens if the learning rate is too high or too low?", a: "Too high, updates overshoot the minimum and the loss can oscillate or diverge; too low, training makes very slow progress and can get stuck in poor local regions within the training budget. This is why LR schedules and warmup are used in practice." },
      { q: "What is the difference between Adam and AdamW?", a: "AdamW decouples weight decay from the gradient update, applying it directly to the weights rather than folding it into the gradient like L2 regularization does in the original Adam. This decoupling gives better and more predictable regularization, and AdamW is now the default optimizer for training transformer models." },
    ],
    practice: [
      "Implement SGD, SGD+momentum, and Adam from scratch on a toy quadratic loss and plot convergence paths.",
      "Train the same model with three different learning rates and plot the loss curves to see divergence, slow crawl, and good convergence.",
      "Compare AdamW vs plain Adam with L2 regularization on a small classification task and inspect weight decay behavior.",
      "Implement a cosine learning rate schedule with warmup and visualize the LR over training steps.",
    ],
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
    deepDive: [
      "Overfitting happens when a network has enough capacity to memorize noise and idiosyncrasies of the training set rather than learning generalizable patterns; the signature is training loss continuing to fall while validation loss rises. Regularization techniques all work by either reducing effective capacity, injecting noise, or stopping training before memorization sets in.",
      "Dropout can be understood as training an exponential ensemble of thinned subnetworks that share weights, and at test time using the full network approximates averaging over that ensemble (with activations scaled to match expected magnitude). This forces neurons to not rely on the presence of specific other neurons, promoting redundant, robust feature representations.",
      "Batch normalization normalizes the input to each layer to zero mean and unit variance (per mini-batch, per channel), then applies learnable scale and shift parameters. Its main empirical benefit is smoothing the loss landscape (reducing internal covariate shift is a contested explanation), which allows higher learning rates and faster convergence, and it also has a mild regularizing effect because the batch statistics introduce noise. At inference time, running averages of mean/variance collected during training are used instead of batch statistics.",
      "Early stopping is the simplest and cheapest regularizer: it requires no architecture change, just monitoring a held-out validation metric and saving the checkpoint with the best value, then stopping once patience is exhausted. Combined with weight decay (which penalizes large weights and encourages simpler functions) and data augmentation (which effectively enlarges the training distribution), these three techniques cover most practical regularization needs before reaching for more exotic methods like label smoothing or mixup.",
    ],
    example: {
      title: "Tracking validation loss to trigger early stopping",
      steps: [
        "Epoch 1: train loss 0.90, val loss 0.85 -> best val so far, save checkpoint.",
        "Epoch 2: train loss 0.70, val loss 0.65 -> new best, save checkpoint, patience counter reset to 0.",
        "Epoch 3: train loss 0.55, val loss 0.60 -> worse than best, patience counter = 1.",
        "Epoch 4: train loss 0.40, val loss 0.63 -> still worse, patience counter = 2.",
        "Epoch 5: train loss 0.30, val loss 0.68 -> worse again, patience counter = 3, equals patience limit of 3.",
        "Stop training and reload the checkpoint from epoch 2, which had the best validation loss.",
      ],
      result: "The final deployed model is the epoch-2 checkpoint, avoiding the overfitting that started around epoch 3 despite training loss still decreasing.",
    },
    mistakes: [
      { mistake: "Leaving dropout active during evaluation/inference.", fix: "Call model.eval() (PyTorch) so dropout layers are disabled and batch norm uses running statistics at inference time." },
      { mistake: "Using a very high dropout rate on small layers, crippling learning capacity.", fix: "Start with dropout 0.2-0.5 on larger fully connected layers and little or no dropout on small/convolutional layers; tune based on validation performance." },
      { mistake: "Applying batch normalization with very small batch sizes, making batch statistics noisy and unstable.", fix: "Use layer normalization or group normalization instead of batch norm when batch sizes are small (e.g., in fine-tuning transformers)." },
      { mistake: "Stopping training based on training loss instead of validation loss.", fix: "Always monitor a held-out validation set for early stopping decisions; training loss will keep improving even as the model overfits." },
    ],
    interviewQA: [
      { q: "How does dropout act as a regularizer?", a: "Dropout randomly zeroes a fraction of activations during each training step, which prevents co-adaptation between neurons and effectively trains an ensemble of thinned subnetworks that share weights; averaging their effect at test time (by using the full network, scaled appropriately) improves generalization." },
      { q: "What problem does batch normalization solve and how is it used differently at train vs test time?", a: "It reduces sensitivity to internal covariate shift by normalizing layer inputs to stable statistics, which allows higher learning rates and faster, more stable convergence. During training it uses per-batch mean and variance; at inference it uses a running average of those statistics accumulated during training, since a single test example may not have a meaningful batch." },
      { q: "Why does early stopping work as a regularizer even without changing the loss function?", a: "It implicitly limits how long the optimizer can search the parameter space, which restricts how closely the model can fit noise in the training data; stopping at the point of best validation performance approximates the effect of a capacity constraint without modifying the model architecture." },
      { q: "When would you prefer layer normalization over batch normalization?", a: "When batch sizes are small or variable (as in NLP/transformer training and sequence models), or when normalization needs to be independent of batch composition, since layer norm normalizes across features for each individual example rather than across the batch." },
    ],
    practice: [
      "Train the same CNN with and without dropout on a small dataset and compare the train/val loss gap.",
      "Implement early stopping manually with a patience counter and checkpoint saving in a training loop.",
      "Compare batch norm vs layer norm on a small transformer with batch size 2 vs batch size 128.",
      "Add data augmentation (random crop/flip) to an image classifier and measure the change in validation accuracy.",
    ],
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
    deepDive: [
      "A convolutional filter is a small matrix of learnable weights (e.g., 3x3) that slides across the image computing a dot product at each location, producing a feature map. Because the same filter weights are reused at every spatial position, the network learns location-independent pattern detectors — a filter that detects a vertical edge in the top-left of an image will detect the same edge anywhere else, which is the source of translation equivariance and a massive parameter saving versus a fully connected layer over the same input.",
      "Stacking convolutional layers grows the receptive field: a neuron in a deeper layer 'sees' a larger region of the original image because it aggregates information from neurons in the previous layer, each of which already aggregated a smaller region. This is why early layers tend to learn low-level features like edges and color blobs, middle layers learn textures and parts, and deep layers learn whole objects or object parts — a hierarchy confirmed by visualizing learned filters and activations.",
      "Pooling (max or average) reduces spatial resolution, which both lowers compute cost for later layers and adds a degree of local translation invariance since small shifts in the input don't change the pooled output much. Modern architectures (ResNet, EfficientNet, ConvNeXt) often reduce reliance on pooling in favor of strided convolutions, and add residual/skip connections so gradients can flow directly across many layers, enabling networks with over 100 layers to train successfully.",
      "A full computer vision pipeline is more than the architecture: it includes data preprocessing (resize, normalize using dataset mean/std), augmentation (random crop, flip, color jitter, mixup/cutmix) to combat overfitting, transfer learning from ImageNet-pretrained backbones for small datasets, and task-specific heads — a classification head is a single dense+softmax layer, while detection (YOLO, Faster R-CNN) and segmentation (U-Net, Mask R-CNN) require specialized output heads and losses.",
    ],
    example: {
      title: "Computing output size through a conv+pool stack",
      steps: [
        "Input image: 32x32x3.",
        "Conv layer: kernel F=3, stride S=1, padding P=1 -> output size = (32-3+2*1)/1 + 1 = 32, so feature map is 32x32x16 (16 filters).",
        "Apply ReLU: shape unchanged, still 32x32x16.",
        "Max pool: kernel 2, stride 2 -> output size = (32-2)/2 + 1 = 16, so feature map is 16x16x16.",
        "Second conv layer: kernel F=3, stride 1, padding 1, 32 filters -> output stays 16x16x32.",
        "Second max pool, kernel 2 stride 2 -> output is 8x8x32.",
        "Flatten to a vector of size 8*8*32 = 2048 and feed into a dense classification head.",
      ],
      result: "The spatial size shrinks from 32x32 to 8x8 while channel depth grows from 3 to 32, following the standard pattern of trading spatial resolution for richer feature representation before classification.",
    },
    mistakes: [
      { mistake: "Forgetting to normalize input images to the same mean/std used during pretraining when using a pretrained backbone.", fix: "Use the exact normalization statistics (e.g., ImageNet mean/std) that the pretrained model was trained with." },
      { mistake: "Using a fully connected layer directly on a large flattened image instead of convolutional layers.", fix: "Use convolutional layers first to exploit spatial locality and weight sharing, drastically reducing parameter count before any dense layer." },
      { mistake: "Miscalculating output spatial dimensions after conv/pool layers, causing shape mismatch errors.", fix: "Always apply the formula (N - F + 2P)/S + 1 for each layer, or print shapes during a forward pass in debugging mode." },
      { mistake: "Training a CNN from scratch on a very small dataset instead of using transfer learning.", fix: "Start from an ImageNet-pretrained backbone and fine-tune, since small datasets rarely have enough signal to learn good low-level filters from scratch." },
    ],
    interviewQA: [
      { q: "Why do CNNs use far fewer parameters than an equivalent fully connected network on images?", a: "Convolutional layers share the same small set of filter weights across all spatial locations instead of learning a unique weight for every pixel-to-neuron connection, exploiting the fact that useful visual patterns (edges, textures) are local and translation-invariant." },
      { q: "What is the purpose of pooling layers?", a: "Pooling reduces the spatial dimensions of feature maps, cutting computation for subsequent layers and adding a degree of local translation invariance, since small shifts in the input change the pooled output only slightly." },
      { q: "How would you compute the output size of a convolutional layer?", a: "Using the formula (N - F + 2P) / S + 1, where N is input size, F is kernel size, P is padding, and S is stride; this must be computed per spatial dimension and applied at every conv/pool layer to track feature map shapes through the network." },
      { q: "Why do we use residual (skip) connections in deep CNNs like ResNet?", a: "They let gradients flow directly through identity shortcuts across many layers, avoiding vanishing gradients, and they let each block learn a residual/refinement to the input rather than a full transformation, which is empirically much easier to optimize in very deep networks." },
    ],
    practice: [
      "Manually compute output shapes through a 4-layer conv+pool stack given kernel/stride/padding values.",
      "Fine-tune a pretrained ResNet on a small custom image dataset with a new classification head.",
      "Visualize the learned filters and intermediate activation maps of the first two conv layers of a trained CNN.",
      "Implement a minimal CNN from scratch in PyTorch and train it on CIFAR-10, comparing accuracy with and without data augmentation.",
    ],
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
    deepDive: [
      "A vanilla RNN updates its hidden state as h_t = tanh(W_h h_{t-1} + W_x x_t + b), reusing the same weight matrices at every timestep. Backpropagation through time (BPTT) unrolls the recurrence and applies the chain rule across all timesteps, which means the gradient contribution from an early timestep is multiplied by the same weight matrix (and derivative of tanh) once per intervening step — if the largest eigenvalue of that repeated multiplication is less than 1 the gradient vanishes, and if greater than 1 it explodes, which is fundamentally why vanilla RNNs struggle with long-range dependencies.",
      "LSTMs fix this by introducing a cell state that flows through time with only additive, gated interactions (rather than repeated matrix multiplication and squashing). Three sigmoid gates control this flow: the forget gate decides what fraction of the old cell state to keep, the input gate decides how much new candidate information to write in, and the output gate decides what part of the cell state to expose as the hidden state. Because the cell state update is largely additive (c_t = f_t * c_{t-1} + i_t * candidate), gradients can flow backward through many timesteps largely unimpeded as long as the forget gate stays close to 1 for relevant information.",
      "GRUs simplify this by merging the forget and input gates into a single update gate and removing the separate cell state, using only the hidden state itself. This roughly halves the number of gate parameters compared to LSTM, trains slightly faster, and performs comparably on many tasks, though LSTMs can still have an edge on tasks needing very long-range memory.",
      "The core limitation of all RNN variants, despite gating, is that h_t depends on h_{t-1}, so computation must proceed strictly sequentially — you cannot compute timestep 100 before timestep 99 is done. This prevents parallelizing training across the sequence dimension on GPUs, unlike transformers where self-attention lets all positions be processed simultaneously. This computational bottleneck, more than any accuracy gap, is the main reason transformers replaced RNNs for large-scale sequence modeling.",
    ],
    example: {
      title: "Tracing an LSTM cell state across two timesteps",
      steps: [
        "At t=0, cell state c0 = 0.5, hidden state h0 = 0.3.",
        "New input x1 arrives; forget gate computes f1 = 0.8 (mostly keep old memory).",
        "Input gate computes i1 = 0.6 and candidate value g1 = 0.9 (new information to potentially add).",
        "Update cell state: c1 = f1*c0 + i1*g1 = 0.8*0.5 + 0.6*0.9 = 0.4 + 0.54 = 0.94.",
        "Output gate computes o1 = 0.7; hidden state h1 = o1 * tanh(c1) = 0.7 * tanh(0.94) ≈ 0.7*0.735 ≈ 0.51.",
        "At t=2, if forget gate f2 stays near 1 (e.g., 0.95) the information from c1 largely persists into c2, preserving long-range signal.",
      ],
      result: "The cell state accumulates information additively across timesteps, so as long as gates stay favorable, signal from early timesteps can still influence the hidden state many steps later, unlike a vanilla RNN where it would have decayed multiplicatively.",
    },
    mistakes: [
      { mistake: "Using a vanilla RNN for long sequences (e.g., 100+ timesteps) and being surprised by poor performance.", fix: "Switch to LSTM or GRU, which use gating to preserve gradient flow over much longer ranges." },
      { mistake: "Not applying gradient clipping when training RNNs, causing exploding gradients and NaN losses.", fix: "Clip gradients by norm (e.g., max norm 1.0-5.0) before every optimizer step in recurrent architectures." },
      { mistake: "Feeding variable-length sequences into a batch without padding/masking, causing the model to learn from padding tokens.", fix: "Pad sequences and use masking (or packed sequences in PyTorch) so the loss and hidden state updates ignore padded positions." },
      { mistake: "Assuming LSTM is always better than GRU or vice versa without testing.", fix: "Benchmark both on the specific task and dataset size, since GRU is faster with fewer parameters and often matches LSTM accuracy." },
    ],
    interviewQA: [
      { q: "Why do vanilla RNNs suffer from vanishing/exploding gradients?", a: "Backpropagation through time repeatedly multiplies the same weight matrix (and activation derivative) once per timestep when computing gradients for early timesteps; if this repeated multiplication has a spectral radius below 1 the gradient shrinks exponentially (vanishing), and above 1 it grows exponentially (exploding), making long-range dependencies hard to learn." },
      { q: "How does an LSTM cell state help gradients survive over long sequences?", a: "The cell state is updated mostly through element-wise multiplication and addition (via the forget and input gates) rather than repeated matrix multiplication through a squashing non-linearity, so gradients can flow backward through many timesteps with far less decay when the forget gate keeps relevant information alive." },
      { q: "What's the practical difference between LSTM and GRU?", a: "GRU merges the forget and input gates into a single update gate and drops the separate cell state, using fewer parameters and training faster, while LSTM's separate cell state and three gates can capture more nuanced long-range dependencies on some tasks; in practice their performance is often comparable and GRU is a reasonable default for smaller datasets." },
      { q: "Why did transformers replace RNNs for most large-scale sequence tasks?", a: "RNNs process tokens sequentially because each hidden state depends on the previous one, preventing parallelization across the sequence during training, whereas transformer self-attention computes relationships between all tokens simultaneously, enabling much better GPU utilization and scaling to far larger models and datasets." },
    ],
    practice: [
      "Implement a vanilla RNN and an LSTM from scratch in NumPy and compare their ability to learn a task requiring memory over 50+ steps.",
      "Train a character-level LSTM language model on a small text corpus and generate sample text.",
      "Visualize gradient magnitudes at each timestep during BPTT for a vanilla RNN to observe vanishing gradients directly.",
      "Implement sequence padding, masking, and packed sequences for a batch of variable-length sentences in PyTorch.",
    ],
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
    deepDive: [
      "Self-attention computes, for each token, a query vector and compares it against the key vectors of every other token (including itself) via a dot product, producing a similarity score. Dividing by sqrt(d_k) keeps the dot products from growing too large in magnitude as dimensionality increases, which would otherwise push the softmax into extremely peaked, low-gradient regions. Softmax turns the scores into a probability distribution over all tokens, and the output for a given token is a weighted sum of every token's value vector according to that distribution — this is how a token gathers relevant context from anywhere in the sequence in a single operation, unlike an RNN which must pass information step by step.",
      "Multi-head attention runs several independent attention operations in parallel, each with its own learned projections into smaller query/key/value subspaces, then concatenates and linearly projects the results. This lets different heads specialize — one head might track syntactic dependencies (like subject-verb agreement) while another tracks coreference or positional proximity — giving the model a richer combined representation than a single attention operation could.",
      "Because attention itself is permutation-invariant (it has no notion of order — shuffling the input tokens shuffles the output the same way), transformers add positional information explicitly, either via fixed sinusoidal encodings, learned absolute position embeddings, or relative schemes like rotary position embeddings (RoPE) used in most modern LLMs. Without this, 'the cat sat on the mat' and 'the mat sat on the cat' would be indistinguishable to the attention mechanism.",
      "A full transformer block wraps multi-head attention and a position-wise feed-forward network (usually two linear layers with a non-linearity, applied independently to each token) each in a residual connection followed by layer normalization. The residual connections are essential for training very deep transformer stacks (dozens of layers) since they let gradients flow directly to earlier layers, and layer norm stabilizes activation scales at each stage. The encoder-decoder variant additionally uses cross-attention in the decoder to attend over the encoder's output, while decoder-only models (GPT-style) use causal masking so each token can only attend to earlier tokens, enabling autoregressive generation.",
    ],
    example: {
      title: "Computing self-attention output for one token",
      steps: [
        "Sequence has 3 tokens with value vectors V = [[1,0],[0,1],[1,1]] and the query for token 'sat' produces raw similarity scores against all 3 keys: [2.0, 0.5, 1.0].",
        "Scale by sqrt(d_k), say d_k=4 so sqrt(4)=2: scaled scores = [1.0, 0.25, 0.5].",
        "Apply softmax: exp values ≈ [2.72, 1.28, 1.65], sum ≈ 5.65, weights ≈ [0.48, 0.23, 0.29].",
        "Multiply weights by value vectors: 0.48*[1,0] + 0.23*[0,1] + 0.29*[1,1] = [0.48+0.29, 0.23+0.29] = [0.77, 0.52].",
        "This output vector [0.77, 0.52] is the new context-aware representation for the 'sat' token at this layer, blending information mostly from token 1 and token 3.",
      ],
      result: "The token 'sat' ends up with a representation weighted 48% toward the first token's value, 23% toward the second, and 29% toward the third, reflecting learned relevance rather than raw position.",
    },
    mistakes: [
      { mistake: "Forgetting to scale dot products by sqrt(d_k) before softmax.", fix: "Always divide QK^T by sqrt(d_k); without it, large-magnitude dot products push softmax into near one-hot outputs and gradients vanish." },
      { mistake: "Omitting positional encodings and expecting the model to understand word order.", fix: "Add sinusoidal, learned, or rotary positional encodings, since raw self-attention treats input as an unordered set of tokens." },
      { mistake: "Using bidirectional (non-causal) attention in an autoregressive decoder, letting the model see future tokens during training.", fix: "Apply a causal mask so each position can only attend to itself and earlier positions when doing next-token prediction." },
      { mistake: "Treating multi-head attention as just 'more parameters' without understanding why heads help.", fix: "Recognize that each head learns a different projection subspace, allowing the model to attend to different types of relationships (syntax, position, semantics) in parallel." },
    ],
    interviewQA: [
      { q: "Explain the scaled dot-product attention formula and why the scaling factor is needed.", a: "Attention computes softmax(QK^T / sqrt(d_k)) V: query-key dot products measure relevance between tokens, softmax turns them into weights, and the weighted sum of value vectors is the output. The sqrt(d_k) scaling prevents dot products from growing too large in high dimensions, which would otherwise saturate the softmax and produce vanishing gradients." },
      { q: "Why do transformers need positional encodings if RNNs don't?", a: "RNNs process tokens sequentially so order is implicit in the computation itself, but self-attention computes relevance between all token pairs simultaneously and is permutation-invariant, so without explicit positional information the model cannot distinguish different orderings of the same set of tokens." },
      { q: "What is the difference between self-attention and cross-attention?", a: "Self-attention computes queries, keys, and values all from the same sequence, letting tokens attend to other tokens within that sequence. Cross-attention computes queries from one sequence (e.g., a decoder) and keys/values from a different sequence (e.g., an encoder's output), letting the decoder pull relevant information from the source sequence, as in machine translation." },
      { q: "Why is causal masking necessary in decoder-only (GPT-style) models?", a: "Causal masking prevents a token's attention from looking at future tokens by setting their attention scores to negative infinity before softmax, which is required for autoregressive next-token prediction so the model cannot 'cheat' by seeing the answer it's supposed to predict." },
    ],
    practice: [
      "Implement scaled dot-product attention and multi-head attention from scratch in NumPy or PyTorch.",
      "Manually compute attention weights for a 3-token toy sequence and verify they sum to 1.",
      "Implement a causal mask and verify that changing a future token doesn't affect earlier tokens' outputs.",
      "Visualize attention weight heatmaps for a sentence using a pretrained transformer (e.g., via HuggingFace's output_attentions).",
    ],
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
    deepDive: [
      "Transfer learning works because early and middle layers of a network trained on a large, diverse dataset (ImageNet for vision, a huge text corpus for language models) learn generic features — edges and textures in vision, or syntax and general semantics in language — that are useful across many downstream tasks, not specific to the original labels. Only the later layers tend to specialize toward the exact classes or objective of the original training task, which is why they are the ones typically replaced or most heavily adjusted.",
      "The classic decision matrix is based on two axes: how much labeled data you have for the new task, and how similar that task is to the original pretraining domain. Small and similar -> freeze most of the backbone and train only a new head, since there's little data to safely update deep weights without overfitting. Large and similar -> fine-tune more layers, since there's enough data to safely adjust deeper representations. Small and different -> this is the hardest case; freeze early layers (generic features) but retrain or fine-tune later layers carefully, often with strong regularization. Large and different -> fine-tune most or all of the network, sometimes just using the pretrained weights as a faster/better initialization than random.",
      "Full fine-tuning of very large models (billions of parameters, as in modern LLMs) is expensive in both compute and memory (storing optimizer states for every parameter). Parameter-efficient fine-tuning methods like LoRA (Low-Rank Adaptation) freeze the original weight matrices and inject small trainable low-rank matrices into specific layers (commonly attention projections), so only a tiny fraction of parameters (often <1%) are trained while the rest remain frozen. This dramatically cuts memory and storage requirements — you can store many task-specific LoRA adapters that are each just a few megabytes, swapping them in and out of the same frozen base model.",
      "A crucial practical detail is the learning rate: fine-tuning should use a much smaller learning rate than training from scratch (often 10x to 100x smaller), because the pretrained weights are already in a good region of the loss landscape and large updates would destroy that useful structure — this is sometimes called catastrophic forgetting when it happens severely enough that the model loses its original general capabilities.",
    ],
    example: {
      title: "Fine-tuning strategy decision for a medical image classifier",
      steps: [
        "Task: classify chest X-rays into 4 disease categories, with only 800 labeled images available.",
        "Step 1: choose a backbone pretrained on ImageNet (large, general dataset) since no medical-specific pretrained model of similar scale is available.",
        "Step 2: assess similarity — X-rays are visually quite different from ImageNet's natural photos, so this is a 'small dataset, different domain' case, the hardest quadrant.",
        "Step 3: freeze the first 70% of convolutional layers (generic edge/texture detectors likely still useful) and unfreeze the last 30% plus the new classification head.",
        "Step 4: train with a small learning rate (e.g., 1e-4) for the unfrozen layers and a slightly higher rate (e.g., 1e-3) for the newly initialized head.",
        "Step 5: monitor validation accuracy; if it plateaus or overfits quickly, freeze more layers or add stronger augmentation/regularization.",
      ],
      result: "The model reaches reasonable accuracy despite only 800 labeled images, because most of the low-level visual feature extraction is reused from ImageNet pretraining rather than learned from scratch.",
    },
    mistakes: [
      { mistake: "Using the same learning rate for fine-tuning as would be used for training from scratch.", fix: "Use a much smaller learning rate (often 10-100x smaller) for fine-tuning to avoid destroying useful pretrained weights (catastrophic forgetting)." },
      { mistake: "Fine-tuning the entire large backbone on a tiny dataset.", fix: "Freeze most of the backbone and train only a new head, or unfreeze just the last few layers, matching capacity to the amount of available data." },
      { mistake: "Using a pretrained model without matching its expected preprocessing (input size, normalization, tokenizer).", fix: "Always use the exact preprocessing/tokenization pipeline the pretrained model was trained with, since mismatches silently degrade performance." },
      { mistake: "Assuming LoRA or adapters always match full fine-tuning performance.", fix: "For very different domains or complex tasks, benchmark against full fine-tuning; LoRA is usually close but not always identical in quality." },
    ],
    interviewQA: [
      { q: "Why does transfer learning work — what makes pretrained features reusable?", a: "Early and middle layers of a network trained on a large diverse dataset learn generic, low-level to mid-level features (edges/textures in vision, syntax/semantics in language) that are broadly useful, while only the final layers tend to be highly specialized to the original task's exact labels, so replacing/retraining those final layers is often enough to adapt to a new task." },
      { q: "How do you decide how many layers to freeze when fine-tuning?", a: "It depends on dataset size and similarity to the pretraining domain: small and similar data means freeze most layers and only train a new head; large or very different data justifies unfreezing and fine-tuning more layers, since there's enough signal to safely update deeper representations without overfitting or catastrophic forgetting." },
      { q: "What is LoRA and why is it useful for fine-tuning large language models?", a: "LoRA freezes the pretrained weight matrices and injects small trainable low-rank matrices into specific layers, so only a tiny fraction of parameters need to be trained and stored, drastically reducing memory and compute cost while achieving performance close to full fine-tuning, and allowing many lightweight task-specific adapters to share one frozen base model." },
      { q: "What is catastrophic forgetting and how do you avoid it during fine-tuning?", a: "It's when fine-tuning on a new task causes the model to lose previously learned general capabilities, usually from too high a learning rate or too many training steps on narrow data; mitigations include using a small learning rate, freezing more layers, early stopping, or techniques like elastic weight consolidation." },
    ],
    practice: [
      "Fine-tune a pretrained ResNet or ViT on a small custom dataset using both feature extraction and full fine-tuning, and compare results.",
      "Implement LoRA fine-tuning on a small language model and compare parameter count and performance versus full fine-tuning.",
      "Experiment with freezing different numbers of layers on the same dataset and plot validation accuracy versus layers frozen.",
      "Fine-tune a pretrained BERT model for a text classification task using Hugging Face Transformers and Trainer.",
    ],
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
    deepDive: [
      "Choosing the right metric is the first and most consequential decision in evaluation: accuracy is misleading on imbalanced datasets (a 99%-negative dataset gets 99% accuracy by always predicting negative), so precision, recall, F1, and ROC-AUC/PR-AUC are usually more informative, and the right choice depends on the cost of false positives versus false negatives for the specific application (e.g., in medical screening, recall usually matters far more than precision).",
      "The classic train/validation/test split protects against two different failure modes: overfitting to the training data (caught by validation) and overfitting to your own modeling decisions through repeated tuning (caught by a test set that is touched only once at the very end). Leaking test data into any tuning decision — even indirectly, like selecting a preprocessing step because it happened to raise test accuracy — invalidates the test set as an honest estimate of generalization.",
      "Error analysis is the practice of actually reading a sample of the model's mistakes rather than staring only at aggregate metrics. Grouping errors by root cause (data quality issues, label noise, systematic confusion between specific classes, out-of-distribution inputs, genuinely ambiguous cases) tells you exactly where to invest effort next — more data, cleaner labels, a different architecture, or accepting an irreducible error floor. Andrew Ng's guidance to spend an hour manually reviewing 100 errors before deciding what to build next is a widely cited practical heuristic for exactly this reason.",
      "Aggregate metrics also hide performance disparities across subgroups or slices of the data (by demographic, by input length, by class rarity), which matters both for fairness and for catching brittle failure modes that a single global number would never reveal. Calibration — whether a model's predicted probability of 80% actually corresponds to being correct 80% of the time — is a separate concern from raw accuracy and matters a lot whenever downstream decisions rely on the confidence score itself, not just the top prediction.",
    ],
    example: {
      title: "Running an error analysis session on a spam classifier",
      steps: [
        "Model achieves 96% accuracy on the test set overall, but the team wants to know where the remaining 4% comes from.",
        "Sample 100 misclassified emails at random from the validation set for manual review.",
        "Categorize each error: 38 are legitimate marketing emails wrongly flagged as spam, 30 are spam emails using new obfuscation tricks not seen in training, 20 have incorrect ground-truth labels, 12 are genuinely ambiguous borderline cases.",
        "Notice the 38 marketing-email false positives is the largest bucket — check if the training data underrepresents legitimate marketing emails.",
        "Decide to add more legitimate marketing emails to training data and re-check precision/recall specifically on that subgroup after retraining.",
        "After the fix, re-run the same 100-example error sample to verify the marketing-email false-positive bucket has shrunk.",
      ],
      result: "Rather than blindly trying new architectures, the team identified that a data imbalance (underrepresented legitimate marketing emails) was the single largest error source, and targeted data collection fixed the biggest chunk of errors.",
    },
    mistakes: [
      { mistake: "Using accuracy as the sole metric on an imbalanced dataset.", fix: "Use precision, recall, F1, or PR-AUC, and choose the metric based on the real-world cost of false positives versus false negatives." },
      { mistake: "Tuning hyperparameters or model choices based on test set performance.", fix: "Tune only on the validation set; touch the test set exactly once at the very end to get an honest estimate of generalization." },
      { mistake: "Only looking at the final aggregate score and never reading individual misclassified examples.", fix: "Manually review a sample of errors, categorize root causes, and prioritize fixes based on the largest error buckets." },
      { mistake: "Reporting a strong-looking accuracy without a baseline for comparison.", fix: "Always compare against a trivial baseline (majority class, simple heuristic) or human-level performance to know if the number is actually good." },
    ],
    interviewQA: [
      { q: "Why is accuracy often a misleading metric, and what would you use instead?", a: "On imbalanced datasets, a model can achieve high accuracy simply by always predicting the majority class, which is useless in practice. Precision, recall, F1-score, and PR-AUC better reflect performance on the minority/important class, and the right choice depends on whether false positives or false negatives are more costly for the specific application." },
      { q: "Why do we need a separate validation set and test set instead of just one held-out set?", a: "The validation set is used repeatedly during model development to tune hyperparameters and make design decisions, which means the model implicitly 'sees' and adapts to it over many iterations. The test set is touched only once at the very end to give an unbiased estimate of how the model will perform on truly unseen data, avoiding leakage from repeated tuning decisions." },
      { q: "Walk me through how you would perform error analysis on a failing model.", a: "I would sample a meaningful number of misclassified examples (e.g., 100), manually review each one, and bucket them by root cause — data quality issues, label noise, systematic class confusion, out-of-distribution inputs, or genuinely hard/ambiguous cases — then prioritize whichever bucket is largest, since that tells you exactly where effort (more data, cleaner labels, model changes) will have the biggest impact." },
      { q: "What is model calibration and why does it matter beyond accuracy?", a: "Calibration measures whether predicted confidence scores match true likelihoods — e.g., among all predictions made with 80% confidence, roughly 80% should actually be correct. It matters whenever downstream systems use the probability itself for decision-making (like thresholding or risk scoring), since a model can have high accuracy but be badly overconfident or underconfident." },
    ],
    practice: [
      "Compute precision, recall, F1, and confusion matrix for a classifier on an imbalanced dataset and compare with raw accuracy.",
      "Manually review 50 misclassified examples from a model you've trained and categorize the failure causes into buckets.",
      "Plot a calibration curve (reliability diagram) for a trained classifier's predicted probabilities.",
      "Evaluate a model's performance separately on different data slices (e.g., by class, by input length) and identify any subgroup where it underperforms.",
    ],
  },
};
