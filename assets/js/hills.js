var map;

$(function() {
  map = L.map('hill-map').setView([37.77, -122.44], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 10,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);

  if (localStorage.hills) {
    addHillMarkers(JSON.parse(localStorage.hills));
  }

  $.ajax({
    url: 'https://script.google.com/macros/s/AKfycbywSwe_b9zM5_V9hdlf6lPYXUwgjZyhjtMKBdrKIh4Fkf-NYhSD/exec?item=hills',
    dataType: 'json',
    cache: false,
    success: function (res) {
      localStorage.hills = JSON.stringify(res.data);
      addHillMarkers(res.data);
    },
    error: function (req, status, e) {
      console.error(e);
    }
});

  $.ajax({
    url: '/assets/hills.json',
    dataType: 'json',
    cache: false,
    success: function (res) {
      L.geoJSON(res).addTo(map);
    },
    error: function (req, status, e) {
      console.error(e);
    }
  });
});

function addHillMarkers(hills) {
  const hillTable = $('#hill-table tbody');
  hills.forEach( function(hill) {
    if (hill.lat && hill.lng) {
      $('#hill').append('<option value="'+hill.name+'">'+hill.name+'</option>');

      var marker = L.marker([hill.lat, hill.lng]).addTo(map);
      marker.bindPopup("<b>"+hill.name+"</b><br>"+hill.description+"<br>Length: "+hill.length+"mi Vert: "+hill.vert+"ft");
      hillTable.append("<tr><td>"+hill.name+"</td><td colspan=\"3\">"+hill.description+"</td><td class=\"text-right\">"+hill.length+"</td><td class=\"text-right\">"+hill.vert+"</td></tr>");
    }
  });
}
