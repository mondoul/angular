define(function () {

    function loginController($scope, loginSrv) {

        $scope.world = "World !";
    }

    loginController.$inject = ['$scope', 'loginSrv'];

    return loginController;
});