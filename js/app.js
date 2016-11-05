'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', []).controller('myAppController', function($scope) {
    $scope.a = 1;
    $scope.b = 2;
    $scope.info = {};

    $.getJSON("./json/jason.json", function(json) {
        $scope.info = json;
        $scope.$apply();
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
