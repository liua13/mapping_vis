// sets up map
let map = L.map("mapid").setView([40.73061, -73.935242], 11);
L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGl1YTEiLCJhIjoiY2s1dmk1cHFnMWt0bDNrbm51bnp4dWpnNSJ9.bC8XaM5r2Kot4XVVD5l76g",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/streets-v11",
  }
).addTo(map);

// -------------------- creates info panel for NYC neighborhood shapefiles --------------------
function createPanel(element, className, position) {
  // adds info panel on bottom left of map
  let panel = L.control({
    position: position,
  });

  panel.onAdd = function (map) {
    this._div = L.DomUtil.create(element, className); // div with class 'info'
    this.update();
    return this._div;
  };

  return panel;
}

// creates info panel
let infoPanel = createPanel("div", "infoPanel", "bottomleft");

infoPanel.update = function (info) {
  this._div.innerHTML = info != null ? "<p>" + info + "</p>" : "";
};

infoPanel.addTo(map);

// -------------------- loads in NYC neighborhoods shapefiles --------------------
let neighborhoods = new L.Shapefile("data/neighborhoods.zip", {
  onEachFeature: onEachNeighborhoodsFeature,
  // filter: function (feature, layer) {
  //   return feature.properties["city"] == "NYC";
  // },
  style: { weight: 1 },
}).addTo(map);

// applies to each feature, layer of NYC neighborhoods shapefile
function onEachNeighborhoodsFeature(feature, layer) {
  // hovering over
  layer.on("mouseover", function (e) {
    let info = Object.keys(feature.properties)
      .map(function (k) {
        return k + ": <b>" + feature.properties[k] + "</b>";
      })
      .join("<br>");
    infoPanel.update("<b>Shape Info</b><br><br>" + info);
    layer.setStyle({ color: "red" });
  });

  // hovering out
  layer.on("mouseout", function (e) {
    layer.setStyle({ color: "blue" });
    infoPanel.update();
  });
}

// -------------------- loads in students data --------------------
const studentIcon = createIcon("assets/graphics/studenticon.png");
$.ajax({
  dataType: "json",
  url: "data/students.json",
}).done(function (data) {
  createStudentDataPopup(data, studentIcon);
  createFilterPanel();
  for (let input of $(":input")) {
    //Listen to 'change' event of all inputs
    input.onchange = function (e) {
      createStudentDataPopup(data, studentIcon);
    };
  }
});

// creates dictionary; keys: field names, values: empty set (to later store all distinct values)
function createDictionary(keys) {
  newDict = {};
  for (key of keys) {
    newDict[key] = new Set();
  }
  return newDict;
}

// all fields you want from the student data
let studentFields = ["name", "grade"];

studentFields = createDictionary(studentFields);

// creates a marker cluster of popups & adds distinct values (ex: yes, no) from each field to allFields dictionary
let studentLayer = L.markerClusterGroup();

function createStudentDataPopup(data, icon) {
  if (studentLayer) {
    studentLayer.clearLayers();
    map.removeLayer(studentLayer);
  }

  for (let i = 0; i < data.length; i++) {
    let dataRow = data[i];
    let longitude = dataRow["longitude"];
    let latitude = dataRow["latitude"];
    if (longitude && latitude && filterData(dataRow)) {
      // creates popup text
      let popup = "";

      for (const field in studentFields) {
        // rest of the fields
        popup += field + ": <b>" + dataRow[field] + "</b><br> ";
        studentFields[field].add(dataRow[field]); // adds distinct values to allFields dictionary
      }

      popup += `<br/><form onsubmit="findNearestMarker([${longitude}, ${latitude}], this); return false;">`;
      popup += `<b>Select a facility: <select id="nearestfacility" name="nearestfacility"></b>`;

      Object.keys(dataFacilities).forEach((key) => {
        popup += `<option value="${key}">${key}</option>`;
      });

      popup += `</select><br/>`;
      popup += `<b>Max # of markers (integer only):</b> <input type="text" size="10" name="number" id="number" value=1 onkeypress="return event.charCode >= 48 && event.charCode <= 57"/>`;
      popup += `<br/><input type="submit">`;
      popup += `</form>`;

      // creates marker, making sure width spans width of text
      let marker = L.marker([latitude, longitude], { icon }).bindPopup(popup, {
        maxWidth: "auto",
      });
      studentLayer.addLayer(marker); // adds marker to cluster
    }
  }
  map.addLayer(studentLayer);
}

// -------------------- creates filter legend panel for students data --------------------
function createFilterPanel() {
  let filterPanel = $("#filterPanel");
  let filterText = "<h3>Filter Legend</h3>";
  for (let field in studentFields) {
    filterText += `<div class="field-container">`;
    filterText += `<h4>${field}</h4>`; // field name

    for (let value of studentFields[field].values()) {
      filterText += `&emsp;<input class="${field}" type="checkbox" name="${field}" value="${value}" onClick="resetCheckBox('${field}')">${value}<br>`; // checkbox
    }

    filterText += `&emsp;<input class="${field}" type="checkbox" name="${field}" value="ALL" onClick="allOrNoneCheckbox('${field}', 'ALL')" checked>all of above<br>`; // ALL checkbox
    filterText += `&emsp;<input class="${field}" type="checkbox" name="${field}" value="NONE" onClick="allOrNoneCheckbox('${field}', 'NONE')">none of above<br>`; // NONE checkbox
    filterText += `</div>`;
  }
  filterPanel.html(filterText);
}

// checks if data satisfies user filter
function filterData(data) {
  // initial state: display all markers (when legend hasn't been created yet)
  if ($("h3").length == 0) {
    return true;
  }
  let val = false;
  for (let field in studentFields) {
    val = false;
    $(`.${field}:checked`).each((i, item) => {
      if (item.value == "NONE") {
        val = false;
        return false;
      } else if (data[item.className] == item.value || item.value == "ALL") {
        val = true;
      }
    });
    if (!val) {
      return val;
    }
  }
  return true;
}

// reset checkboxes if a marker is clicked and the marker isn't ALL or NONE
function resetCheckBox(field) {
  $(`[name="${field}"][value="ALL"]`).prop("checked", false);
  $(`[name="${field}"][value="NONE"]`).prop("checked", false);
}

// resets checkboxes if marker clicked is ALL or NONE
function allOrNoneCheckbox(field, checkedBox) {
  for (let box of $(`[name="${field}"]`)) {
    box.value == checkedBox ? (box.checked = true) : (box.checked = false);
  }
}

// -------------------- loads in facilities data --------------------
const dataFacilities = {
  Hospitals: {
    fileName: "data/hospitals.json",
    iconName: "assets/graphics/healthicon.png",
  },
};

let layerResults = {}; // contains data needed for layer control for allLayersLoaded()

// converts json to geoJson
function convertToGeoJson(jsonData) {
  geoJson = {
    type: "FeatureCollection",
    features: [],
  };
  for (element of jsonData) {
    longitude = element["Longitude"];
    latitude = element["Latitude"];
    if (longitude && latitude) {
      let newFeature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        properties: {},
      };

      for (property in element) {
        if (property != "position" && property != "gps_coordinates") {
          newFeature["properties"][property] = element[property];
        }
      }

      geoJson["features"].push(newFeature);
    }
  }
  return geoJson;
}

// adds facilities to map and returns layer needed for layer control for allLayersLoaded()
function createFacilities(data, icon) {
  clusters = new L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, { icon: icon });
    },
    onEachFeature: function (feature, layer) {
      let popup = "";
      for (const field in feature.properties) {
        // rest of the fields
        popup += field + ": <b>" + feature.properties[field] + "</b><br> ";
      }
      layer.bindPopup(popup);
    },
  }).addTo(map);
  return clusters;
}

// loads in all layers based on `data` object
function loadData(functionToConvertJsonToGeoJson) {
  Object.keys(dataFacilities).forEach((name) => {
    let layer = dataFacilities[name];
    $.ajax({
      dataType: "json",
      url: layer.fileName,
    }).done(function (data) {
      layer = dataFacilities[name];
      icon = createIcon(layer.iconName);
      data = functionToConvertJsonToGeoJson(data);
      let clusters = createFacilities(data, icon);
      layerResults[name] = {
        icon: layer.iconName,
        cluster: clusters,
      };
      allLayersLoaded();
    });
  });
}

function createIcon(iconName) {
  return L.icon({
    iconUrl: iconName,
    iconSize: [25, 25],
  });
}

loadData(convertToGeoJson);

// finds nearest facility from specified marker
let nearestMarkerLines;

function findNearestMarker(coordinates, form) {
  num = form.number.value;
  layer = form.nearestfacility.value;
  layer = layerResults[layer]["cluster"];
  result = [];
  if (nearestMarkerLines) {
    map.removeLayer(nearestMarkerLines);
  }
  nearestMarkers = leafletKnn(layer).nearest(coordinates, num);
  coordinates = [coordinates[1], coordinates[0]];
  nearestMarkers.forEach((marker) => {
    nearestCoords = [marker["lat"], marker["lng"]];
    result = result.concat([coordinates, nearestCoords]);
  });
  nearestMarkerLines = L.polyline(result).addTo(map);
}

// adds layer control (allows for filtering)
function allLayersLoaded() {
  if (Object.keys(layerResults).length == Object.keys(dataFacilities).length) {
    controlLayers = {
      "NYC Neighborhoods": neighborhoods,
      "Students (clusters) <img src='assets/graphics/studenticon.png' alt='' width='20px'>": studentLayer,
    };

    Object.keys(layerResults).forEach((name) => {
      layer = layerResults[name];
      controlLayers[`${name}<img src="${layer.icon}" alt="" width="20px">`] =
        layer.cluster;
    });

    L.control
      .layers(null, controlLayers, {
        collapsed: false,
      })
      .addTo(map);
  }
}

/*
from serpapi.google_search_results import GoogleSearchResults

params = {
    "engine": "google_maps",
    "q": "health kilifi county",
    "google_domain": "google.com",
    "type": "search",
    "ll": "@40.7455096,-74.0083012,14z",
}

client = GoogleSearchResults(params)
data = client.get_dict()
*/
