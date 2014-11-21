'use strict';

// To avoid displaying unneccesary social logins
var clientIdProperty = 'clientID',
  defaultPrefix = 'DEFAULT_';

angular.module('mean.users', ['xeditable'])
.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
})
  .controller('AuthCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global',
    function($scope, $rootScope, $http, $location, Global) {
      // This object will contain list of available social buttons to authorize
      $scope.socialButtons = {};
      $scope.socialButtonsCounter = 0;
      $scope.global = Global;
      $http.get('/get-config')
        .success(function(config) {
          for (var conf in config) {
            // Do not show auth providers that have the value DEFAULT as their clientID
            if (config[conf].hasOwnProperty(clientIdProperty) && config[conf][clientIdProperty].indexOf(defaultPrefix) === -1) {
              $scope.socialButtons[conf] = true;
              $scope.socialButtonsCounter += 1;
            }
          }
        });
    }
  ])
  .controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global',
    function($scope, $rootScope, $http, $location, Global) {
      // This object will be filled by the form
      $scope.user = {};
      $scope.global = Global;
      $scope.global.registerForm = false;
      $scope.input = {
        type: 'password',
        placeholder: 'Password',
        confirmPlaceholder: 'Repeat Password',
        iconClass: '',
        tooltipText: 'Show password'
      };

      $scope.togglePasswordVisible = function() {
        $scope.input.type = $scope.input.type === 'text' ? 'password' : 'text';
        $scope.input.placeholder = $scope.input.placeholder === 'Password' ? 'Visible Password' : 'Password';
        $scope.input.iconClass = $scope.input.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
        $scope.input.tooltipText = $scope.input.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
      };

      // Register the login() function
      $scope.login = function() {
        $http.post('/login', {
          email: $scope.user.email,
          password: $scope.user.password
        })
          .success(function(response) {
            // authentication OK
            $scope.loginError = 0;
            $rootScope.user = response.user;
            $rootScope.$emit('loggedin');
            if (response.redirect) {
              if (window.location.href === response.redirect) {
                //This is so an admin user will get full admin page
                window.location.reload();
              } else {
                window.location = response.redirect;
              }
            } else {
              $location.url('/');
            }
          })
          .error(function() {
            $scope.loginerror = 'Authentication failed.';
          });
      };
    }
  ])
  .controller('RegisterCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global',
    function($scope, $rootScope, $http, $location, Global) {
      $scope.user = {};
      $scope.global = Global;
      $scope.global.registerForm = true;
      $scope.input = {
        type: 'password',
        placeholder: 'Password',
        placeholderConfirmPass: 'Repeat Password',
        iconClassConfirmPass: '',
        tooltipText: 'Show password',
        tooltipTextConfirmPass: 'Show password'
      };

      $scope.togglePasswordVisible = function() {
        $scope.input.type = $scope.input.type === 'text' ? 'password' : 'text';
        $scope.input.placeholder = $scope.input.placeholder === 'Password' ? 'Visible Password' : 'Password';
        $scope.input.iconClass = $scope.input.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
        $scope.input.tooltipText = $scope.input.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
      };
      $scope.togglePasswordConfirmVisible = function() {
        $scope.input.type = $scope.input.type === 'text' ? 'password' : 'text';
        $scope.input.placeholderConfirmPass = $scope.input.placeholderConfirmPass === 'Repeat Password' ? 'Visible Password' : 'Repeat Password';
        $scope.input.iconClassConfirmPass = $scope.input.iconClassConfirmPass === 'icon_hide_password' ? '' : 'icon_hide_password';
        $scope.input.tooltipTextConfirmPass = $scope.input.tooltipTextConfirmPass === 'Show password' ? 'Hide password' : 'Show password';
      };

      $scope.register = function() {
        $scope.usernameError = null;
        $scope.registerError = null;
        $http.post('/register', {
          email: $scope.user.email,
          password: $scope.user.password,
          confirmPassword: $scope.user.confirmPassword,
          username: $scope.user.username,
          name: $scope.user.name,
        })
          .success(function() {
            // authentication OK
            $scope.registerError = 0;
            $rootScope.user = $scope.user;
            Global.user = $rootScope.user;
            Global.authenticated = !! $rootScope.user;
            $rootScope.$emit('loggedin');
            $location.url('/');
          })
          .error(function(error) {
            // Error: authentication failed
            if (error === 'Username already taken') {
              $scope.usernameError = error;
            } else if (error === 'Email already taken') {
              $scope.emailError = error;
            } else $scope.registerError = error;
          });
      };
    }
  ])
  .controller('ForgotPasswordCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global',
    function($scope, $rootScope, $http, $location, Global) {
      $scope.user = {};
      $scope.global = Global;
      $scope.global.registerForm = false;
      $scope.forgotpassword = function() {
        $http.post('/forgot-password', {
          text: $scope.user.email
        })
          .success(function(response) {
            $scope.response = response;
          })
          .error(function(error) {
            $scope.response = error;
          });
      };
    }
  ])
  .controller('ResetPasswordCtrl', ['$scope', '$rootScope', '$http', '$location', '$stateParams', 'Global',
    function($scope, $rootScope, $http, $location, $stateParams, Global) {
      $scope.user = {};
      $scope.global = Global;
      $scope.global.registerForm = false;
      $scope.resetpassword = function() {
        $http.post('/reset/' + $stateParams.tokenId, {
          password: $scope.user.password,
          confirmPassword: $scope.user.confirmPassword
        })
          .success(function(response) {
            $rootScope.user = response.user;
            $rootScope.$emit('loggedin');
            if (response.redirect) {
              if (window.location.href === response.redirect) {
                //This is so an admin user will get full admin page
                window.location.reload();
              } else {
                window.location = response.redirect;
              }
            } else {
              $location.url('/');
            }
          })
          .error(function(error) {
            if (error.msg === 'Token invalid or expired')
              $scope.resetpassworderror = 'Could not update password as token is invalid or may have expired';
            else
              $scope.validationError = error;
          });
      };
    }
  ])
////////////////////////////////////////////////////////////////////////////////////////
//
.controller('UserController', ['$scope', '$http', '$timeout','Global',
    function($scope, $http, $timeout,Global) {
      $scope.global = Global;
        $http.get('/users/me')
          .then(function(result) {
            $scope.userId = result.data.name;
            // Do whatever you need to do with the userId here.
            });
        // Load address of a current user
        $scope.loadAddresses = function() {
            var responsePromise = $http.get('/users/loadAddresses');
            responsePromise.success(function(data, status, header, config) {
                $scope.addresses = data || [];
            });
            responsePromise.error(function(data, status, header, config) {
                $scope.addresses = [];
                console.log('Error: No address found');
            });
        };

        // Add a new address
        $scope.upsertAddress = function(addr) {
            // All the field are required
            if (addr.street === null ||
                addr.city === null ||
                addr.country === null ||
                addr.zipcode === null) {
                return;
            }
            // Add
            if ($scope.addressIndex === null) {
                $scope.addresses.push(addr);
                // Add to MongoDB
                $http.post('/users/addAddress', angular.toJson(addr));
            }
            // Edit
//            else {
//                angular.copy($scope.addresses[$scope.addressIndex]);//var address =
//                $http.post('/users/editAddress', addr);
//                $scope.addresses[$scope.addressIndex] = addr;
//                $scope.addressIndex = null;
//            }
            // Clear the address field
            addr = null;
        };

        // Compare current address with requested one,then save the requested values.
        $scope.editAddressForm = function(addr) {
//            $scope.editAddress = angular.copy($scope.addresses[index]);
//            $scope.addressIndex = index;
//              angular.copy(addr);//
          var address = $scope.addresses[0];
              for (var property in address) {
//                console.log(address[property]);
//                if(address[property]===null)console.log('its null');
                if (addr.hasOwnProperty(property)) {
                    // do stuff
                  address[property]=addr[property];
                }
              }
              $http.post('/users/editAddress', angular.toJson(address));
              $scope.addresses[0] = address;
          // Clear the address field
            addr = null;
        };

        // Remove an address
        $scope.removeAddress = function(index) {
            // Remove in MongoDB
            $http.post('/users/removeAddress', angular.toJson($scope.addresses[index]));
            $scope.addresses.splice(index, 1);
        };


        $scope.loadPersonalInfo = function() {
            var responsePromise = $http.get('/users/loadPersonalInfo');
            responsePromise.success(function(data, status, header, config) {
                $scope.personalInfo = data;
            });
            responsePromise.error(function(data, status, header, config) {
                console.log('Error: no user found');
            });
        };

        $scope.changePersonalInfo = function() {
            $scope.savedMessage = true;
            var responsePromise = $http.post('/users/changePersonalInfo', $scope.personalInfo);
            responsePromise.success(function(data, status, header, config) {
                // Delay 3 seconds before redirect
                $timeout(function() {
                    $scope.savedMessage = false;
                }, 3000);
            });
            responsePromise.error(function(data, status, header, config) {
                console.log('Error: please try again');
            });
        };
    }
])
//.run(function(editableOptions) {
//  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
//})
;
