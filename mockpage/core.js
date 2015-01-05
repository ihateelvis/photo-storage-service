var scotchTodo = angular.module('scotchTodo', []);

function mainController($scope, $http) {
    $scope.formData = {};
    $scope.photo;

    $scope.standardGet = function(path) {
        $http.get(path)
            .success(function(data) {
                console.log(data);
                $scope.photo = data;
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
            });
    }

    $scope.singleGet = function() {
        $scope.standardGet('/api/users/1/photos/1');
    };

    $scope.multiGet = function(type) {
        if (type == 'single') {
            $scope.standardGet('/api/users/1/photos');
        } else if (type == 'multi') {
            $scope.standardGet('/api/photos');
        }
    }

    $scope.singlePost = function() {
        $http.post('/api/users/1/photos', {
            userPhoto: $scope.userPhoto,
            photoTitle: $scope.title,
            photoCaption: $scope.caption
        })
            .success(function(data) {
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
            });
    }

    $scope.singlePut = function() {
        $http.put('/api/users/1/photos/1', {})
            .success(function(data) {
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
            });
    }

    $scope.singleDelete = function() {
        $http.delete('/api/users/1/photos/1')
            .success(function(data) {
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
            });
    }

    $scope.singleGet();

}
