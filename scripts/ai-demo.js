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
    
    swam: "SWaM (Small, Women-owned, and Minority-owned) certification is a Virginia state program that provides significant competitive advantages for government and corporate contracts. For M2K Intelligence, SWaM certification means: 1) **Set-aside opportunities** - Many state contracts require or prefer SWaM-certified vendors, 2) **Corporate diversity programs** - Fortune 500 companies actively seek SWaM partners for their supplier diversity initiatives, 3) **Reduced competition** - You're competing in a smaller pool of qualified vendors, 4) **Higher win rates** - SWaM status can be the deciding factor in competitive bids. The certification process typically takes 60-90 days and requires documentation of business ownership, size, and operations. Combined with M2K's AI capabilities, this creates a 'unicorn subcontractor' status that's nearly impossible for competitors to match.",
    
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
    try {
        const resp = await fetch('/api/gemini-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode, input })
        }).catch(fetchError => {
            // Network error (function not running, CORS, etc.)
            console.error('Network error calling /api/gemini-text:', fetchError);
            throw new Error(`Network error: ${fetchError.message}. Make sure you're running "npm run dev" (not "npm run dev:static") so Netlify Functions are available.`);
        });
        
        if (!resp.ok) {
            // Try to parse error as JSON, but handle text responses too
            let err = {};
            const contentType = resp.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                err = await resp.json().catch(() => ({}));
            } else {
                const text = await resp.text().catch(() => '');
                err = { error: text || `HTTP ${resp.status}: ${resp.statusText}` };
            }
            
            const errorMsg = err?.error || err?.details || `HTTP ${resp.status}: ${resp.statusText}`;
            console.error('API Error:', {
                status: resp.status,
                statusText: resp.statusText,
                error: err
            });
            
            // Provide helpful error messages
            if (resp.status === 405) {
                throw new Error('Method Not Allowed: The API endpoint is not accepting POST requests. Check netlify.toml redirect configuration.');
            }
            if (resp.status === 400 && errorMsg.includes('GEMINI_API_KEY')) {
                throw new Error('API Key Configuration Error: GEMINI_API_KEY not found. Check local.secrets.json (local) or Netlify environment variables (production).');
            }
            throw new Error(errorMsg);
        }
        
        const data = await resp.json();
        if (!data || !data.text) {
            throw new Error('Empty response from Gemini API');
        }
        
        return data.text;
    } catch (error) {
        console.error('callTextTool error:', error);
        throw error;
    }
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
        
        // Font-size is set to 16px (1rem) in CSS, which prevents mobile browsers from auto-zooming
        // No additional blur handling needed
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
        if (text && text.trim() && text.length > 10) {
            // Only return if we got a real response (not just whitespace or very short)
            return text;
        } else {
            console.warn('API returned empty or very short response, using fallback');
        }
    } catch (error) {
        console.error('Gemini API call failed:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        
        // Show user-friendly error message with specific guidance
        const errorMsg = error.message || 'Unknown error';
        
        if (errorMsg.includes('Network error') || errorMsg.includes('Failed to fetch')) {
            return `⚠️ **Connection Error**: The AI service isn't reachable. This usually means:\n\n1. **Not running Netlify Functions**: Make sure you're running \`npm run dev\` (NOT \`npm run dev:static\`)\n2. **Function not available**: The /api/gemini-text endpoint should be running on port 8888\n3. **Check your terminal**: Look for errors in the terminal running \`npm run dev\`\n\n**Quick Fix**: Stop your current server and run: \`npm run dev\`\n\n---\n\nHere's a helpful answer anyway:\n\n${getFallbackResponse(userMessage)}`;
        }
        
        if (errorMsg.includes('GEMINI_API_KEY') || errorMsg.includes('API Key Configuration')) {
            return `⚠️ **API Key Configuration Error**: ${errorMsg}\n\n**To fix**:\n1. Make sure \`local.secrets.json\` exists in the project root\n2. It should contain: \`{"GEMINI_API_KEY": "your-key-here"}\`\n3. Restart the dev server after creating/updating the file\n\n---\n\nHere's a helpful answer anyway:\n\n${getFallbackResponse(userMessage)}`;
        }
        
        // For other errors, show the error but still provide fallback
        return `⚠️ **Error**: ${errorMsg}\n\n**Troubleshooting**:\n1. Check browser console (F12) for detailed error messages\n2. Check terminal running \`npm run dev\` for function errors\n3. Verify \`local.secrets.json\` has your API key\n\n---\n\nHere's a helpful answer anyway:\n\n${getFallbackResponse(userMessage)}`;
    }
    return getFallbackResponse(userMessage);
}

// (Direct Gemini client-side calls removed on purpose.)

// Get fallback response based on message content
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for SWaM-related questions first
    if (lowerMessage.includes('swam') || lowerMessage.includes('certification') || lowerMessage.includes('certified') || lowerMessage.includes('diversity') || lowerMessage.includes('minority') || lowerMessage.includes('women-owned')) {
        return FALLBACK_RESPONSES.swam;
    } else if (lowerMessage.includes('strategy') || lowerMessage.includes('transform')) {
        return FALLBACK_RESPONSES.strategy;
    } else if (lowerMessage.includes('market') || lowerMessage.includes('opportunity') || lowerMessage.includes('virginia') || lowerMessage.includes('data center')) {
        return FALLBACK_RESPONSES.market;
    } else if (lowerMessage.includes('roi') || lowerMessage.includes('return') || lowerMessage.includes('revenue') || lowerMessage.includes('profit') || lowerMessage.includes('cost')) {
        return FALLBACK_RESPONSES.roi;
    } else if (lowerMessage.includes('implement') || lowerMessage.includes('roadmap') || lowerMessage.includes('timeline') || lowerMessage.includes('plan') || lowerMessage.includes('phase')) {
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
