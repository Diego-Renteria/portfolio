# City Atlas sources

## Map data

The local `sea.json` and `nyc.json` files contain transformed map coordinates, derived building heights, road strips, tree points, and terrain samples. The geographic source data is identified below. The OpenStreetMap-derived data is made available under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). It comes from [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright). Download the [Seattle extract](https://api.openstreetmap.org/api/0.6/map?bbox=-122.3447,47.6022,-122.3311,47.6120) or the [Lower Manhattan extract](https://api.openstreetmap.org/api/0.6/map?bbox=-74.0161,40.7019,-74.0038,40.7105). These links fetch the current map.

- New York buildings and roof heights from [NYC Open Data Building Footprints](https://data.cityofnewyork.us/City-Government/Building-Footprints/3g6p-4u5s). Tree points from [NYC Parks’ 2015 Street Tree Census](https://data.cityofnewyork.us/Environment/2015-Street-Tree-Census-Tree-Data/uvpi-gqnh).
- Seattle building outlines from [City of Seattle Building Outlines 2023](https://catalog.data.gov/dataset/building-outlines-2023). Tree points from [Seattle Department of Transportation’s tree inventory](https://services.arcgis.com/ZOyb2t4B0UYuYNYH/arcgis/rest/services/SDOT_Trees_CDL/FeatureServer).
- Shorelines, streets, mapped building tags, and some building heights from OpenStreetMap. Remaining heights are modeled from mapped floor counts or estimated from footprints.
- Neighborhood slopes are adapted from the [Copernicus DEM GLO-90](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM) via the [Open-Meteo Elevation API](https://open-meteo.com/en/docs/elevation-api). Vertical dimensions are compressed for the miniature globe. Façades, windows, and most signage are artist interpretations.

## Space assets

- Milky Way photograph-style star map by [NASA’s Scientific Visualization Studio, Deep Star Maps 2020](https://svs.gsfc.nasa.gov/4851/), with a color grade and crop for the atlas.
- Three spaceship models from the [Kenney Space Kit](https://kenney.nl/assets/space-kit), published as CC0. See KENNEY-LICENSE.txt.
