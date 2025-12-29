# Design Document: Professional UI Enhancement

## Overview

This document outlines the design system and architectural decisions for transforming SlideWhisper's UI into a professional, modern interface.

## Design System

### Color Palette

```css
/* Primary Colors */
--color-primary: #e85a1c;         /* Refined PowerPoint orange */
--color-primary-hover: #d04d12;   /* Darker for hover states */
--color-primary-light: #fff5f0;   /* Light background tint */

/* Neutral Colors */
--color-bg-primary: #fafafa;      /* Main background */
--color-bg-secondary: #ffffff;    /* Cards and panels */
--color-bg-tertiary: #f5f5f5;     /* Subtle sections */

--color-text-primary: #1a1a2e;    /* Main text */
--color-text-secondary: #6b7280;  /* Secondary text */
--color-text-muted: #9ca3af;      /* Muted text */

/* Accent Colors */
--color-success: #10b981;         /* Success states */
--color-border: #e5e7eb;          /* Borders */
--color-border-hover: #d1d5db;    /* Border hover */

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
```

### Typography

- **Font Family**: Inter (Google Fonts) with system fallbacks
- **Heading Weight**: 600-700 (semibold to bold)
- **Body Weight**: 400-500 (regular to medium)
- **Font Sizes**: 
  - Header: 18px
  - Body: 14px
  - Labels: 12px
  - Small: 11px

### Spacing System

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

### Border Radius

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;
```

## Component Updates

### Header
- Subtle gradient or refined solid background
- Drop shadow for elevation
- Improved icon button styling

### Dropdown Controls
- Refined borders with subtle shadows
- Custom appearance with focus rings
- Smooth hover/focus transitions

### Buttons
- Primary: Gradient or solid with subtle shadow
- Secondary: Outlined with hover fill
- Smooth scale and shadow transitions on hover

### Cards (Output Box)
- White background with refined shadow
- Subtle border for definition
- Comfortable padding

### Action Buttons
- Icon + text alignment
- Hover animations (scale, shadow)
- Clear visual hierarchy (primary vs secondary)

### Status Footer
- Refined typography
- Success/error state colors
- Subtle animations for status changes

## Animation Guidelines

- **Duration**: 150-200ms for micro-interactions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for natural feel
- **Properties**: transform, opacity, box-shadow (GPU-accelerated)

## Responsive Considerations

- Maintain good appearance in narrow task pane (typically 300-400px)
- Flexible layout with proper wrapping
- Touch-friendly tap targets (minimum 44px)

## Browser Compatibility

- Target: Office Add-in WebView (Edge-based)
- Use CSS features with good Edge support
- Avoid experimental features that may not work in WebView
