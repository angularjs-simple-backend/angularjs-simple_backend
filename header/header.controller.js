(function() {
    'use strict';
    myapp.controller('HeaderCtrl', HeaderCtrl);
	
    HeaderCtrl.$inject = [ '$rootScope', '$scope', '$cookies', '$cookieStore','AuthenticationService', '$location','SettingFactory'];
    function HeaderCtrl($rootScope, $scope,  $cookies, $cookieStore , AuthenticationService, $location,SettingFactory) {
        $scope.user = null;
		$scope.login=false;	
        $scope.items = [];
		$scope.isActive=false;
        initController();
      
       
        function initController() {
            loadCurrentUser();
			LoadMenu();

        }
		 function loadCurrentUser() {
			 if ($cookies.get("username"))
			 {
				$scope.user=$cookies.get('username');
				$scope.login=true;
				
				}
        }
		
		function LoadMenu() {

			 
        SettingFactory.getMenuItem().success(function(data) {
           if (data.success) {
                // $scope.items = data.data;
							var d=data.data;
							for (var x in d) {
							if (d[x].value)
							{
								//if (d[x].value.enable) 
								//{
									var title=(d[x].value.title)?d[x].value.title:d[x].name;
									var icon= (d[x].value.icon)?d[x].value.icon:"fa-table";
									var link= (d[x].value.link)?d[x].value.link:"/common/"+d[x].name;
									if (d[x].value.view)
									{
									link= (d[x].value.link)?d[x].value.link:"/common/"+d[x].name+"/"+d[x].value.view;
									}
									
									
									$scope.items.push({"name":title,"icon":icon,"link":link});
								//}
							}
							
							}
							
				//$scope.items.push({"name":"Setting","icon":"fa-cog","link":"/tablesetting"});
				$scope.login=true;				
           	   }
			   else if (data.data=="unauthenticated")
			   {    $scope.login=false;
					 $location.path("/login");
					
			   }

        });
		// check cookies
		

		
	
	}
	$scope.LoadMenuClass = function()
	{
		
		  return (!$scope.isActive)? 'sidemenu collapse' : 'sidemenu expand';
	  	
	}
	$scope.switchMenuClass= function()
	{
		
		$scope.isActive=!$scope.isActive;
	}
	
	$scope.link = function(link)
	{
		
		$scope.isActive=false;
	   $location.path(link);	
	}
	 $scope.active = false;
	 $scope.toggle = function () {
       $scope.active = true;
    };
	
	 $scope.logout = function() {
            
            AuthenticationService.Logout(function (data) {
                if (data.success) {
						$scope.login=false;
						$scope.user = null;
                   $location.path('/login');
				 $scope.login=false;
                } 
            });
			
        };
  
    }

})();