(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location','$scope','AuthenticationService' ];
    function LoginController($location,$scope, AuthenticationService) {
        var vm = this;
		vm.error="";	
        vm.login = login;

        (function initController() {
            // reset login status
            AuthenticationService.ClearCredentials();
        })();

        function login() {

            AuthenticationService.Login(vm.username, vm.password, function (response) {
                if (response.success) {
                    AuthenticationService.SetCredentials(vm.username, vm.password);
                     $location.path('/');
					   location.reload(); 
					 
                } else {
                   
                  vm.error="Login fail!";
                }
            });
        };
    }

})();
