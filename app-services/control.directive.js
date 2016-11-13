myapp.controller('InputControlController', function($scope,CommonFactory) {
$scope.tables=[];

$scope.list_model=[];
$scope.loadtable = function (tablename,displayfield,islist) {
CommonFactory.getListLinkTable(tablename,displayfield).success(function(data) {
           if (data.success) {
			   $scope.tables[tablename]=data.data;
                // var listtable = data.data;
				// var obj={tablename:tablename,data:listtable}
				// $scope.tables.push(obj);
				console.log(islist);
					if (islist && $scope.model)
					{
	
					
					//$scope.list_model=[1]
					$scope.list_model=$scope.model.split(",");
				
					}
           	   }

        });
}
$scope.multiplechange = function () {
$scope.model =$scope.list_model.join();
}


});	

myapp.directive('control', ['$compile', function($compile) {
	
	
   return {
    restrict: 'E',
    scope: {
      model: "=",
	  type: "=",
	  disabled: "=",
   

    },
	controller: "InputControlController",
    compile: function(element, attrs) {

      return function(scope, element, attrs) {
         var template = '';
		 var control="text";

		 if (scope.type.value)
		{
			if (scope.type.value.editform)
				{
					control=scope.type.value.editform.id;
					
	
				}
		}
		
		switch(control) {
			    case "number":
				template = '<input type="number" ng-model="model" ng-disabled="disabled"  class="form-control"  >';
				break;
			    case "datetime":
				template = '<input type="date" ng-model="model" ng-disabled="disabled"  class="form-control"  >';
				break;
				case "textarea":
				template = '<textarea  ng-model="model" ng-disabled="disabled" class="form-control"   ></textarea>';
			    break;
				case "checkbox":
				template = '<input type="checkbox"  ng-model="model"  ng-true-value="\'1\'" ng-false-value="\'0\'"  >';
				 break;
				case "link":
				template = '<select  ng-options="option.id as option.name for option in tables[type.value.editform.link]" ng-model="model" ng-init="loadtable(type.value.editform.link,type.value.editform.displayfield,false)" class="form-control">';
				break;
				case "list":
				template = '<select  multiple ng-options="option.id as option.name for option in tables[type.value.editform.list]" ng-model="list_model" ng-change="multiplechange()"  ng-init="loadtable(type.value.editform.list,type.value.editform.displayfield,true)" class="form-control">';
			    break;
		        default:
		      	template = '<input type="text" ng-model="model" ng-disabled="disabled"  class="form-control"  >';
						}
			
		
        


        element.html(template);
 
        $compile(element.contents())(scope);
        
      };
      
    }
  };
}]);
