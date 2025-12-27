# M2K Intelligence Strategic Presentation

A comprehensive, interactive strategic presentation for transforming M2K (Man 2 Know) into M2K Intelligence - an AI-driven construction company targeting high-value government and corporate contracts in Virginia.

## Features

- **Interactive Navigation**: Smooth scrolling navigation with active section highlighting
- **Data Visualizations**: Chart.js-powered charts for market analysis, funding sources, and revenue projections
- **AI Assistant**: Gemini API integration with fallback responses for strategic questions
- **Responsive Design**: Fully responsive layout optimized for desktop, tablet, and mobile
- **Modern UI**: Glass morphism effects, smooth animations, and professional design system
- **ROI Calculator**: Interactive calculator for projecting returns on investment
- **100-Day Roadmap**: Visual timeline showing transformation milestones

## Technology Stack

- **HTML5/CSS3**: Modern semantic markup and CSS Grid/Flexbox
- **Vanilla JavaScript**: No heavy frameworks for fast load times
- **Chart.js**: Data visualization library
- **AOS (Animate On Scroll)**: Scroll-triggered animations
- **Netlify**: Deployment platform with form handling

## Setup & Deployment

### Local Development

**Option 1: Using npm (Recommended)**
```bash
npm run dev
```
This will start a local server and automatically open the presentation in your browser at `http://localhost:8080`

**Option 2: Direct browser**
- Simply double-click `index.html` to open it in your default browser
- Note: Some features work better with a local server

**Option 3: Other local servers**
```bash
# Using Python
python -m http.server 8000
# Then navigate to http://localhost:8000

# Using Node.js (http-server) directly
npx http-server -p 8080 -o

# Using PHP
php -S localhost:8000
```

### Netlify Deployment

1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: (none needed)
   - Publish directory: `.` (root)
3. Set environment variables (optional, for AI features):
   - `GEMINI_API_KEY`: Your Google Gemini API key
4. Deploy!

The `netlify.toml` file is already configured for SPA routing.

### Environment Variables

To enable live AI features, set the `GEMINI_API_KEY` environment variable in Netlify:
1. Go to Site Settings → Environment Variables
2. Add `GEMINI_API_KEY` with your Google Gemini API key
3. Redeploy the site

**Note**: The presentation works perfectly without the API key - it will use intelligent fallback responses instead.

## File Structure

```
m2k-intelligence-info/
├── index.html              # Main HTML file with all sections
├── styles/
│   ├── main.css           # Core styles and design system
│   └── components.css     # Reusable component styles
├── scripts/
│   ├── app.js             # Main application logic
│   ├── animations.js      # Animation utilities
│   ├── visualizations.js  # Chart.js chart initialization
│   └── ai-demo.js         # AI assistant integration
├── netlify.toml           # Netlify configuration
└── README.md              # This file
```

## Sections

1. **Hero**: Value proposition and key metrics
2. **Current State**: Gap analysis and before/after comparison
3. **Rebrand**: Brand evolution and visual identity
4. **AI Solutions**: SiteSight and other AI offerings
5. **Market Opportunity**: Virginia data center market analysis
6. **Competitive Advantage**: SWaM + AI positioning
7. **Funding & ROI**: Grant opportunities and ROI calculator
8. **Roadmap**: 100-day execution plan
9. **Partnership**: Call-to-action and contact form

## Customization

### Colors

Edit CSS variables in `styles/main.css`:
```css
:root {
    --primary-blue: #007BFF;
    --slate-grey: #1E293B;
    --safety-orange: #F59E0B;
    /* ... */
}
```

### Content

All content is in `index.html`. Simply edit the HTML within each section to customize text, add images, or modify structure.

### Charts

Chart data is defined in `scripts/visualizations.js`. Modify the data arrays to update charts.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized images (use WebP when possible)
- Minimal JavaScript dependencies
- Lazy loading for charts (initialized on scroll)
- CSS animations for smooth interactions

## License

This project is proprietary and confidential.

## Support

For questions or customization requests, contact DataIsData.

---

**Built with precision for M2K Intelligence transformation strategy.**
