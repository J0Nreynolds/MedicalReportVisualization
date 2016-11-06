'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', []).controller('myAppController', function($scope) {
    $scope.a = 1;
    $scope.b = 2;
    $scope.info = {};
    $scope.partsToId = {};
    $scope.idsToParts = {};
    $scope.active = {};
    $scope.graphType = "";
    $scope.lineChart = undefined;
    $scope.generateGraph = function(){
        var type = $scope.graphType.replace(/\s/g, '');
        var chart = document.getElementById("chart");
        if($scope.lineChart){
            $scope.lineChart.destroy();
            $scope.lineChart = undefined;
        }
        else {
            $scope.lineChart = new Chart(chart, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Scatter Dataset',
                        data: [{
                            x: -10,
                            y: 0
                        }, {
                            x: 0,
                            y: 10
                        }, {
                            x: 10,
                            y: 5
                        }]
                    }]
                },
                options: {
                            scales: {
                                xAxes: [{
                                    type: 'linear',
                                    position: 'bottom'
                                }]
                            }
                        }
            });
            $scope.generateGraph();
        }

        var data = {
            xLabels: ["Visit 1", "Visit 2", "Visit 3", "Visit 4", "Visit 5"],
            datasets: [
                    {
                        label:  $scope.graphType,
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: "rgba(75,192,192,0.4)",
                        borderColor: "rgba(75,192,192,1)",
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: "rgba(75,192,192,1)",
                        pointBackgroundColor: "#fff",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(75,192,192,1)",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        data: [
                                {
                                    x:$scope.info["MedicalHistory"]["Visit1"]["DaysSinceLastVisit"],
                                    y:$scope.info["MedicalHistory"]["Visit1"][type]
                                },
                                {
                                    x:$scope.info["MedicalHistory"]["Visit2"]["DaysSinceLastVisit"],
                                    y:$scope.info["MedicalHistory"]["Visit2"][type]
                                },
                                {
                                    x:$scope.info["MedicalHistory"]["Visit3"]["DaysSinceLastVisit"],
                                    y:$scope.info["MedicalHistory"]["Visit3"][type]
                                },
                                {
                                    x:$scope.info["MedicalHistory"]["Visit4"]["DaysSinceLastVisit"],
                                    y:$scope.info["MedicalHistory"]["Visit4"][type]
                                },
                                {
                                    x:$scope.info["MedicalHistory"]["Visit5"]["DaysSinceLastVisit"],
                                    y:$scope.info["MedicalHistory"]["Visit5"][type]
                                }
                              ],
                        spanGaps: false,
                    }
                ]
        };
        $scope.lineChart = new Chart(chart, {
            type: 'line',
            data: data,
            options: {
                        scales: {
                            xAxes: [{
                                scaleLabel: {
                                  display: true,
                                  labelString: 'Days'
                                },
                                type: 'linear',
                                position: 'bottom'
                            }],
                            yAxes: [{
                                scaleLabel: {
                                  display: true,
                                  labelString: 'Level'
                                }
                            }]
                        }
                    }
        });
    }

    $scope.change = function(key){
        console.log(key);
        if($scope.active[$scope.partsToId[key][0]]){
            for(var i =0; i < $scope.partsToId[key].length; i ++)
                delete $scope.active[$scope.partsToId[key][i]];
        }
        else{
            for(var i =0; i < $scope.partsToId[key].length; i ++)
                $scope.active[$scope.partsToId[key][i]] = true;
        }
        updateActives($scope.active);
    };


    $.getJSON("./json/jason.json", function(json) {
        $scope.info = json;
        $scope.$apply();
        var tags = {};
        $.getJSON("./json/partToID.json", function(partsJSON) {
            $scope.partsToId = partsJSON;
            $scope.$apply();

            for(var i in json["Affected Regions"]){
                for(var j in partsJSON[i]){
                    tags[partsJSON[i][j]] = true;
                }
            }
            $.getJSON("./json/IDtoPart.json", function(idsJSON) {
                $scope.idsToParts = idsJSON;
                $scope.$apply();
                startup(tags, partsJSON);
            });
        });
    });

    var canvas = document.getElementById("myGLCanvas");
    fitToContainer(canvas);

    var chart = document.getElementById("chart");
    fitToContainer(chart);

    function fitToContainer(canvas){
      // Make it visually fill the positioned parent
      canvas.style.width ='100%';
      canvas.style.height='100%';
      // ...then set the internal size to match
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

});
