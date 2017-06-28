
angular.module('cs591',[])
    .directive('nameDisplay', function() {
        return {
            scope: true,
            restrict: 'EA',
            template: "<b>This can be anything {{name}}</b>"}
    })
    .controller('cs591ctrl', function($scope, $http, $window){

        //READ the cars data from the db
        $scope.getCar = function() {
            $http.get('http://localhost:3000/api')
                .then(function(response){
                    $scope.car = response.data
                    bus1_raw=response.data[0]
                    $scope.bus1price = bus1_raw.price
                    $scope.bus1time = bus1_raw.time



                    bus2 = response.data[1];
                    $scope.bus2price=bus2.price
                    $scope.bus2time=bus2.time

                    uberpool = response.data[2];
                    $scope.ubertime= uberpool.time
                    $scope.uberprice= uberpool.price


                })
        };
        // call the decision algorithm,
        $scope.decision= function() {
            $http.get('http://localhost:3000/api/algo')
                .then(function(response){
                    $scope.result= response.data
                })
        }
        
        // ask user to login 
        $scope.login= function(){
            $window.location.href='http://localhost:3000/uber'

        }

        // generate the car information
        $scope.generateCar=function(){
          $http.get('http://localhost:3000/api/busTime');
              //.then(function(response){});
          $http.get('http://localhost:3000/api/uberT');
          $http.get('http://localhost:3000/api/uberP');

        }

       
    })
    







      
