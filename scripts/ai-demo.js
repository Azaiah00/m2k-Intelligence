// ========================================
// AI Demo Integration (Server-side key via Netlify Functions)
//
// IMPORTANT SECURITY NOTE:
// We DO NOT call Gemini directly from the browser, because that would expose the API key.
// All Gemini requests go through Netlify Functions:
// - POST /api/gemini-text
// - POST /api/gemini-image
// ========================================

// Fallback responses for when API is not available
const FALLBACK_RESPONSES = {
    default: "I'm here to help with your M2K Intelligence transformation strategy. For the most detailed responses, please ensure the Gemini API key is configured. Here's a general insight: The transformation to M2K Intelligence positions you as a tech-forward construction leader, uniquely combining SWaM certification with AI capabilities—a rare combination that unlocks high-value government and corporate contracts.",
    
    strategy: "The strategic transformation leverages three core pillars: 1) AI-powered SiteSight for transparency and validation, 2) SWaM certification as a market differentiator, and 3) targeting the Northern Virginia data center market where 70% of global internet traffic flows. This combination creates a 'unicorn subcontractor' status.",
    
    market: "Northern Virginia's data center market is experiencing unprecedented growth. With hyperscale facilities from Microsoft, Google, and Amazon, there's a continuous need for specialized fit-out work. M2K Intelligence is positioned to capture this demand through AI-enhanced service delivery.",
    
    roi: "The ROI model shows: 3-5% tech fee markup on contracts, reduced insurance premiums through AI safety monitoring (15% reduction), and access to innovation grants ($50K-$250K available). Typical payback period: 6-12 months.",
    
    implementation: "The 100-day roadmap focuses on three phases: Foundation (legal, certification, brand), Credibility (prequalification, partnerships), and Market Entry (first contracts, scaling). Key milestones include SWaM certification (60-90 days) and first tech-enabled contract within 100 days."
};

// Initialize AI Assistant
document.addEventListener('DOMContentLoaded', function() {
    initializeAIAssistant();
});

async function callTextTool({ mode, input }) {
    const resp = await fetch('/api/gemini-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, input })
    });
    if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error || 'Gemini tool request failed');
    }
    const data = await resp.json();
    return data.text || '';
}

// Initialize AI Assistant UI
function initializeAIAssistant() {
    const toggle = document.getElementById('aiAssistantToggle');
    const panel = document.getElementById('aiAssistantPanel');
    const closeBtn = document.getElementById('aiAssistantClose');
    const sendBtn = document.getElementById('aiAssistantSend');
    const input = document.getElementById('aiAssistantInput');
    const messages = document.getElementById('aiAssistantMessages');
    
    if (!toggle || !panel) return;
    
    // Toggle panel
    toggle.addEventListener('click', () => {
        panel.classList.toggle('active');
    });
    
    // Close panel
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.classList.remove('active');
        });
    }
    
    // Send message
    function sendMessage() {
        const message = input.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, 'user');
        input.value = '';
        
        // Show loading
        const loadingId = addMessage('Thinking...', 'bot', true);
        
        // Get AI response
        getAIResponse(message).then(response => {
            // Remove loading message
            const loadingMsg = document.getElementById(loadingId);
            if (loadingMsg) loadingMsg.remove();
            
            // Add response
            addMessage(response, 'bot');
        }).catch(error => {
            // Remove loading message
            const loadingMsg = document.getElementById(loadingId);
            if (loadingMsg) loadingMsg.remove();
            
            // Add error message
            addMessage('I apologize, but I\'m having trouble processing your request right now. Please try again later.', 'bot');
            console.error('AI Error:', error);
        });
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Add message to chat
function addMessage(text, type, isLoading = false) {
    const messages = document.getElementById('aiAssistantMessages');
    if (!messages) return;
    
    const messageDiv = document.createElement('div');
    const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    messageDiv.id = messageId;
    messageDiv.className = `ai-message ai-${type}`;
    
    const p = document.createElement('p');
    p.textContent = text;
    if (isLoading) {
        p.classList.add('loading');
    }
    messageDiv.appendChild(p);
    
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
    
    return messageId;
}

// Get AI response from Gemini API (Netlify Function) or fallback
async function getAIResponse(userMessage) {
    try {
        const text = await callTextTool({ mode: 'assistant', input: userMessage });
        if (text) return text;
    } catch (error) {
        console.warn('Tool call failed, using fallback:', error);
    }
    return getFallbackResponse(userMessage);
}

// (Direct Gemini client-side calls removed on purpose.)

// Get fallback response based on message content
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('strategy') || lowerMessage.includes('transform')) {
        return FALLBACK_RESPONSES.strategy;
    } else if (lowerMessage.includes('market') || lowerMessage.includes('opportunity') || lowerMessage.includes('virginia')) {
        return FALLBACK_RESPONSES.market;
    } else if (lowerMessage.includes('roi') || lowerMessage.includes('return') || lowerMessage.includes('revenue') || lowerMessage.includes('profit')) {
        return FALLBACK_RESPONSES.roi;
    } else if (lowerMessage.includes('implement') || lowerMessage.includes('roadmap') || lowerMessage.includes('timeline') || lowerMessage.includes('plan')) {
        return FALLBACK_RESPONSES.implementation;
    }
    
    return FALLBACK_RESPONSES.default;
}

// Export for use in other scripts
window.AIDemo = {
    getResponse: getAIResponse,
    callTextTool,
    getFallbackResponse
};
