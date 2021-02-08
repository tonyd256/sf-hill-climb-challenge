$(function() {
  const hillsPromise = $.Deferred();

  const rejectHills = setTimeout(function () { hillsPromise.reject(); }, 10000);
  function checkForHills() {
    if (hillsPromise.state() === 'rejected') return;
    if (localStorage.hills) {
      clearTimeout(rejectHills);
      hillsPromise.resolve(localStorage.hills);
    } else {
      setTimeout(checkForHills, 1000);
    }
  }
  checkForHills();

  $.when(
    $.ajax({
      url: 'https://script.google.com/macros/s/AKfycbywSwe_b9zM5_V9hdlf6lPYXUwgjZyhjtMKBdrKIh4Fkf-NYhSD/exec?item=results',
      dataType: 'json',
      cache: false,
    }),
    $.ajax({
      url: 'https://script.google.com/macros/s/AKfycbywSwe_b9zM5_V9hdlf6lPYXUwgjZyhjtMKBdrKIh4Fkf-NYhSD/exec?item=teams',
      dataType: 'json',
      cache: false,
    }),
    hillsPromise.promise()
  ).then( function (resResults, resTeams, resHills) {
    const results = resResults[0].data;
    const teams = resTeams[0].data;
    const hills = JSON.parse(resHills);

    const resultsWithTeams = _.mapValues(results, function (r) {
      r.team = _.find(teams, { id: r.id }).team;
      return r;
    });

    const teamResults = _.groupBy(resultsWithTeams, 'team');
    const teamReps = _.mapValues(teamResults, function (team) {
      return _.reduce(team, function (accum, v) { return accum + v.reps; }, 0);
    });
    const teamVert = _.mapValues(teamResults, function (team) {
      return _.reduce(team, function (accum, v) {
        const hill = _.find(hills, { name: v.hill });
        const vert = hill ? hill.vert : 0;
        if (!hill) console.error("Couldn't find hill "+v.hill);
        return accum + v.reps * vert;
      }, 0);
    });

    const teamLabels = ["Ali", "Collin", "Shardul", "Tony"];
    const teamValues = _.map(teamLabels, function (l) { return teamVert[l]; });
    const ctx = $('#team-leaderboard');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: teamLabels,
        datasets: [{
          lable: '',
          data: teamValues,
          fill: false,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(153, 102, 255, 0.2)",
          ],
          borderColor: [
            "rgb(255, 99, 132)",
            "rgb(75, 192, 192)",
            "rgb(54, 162, 235)",
            "rgb(153, 102, 255)",
          ],
          borderWidth: 1
        }]
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Vert (ft)'
            },
            ticks: {
              beginAtZero: true,
              callback: function(value, index, values) {
                if (value >= 1000000) {
                  return (value/1000000).toFixed(2) + 'MM';
                } else if (value >= 10000) {
                  return Math.round(value/1000) + 'k';
                } else if (value >= 1000) {
                  return (value/1000).toFixed(1) + 'k';
                } else {
                  return value;
                }
              }
            }
          }]
        }
      }
    });

    const teamTable = $('#team-table tbody');
    const teamRosters = _.groupBy(teams, 'team');
    const totalRows = _.max(_.map(teamRosters, function (t) { return t.length; }));

    for (var i = 0; i < totalRows; i++) {
      var row = '<tr>';
      ['Ali', 'Collin', 'Shardul', 'Tony'].forEach(function (leader) {
        if (teamRosters[leader][i]) {
          row += '<td>'+teamRosters[leader][i].name+'</td>';
        } else {
          row += '<td></td>';
        }
      });
      row += '</tr>';
      teamTable.append(row);
    }

    const indiVertTable = $('#individual-vert-table tbody');
    const indiResults = _.groupBy(results, 'id');
    const summedResults = _.map(indiResults, function (val, key) {
      const first = val[0];
      return { name: first.name, team: _.find(teams, { id: key }).team, vert: _.sumBy(val, function (o) { return _.find(hills, { name: o.hill }).vert * o.reps; }) };
    });

    const indiRows = _.map(_.reverse(_.sortBy(summedResults, 'vert')), function (r) {
      return '<tr><td>'+r.name+'</td><td>'+r.team+'</td><td>'+r.vert+'</td></tr>';
    });
    indiVertTable.append(indiRows);

    const badassTable = $('#badass-table tbody');
    const hillReps = _.groupBy(results, 'hill');
    const indiHillReps = _.mapValues(hillReps, function (val) { return _.map(_.groupBy(val, 'id'), function (v, k) {;
      return { name: v[0].name, team: _.find(teams, { id: k }).team, reps: _.sumBy(v, function (o) { return o.reps; }) };
    })});;

    const sortedHills = _.sortBy(Object.keys(indiHillReps));
    const indiHillRows = _.map(sortedHills, function (r, k) {
      const badass = _.reverse(_.sortBy(indiHillReps[r], 'reps'))[0];
      return '<tr><td>'+r+'</td><td>'+badass.name+'</td><td>'+badass.team+'</td><td>'+badass.reps+'</td></tr>';
    });
    badassTable.append(indiHillRows);
  }, function (req, status, e) {
    console.error(e || req || 'Unknown Error Occurred');
  });
});
