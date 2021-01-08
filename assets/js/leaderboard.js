$(function() {
  $.ajax({
    url: 'https://script.google.com/macros/s/AKfycbx3LUU2ujby8cfkc45GyrxHwYJUX2-Ol14Kjtk9NaygVFM57RPO/exec',
    dataType: 'json',
    cache: false,
    success: function (res) {
      const results = res.data;

      const groupedRoutes = _.groupBy(results, 'route');
      const groupedRoutesGender = _.mapValues(groupedRoutes, function (v) {
        return _.groupBy(v, 'gender');
      });

      $('#leaderboard tbody').html(Object.keys(groupedRoutesGender).map( function (route) {
        return Object.keys(groupedRoutesGender[route]).map( function (gender) {
          const times = _.sortBy(groupedRoutesGender[route][gender], 'time');
          const person = times[0];

          const aOpen = '<a href="'+person.link+'" rel="noopener noreferrer" target="_blank" style="display: block;" class="text-reset">';
          const aClose = "</a>"

          return "<tr><td>"+aOpen+route+aClose+"</td><td>"+aOpen+_.upperFirst(gender)+aClose+"</td><td>"+aOpen+person.name+aClose+"</td><td>"+aOpen+person.team+aClose+"</td><td>"+aOpen+person.time+aClose+"</td></tr>";
        }).join();
      }));

      if ($('#attempts').length) {
        const uniqueAttempts = _.countBy(_.uniqWith(results, function (lhv, rhv) {
          return lhv.id === rhv.id && lhv.route === rhv.route;
        }), 'team');

        $('#attempts tbody').html(Object.keys(uniqueAttempts).map( function (team) {
          const records = Object.keys(groupedRoutesGender).reduce( function (accum, route) {
            return accum + Object.keys(groupedRoutesGender[route]).reduce( function (accum, gender) {
              return accum + (_.sortBy(groupedRoutesGender[route][gender], 'time')[0].team === team ? 1 : 0);
            }, 0);
          }, 0);
          return "<tr><td>"+team+"</td><td class=\"text-center\">"+uniqueAttempts[team]+"</td><td class=\"text-right\">"+records+"</td></tr>";
        }));
      }

      if ($('#grandslam').length) {
        const groupedPeople = _.mapValues(_.groupBy(results, 'name'), function (v) {
          return _.uniqBy(v, 'route');
        });
        const people = _.reverse(_.sortBy(Object.keys(groupedPeople).map(function (p) {
          return {
            name: p,
            team: groupedPeople[p][0].team,
            routesCompleted: groupedPeople[p].length,
            routes: groupedPeople[p].map(function (i) { return i.route; }).join(", ")
          };
        }), 'routesCompleted'));

        $('#grandslam tbody').html(people.map( function (entry) {
          return "<tr><td>"+entry.name+"</td><td class=\"text-center\">"+entry.team+"</td><td class=\"text-right\">"+entry.routesCompleted+"</td></tr>";
        }));
      }

      if ($('#route-results').length) {
        const route = $('#route-results').data().route;
        const top10Male = _.take(_.sortBy(_.filter(results, { 'route': route, 'gender': 'male' }), 'time'), 10);
        const top10Female = _.take(_.sortBy(_.filter(results, { 'route': route, 'gender': 'female' }), 'time'), 10);
        $('#route-results #female tbody').html(top10Female.map( function (entry) {
          const aOpen = '<a href="'+entry.link+'" rel="noopener noreferrer" target="_blank" style="display: block;" class="text-reset">';
          const aClose = "</a>"
          return "<tr><td>"+aOpen+entry.name+aClose+"</td><td class=\"text-center\">"+aOpen+entry.team+aClose+"</td><td class=\"text-right\">"+aOpen+entry.time+aClose+"</td></tr>";
        }));

        $('#route-results #male tbody').html(top10Male.map( function (entry) {
          const aOpen = '<a href="'+entry.link+'" rel="noopener noreferrer" target="_blank" style="display: block;" class="text-reset">';
          const aClose = "</a>"
          return "<tr><td>"+aOpen+entry.name+aClose+"</td><td class=\"text-center\">"+aOpen+entry.team+aClose+"</td><td class=\"text-right\">"+aOpen+entry.time+aClose+"</td></tr>";
        }));
      }

    },
    error: function (req, status, e) {
      console.error(e);
    }
  });
});
