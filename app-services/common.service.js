(function () {
    'use strict';

    myapp.factory('CommonService', CommonService);

    CommonService.$inject = ['$http'];
    function CommonService($http) {
        var service = {};

        service.GetAll = GetAll;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;

        return service;

        function GetAll() {
            return $http.get('/api/common').then(handleSuccess, handleError('Error getting all users'));
        }

  

        function Create(record) {
            return $http.post('/api/common/create', record).then(handleSuccess, handleError('Error creating user'));
        }

        function Update(record) {
            return $http.put('/api/common/update/' + record.id, record).then(handleSuccess, handleError('Error updating user'));
        }

        function Delete(id) {
            return $http.delete('/api/users/' + id).then(handleSuccess, handleError('Error deleting user'));
        }

        // private functions

        function handleSuccess(data) {
            return data;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
    }

})();
