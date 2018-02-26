angular.module('app.controllers', [])

.controller('menuCtrl', function($scope, $state, $ionicPopup, Auth, Data, $ionicLoading) {
  $scope.data = {};
  $scope.show = function() {
    $ionicLoading.show({
        template: 'Cargando...<br><br><ion-spinner icon="bubbles"></ion-spinner>',
    }).then(function(){
    });
  };
  $scope.hide = function(){
      $ionicLoading.hide().then(function(){
      });
  }
  $scope.data.users = Data;
  $scope.show();
  Auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.data.firebaseUser = firebaseUser;
      console.log(firebaseUser.displayName);
      Data.child("users").child(firebaseUser.uid).once('value', function (snapshot) {
        var key = snapshot.key;
        var childKey = snapshot.child("displayName").val();
        var childKey2 = snapshot.child("email").val();
        setTimeout(function () {
          $scope.$apply(function () {
            $scope.data.firebaseUser.displayname = childKey;
            $scope.hide();
          });
          }, 1);
      });
    });
  $scope.logOut = function(){
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
          if(e) {
            firebase.auth().signOut().then(function() {
              $state.go('login');
            }, function(error) {
            });
          }
        }
        }
      ]
    });
  }
})

.controller("loginCtrl", function($scope, $state, $ionicLoading, $ionicPopup, UserService, Auth, Data, $q, $localStorage) {
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
  });
}
  $scope.loginEmail = function(){
    var email=$scope.data.username;
    var password=$scope.data.password;
    $scope.show();
      Auth.$signInWithEmailAndPassword(email, password).then(function(firebaseUser){
        $scope.hide();
        $localStorage.op=5;
        $state.go('menu.jugar');
      }).catch(function(error) {
        $scope.hide();
        var errorCode = error.code;
        var errorMessage = error.message;
        $scope.showPopup();
      });
  }
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
         $state.go('login');
        }).catch(function(error) {
          alert(error);
        });
  }
  })

.controller("jugarCtrl", function($scope, Auth, Data, $localStorage, $state ,$ionicSwipeCardDelegate) {
  $scope.data = {};
  var cardTypes = [{
    title: 'Cardiología',
    image: 'img/pic2.png'
  }, {
    title: 'Ginecología y Obstetricia',
    image: 'img/pic.png'
  }, {
    title: 'Epidemiología',
    image: 'img/pic2.png'
  }, {
    title: 'Bioestadística',
    image: 'img/river.jpg'
  }, {
    title: 'Pediatría',
    image: 'img/pic4.png'
  },{
    title: 'Cirugía',
    image: 'img/pic4.png'
  },{
    title: 'Neumología',
    image: 'img/pic4.png'
  },{
    title: 'Casos Clínicos',
    image: 'img/pic4.png'
  }
];
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
      var i = 0;
      var rand = Math.floor(Math.random() * snapshot.numChildren());
      snapshot.forEach(function(snapshot) {
        if (i == rand) {
          $localStorage.pregunta=snapshot.val().pregunta;
          $localStorage.res1=snapshot.val().res1;
          $localStorage.res2=snapshot.val().res2;
          $localStorage.res3=snapshot.val().res3;
          $localStorage.correcta=snapshot.val().correcta;
          //infografia
          $localStorage.archivo=snapshot.val().archivo;
          $localStorage.categoria=snapshot.val().categoria;
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

.controller("estrellasCtrl", function($scope, Auth, Data, $localStorage, $ionicPopup, $state, $ionicHistory,  $interval, $timeout) {
  $scope.data.score=$localStorage.score;
  $scope.data.oportunidades=$localStorage.op;
  $scope.jugarDeNuevo = function() {
    $localStorage.op=5;
    $localStorage.score=0;
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('menu.preguntas');
  }

})

.controller("preguntasCtrl", function($scope, Auth, Data, $ionicLoading, $localStorage, $ionicPopup, $state, $ionicHistory,  $interval, $timeout) {
  $scope.data = {};
  $scope.data.score = $localStorage.score;
  $scope.data.op = $localStorage.op;

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
    if($scope.data.categoria=="Cardiología") {
      document.getElementById("preguntas").style.background = "url(img/Fondo5.jpg)";
      document.getElementById("imgCate").src = "img/CardioColor.png";
    }
    if($scope.data.categoria=="Ginecología y Obstetricia") {
      document.getElementById("preguntas").style.background = "url(img/Fondo6.jpg)";
      document.getElementById("imgCate").src = "img/GinecoColor.png";
    }
    if($scope.data.categoria=="Epidemiología") {
      document.getElementById("preguntas").style.background = "url(img/Fondo4.jpg)";
      document.getElementById("imgCate").src = "img/EpidemioColor.png";
    }
    if($scope.data.categoria=="Bioestadística") {
      document.getElementById("preguntas").style.background = "url(img/Fondo7.jpg)";
      document.getElementById("imgCate").src = "img/BioColor.png";
    }
    if($scope.data.categoria=="Pediatría") {
      document.getElementById("preguntas").style.background = "url(img/Fondo8.jpg)";
      document.getElementById("imgCate").src = "img/PediaColor.png";
    }
    if($scope.data.categoria=="Cirugía") {
      document.getElementById("preguntas").style.background = "url(img/Fondo9.jpg)";
      document.getElementById("imgCate").src = "img/CiruColor.png";
    }
    if($scope.data.categoria=="Neumología") {
      document.getElementById("preguntas").style.background = "url(img/Fondo10.jpg)";
      document.getElementById("imgCate").src = "img/NeumoColor.png";
    }
    if($scope.data.categoria=="Casos Clínicos") {
      document.getElementById("preguntas").style.background = "url(img/Fondo11.jpg)";
      document.getElementById("imgCate").src = "img/CasosColor.png";
    }
    if($localStorage.archivo!="") {
    var fileName = $localStorage.archivo;
    var storageRef = firebase.storage().ref().child("archivos_preguntas").child(fileName);
    storageRef.getDownloadURL().then(function(url) {
      $scope.data.archivo=url;
      console.log("URL: "+$scope.data.archivo);
      $scope.hide();
    });
    }else{
      $scope.hide();
    }

    $scope.showPopupLose = function () {
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
        if (e) {
            Auth.$onAuthStateChanged(function(firebaseUser) {
              var idEv= "";
              var upd = {};
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
              }, function(error) {
                if(error) {
                  alert(error);
                }else{
                  $ionicHistory.nextViewOptions({
                    disableBack: true
                  });
                  //$localStorage.score=0;
                  //$localStorage.op=5;
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
          $localStorage.score=$localStorage.score+1;
              $state.go("menu.jugar");
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
        if (e) {
          $localStorage.op=$localStorage.op-1;
          $scope.data.op = $localStorage.op;
          if ($localStorage.op==0) {
            $ionicHistory.nextViewOptions({
              disableBack: true
            });
            $state.go("menu.estrellas");
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
  var myPopup = $ionicPopup.show({
    template: '',
    title: '¿Seguro que deseas salir del juego?',
    subTitle: 'Tu score es de: '+$localStorage.score,
    scope: $scope,
    buttons: [
      { text: 'Cancelar',
      type: 'button-calm', },

      {
        text: '<b>Si</b>',
        type: 'button-calm',
        onTap: function(e) {
        if(e) {
          Auth.$onAuthStateChanged(function(firebaseUser) {
            var displayName = firebaseUser.displayname;
            var email = firebaseUser.email;
            var newPostKey = firebase.database().ref().child('Score').push().key;
            Data.child("Score/"+newPostKey).set({
                name: displayName,
                email: email,
                score: $localStorage.score,
            }, function(error) {
              if(error) {
                alert(error);
              }else{
                $ionicHistory.nextViewOptions({
                  disableBack: true
                });
                $scope.data.score=0;
                $scope.data.op=5;
                $state.go("menu.estrellas");
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

}

$scope.btn1 = function() {
if ($scope.data.res1==$scope.data.correcta) {
  $scope.showPopupCorrecto();
}else{
  $scope.showPopupIncorrecto();
}
}
$scope.btn2 = function() {
if ($scope.data.res2==$scope.data.correcta) {
  $scope.showPopupCorrecto();
}else{
  $scope.showPopupIncorrecto();
}
}
$scope.btn3 = function() {
if ($scope.data.res3==$scope.data.correcta) {
  $scope.showPopupCorrecto();
}else{
  $scope.showPopupIncorrecto();
}
}
})

.controller("scoreCtrl", function($scope, Auth, Data, $firebaseArray, $localStorage, $ionicLoading) {
  $scope.scores = {};
  var refScore = Data.child("Score");
  $scope.show = function() {
    $ionicLoading.show({
        template: 'Cargando...<br><br><ion-spinner icon="bubbles"></ion-spinner>',
    }).then(function(){
    });
  };
  $scope.hide = function(){
      $ionicLoading.hide().then(function(){
      });
  };
  $scope.show();
  var arr = [];
    var query = Data.child("Score");
    query.on('value', function (snapshot){

      snapshot.forEach(function(child) {
        arr.push(child.val());
      });
      for (var i = 1; i < arr.length; i++) {
        for (var j = 0; j < (arr.length-i); j++) {
          if(arr[j].score>arr[j+1].score){
             var aux=arr[j];
             arr[j]=arr[j+1];
             arr[j+1]=aux;
          }
        }
      }
    });
    setTimeout(function () {
      $scope.$apply(function () {
        $scope.scores = arr;
        $scope.hide();
      });
    }, 500);
});
