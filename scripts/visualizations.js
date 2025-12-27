// ========================================
// Data Visualizations
// Chart.js charts and interactive data displays
// ========================================

let chartInstances = {};

function getThemeColor(varName, fallback) {
    try {
        const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        return v || fallback;
    } catch {
        return fallback;
    }
}

// Initialize all charts
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts when their sections become visible
    initChartOnVisible('marketGrowthChart', initMarketGrowthChart);
    initChartOnVisible('gapAnalysisChart', initGapAnalysisChart);
    initChartOnVisible('fundingChart', initFundingChart);
    initChartOnVisible('revenueChart', initRevenueChart);
});

// Market Growth Chart
function initMarketGrowthChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    const primary = getThemeColor('--primary-blue', '#00f2ff');
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2023', '2024', '2025', '2026', '2027', '2028'],
            datasets: [{
                label: 'Traditional Construction Growth',
                data: [2, 2.5, 3, 3.2, 3.5, 3.8],
                borderColor: '#94a3b8',
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                borderDash: [5, 5],
                tension: 0.4,
                borderWidth: 2
            }, {
                label: 'AI-Enhanced Construction Growth',
                data: [5, 12, 25, 45, 68, 90],
                borderColor: primary,
                backgroundColor: 'rgba(0, 242, 255, 0.12)',
                fill: true,
                tension: 0.4,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Market Value Index',
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    },
                    grid: {
                        color: 'rgba(226, 232, 240, 0.5)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    return chartInstances[canvasId];
}

// Funding Sources Chart
function initFundingChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    const primary = getThemeColor('--primary-blue', '#00f2ff');
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Private Contracts (Corp)', 'Gov Set-Asides (SWaM)', 'Innovation Grants', 'Standard Bids'],
            datasets: [{
                data: [35, 25, 20, 20],
                backgroundColor: [
                    primary,
                    '#8B5CF6',
                    '#10B981',
                    '#CBD5E1'
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    padding: 12,
                    cornerRadius: 8
                },
                title: {
                    display: true,
                    text: 'Target Revenue Mix (Year 2)',
                    font: {
                        size: 16,
                        weight: 'bold',
                        family: 'Space Grotesk'
                    },
                    padding: {
                        bottom: 20
                    }
                }
            }
        }
    });
    
    return chartInstances[canvasId];
}

// Revenue Projection Chart
function initRevenueChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    const primary = getThemeColor('--primary-blue', '#00f2ff');
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3'],
            datasets: [{
                label: 'Traditional Construction',
                data: [1.5, 1.4, 1.2],
                backgroundColor: '#94a3b8',
                borderRadius: 8
            }, {
                label: 'M2K Intelligence (Tech-Infra)',
                data: [0.2, 2.8, 6.5],
                backgroundColor: primary,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Revenue ($M)',
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    },
                    grid: {
                        color: 'rgba(226, 232, 240, 0.5)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    return chartInstances[canvasId];
}

// Gap Analysis Radar Chart
function initGapAnalysisChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    const primary = getThemeColor('--primary-blue', '#00f2ff');
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Tech Integration', 'Digital Presence', 'Gov. Certification', 'Market Positioning', 'Process Automation', 'Data Capabilities'],
            datasets: [{
                label: 'Current State',
                data: [20, 55, 40, 45, 30, 25],
                borderColor: '#94a3b8',
                backgroundColor: 'rgba(148, 163, 184, 0.2)',
                borderWidth: 2
            }, {
                label: 'Target State',
                data: [95, 98, 90, 95, 85, 90],
                borderColor: primary,
                backgroundColor: 'rgba(0, 242, 255, 0.18)',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    },
                    grid: {
                        color: 'rgba(226, 232, 240, 0.5)'
                    }
                }
            }
        }
    });
    
    return chartInstances[canvasId];
}

// Initialize chart when section becomes visible
function initChartOnVisible(canvasId, initFunction) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initFunction(canvasId);
                observer.unobserve(canvas);
            }
        });
    }, {
        threshold: 0.1
    });
    
    observer.observe(canvas);
}

// Export chart initialization functions
window.Charts = {
    initMarketGrowth: initMarketGrowthChart,
    initFunding: initFundingChart,
    initRevenue: initRevenueChart,
    initGapAnalysis: initGapAnalysisChart,
    initOnVisible: initChartOnVisible
};
