

   var myapp= angular
        .module('app', ['ngRoute', 'ngCookies','ngSanitize','ui.bootstrap'])
        .config(config)
        .run(run);

    config.$inject = ['$routeProvider', '$locationProvider'];
    function config($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                controller: 'HomeController',
                templateUrl: 'home/home.view.html',
                controllerAs: 'vm'
            })
			.when('/common/:table', {
                controller: 'CommonController',
                templateUrl: 'common/common.view.html',
                controllerAs: 'vm'
            })
			.when('/common/:table/:view', {
                controller: 'CommonController',
                templateUrl: 'common/common.view.html',
                controllerAs: 'vm'
            })
			.when('/tablesetting', {
                controller: 'TableSettingController',
                templateUrl: 'setting/tablesetting.view.html',
                controllerAs: 'vm'
            })

            .when('/login', {
                controller: 'LoginController',
                templateUrl: 'login/login.view.html',
                controllerAs: 'vm'
            })

            .when('/register', {
                controller: 'RegisterController',
                templateUrl: 'register/register.view.html',
                controllerAs: 'vm'
            })
			 .when('/extras/:page', {
			  controller: 'ExtrasController',
              templateUrl: 'extras/extras.view.html',
              controllerAs: 'vm'
            })
             .when('/tools', {
              controller: 'ToolController',
              templateUrl: 'tools/tools.view.html',
              controllerAs: 'vm'
            })
             .when('/tools/black_list', {
              controller: 'BlackListController',
              templateUrl: 'tools/black_list/black_list.view.html',
              controllerAs: 'vm'
            })

            .otherwise({ redirectTo: '/login' });
    }

    run.$inject = ['$rootScope', '$location', '$cookies', '$http','$templateCache'];
    function run($rootScope, $location, $cookies, $http,$templateCache) {
        // keep user logged in after page refresh
		$rootScope.$on('$viewContentLoaded', function() {
      //$templateCache.removeAll();
   });
		
   
		
     

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            
            var restrictedPage = $.inArray($location.path(), ['/login','/']) === -1;
            var loggedIn = $cookies.get("username");
            if (restrictedPage && !loggedIn) {
                $location.path('/login');
            }
        });
    }

	
	
	myapp.factory('CommonFactory', function($http) {
	var API_URL="api/";	
    var factory = {};
	factory.getListLinkTable = function(tablename,display) {
		
        return $http.get(API_URL + 'getListLinkTable/'+tablename,{params:{display:display}});
    };
    factory.getList = function(tablename,pagesize,pageno,sort) {
        return $http.get(API_URL + 'listGeneral',{params:{table:tablename,pagesize:pagesize,pageno:pageno,sort:sort}});
    };
    factory.getListByKeyword = function(tablename,keyword,searchby,pagesize,pageno,sort) {
        return $http.get(API_URL + 'searchGeneral',{params:{table:tablename,keyword:keyword,searchby:JSON.stringify(searchby),pagesize:pagesize,pageno:pageno,sort:sort}});
    };
	 factory.deleteItems = function(itemids,tablename) {
        return $http.post(API_URL + 'deleteGeneral/'+tablename,{params:{itemids:itemids}},{data:'application/json'});
    };
	factory.updateItem = function(item,tablename) {
        return $http.post(API_URL + 'updateGeneral/'+tablename,{params:{item:item}},{data:'application/json'});
    };
	factory.insertItem = function(item,tablename) {
        return $http.post(API_URL + 'insertGeneral/'+tablename,{params:{item:item}},{data:'application/json'});
    };
	
	
    return factory;
});
	myapp.factory('SettingFactory', function($http) {
	var API_URL="api/";	
    var factory = {};
    factory.getTable = function() {
        return $http.get(API_URL + 'getTable');
    };
	factory.getColumn = function(tablename) {
        return $http.get(API_URL + 'getColumn/'+tablename);
    };
	factory.saveTable = function(object) {
        return $http.post(API_URL + 'saveTable',{params:{object:object}},{data:'application/json'});
    };
	factory.saveColumn = function(tablename,object) {
        return $http.post(API_URL + 'saveColumn/'+tablename,{params:{object:object}},{data:'application/json'});
    };
	 factory.getMenuItem = function() {
        return $http.get(API_URL + 'getMenuItem');
    };
	
    return factory;
});
	


  myapp.directive('autofocus', ['$timeout',
    function ($timeout) {
      return {
        restrict: 'A',
        link: function ($scope, $element) {
          $timeout(function () {
            $element[0].focus();
          });
        }
      };
    }
  ]);

  myapp.directive('focus', function() {
  return {
    restrict: 'A', 

    link: function($scope,elem,attrs) {

      elem.bind('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code === 13) {
		   elem.parent().next().find('.form-control').focus(); 
		   
		  
        }
      });
    }
  }
});

myapp.directive('rows', function () {
	return {
		restrict: "E",
		replace: true,
		scope: {
			fields: '=',
			propeties: '=',		
			table: '=',
			primarykey: '=',
			index: '=',
		},
	     templateUrl: "common/row.view.html",
        controller: "CommonRowController",
	}
});
myapp.directive('rowsHeader', function () {
	return {
		restrict: "E",
		replace: true,
		scope: {
			fields: '=',
			propeties: '=',
			sort:'=',
		},
	     templateUrl: "common/rowheader.view.html" ,
			controller: "CommonRowController",		 
	}
});







