// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features);                               
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function addDetails(feature, layer) {
      layer.bindPopup("<h3><a target='_blank' href='" + feature.properties.url +"'>Click here</a><hr> "+ feature.properties.place + "<br>" +
      "Earthquake magnitude: " + feature.properties.mag + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }


    function choseColor(magnitude){
        var color = "";
        if (magnitude <=1.0) {
            color = "#9CCC65";
        }
        else if (magnitude >1.0 && magnitude <= 2.0 ) {
            color = "#D4E157";
        }
        else if (magnitude >2.0 && magnitude <= 3.0 ) {
          color = "#FFEE58";
        }
        else if (magnitude >3.0 && magnitude <= 4.0 ) {
          color = "#FFCA28";
        }
        else if (magnitude > 4.0 && magnitude <= 5.0  ) {
            color = "#FFA726";
        }
        else {
          color = "#FF7043";
        }
        return color;
      }

// Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (earthquakeData, latlng) {
        return L.circle(latlng, {
        fillOpacity: 0.50,
        color: "gray",
        fillColor: choseColor(earthquakeData.properties.mag),
        // Adjust radius
        radius: earthquakeData.properties.mag * 20000
    }) 
    },
    onEachFeature: addDetails
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}


function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });
  
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
  
  // color function to be used when creating the legend
  function getColor(d) {
    return 
          d > 5 ? '#FF7043' :
          d > 4 ? '#FFA726' :      
          d > 3 ? '#FFCA28' :       
          d > 2 ? '#FFEE58' :
          d > 1 ? '#D4E157' :
                  '#9CCC65';
  }

  // Add legend to the map
  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function(myMap) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          mags = [0, 1, 2, 3, 4, 5],
          labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < mags.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
              mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
      }
  
      return div;
  };legend.addTo(myMap);
}
