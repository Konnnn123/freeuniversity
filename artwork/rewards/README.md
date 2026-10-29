# First campus collection — 36 sprites

Generated using the built-in image_gen tool, with one separate generation per collectible and genuine transparent backgrounds. Six groups of six items use a shared warm cream, sage, lavender and honey-wood pixel-art direction.

- Website delivery files: `public/rewards/*.png` (36 complete, transparent 256 × 256 sprites; approximately 2 MB combined).
- Full-resolution originals are also saved in the task workspace at `../reward-artwork-originals/` relative to this Site checkout. The originals returned by the image tool remain intact.
- Subject list and generation style: [prompts.json](prompts.json); exact generation prompts: [generation-prompts.json](generation-prompts.json).
- IDs, Chinese labels, collection groups and campus dimensions: [rewardCatalog.ts](../../src/rewardCatalog.ts).

Delivery conversion only changes image dimensions and encoding for loading speed, using nearest-neighbour sampling and preserving alpha and the complete generated object. These assets are fixed website files. Course-generation API calls do not create or modify reward images.

Collecting: a completed chapter earns one choice. Existing completion records are backfilled. A PDF chapter keeps its source identity across course regeneration. Already collected items are kept when course deletion retains learning records. After the full collection is unlocked, further chapter choices can add placeable copies.

Find the collection at **成果馆 → 收藏图鉴**, or from the campus build inventory. Uncollected items are marked **未解锁**. Collected items can be placed, moved and returned; returning an item makes its copy available in the inventory again.
