'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', []).controller('myAppController', function($scope) {
    $scope.a = 1;
    $scope.b = 2;
    $scope.info = {};
    $scope.partsToId = {};
    $scope.idsToParts = {};
    $scope.active = {}

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

    $.getJSON("./json/alan.json", function(json) {
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

    var canvas = document.querySelector('canvas');
    fitToContainer(canvas);

    function fitToContainer(canvas){
      // Make it visually fill the positioned parent
      canvas.style.width ='100%';
      canvas.style.height='100%';
      // ...then set the internal size to match
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
});
