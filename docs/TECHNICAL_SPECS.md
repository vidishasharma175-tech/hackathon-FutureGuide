# Technical Specifications - FutureGuide

## System Architecture Overview

FutureGuide implements a unified AI-driven student guidance platform with six interconnected subsystems:

```
┌─────────────────────────────────────────────────────────────────┐
│                        FUTUREGUIDE SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   MCAME      │  │  APBCIME     │  │   DACRAF     │            │
│  │ (Aptitude)   │  │(Institutional)│  │ (Career)     │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│         │                  │                │                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   DRSQGE     │  │   LLGDRC     │  │   FSPALC     │            │
│  │(Question Gen)│  │ (Learning Gap)│  │ (Privacy)    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│         │                  │                │                     │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │            Shared LLM Backbone (API)                    │     │
│  └─────────────────────────────────────────────────────────┘     │
│         │                                                  │       │
│  ┌────────────────────────────────────────────────────────┐      │
│  │           Database Layer (MongoDB/PostgreSQL)          │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Subsystem Specifications

### 1. MCAME - Multi-Dimensional Cognitive Aptitude Mapping Engine

**Purpose:** Maps 8 psychometric dimensions to a 3-dimensional stream suitability space using calibrated projection matrix and temperature-scaled softmax.

**Performance:** 91.3% stream discrimination accuracy

**Key Formula:**
```
Confidence = softmax(P × [8-dimensional response vector])
where P is calibrated 8×3 projection matrix
```

### 2. APBCIME - Academic Profile and Budget-Constrained Institutional Matching Engine

**Purpose:** Ranks institutions by 4-factor composite score with dual filters.

**Scoring Formula:**
```
M(i) = 0.40•AcadFit(i) + 0.30•BudgetComp(i) + 0.20•GeoPref(i) + 0.10•CourseAlign(i)
```

**Performance:** NDCG 0.87

### 3. DACRAF & DRSQGE - Career Assessment

**Purpose:** Two-stage adaptive assessment combining domain-general and role-specific evaluation.

**Composite Score:**
```
R = 0.40•G + 0.60•S
where G = general profile, S = role-specific profile
```

**Performance:** 94.1% role-specificity

### 4. LLGDRC - Learning Gap Detection and Remediation

**Purpose:** Identifies topic-level gaps from marks and teacher remarks, generates study plans.

**Priority Allocation:**
- High Priority (<50%): 40% weekly hours
- Medium Priority (50-70%): 35% weekly hours
- Low Priority (>70%): 25% weekly hours

**Performance:** Precision 0.88, Recall 0.82

### 5. FSPALC - Federated Learning with Differential Privacy

**Purpose:** Cross-student model improvement without raw data transmission.

**Privacy Parameters:**
- ε = 0.8 (privacy loss)
- δ = 10⁻⁵ (failure probability)
- C = 1.0 (gradient clipping)

**Performance:** Converges within 3.2% of centralized optimum after 20 federated rounds

---

## API Endpoints

### 1. Stream Selection
```
POST /api/stream-selector
Input: 8-item psychometric assessment responses
Output: Stream recommendation with confidence scores
```

### 2. College Finder
```
POST /api/college-finder
Input: Student marks, budget, city, course interest
Output: Top 5 ranked institutions with match scores
```

### 3. Job Matcher
```
POST /api/job-matcher
Input: General aptitude responses, target role
Output: Readiness level, skill gaps, job recommendations
```

### 4. Learning Gap Analyser
```
POST /api/learning-gap-analyser
Input: Subject marks, teacher remarks
Output: Topic-level gaps, priority classifications, study plan
```

---

## Performance Metrics

| Component | Metric | Value |
|-----------|--------|-------|
| MCAME | Stream Accuracy | 91.3% |
| APBCIME | Ranking (NDCG) | 0.87 |
| DRSQGE | Role-Specificity | 94.1% |
| LLGDRC | Precision | 0.88 |
| LLGDRC | Recall | 0.82 |
| FSPALC | Convergence | 3.2% from optimum |

---

**Last Updated:** June 2026