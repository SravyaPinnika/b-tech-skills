import type { BranchId } from "./branches";

export interface SkillDemand {
  /** Skill name as recruiters describe it. */
  skill: string;
  /** Share of job requirements for this branch that ask for the skill. */
  percent: number;
  /** Why companies ask for it. */
  why: string;
}

const D = (skill: string, percent: number, why: string): SkillDemand => ({ skill, percent, why });

/**
 * How often each skill appears in company requirements for a branch.
 * Sorted highest demand first so students see the priority order.
 */
export const BRANCH_SKILL_DEMAND: Record<BranchId, SkillDemand[]> = {
  cse: [
    D("Data Structures & Algorithms", 95, "Every coding round and online assessment filters on it first."),
    D("One core language (C++/Java/Python)", 88, "Panels probe language internals once your solution works."),
    D("DBMS & SQL", 82, "Asked in coding rounds, core rounds and analytics rounds alike."),
    D("Operating Systems", 72, "Standard core-subject round at product and service companies."),
    D("Computer Networks", 66, "Backend and system rounds expect request-flow reasoning."),
    D("OOP & Low-level design", 64, "Design a small system with clean classes."),
    D("Full-stack project work", 58, "A deployed project gives the interviewer something concrete."),
    D("Git & Linux basics", 45, "Assumed on day one of any dev job."),
    D("Cloud & DevOps exposure", 38, "Upgrades an offer rather than deciding it."),
    D("Aptitude & communication", 85, "First elimination in mass recruitment, last round in every drive."),
  ],
  it: [
    D("Programming fundamentals", 90, "Baseline screening for every IT services role."),
    D("DBMS & SQL", 85, "Business applications are database-first."),
    D("Data Structures & Algorithms", 80, "Coding assessments still gate the interview."),
    D("Web technologies (HTML/CSS/JS/React)", 76, "Most IT delivery work is web application work."),
    D("Aptitude & communication", 88, "Service companies weigh these as heavily as coding."),
    D("Operating Systems & Linux", 62, "Support, deployment and troubleshooting duties."),
    D("Computer Networks", 58, "Needed for integration and infrastructure teams."),
    D("Cloud (AWS/Azure) basics", 55, "Client projects are cloud-hosted by default."),
    D("Cybersecurity awareness", 48, "Mandatory training topic, often asked in interviews."),
    D("Data analytics & BI tools", 44, "Reporting work sits inside most delivery teams."),
  ],
  aiml: [
    D("Python & data stack", 94, "Every AI/ML task starts in Python with NumPy and Pandas."),
    D("Machine Learning fundamentals", 90, "Panels test bias-variance, evaluation and leakage."),
    D("Probability & Statistics", 86, "A full round in most AI/ML interviews."),
    D("Deep Learning", 80, "Required for AI-branded roles and model teams."),
    D("Mathematics for AI (linear algebra)", 74, "Asked to justify why a model behaves the way it does."),
    D("Data Structures & Algorithms", 72, "ML engineer roles still include a coding round."),
    D("NLP & LLM / GenAI stack", 70, "The fastest-growing requirement in current openings."),
    D("SQL & data handling", 66, "Training data lives in warehouses."),
    D("MLOps & deployment", 52, "Separates model builders from model shippers."),
    D("Communication of results", 60, "You must explain a model to non-technical stakeholders."),
  ],
  "ai-ds": [
    D("Python & Pandas", 93, "The default tool for every data-science task."),
    D("SQL", 90, "The single most-asked skill in analytics interviews."),
    D("Statistics & Probability", 88, "Hypothesis testing and A/B design get a dedicated round."),
    D("Machine Learning", 84, "Model selection and evaluation questions."),
    D("Data visualisation & storytelling", 76, "Case rounds grade clarity as much as correctness."),
    D("Data cleaning & EDA", 74, "Real interviews hand you a messy dataset."),
    D("Big data tools (Spark/Hadoop)", 55, "Needed once data outgrows a laptop."),
    D("Deep Learning", 52, "Useful for text and image-heavy roles."),
    D("Excel / Power BI / Tableau", 58, "Business-facing analyst rounds."),
    D("Data Structures & Algorithms", 60, "Screening test for product-company DS roles."),
  ],
  "cse-ds": [
    D("SQL & data modelling", 90, "Data roles live and die on query skill."),
    D("Python for data science", 88, "Wrangling, modelling and automation."),
    D("Statistics", 84, "Interpreting results without fooling yourself."),
    D("Machine Learning", 82, "Predictive analytics is the core deliverable."),
    D("Data Structures & Algorithms", 70, "Coding round remains part of CSE placements."),
    D("Data mining techniques", 66, "Pattern discovery questions in technical rounds."),
    D("Big data technologies", 60, "Pipeline-scale processing."),
    D("Data visualisation", 68, "Presenting findings to decision makers."),
    D("Cloud data platforms", 54, "Warehouses and pipelines run on cloud."),
    D("Communication & case solving", 72, "Analytics rounds are case-based."),
  ],
  "cse-cyber": [
    D("Computer Networks", 92, "Security is applied networking."),
    D("Operating Systems & Linux", 86, "Hardening, logs and privilege models."),
    D("Cryptography fundamentals", 78, "Explaining hashing, TLS and key exchange."),
    D("Web application security (OWASP)", 82, "Most entry-level security work is appsec."),
    D("Ethical hacking & tools", 74, "Nmap, Burp, Wireshark, Metasploit familiarity."),
    D("Scripting (Python/Bash)", 76, "Automating scans and parsing logs."),
    D("Data Structures & Algorithms", 62, "Coding round for product-company security roles."),
    D("Cyber forensics & incident response", 58, "SOC and IR team requirement."),
    D("Cloud security", 60, "Workloads have moved to cloud."),
    D("Compliance & documentation", 50, "Audit-facing part of the job."),
  ],
  "cse-iot": [
    D("Embedded C programming", 90, "Firmware is written in C."),
    D("Microcontrollers (Arduino/ESP32/STM32)", 86, "Hands-on board work is the interview proof."),
    D("Sensors & interfacing", 80, "Reading real-world signals correctly."),
    D("Computer Networks & protocols (MQTT)", 78, "Devices must talk to the cloud reliably."),
    D("Python for device-side scripting", 72, "Gateways, dashboards and testing."),
    D("Cloud IoT platforms", 66, "Ingest, store and visualise device data."),
    D("Wireless communication", 62, "BLE, LoRa, Wi-Fi trade-offs."),
    D("IoT security", 58, "Devices are the weakest link."),
    D("Edge computing", 50, "Latency-sensitive processing."),
    D("Working hardware project", 70, "Nothing convinces an IoT panel faster."),
  ],
  ece: [
    D("Digital Electronics", 90, "Core round in every electronics interview."),
    D("Analog & electronic devices", 82, "Circuit reasoning questions."),
    D("Signals & Systems", 78, "Foundation for communication and DSP roles."),
    D("Communication Systems", 76, "Modulation, noise and link budgets."),
    D("Microprocessors & Embedded C", 80, "Most ECE jobs are embedded jobs."),
    D("VLSI & Verilog/VHDL", 70, "Semiconductor and design-house openings."),
    D("Digital Signal Processing", 62, "Filters and transforms in product roles."),
    D("MATLAB / simulation tools", 58, "Design verification work."),
    D("Aptitude & core theory", 84, "Mass recruiters screen on both."),
    D("Programming (C/Python)", 72, "Even core companies now test coding."),
  ],
  eee: [
    D("Electrical Machines", 90, "The most-asked EEE core subject."),
    D("Power Systems", 86, "Utility, EPC and PSU recruitment focus."),
    D("Control Systems", 78, "Stability and response questions."),
    D("Power Electronics", 80, "Drives, converters and EV roles."),
    D("Circuit analysis", 84, "Screening-level fundamentals."),
    D("Electrical measurements & instrumentation", 66, "Testing and commissioning work."),
    D("Renewable energy systems", 60, "Fast-growing hiring area."),
    D("PLC / SCADA automation", 64, "Plant and manufacturing roles."),
    D("AutoCAD / ETAP tools", 56, "Design and drafting deliverables."),
    D("Aptitude & communication", 82, "First and last rounds in campus drives."),
  ],
  mech: [
    D("Thermodynamics", 88, "Core round staple across mechanical hiring."),
    D("Strength of Materials", 86, "Design and structural reasoning."),
    D("Fluid Mechanics", 80, "Thermal, HVAC and process roles."),
    D("Manufacturing processes", 82, "Production and plant interviews."),
    D("Machine Design", 78, "Design-office requirement."),
    D("CAD/CAM (SolidWorks/CATIA)", 84, "Named explicitly in most job postings."),
    D("Theory of Machines", 70, "Mechanisms and kinematics."),
    D("Heat Transfer", 72, "Thermal-systems roles."),
    D("CAE / FEA tools (ANSYS)", 62, "Simulation-led design teams."),
    D("Aptitude & communication", 80, "Mass recruiters screen here first."),
  ],
  civil: [
    D("Structural Analysis", 90, "Central to every design interview."),
    D("RCC design", 86, "Most Indian construction is reinforced concrete."),
    D("Strength of Materials", 84, "Foundation for all design subjects."),
    D("AutoCAD / STAAD Pro / Revit", 82, "Named as a requirement in job postings."),
    D("Geotechnical Engineering", 74, "Foundations and soil reports."),
    D("Surveying", 70, "Site execution roles."),
    D("Construction & project management", 78, "Site engineer and planning roles."),
    D("Steel structures", 68, "Industrial and infrastructure projects."),
    D("Estimation & quantity surveying", 66, "Billing and tendering work."),
    D("Aptitude & communication", 78, "Campus screening and client-facing work."),
  ],
  chemical: [
    D("Chemical Reaction Engineering", 88, "Signature core subject for process roles."),
    D("Mass Transfer", 84, "Separation processes in every plant."),
    D("Heat Transfer", 82, "Exchanger and utility design."),
    D("Thermodynamics", 86, "Screening-level fundamentals."),
    D("Fluid Mechanics", 80, "Pumps, piping and flow systems."),
    D("Process Control & instrumentation", 74, "Plant operations requirement."),
    D("Process design & simulation (Aspen)", 70, "Design and consultancy roles."),
    D("Process calculations", 78, "Mass and energy balance problems in interviews."),
    D("Safety & HAZOP awareness", 64, "Non-negotiable in operating plants."),
    D("Aptitude & communication", 76, "PSU and campus screening rounds."),
  ],
  quantum: [
    D("Linear Algebra", 92, "Quantum states and gates are linear algebra."),
    D("Python programming", 90, "All quantum SDKs are Python-first."),
    D("Qubits, gates & circuits", 88, "The core technical interview material."),
    D("Quantum mechanics basics", 82, "Superposition, measurement and entanglement."),
    D("Probability & statistics", 78, "Measurement outcomes are probabilistic."),
    D("Qiskit / Cirq / PennyLane", 80, "Hands-on framework experience is expected."),
    D("Quantum algorithms (Grover, Shor, VQE)", 76, "Discussed in every research-facing round."),
    D("Classical DSA & complexity", 68, "Speed-up claims need classical baselines."),
    D("Quantum error correction", 58, "Hardware and research-team requirement."),
    D("Quantum cryptography & QML", 60, "Applied areas most openings mention."),
  ],
};

export function skillDemand(branch: BranchId): SkillDemand[] {
  return [...BRANCH_SKILL_DEMAND[branch]].sort((a, b) => b.percent - a.percent);
}
