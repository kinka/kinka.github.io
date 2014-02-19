function $(id){
    return document.getElementById(id);
}
var editor;
var blogApp = angular.module('blogApp', ['firebase']);
blogApp.filter('markdown', function($sce) {
    return function(text) {
        if (text)
            return $sce.trustAsHtml(Editor.markdown(text));
        else
            return '';
    }
});

blogApp.controller('BlogCtrl', function($scope, $q, $timeout, $firebase, $firebaseAuth, $animate) {
    var ref = new Firebase('https://gh-brian.firebaseio.com');
    $scope.blogs = $firebase(ref.child('blogs'));
    $scope.blogs.$on('loaded', function(v) {
        $scope.editor = new Editor({shortcuts: {
            'Cmd-S': function() {$scope.saveBlog();}
        }});
        editor = $scope.editor;
        $scope.editor.render();

        var index = v.index[0];
        $scope.currBlog = v.list[index];
        $scope.currBlog.index = index;
        $scope.blogLoaded = true;
        $scope.cm = $scope.editor.codemirror;
        $scope.cm.setValue($scope.currBlog.content);
    });

    $scope.titleClick = function(index) {
        $scope.currBlog = $scope.blogs.list[index];
        $scope.currBlog.index = index;
        $scope.cm = $scope.editor.codemirror;
        $scope.cm.setValue($scope.currBlog.content);
    }

    var tid = null;    
    $scope.contentChange = function(index) {
        if (tid) $timeout.cancel(tid);
        tid = $timeout(function() {
            $scope.saveBlog(index);
        }, 2000);
    }
    
    $scope.saveBlog = function(index) {
        if (! $scope.logon) {
            $scope.doLogin().then(function(user) {
                $scope.saveBlog.call($scope, index)
            });
        }

        index = index || $scope.currBlog.index;
        
        $scope.blogs.$child('list/'+index+'/title').$set($scope.currBlog.title);
        $scope.cm.save();
        $scope.currBlog.content = $scope.cm.getValue();
        $scope.blogs.$child('list/' + index + '/content').$set($scope.currBlog.content);
        console.log('blog saved...');
    }

    $scope.$$loginDeffered;// = $q.defer();
    $scope.$on('$firebaseAuth:login', function(e, user) {
        if ($scope.logon) return;

        $scope.password = '';
        user = user.d || user;
        $scope.email = user.email;
        $scope.$$loginDeffered.resolve(user);
        $scope.afterLogin(user);
        if (user.firebaseAuthToken) {
            localStorage['firebaseAuthToken'] = user.firebaseAuthToken;
            localStorage['email'] = user.email;
        }
        console.log('end login...');
    });
    $scope.doLogin = function() {
        console.log('begin login...');
        $scope.$$loginDeffered = $q.defer();
        // if current session is still on, it will auth once, and then $scope.auth.$login will auth the second
        $scope.auth = $firebaseAuth(ref); 

        if (localStorage['firebaseAuthToken']) {
            $scope.auth.$login(localStorage['firebaseAuthToken']).then(angular.noop, function(err) {
                $scope.$$loginDeffered.reject(err);
                console.log('token err: ' + err);
                // invalid token, login again
                localStorage.removeItem('firebaseAuthToken');
                $scope.doLogin();
            });
        } else {
            $scope.auth.$login('password', {email:$scope.email, password: $scope.password}).then(angular.noop, function(err) {
                $scope.$$loginDeffered.reject(err);    
                console.log('password err:' + err);
            });
        }
        return $scope.$$loginDeffered.promise;
    }
    $scope.afterLogin = function(user) {
        if (!user)
            return;
        $scope.logon = true;
        console.log('Welcome, ' + user.email);
        return;
    }
    $scope.doLogoff = function() {
        $scope.auth.$logout();
        localStorage.removeItem('firebaseAuthToken');
        $scope.logon = false;
    }
});

