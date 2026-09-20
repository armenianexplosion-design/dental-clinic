# Cinematic scroll enhancement

## Goal
Use the uploaded Aurevia site as the exact visual source and change only its scrolling behavior. At rest, every section keeps its existing colors, type, layout, spacing, content, imagery, controls, navigation, language switching, and responsive composition.

## Motion direction from the reference
- Use long, scrubbed scroll sequences rather than isolated entrance effects.
- Let existing imagery scale, drift, rotate subtly, and move in depth while copy follows at a different rate.
- Keep selected sections pinned long enough for layered transitions to complete.
- Carry visual momentum across section boundaries so the page feels like one continuous sequence.
- Keep motion restrained and editorial; no blanket fade-up treatment and no animation on every element.

## Implementation
1. **Restore the supplied website unchanged**
   - Bring the uploaded Aurevia source, assets, translations, legal pages, 3D model, and existing interactions into the project without altering visual content.
   - Confirm the static desktop, tablet, and mobile compositions match the supplied build before layering motion.

2. **Add the scroll engine**
   - Add Lenis for smooth input and connect it to GSAP ScrollTrigger through a single lifecycle-managed scroll controller.
   - Preserve anchor navigation, form controls, horizontal touch rails, menu scroll locking, and browser history behavior.
   - Respect reduced-motion preferences with immediate native scrolling and stable end states.

3. **Choreograph existing sections**
   - **Opening:** retain the existing pinned composition, but coordinate image scale, lateral drift, slight rotation/perspective, copy drift, and the transition into the statement section.
   - **Statement:** keep the same words and layout while turning the sequence into a scrubbed editorial handoff with controlled overlap.
   - **Treatments and process:** preserve the current cards and horizontal rails; drive them through pinned scroll with eased momentum, layered heading movement, and depth in the existing image/3D scene.
   - **Approach:** animate the existing sticky studio image with crop-preserving scale, vertical counter-movement, and slight rotation while principles pass independently.
   - **Team and results:** add limited alternating image/card depth and section overlap using the current staggered composition; preserve sliders and card interaction.
   - **Pricing, reviews, FAQ, contact:** keep interaction and layout unchanged; use only low-amplitude section-level parallax and continuous transition timing where it supports the overall sequence.
   - **Final blue section:** keep its design intact while applying a restrained pinned scale/perspective transition into contact.

4. **Responsive behavior**
   - Use desktop, tablet, and phone-specific motion ranges without changing their layouts.
   - Retain meaningful pinning and parallax on smaller screens, with shorter distances, smaller rotation, and touch-safe horizontal content.
   - Recalculate triggers after fonts, images, language changes, viewport changes, and orientation changes.

5. **Validation**
   - Compare before/after screenshots at matching scroll positions to confirm static visuals are unchanged.
   - Test the full scroll sequence and interactive controls on desktop, tablet, and phone sizes.
   - Check for jumping, overlaps, clipped text, stuck pinning, broken anchor links, scroll-lock conflicts, and runtime errors.
