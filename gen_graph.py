import json
p = "d:/HIEGRAPH/backend/app/data/graph.json"
with open(p) as f: d = json.load(f)
# Add properties to all nodes
props = {
  "L1_RESEARCH":{"description":"Scientific research","status":"active","maturity":9,"domain":"academia"},
  "L1_HEALTHCARE":{"description":"Healthcare systems","status":"active","maturity":8,"domain":"medical"},
  "L1_EDUCATION":{"description":"Education systems","status":"active","maturity":8,"domain":"education"},
  "L1_FINANCE":{"description":"Financial systems","status":"active","maturity":9,"domain":"fintech"},
  "L1_ENGINEERING":{"description":"Engineering disciplines","status":"active","maturity":9,"domain":"engineering"},
  "L1_CREATIVE":{"description":"Creative arts & media","status":"active","maturity":7,"domain":"creative"},
  "L2_AI":{"description":"AI research","status":"active","maturity":8,"tools":["PyTorch","TensorFlow"]},
  "L2_DS":{"description":"Data science","status":"active","maturity":9,"tools":["Pandas","Spark"]},
  "L2_QUANTUM":{"description":"Quantum computing","status":"experimental","maturity":4,"tools":["Qiskit"]},
  "L2_CLINICAL":{"description":"Clinical systems","status":"active","maturity":7,"domain":"hospital"},
  "L2_BIO":{"description":"Bioinformatics","status":"active","maturity":6,"tools":["BLAST"]},
  "L2_PHARMA":{"description":"Pharmacology","status":"active","maturity":7,"domain":"pharma"},
  "L2_LEARNING":{"description":"E-learning platforms","status":"active","maturity":7},
  "L2_ASSESSMENT":{"description":"Testing & grading","status":"active","maturity":6},
  "L2_CURRICULUM":{"description":"Curriculum design","status":"active","maturity":6},
  "L2_ALGO_TRADING":{"description":"Algorithmic trading","status":"active","maturity":8},
  "L2_RISK":{"description":"Risk management","status":"active","maturity":8},
  "L2_BLOCKCHAIN":{"description":"Blockchain tech","status":"active","maturity":6},
  "L2_ROBOTICS":{"description":"Robotics engineering","status":"active","maturity":7},
  "L2_MATERIALS":{"description":"Materials science","status":"active","maturity":7},
  "L2_AEROSPACE":{"description":"Aerospace engineering","status":"active","maturity":8},
  "L2_GENART":{"description":"Generative art","status":"active","maturity":6},
  "L2_MUSIC":{"description":"Music production","status":"active","maturity":6},
  "L2_FILM":{"description":"Film & VFX","status":"active","maturity":7},
}
for n in d["nodes"]:
    if n["id"] in props:
        n["properties"] = props[n["id"]]
    elif "properties" not in n or not n.get("properties"):
        n["properties"] = {"description":n["name"],"status":"active","maturity":5}

# Add intra-level edges
intra = [
  ("L1_RESEARCH","L1_HEALTHCARE","informs"),("L1_RESEARCH","L1_ENGINEERING","enables"),
  ("L1_RESEARCH","L1_EDUCATION","drives"),("L1_FINANCE","L1_ENGINEERING","funds"),
  ("L1_CREATIVE","L1_EDUCATION","inspires"),("L1_ENGINEERING","L1_HEALTHCARE","tools for"),
  ("L1_HEALTHCARE","L1_RESEARCH","motivates"),
  ("L2_AI","L2_DS","leverages"),("L2_DS","L2_AI","feeds"),
  ("L2_BIO","L2_PHARMA","informs"),("L2_CLINICAL","L2_BIO","validates"),
  ("L2_ROBOTICS","L2_AEROSPACE","powers"),("L2_GENART","L2_FILM","enhances"),
  ("L2_ALGO_TRADING","L2_RISK","hedges"),("L2_BLOCKCHAIN","L2_ALGO_TRADING","decentralizes"),
  ("L2_QUANTUM","L2_AI","accelerates"),("L2_LEARNING","L2_ASSESSMENT","evaluates"),
  ("L2_CURRICULUM","L2_LEARNING","structures"),("L2_MATERIALS","L2_AEROSPACE","supplies"),
  ("L3_ML","L3_DL","foundation"),("L3_ML","L3_NLP","underpins"),
  ("L3_DL","L3_NLP","powers"),("L3_STATS","L3_ANALYTICS","enables"),
  ("L3_ANALYTICS","L3_VIZ","visualized by"),("L3_GENOMICS","L3_PROTEOMICS","informs"),
  ("L3_DIAGNOSIS","L3_TREATMENT","precedes"),("L3_TREATMENT","L3_IMAGING","guided by"),
  ("L3_DRUG_DESIGN","L3_CLINICAL_TRIALS","validated by"),
  ("L3_HFT","L3_PORTFOLIO","optimizes"),("L3_CREDIT_RISK","L3_MARKET_RISK","correlates"),
  ("L3_DEFI","L3_SMART_CONTRACTS","built on"),
  ("L3_PERCEPTION","L3_CONTROL","feeds"),("L3_CONTROL","L3_SWARM","coordinates"),
  ("L3_COMPOSITES","L3_NANOMATERIALS","incorporates"),
  ("L3_PROPULSION","L3_AVIONICS","integrated"),
  ("L3_SYNTHESIS","L3_COMPOSITION","enables"),("L3_RENDERING","L3_MOCAP","visualizes"),
  ("L4_TRANSFORMER","L4_LLM","backbone"),("L4_CNN","L4_GAN","generates"),
  ("L4_GAN","L4_VAE","alternative"),("L4_DIFFUSION","L4_GAN","competes"),
  ("L4_GNN","L4_TRANSFORMER","complements"),("L4_BAYES","L4_MONTE_CARLO","sampled by"),
  ("L5_WORLD","L5_DIGITAL_TWIN","models"),("L5_CAUSAL","L5_SCI_DISCOVERY","discovers"),
  ("L5_AGI_SAFETY","L5_AGENTS","constrains"),
  ("L6_SUPERINTELLIGENCE","L6_SELF_IMPROVING","evolves via"),
  ("L6_CONSCIOUSNESS","L6_SUPERINTELLIGENCE","prerequisite"),
  ("L6_FUSION_CONTROL","L6_MARS_COLONY","powers"),
]
for s,t,lbl in intra:
    d["edges"].append({"source":s,"target":t,"type":"INTRA","label":lbl})

# Add new nodes
new_nodes = [
  {"id":"L3_ADAPTIVE","name":"Adaptive Learning","level":3,"state":{},"properties":{"description":"Personalized learning paths","status":"active","maturity":6}},
  {"id":"L3_EXAM_AI","name":"AI Examination","level":3,"state":{},"properties":{"description":"AI-powered assessment","status":"experimental","maturity":4}},
  {"id":"L4_MAMBA","name":"Mamba / SSM","level":4,"state":{"sequence_skill":7},"properties":{"description":"State space models","status":"experimental","maturity":5}},
  {"id":"L4_FLOW","name":"Flow Matching","level":4,"state":{"flow_skill":6},"properties":{"description":"Flow-based generation","status":"experimental","maturity":4}},
  {"id":"L5_MULTIMODAL","name":"Multimodal AI","level":5,"state":{"multimodal_skill":8},"properties":{"description":"Cross-modal understanding","status":"active","maturity":7}},
  {"id":"L5_NEUROMORPHIC","name":"Neuromorphic Computing","level":5,"state":{"neuro_skill":5},"properties":{"description":"Brain-inspired chips","status":"experimental","maturity":4}},
  {"id":"L6_DYSON","name":"Dyson Sphere AI","level":6,"state":{"energy_skill":2},"properties":{"description":"Megastructure control","status":"theoretical","maturity":1}},
  {"id":"L7_OMEGA","name":"Omega Point","level":7,"state":{"transcendence":1},"properties":{"description":"Ultimate convergence","status":"theoretical","maturity":1}},
  {"id":"L7_SIMULATION","name":"Simulation Engine","level":7,"state":{"sim_power":1},"properties":{"description":"Universe simulation","status":"theoretical","maturity":1}},
]
d["nodes"].extend(new_nodes)

# Connect new nodes
new_edges = [
  {"source":"L2_LEARNING","target":"L3_ADAPTIVE","type":"NORMAL"},
  {"source":"L2_ASSESSMENT","target":"L3_EXAM_AI","type":"NORMAL"},
  {"source":"L3_DL","target":"L4_MAMBA","type":"NORMAL"},
  {"source":"L3_DL","target":"L4_FLOW","type":"NORMAL"},
  {"source":"L4_TRANSFORMER","target":"L5_MULTIMODAL","type":"NORMAL"},
  {"source":"L4_CNN","target":"L5_MULTIMODAL","type":"NORMAL"},
  {"source":"L4_MAMBA","target":"L5_NEUROMORPHIC","type":"NORMAL"},
  {"source":"L5_SPACE_AI","target":"L6_DYSON","type":"NORMAL"},
  {"source":"L6_SUPERINTELLIGENCE","target":"L7_OMEGA","type":"NORMAL"},
  {"source":"L6_SELF_IMPROVING","target":"L7_OMEGA","type":"NORMAL"},
  {"source":"L6_CONSCIOUSNESS","target":"L7_SIMULATION","type":"NORMAL"},
  {"source":"L5_DIGITAL_TWIN","target":"L7_SIMULATION","type":"NORMAL"},
  {"source":"L4_MAMBA","target":"L4_TRANSFORMER","type":"INTRA","label":"alternative"},
  {"source":"L4_FLOW","target":"L4_DIFFUSION","type":"INTRA","label":"evolves from"},
  {"source":"L5_MULTIMODAL","target":"L5_AGENTS","type":"INTRA","label":"empowers"},
  {"source":"L5_NEUROMORPHIC","target":"L5_QUANTUM_ML","type":"INTRA","label":"hybridizes"},
  {"source":"L3_ADAPTIVE","target":"L3_EXAM_AI","type":"INTRA","label":"assessed by"},
]
d["edges"].extend(new_edges)

# New conditional edges
new_cond = [
  {"source":"L4_MAMBA","target":"L5_MULTIMODAL","type":"CONDITION","condition":{"field":"sequence_skill","operator":">=","value":6}},
  {"source":"L4_FLOW","target":"L5_SCI_DISCOVERY","type":"CONDITION","condition":{"field":"flow_skill","operator":">=","value":5}},
  {"source":"L5_MULTIMODAL","target":"L6_CONSCIOUSNESS","type":"CONDITION","condition":{"field":"multimodal_skill","operator":">=","value":8}},
  {"source":"L5_NEUROMORPHIC","target":"L6_SELF_IMPROVING","type":"CONDITION","condition":{"field":"neuro_skill","operator":">=","value":5}},
]
d["conditional_edges"].extend(new_cond)

with open(p,"w") as f: json.dump(d,f,indent=4)
print(f"Done: {len(d['nodes'])} nodes, {len(d['edges'])} edges, {len(d['conditional_edges'])} conditional")
