## Context
SlideWhisper currently processes slides in isolation. Each time a user navigates to a different slide in PowerPoint, the add-in interface does not update automatically and retains the previous slide's content. This creates friction in the user workflow and prevents users from building up a complete set of speech scripts across their presentation.

The MVP goal is to make the add-in "slide-aware" - automatically detecting when users switch slides and displaying the appropriate content (either saved history or a prompt to generate).

### Constraints
- **Office.js API**: Must use `Office.EventType.DocumentSelectionChanged` for automatic detection
- **Storage**: Use `Office.context.document.settings` (document-scoped) rather than localStorage (browser-scoped) to ensure history travels with the PPT file
- **Vanilla JS**: No frameworks, maintain existing IIFE pattern for service objects
- **Progressive Enhancement**: Feature should gracefully degrade if APIs unavailable

## Goals / Non-Goals

### Goals
- ✅ Automatically detect slide changes and update UI accordingly
- ✅ Persist script history per slide within the PowerPoint document
- ✅ Provide simple UI to view and access previously generated scripts
- ✅ Reduce workflow friction from 3 steps per slide to 1 step
- ✅ Preserve existing functionality (regenerate, copy, settings)

### Non-Goals
- ❌ Batch generation (deferred to V1.1)
- ❌ Slide thumbnails in history list (deferred to V2.0)
- ❌ Cloud syncing or cross-device access
- ❌ Export/import history as separate files
- ❌ Undo/redo for scripts

## Decisions

### Decision 1: Use Office.context.document.settings for Storage
**Rationale**: 
- localStorage is browser-scoped, meaning history would be lost when opening the same PPT on a different machine or browser
- Office.context.document.settings stores data within the PowerPoint file itself, preserving history across sessions and devices
- Aligns with user expectation that work is saved "in the document"

**Alternatives considered**:
- localStorage: Rejected due to lack of portability
- External database: Rejected due to complexity and requiring backend infrastructure
- Cloud sync (OneDrive): Deferred to future version as it requires authentication flow

**Implementation**:
```javascript
// Save
Office.context.document.settings.set('slideHistory', JSON.stringify(historyData));
await Office.context.document.settings.saveAsync();

// Load
const data = Office.context.document.settings.get('slideHistory');
const historyData = data ? JSON.parse(data) : {};
```

### Decision 2: Event-Driven Auto-Switching
**Rationale**:
- PowerPoint provides `Office.EventType.DocumentSelectionChanged` to notify when selection changes
- This is the official, supported way to detect slide navigation
- Event-driven approach is more reliable than polling

**Alternatives considered**:
- Polling every N seconds: Rejected due to battery drain and lag
- Manual "Refresh" button: Rejected as it defeats the "automatic" goal

**Implementation**:
```javascript
Office.context.document.addHandlerAsync(
  Office.EventType.DocumentSelectionChanged,
  onSlideChanged
);
```

### Decision 3: Slide ID as Primary Key
**Rationale**:
- `getSlideIndex()` from CaptureService returns 1-based slide number
- While slide numbers can change if slides are reordered, this is acceptable for MVP
- Using stable GUIDs would require deeper PowerPoint API integration not available in 1.8

**Known limitation**: If user reorders slides, history mappings may be incorrect. This is acceptable for MVP and can be addressed in V1.1 with slide GUID tracking if PowerPointApi 1.9+ is available.

### Decision 4: Simple Collapsible History List
**Rationale**:
- Keeps UI clean by default (collapsed state)
- Users can expand to see all generated slides
- Clicking a history item navigates to that slide in PowerPoint

**Layout**:
```
┌─ Generated History (3 slides) ─────────┐
│ ▼ Slide 1: "Introduction"         [🗑] │
│ ▼ Slide 2: "Problem Statement"    [🗑] │
│ ▶ Slide 5: "Solution Overview" (Current) │
└─────────────────────────────────────────┘
```

### Decision 5: Keep Session Memory for Flow Continuity
**Rationale**:
- Existing `sessionMemory` provides valuable context for consecutive slide generation
- History storage and session memory serve different purposes:
  - History = long-term persistence
  - Session memory = short-term context for AI prompting
- Keep both systems working together

## Data Schema

### Slide History Structure
```javascript
{
  "1": {
    slideId: 1,
    slideTitle: "Introduction",  // Extracted from slide or empty
    script: "Welcome everyone...",
    timestamp: 1672531200000,
    options: {
      tone: "professional",
      length: "medium",
      language: "auto"
    }
  },
  "3": { ... },
  ...
}
```

Stored as single JSON string in `Office.context.document.settings` under key `slideHistory`.

## Risks / Trade-offs

### Risk 1: Slide Reordering Breaks History Mapping
**Impact**: If user reorders slides, Slide 3's history might display for what is now Slide 5
**Mitigation**: 
- Document limitation in README
- Show slide title in history list to help users identify mismatches
- Plan for V1.1: Use slide GUIDs if API supports it

### Risk 2: Settings Storage Size Limit
**Impact**: `Office.context.document.settings` has size limits (typically 2MB)
**Mitigation**:
- Implement history item limit (e.g., max 50 slides)
- Provide "Clear History" functionality
- Calculate storage: ~2KB per script × 50 slides = ~100KB (well under limit)

### Risk 3: DocumentSelectionChanged Event Compatibility
**Impact**: Older Office versions may not support this event
**Mitigation**:
- Wrap event registration in try-catch
- Fall back gracefully to manual refresh mode (show message: "Auto-detection unavailable, use Analyze button")
- Document requirement: PowerPointApi 1.8+

### Risk 4: Concurrent Saves (Race Condition)
**Impact**: Rapidly switching slides during generation could cause save conflicts
**Mitigation**:
- Debounce slide change handler (200ms delay)
- Queue save operations rather than parallel writes
- Use `saveAsync` callbacks to confirm save before next operation

## Migration Plan

### For New Users
- Feature available immediately on first use
- No migration needed

### For Existing Users
- Add-in will start with empty history
- Previously generated scripts won't be retroactively added
- Non-breaking: all existing features continue to work
- Users will naturally build up history as they use the enhanced version

### Rollback Plan
If critical issues arise:
1. Revert to previous version via manifest update
2. History data remains in document (harmless)
3. Can re-enable when fixed

## Performance Considerations

### Event Handler Performance
- Slide change detection: <10ms (native event)
- History lookup: O(1) dictionary access
- UI update: <50ms to re-render result section

### Storage Performance
- Save operation: ~100ms (async, non-blocking)
- Load operation: ~50ms (async, non-blocking)
- Settings.saveAsync() is batched by Office.js

## Open Questions

1. **Q**: Should history list show slide titles or just numbers?
   **A**: Show titles when available (extracted from slide), fallback to "Slide N" if empty

2. **Q**: Should we allow editing saved scripts in history?
   **A**: No for MVP. User can click history item to navigate and regenerate. Editing deferred to V1.1.

3. **Q**: Maximum history size?
   **A**: Start without hard limit, add if users report issues. Provide "Clear All" as manual cleanup.

4. **Q**: Should navigating via history list also jump the PowerPoint slide?
   **A**: Yes. Use `PowerPoint.run()` to set active slide to match selected history item.
