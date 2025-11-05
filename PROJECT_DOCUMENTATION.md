# EthicalBank - Ethical AI in Banking Platform
## Building Trust & Transparency in AI-Driven Banking Decisions

---

## Project Overview

**Project Name:** EthicalBank  
**Purpose:** A transparent, ethical AI banking platform that builds customer trust through explainability, consent management, and responsible AI governance.

---

## Problem Statement

Banks increasingly use AI for critical decisions (credit approvals, fraud detection, personalized offers) and operational workflows. However, customers often distrust these systems due to:

- **Lack of Transparency**: Opaque decision-making processes
- **Unclear Data Usage**: Unknown how customer data is used
- **Black Box Models**: No understanding of why decisions were made
- **Limited Control**: Customers cannot control or consent to AI processes

**The Challenge:** Deploy AI solutions that deliver benefits (efficiency, scalability, personalization) while maintaining safety, compliance, fairness, and customer trust.

---

## Core Objectives

### 1. AI Transparency & Explainability
- Provide natural-language explanations for AI-driven decisions
- Visual dashboards showing how inputs lead to outputs
- Allow customers to query AI for clarifications

### 2. Responsible AI Governance
- Auditable AI decision logs for regulators and customers
- Fairness checks and bias detection in AI pipeline
- Governance dashboard with role-based reviews and overrides

### 3. Customer Trust & Control
- Dynamic privacy consent interface
- Real-time alerts for data usage or AI actions
- "Explain my profile" tool for transparency

---

## Example Use Case: Loan Eligibility Query

**Scenario:** User asks "Am I eligible for a loan of ₹7 lakhs?"

**AI Decision Process:**
1. System retrieves user data from MongoDB
2. AI model analyzes factors: age, income, credit score, existing loans, etc.
3. AI provides decision (approved/denied) with explanation
4. **Critical Requirement**: System logs which specific schema attributes were used

**Example Output:**
```json
{
  "decision": "approved",
  "confidence": 0.85,
  "explanation": "Based on your age (32), annual income (₹15 lakhs), credit score (750), and existing debt-to-income ratio (0.3), you are eligible for this loan.",
  "attributes_used": [
    "user.dateOfBirth",  // Calculated age
    "user.income",        // Annual income
    "user.creditScore",  // Credit score
    "accounts.balance",   // Total account balance
    "transactions.recent" // Transaction history for debt calculation
  ],
  "factors": [
    {"name": "age", "value": 32, "weight": 0.15, "impact": "positive"},
    {"name": "income", "value": 1500000, "weight": 0.40, "impact": "positive"},
    {"name": "credit_score", "value": 750, "weight": 0.35, "impact": "positive"},
    {"name": "debt_to_income", "value": 0.3, "weight": 0.10, "impact": "positive"}
  ]
}
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Authentication**: Clerk
- **UI**: Tailwind CSS, Radix UI components
- **State Management**: React Context API

### Backend
- **Language**: Python 3.11+
- **Package Manager**: uv
- **Framework**: FastAPI (recommended) or Flask
- **AI**: OpenAI API (GPT-4 with structured outputs)
- **Database**: MongoDB (via PyMongo or Motor)

### Database
- **MongoDB**: All user data, credentials, accounts, transactions, AI decisions, consent records

---

## Database Schema Overview

### Collections

1. **users** - User profiles and credentials
2. **accounts** - Bank accounts (checking, savings, credit, loan, investment)
3. **transactions** - Financial transactions with AI analysis
4. **ai_decisions** - AI decision records with explanations
5. **consent_records** - User consent tracking for data usage
6. **ai_query_logs** - **NEW**: Logs of AI queries with attribute tracking

---

## Solution Approaches for Attribute Tracking

### Approach 1: OpenAI Function Calling with Schema Mapping
**Description:** Use OpenAI's function calling feature to explicitly define which schema attributes to use, then track which functions were called.

**Pros:**
- Native OpenAI feature, well-documented
- Clear separation between data retrieval and AI reasoning
- Can validate data before sending to AI

**Cons:**
- Requires defining functions for each query type
- More complex implementation

**Implementation:**
```python
# Define functions that map to schema attributes
functions = [
    {
        "name": "get_user_age",
        "description": "Get user's age from dateOfBirth",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "get_user_income",
        "description": "Get user's annual income",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "get_credit_score",
        "description": "Get user's credit score",
        "parameters": {"type": "object", "properties": {}}
    }
]
# Track which functions AI calls → maps to schema attributes
```

---

### Approach 2: Structured Outputs with JSON Schema + Data Extraction Logging
**Description:** Use OpenAI's structured outputs (JSON mode + JSON schema) and log which fields from the user's MongoDB document were actually accessed/calculated.

**Pros:**
- Guaranteed JSON output format
- Can specify exact schema structure
- Easier to parse and validate

**Cons:**
- Need to track data access separately
- Requires careful logging of MongoDB queries

**Implementation:**
```python
# Use JSON schema to define response structure
response_schema = {
    "type": "object",
    "properties": {
        "decision": {"type": "string"},
        "attributes_used": {"type": "array", "items": {"type": "string"}},
        "factors": {"type": "array"}
    }
}
# Log which MongoDB fields were queried before calling OpenAI
```

---

### Approach 3: Two-Step Process: Data Extraction + AI Reasoning
**Description:** First extract relevant user data attributes, then pass to AI with explicit tracking of what was sent.

**Pros:**
- Most transparent approach
- Full control over what data is used
- Easy to audit and log

**Cons:**
- Two API calls (or one with careful prompt engineering)
- Need to pre-determine relevant attributes

**Implementation:**
```python
# Step 1: Extract relevant user data
user_data = {
    "age": calculate_age(user.dateOfBirth),
    "income": user.income,
    "credit_score": user.creditScore,
    # ... other attributes
}
attributes_used = list(user_data.keys())

# Step 2: Send to OpenAI with explicit prompt
prompt = f"""
Given these user attributes: {user_data}
Determine loan eligibility for ₹7 lakhs.
Also return which attributes influenced your decision.
"""
# Log attributes_used in MongoDB
```

---

### Approach 4: Custom Prompt Engineering with Self-Reporting
**Description:** Engineer prompts that require AI to report which attributes it used, then validate against actual data access.

**Pros:**
- Single API call
- AI self-reports attribute usage
- Can cross-validate with actual data

**Cons:**
- Relies on AI accuracy for reporting
- Need validation layer

**Implementation:**
```python
prompt = """
You must analyze this loan eligibility request.
REQUIRED: You must report which user attributes you used in your analysis.

User Data:
- age: {age}
- income: {income}
- credit_score: {credit_score}

Return JSON with:
{
  "decision": "approved/denied",
  "attributes_used": ["age", "income", "credit_score"],
  "explanation": "..."
}
"""
```

---

### Approach 5: Hybrid: MongoDB Query Logging + OpenAI Structured Outputs
**Description:** Log all MongoDB queries made to fetch user data, then use OpenAI structured outputs. Cross-reference query logs with AI response.

**Pros:**
- Most accurate tracking
- Audit trail of all data access
- Can validate AI claims against actual queries

**Cons:**
- Requires MongoDB query logging middleware
- More complex infrastructure

**Implementation:**
```python
# Add MongoDB query logging middleware
class QueryLogger:
    def log_query(self, collection, query, fields_accessed):
        # Log to ai_query_logs collection
        pass

# Use structured outputs from OpenAI
# Match logged queries with AI response
```

---

## Recommended Solution: **Approach 3 (Two-Step Process)** + **Approach 5 (Query Logging)**

**Why?**
- Most transparent and auditable
- Clear separation of concerns
- Easy to implement and maintain
- Meets regulatory requirements

**Implementation Plan:**

1. **Data Extraction Layer:**
   - Define attribute schemas for each query type (loan, credit, etc.)
   - Extract relevant user data from MongoDB
   - Log which fields were accessed

2. **AI Processing Layer:**
   - Send extracted data to OpenAI with structured JSON schema
   - Request explicit attribute usage reporting
   - Validate AI response against logged queries

3. **Audit Logging:**
   - Store query logs in MongoDB `ai_query_logs` collection
   - Link logs to AI decisions
   - Enable user viewing of what data was used

---

## Database Schema Additions Needed

### New Collection: `ai_query_logs`

```javascript
{
  userId: ObjectId,
  queryType: String, // "loan_eligibility", "credit_score", etc.
  queryText: String, // User's question
  attributesAccessed: [String], // ["user.dateOfBirth", "user.income", ...]
  mongoQueries: [{
    collection: String,
    query: Object,
    fields: [String]
  }],
  aiResponse: Object,
  aiModel: String,
  aiModelVersion: String,
  confidence: Number,
  timestamp: Date,
  userConsentId: ObjectId // Link to consent record
}
```

### Enhanced `ai_decisions` Collection

```javascript
{
  // ... existing fields ...
  queryLogId: ObjectId, // Reference to ai_query_logs
  attributesUsed: [String], // Schema paths used
  dataSnapshot: Object, // Snapshot of data at time of decision
  auditTrail: [{
    timestamp: Date,
    action: String,
    details: Object
  }]
}
```

---

## Next Steps

1. **Choose Solution Approach** (Recommend Approach 3 + 5)
2. **Design API Endpoints** for loan eligibility queries
3. **Implement MongoDB Query Logging**
4. **Integrate OpenAI API** with structured outputs
5. **Build Audit Dashboard** for viewing logs
6. **Implement Consent Management** for data usage

---

## Success Metrics

- **Transparency**: 100% of AI decisions have explainable logs
- **Trust**: Users can view all data used in decisions
- **Compliance**: Full audit trail for regulatory requirements
- **User Control**: Users can grant/revoke consent for data usage


