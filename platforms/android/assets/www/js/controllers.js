angular.module('app.controllers', [])

.controller('menuCtrl', function($scope, $state, $ionicPopup, Auth, Data, $ionicLoading) {
  $scope.data = {};
  $scope.show = function() {
    $ionicLoading.show({
        template: 'Cargando...<br><br><ion-spinner icon="bubbles"></ion-spinner>',
    }).then(function(){
        //console.log("The loading indicator is now displayed");
    });
  };
  $scope.hide = function(){
      $ionicLoading.hide().then(function(){
          //console.log("The loading indicator is now hidden");
      });
  }
  $scope.data.users = Data;
  $scope.show();
  Auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.data.firebaseUser = firebaseUser;
      //$scope.data.firebaseUser.displayname=firebaseUser.displayName;
      //alert($scope.data.firebaseUser.email);
      console.log(firebaseUser.displayName);

      Data.child("users").child(firebaseUser.uid).once('value', function (snapshot) {
        var key = snapshot.key;
        var childKey = snapshot.child("displayName").val();
        var childKey2 = snapshot.child("email").val();
        //alert(childKey+" : "+childKey2);
        setTimeout(function () {
          $scope.$apply(function () {
            $scope.data.firebaseUser.displayname = childKey;
            $scope.hide();
          });
          }, 1);

        //alert($scope.data.firebaseUser.displayname);
      });

    });
  $scope.logOut = function(){


    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '',
      title: '¿Seguro que deseas cerrar sesión?',
      subTitle: '',
      scope: $scope,
      buttons: [
        { text: 'Cancelar' },
        {
          text: '<b>Si</b>',
          type: 'button-calm',
          onTap: function(e) {
            //alert(e);
          if(e) {
            //alert("Cerre sesión");
            firebase.auth().signOut().then(function() {
              $state.go('login');
              // Sign-out successful.
            }, function(error) {
              // An error happened.
            });
          }
        }
        }
      ]
    });


    /*firebase.auth().signOut().then(function() {
      $state.go('menu.login');
      // Sign-out successful.
    }, function(error) {
      // An error happened.
    }); */
  }
})



.controller("loginCtrl", function($scope, $state, $ionicLoading, $ionicPopup, UserService, Auth, Data, $q) {

  //facebook>>
  //This is the success callback from the login method
   var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }

    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
      // For the purpose of this example I will store user data on local storage
      UserService.setUser({
        authResponse: authResponse,
				userID: profileInfo.id,
				name: profileInfo.name,
				email: profileInfo.email,
        picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
      });
      $ionicLoading.hide();
      //$scope.hide();
      $state.go('menu.inicio');
    }, function(fail){
      // Fail get profile info
      console.log('profile info fail', fail);
    });
  };

  // This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  // This method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
      function (response) {
				console.log(response);
        info.resolve(response);
      },
      function (response) {
				console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function() {
    facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){

		 //alert(success.authResponse.accessToken);
		 var credential = firebase.auth.FacebookAuthProvider.credential(
                    success.authResponse.accessToken);

                firebase.auth().signInWithCredential(credential).catch(function (error) {

                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // The email of the user's account used.
                    var email = error.email;
                    // The firebase.auth.AuthCredential type that was used.
                    var credential = error.credential;
                    // ...
                });

        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        console.log('getLoginStatus', success.status);

    		// Check if we have our user saved
    		var user = UserService.getUser('facebook');

    		if(!user.userID){
					getFacebookProfileInfo(success.authResponse)
					.then(function(profileInfo) {
						// For the purpose of this example I will store user data on local storage
						UserService.setUser({
							authResponse: success.authResponse,
							userID: profileInfo.id,
							name: profileInfo.name,
							email: profileInfo.email,
							picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
						});

						//$scope.hide();
						$state.go('menu.inicio');
					}, function(fail){
						// Fail get profile info
						console.log('profile info fail', fail);
					});
				}else{
					//$scope.hide();
						$scope.show();

						$scope.hide();
						$state.go('menu.inicio');

				}
      } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
				// but has not authenticated your app
        // Else the person is not logged into Facebook,
				// so we're not sure if they are logged into this app or not.

				console.log('getLoginStatus', success.status);

				$ionicLoading.show({
          template: 'Logging in...'
        });

				// Ask the permissions you need. You can learn more about
				// FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
      }
    });
  };
  //<<facebook

  $scope.data = {};
  $scope.show = function() {
    $ionicLoading.show({
        template: 'Iniciando Sesión...<br><br><ion-spinner icon="bubbles"></ion-spinner>',
    }).then(function(){
        console.log("The loading indicator is now displayed");
    });
  };
  $scope.hide = function(){
      $ionicLoading.hide().then(function(){
          console.log("The loading indicator is now hidden");
      });
  }
  var myPopup = null;
  $scope.showPopup = function() {


  // An elaborate, custom popup
  myPopup = $ionicPopup.show({
    template: '<center><a ng-click="resetPass()">¿Olvidaste tu contraseña?</a></center>',
    title: 'Correo electrónico o contraseña incorrectos',
    subTitle: 'Por favor vuelve a ingresar tus datos',
    scope: $scope,
    buttons: [

      {
        text: '<b>Aceptar</b>',
        type: 'button-calm',

      }
    ]
  });
  myPopup.then(function(res) {
    //console.log('Tapped!', res);
  });
}
  //var auth = $firebaseAuth();
  $scope.loginEmail = function(){

    var email=$scope.data.username;
    var password=$scope.data.password;
    //alert($scope.data.password);
    $scope.show();
      Auth.$signInWithEmailAndPassword(email, password).then(function(firebaseUser){
        //alert(firebaseUser.email);
        $scope.hide();
        $state.go('menu.inicio');

      }).catch(function(error) {
        // Handle Errors here.
        $scope.hide();
        var errorCode = error.code;
        var errorMessage = error.message;
        $scope.showPopup();


        //alert("Usuario o contraseña incorrecta");
        // ...
      });
  }

  //$scope.loginFacebook = function(){
    /*var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('public_profile');
    provider.addScope('user_birthday');
    provider.addScope('user_friends'); */

    /*var credential = new firebase.auth.FacebookAuthProvider.credential("");
    //var credential = firebase.auth.TwitterAuthProvider.credential(token, secret);
    firebase.auth().signInWithCredential(credential).then (function(result) {
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      alert(token);
      console.log(token);
    }); */
    //alert("Entra 1");
    /*$cordovaOauth.facebook("1120308468038109", ["email", "public_profile"]).then(function(result) {
        //console.log("Response Object -> " + JSON.stringify(result));
        alert("Entra Facebook");
        //$state.go('menu.inicio');
        //alert("Response Object -> " + JSON.stringify(result));
    }, function(error) {
        //console.log("Error -> " + error);
        //alert("Error");
        alert("Error -> " + error);
    }); */

    /*firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      //alert(token);
      console.log(token);
      $state.go('menu.inicio');
      // ...
    }).catch(function(error) {

      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    }); */
   //}

  $scope.irRegistro = function(){
    $state.go('registro');
  }


  $scope.resetPass = function() {
  var myPopup2 = $ionicPopup.show({
      template: '<input style="" type="email" placeholder="Correo Electrónico" ng-model="data.resetCorreo">',
      title: 'Restablecer contraseña',
      subTitle: 'Ingresa tu correo electronico.',
      scope: $scope,
      buttons: [

        {
          text: '<b>Aceptar</b>',
          type: 'button-calm',
        onTap: function(e) {
          if (!$scope.data.resetCorreo) {
            //don't allow the user to close unless he enters wifi password
            alert("Ingresa correo electrónico!");
            e.preventDefault();
            console.log("No correo!");
          } else {
            return $scope.data.resetCorreo;
          }
        }
      },
      {
        text: '<b>Cancelar</b>',
        type: 'button button-light',
      onTap: function(e) {

      }
    }
      ]
    });
    myPopup2.then(function(res) {
      if (res) {
        console.log('Tapped!', res);
        console.log("reset pass: "+res);
        Auth.$sendPasswordResetEmail(res);
        //Auth.$sendPasswordResetEmail("rihch888@gmail.com");
      }
      if(myPopup!=null){
        myPopup.close();
      }
    });
  }

})


.controller("registroCtrl", function($scope, $state, Auth, Data) {
  $scope.data = {};
  $scope.registrar = function() {
    var displayname = $scope.data.displayname;
    var email = $scope.data.username;
    var password = $scope.data.password;
     Auth.$createUserWithEmailAndPassword(email, password)
        .then(function(firebaseUser) {

          Data.child("users").child(firebaseUser.uid).set({
                email: email,
                displayName: displayname,
                accesoEvento: 0
            });
          //alert("Usuario creado uid: "+ firebaseUser.uid);
         $state.go('login');
        }).catch(function(error) {
          //$scope.error = error;
          alert(error);
        });

  }
  })

.controller("eventosCtrl", function($scope, Auth, Data, $firebaseArray, $localStorage, $location, $ionicLoading, $cordovaBarcodeScanner) {
   $scope.eventos = {};
  $scope.data = {};
  var refEv = Data.child("eventos");
  var refSc = Data.child("Score");
  $localStorage.evento="";

  $scope.qr = function(){
	var idQREvento = "-Kj5pENaEKwLp0DcXSa2";  //-KaG0ysHI3TlR5TD1orw, -Kj0ZSveZJSJlVg6Z2rJ, -Kj4TMecXX-Dss7QoY1v ,-Kj5pENaEKwLp0DcXSa2
    //aparece lector qr que contiene id del nuevo evento. Ejemplo evento con id: -Kj0ZSveZJSJlVg6Z2rJ
    $cordovaBarcodeScanner.scan().then(function(imageData) {
			idQREvento = imageData.text;
            //alert(imageData.text);
            //console.log("Barcode Format -> " + imageData.format);
            //console.log("Cancelled -> " + imageData.cancelled);
        }, function(error) {
            //console.log("Error -> " + error);
			alert("Vuelve a intentarlo");
	});

    Auth.$onAuthStateChanged(function(firebaseUser) {
      var i = 0;
      Data.child("eventos-users").orderByChild('idUser').equalTo(firebaseUser.uid).once('value', function (snapshot) {
          snapshot.forEach(function(snapshot) {// todos los registros del usuario en eventos
            console.log(snapshot.child("idEvento").val());
            var idE = snapshot.child("idEvento").val();
            if(idE==idQREvento) { // si existe el usuario está inscrito al nuevo evento
              i++;
            }
          });
          console.log(i);
          if (i==0) {
            console.log("usuario NO inscrito al nuevo evento");
            Data.child("eventos-users").push().set({
                  idEvento: idQREvento,
                  idUser: firebaseUser.uid,
                  estado: 0
              });
          }else{
            console.log("usuario inscrito al nuevo evento");
          }
        });
      });
      var upd = {};
      Data.child("eventos").child(idQREvento).once('value', function (snapshot) {
        console.log(snapshot.child('inscritos').val());
        var inscritos = snapshot.child('inscritos').val()
        upd['/eventos/' + idQREvento+ '/inscritos'] = inscritos+1;
        Data.update(upd);
      });
  };
    $scope.show = function() {
      $ionicLoading.show({
          template: 'Cargando...<br><br><ion-spinner icon="bubbles"></ion-spinner>',
      }).then(function(){
          //console.log("The loading indicator is now displayed");
      });

    };
    $scope.hide = function(){
        $ionicLoading.hide().then(function(){
            //console.log("The loading indicator is now hidden");

        });
    };
    $scope.show();
    var accesoUsuario = 0;
    Auth.$onAuthStateChanged(function(firebaseUser) {
        Data.child("users").child(firebaseUser.uid).once('value', function (snapshot) { //DATOS DE USUARIO LOGEADO
          var key = snapshot.key;
          var accEv = snapshot.child("accesoEvento").val();
          if(accEv==1){
            accesoUsuario=1;
          }else{
            accesoUsuario=0;
			$scope.hide();
          }
          // IMPORTANTE: Cuando se acabe el evento, cambiar "jugar" a ""
        });
      });
    $scope.ruta = function(obj){
      var idEvSel=obj.id;

      Auth.$onAuthStateChanged(function(firebaseUser) {
          Data.child("eventos-users").orderByChild('idUser').equalTo(firebaseUser.uid).once('value', function (snapshot) {
            snapshot.forEach(function(snapshot) {// cada cosa a dentro de esto lo hace dos veces :(
              $scope.existeEvento = false;
              var idEv = snapshot.child("idEvento").val();
              var estadoEventoSel = snapshot.child("estado").val();
              if (idEv==idEvSel) {
                console.log(idEv);
                if (estadoEventoSel==0) {
                  setTimeout(function () {
                    $scope.$apply(function () {
                      console.log("estado eventos-users = 0");
                      $location.url("/menu/eventos");
                    });
                  }, 50);
                }else if (estadoEventoSel==1) {
                  setTimeout(function () {
                    $scope.$apply(function () {
                      console.log("estado eventos-users = 1");
                      $location.url("/menu/jugar");
                      $localStorage.evento=obj;
                    });
                  }, 50);
                }else if (estadoEventoSel==2) {
                  setTimeout(function () {
                    $scope.$apply(function () {
                      console.log("estado eventos-users = 2");
                      $location.url("/menu/score");
                      $localStorage.evento=obj;
                    });
                  }, 50);
                }
              }
            });
          });
        });
      }

      $scope.eventos = [];
      Auth.$onAuthStateChanged(function(firebaseUser) {
          Data.child("eventos-users").orderByChild('idUser').equalTo(firebaseUser.uid).once('value', function (snapshot) {
            snapshot.forEach(function(snapshot) {
              var idEvento = snapshot.child("idEvento").val();
              var estado = snapshot.child("estado").val();
              Data.child("eventos").child(idEvento).once('value', function (snapshot) {
                var id = snapshot.key;
                var capacidad = snapshot.child("capacidad").val();
                var fecha = snapshot.child("fecha").val();
                var inscritos = snapshot.child("inscritos").val();
                var nombre = snapshot.child("nombre").val();
                    $scope.eventos.push({
                      id : id,
                      capacidad : capacidad,
                      estado : estado,
                      fecha : fecha,
                      inscritos : inscritos,
                      nombre : nombre
                    });
                    $scope.hide();
              });
            });
          });
        });
    /*setTimeout(function () {
      $scope.$apply(function () {
        $scope.eventos = eventos;
        console.log(eventos);
        $scope.hide();
      });
    }, 500);*/

})

.controller("chatCtrl", function($scope, $firebaseArray, Auth, Data) {
  //alert(Auth.user);
    $scope.data = {};
    $scope.auth = Auth;


    // any time auth state changes, add the user data to scope
    Auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.data.firebaseUser = firebaseUser;

      $scope.data.firebaseUser.displayname = firebaseUser.displayName;
      Data.child("users").child(firebaseUser.uid).once('value', function (snapshot) {
        var key = snapshot.key;
        var childKey = snapshot.child("displayName").val();
        var childKey2 = snapshot.child("email").val();
        //alert(childKey+" : "+childKey2);
        $scope.data.firebaseUser.displayname = childKey;
      });

    });
      var refMsg = Data.child("messages");
      // create a synchronized array
      $scope.messages = $firebaseArray(refMsg);

      // add new items to the array
      // the message is automatically added to our Firebase database!
      $scope.addMessage = function() {
        $scope.messages.$add({
          text: $scope.data.message,
          email: $scope.data.firebaseUser.email,
          name: $scope.data.firebaseUser.displayname
          //email: $ionicUser.details.email,
          //name: $ionicUser.details.name
        });
        $scope.data.message = '';
      }
})

.controller("perfilCtrl", function($scope, Auth, Data, $ionicHistory, $cordovaCamera, $cordovaFile) {
  $scope.data = {};
  $scope.data.users = Data;
  Auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.data.firebaseUser = firebaseUser;
      //$scope.data.firebaseUser.displayname=firebaseUser.displayName;
      //alert($scope.data.firebaseUser.email);
      console.log(firebaseUser.displayName);

      Data.child("users").child(firebaseUser.uid).once('value', function (snapshot) {
        var key = snapshot.key;
        var childKey = snapshot.child("displayName").val();
        var childKey2 = snapshot.child("email").val();
        //alert(childKey+" : "+childKey2);
        $scope.data.firebaseUser.displayname = childKey;

        //alert($scope.data.firebaseUser.displayname);
      });

    });


  /*function dataURItoBlob(dataURI) {
    'use strict'
    var byteString,
        mimestring

    if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
        byteString = atob(dataURI.split(',')[1])
    } else {
        byteString = decodeURI(dataURI.split(',')[1])
    }

    mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0]

    var content = new Array();
    for (var i = 0; i < byteString.length; i++) {
        content[i] = byteString.charCodeAt(i)
    }

    return new Blob([new Uint8Array(content)], {type: 'image/jpeg'});
} */


  $scope.upload = function() {
    //alert("entra");

    var options = {
      quality : 75,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: true,
      encodingType: Camera.EncodingType.JEPG,
      popoverOptions: CameraPopoverOptions,
      mediaType: Camera.MediaType.PICTURE,
      targetWidth: 500,
      targetHeight: 500,

    }
    $cordovaCamera.getPicture(options).then(function(imageData){
      Auth.$onAuthStateChanged(function(firebaseUser) {
      var image = document.getElementById('profile-image');
      image.src = imageData;
      var directorioFuente = imageData.substring(0, imageData.lastIndexOf('/') + 1),
      archivoFuente = imageData.substring(imageData.lastIndexOf('/') + 1, imageData.length);
      //nombreParaGuardar = new Date().valueOf() + archivoFuente;

      //alert(directorioFuente);
      //alert(archivoFuente);
      //alert(nombreParaGuardar);
      //alert(imageData);
      //var blob = new Blob([imageData], {type: 'image/jpeg'});
      //alert(blob);
      //var blob = null;

      /*$cordovaFile.readAsArrayBuffer(directorioFuente, archivoFuente).then(function (success) {
            //var blob = new Blob([new Uint8Array(success)], {type: 'image/jpeg'});
            alert("exito!");
            //enviarFirebase(blob, nombreParaGuardar);
        }, function (error) {
          alert("error: "+error);
            console.error(error);
        }); */

        /*window.resolveLocalFileSystemURL(imageData, function (fileEntry) {
             fileEntry.file(function (file) {
                 var reader = new FileReader();
                 reader.onloadend = function () {
                          // This blob object can be saved to firebase
                          var blob = new Blob([new Uint8Array(this.result)], { type: "image/jpeg" });
                          alert("si");
                          //sendToFirebase(blob);
                 };
                 reader.readAsArrayBuffer(file);
              });
          }, function (error) {
              errorCallback(error);
          }); */


      /*$cordovaFile.readAsArrayBuffer(directorioFuente, archivoFuente)
        .then(function (success) {
            var blob = new Blob([success], {type: 'image/jpeg'});
            alert(success);
            //enviarFirebase(blob, nombreParaGuardar);
        }, function (error) {
          alert("error"+error);
            console.error(error);
        });*/

      // ---------------------------------------------------------------------------
      //var dataURL = imageData.toDataURL('image/jpeg', 0.5);
      //var blob = dataURItoBlob(dataURL);
      //var blob = dataURItoBlob(imageData);
      //var storageRef = firebase.storage().ref().child("photos/photo.jpg").put(imageData[0]);

      //alert("alerta exito!");

      //Data.child("users").child(firebaseUser.uid).update({
        //displayName: "Ricardo 888"
      //  avatar: imageData
      //});

      //alert("alerta 3: "+firebaseUser.uid);
      });
    }, function(error){
      alert("error");
      console.error("ERROR: "+error);
    });

    }
})

.controller("inicioCtrl", function($scope, Auth, Data, $localStorage) {
  $scope.data = {};
  Auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.data.firebaseUser = firebaseUser;
      //$scope.data.firebaseUser.displayname=firebaseUser.displayName;
      //alert($scope.data.firebaseUser.email);
      console.log(firebaseUser.displayName);


      Data.child("users").child(firebaseUser.uid).once('value', function (snapshot) {


        //setTimeout(function () {
          $scope.$apply(function () {
            $scope.data.name = snapshot.child("displayName").val();

          });
          //}, 1);
      });

    });
  $localStorage.score=0;
  $localStorage.op=5;
  $localStorage.evento="";
$localStorage.porcentajeAciertos = [
  {
  "categoria" : "Literatura",
  "aciertos" : 0,
  "preguntas" : 0
  },
  {
    "categoria" : "Pintura",
    "aciertos" : 0,
    "preguntas" : 0
  },
  {
    "categoria" : "Entretenimiento",
    "aciertos" : 0,
    "preguntas" : 0
  },
  {
    "categoria" : "Ciencia",
    "aciertos" : 0,
    "preguntas" : 0
  },
  {
    "categoria" : "Arquitectura",
    "aciertos" : 0,
    "preguntas" : 0
  },
  {
    "categoria" : "Musica",
    "aciertos" : 0,
    "preguntas" : 0
  }
];
})

.controller("jugarCtrl", function($scope, Auth, Data, $localStorage, $state ,$ionicSwipeCardDelegate) {
  $scope.data = {};
  var cardTypes = [{
    title: 'Literatura',
    image: 'img/img1.jpg'
  }, {
    title: 'Pintura',
    image: 'img/pic.png'
  }, {
    title: 'Entretenimiento',
    image: 'img/pic2.png'
  }, {
    title: 'Ciencia',
    image: 'img/river.jpg'
  }, {
    title: 'Arquitectura',
    image: 'img/pic4.png'
  },{
    title: 'Musica',
    image: 'img/pic4.png'
  }];

  $scope.cards = Array.prototype.slice.call(cardTypes, 0, 0);

  $scope.cardSwiped = function(index) {
    $scope.addCard();
  };

  $scope.cardDestroyed = function(index) {
    $scope.cards.splice(index, 1);
  };

  $scope.addCard = function() {

    var newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    newCard.id = Math.random();
    $scope.cards.push(angular.extend({}, newCard));

    Data.child("preguntas").orderByChild('categoria').equalTo(newCard.title).once('value', function (snapshot) {
      //alert("entra 2");

      var i = 0;
      var rand = Math.floor(Math.random() * snapshot.numChildren());
      snapshot.forEach(function(snapshot) {
        //alert("entra 3");
        //alert(snapshot.val().categoria);
        //alert(i);
        if (i == rand) {

          //alert(snapshot.val().pregunta);
          //alert(snapshot.val().categoria);

          $localStorage.pregunta=snapshot.val().pregunta;
          $localStorage.res1=snapshot.val().res1;
          $localStorage.res2=snapshot.val().res2;
          $localStorage.res3=snapshot.val().res3;
          $localStorage.correcta=snapshot.val().correcta;
          $localStorage.archivo=snapshot.val().archivo;
          $localStorage.categoria=snapshot.val().categoria;
          //alert(i+" rand: "+snapshot.val().pregunta);
          setTimeout(function () {
          $scope.$apply(function () {
            $scope.data.categoria=snapshot.val().categoria;
          });
          }, 50);
        }
        i++;
      });
    });

    $scope.play=true;


  }

  //$localStorage.clear();

  //alert($localStorage.evento);
  //query para sacar todos los datos del evento $localStorage.evento
  if($localStorage.evento) {
    var idEvento = $localStorage.evento.id;
    Data.child("eventos").child(idEvento).once('value', function (snapshot) {
    $scope.data.evento=snapshot.child("nombre").val();
  });
  }else{
  }



  /*$scope.random = function() {
    //alert("entra 1");
    Data.child("preguntas").once('value', function (snapshot) {
      //alert("entra 2");
      var i = 0;
      var rand = Math.floor(Math.random() * snapshot.numChildren());
      snapshot.forEach(function(snapshot) {
        //alert("entra 3");
        //alert(snapshot.val().categoria);
        //alert(i);
        if (i == rand) {

          //alert(snapshot.val().pregunta);
          //alert(snapshot.val().categoria);

          $localStorage.pregunta=snapshot.val().pregunta;
          $localStorage.res1=snapshot.val().res1;
          $localStorage.res2=snapshot.val().res2;
          $localStorage.res3=snapshot.val().res3;
          $localStorage.correcta=snapshot.val().correcta;
          $localStorage.archivo=snapshot.val().archivo;
          $localStorage.categoria=snapshot.val().categoria;
          //alert(i+" rand: "+snapshot.val().pregunta);
          setTimeout(function () {
          $scope.$apply(function () {
            $scope.data.categoria=snapshot.val().categoria;
          });
          }, 50);
        }
        i++;
      });
    });

    $scope.play=true;
  } */

  $scope.jugar = function() {
    setTimeout(function () {
      $scope.$apply(function () {
        $scope.data.categoria="";
      });
    }, 200);
    $scope.play=false;

    $state.go('menu.preguntas');
  }

})

.controller('CardCtrl', function($scope, $ionicSwipeCardDelegate) {
  $scope.goAway = function() {
    var card = $ionicSwipeCardDelegate.getSwipeableCard($scope);
    card.swipe();
  };
})

.controller("preguntasCtrl", function($scope, Auth, Data, $ionicLoading, $localStorage, $ionicPopup, $state, $ionicHistory,  $interval, $timeout) {
  $scope.data = {};
  $scope.data.score = $localStorage.score;
  $scope.data.op = $localStorage.op;
  //alert($localStorage.evento.id);
  if($localStorage.evento!="") {
    var idEvento = $localStorage.evento.id;
    Data.child("eventos").child(idEvento).once('value', function (snapshot) {
    $scope.data.evento=snapshot.child("nombre").val();
  });
  }else{
  }
  $scope.showPopupTime = function () {
      var myPopup2 = $ionicPopup.show({
      template: '<center><img width="40%" ng-src="img/timer1.png" ></center>',
      title: 'Se acabó el tiempo para contestar!',
      subTitle: '',
      scope: $scope,
      buttons: [

        {
          text: '<b>Aceptar</b>',
          type: 'button-calm',
          onTap: function(e) {
            //alert(e);
          if (e) {
            $localStorage.op=$localStorage.op-1;
            if ($localStorage.op==0) {
              $scope.showPopupLose();
            } else {
              $state.go("menu.jugar");
            }

          }
        }
        }
      ]
    });
    }


   // q29 s15
  var time = null;
  $scope.counter = 100;
  $scope.startTimer = function() {
     var countUp = function() {

        $scope.counter-= 1;
        time = $timeout(countUp, 150);
        //console.log($q.counter);
        if ($scope.counter==0) {
          //alert("funciona!"+$q.counter);

          $timeout.cancel(time);
          //$scope.counter = 100;
          $scope.showPopupTime();
        }
      }
      countUp();
    }






  $scope.show = function() {
    $ionicLoading.show({
        template: 'Cargando...<br><br><ion-spinner icon="bubbles"></ion-spinner>',
    }).then(function(){
        console.log("The loading indicator is now displayed");
    });
  };
  $scope.hide = function(){
      $ionicLoading.hide().then(function(){
          console.log("The loading indicator is now hidden");
      });
  };
  $scope.show();

      $scope.data.pregunta=$localStorage.pregunta;
      $scope.data.res1=$localStorage.res1;
      $scope.data.res2=$localStorage.res2;
      $scope.data.res3=$localStorage.res3;
      $scope.data.correcta=$localStorage.correcta;
      $scope.data.categoria=$localStorage.categoria;
      //$scope.data.archivo=snapshot.val().archivo;
      if($localStorage.archivo!="") {
      var fileName = $localStorage.archivo;
      var storageRef = firebase.storage().ref().child("archivos_preguntas").child(fileName);
      storageRef.getDownloadURL().then(function(url) {
        //alert(url);

        $scope.data.archivo=url;
        console.log("URL: "+$scope.data.archivo);
        $scope.hide();
        $scope.startTimer();
      });
      }else{
        $scope.hide();
        $scope.startTimer();
      }

      $scope.showPopupLose = function () {
        $timeout.cancel(time);
      var myPopup1 = $ionicPopup.show({
      template: '<center><img width="40%" ng-src="img/sad1.png" ></center>',
      title: 'Perdiste todas tus oportunidades!',
      subTitle: 'Tu score es de: '+$localStorage.score,
      scope: $scope,
      buttons: [

        {
          text: '<b>Aceptar</b>',
          type: 'button-calm',
          onTap: function(e) {
            //alert(e);
          if (e) {

              Auth.$onAuthStateChanged(function(firebaseUser) {
                var idEv= "";
                var upd = {};
              if($localStorage.evento!=""){
                //licuadora
                console.log($localStorage.evento);
                Data.child("eventos-users").orderByChild('idEvento').equalTo($localStorage.evento.id).once('value', function (snapshot) {
                  snapshot.forEach(function(snapshot) {// todos los registros del usuario en eventos
                    var idUser = snapshot.child("idUser").val();
                    var idEvUs = snapshot.key;
                    console.log(idUser);
                    console.log(firebaseUser.uid);
                    if (idUser==firebaseUser.uid) {
                      console.log("entra update eventos-users");
                      upd['/eventos-users/' + idEvUs+ '/estado'] = 2;
                      Data.update(upd);
                    }
                  });
                });
                /*var updates = {};
                updates['/users/' + firebaseUser.uid+ '/accesoEvento'] = 0;
                Data.update(updates);*/
                idEv=$localStorage.evento.id;
              }else{
                idEv="";
              }
                var porcentajeLiteratura = 0;
                var porcentajePintura = 0;
                var porcentajeEntretenimiento = 0;
                var porcentajeCiencia = 0;
                var porcentajeArquitectura = 0;
                var porcentajeFilInst = 0;
                $localStorage.porcentajeAciertos.forEach(function(data){
                  if(data.preguntas>0) {
                    if(data.categoria=="Literatura") {
                      porcentajeLiteratura=data.aciertos/data.preguntas;
                      console.log(porcentajeLiteratura);
                    }
                    if(data.categoria=="Pintura") {
                      porcentajePintura=data.aciertos/data.preguntas;
                      console.log(porcentajePintura);
                    }
                    if (data.categoria=="Entretenimiento") {
                      porcentajeEntretenimiento=data.aciertos/data.preguntas;
                      console.log(porcentajeEntretenimiento);
                    }
                    if (data.categoria=="Ciencia") {
                      porcentajeCiencia=data.aciertos/data.preguntas;
                      console.log(porcentajeCiencia);
                    }
                    if (data.categoria=="Arquitectura") {
                      porcentajeArquitectura=data.aciertos/data.preguntas;
                      console.log(porcentajeArquitectura);
                    }
                    if (data.categoria=="Musica") {
                      porcentajeFilInst=data.aciertos/data.preguntas;
                      console.log(porcentajeFilInst);
                    }
                  }
                  console.log("categoría: "+data.categoria+" preguntas: "+data.preguntas+" aciertos: "+data.aciertos);
                });
                //console.log("Mayor categoría: "+mayorCategoria+" Mayor aciertos: "+mayorScore);
                //alert(firebaseUser.uid);
                var displayName = firebaseUser.displayname;
                var email = firebaseUser.email;
                var d = new Date()
                var d = ("0" + d.getDate()).slice(-2) + "/" +  ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear();
                var newPostKey = firebase.database().ref().child('Score').push().key;
                //Data.child("Score").push().set({
                Data.child("Score/"+newPostKey).set({
                    name: displayName,
                    email: email,
                    score: $localStorage.score,
                    evento: idEv,
                    fecha: d
                }, function(error) {
                  if(error) {
                    alert(error);
                  }else{
                    $ionicHistory.nextViewOptions({
                      disableBack: true
                    });
                    //guardar porcentajeAciertos en firebase con key del último score
                    Data.child("porcentajeAciertos").push().set({
                      idScore: newPostKey,
                      literatura: porcentajeLiteratura,
                      pintura: porcentajePintura,
                      entretenimiento: porcentajeEntretenimiento,
                      ciencia: porcentajeCiencia,
                      arquitectura: porcentajeArquitectura,
                      filosofiaInstitucional:porcentajeFilInst
                    }, function(error) {
                      if(error) {
                        alert(error);
                      }else{
                        console.log("guardado correctamente");
                      }
                    });
                    porcentajeLiteratura = 0;//papilla
                    porcentajePintura = 0;
                    porcentajeEntretenimiento = 0;
                    porcentajeCiencia = 0;
                    porcentajeArquitectura = 0;
                    porcentajeFilInst = 0;
                  /*$localStorage.porcentajeAciertos = [
                    {
                    "categoria" : "Literatura",
                    "aciertos" : 0,
                    "preguntas" : 0
                    },
                    {
                      "categoria" : "Pintura",
                      "aciertos" : 0,
                      "preguntas" : 0
                    },
                    {
                      "categoria" : "Entretenimiento",
                      "aciertos" : 0,
                      "preguntas" : 0
                    },
                    {
                      "categoria" : "Ciencia",
                      "aciertos" : 0,
                      "preguntas" : 0
                    },
                    {
                      "categoria" : "Arquitectura",
                      "aciertos" : 0,
                      "preguntas" : 0
                    },{
                      "categoria" : "Musica",
                      "aciertos" : 0,
                      "preguntas" : 0
                    }
                  ];*/
                    mayorScore = 0;
                    mayorCategoria = "";
                    $timeout.cancel(time);
                    $localStorage.score=0;
                    $localStorage.op=5;
                    $localStorage.evento="";
                    idEv="";
                    $scope.data.score=0;
                    $scope.data.op=5;
                    $state.go("menu.inicio");
                  }
                });
            });

          }
        }
        }
      ]
    });
    }

      $scope.showPopupCorrecto = function () {
      var myPopup1 = $ionicPopup.show({
      template: '<center><img width="40%" ng-src="img/success1.png" ></center>',
      title: 'Correcto!',
      subTitle: '',
      scope: $scope,
      buttons: [

        {
          text: '<b>Aceptar</b>',
          type: 'button-calm',
          onTap: function(e) {
            //alert(e);
          if(e) {
            $localStorage.porcentajeAciertos.forEach(function(data){
              if (data.categoria==$localStorage.categoria){
                data.aciertos++;
                data.preguntas++;
              }
            });

            /*$localStorage.categoriaMasAcertada.push({
              "categoria" : $localStorage.categoria,
              "aciertos" : categoriaMasAcertada
            });*/
            //var new_value =  parseInt(localStorage.getItem('num')) + 1
            $localStorage.score=$localStorage.score+1;


            //setTimeout(function () {
              //$scope.$apply(function () {
                //$scope.data.score=$localStorage.score;
                $state.go("menu.jugar");
                //alert($localStorage.score);
              //});
              //}, 1000);

          }
        }
        }
      ]
    });
    }
    $scope.showPopupIncorrecto = function () {
      var myPopup1 = $ionicPopup.show({
      template: '<center><img width="40%" ng-src="img/wrong1.png" ></center>',
      title: 'Incorrecto!',
      subTitle: '',
      scope: $scope,
      buttons: [

        {
          text: '<b>Aceptar</b>',
          type: 'button-calm',
          onTap: function(e) {
            //alert(e);
          if (e) {
            $localStorage.porcentajeAciertos.forEach(function(data){
              if (data.categoria==$localStorage.categoria){
                data.preguntas++;
              }
            });

            $localStorage.op=$localStorage.op-1;
            if ($localStorage.op==0) {
              $scope.showPopupLose();
            } else {
              $state.go("menu.jugar");
            }

          }
        }
        }
      ]
    });
    }

    $scope.salir = function(){
    // An elaborate, custom popup
    $timeout.cancel(time);
    var myPopup = $ionicPopup.show({
      template: '',
      title: '¿Seguro que deseas salir del juego?',
      subTitle: 'Tu score es de: '+$localStorage.score,
      scope: $scope,
      buttons: [
        { text: 'Cancelar' },
        {
          text: '<b>Si</b>',
          type: 'button-calm',
          onTap: function(e) {
            //alert(e);
          if(e) {
            Auth.$onAuthStateChanged(function(firebaseUser) {
              //alert(firebaseUser.uid);

              var displayName = firebaseUser.displayname;
              var email = firebaseUser.email;
              if($localStorage.evento!=""){
                var updates = {};
                updates['/users/' + firebaseUser.uid+ '/accesoEvento'] = 0;
                Data.update(updates);
              }
              var idEv= "";
              if($localStorage.evento!=""){
                idEv = $localStorage.evento.id;
              }else{
                idEv = "";
              }

              //pille
              var porcentajeLiteratura = 0;
              var porcentajePintura = 0;
              var porcentajeEntretenimiento = 0;
              var porcentajeCine = 0;
              var porcentajeArquitectura = 0;
              var porcentajeFilInst = 0;
              $localStorage.porcentajeAciertos.forEach(function(data){
                if(data.preguntas>0) {
                  if(data.categoria=="Literatura") {
                    porcentajeLiteratura=data.aciertos/data.preguntas;
                    console.log(porcentajeLiteratura);
                  }
                  if(data.categoria=="Pintura") {
                    porcentajePintura=data.aciertos/data.preguntas;
                    console.log(porcentajePintura);
                  }
                  if (data.categoria=="Entretenimiento") {
                    porcentajeEntretenimiento=data.aciertos/data.preguntas;
                    console.log(porcentajeEntretenimiento);
                  }
                  if (data.categoria=="Ciencia") {
                    porcentajeCiencia=data.aciertos/data.preguntas;
                    console.log(porcentajeCiencia);
                  }
                  if (data.categoria=="Arquitectura") {
                    porcentajeArquitectura=data.aciertos/data.preguntas;
                    console.log(porcentajeArquitectura);
                  }
                  if (data.categoria=="Musica") {
                    porcentajeFilInst=data.aciertos/data.preguntas;
                    console.log(porcentajeFilInst);
                  }
                }
                console.log("categoría: "+data.categoria+" preguntas: "+data.preguntas+" aciertos: "+data.aciertos);
              });

              var d = new Date()
              var d = ("0" + d.getDate()).slice(-2) + "/" +  ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear();

              var newPostKey = firebase.database().ref().child('Score').push().key;
              //Data.child("Score").push().set({
              Data.child("Score/"+newPostKey).set({
                  name: displayName,
                  email: email,
                  score: $localStorage.score,
                  evento: idEv,
                  fecha: d
              }, function(error) {
                if(error) {
                  alert(error);
                }else{
                  $ionicHistory.nextViewOptions({
                    disableBack: true
                  });
                  //guardar porcentajeAciertos en firebase con key del último score
                  Data.child("porcentajeAciertos").push().set({
                    idScore: newPostKey,
                    literatura: porcentajeLiteratura,
                    pintura: porcentajePintura,
                    entretenimiento: porcentajeEntretenimiento,
                    ciencia: porcentajeCiencia,
                    arquitectura: porcentajeArquitectura,
                    filosofiaInstitucional: porcentajeFilInst
                  }, function(error) {
                    if(error) {
                      alert(error);
                    }else{
                      console.log("guardado correctamente");
                    }
                  });
                  porcentajeLiteratura = 0;
                  porcentajePintura = 0;
                  porcentajeEntretenimiento = 0;
                  porcentajeCiencia = 0;
                  porcentajeArquitectura = 0;
                  porcentajeFilInst = 0;
                /*$localStorage.porcentajeAciertos = [
                  {
                  "categoria" : "Literatura",
                  "aciertos" : 0,
                  "preguntas" : 0
                  },
                  {
                    "categoria" : "Pintura",
                    "aciertos" : 0,
                    "preguntas" : 0
                  },
                  {
                    "categoria" : "Entretenimiento",
                    "aciertos" : 0,
                    "preguntas" : 0
                  },
                  {
                    "categoria" : "Ciencia",
                    "aciertos" : 0,
                    "preguntas" : 0
                  },
                  {
                    "categoria" : "Arquitectura",
                    "aciertos" : 0,
                    "preguntas" : 0
                  },
                  {
                    "categoria" : "Musica",
                    "aciertos" : 0,
                    "preguntas" : 0
                  }
                ];*/

                  mayorScore = 0;
                  mayorCategoria = "";
                  $timeout.cancel(time);
                  $localStorage.score=0;
                  $localStorage.op=5;
                  $localStorage.evento="";
                  idEv="";
                  $scope.data.score=0;
                  $scope.data.op=5;
                  $state.go("menu.inicio");
                  }
                });


            });

          }else{
            //hacer que continue el counter en donde se quedo
          }
        }
        }
      ]
    });


    /*firebase.auth().signOut().then(function() {
      $state.go('menu.login');
      // Sign-out successful.
    }, function(error) {
      // An error happened.
    }); */
  }


$scope.btn1 = function() {
  //alert();
  $timeout.cancel(time);
  if ($scope.data.res1==$scope.data.correcta) {

    $scope.showPopupCorrecto();
    //$scope.data.score = $scope.data.score + 1;
  }else{
    $scope.showPopupIncorrecto();

  }

}
$scope.btn2 = function() {
  $timeout.cancel(time);
  if ($scope.data.res2==$scope.data.correcta) {
    $scope.showPopupCorrecto();

    //$scope.data.score = $scope.data.score + 1;
  }else{
    $scope.showPopupIncorrecto();

  }
}
$scope.btn3 = function() {
  $timeout.cancel(time);
  if ($scope.data.res3==$scope.data.correcta) {
    $scope.showPopupCorrecto();

    //$scope.data.score = $scope.data.score + 1;
  }else{
    $scope.showPopupIncorrecto();

  }
}



})

.controller("scoreCtrl", function($scope, Auth, Data, $firebaseArray, $localStorage, $ionicLoading) {
  $scope.scores = {};
  var refScore = Data.child("Score");

  $scope.data.idEvento=$localStorage.evento.id;
  $scope.data.nombreEvento=$localStorage.evento.nombre;
  //alert($localStorage.evento.nombre);

  $scope.show = function() {
    $ionicLoading.show({
        template: 'Cargando...<br><br><ion-spinner icon="bubbles"></ion-spinner>',
    }).then(function(){
        //console.log("The loading indicator is now displayed");
    });
  };
  $scope.hide = function(){
      $ionicLoading.hide().then(function(){
          //console.log("The loading indicator is now hidden");
      });
  };
  $scope.show();

  if ($localStorage.evento!="") {
    var arr = [];
    var query = Data.child("Score").orderByChild('evento').equalTo($localStorage.evento.id);
    query.on('value', function (snapshot){

      snapshot.forEach(function(child) {
        arr.push(child.val());
      });
      //console.log(arr);
      for (var i = 1; i < arr.length; i++) {
        for (var j = 0; j < (arr.length-i); j++) {
          //console.log(arr[j+1].score);
          if(arr[j].score>arr[j+1].score){
             var aux=arr[j];
             arr[j]=arr[j+1];
             arr[j+1]=aux;
          }
        }
      }
      //console.log(arr);
    });

    setTimeout(function () {
      $scope.$apply(function () {
        $scope.scores = arr;
        $scope.hide();
      });
    }, 500);


  }else{
    //hacer query para todos los scores que no tienen "evento"
  //var query = Data.child("Score").orderByChild('score');
  //$scope.scores = $firebaseArray(query);
  var arr = [];
    var query = Data.child("Score").orderByChild('evento').equalTo("");
    query.on('value', function (snapshot){

      snapshot.forEach(function(child) {
        arr.push(child.val());
      });
      //console.log(arr);
      for (var i = 1; i < arr.length; i++) {
        for (var j = 0; j < (arr.length-i); j++) {
          //console.log(arr[j+1].score);
          if(arr[j].score>arr[j+1].score){
             var aux=arr[j];
             arr[j]=arr[j+1];
             arr[j+1]=aux;
          }
        }
      }
      //console.log(arr);
    });

    setTimeout(function () {
      $scope.$apply(function () {
        $scope.scores = arr;
        $scope.hide();
      });
    }, 500);

  }


  //alert($firebaseArray(refScore).$keyAt(0));
  /*Data.child("users").child($scope.scores.user).once('value', function (snapshot) {
    var childKey = snapshot.child("displayName").val();
    var childKey2 = snapshot.child("email").val();
    $scope.scores.userName = childKey;
  }); */
});
