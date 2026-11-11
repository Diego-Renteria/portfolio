# Physical surface textures

Original 1K JPEG material maps downloaded from Poly Haven's public asset API on 2026-10-10. The files are unchanged; each download was checked against the MD5 supplied by the API.

All three assets are released under **CC0 1.0**. Poly Haven permits use and redistribution, including commercial projects. Attribution is retained here voluntarily.

- [Poly Haven asset license](https://polyhaven.com/license)
- [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)

## Assets and authors

| Asset | Author | Physical tile size | Primary source | API file manifest |
| --- | --- | --- | --- | --- |
| Red Brick 03 | Rob Tuytel | 1 × 1 m | [Asset page](https://polyhaven.com/a/red_brick_03) | [Files](https://api.polyhaven.com/files/red_brick_03) |
| Wood Floor Deck | Dimitrios Savva | 1.8 × 1.8 m | [Asset page](https://polyhaven.com/a/wood_floor_deck) | [Files](https://api.polyhaven.com/files/wood_floor_deck) |
| Plastered Wall 04 | Rob Tuytel | 3.2 × 3.2 m | [Asset page](https://polyhaven.com/a/plastered_wall_04) | [Files](https://api.polyhaven.com/files/plastered_wall_04) |

## Included files

| File | Bytes | Source MD5 |
| --- | ---: | --- |
| `red_brick_03_diff_1k.jpg` | 694500 | `d157c6d6dd774762b4269927a87fe9b5` |
| `red_brick_03_rough_1k.jpg` | 286623 | `8f16439361c5fe27f9df03be279ce8c9` |
| `red_brick_03_nor_gl_1k.jpg` | 955430 | `e89ce432d9160edb7c902f901756865f` |
| `wood_floor_deck_diff_1k.jpg` | 925789 | `186a695239216a4b9dc970a87d6dbb15` |
| `wood_floor_deck_rough_1k.jpg` | 658448 | `ff891ac48e0a9db02a665d2ae9bba36a` |
| `wood_floor_deck_nor_gl_1k.jpg` | 665094 | `dddabd549ede92e370d5268b0d895179` |
| `plastered_wall_04_diff_1k.jpg` | 299230 | `3a45e9e3ff0c6aa179371dff02bded1f` |
| `plastered_wall_04_rough_1k.jpg` | 243061 | `66c89044921accf705665e4ea9ba1d66` |
| `plastered_wall_04_nor_gl_1k.jpg` | 427268 | `f18e649235bb688732fb0ef1d61a5286` |

Total: 5,155,443 bytes (approximately 4.92 MiB).

## Rendering conventions

- `_diff_` maps contain surface color and must be interpreted as sRGB.
- `_rough_` maps contain scalar roughness data and must remain linear / without a color-space transform.
- `_nor_gl_` maps contain OpenGL tangent-space normals and must remain linear / without a color-space transform. These are the +Y maps expected by Three.js.
- Apply matching texture repeat and UV transforms to all three maps of a material. Prefer world dimensions divided by the physical tile size over a fixed repeat count when geometry permits.
- The deck texture includes broad boards and wear; use it for floors and counters rather than treating its seams as the grain of every small wooden object.
- Keep the existing procedural surface as a fallback while images load. These maps add surface relief without multiplying the geometry of detailed rooms.

Runtime maps are 768px WebP derivatives; original 1K JPEGs are retained in assets-source/original-material-scans in the source repository.
