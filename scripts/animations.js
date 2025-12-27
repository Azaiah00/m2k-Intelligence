// ========================================
// Animation Utilities
// Counter animations, scroll triggers, transitions
// ========================================

// Animate numbers/counters
function animateCounter(element, target, duration = 2000, suffix = '') {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatNumber(target) + suffix;
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current)) + suffix;
        }
    }, 16);
}

// Format numbers with commas
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

// Intersection Observer for scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                
                // Animate counters if present
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    const target = parseFloat(counter.getAttribute('data-target') || counter.textContent.replace(/[^0-9.]/g, ''));
                    if (target) {
                        animateCounter(counter, target, 2000, counter.getAttribute('data-suffix') || '');
                    }
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.animate-on-scroll, .counter').forEach(el => {
        observer.observe(el);
    });
}

// Progress bar animation
function animateProgressBar(bar, targetPercent) {
    bar.style.width = '0%';
    setTimeout(() => {
        bar.style.width = targetPercent + '%';
    }, 100);
}

// Fade in elements
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.min(progress / duration, 1);
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initializeScrollAnimations();
});
