# Mapping

An interative map of NYC that displays:

- neighborhoods
- Schools
- students + filter legend + finding the nearest _n_ hospitals

The Leaflet library was used for the majority of this project. There is no additional installation needed for Leaflet, as all of the necessary components are either part of the repo or linked to a CDN. [More about Leaflet here](https://leafletjs.com/)

<img src='walkthrough.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />
GIF created with [LiceCap](http://www.cockos.com/licecap/). \

**Steps to Install (Locally):**

1. Make sure `Node` and `npm` are installed
2. `git clone https://github.com/liua13/Mapping.git`
3. cd `Mapping`
4. Install all necessary dependencies: `npm install`
5. Start the server: `node app.js`
6. The project runs on `127.0.0.1:5000` or `localhost:5000` by default. If there are any issues, check to make sure that all necessary dependencies are installed.

**Documentation:**

_Important variables:_

- `map`: The whole map
- `studentFields`: An array of all of the fields that you want to extract from a json file containing students JSON file. You can add or delete fields by changing the contents of this array.
- `studentLayer`: The cluster layer containing all markers from the students data. This layer is added to control panel at upper right part of the map.
- `dataFacilities`: A dictionary containing information about which files you want to upload as layers to the map. The keys are the labels that appear on the control panel on the upper right hand side of the map; the values are dictionaries containing information about the JSON file to extract the layer data and the image to use as the marker icon for that specific layer. You may add or delete layers by changing the contents of this dictionary.
- `layerResults`: A dictionary containing cluster and marker icon information for each layer of `dataFacilities`. When `layerResults` and `dataFacilities` have the same number of keys (aka same length), then the layer control panel at the upper right part of the page is created.

_Functions:_

- `createPanel()`: Creates the gray-transparent box that appears on the lower left hand side of the map when you hover over a NYC neighborhood.
- `onEachNeighborhoodFeature()`: Binds popup text to each neighborhood (the popup text appears on the gray-transparent box described above)
- `createDictionary()`: Given an array of fields, creates a dictionary where the keys are the fields and the values are empty sets. This is so that the dictionary can grab all of the distinct values from the data and for filter panel (see `createFilterPanel()`)
- `createStudentDataPopup()`: Creates popup markers from students data based on filter legend (using function `filterData()`) on the right hand side of the page (see `createFilterPanel()`). If no latitude and longitude data are available for a specific data point, then marker is not displayed on the map.
- `createFilterPanel()`: Creates the filter panel on the right hand side of the page (outside of the map). Allows for filtering of students data.
- `filterData()`: Returns true if marker satsifies filter legend and returns false otherwise.
- `resetCheckBox()`: If the user clicks a field that **is not** ALL or NONE, then it unchecks the ALL or NONE field.
- `allOrNoneCheckbox()`: If the user clicks a field that **is** ALL or NONE, then it unchecks all of the other fields.
- `convertToGeoJson()`: Converts JSON to GeoJSON. **Note:** The conversion is based on a specific JSON structure and function will not run properly if the JSON file does not follow this structure.
- `createFacilities()`: Adds the hospitals.
- `loadData()`: Loads in data for the hospitals.
- `createIcon()`: Creates a marker icon based on specified image file.
- `findNearestMarker()`: Uses [Leaflet KNN](https://github.com/mapbox/leaflet-knn) to find the nearest _n_ markers of a specific layer from the selected marker. Draws a line from the selected marker to the nearest _n_ markers.
- `allLayersLoaded()`: When `layerResults` and `dataFacilities` have the same number of keys (aka same length), then the layer control panel at the upper right part of the page is created.
