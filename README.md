# AdaptUI – AI-Powered Adaptive User Interface
### MSAI-631-B02 · University of the Cumberlands · Spring 2026

## Overview
AdaptUI is a browser-based adaptive UI prototype that dynamically personalises
the interface based on real-time user behaviour signals. It integrates the
Anthropic Claude API to power a conversational assistant whose tone and
complexity automatically adapt to the detected user profile.

## Key Features
| Feature | Description |
|---|---|
| Behavioural telemetry | Tracks clicks, messages, tab switches, scroll depth |
| Profile classifier | Novice → Explorer → Power User → Expert |
| Adaptive theming | Dark mode, compact layout, accent colour shifts on profile transition |
| AI Chat | Claude API assistant with profile-conditioned system prompts |
| Accessibility overrides | Dark mode, high contrast, large text toggles |
| Live dashboard | Real-time engagement metrics and KPI cards |
| AI Suggestions | Profile-specific tips surfaced dynamically |

## Usage
1. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
2. Interact with the interface — click, chat, switch tabs — to accumulate an engagement score.
3. Watch the profile badge and sidebar metrics update in real time.
4. Chat with the AI assistant; observe how responses adapt as your profile evolves.

> **Note:** The AI Chat requires a network connection to the Anthropic API.  
> API authentication is handled automatically by the claude.ai environment.

## File Structure
```
adaptive-ui/
├── index.html          # Complete single-file application
└── README.md           # This file
```

## Adaptation Rules
| Score Range | Profile | Adaptations Applied |
|---|---|---|
| 0–9 | Novice | Default layout, helpful onboarding tips |
| 10–24 | Explorer | Tips and hints surfaced |
| 25–49 | Power User | Dark mode enabled, compact spacing |
| 50+ | Expert | Violet accent, all advanced features |

## Technologies
- **Vanilla HTML/CSS/JavaScript** – no build step required
- **CSS Custom Properties** – single-source-of-truth theme engine
- **Anthropic Claude API** – `claude-sonnet-4-20250514`
- **DOM Event API** – zero-dependency behavioural telemetry

## APA Citation (Source Code)
[Student Name]. (2026). *AdaptUI: AI-powered adaptive user interface* [Source code].
GitHub. [https://github.com/[username]/adaptui-msai631](https://github.com/SuryaSureshUnnam/AI-Based-Adaptive-Human-Computer-Interaction-Building-AdaptUI)

## AI Tool Disclosure
- **Claude (Anthropic)** – report review and API integration
- **GitHub Copilot** – boilerplate event listener scaffolding

## References
- Amershi, S., et al. (2019). Guidelines for human-AI interaction. *CHI 2019*.
- Gajos, K., & Weld, D. S. (2004). SUPPLE: Automatically generating user interfaces. *IUI 2004*.
- Lavie, T., & Meyer, J. (2010). Benefits and costs of adaptive user interfaces. *IJHCS, 68*(8).
- Shneiderman, B. (2020). Human-centered AI. *Issues in Science and Technology, 37*(1).
