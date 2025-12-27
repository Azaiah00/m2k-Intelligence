// ========================================
// Animation Utilities
// Counter animations, scroll triggers, transitions
// ========================================

// Animate numbers/counters
function animateCounter(element, target, duration = 2000, suffix = '', prefix = '') {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = prefix + formatNumber(target, suffix) + suffix;
            clearInterval(timer);
        } else {
            element.textContent = prefix + formatNumber(current, suffix) + suffix;
        }
    }, 16);
}

// Format numbers with commas and handle billions/millions
function formatNumber(num, suffix = '') {
    // Handle billions
    if (suffix === 'B' || suffix === 'b') {
        return num.toFixed(1);
    }
    // Handle millions
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toLocaleString();
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
                    // Check if already animated
                    if (counter.dataset.animated === 'true') return;
                    counter.dataset.animated = 'true';
                    
                    const target = parseFloat(counter.getAttribute('data-target') || 0);
                    const suffix = counter.getAttribute('data-suffix') || '';
                    // Extract prefix from initial text (e.g., "$" from "$0B")
                    const initialText = counter.textContent.trim();
                    const prefix = initialText.match(/^[^0-9]*/)?.[0] || '';
                    
                    if (target) {
                        animateCounter(counter, target, 2000, suffix, prefix);
                    }
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe parent containers AND individual counter elements
    document.querySelectorAll('.animate-on-scroll, .counter, .glass-card, .section, .hero-section').forEach(el => {
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

// Animate capability progress bars
function animateCapabilityBars() {
    const matrix = document.getElementById('capability-matrix');
    if (!matrix) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.capability-bar');
                bars.forEach(bar => {
                    const target = parseFloat(bar.getAttribute('data-target') || 0);
                    if (target) {
                        setTimeout(() => {
                            bar.style.width = target + '%';
                        }, 100);
                    }
                });
                
                // Animate capability values
                const values = entry.target.querySelectorAll('.capability-value');
                values.forEach(value => {
                    const target = parseFloat(value.getAttribute('data-target') || 0);
                    if (target) {
                        let current = 0;
                        const increment = target / 60; // 60 frames for smooth animation
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                value.textContent = target + '%';
                                clearInterval(timer);
                            } else {
                                value.textContent = Math.floor(current) + '%';
                            }
                        }, 25);
                    }
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    observer.observe(matrix);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initializeScrollAnimations();
    animateCapabilityBars();
});
