// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
/*angular.module('todo', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})*/

angular.module('appIntro', ['ionic','nvd3','googlechart','highcharts-ng','nvd3ChartDirectives'])
	.directive( 'crD3Bars', [
	function () {
	return {
	restrict: 'E',
	scope: {
	data: '='
	},
	link: function (scope, element) {
	    "use strict";

	    // Currently selected dashboard values
	    var chart1,
	        chart2,
	        chart3,
	        chart4,
	        selectedYear = 2010,
	        selectedCountry = "USA",
	        selectedMedalType = "Gold";

	    /* Functions to create the individual charts involved in the dashboard */

	   scope.createSummaryChart = function (selector, dataset) {

	        var data = {
	                "xScale": "ordinal",
	                "yScale": "linear",
	                "main": dataset
	            },

	            options = {
	                "axisPaddingLeft": 0,
	                "paddingLeft": 20,
	                "paddingRight": 0,
	                "axisPaddingRight": 0,
	                "axisPaddingTop": 5,
	                "yMin": 9,
	                "yMax": 40,
	                "interpolation": "linear",
	                "click": yearSelectionHandler
	            },

	            legend = d3.select(selector).append("svg")
	                .attr("class", "legend")
	                .selectAll("g")
	                .data(dataset)
	                .enter()
	                .append("g")
	                .attr("transform", function (d, i) {
	                    return "translate(" + (64 + (i * 84)) + ", 0)";
	                });

	        legend.append("rect")
	            .attr("width", 18)
	            .attr("height", 18)
	            .attr("class", function (d, i) {
	                return 'color' + i;
	            });

	        legend.append("text")
	            .attr("x", 24)
	            .attr("y", 9)
	            .attr("dy", ".35em")
	            .text(function (d, i) {
	                return dataset[i].country;
	            });

	        return new xChart('line-dotted', data, selector + " .graph", options);
	    }

	    scope.createCountryBreakdownChart = function(selector, dataset) {

	        var data = {
	                "xScale": "ordinal",
	                "yScale": "linear",
	                "type": "bar",
	                "main": dataset
	            },

	            options = {
	                "axisPaddingLeft": 0,
	                "axisPaddingTop": 5,
	                "paddingLeft": 20,
	                "yMin": 8,
	                "yMax": 40,
	                "click": countrySelectionHandler
	            };

	        return new xChart('bar', data, selector + " .graph", options);

	    }


	    scope.createMedalBreakdownChart= function(selector, dataset) {
	        var width = 490,
	            height = 260,
	            radius = Math.min(width, height) / 2,

	            color = d3.scale.category10(),

	            pie = d3.layout.pie()
	                .value(function (d) {
	                    return d.total;
	                })
	                .sort(null),

	            arc = d3.svg.arc()
	                .innerRadius(radius - 80)
	                .outerRadius(radius - 20),

	            svg = d3.select(selector + " .graph").append("svg")
	                .attr("width", width)
	                .attr("height", height)
	                .append("g")
	                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),

	            path = svg.datum(dataset).selectAll("path")
	                .data(pie)
	                .enter().append("path")
	                .attr("fill", function (d, i) {
	                    return color(i);
	                })
	                .attr("d", arc)
	                .each(function (d) {
	                    this._selected = d;
	                })  // store the initial angles
	                .on("click", medalTypeSelectionHandler),

	            legend = d3.select(selector).append("svg")
	                .attr("class", "legend")
	                .attr("width", radius * 2)
	                .attr("height", radius * 2)
	                .selectAll("g")
	                .data(color.domain().slice().reverse())
	                .enter().append("g")
	                .attr("transform", function (d, i) {
	                    return "translate(" + (120 + i * 100) + ", 0)";
	                });

	        legend.append("rect")
	            .attr("width", 18)
	            .attr("height", 18)
	            .style("fill", color);

	        legend.append("text")
	            .attr("x", 24)
	            .attr("y", 9)
	            .attr("dy", ".35em")
	            .text(function (d) {
	                return dataset[d].type + ' (' + dataset[d].total + ')';
	            });

	        function change(dataset) {
	            svg.datum(dataset);
	            path = path.data(pie); // compute the new angles
	            path.transition().duration(500).attrTween("d", arcTween); // redraw the arcs
	            legend.select('text').text(function (d) {
	                return dataset[d].type + ' (' + dataset[d].total + ')';
	            });
	        }

	        function arcTween(a) {
	            var i = d3.interpolate(this._selected, a);
	            this._selected = i(0);
	            return function (t) {
	                return arc(i(t));
	            };
	        }

	        return {
	            change: change
	        };

	    }

	 scope.createCountryBreakdownForMedalTypeChart =  function (selector, dataset) {

	        var data = {
	            "xScale": "ordinal",
	            "yScale": "linear",
	            "type": "bar",
	            "main": dataset
	        };

	        var options = {
	            "axisPaddingLeft": 0,
	            "axisPaddingTop": 5,
	            "paddingLeft": 20,
	            "yMin": 0,
	            "yMax": 20
	        };

	        return new xChart('bar', data, selector + " .graph", options);

	    }

	    /* Data selection handlers */

	    function yearSelectionHandler(d, i) {
	        selectedYear = d.x;
	        var data = {
	            "xScale": "ordinal",
	            "yScale": "linear",
	            "type": "bar",
	            "main": getCountryBreakdownForYear(selectedYear)
	        };
	        $('#chart2>.title').html('Total Medals by Country in ' + selectedYear);
	        chart2.setData(data);
	    }

	    function countrySelectionHandler(d, i) {
	        selectedCountry = d.x;
	        $('#chart3>.title').html(selectedCountry + ' Medals in ' + selectedYear);
	        chart3.change(getMedalsForCountry(selectedCountry));
	    }

	    function medalTypeSelectionHandler(d) {
	        selectedMedalType = d.data.type;
	        var data = {
	            "xScale": "ordinal",
	            "yScale": "linear",
	            "type": "bar",
	            "main": getCountryBreakdownForMedalType(selectedMedalType, selectedYear)
	        };
	        $('#chart4>.title').html(selectedMedalType + ' Medals in ' + selectedYear);
	        chart4.setData(data);
	    }

	    /* Functions to transform/format the data as required by specific charts */

	    function getCountryBreakdownForYear(year) {
	        var result = [];
	        for (var i = 0; i < results[year].length; i++) {
	            result.push({x: results[year][i].Country, y: results[year][i].Total});
	        }
	        return [
	            {
	                "className": ".medals",
	                "data": result
	            }
	        ]
	    }

	    function getCountryBreakdownForMedalType(medalType, year) {
	        var result = [];
	        for (var i = 0; i < results[year].length; i++) {
	            result.push({x: results[year][i].Country, y: results[year][i][medalType]});
	        }
	        return [
	            {
	                "className": ".medals",
	                "data": result
	            }
	        ]
	    }

	    function getMedalsForCountry(country) {
	        var countries = results[selectedYear];
	        for (var i = 0; i < countries.length; i++) {
	            if (countries[i].Country === country) {
	                return [
	                    {"type": "Gold", "total": countries[i].Gold },
	                    {"type": "Silver", "total": countries[i].Silver},
	                    {"type": "Bronze", "total": countries[i].Bronze}
	                ];
	            }
	        }
	    }
	 
	//Render graph based on 'data'
	scope.render = function(data) {var html =
        '<div id="chart1" class="chart">' +
        '<div class="title">Top 5 Medal Countries</div>' +
        '<div class="graph"></div>' +
        '</div>' +

        '<div id="chart2" class="chart">' +
        '<div class="title">Total Medals by Country in 2010</div>' +
        '<div class="graph"></div>' +
        '</div>' +

        '<div id="chart3" class="chart">' +
        '<div class="title">USA Medals in 2010</div>' +
        '<div class="graph"></div>' +
        '</div>' +

        '<div id="chart4" class="chart">' +
        '<div class="title">Gold Medals in 2010</div>' +
        '<div class="graph"></div>' +
        '</div>';

		$("#content").html(html);
		
		
		chart1 = scope.createSummaryChart('#chart1', summary);
		chart2 = createCountryBreakdownChart('#chart2', getCountryBreakdownForYear(selectedYear));
		chart3 = createMedalBreakdownChart('#chart3', getMedalsForCountry(selectedCountry));
		chart4 = createCountryBreakdownForMedalTypeChart('#chart4', getCountryBreakdownForMedalType(selectedMedalType, selectedYear));
		
		}
		
	//Watch 'data' and run scope.render(newVal) whenever it changes
	//Use true for 'objectEquality' property so comparisons are done on equality and not reference
	scope.$watch('data', function(){
	scope.render(scope.data);
	}, true);
	}
	};
	}
	])
.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('intro', {
      url: '/',
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })
    .state('main', {
      url: '/main',
      templateUrl: 'main.html',
      controller: 'MainCtrl'
    })
  .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })
    .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent' :{
          templateUrl: "templates/browse.html"
        }
      }
    })
    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent' :{
          templateUrl: "templates/playlists.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })
    .state('app.dashboard', {
      url: '/dashboard/3',
      views: {
        'menuContent' :{
          templateUrl: "templates/dashboard.html",
          controller: 'DashboardCtrl'
        }
      }
    })
    .state('app.single', {
      url: '/playlists/:playlistId',
      views: {
        'menuContent' :{
          templateUrl: "templates/playlist.html",
          controller: 'PlaylistCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');
})



.controller('IntroCtrl', function ($scope, $state, $ionicSlideBoxDelegate) {

  // Called to navigate to the main app
  $scope.startApp = function () {
    $state.go('main');
  };
  $scope.next = function () {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function () {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function (index) {
    $scope.slideIndex = index;
  };
})

  
  .controller('AppCtrl', function($scope) {
  })

  .controller('DashboardCtrl', function($scope, $window,$http) {
	  

     /* $http.get('performance.json').success(function(data) {
          $scope.performance  = data;
      }).error(function(error) {
              console.log(error);
          });*/

      $scope.getGradeClass = function(grade) {
          //console.log(grade);
          // console.log(grade.charAt(0));
          var gradeClass = 'A-grade';
          if(grade.charAt(0) == 'A') {
              gradeClass = 'A-grade'
          } else if(grade.charAt(0) == 'B') {
              gradeClass = 'B-grade'
          } else if(grade.charAt(0) == 'C') {
              gradeClass = 'C-grade'
          } else {
              gradeClass = 'O-grade'
          }

          return gradeClass;
      };

      /* Chart options */
      $scope.options = {
          chart: {
              type: 'discreteBarChart',
             // height:450,
              margin : {
                  top: 20,
                  right: 20,
                  bottom: 50,
                  left: 55
              },
              x: function(d){ return d.label; },
              y: function(d){ return d.value; },
              showValues: true,
              valueFormat: function(d){
                  return d3.format(',.4f')(d);
              },
              transitionDuration: 500,
              xAxis: {
                  axisLabel: 'X Axis'
              },
              yAxis: {
                  axisLabel: 'Y Axis',
                  axisLabelDistance: 30
              }
          }
      };

      /* Chart data */
      $scope.data = [{
          key: "Cumulative Return",
          values: [
              { "label" : "A" , "value" : 29.765957771107 },
              { "label" : "B" , "value" : 0 },
              { "label" : "C" , "value" : 32.807804682612 },
              { "label" : "D" , "value" : 196.45946739256 },
              { "label" : "E" , "value" : 0.19434030906893 },
              { "label" : "F" , "value" : 98.079782601442 },
              { "label" : "G" , "value" : 13.925743130903 },
              { "label" : "H" , "value" : 5.1387322875705 }
          ]
      }];


      $scope.chart = {
          labels : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          datasets : [
              {
                  fillColor : "rgba(151,187,205,0)",
                  strokeColor : "#e67e22",
                  pointColor : "rgba(151,187,205,0)",
                  pointStrokeColor : "#e67e22",
                  data : [4, 3, 5, 4, 6]
              },
              {
                  fillColor : "rgba(151,187,205,0)",
                  strokeColor : "#f1c40f",
                  pointColor : "rgba(151,187,205,0)",
                  pointStrokeColor : "#f1c40f",
                  data : [8, 3, 2, 5, 4]
              }
          ]
      };

      $scope.myChartOptions =  {
          //Boolean - Whether we should show a stroke on each segment
          segmentShowStroke : true,

          //String - The colour of each segment stroke
          segmentStrokeColor : "#fff",

          //Number - The width of each segment stroke
          segmentStrokeWidth : 24,

          //The percentage of the chart that we cut out of the middle.
          percentageInnerCutout : 50,

          //Boolean - Whether we should animate the chart
          animation : true,

          //Number - Amount of animation steps
          animationSteps : 100,

          //String - Animation easing effect
          animationEasing : "easeOutBounce",

          //Boolean - Whether we animate the rotation of the Doughnut
          animateRotate : true,

          //Boolean - Whether we animate scaling the Doughnut from the centre
          animateScale : false,

          //Function - Will fire on animation completion.
          onAnimationComplete : null
      };

      $scope.sampleData = {
          "type": "ColumnChart",
          "cssStyle": "height:200px; width:300px;",
          "data": {
              "cols": [
                  {
                      "id": "month",
                      "label": "Month",
                      "type": "string"
                  },
                  {
                      "id": "laptop-id",
                      "label": "Laptop",
                      "type": "number"
                  },
                  {
                      "id": "desktop-id",
                      "label": "Desktop",
                      "type": "number"
                  },
                  {
                      "id": "server-id",
                      "label": "Server",
                      "type": "number"
                  },
                  {
                      "id": "cost-id",
                      "label": "Shipping",
                      "type": "number"
                  }
              ],
              "rows": [
                  {
                      "c": [
                          {
                              "v": "January"
                          },
                          {
                              "v": 19,
                              "f": "42 items"
                          },
                          {
                              "v": 12,
                              "f": "Ony 12 items"
                          },
                          {
                              "v": 7,
                              "f": "7 servers"
                          },
                          {
                              "v": 4
                          }
                      ]
                  },
                  {
                      "c": [
                          {
                              "v": "February"
                          },
                          {
                              "v": 13
                          },
                          {
                              "v": 1,
                              "f": "1 unit (Out of stock this month)"
                          },
                          {
                              "v": 12
                          },
                          {
                              "v": 2
                          }
                      ]
                  },
                  {
                      "c": [
                          {
                              "v": "March"
                          },
                          {
                              "v": 24
                          },
                          {
                              "v": 0
                          },
                          {
                              "v": 11
                          },
                          {
                              "v": 6
                          }
                      ]
                  }
              ]
          },
          "options": {
              "title": "Sales per month",
              "isStacked": "true",
              "fill": 20,
              "displayExactValues": true,
              "vAxis": {
                  "title": "Sales unit",
                  "gridlines": {
                      "count": 6
                  }
              },
              "hAxis": {
                  "title": "Date"
              }
          },
          "formatters": {}
      };


      $scope.addPoints = function () {
          var seriesArray = $scope.chartConfig.series
          var rndIdx = Math.floor(Math.random() * seriesArray.length);
          seriesArray[rndIdx].data = seriesArray[rndIdx].data.concat([1, 10, 20])
      };

      $scope.addSeries = function () {
          var rnd = [];
          for (var i = 0; i < 10; i++) {
              rnd.push(Math.floor(Math.random() * 20) + 1)
          }
          $scope.chartConfig.series.push({
              data: rnd
          })
      };

      $scope.removeRandomSeries = function () {
          var seriesArray = $scope.chartConfig.series
          var rndIdx = Math.floor(Math.random() * seriesArray.length);
          seriesArray.splice(rndIdx, 1)
      };

      $scope.toggleLoading = function () {
          this.chartConfig.loading = !this.chartConfig.loading
      };

      $scope.chartConfig = {
          options: {
              chart: {
                  type: 'line',
                  zoomType: 'x'
              }
          },
          series: [{
              data: [10, 15, 12, 8, 7, 1, 1, 19, 15, 10]
          },{
              data: [14,4,6,12,5,4,21,3,16,23]
          }],
          title: {
              text: 'Hello'
          },
          xAxis: {currentMin: 0, currentMax: 10, minRange: 1},
          loading: false
      }
	 
  })
  .controller('PlaylistsCtrl', function($scope, $ionicScrollDelegate, filterFilter) {
	  var letters = $scope.letters = [];
	  var contacts = $scope.contacts = [];
	  var currentCharCode = 'A'.charCodeAt(0) - 1;

	  //window.CONTACTS is defined below
	  window.CONTACTS
	    .sort(function(a, b) {
	      return a.last_name > b.last_name ? 1 : -1;
	    })
	    .forEach(function(person) {
	      //Get the first letter of the last name, and if the last name changes
	      //put the letter in the array
	      var personCharCode = person.last_name.toUpperCase().charCodeAt(0);
	      //We may jump two letters, be sure to put both in
	      //(eg if we jump from Adam Bradley to Bob Doe, add both C and D)
	      var difference = personCharCode - currentCharCode;
	      for (var i = 1; i <= difference; i++) {
	        addLetter(currentCharCode + i);
	      }
	      currentCharCode = personCharCode;
	      contacts.push(person);
	    });

	  //If names ended before Z, add everything up to Z
	  for (var i = currentCharCode + 1; i <= 'Z'.charCodeAt(0); i++) {
	    addLetter(i);
	  }

	  function addLetter(code) {
	    var letter = String.fromCharCode(code);
	    contacts.push({
	      isLetter: true,
	      letter: letter
	    });
	    letters.push(letter);
	  }

	  //Letters are shorter, everything else is 52 pixels
	  $scope.getItemHeight = function(item) {
	    return item.isLetter ? 40 : 100;
	  };
	  $scope.getItemWidth = function(item) {
	    return '100%';
	  };

	  $scope.scrollBottom = function() {
	    $ionicScrollDelegate.scrollBottom(true);
	  };

	  var letterHasMatch = {};
	  $scope.getContacts = function() {
	    letterHasMatch = {};
	    //Filter contacts by $scope.search.
	    //Additionally, filter letters so that they only show if there
	    //is one or more matching contact
	    return contacts.filter(function(item) {
	      var itemDoesMatch = !$scope.search || item.isLetter ||
	        item.first_name.toLowerCase().indexOf($scope.search.toLowerCase()) > -1 ||
	        item.last_name.toLowerCase().indexOf($scope.search.toLowerCase()) > -1;

	      //Mark this person's last name letter as 'has a match'
	      if (!item.isLetter && itemDoesMatch) {
	        var letter = item.last_name.charAt(0).toUpperCase();
	        letterHasMatch[letter] = true;
	      }

	      return itemDoesMatch;
	    }).filter(function(item) {
	      //Finally, re-filter all of the letters and take out ones that don't
	      //have a match
	      if (item.isLetter && !letterHasMatch[item.letter]) {
	        return false;
	      }
	      return true;
	    });
	  };

	  $scope.clearSearch = function() {
	    $scope.search = '';
	  };
	});



window.CONTACTS = [{"id":1,"first_name":"Patrick","last_name":"Rogers","country":"Cyprus","ip_address":"153.88.89.148","email":"progers@yata.net"},
                   {"id":2,"first_name":"Janet","last_name":"Gordon","country":"Croatia","ip_address":"209.73.121.212","email":"jgordon@skivee.biz"},
                   {"id":3,"first_name":"Kathy","last_name":"Hamilton","country":"Armenia","ip_address":"164.214.217.162","email":"khamilton@rhynyx.biz"},
                   {"id":4,"first_name":"Stephanie","last_name":"Johnson","country":"Mauritius","ip_address":"8.199.242.67","email":"sjohnson@jabbertype.mil"},
                   {"id":5,"first_name":"Jerry","last_name":"Palmer","country":"Thailand","ip_address":"230.207.100.163","email":"jpalmer@avamm.org"},
                   {"id":6,"first_name":"Lillian","last_name":"Franklin","country":"Germany","ip_address":"150.190.116.1","email":"lfranklin@eare.mil"},
                   {"id":7,"first_name":"Melissa","last_name":"Gordon","country":"Serbia","ip_address":"162.156.29.99","email":"mgordon@flashset.org"},
                   {"id":8,"first_name":"Sarah","last_name":"Burns","country":"Grenada","ip_address":"13.177.156.223","email":"sburns@eimbee.info"},
                   {"id":9,"first_name":"Willie","last_name":"Burton","country":"Croatia","ip_address":"115.133.81.82","email":"wburton@dynazzy.info"},
                   {"id":10,"first_name":"Tina","last_name":"Simmons","country":"United States Virgin Islands","ip_address":"113.49.63.18","email":"tsimmons@devpulse.mil"},
                   {"id":11,"first_name":"Kenneth","last_name":"Larson","country":"Mexico","ip_address":"92.89.76.196","email":"klarson@browseblab.info"},
                   {"id":12,"first_name":"Philip","last_name":"Welch","country":"Cuba","ip_address":"223.180.48.70","email":"pwelch@skippad.edu"},
                   {"id":13,"first_name":"Nicholas","last_name":"Parker","country":"British Indian Ocean Territory","ip_address":"200.150.119.13","email":"nparker@twitternation.net"},
                   {"id":14,"first_name":"Nicole","last_name":"Webb","country":"Moldova","ip_address":"47.66.237.205","email":"nwebb@midel.biz"},
                   {"id":15,"first_name":"Clarence","last_name":"Schmidt","country":"China","ip_address":"134.84.246.67","email":"cschmidt@dazzlesphere.net"},
                   {"id":16,"first_name":"Jessica","last_name":"Murray","country":"Sao Tome and Principe","ip_address":"211.30.32.109","email":"jmurray@jumpxs.net"},
                   {"id":17,"first_name":"Willie","last_name":"Schmidt","country":"US Minor Outlying Islands","ip_address":"158.40.109.208","email":"wschmidt@babbleset.edu"},
                   {"id":18,"first_name":"Margaret","last_name":"Evans","country":"Bhutan","ip_address":"252.123.77.101","email":"mevans@voolia.info"},
                   {"id":19,"first_name":"Arthur","last_name":"Morales","country":"Faroe Islands","ip_address":"116.5.126.29","email":"amorales@brainlounge.biz"}
                   ];
(function () {

    "use strict";

    document.addEventListener("deviceready", function () {
        FastClick.attach(document.body);
        StatusBar.overlaysWebView(false);
    }, false);


    // Show/hide menu toggle
    $('#btn-menu').click(function () {
        if ($('#container').hasClass('offset')) {
            $('#container').removeClass('offset');
        } else {
            $('#container').addClass('offset');
        }
        return false;
    });

    // Basic view routing
    $(window).on('hashchange', route);

    function route() {
        var hash = window.location.hash;
        if (hash === "#dashboard/1") {
            dashboard1.render();
        } else if (hash === "#dashboard/2") {
            dashboard2.render();
        } else if (hash === "#dashboard/3") {
            dashboard3.render();
        }
    }



}());