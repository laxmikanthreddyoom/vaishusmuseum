# Our Little Museum — Three.js starter

A browser-based romantic photo museum built with HTML, CSS and JavaScript / Three.js.
Run it with VS Code **Live Server** (do not open `index.html` as a `file://` URL).

## Run
1. Open this folder in VS Code.
2. Install/enable the **Live Server** extension.
3. Right-click `index.html` → **Open with Live Server**.
4. Allow the page to load the Three.js modules from jsDelivr (internet required).

## Included
- An opening title page with a **Start** button and optional full-screen mode, followed by character selection and a controls guide before entering the museum.
- Character selection with only the chosen GLB shown over the museum entrance; drag the character or use the turn buttons to rotate it.
- Expanded 56 × 56 gallery with lighter warm-neutral walls, a white marble floor, warm ivory ground-floor ceiling lights, focused frame spotlights, small glass botanical displays, a large central photo display, a high-resolution romantic quote plaque, and gold-trimmed memory frames of varied sizes. Fourteen blue-glass stairs screened behind the central feature wall lead to an open, partition-free upper gallery with ceiling focus lights, additional memory frames (including an oversized feature frame), and matching glass flower displays.
- A decorative double-door entrance on the right-side wall, styled as the gallery's main entrance; the small brown door has been removed.
- The visitor name entered on the character screen appears as slightly larger, unboxed text above the selected character in the museum.
- A new oversized memory frame fills the open center of the ground-floor back wall. The glass-and-gold flower displays are also repeated on the upper floor.
- A memory opens only when the visitor is close, in front of it, and facing it; clicking a distant frame does not open it. The contextual photo/E prompt appears under a reachable frame. Walking and running are faster.
- The upper-floor center has an open photo album protected by a glass display case. Walk near it and press **E** or click the case to browse every museum photo using the on-screen arrows or keyboard arrow keys.
- A visitor name is required before entering. Five MP3 tracks in `assets/` start automatically in the museum and play in a continuous loop; use the music-note button to pause or resume them. The toolbar also includes first-/third-person camera views, reactions (Wave, Nice, Agree, Celebrate, Blow a kiss, and Dance), and settings for graphics quality, FPS limit, visual style, field of view, look sensitivity, names/HUD visibility, inverted look, and audio levels. Music and reaction sounds can be muted or adjusted.
- The settings panel can enable adaptive resolution. Use the camera settings or toolbar button to switch between over-the-shoulder and first-person views; drag over the gallery to look around. There is no FPS/ms counter on the museum screen.
- The upper floor remains open, with focus lights added to the ceiling and additional overhead clearance to prevent overlapping ceiling/floor geometry. The lower-gallery ceiling is now a lighter warm neutral. The dedication quote has been reduced, with a heart and “Vaish” below it.
- Character selection includes a tabbed skin, hair, eyes, brows, shirt, waistcoat, trousers, and shoes palette, with preset and custom colors plus a reset control. Colors apply to both the preview and museum visitor where the supplied character model exposes a matching mesh; eye, brow, or waistcoat changes may require a model with those separate parts.
- A separate screening room with a black wall display and a bench set back from the screen. Walk near the screen, press **E** (or click it), and choose a video file from your device; press **E** again to pause or resume it.
- Walk directly in front of a photo frame and press **E** (or click it while nearby and facing it) to view the full-resolution photo with its own quote.
- Walk near the screening-room bench and use **F** or the on-screen action button to sit or stand; the seated pose keeps the hands relaxed and raises the hips above the seat.
- Exit door: walk close and press **E** / tap the action button to return to character selection.
- Keyboard movement: **WASD** or arrow keys; walking speed is 4.5 and holding **Shift** while moving (for example **Shift + W**) runs at speed 7.
- Reach the open upper gallery by going around the right side of the central feature wall, continuing behind it, and holding **A** to walk up the stairs.
- Mobile: on-screen joystick and action button.

## Add realistic animated characters (GLB)
The entry screen and museum are ready to load:
- `assets/models/boy.glb`
- `assets/models/girl.glb`

Put your rigged GLB files at those exact paths. Only the selected character is shown on the entry screen, facing forward in a held standing pose with neutral rigged legs and relaxed upper body (or using its dedicated idle clip if available); drag the preview or use the arrow buttons to turn it. The current museum models each have a single `mixamo.com` walk clip: the character walks only while a movement control is held, keeps its arms relaxed, and returns to the neutral-leg standing pose when the control is released. Root hip translation is removed from the walk cycle to prevent the model snapping back when its animation loops. WASD/arrow keys and the mobile joystick control movement; drag the mouse over the museum to orbit the camera around the character and look from different directions. Gallery walls and partitions block the character. Separate `idle`, `walk`, and `run` clips can provide more natural transitions. The GLB armature scale is preserved; character display scale and camera distance are tuned for a closer view. The museum character turns with movement controls. The museum has a simple procedural fallback so it still opens if a model file is missing.

The entry-screen background is `assets/museum-background.png`.

You can create/download and rig characters with Blender or Mixamo. Check the model's license before using it. If Mixamo exports FBX, import it into Blender and export as GLB, or convert it using a trusted GLTF workflow.

## Replace photos and captions
The photos currently in `assets/pictures/` are split between ground-floor and upper-floor frames so the same photo does not appear on both floors. The upstairs frames include `y 1.jpeg` through `y 13.jpeg`, and the upstairs album can browse the full collection. To change the collection, update the `pictureFiles` array and, if needed, the matching `photoQuotes` entries near the top of `main.js`. Frames preserve each image's aspect ratio and fit it inside the frame; clicking a frame opens the full image with its quote.

Use photos you have permission to share. If you publish the site, remember that the images will be accessible to visitors.

The featured photo on the central gallery wall uses the second entry in the `memories` array when available, with its matching quote on the plaque. The same image and quote are available by clicking its frame.

## Notes / current prototype limitations
- This is a starter, not a finished AAA game. Character loading and animation depend on the GLB files you supply.
- The supplied screenshots are used as photo-gallery source images in this starter. Replace them with your actual couple photos if any are only design references.
- The camera follows the character, and dragging the mouse over the museum changes the viewing angle.
- The bench uses a simple seated leg pose. A dedicated `sit` animation in the character GLB can provide a more natural seated animation.
- Mobile performance depends on the phone and model polygon count. Prefer optimized GLBs (roughly under 10–15 MB each).
