function $(id){
    return document.getElementById(id);
}

var blogApp = angular.module('blogApp', ['firebase']);
blogApp.controller('BlogCtrl', function($scope, $q, $timeout, $firebase, $firebaseAuth) {
    var ref = new Firebase('https://gh-brian.firebaseio.com');
    $scope.blogs = $firebase(ref.child('blogs'));

    $scope.titleClick = function(index) {
        $scope.currBlog = $scope.blogs.list[index];
        $scope.currBlog.index = index;
    }
    var tid = null;    
    $scope.contentChange = function(index) {
        if ($scope.$$user) {
            if (tid) $timeout.cancel(tid);
            tid = $timeout(function() {
                $scope.blogs.$child('list/' + index + '/content').$set($scope.currBlog.content);
                console.log('Ä¬Ä¬µØchanged...');
            }, 10000);
        }
        else {
            console.log('no login yet...');
            /*$scope.doLogin().then(function() {
                $scope.contentChange(index);
            }, function(err) {
                console.log('login err ' + err);    
            });*/
        }
    }

    $scope.doLogin = function() {
        console.log('begin login...');
        $scope.auth = $firebaseAuth(ref);

        var deffered = $q.defer();
        $scope.$on('$firebaseAuth:login', function(e, user) {
            $scope.password = '';
            user = user.d || user;
            $scope.$$user = user;
            $scope.email = user.email;
            deffered.resolve(user);
            $scope.afterLogin();
            if (user.firebaseAuthToken) {
                localStorage['firebaseAuthToken'] = user.firebaseAuthToken;
                localStorage['email'] = user.email;
            }
            console.log('end login...');
        });
        if (localStorage['firebaseAuthToken'])
            $scope.auth.$login(localStorage['firebaseAuthToken']).then(angular.noop, function(err) {
                deffered.reject(err);
                console.log('token err: ' + err);
                // invalid token, login again
                localStorage.removeItem['firebaseAuthToken'];
                $scope.doLogin();
            });
        else {
            $scope.auth.$login('password', {email:$scope.email, password: $scope.password}).then(angular.noop, function(err) {
                deffered.reject(err);    
                console.log('password err:' + err);
            });
        }
        return deffered.promise;
    }
    $scope.afterLogin = function() {
        var user = $scope.$$user;
        var nice = false;
        if (user)
            nice = true;
        if (!nice)
            return;
        $scope.afterLogin = angular.noop;
        console.log('Welcome, ' + user.email);
        return;
    }
});
