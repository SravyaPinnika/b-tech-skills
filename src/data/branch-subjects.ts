import type { BranchId } from "./branches";

export type SubjectDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface BranchSubject {
  name: string;
  description: string;
  topics: string[];
  difficulty: SubjectDifficulty;
  /** Related catalogue course for the "View Course" button (optional). */
  courseSlug?: string | undefined;
}

const S = (
  name: string,
  description: string,
  topics: string[],
  difficulty: SubjectDifficulty,
  courseSlug?: string,
): BranchSubject => ({ name, description, topics, difficulty, courseSlug });

export const BRANCH_SUBJECTS: Record<BranchId, BranchSubject[]> = {
  cse: [
    S("Programming in C / C++", "Problem solving with C and C++, from pointers and memory to STL containers used in interviews.", ["Pointers & memory", "STL containers", "File handling", "OOP in C++"], "Beginner", "core-programming-languages"),
    S("Data Structures", "Arrays, linked lists, trees, heaps and hash tables — the core of every coding round.", ["Linked lists", "Trees & BST", "Heaps", "Hashing"], "Intermediate", "data-structures-algorithms-dsa"),
    S("Algorithms", "Sorting, searching, greedy, dynamic programming and graph algorithms with complexity analysis.", ["Sorting & searching", "Dynamic programming", "Graph algorithms", "Greedy methods"], "Intermediate", "data-structures-algorithms-dsa"),
    S("Database Management Systems", "Relational design, SQL, normalisation, transactions and indexing used in real systems.", ["ER modelling", "SQL joins & subqueries", "Normalisation", "Transactions & ACID"], "Intermediate", "dbms-sql"),
    S("Operating Systems", "Processes, threads, memory management and deadlocks — a must-answer interview subject.", ["Process scheduling", "Synchronisation", "Deadlocks", "Virtual memory"], "Intermediate", "operating-systems"),
    S("Computer Networks", "OSI/TCP-IP, routing, TCP vs UDP and HTTP — the backbone of system interviews.", ["OSI & TCP/IP models", "TCP vs UDP", "DNS & HTTP", "IP addressing"], "Intermediate", "computer-networks"),
    S("Object-Oriented Programming", "Classes, inheritance, polymorphism and design principles for clean, testable code.", ["Encapsulation", "Inheritance", "Polymorphism", "SOLID basics"], "Beginner", "object-oriented-programming"),
    S("Software Engineering", "SDLC models, requirements, testing strategies and agile delivery used in industry.", ["SDLC models", "Agile & Scrum", "Testing levels", "UML diagrams"], "Beginner", "project-development"),
    S("Computer Organization", "How CPUs execute instructions: datapath, pipelining, cache and memory hierarchy.", ["Instruction cycles", "Pipelining", "Cache memory", "I/O organisation"], "Advanced", "operating-systems"),
    S("Theory of Computation", "Automata, grammars and Turing machines — the theory behind compilers and parsing.", ["DFA & NFA", "Regular expressions", "Context-free grammars", "Turing machines"], "Advanced", "aptitude-reasoning"),
  ],
  it: [
    S("Programming Fundamentals", "Core programming logic in C/Java — variables, control flow, functions and arrays.", ["Control flow", "Functions", "Arrays & strings", "Recursion basics"], "Beginner", "core-programming-languages"),
    S("Data Structures", "Everyday structures for application development: lists, stacks, queues, trees and maps.", ["Stacks & queues", "Trees", "Hash maps", "Complexity basics"], "Intermediate", "data-structures-algorithms-dsa"),
    S("Database Management Systems", "Designing schemas and writing SQL that powers business applications.", ["Schema design", "SQL queries", "Joins & aggregation", "Indexing basics"], "Intermediate", "dbms-sql"),
    S("Web Technologies", "HTML, CSS, JavaScript and frameworks to build and ship modern web apps.", ["HTML & CSS", "JavaScript & DOM", "React basics", "REST APIs"], "Beginner", "web-development"),
    S("Computer Networks", "Networking essentials for deploying and troubleshooting connected applications.", ["TCP/IP suite", "HTTP/HTTPS", "Sockets basics", "Network security intro"], "Intermediate", "computer-networks"),
    S("Operating Systems", "How operating systems schedule work, manage memory and handle files.", ["Processes & threads", "Memory management", "File systems", "Linux commands"], "Intermediate", "operating-systems"),
    S("Software Engineering", "From requirements to release: models, documentation, testing and maintenance.", ["Requirement analysis", "Design patterns intro", "Testing & QA", "DevOps culture"], "Beginner", "project-development"),
    S("Cloud Computing", "Virtualisation, IaaS/PaaS/SaaS and deploying apps on AWS or Azure.", ["Service models", "Virtual machines", "Storage services", "Deployment basics"], "Intermediate", "devops-cloud"),
    S("Cybersecurity", "Security principles, common attacks and how to defend applications and data.", ["OWASP Top 10", "Encryption basics", "Authentication", "Network defence"], "Intermediate", "devops-cloud"),
    S("Data Analytics", "Turning raw data into dashboards and decisions with SQL and BI tools.", ["Data cleaning", "SQL analytics", "Dashboards", "Excel/Power BI"], "Beginner", "dbms-sql"),
  ],
  aiml: [
    S("Python Programming", "Python for AI: data types, functions, NumPy and Pandas for everyday modelling work.", ["Python basics", "NumPy arrays", "Pandas DataFrames", "Virtual environments"], "Beginner", "core-programming-languages"),
    S("Data Structures", "The structures and algorithms you need to clear ML engineer coding rounds.", ["Arrays & strings", "Hashing", "Trees & graphs", "Complexity analysis"], "Intermediate", "data-structures-algorithms-dsa"),
    S("Mathematics for AI", "Linear algebra and calculus intuitions behind every ML model.", ["Vectors & matrices", "Eigenvalues", "Derivatives & gradients", "Optimisation basics"], "Intermediate", "ai-ml-llm-generative-ai"),
    S("Probability and Statistics", "Distributions, hypothesis testing and Bayes' theorem for data-driven decisions.", ["Probability rules", "Distributions", "Bayes' theorem", "Hypothesis testing"], "Intermediate", "ai-ml-llm-generative-ai"),
    S("Machine Learning", "Regression, classification, clustering and model evaluation with scikit-learn.", ["Supervised learning", "Unsupervised learning", "Model evaluation", "Feature engineering"], "Intermediate", "ai-ml-llm-generative-ai"),
    S("Deep Learning", "Neural networks, backpropagation and modern architectures in PyTorch/TensorFlow.", ["Perceptrons & MLPs", "Backpropagation", "CNNs", "RNNs & LSTMs"], "Advanced", "ai-ml-llm-generative-ai"),
    S("Natural Language Processing", "Tokenisation, embeddings and transformers for text understanding and generation.", ["Tokenisation", "Word embeddings", "Transformers", "Text classification"], "Advanced", "ai-ml-llm-generative-ai"),
    S("Computer Vision", "Image classification, object detection and segmentation with CNNs.", ["Image preprocessing", "CNN architectures", "Object detection", "Transfer learning"], "Advanced", "ai-ml-llm-generative-ai"),
    S("Reinforcement Learning", "Agents, rewards, Q-learning and policy gradients for sequential decisions.", ["Markov decision processes", "Q-learning", "Policy gradients", "Exploration vs exploitation"], "Advanced", "ai-ml-llm-generative-ai"),
    S("AI Ethics", "Bias, fairness, privacy and responsible deployment of AI systems.", ["Bias & fairness", "Data privacy", "Explainability", "Responsible AI"], "Beginner", "english-communication"),
  ],
  "ai-ds": [
    S("Python Programming", "Python and its data stack — NumPy, Pandas and Matplotlib — for analysis work.", ["Python basics", "NumPy & Pandas", "Data visualisation", "Jupyter notebooks"], "Beginner", "core-programming-languages"),
    S("Statistics and Probability", "The statistical foundation for experiments, inference and confident decisions.", ["Descriptive statistics", "Probability distributions", "Sampling", "Hypothesis testing"], "Intermediate", "ai-ml-llm-generative-ai"),
    S("Data Structures", "Coding-round structures with a data-processing flavour.", ["Arrays & strings", "Hashing", "Sorting", "Time complexity"], "Intermediate", "data-structures-algorithms-dsa"),
    S("Database Management", "Storing and querying structured data with SQL at production scale.", ["Relational design", "Complex SQL", "Window functions", "Indexing"], "Intermediate", "dbms-sql"),
    S("Data Analytics", "Exploratory analysis, KPIs and storytelling that answers business questions.", ["EDA workflow", "KPI design", "Cohort analysis", "A/B testing basics"], "Beginner", "ai-ml-llm-generative-ai"),
    S("Machine Learning", "Predictive modelling from regression to ensemble methods.", ["Regression", "Classification", "Ensembles", "Model tuning"], "Intermediate", "ai-ml-llm-generative-ai"),
    S("Deep Learning", "Neural networks for images, text and tabular data.", ["MLPs", "CNNs", "RNNs", "Regularisation"], "Advanced", "ai-ml-llm-generative-ai"),
    S("Big Data Analytics", "Hadoop and Spark patterns for datasets that don't fit on one machine.", ["HDFS basics", "MapReduce", "Spark DataFrames", "Partitioning"], "Advanced", "dbms-sql"),
    S("Data Visualization", "Charts and dashboards in Power BI/Tableau that make findings obvious.", ["Chart selection", "Dashboard design", "Power BI", "Storytelling"], "Beginner", "project-development"),
    S("Natural Language Processing", "Text analytics from cleaning to sentiment and topic modelling.", ["Text preprocessing", "Sentiment analysis", "Topic modelling", "Embeddings"], "Advanced", "ai-ml-llm-generative-ai"),
  ],
  "cse-ds": [
    S("Programming for Data Science", "Python and Java programming with a focus on data manipulation workflows.", ["Python fundamentals", "Pandas pipelines", "Clean code", "Version control"], "Beginner", "core-programming-languages"),
    S("Statistics", "Core statistics for modelling, experiments and data interpretation.", ["Central tendency", "Correlation & regression", "Inference", "Bayesian thinking"], "Intermediate", "ai-ml-llm-generative-ai"),
    S("Data Structures", "Full CS data-structures depth for product-company coding rounds.", ["Trees & graphs", "Hashing", "Heaps", "Dynamic programming intro"], "Intermediate", "data-structures-algorithms-dsa"),
    S("Database Management", "SQL mastery plus NoSQL and data-warehouse concepts.", ["Advanced SQL", "NoSQL basics", "Data warehousing", "Star schema"], "Intermediate", "dbms-sql"),
    S("Data Mining", "Finding patterns in large datasets: association rules, clustering and classification.", ["Apriori algorithm", "Clustering", "Classification", "Anomaly detection"], "Intermediate", "ai-ml-llm-generative-ai"),
    S("Machine Learning", "End-to-end ML from feature engineering to deployed models.", ["Feature engineering", "Model selection", "Cross-validation", "Pipelines"], "Intermediate", "ai-ml-llm-generative-ai"),
    S("Big Data Technologies", "Spark, Hadoop and streaming systems for large-scale processing.", ["Spark core", "Spark SQL", "Streaming basics", "Cluster computing"], "Advanced", "dbms-sql"),
    S("Data Visualization", "Visual analytics with matplotlib, seaborn and BI dashboards.", ["Seaborn & matplotlib", "Dashboards", "Visual encoding", "Reporting"], "Beginner", "project-development"),
    S("Predictive Analytics", "Forecasting and scoring models applied to business problems.", ["Time series", "Forecasting", "Churn modelling", "Model monitoring"], "Advanced", "ai-ml-llm-generative-ai"),
    S("Cloud Computing", "Running data pipelines and models on cloud platforms.", ["Cloud storage", "Serverless pipelines", "Managed ML services", "Cost basics"], "Intermediate", "devops-cloud"),
  ],
  "cse-cyber": [
    S("Computer Networks", "Deep networking knowledge — packets, protocols and traffic analysis.", ["Packet structure", "Wireshark analysis", "Routing & switching", "VPNs & tunnelling"], "Intermediate", "computer-networks"),
    S("Operating Systems", "Linux internals, permissions and process management for security work.", ["Linux administration", "File permissions", "Process management", "Logging"], "Intermediate", "operating-systems"),
    S("Cryptography", "Encryption, hashing and public-key systems that secure modern communication.", ["Symmetric ciphers", "RSA & ECC", "Hashing", "TLS/SSL"], "Advanced", "computer-networks"),
    S("Network Security", "Firewalls, IDS/IPS and securing enterprise networks end to end.", ["Firewalls", "IDS/IPS", "Network segmentation", "Zero trust"], "Intermediate", "computer-networks"),
    S("Ethical Hacking", "Authorised penetration testing: recon, exploitation and reporting.", ["Reconnaissance", "Scanning & enumeration", "Exploitation basics", "Reporting"], "Advanced", "computer-networks"),
    S("Cyber Forensics", "Collecting and analysing digital evidence from disks, memory and networks.", ["Disk forensics", "Memory analysis", "Log investigation", "Chain of custody"], "Advanced", "operating-systems"),
    S("Web Application Security", "OWASP Top 10 vulnerabilities and how to find and fix them.", ["SQL injection", "XSS & CSRF", "Burp Suite", "Secure coding"], "Intermediate", "web-development"),
    S("Malware Analysis", "Static and dynamic analysis of malicious binaries in sandboxes.", ["Static analysis", "Dynamic analysis", "Sandboxing", "Indicators of compromise"], "Advanced", "operating-systems"),
    S("Cloud Security", "Securing AWS/Azure workloads, IAM and misconfiguration hunting.", ["IAM policies", "Cloud misconfigurations", "Container security", "Compliance basics"], "Intermediate", "devops-cloud"),
    S("Cybersecurity Management", "Governance, risk, compliance and security operations (SOC) processes.", ["Risk assessment", "ISO 27001 basics", "Incident response", "SOC workflows"], "Beginner", "interview-placement-preparation"),
  ],
  "cse-iot": [
    S("Embedded Systems", "Programming hardware at the register level with embedded C.", ["Embedded C", "Interrupts & timers", "Memory-mapped I/O", "Debugging"], "Intermediate", "core-programming-languages"),
    S("Sensors and Actuators", "Interfacing temperature, motion and distance sensors with real circuits.", ["Analog & digital sensors", "ADC conversion", "Motor drivers", "Calibration"], "Beginner", "project-development"),
    S("Microcontrollers", "Arduino and ESP32 programming for connected devices.", ["Arduino IDE", "GPIO programming", "ESP32 Wi-Fi", "Power management"], "Beginner", "core-programming-languages"),
    S("Computer Networks", "Networking fundamentals that device communication is built on.", ["TCP/IP basics", "Sockets", "Network topologies", "Packet flow"], "Intermediate", "computer-networks"),
    S("Internet of Things", "IoT architecture from device to cloud: protocols, platforms and pipelines.", ["IoT architecture", "MQTT & CoAP", "Device provisioning", "Data pipelines"], "Intermediate", "project-development"),
    S("Wireless Communication", "Wi-Fi, Bluetooth, LoRa and cellular options for IoT connectivity.", ["Wi-Fi & BLE", "LoRaWAN", "NB-IoT", "Range vs power trade-offs"], "Intermediate", "computer-networks"),
    S("Cloud Computing", "Connecting fleets of devices to AWS IoT or Azure IoT Hub.", ["IoT Hub setup", "Device shadows", "Rules engine", "Dashboards"], "Intermediate", "devops-cloud"),
    S("IoT Security", "Threats to connected devices and how to harden them.", ["Device authentication", "Firmware security", "Encrypted communication", "OTA updates"], "Advanced", "devops-cloud"),
    S("Edge Computing", "Processing data on the device or gateway instead of the cloud.", ["Edge vs cloud", "TinyML basics", "Gateways", "Latency optimisation"], "Advanced", "devops-cloud"),
    S("IoT Applications", "End-to-end projects: smart home, agriculture and industrial monitoring.", ["Smart home build", "Sensor dashboards", "Alerting systems", "Deployment"], "Intermediate", "project-development"),
  ],
  ece: [
    S("Electronic Devices", "Diodes, BJTs and MOSFETs — the physics behind every circuit.", ["PN junctions", "BJT operation", "MOSFET characteristics", "Biasing"], "Beginner", "core-programming-languages"),
    S("Analog Circuits", "Amplifiers, filters and op-amps analysed and designed from scratch.", ["Op-amp circuits", "Amplifiers", "Filters", "Feedback"], "Intermediate", "core-programming-languages"),
    S("Digital Electronics", "Logic gates, flip-flops and sequential design — the base of VLSI.", ["Boolean algebra", "Combinational logic", "Flip-flops", "Counters & registers"], "Beginner", "core-programming-languages"),
    S("Signals and Systems", "Continuous and discrete signals, transforms and system analysis.", ["Fourier series", "Laplace transform", "Z-transform", "LTI systems"], "Intermediate", "aptitude-reasoning"),
    S("Communication Systems", "Analog and digital modulation for transmitting information reliably.", ["AM/FM modulation", "Digital modulation", "Channel capacity", "Noise analysis"], "Intermediate", "computer-networks"),
    S("Microprocessors", "8085/8086 architecture, assembly programming and interfacing.", ["8086 architecture", "Assembly language", "Memory interfacing", "Peripheral chips"], "Intermediate", "core-programming-languages"),
    S("Embedded Systems", "Microcontroller programming for real-time products.", ["ARM basics", "Embedded C", "RTOS concepts", "Interfacing projects"], "Intermediate", "core-programming-languages"),
    S("VLSI Design", "From RTL to layout: Verilog, synthesis and physical design flow.", ["Verilog HDL", "RTL design", "Synthesis", "Timing analysis"], "Advanced", "core-programming-languages"),
    S("Digital Signal Processing", "Filtering and analysing signals with DFT, FFT and digital filter design.", ["DFT & FFT", "FIR/IIR filters", "Sampling theorem", "MATLAB practice"], "Advanced", "aptitude-reasoning"),
    S("Antennas and Wave Propagation", "Radiation principles, antenna parameters and link budgets.", ["Radiation patterns", "Antenna gain", "Wave propagation", "Link budget"], "Advanced", "aptitude-reasoning"),
  ],
  eee: [
    S("Electrical Circuits", "Circuit laws, network theorems and transient analysis.", ["KVL & KCL", "Network theorems", "AC circuits", "Transients"], "Beginner", "aptitude-reasoning"),
    S("Electrical Machines", "Transformers, DC machines and induction motors — construction to characteristics.", ["Transformers", "DC motors", "Induction motors", "Synchronous machines"], "Intermediate", "aptitude-reasoning"),
    S("Power Systems", "Generation, transmission and distribution of electrical power.", ["Generation methods", "Transmission lines", "Load flow", "Fault analysis"], "Intermediate", "aptitude-reasoning"),
    S("Control Systems", "Feedback, stability and controllers modelled with transfer functions.", ["Transfer functions", "Time response", "Stability (Routh/Nyquist)", "PID controllers"], "Intermediate", "aptitude-reasoning"),
    S("Power Electronics", "Converters, inverters and choppers that drive modern industry.", ["Rectifiers", "DC-DC converters", "Inverters", "PWM techniques"], "Advanced", "aptitude-reasoning"),
    S("Electrical Measurements", "Instruments and transducers for measuring electrical quantities accurately.", ["Measuring instruments", "Bridges", "Transducers", "Error analysis"], "Beginner", "aptitude-reasoning"),
    S("Digital Electronics", "Logic design fundamentals that lead into embedded and automation work.", ["Logic gates", "Sequential circuits", "ADCs & DACs", "PLCs intro"], "Beginner", "core-programming-languages"),
    S("Renewable Energy Systems", "Solar, wind and hybrid generation with grid integration.", ["Solar PV systems", "Wind turbines", "MPPT", "Grid integration"], "Intermediate", "project-development"),
    S("Electrical Drives", "Motor speed control for industrial automation applications.", ["DC drives", "AC drives", "VFDs", "Braking methods"], "Advanced", "aptitude-reasoning"),
    S("Power System Protection", "Relays, circuit breakers and protection schemes that keep grids safe.", ["Protective relays", "Circuit breakers", "Earthing", "Protection coordination"], "Advanced", "aptitude-reasoning"),
  ],
  mech: [
    S("Engineering Mechanics", "Statics and dynamics — forces, equilibrium and motion of rigid bodies.", ["Free body diagrams", "Equilibrium", "Friction", "Kinematics"], "Beginner", "aptitude-reasoning"),
    S("Thermodynamics", "Energy, entropy and cycles powering engines, turbines and refrigeration.", ["Laws of thermodynamics", "Entropy", "Rankine & Otto cycles", "Refrigeration"], "Intermediate", "aptitude-reasoning"),
    S("Fluid Mechanics", "Behaviour of fluids at rest and in motion, with real flow applications.", ["Fluid properties", "Bernoulli's equation", "Pipe flow", "Pumps & turbines"], "Intermediate", "aptitude-reasoning"),
    S("Strength of Materials", "Stress, strain and deflection analysis for safe mechanical design.", ["Stress-strain curves", "Bending & torsion", "Deflection", "Failure theories"], "Intermediate", "aptitude-reasoning"),
    S("Manufacturing Processes", "Casting, machining, welding and modern additive manufacturing.", ["Casting", "Machining operations", "Welding", "3D printing"], "Beginner", "project-development"),
    S("Machine Design", "Designing shafts, gears, bearings and joints against failure.", ["Design for static load", "Fatigue design", "Gears & bearings", "Bolted joints"], "Advanced", "aptitude-reasoning"),
    S("Theory of Machines", "Kinematics and dynamics of mechanisms, cams, gears and balancing.", ["Mechanisms", "Velocity analysis", "Cams", "Balancing & vibration"], "Intermediate", "aptitude-reasoning"),
    S("Heat Transfer", "Conduction, convection and radiation with heat-exchanger design.", ["Conduction", "Convection", "Radiation", "Heat exchangers"], "Intermediate", "aptitude-reasoning"),
    S("CAD/CAM", "Computer-aided design and manufacturing with SolidWorks and CNC programming.", ["2D drafting", "3D modelling", "Assembly design", "CNC basics"], "Beginner", "project-development"),
    S("Industrial Engineering", "Optimising production: work study, quality control and operations management.", ["Work study", "Plant layout", "Quality tools", "Lean manufacturing"], "Beginner", "interview-placement-preparation"),
  ],
  civil: [
    S("Engineering Mechanics", "Forces, equilibrium and structural behaviour fundamentals.", ["Force systems", "Equilibrium", "Centroid & moment of inertia", "Trusses"], "Beginner", "aptitude-reasoning"),
    S("Strength of Materials", "How materials carry loads: stress, strain, bending and shear.", ["Bending stress", "Shear force diagrams", "Columns", "Deflection"], "Intermediate", "aptitude-reasoning"),
    S("Structural Analysis", "Analysing beams, frames and trusses for forces and displacements.", ["Influence lines", "Moment distribution", "Slope deflection", "Matrix methods"], "Advanced", "aptitude-reasoning"),
    S("RCC Design", "Reinforced concrete design of beams, slabs, columns and footings per IS 456.", ["Limit state design", "Beam design", "Slab design", "Column design"], "Advanced", "project-development"),
    S("Steel Structures", "Design of tension, compression and flexural steel members and connections.", ["Tension members", "Compression members", "Beam design", "Connections"], "Advanced", "project-development"),
    S("Geotechnical Engineering", "Soil mechanics: properties, compaction, bearing capacity and foundations.", ["Soil classification", "Compaction", "Bearing capacity", "Foundation types"], "Intermediate", "aptitude-reasoning"),
    S("Surveying", "Measuring land with chain, theodolite, levelling and total station.", ["Chain surveying", "Levelling", "Theodolite", "Total station & GPS"], "Beginner", "project-development"),
    S("Transportation Engineering", "Highway and pavement design, traffic engineering and railways.", ["Highway alignment", "Pavement design", "Traffic studies", "Railway basics"], "Intermediate", "aptitude-reasoning"),
    S("Environmental Engineering", "Water supply, wastewater treatment and solid-waste management.", ["Water treatment", "Sewage treatment", "Air pollution", "Solid waste"], "Beginner", "aptitude-reasoning"),
    S("Construction Management", "Planning, scheduling and costing construction projects professionally.", ["CPM & PERT", "Estimation", "Contracts", "Safety management"], "Intermediate", "interview-placement-preparation"),
  ],
  chemical: [
    S("Chemical Process Calculations", "Material and energy balances — the accounting of every chemical plant.", ["Units & conversions", "Material balance", "Energy balance", "Recycle streams"], "Beginner", "aptitude-reasoning"),
    S("Fluid Mechanics", "Flow of fluids through pipes, pumps and process equipment.", ["Flow regimes", "Pressure drop", "Pumps & compressors", "Flow measurement"], "Intermediate", "aptitude-reasoning"),
    S("Heat Transfer", "Heat exchangers, evaporation and insulation design for processes.", ["Conduction & convection", "Heat exchangers", "Evaporators", "LMTD method"], "Intermediate", "aptitude-reasoning"),
    S("Mass Transfer", "Distillation, absorption and extraction — separation processes that define the field.", ["Diffusion", "Distillation", "Absorption", "Drying"], "Advanced", "aptitude-reasoning"),
    S("Thermodynamics", "Chemical thermodynamics: phase equilibria, fugacity and reaction equilibria.", ["Laws & properties", "Phase equilibria", "VLE", "Reaction equilibria"], "Intermediate", "aptitude-reasoning"),
    S("Chemical Reaction Engineering", "Reactor design and kinetics for batch, CSTR and plug-flow systems.", ["Rate laws", "Ideal reactors", "Reactor sizing", "Catalysis"], "Advanced", "aptitude-reasoning"),
    S("Process Control", "Instrumentation and control loops keeping plants stable and safe.", ["Sensors & transmitters", "Feedback control", "PID tuning", "Control valves"], "Intermediate", "aptitude-reasoning"),
    S("Process Design", "Designing equipment and flowsheets with simulation tools.", ["Equipment sizing", "P&IDs", "Aspen simulation", "Economics"], "Advanced", "project-development"),
    S("Industrial Chemistry", "Large-scale production of fertilisers, polymers, petroleum and specialty chemicals.", ["Fertiliser industry", "Petroleum refining", "Polymers", "Petrochemicals"], "Beginner", "project-development"),
    S("Plant Design", "Plant layout, safety analysis and project economics for new facilities.", ["Plant layout", "HAZOP", "Cost estimation", "Safety codes"], "Advanced", "project-development"),
  ],
  quantum: [
    S("Quantum Mechanics Basics", "Wave functions, measurement and superposition — the physics under quantum computing.", ["Wave-particle duality", "Superposition", "Measurement", "Uncertainty principle"], "Intermediate", "ai-ml-llm-generative-ai"),
    S("Linear Algebra for Quantum Computing", "Vectors, matrices and tensor products in the language of quantum states.", ["Hilbert spaces", "Unitary matrices", "Tensor products", "Eigenvalues"], "Intermediate", "ai-ml-llm-generative-ai"),
    S("Quantum Bits (Qubits)", "How qubits differ from classical bits: Bloch sphere, basis states and phase.", ["Bloch sphere", "Basis states", "Phase", "Multi-qubit states"], "Beginner", "ai-ml-llm-generative-ai"),
    S("Quantum Gates", "Single and multi-qubit gates — Pauli, Hadamard, CNOT — as unitary operations.", ["Pauli gates", "Hadamard gate", "CNOT", "Gate composition"], "Beginner", "ai-ml-llm-generative-ai"),
    S("Quantum Circuits", "Building and reading circuits that combine gates into computations.", ["Circuit notation", "Entanglement circuits", "Measurement in circuits", "Circuit depth"], "Intermediate", "ai-ml-llm-generative-ai"),
    S("Quantum Algorithms", "Grover's search, Shor's factoring and variational algorithms step by step.", ["Deutsch-Jozsa", "Grover's algorithm", "Shor's algorithm", "VQE & QAOA"], "Advanced", "ai-ml-llm-generative-ai"),
    S("Quantum Cryptography", "Quantum key distribution and why quantum computers threaten classical crypto.", ["BB84 protocol", "Quantum key distribution", "Post-quantum crypto", "No-cloning theorem"], "Advanced", "computer-networks"),
    S("Quantum Programming", "Hands-on programming with Qiskit, Cirq and PennyLane on simulators and real hardware.", ["Qiskit basics", "Building circuits in code", "Running on simulators", "PennyLane intro"], "Beginner", "core-programming-languages"),
    S("Quantum Error Correction", "Why qubits decohere and how error-correcting codes protect computations.", ["Decoherence", "Bit-flip code", "Surface codes intro", "Fault tolerance"], "Advanced", "ai-ml-llm-generative-ai"),
    S("Quantum Applications", "Where quantum helps: chemistry simulation, optimisation and quantum machine learning.", ["Quantum chemistry", "Optimisation problems", "Quantum ML", "Industry use cases"], "Intermediate", "project-development"),
  ],
};

/**
 * A subject may only link straight into a catalogue course when the course
 * really teaches that subject. Anything else would open an unrelated course,
 * so those subjects fall back to the branch course listing instead.
 */
const EXACT_COURSE_MATCH: Record<string, string> = {
  "core-programming-languages": "Programming in C / C++|Programming Fundamentals|Python Programming|Programming for Data Science",
  "data-structures-algorithms-dsa": "Data Structures|Algorithms",
  "dbms-sql": "Database Management Systems|Database Management",
  "operating-systems": "Operating Systems",
  "computer-networks": "Computer Networks",
  "object-oriented-programming": "Object-Oriented Programming",
  "web-development": "Web Technologies",
  "devops-cloud": "Cloud Computing",
  "ai-ml-llm-generative-ai":
    "Machine Learning|Deep Learning|Natural Language Processing|Computer Vision|Reinforcement Learning",
};

for (const subjects of Object.values(BRANCH_SUBJECTS)) {
  for (const subject of subjects) {
    if (!subject.courseSlug) continue;
    const allowed = EXACT_COURSE_MATCH[subject.courseSlug]?.split("|") ?? [];
    if (!allowed.includes(subject.name)) subject.courseSlug = undefined;
  }
}

export function subjectsForBranch(selection: BranchId | "all") {
  if (selection === "all") return null;
  return BRANCH_SUBJECTS[selection] ?? [];
}
