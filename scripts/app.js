// ========================================
// M2K Intelligence - Main Application Logic
// Navigation, Mobile Menu, Scroll Handling
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeMobileMenu();
    initializeScrollToTop();
    initializeSections();
    initializeScrollSpy();
    initializeLogoClick();
    
    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Scroll to section
                const navHeight = document.querySelector('.main-nav').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navMenu = document.getElementById('navMenu');
                navMenu.classList.remove('active');
            }
        });
    });
}

// Mobile menu toggle
function initializeMobileMenu() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
}

// Scroll to top button
function initializeScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (scrollToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Initialize sections (load content)
function initializeSections() {
    // Initialize charts when sections are visible
    // This is handled by visualizations.js
    loadSectionContent();
}

// Load section content dynamically (optional - can be inline)
function loadSectionContent() {
    // This can be used if sections are in separate HTML files
    // For this implementation, we'll use inline content for simplicity
}

// Scroll spy - update active nav link based on scroll position
function initializeScrollSpy() {
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateActiveNav() {
        let current = '';
        const navHeight = document.querySelector('.main-nav').offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Initial call
}

// Initialize logo click to scroll to top
function initializeLogoClick() {
    const logoLink = document.querySelector('.brand-logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Scroll to top smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Update active nav link
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(l => l.classList.remove('active'));
            const heroLink = document.querySelector('a[href="#hero"]');
            if (heroLink) {
                heroLink.classList.add('active');
            }
            
            // Close mobile menu if open
            const navMenu = document.getElementById('navMenu');
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    }
}

// Smooth scroll polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    // Add smooth scroll polyfill if needed
}

// ROI Calculator
function calculateROI() {
    const contractValue = parseFloat(document.getElementById('roiContractValue')?.value) || 0;
    const techFee = parseFloat(document.getElementById('roiTechFee')?.value) || 0;
    const insuranceReduction = parseFloat(document.getElementById('roiInsurance')?.value) || 0;
    
    const techRevenue = (contractValue * techFee / 100);
    const annualInsurance = 100000; // Assume $100K annual insurance premium
    const insuranceSavings = (annualInsurance * insuranceReduction / 100);
    const total = techRevenue + insuranceSavings;
    
    const techRevenueEl = document.getElementById('roiTechRevenue');
    const insuranceSavingsEl = document.getElementById('roiInsuranceSavings');
    const totalEl = document.getElementById('roiTotal');
    
    if (techRevenueEl) {
        techRevenueEl.textContent = '$' + techRevenue.toLocaleString(undefined, {maximumFractionDigits: 0});
    }
    if (insuranceSavingsEl) {
        insuranceSavingsEl.textContent = '$' + insuranceSavings.toLocaleString(undefined, {maximumFractionDigits: 0});
    }
    if (totalEl) {
        totalEl.textContent = '$' + total.toLocaleString(undefined, {maximumFractionDigits: 0});
    }
}

// Make calculateROI available globally
window.calculateROI = calculateROI;

// Auto-calculate on input change
document.addEventListener('DOMContentLoaded', function() {
    ['roiContractValue', 'roiTechFee', 'roiInsurance'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateROI);
        }
    });
    // Initial calculation (delay to ensure elements exist)
    setTimeout(calculateROI, 100);
});
