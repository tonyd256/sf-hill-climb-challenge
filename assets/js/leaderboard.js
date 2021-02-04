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
  }, function (req, status, e) {
    console.error(e || req || 'Unknown Error Occurred');
  });
});
