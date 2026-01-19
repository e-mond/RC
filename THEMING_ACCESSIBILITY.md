# Theming & Accessibility Guide

**Date:** January 2026  
**Status:** Production-Ready  
**Purpose:** Complete guide to theming and accessibility in RentalConnects frontend

---

## Overview

RentalConnects supports:
- **Dark/Light Theme** - User-selectable theme with system preference detection
- **Accessibility** - WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Responsive Design** - Mobile-first, works across all screen sizes
- **Internationalization** - English and French support

---

## Theming System

### Theme Implementation

Theming is implemented using:
- **Tailwind CSS** dark mode classes
- **ThemeContext** for theme state management
- **localStorage** for theme persistence
- **System preference** detection

### Theme Context

```javascript
// src/context/ThemeContext.jsx
import { useTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Switch to {isDark ? 'light' : 'dark'} mode
    </button>
  );
}
```

### Theme Classes

Tailwind dark mode classes:

```javascript
// Light mode (default)
<div className="bg-white text-gray-900">
  Content
</div>

// Dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

### Theme Persistence

Theme preference is stored in localStorage:

```javascript
// Automatically persists
localStorage.setItem('rc-preferred-theme', 'dark');
```

### System Preference Detection

Theme automatically detects system preference:

```javascript
// Detects prefers-color-scheme: dark
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

---

## Color System

### Primary Colors

```css
/* Light Mode */
--primary: #0b6e4f;        /* Emerald green */
--primary-dark: #065a42;   /* Darker green */
--primary-light: #10b981;   /* Lighter green */

/* Dark Mode */
--primary: #10b981;        /* Lighter green for dark mode */
--primary-dark: #0b6e4f;   /* Standard green */
--primary-light: #34d399;  /* Very light green */
```

### Semantic Colors

```css
/* Success */
--success: #10b981;          /* Green */
--success-dark: #059669;

/* Error */
--error: #ef4444;           /* Red */
--error-dark: #dc2626;

/* Warning */
--warning: #f59e0b;         /* Amber */
--warning-dark: #d97706;

/* Info */
--info: #3b82f6;            /* Blue */
--info-dark: #2563eb;
```

### Background Colors

```css
/* Light Mode */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;

/* Dark Mode */
--bg-primary: #111827;       /* gray-900 */
--bg-secondary: #1f2937;     /* gray-800 */
--bg-tertiary: #374151;     /* gray-700 */
```

### Text Colors

```css
/* Light Mode */
--text-primary: #111827;     /* gray-900 */
--text-secondary: #6b7280;    /* gray-500 */
--text-tertiary: #9ca3af;    /* gray-400 */

/* Dark Mode */
--text-primary: #f9fafb;      /* gray-50 */
--text-secondary: #d1d5db;   /* gray-300 */
--text-tertiary: #9ca3af;    /* gray-400 */
```

---

## Accessibility (A11y)

### WCAG 2.1 AA Compliance

RentalConnects follows WCAG 2.1 AA standards:

- **Color Contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation:** All interactive elements keyboard accessible
- **Screen Reader Support:** Semantic HTML, ARIA labels
- **Focus Management:** Visible focus indicators
- **Error Handling:** Clear error messages and validation

### Semantic HTML

Use semantic HTML elements:

```javascript
// ✅ Good
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Content</p>
  </article>
</main>

// ❌ Bad
<div className="header">
  <div className="nav">
    <div className="link">Home</div>
  </div>
</div>
```

### ARIA Labels

Add ARIA labels for screen readers:

```javascript
// ✅ Good
<button aria-label="Close modal">
  <XIcon />
</button>

<input
  type="text"
  aria-label="Search properties"
  placeholder="Search..."
/>

// ❌ Bad
<button>
  <XIcon />
</button>
```

### Keyboard Navigation

All interactive elements must be keyboard accessible:

```javascript
// ✅ Good
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</button>

// Better: Use native button
<button onClick={handleClick}>
  Click me
</button>
```

### Focus Management

Visible focus indicators:

```css
/* Focus styles */
button:focus,
a:focus,
input:focus {
  outline: 2px solid #0b6e4f;
  outline-offset: 2px;
}

/* Remove outline only for mouse users */
button:focus:not(:focus-visible) {
  outline: none;
}
```

### Skip Links

Skip to main content:

```javascript
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

<main id="main-content">
  {/* Content */}
</main>
```

### Screen Reader Only

Hide visually but keep for screen readers:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Responsive Design

### Breakpoints

Tailwind CSS breakpoints:

```css
/* Mobile First */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X Extra large devices */
```

### Responsive Classes

```javascript
// Mobile-first approach
<div className="
  w-full          /* Mobile: full width */
  md:w-1/2        /* Medium+: half width */
  lg:w-1/3        /* Large+: third width */
">
  Content
</div>
```

### Mobile Navigation

Mobile-friendly navigation:

```javascript
// Hamburger menu for mobile
<button
  className="md:hidden"
  aria-label="Toggle menu"
  onClick={toggleMenu}
>
  <MenuIcon />
</button>

<nav className="hidden md:block">
  {/* Desktop navigation */}
</nav>
```

---

## Form Accessibility

### Label Association

```javascript
// ✅ Good
<label htmlFor="email">
  Email Address
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-describedby="email-error"
  />
  <span id="email-error" className="text-red-500">
    {errors.email}
  </span>
</label>

// ❌ Bad
<div>
  Email
  <input type="email" />
</div>
```

### Error Messages

```javascript
// ✅ Good
<input
  type="email"
  aria-invalid={!!errors.email}
  aria-describedby="email-error"
/>
{errors.email && (
  <span id="email-error" role="alert" className="text-red-500">
    {errors.email}
  </span>
)}
```

### Required Fields

```javascript
// ✅ Good
<input
  type="text"
  required
  aria-required="true"
/>
<label>
  Name <span aria-label="required">*</span>
</label>
```

---

## Image Accessibility

### Alt Text

```javascript
// ✅ Good
<img
  src="/property.jpg"
  alt="Modern 2-bedroom apartment in Accra with balcony"
/>

// Decorative images
<img
  src="/decoration.jpg"
  alt=""
  role="presentation"
/>
```

### Lazy Loading

```javascript
<img
  src="/property.jpg"
  alt="Property image"
  loading="lazy"
/>
```

---

## Animation & Motion

### Reduced Motion

Respect user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Framer Motion

```javascript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

---

## Internationalization (i18n)

### Language Support

Currently supports:
- **English (en)** - Default
- **French (fr)** - Secondary

### Translation Usage

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <button onClick={() => i18n.changeLanguage('fr')}>
        {t('common.switchLanguage')}
      </button>
    </div>
  );
}
```

### Translation Keys

```javascript
// utils/translations.js
export const translations = {
  en: {
    welcome: {
      title: 'Welcome to RentalConnects',
      subtitle: 'Find your perfect home',
    },
  },
  fr: {
    welcome: {
      title: 'Bienvenue sur RentalConnects',
      subtitle: 'Trouvez votre maison parfaite',
    },
  },
};
```

---

## Testing Accessibility

### Manual Testing

1. **Keyboard Navigation:**
   - Tab through all interactive elements
   - Verify focus indicators visible
   - Check all actions work with Enter/Space

2. **Screen Reader:**
   - Test with NVDA (Windows) or VoiceOver (Mac)
   - Verify all content is announced
   - Check form labels and error messages

3. **Color Contrast:**
   - Use WebAIM Contrast Checker
   - Verify 4.5:1 ratio for normal text
   - Verify 3:1 ratio for large text

### Automated Testing

```javascript
// @testing-library/jest-dom
import { render, screen } from '@testing-library/react';

test('has accessible label', () => {
  render(<Button aria-label="Close" />);
  expect(screen.getByLabelText('Close')).toBeInTheDocument();
});
```

### Tools

- **axe DevTools** - Browser extension
- **WAVE** - Web accessibility evaluation
- **Lighthouse** - Accessibility audit
- **Color Contrast Analyzer** - Contrast checking

---

## Best Practices

### 1. Use Semantic HTML

```javascript
// ✅ Good
<nav>
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// ❌ Bad
<div className="nav">
  <div className="link">Home</div>
</div>
```

### 2. Provide Alt Text

```javascript
// ✅ Good
<img src="/image.jpg" alt="Descriptive text" />

// ❌ Bad
<img src="/image.jpg" />
```

### 3. Use ARIA Labels

```javascript
// ✅ Good
<button aria-label="Close modal">
  <XIcon />
</button>

// ❌ Bad
<button>
  <XIcon />
</button>
```

### 4. Ensure Keyboard Access

```javascript
// ✅ Good
<button onClick={handleClick}>Click</button>

// ❌ Bad
<div onClick={handleClick}>Click</div>
```

### 5. Test with Screen Readers

Always test with actual screen readers:
- NVDA (Windows, free)
- VoiceOver (Mac, built-in)
- JAWS (Windows, paid)

---

## Common Issues & Solutions

### Issue: Low Color Contrast

**Solution:**
- Use Tailwind's contrast utilities
- Test with WebAIM Contrast Checker
- Adjust colors to meet 4.5:1 ratio

### Issue: Missing Focus Indicators

**Solution:**
```css
button:focus-visible {
  outline: 2px solid #0b6e4f;
  outline-offset: 2px;
}
```

### Issue: Images Without Alt Text

**Solution:**
- Add descriptive alt text
- Use empty alt for decorative images
- Use aria-label for background images

### Issue: Form Labels Not Associated

**Solution:**
```javascript
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)

---

**Last Updated:** January 2026  
**Maintained By:** Frontend Team
