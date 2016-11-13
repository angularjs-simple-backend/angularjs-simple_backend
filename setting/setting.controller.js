myapp.controller('TableSettingController', function($scope, $routeParams,SettingFactory,$route) {

  $scope.items = [];
  $scope.error="";
  $scope.group=null;
  $scope.views=null;
 
   function init() {
        SettingFactory.getTable().success(function(data) {
           if (data.success) {
                 $scope.items = data.data;
				 $scope.group= data.group;
				 $scope.views= data.views;
           	   }

        });
    
	}
	 init();
	 $scope.move = function(sort,step)
	 {
			return sort+step;
	 }
 $scope.save = function () {

    SettingFactory.saveTable($scope.items).success(function(data) {
           if (data.success) {
               
			  location.reload();
           	   }
			   else
			   {
					$scope.error="Save fails";
			   }

        });
	
	};

	
  });


