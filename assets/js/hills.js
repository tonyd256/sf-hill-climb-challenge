$(function() {
  const map = L.map('hill-map').setView([37.77, -122.44], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 10,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);

  $.ajax({
    url: 'https://script.google.com/macros/s/AKfycbywSwe_b9zM5_V9hdlf6lPYXUwgjZyhjtMKBdrKIh4Fkf-NYhSD/exec?item=hills',
    dataType: 'json',
    cache: false,
    success: function (res) {
      res.data.forEach( function(hill) {
        if (hill.lat && hill.lng) {
          $('#hill').append('<option value="'+hill.name+'">'+hill.name+'</option>');

          var marker = L.marker([hill.lat, hill.lng]).addTo(map);
          marker.bindPopup("<b>"+hill.name+"</b><br>Length: "+hill.length+"mi Vert: "+hill.vert+"ft");
        }
      });
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
