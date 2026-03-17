# Time Lens - Changelog

## v6.8.0 (2026-03-17)

### UI/UX restructure
- Rebuilt the product around day/week operational canvases instead of a sidebar-led navigation model.
- Added a unified desktop dock and refreshed mobile navigation to match the new structure.
- Moved monthly and yearly context into day/week summary areas so panorama data supports execution rather than competing with it.

### Interaction improvements
- Split time block gestures into three clear paths: tap to edit, long-press to charge, drag handle to move.
- Replaced long-press text overlays with icon-based charging feedback.
- Stopped long-press from forcing tag selection or reflection entry.
- Removed default reflection filler text and reduced reflection text emphasis under tag labels.
- Replaced the broken pomodoro placeholder rendering with clean icon-based counting.

### Sync and state stability
- Added timestamp-based merge logic for settings and block sync to reduce overwrite conflicts after login or page navigation.
- Synced theme preferences and tag color changes through a unified settings pipeline.
- Extended Supabase settings support for `tags_json`, weekly detail preferences, and energy goals.

### Documentation and release maintenance
- Updated `README.md` to match the current product direction and technical workflow.
- Rewrote `CHANGELOG.md` into a clean release history format.
- Bumped project version metadata to `v6.8.0`.

## v6.7.0

### Planning and energy goals
- Introduced smoother day/week view switching.
- Added stronger energy-goal presentation and interaction fixes across the main planning surfaces.

## v6.6.0

### Time block interaction baseline
- Added long-press charging.
- Added drag-to-move for time blocks.
- Shifted the default visual emphasis toward the emerald theme direction.

## v6.5.1 (2026-03-16)

### PWA and storage
- Added PWA conversion work for mobile installation and offline behavior.
- Strengthened local-first storage behavior and controlled cloud sync entry points.
- Expanded documentation and project maintenance standards.

## v6.2.0 (2026-03-14)

### Interaction refinement
- Reworked the record modal flow and simplified current-hour pomodoro behavior.
- Added stronger current-time highlighting in day and week views.
- Expanded dashboard analytics and heatmap-based visualization.

## v6.1.2 (2026-03-14)

### Documentation normalization
- Added and organized development standards documentation.
- Standardized root-level documentation layout.

## v6.1.0 (2026-03-14)

### Theme and cloud-sync foundation
- Introduced unified theme-color linkage across rating, week cells, and major UI surfaces.
- Integrated the Supabase foundation for future multi-device sync.
- Fixed several dark-mode and visual consistency issues.

## v6.0.0 (2026-03-14)

### V6 baseline
- Added dynamic theme support.
- Added integrated pomodoro behavior in the record modal.
- Folded sleep hours by default to improve focus density.
