# RentalConnects AI Integration

> Last Updated: January 2026

## Table of Contents
1. [Overview](#overview)
2. [Efie AI Chatbot](#efie-ai-chatbot)
3. [Trust Score System](#trust-score-system)
4. [Recommendations Engine](#recommendations-engine)
5. [Fraud Detection](#fraud-detection)
6. [Implementation Guide](#implementation-guide)

---

## Overview

RentalConnects integrates AI capabilities to enhance user experience, build trust, and automate platform operations.

### Implementation Status
- **Implemented in Frontend**:
  - Efie AI chatbot shell (`AIChatbot.jsx`) including open/close behavior and the `openAIChatbot` custom event used from the landing page.
  - Trust Score component (`TrustScore.jsx`) and UI integration on the profile page.
  - Recommendations section shell (`RecommendationsSection.jsx`) and integration where used.
- **Backend Required**:
  - AI endpoints (`/ai/chat/`, `/ai/trust-score/`, `/ai/recommendations/*`, `/ai/fraud-detection/`) described here and in `API_REFERENCE.md` must be implemented by the backend for full functionality.
  - Fraud detection and advanced recommendation algorithms are currently **design-time only** and not enforced in the running system without backend support.

### AI Features
- **Efie AI Chatbot**: Conversational assistant for platform navigation
- **Trust Score**: AI-calculated reputation metric
- **Recommendations**: Personalized property and artisan suggestions
- **Fraud Detection**: Automated suspicious activity monitoring
- **Content Moderation**: AI-assisted review of listings and messages

---

## Efie AI Chatbot

### Overview
Efie AI is RentalConnects' conversational assistant that helps users navigate the platform, answer questions, and perform actions.

### Component Architecture

```
components/ai/
├── AIChatbot.jsx           # Main chatbot component
├── ChatMessage.jsx         # Individual message display
├── ChatInput.jsx           # Message input component
└── QuickActions.jsx        # Suggested actions
```

### Opening the Chatbot

The chatbot can be opened from multiple places:

**1. Header Button**
```jsx
// components/layout/Header.jsx
<button onClick={() => setShowChatbot(true)}>
  <MessageCircle />
  Efie AI
</button>
```

**2. Landing Page CTA**
```jsx
// pages/Landing/components/EfieAISection.jsx
<button
  onClick={() => {
    window.dispatchEvent(new CustomEvent('openAIChatbot'));
  }}
>
  Get Started with Efie AI
</button>
```

**3. Custom Event Listener**
```jsx
// components/ai/AIChatbot.jsx
useEffect(() => {
  const handleOpenChatbot = () => setIsOpen(true);
  window.addEventListener('openAIChatbot', handleOpenChatbot);
  return () => window.removeEventListener('openAIChatbot', handleOpenChatbot);
}, []);
```

### Chatbot Implementation

```jsx
// components/ai/AIChatbot.jsx
export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // Listen for external open events
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openAIChatbot', handleOpen);
    return () => window.removeEventListener('openAIChatbot', handleOpen);
  }, []);

  const sendMessage = async (content) => {
    // Add user message
    const userMessage = { role: 'user', content, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await apiClient.post('/ai/chat/', {
        message: content,
        context: {
          user_id: user?.id,
          role: user?.role,
          current_page: window.location.pathname,
        },
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.message,
        actions: response.data.actions,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Handle error...
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="chatbot-container">
          <header>
            <h3>Efie AI</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </header>
          
          <div className="messages">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {loading && <TypingIndicator />}
          </div>
          
          <ChatInput onSend={sendMessage} disabled={loading} />
        </motion.div>
      )}
      
      {/* Floating trigger button */}
      {!isOpen && (
        <button className="chatbot-trigger" onClick={() => setIsOpen(true)}>
          <MessageCircle />
        </button>
      )}
    </AnimatePresence>
  );
}
```

### Efie AI Capabilities

| Category | Capabilities |
|----------|-------------|
| Navigation | Direct users to relevant pages |
| Search | Find properties, artisans |
| Information | Answer FAQs, explain features |
| Actions | Initiate bookings, report issues |
| Support | Escalate to human support |

### Sample Interactions

```
User: "I need an electrician in Accra"
Efie: "I found 45 verified electricians in Accra. Here are the top-rated ones:
       1. Kwame Asante ⭐ 4.9 (156 reviews)
       2. Ama Boateng ⭐ 4.8 (98 reviews)
       [View all electricians] [Book now]"

User: "How do I list my property?"
Efie: "To list a property, follow these steps:
       1. Go to your Landlord Dashboard
       2. Click 'Add Property'
       3. Fill in property details
       4. Upload photos
       5. Submit for review
       [Go to Add Property] [Watch Tutorial]"
```

---

## Trust Score System

### Overview
The Trust Score is an AI-calculated metric (0-100) that represents a user's reliability and reputation on the platform.

### Component

```jsx
// components/ai/TrustScore.jsx
export default function TrustScore({ userId, size = "md" }) {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState(null);

  useEffect(() => {
    const loadScore = async () => {
      try {
        const data = await getTrustScore(userId);
        setScore(data.score);
        setBreakdown(data.breakdown);
      } catch (err) {
        console.error("Failed to load trust score:", err);
      } finally {
        setLoading(false);
      }
    };
    loadScore();
  }, [userId]);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="trust-score">
      <div className={`score ${getScoreColor(score)}`}>
        <Shield className="icon" />
        <span>{score}</span>
      </div>
      <span className="label">{getScoreLabel(score)}</span>
      
      {/* Tooltip with breakdown */}
      <Tooltip content={
        <div className="breakdown">
          <p>Verification: {breakdown?.verification}%</p>
          <p>Reviews: {breakdown?.reviews}%</p>
          <p>Response Rate: {breakdown?.responseRate}%</p>
          <p>Completion Rate: {breakdown?.completionRate}%</p>
        </div>
      } />
    </div>
  );
}
```

### Trust Score Calculation

```python
# Backend AI calculation (pseudocode)
def calculate_trust_score(user):
    factors = {
        'verification': calculate_verification_score(user),      # 0-100
        'reviews': calculate_review_score(user),                 # 0-100
        'response_rate': user.response_rate,                     # 0-100
        'completion_rate': user.completion_rate,                 # 0-100
        'account_age': calculate_age_score(user.created_at),     # 0-100
        'activity': calculate_activity_score(user),              # 0-100
    }
    
    weights = {
        'verification': 0.25,
        'reviews': 0.25,
        'response_rate': 0.15,
        'completion_rate': 0.15,
        'account_age': 0.10,
        'activity': 0.10,
    }
    
    score = sum(factors[k] * weights[k] for k in factors)
    return round(score)
```

### Trust Score Factors

| Factor | Weight | Description |
|--------|--------|-------------|
| Verification | 25% | ID verified, background check |
| Reviews | 25% | Average rating, review count |
| Response Rate | 15% | % of messages responded to |
| Completion Rate | 15% | % of bookings completed |
| Account Age | 10% | Time on platform |
| Activity | 10% | Regular engagement |

---

## Recommendations Engine

### Overview
The recommendations engine provides personalized suggestions for properties (tenants) and artisans (tenants/landlords).

### Component

```jsx
// components/ai/RecommendationsSection.jsx
export default function RecommendationsSection({ 
  type = "properties",  // "properties" | "artisans"
  title = "Recommended for You",
  limit = 6 
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const data = await getRecommendations(type, { limit });
        setRecommendations(data);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRecommendations();
  }, [type, limit]);

  if (loading) return <RecommendationsSkeleton />;
  if (recommendations.length === 0) return null;

  return (
    <section className="recommendations">
      <h2>{title}</h2>
      <div className="grid grid-cols-3 gap-4">
        {recommendations.map(item => (
          type === "properties" 
            ? <PropertyCard key={item.id} property={item} />
            : <ArtisanCard key={item.id} artisan={item} />
        ))}
      </div>
    </section>
  );
}
```

### Recommendation Algorithm

```python
# Backend AI recommendation (pseudocode)
def get_property_recommendations(user, limit=6):
    # 1. User preference signals
    preferences = extract_user_preferences(user)
    # - Search history
    # - Viewed properties
    # - Saved favorites
    # - Previous bookings
    
    # 2. Collaborative filtering
    similar_users = find_similar_users(user)
    popular_with_similar = get_popular_items(similar_users)
    
    # 3. Content-based filtering
    matching_content = find_matching_properties(preferences)
    
    # 4. Combine and rank
    candidates = merge_candidates(popular_with_similar, matching_content)
    ranked = rank_by_relevance(candidates, user)
    
    return ranked[:limit]
```

### Recommendation Signals

| Signal | Type | Weight |
|--------|------|--------|
| Search queries | Explicit | High |
| Property views | Implicit | Medium |
| Favorites | Explicit | High |
| Booking history | Explicit | Very High |
| Similar user behavior | Collaborative | Medium |
| Property features match | Content | Medium |
| Location proximity | Context | High |
| Price range match | Preference | High |

---

## Fraud Detection

### Overview
AI monitors platform activity to detect and flag suspicious behavior.

### Detection Categories

| Category | Indicators |
|----------|------------|
| Fake Listings | Stock photos, unrealistic prices, copied descriptions |
| Scam Messages | Requests for off-platform payment, urgency tactics |
| Review Manipulation | Suspicious review patterns, coordinated activity |
| Account Abuse | Multiple accounts, ban evasion |

### Implementation

```javascript
// services/fraudDetectionService.js
export const analyzeContent = async (content, type) => {
  const { data } = await apiClient.post('/ai/fraud-detection/', {
    content,
    content_type: type, // "listing", "message", "review"
  });
  
  return {
    isSuspicious: data.risk_score > 0.7,
    riskScore: data.risk_score,
    flags: data.flags,
    recommendation: data.recommendation,
  };
};

// Usage in property submission
const handleSubmitProperty = async (propertyData) => {
  // Check for fraud indicators
  const fraudCheck = await analyzeContent(
    { ...propertyData, images: propertyData.imageUrls },
    'listing'
  );
  
  if (fraudCheck.isSuspicious) {
    // Flag for manual review
    await flagForReview(propertyData, fraudCheck.flags);
    toast.info("Your listing will be reviewed before publication.");
  } else {
    // Auto-approve or standard review
    await submitProperty(propertyData);
  }
};
```

### Admin Fraud Dashboard

```jsx
// pages/Dashboards/Admin/FraudReviewPage.jsx
export default function FraudReviewPage() {
  const [flaggedItems, setFlaggedItems] = useState([]);

  return (
    <div>
      <h1>Fraud Review Queue</h1>
      
      {flaggedItems.map(item => (
        <FlaggedItemCard
          key={item.id}
          item={item}
          flags={item.fraud_flags}
          riskScore={item.risk_score}
          onApprove={() => handleApprove(item.id)}
          onReject={() => handleReject(item.id)}
        />
      ))}
    </div>
  );
}
```

---

## Implementation Guide

### Adding AI Features

1. **Create API Service**
```javascript
// services/aiService.js
export const getAIResponse = async (prompt, context) => {
  const { data } = await apiClient.post('/ai/query/', { prompt, context });
  return data;
};

export const analyzeContent = async (content) => {
  const { data } = await apiClient.post('/ai/analyze/', { content });
  return data;
};
```

2. **Create React Component**
```jsx
// components/ai/AIFeature.jsx
export default function AIFeature({ input }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const data = await analyzeContent(input);
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : "Analyze"}
      </button>
      {result && <ResultDisplay data={result} />}
    </div>
  );
}
```

3. **Add Feature Flag**
```javascript
// config/features.js
export const AI_FEATURES = {
  CHATBOT: import.meta.env.VITE_ENABLE_AI_CHATBOT !== 'false',
  TRUST_SCORE: import.meta.env.VITE_ENABLE_TRUST_SCORE !== 'false',
  RECOMMENDATIONS: import.meta.env.VITE_ENABLE_RECOMMENDATIONS !== 'false',
  FRAUD_DETECTION: import.meta.env.VITE_ENABLE_FRAUD_DETECTION !== 'false',
};
```

### Best Practices

1. **Graceful Degradation**: Always have fallbacks when AI is unavailable
2. **Loading States**: Show clear loading indicators during AI processing
3. **Error Handling**: Handle API failures gracefully with user-friendly messages
4. **Privacy**: Only send necessary data to AI services
5. **Transparency**: Indicate when AI is being used (e.g., "Powered by AI")

---

## API Reference

### AI Endpoints

```
# Chatbot
POST   /api/ai/chat/                     Send message to Efie AI
GET    /api/ai/chat/history              Get chat history

# Trust Score
GET    /api/ai/trust-score/:userId       Get user's trust score
GET    /api/ai/trust-score/:userId/breakdown  Detailed breakdown

# Recommendations
GET    /api/ai/recommendations/properties     Property recommendations
GET    /api/ai/recommendations/artisans       Artisan recommendations

# Fraud Detection
POST   /api/ai/fraud-detection/          Analyze content for fraud
GET    /api/admin/fraud-queue            Get flagged items (admin)
```

### Sample Requests

**Chat with Efie AI**:
```http
POST /api/ai/chat/
Content-Type: application/json

{
  "message": "Find me a 2-bedroom apartment in East Legon",
  "context": {
    "user_id": "usr_123",
    "role": "tenant",
    "current_page": "/tenant/properties"
  }
}
```

**Response**:
```json
{
  "message": "I found 23 two-bedroom apartments in East Legon. Here are the top matches based on your preferences:",
  "actions": [
    {
      "type": "navigate",
      "label": "View All Results",
      "url": "/tenant/properties?bedrooms=2&location=east-legon"
    },
    {
      "type": "quick_reply",
      "options": ["Under GHC 2000", "With parking", "Furnished"]
    }
  ],
  "properties": [
    { "id": "prop_1", "title": "Modern 2BR Apartment", "price": 1800 },
    { "id": "prop_2", "title": "Spacious 2BR with Balcony", "price": 2200 }
  ]
}
```

---

*See also:*
- [Platform Architecture](./PLATFORM_ARCHITECTURE.md)
- [Notification System](./NOTIFICATION_SYSTEM.md)
- [Artisan System](./ARTISAN_SYSTEM.md)
