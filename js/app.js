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

blogApp.controller('BlogCtrl', function($scope, $q, $timeout, $firebase, $firebaseSimpleLogin, $animate) {
    var ref = new Firebase('https://gh-brian.firebaseio.com');
    var tid = null;
    $scope.blogs = $firebase(ref.child('blogs'));
    $scope.blogs.$on('loaded', function(v) {
        reallyLoaded();
        function reallyLoaded() {
            var keys = $scope.blogs.$getIndex(),
                key = keys[0],
                content = $scope.blogs[key] && $scope.blogs[key].content;
            console.log(key, content && content.length);
            if (!key || ! $scope.blogs[key].content) {
                $scope.loading = true;
                tid = $timeout(reallyLoaded, 100);
                return;
            }
            
            $scope.loading = false;
            $scope.blogLoaded = true;
            $scope.editor.render();
            
            $scope.selectBlog(key);
            $scope.previewState = $scope.logon?'editing':'preview';
        };
    });

    $scope.editor = new Editor({
        shortcuts: {
        'Cmd-S': function() {$scope.saveBlog();}
        },
        fullScreenWrapper: document.querySelector(".blog-editor-wrap")
    });
    editor = $scope.editor;
    $scope.selectBlog = function(index) {
        $scope.currBlog = $scope.blogs[index];
        $scope.cm = $scope.editor.codemirror;
        $scope.cm.setValue($scope.currBlog.content);
        $timeout(function() {
            $scope.cm.refresh();
            $scope.cm.focus();
        });
    }
    
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
            return;
        }
        try{
            index = index || $scope.currBlog.index;
            $scope.cm.save();
            $scope.currBlog.content = $scope.cm.getValue();
            // in case of overwriting by me, the admin.
            var validEmail = ($scope.currBlog.who==$scope.email?
                $scope.email : $scope.currBlog.who);
            var blog = {
                'index': $scope.currBlog.index,
                'title': $scope.currBlog.title,
                'content': $scope.currBlog.content,
                'who': validEmail
            };
            $scope.blogs.$child(index).$set(blog).then(function(){
                showMsg('Blog Saved!');
                console.log('blog saved...')
            }, function(err) {
                showMsg(err && err.code);
                console.log(err);
            });
        } catch(e) {
            console.log(e);
        }
    }

    var delList = [];
    $scope.doDel = function() {
        if ($scope.deling) { // confirm to delete
            $scope.deling = false;
            if (!confirm('Do you really wanna delete them?'))
                return;
            while (delList.length) {
                (function() {
                    var index = delList.shift();
                    var title = $scope.blogs[index].title;
                    $scope.blogs.$remove(index).then(angular.noop, function(err) {
                    showMsg('Failed To Delete [' + title
                            + '], PERMISSION_DENIED');
                    console.log('failed to delete ' + title);
                    });
                })();
            }
            var keys = $scope.blogs.$getIndex();
            if (keys && keys.length)
                $scope.selectBlog(keys[keys.length-1]);
        } else {
            $scope.deling = true;
            delList = [];
        }
    }
    $scope.toggleDel = function(index) {
        var i = delList.indexOf(index);
        if (i>=0)
            delList.splice(i, 1);
        else
            delList.push(index);
    }
    $scope.doAdd = function() {
        var blog = {title:'', content:'', index:+new Date(), who: $scope.email};
        var ref = $scope.blogs.$child(blog.index);
        ref.$set(blog).then(function(){
            $scope.selectBlog(blog.index);
        });
    }

    /*******login********/
    $scope.$$loginDeffered;// = $q.defer();
    $scope.$on('$firebaseSimpleLogin:login', function(e, user) {
        if ($scope.logon) return;

        $scope.loading = false;
        $scope.password = '';
        $scope.email = user.email;
        $scope.$$loginDeffered 
            && $scope.$$loginDeffered.resolve(user);
        $scope.afterLogin(user);
        if (user.firebaseAuthToken) {
            localStorage['firebaseAuthToken'] = user.firebaseAuthToken;
            localStorage['email'] = user.email;
        }
        console.log('end login...');
        showMsg('Login Successfully...');
    });
    
    $scope.auth = $firebaseSimpleLogin(ref); 
    $scope.doLogin = function() {
        $scope.loading = true;
        console.log('begin login...');
        $scope.$$loginDeffered = $q.defer();
        // if current session is still on, it will auth once, and then $scope.auth.$login will auth the second
        if (localStorage['firebaseAuthToken']) {
            $scope.blogs.$auth(localStorage['firebaseAuthToken'])
                .then(function(user) {
                    $scope.$broadcast('$firebaseSimpleLogin:login', user.auth);
                }, function(err) {
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
                $('navigator').classList &&
                    $('navigator').classList.add('focus');
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
    $scope.auth.$getCurrentUser().then(function(user) {

    }, function(err) {
        $scope.doLogin();
    });
});
/* From Modernizr */
function whichAnimationEvent(){
    var t;
    var el = document.createElement('fakeelement');
    var animations = {
      'animation':'animationend',
      'OAnimation':'oAnimationEnd',
      'MozAnimation':'animationend',
      'WebkitAnimation':'webkitAnimationEnd',
      'MsAnimation':'msAnimationEnd'
    }

    for(t in animations){
        if( el.style[t] !== undefined ){
            return animations[t];
        }
    }
}
window.animationEvent = whichAnimationEvent();
function whenAnimationEnd(e, cb) {
    animationEvent && e.addEventListener(animationEvent, cb);
}
var msgBox = $('msgbox');
function showMsg(msg, timeout) {
    msgBox.style.display = 'block';
    msgBox.style.opacity = 0;
    msgBox.innerHTML = msg;
    msgBox.classList.add('show');
    
    timeout = timeout || 3000;
    setTimeout(hideMsg, timeout);
}
whenAnimationEnd(msgBox, function(e) {
    if (e.animationName == 'bounce-in') {
        msgBox.style.display = 'block';
        msgBox.style.opacity = 1;
    }
    else {
        msgBox.style.display = 'none';
        msgBox.style.opacity = 0;    
    }
});
function hideMsg() {
    msgBox.style.display = 'block';
    msgBox.classList.remove('show');
}
