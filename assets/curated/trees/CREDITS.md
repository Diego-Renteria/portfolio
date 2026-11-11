# Imported tree geometry and textures

Tree geometry is generated offline by **EZ-Tree**, Daniel Greenheck, under the MIT license. Source: https://github.com/dgreenheck/ez-tree ; pinned source commit `dcf309bd86bd521083d9c70f01f2de45fdc7c457` (package version 1.1.0). Complete source and original license are retained in `source/` and `LICENSE-EZ-TREE.txt`.

The `ash`, `aspen`, `oak`, and `pine` foliage images are the source project's textures, under its MIT license. Runtime WebP derivatives are resized to 512 pixels. Autumn broadleaf derivatives neutralize the source green pigment while preserving the original leaf alpha masks, veins, and lighting detail, allowing coordinated autumn instance colors. Pine retains its natural green texture.

Bark001 color, normal, and roughness maps are from ambientCG, CC0: https://ambientcg.com/view?id=Bark001 . Runtime JPEG derivatives are resized to 512 pixels. Original upstream texture attribution is retained in `TEXTURE-LICENSE.md`.

Generated variants use the source Ash, Aspen, Oak, and Pine presets with deterministic seeds and EZ-Tree's skeleton-based geometry reduction. Geometry is normalized to each original planting site's existing height and radius to preserve roadway and storefront clearance. The local runtime does not execute the tree generator.

Unmodified source texture images are retained in assets-source/curated-tree-originals in the source repository; only optimized runtime derivatives are deployed.
