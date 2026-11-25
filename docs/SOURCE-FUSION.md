# Expert sources in exercise search

A source merge preserves both original unreviewed entries. Only active,
Coach-approved expert entries supersede their confirmed source IDs in search.
Draft links and stale merged_into flags do not suppress originals. Explicit
source_selection decisions override old scalar/external references; unlinking or
correcting restores the former original unless another expert still references it.

The same pure visibility contract in src/lib/db/shared/catalogSources.js is used
for Firestore and local mirror search. Bundled Push/Pull/Legs experts participate
in the search pool alongside Cloud updates. The generator preserves external_ids
and source_selection so corrections retain their meaning in client bundles.

Validation: node --test src/lib/db/shared/catalogSources.test.mjs.
