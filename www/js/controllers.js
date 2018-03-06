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

        $localStorage.op=7;
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
  //-------------------- MI ESTADISTICA -------------------------------------------
  $localStorage.porcentajeAciertos = [
  {
  "categoria" : "Cardiología",
  "aciertos" : 0,
  "preguntas" : 0
  },
  {
    "categoria" : "Ginecología y Obstetricia",
    "aciertos" : 0,
    "preguntas" : 0
  },
  {
    "categoria" : "Epidemiología",
    "aciertos" : 0,
    "preguntas" : 0
  },
  {
    "categoria" : "Bioestadística",
    "aciertos" : 0,
    "preguntas" : 0
  },
  {
    "categoria" : "Pediatría",
    "aciertos" : 0,
    "preguntas" : 0
  },
  {
    "categoria" : "Cirugía",
    "aciertos" : 0,
    "preguntas" : 0
  },
  {
    "categoria" : "Neumología",
    "aciertos" : 0,
    "preguntas" : 0
  },
  {
    "categoria" : "Medicina Preventiva",
    "aciertos" : 0,
    "preguntas" : 0
  }
];
//__________________________________________________________________________________

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

.controller("jugarCtrl", function($scope, Auth, Data, $localStorage, $state, $ionicPopup) {
var catRandom="";
var imgRandom="";
  //--------------------------(RULETA)----------------------------
  //set default degree (360*5)
/*var degree = 1800;*/
var degree = 2520;
//number of clicks = 0
var clicks = 0;
  /*WHEEL SPIN FUNCTION*/
  $('#spin').click(function(){
    //add 1 every click
    clicks ++;
    var newDegree = degree*clicks;
    var extraDegree = Math.floor(Math.random() * (360 - 1 + 1)) + 1;
    totalDegree = newDegree+extraDegree;
    $('#wheel .sec').each(function(){
      var t = $(this);
      var noY = 0;
      var c = 0;
      var n = 700;
      var interval = setInterval(function () {
        c++;
        if (c === n) {
          clearInterval(interval);
        }
        var aoY = t.offset().top;

        if(aoY < 23.89){
          //console.log('<<<<<<<<');
          $('#spin').addClass('spin');
          setTimeout(function () {
            $('#spin').removeClass('spin');
          }, 100);
        }
      }, 10);

      $('#inner-wheel').css({
        'transform' : 'rotate(' + totalDegree + 'deg)'
      });
      console.log("extraDegree: "+extraDegree);
      //$("#txt").html(extraDegree);

      if(extraDegree>0 && extraDegree<45){
        catRandom="Ginecología";
        imgRandom="img/GinecoColor.png";
      }else if(extraDegree>=45 && extraDegree<90) {
        catRandom="Cardiología";
        imgRandom="img/CardioColor.png";
      }else if(extraDegree>=90 && extraDegree<135){
        catRandom="Pediatría";
        imgRandom="img/PediaColor.png";
      }else if(extraDegree>=135 && extraDegree<180){
        catRandom="Bioestadística";
        imgRandom="img/BioColor.png";
      }else if (extraDegree>=180 && extraDegree<225){
        catRandom="Neumología";
        imgRandom="img/NeumoColor.png";
      }else if (extraDegree>=225 && extraDegree<270){
        catRandom="Cirugía";
        imgRandom="img/CiruColor.png";
      }else if (extraDegree>=270 && extraDegree<315){
        catRandom="Medicina Preventiva";
        imgRandom="img/MedicinaColor.png";
      }else if (extraDegree>=315 && extraDegree<=360){
        catRandom="Epidemiología";
        imgRandom="img/EpidemioColor.png";
      }


      Data.child("preguntas").orderByChild('categoria').equalTo(catRandom).once('value', function (snapshot) {
        var i = 0;
        var rand = Math.floor(Math.random() * snapshot.numChildren());
        snapshot.forEach(function(snapshot) {
          if (i == rand) {
            $localStorage.pregunta=snapshot.val().pregunta;
            $localStorage.res1=snapshot.val().res1;
            $localStorage.res2=snapshot.val().res2;
            $localStorage.res3=snapshot.val().res3;
            $localStorage.res4=snapshot.val().res4;
            $localStorage.correcta=snapshot.val().correcta;
            $localStorage.infografia=snapshot.val().info;
            $localStorage.bibliografia=snapshot.val().bibli;
            $localStorage.archivo=snapshot.val().archivo;
            $localStorage.categoria=snapshot.val().categoria;
            /*setTimeout(function () {
            $scope.$apply(function () {
              $scope.data.categoria=snapshot.val().categoria;
            });
          }, 50);*/
          }
          i++;
        });
      });


      noY = t.offset().top;
      setTimeout(function () {
        var popupCate = $ionicPopup.show({
        template: '<center><img width="60%" ng-src="'+imgRandom+'" ></center>',
        title: catRandom,
        subTitle: "",
        scope: $scope,
        buttons: [
          {
            text: '<b>Jugar</b>',
            type: 'button-calm',
            onTap: function(e) {
            if (e) {
              catRandom="";
              imgRandom="";
              $state.go('menu.preguntas');
            }
          }
          }
        ]
      });

        console.log(catRandom);
        //$("#txt").html(catRandom);
      }, 6000);

    });
  });

})


  //--------------------------------------------------------------



.controller("estrellasCtrl", function($scope, Auth, Data, $localStorage, $ionicPopup, $state, $ionicHistory,  $interval, $timeout) {
  $scope.data.score=$localStorage.score;
  $scope.data.oportunidades=$localStorage.op;
  $scope.jugarDeNuevo = function() {
    $localStorage.op=7;
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
    $scope.data.res4=$localStorage.res4;
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


    $scope.showPopupCorrecto = function () {
    var myPopup1 = $ionicPopup.show({
    template: '<center><img width="40%" ng-src="img/success1.png" ></center>',
    title: 'Correcto!',
    subTitle: 'Las respuesta correcta es: </br><font size=2>'+$scope.data.correcta+'.</font></br></br>Porque:</br><font size=2>'+ $localStorage.infografia+'</font>',
    scope: $scope,
    buttons: [
      {
        text: '<b>Bibliografía</b>',
        type: 'button-calm',
        onTap: function(e) {
          //alert(e);
        if(e) {
          var myPopupBibli = $ionicPopup.show({
          template: '<center><img width="40%" ng-src="img/Register-Icon1.png" ></center>',
          title: 'Bibliografía',
          subTitle: $localStorage.bibliografia,
          scope: $scope,
          buttons: [
            {
              text: '<b>Contiruar</b>',
              type: 'button-calm',
              onTap: function(e) {
                //alert(e);
              if(e) {
                $localStorage.score=$localStorage.score+1;
                //-------------------------------- MI ESTADISTICA -------------------------------------------------
                $localStorage.porcentajeAciertos.forEach(function(data){
                  if (data.categoria==$localStorage.categoria){
                    data.aciertos++;
                    data.preguntas++;
                  }
                });
                //_________________________________________________________________________________________________

                $localStorage.op=$localStorage.op-1;
                $scope.data.op = $localStorage.op;
                //.html()
                if ($localStorage.op==0) {
                  $ionicHistory.nextViewOptions({
                    disableBack: true
                  });
                  //--------------------- MI ESTADISTICA ------------------------------------------------------
                  var porcentajeCardio = 0;
                  var porcentajeGine = 0;
                  var porcentajeEpi = 0;
                  var porcentajeBio = 0;
                  var porcentajePedi = 0;
                  var porcentajeCiru = 0;
                  var porcentajeNeumo = 0;
                  var porcentajeMedi = 0;
                  $localStorage.porcentajeAciertos.forEach(function(data){
                    if(data.preguntas>0) {
                      if(data.categoria=="Cardiología") {
                        porcentajeCardio=data.aciertos/data.preguntas;
                        console.log(porcentajeCardio);
                      }
                      if(data.categoria=="Ginecología y Obstetricia") {
                        porcentajeGine=data.aciertos/data.preguntas;
                        console.log(porcentajeGine);
                      }
                      if (data.categoria=="Epidemiología") {
                        porcentajeEpi=data.aciertos/data.preguntas;
                        console.log(porcentajeEpi);
                      }
                      if (data.categoria=="Bioestadística") {
                        porcentajeBio=data.aciertos/data.preguntas;
                        console.log(porcentajeBio);
                      }
                      if (data.categoria=="Pediatría") {
                        porcentajePedi=data.aciertos/data.preguntas;
                        console.log(porcentajePedi);
                      }
                      if (data.categoria=="Cirugía") {
                        porcentajeCiru=data.aciertos/data.preguntas;
                        console.log(porcentajeCiru);
                      }
                      if (data.categoria=="Neumología") {
                        porcentajeNeumo=data.aciertos/data.preguntas;
                        console.log(porcentajeNeumo);
                      }
                      if (data.categoria=="Medicina Preventiva") {
                        porcentajeMedi=data.aciertos/data.preguntas;
                        console.log(porcentajeMedi);
                      }
                    }
                    console.log("categoría: "+data.categoria+" preguntas: "+data.preguntas+" aciertos: "+data.aciertos);
                    });
                  //___________________________________________________________________________________________
                  Auth.$onAuthStateChanged(function(firebaseUser) {
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
                        //------------------------------------ MI ESTADISTICA --------------------------------------------
                        Data.child("porcentajeAciertos").push().set({
                            idScore: newPostKey,
                            cardio: porcentajeCardio,
                            gine: porcentajeGine,
                            epi: porcentajeEpi,
                            bio: porcentajeBio,
                            pedi: porcentajePedi,
                            ciru: porcentajeCiru,
                            neumo: porcentajeNeumo,
                            medi: porcentajeMedi
                          }, function(error) {
                            if(error) {
                              alert(error);
                            }else{
                              console.log("guardado correctamente");
                            }
                          });
                          porcentajeCardio = 0;
                          porcentajeGine = 0;
                          porcentajeEpi = 0;
                          porcentajeBio = 0;
                          porcentajePedi = 0;
                          porcentajeCiru = 0;
                          porcentajeNeumo = 0;
                          porcentajeMedi = 0;
                          //___________________________________________________________________________________
                        //$localStorage.score=0;
                        //$localStorage.op=5;
                        $scope.data.score=0;
                        $scope.data.op=7;
                      }
                    });
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
        // acaba popup
        }
      }
    },
      {
        text: '<b>Contiruar</b>',
        type: 'button-calm',
        onTap: function(e) {
          //alert(e);
        if(e) {
          $localStorage.score=$localStorage.score+1;
          //-------------------------------- MI ESTADISTICA -------------------------------------------------
          $localStorage.porcentajeAciertos.forEach(function(data){
            if (data.categoria==$localStorage.categoria){
              data.aciertos++;
              data.preguntas++;
            }
          });
          //_________________________________________________________________________________________________

          $localStorage.op=$localStorage.op-1;
          $scope.data.op = $localStorage.op;
          if ($localStorage.op==0) {
            $ionicHistory.nextViewOptions({
              disableBack: true
            });
            //--------------------- MI ESTADISTICA ------------------------------------------------------
            var porcentajeCardio = 0;
            var porcentajeGine = 0;
            var porcentajeEpi = 0;
            var porcentajeBio = 0;
            var porcentajePedi = 0;
            var porcentajeCiru = 0;
            var porcentajeNeumo = 0;
            var porcentajeMedi = 0;
            $localStorage.porcentajeAciertos.forEach(function(data){
              if(data.preguntas>0) {
                if(data.categoria=="Cardiología") {
                  porcentajeCardio=data.aciertos/data.preguntas;
                  console.log(porcentajeCardio);
                }
                if(data.categoria=="Ginecología y Obstetricia") {
                  porcentajeGine=data.aciertos/data.preguntas;
                  console.log(porcentajeGine);
                }
                if (data.categoria=="Epidemiología") {
                  porcentajeEpi=data.aciertos/data.preguntas;
                  console.log(porcentajeEpi);
                }
                if (data.categoria=="Bioestadística") {
                  porcentajeBio=data.aciertos/data.preguntas;
                  console.log(porcentajeBio);
                }
                if (data.categoria=="Pediatría") {
                  porcentajePedi=data.aciertos/data.preguntas;
                  console.log(porcentajePedi);
                }
                if (data.categoria=="Cirugía") {
                  porcentajeCiru=data.aciertos/data.preguntas;
                  console.log(porcentajeCiru);
                }
                if (data.categoria=="Neumología") {
                  porcentajeNeumo=data.aciertos/data.preguntas;
                  console.log(porcentajeNeumo);
                }
                if (data.categoria=="Medicina Preventiva") {
                  porcentajeMedi=data.aciertos/data.preguntas;
                  console.log(porcentajeMedi);
                }
              }
              console.log("categoría: "+data.categoria+" preguntas: "+data.preguntas+" aciertos: "+data.aciertos);
              });
            //___________________________________________________________________________________________
            Auth.$onAuthStateChanged(function(firebaseUser) {
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
                  //------------------------------------ MI ESTADISTICA --------------------------------------------
                  Data.child("porcentajeAciertos").push().set({
                      idScore: newPostKey,
                      cardio: porcentajeCardio,
                      gine: porcentajeGine,
                      epi: porcentajeEpi,
                      bio: porcentajeBio,
                      pedi: porcentajePedi,
                      ciru: porcentajeCiru,
                      neumo: porcentajeNeumo,
                      medi: porcentajeMedi
                    }, function(error) {
                      if(error) {
                        alert(error);
                      }else{
                        console.log("guardado correctamente");
                      }
                    });
                    porcentajeCardio = 0;
                    porcentajeGine = 0;
                    porcentajeEpi = 0;
                    porcentajeBio = 0;
                    porcentajePedi = 0;
                    porcentajeCiru = 0;
                    porcentajeNeumo = 0;
                    porcentajeMedi = 0;
                    //___________________________________________________________________________________
                  //$localStorage.score=0;
                  //$localStorage.op=5;
                  $scope.data.score=0;
                  $scope.data.op=7;
                }
              });
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
  $scope.showPopupIncorrecto = function () {
    var myPopup1 = $ionicPopup.show({
    template: '<center><img width="25%" ng-src="img/wrong1.png" ></center>',
    title: 'incorrecto',
    subTitle: 'Las respuesta correcta es: </br><font size=2>'+$scope.data.correcta+'.</font></br></br>Porque:</br><font size=2>'+ $localStorage.infografia+'</font>',
    scope: $scope,
    buttons: [
      {
        text: '<b>Bibliografía</b>',
        type: 'button-calm',
        onTap: function(e) {
          //alert(e);
        if(e) {
          var myPopupBibli = $ionicPopup.show({
          template: '<center><img width="40%" ng-src="img/Register-Icon1.png" ></center>',
          title: 'Bibliografía',
          subTitle: $localStorage.bibliografia,
          scope: $scope,
          buttons: [
            {
              text: '<b>Contiruar</b>',
              type: 'button-calm',
              onTap: function(e) {
              if(e) {
                //-------------------------------------- MI ESTADISTICA -------------------------------------------------
                $localStorage.porcentajeAciertos.forEach(function(data){
                  if (data.categoria==$localStorage.categoria){
                    data.preguntas++;
                  }
                });
                //_______________________________________________________________________________________________________
                $localStorage.op=$localStorage.op-1;
                $scope.data.op = $localStorage.op;
                if ($localStorage.op==0) {
                  $ionicHistory.nextViewOptions({
                    disableBack: true
                  });

                  //--------------------- MI ESTADISTICA ------------------------------------------------------
                  var porcentajeCardio = 0;
                  var porcentajeGine = 0;
                  var porcentajeEpi = 0;
                  var porcentajeBio = 0;
                  var porcentajePedi = 0;
                  var porcentajeCiru = 0;
                  var porcentajeNeumo = 0;
                  var porcentajeMedi = 0;
                  $localStorage.porcentajeAciertos.forEach(function(data){
                    if(data.preguntas>0) {
                      if(data.categoria=="Cardiología") {
                        porcentajeCardio=data.aciertos/data.preguntas;
                        console.log(porcentajeCardio);
                      }
                      if(data.categoria=="Ginecología y Obstetricia") {
                        porcentajeGine=data.aciertos/data.preguntas;
                        console.log(porcentajeGine);
                      }
                      if (data.categoria=="Epidemiología") {
                        porcentajeEpi=data.aciertos/data.preguntas;
                        console.log(porcentajeEpi);
                      }
                      if (data.categoria=="Bioestadística") {
                        porcentajeBio=data.aciertos/data.preguntas;
                        console.log(porcentajeBio);
                      }
                      if (data.categoria=="Pediatría") {
                        porcentajePedi=data.aciertos/data.preguntas;
                        console.log(porcentajePedi);
                      }
                      if (data.categoria=="Cirugía") {
                        porcentajeCiru=data.aciertos/data.preguntas;
                        console.log(porcentajeCiru);
                      }
                      if (data.categoria=="Neumología") {
                        porcentajeNeumo=data.aciertos/data.preguntas;
                        console.log(porcentajeNeumo);
                      }
                      if (data.categoria=="Medicina Preventiva") {
                        porcentajeMedi=data.aciertos/data.preguntas;
                        console.log(porcentajeMedi);
                      }
                    }
                    console.log("categoría: "+data.categoria+" preguntas: "+data.preguntas+" aciertos: "+data.aciertos);
                    });
                  //___________________________________________________________________________________________
                  Auth.$onAuthStateChanged(function(firebaseUser) {
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
                        //------------------------------------ MI ESTADISTICA --------------------------------------------
                        Data.child("porcentajeAciertos").push().set({
                            idScore: newPostKey,
                            cardio: porcentajeCardio,
                            gine: porcentajeGine,
                            epi: porcentajeEpi,
                            bio: porcentajeBio,
                            pedi: porcentajePedi,
                            ciru: porcentajeCiru,
                            neumo: porcentajeNeumo,
                            medi: porcentajeMedi
                          }, function(error) {
                            if(error) {
                              alert(error);
                            }else{
                              console.log("guardado correctamente");
                            }
                          });
                          porcentajeCardio = 0;
                          porcentajeGine = 0;
                          porcentajeEpi = 0;
                          porcentajeBio = 0;
                          porcentajePedi = 0;
                          porcentajeCiru = 0;
                          porcentajeNeumo = 0;
                          porcentajeMedi = 0;
                          //___________________________________________________________________________________
                        //$localStorage.score=0;
                        //$localStorage.op=5;
                        $scope.data.score=0;
                        $scope.data.op=7;
                      }
                    });
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
        // acaba popup
        }
      }
    },
      {
        text: '<b>Continuar</b>',
        type: 'button-calm',
        onTap: function(e) {
        if (e) {
          //-------------------------------------- MI ESTADISTICA -------------------------------------------------
          $localStorage.porcentajeAciertos.forEach(function(data){
            if (data.categoria==$localStorage.categoria){
              data.preguntas++;
            }
          });
          //_______________________________________________________________________________________________________
          $localStorage.op=$localStorage.op-1;
          $scope.data.op = $localStorage.op;
          if ($localStorage.op==0) {
            $ionicHistory.nextViewOptions({
              disableBack: true
            });

            //--------------------- MI ESTADISTICA ------------------------------------------------------
            var porcentajeCardio = 0;
            var porcentajeGine = 0;
            var porcentajeEpi = 0;
            var porcentajeBio = 0;
            var porcentajePedi = 0;
            var porcentajeCiru = 0;
            var porcentajeNeumo = 0;
            var porcentajeMedi = 0;
            $localStorage.porcentajeAciertos.forEach(function(data){
              if(data.preguntas>0) {
                if(data.categoria=="Cardiología") {
                  porcentajeCardio=data.aciertos/data.preguntas;
                  console.log(porcentajeCardio);
                }
                if(data.categoria=="Ginecología y Obstetricia") {
                  porcentajeGine=data.aciertos/data.preguntas;
                  console.log(porcentajeGine);
                }
                if (data.categoria=="Epidemiología") {
                  porcentajeEpi=data.aciertos/data.preguntas;
                  console.log(porcentajeEpi);
                }
                if (data.categoria=="Bioestadística") {
                  porcentajeBio=data.aciertos/data.preguntas;
                  console.log(porcentajeBio);
                }
                if (data.categoria=="Pediatría") {
                  porcentajePedi=data.aciertos/data.preguntas;
                  console.log(porcentajePedi);
                }
                if (data.categoria=="Cirugía") {
                  porcentajeCiru=data.aciertos/data.preguntas;
                  console.log(porcentajeCiru);
                }
                if (data.categoria=="Neumología") {
                  porcentajeNeumo=data.aciertos/data.preguntas;
                  console.log(porcentajeNeumo);
                }
                if (data.categoria=="Medicina Preventiva") {
                  porcentajeMedi=data.aciertos/data.preguntas;
                  console.log(porcentajeMedi);
                }
              }
              console.log("categoría: "+data.categoria+" preguntas: "+data.preguntas+" aciertos: "+data.aciertos);
              });
            //___________________________________________________________________________________________
            Auth.$onAuthStateChanged(function(firebaseUser) {
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
                  //------------------------------------ MI ESTADISTICA --------------------------------------------
                  Data.child("porcentajeAciertos").push().set({
                      idScore: newPostKey,
                      cardio: porcentajeCardio,
                      gine: porcentajeGine,
                      epi: porcentajeEpi,
                      bio: porcentajeBio,
                      pedi: porcentajePedi,
                      ciru: porcentajeCiru,
                      neumo: porcentajeNeumo,
                      medi: porcentajeMedi
                    }, function(error) {
                      if(error) {
                        alert(error);
                      }else{
                        console.log("guardado correctamente");
                      }
                    });
                    porcentajeCardio = 0;
                    porcentajeGine = 0;
                    porcentajeEpi = 0;
                    porcentajeBio = 0;
                    porcentajePedi = 0;
                    porcentajeCiru = 0;
                    porcentajeNeumo = 0;
                    porcentajeMedi = 0;
                    //___________________________________________________________________________________
                  //$localStorage.score=0;
                  //$localStorage.op=5;
                  $scope.data.score=0;
                  $scope.data.op=7;
                }
              });
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
            //--------------------- MI ESTADISTICA ------------------------------------------------------
            var porcentajeCardio = 0;
            var porcentajeGine = 0;
            var porcentajeEpi = 0;
            var porcentajeBio = 0;
            var porcentajePedi = 0;
            var porcentajeCiru = 0;
            var porcentajeNeumo = 0;
            var porcentajeMedi = 0;
            $localStorage.porcentajeAciertos.forEach(function(data){
              if(data.preguntas>0) {
                if(data.categoria=="Cardiología") {
                  porcentajeCardio=data.aciertos/data.preguntas;
                  console.log(porcentajeCardio);
                }
                if(data.categoria=="Ginecología y Obstetricia") {
                  porcentajeGine=data.aciertos/data.preguntas;
                  console.log(porcentajeGine);
                }
                if (data.categoria=="Epidemiología") {
                  porcentajeEpi=data.aciertos/data.preguntas;
                  console.log(porcentajeEpi);
                }
                if (data.categoria=="Bioestadística") {
                  porcentajeBio=data.aciertos/data.preguntas;
                  console.log(porcentajeBio);
                }
                if (data.categoria=="Pediatría") {
                  porcentajePedi=data.aciertos/data.preguntas;
                  console.log(porcentajePedi);
                }
                if (data.categoria=="Cirugía") {
                  porcentajeCiru=data.aciertos/data.preguntas;
                  console.log(porcentajeCiru);
                }
                if (data.categoria=="Neumología") {
                  porcentajeNeumo=data.aciertos/data.preguntas;
                  console.log(porcentajeNeumo);
                }
                if (data.categoria=="Medicina Preventiva") {
                  porcentajeMedi=data.aciertos/data.preguntas;
                  console.log(porcentajeMedi);
                }
              }
              console.log("categoría: "+data.categoria+" preguntas: "+data.preguntas+" aciertos: "+data.aciertos);
            //___________________________________________________________________________________________
          });

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
                //------------------------------------------- MI ESTADISTICA ---------------------------------------------
                Data.child("porcentajeAciertos").push().set({
                    idScore: newPostKey,
                    cardio: porcentajeCardio,
                    gine: porcentajeGine,
                    epi: porcentajeEpi,
                    bio: porcentajeBio,
                    pedi: porcentajePedi,
                    ciru: porcentajeCiru,
                    neumo: porcentajeNeumo,
                    medi: porcentajeMedi
                  }, function(error) {
                    if(error) {
                      alert(error);
                    }else{
                      console.log("guardado correctamente");
                    }
                  });
                  porcentajeCardio = 0;//papilla
                  porcentajeGine = 0;
                  porcentajeEpi = 0;
                  porcentajeBio = 0;
                  porcentajePedi = 0;
                  porcentajeCiru = 0;
                  porcentajeNeumo = 0;
                  porcentajeMedi = 0;
                //________________________________________________________________________________________________________

                $scope.data.score=0;
                $scope.data.op=7;
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
  //$( "div.progresoSinContestar" ).replaceWith('<div class="col col-15 progresoCorrecto"></div>');
if ($scope.data.res1==$scope.data.correcta) {
  $scope.showPopupCorrecto();
$("#res1").css("background-color", "#5FBA7D");
}else{
  $scope.showPopupIncorrecto();
  $("#res1").css("background-color", "#D52029");
}
if ($scope.data.res2==$scope.data.correcta) {
  $("#res2").css("background-color", "#5FBA7D");
}
if ($scope.data.res3==$scope.data.correcta) {
  $("#res3").css("background-color", "#5FBA7D");
}
if ($scope.data.res4==$scope.data.correcta) {
  $("#res4").css("background-color", "#5FBA7D");
}

}
$scope.btn2 = function() {
if ($scope.data.res2==$scope.data.correcta) {
  $scope.showPopupCorrecto();
  $("#res2").css("background-color", "#5FBA7D");
}else{
  $scope.showPopupIncorrecto();
  $("#res2").css("background-color", "#D52029");
}
if ($scope.data.res1==$scope.data.correcta) {
  $("#res1").css("background-color", "#5FBA7D");
}
if ($scope.data.res3==$scope.data.correcta) {
  $("#res3").css("background-color", "#5FBA7D");
}
if ($scope.data.res4==$scope.data.correcta) {
  $("#res4").css("background-color", "#5FBA7D");
}

}
$scope.btn3 = function() {
if ($scope.data.res3==$scope.data.correcta) {
  $scope.showPopupCorrecto();
  $("#res3").css("background-color", "#5FBA7D");
}else{
  $scope.showPopupIncorrecto();
  $("#res3").css("background-color", "#D52029");
}
if ($scope.data.res2==$scope.data.correcta) {
  $("#res2").css("background-color", "#5FBA7D");
}
if ($scope.data.res1==$scope.data.correcta) {
  $("#res1").css("background-color", "#5FBA7D");
}
if ($scope.data.res4==$scope.data.correcta) {
  $("#res4").css("background-color", "#5FBA7D");
}

}
$scope.btn4 = function() {
if ($scope.data.res4==$scope.data.correcta) {
  $scope.showPopupCorrecto();
  $("#res4").css("background-color", "#5FBA7D");
}else{
  $scope.showPopupIncorrecto();
  $("#res4").css("background-color", "#D52029");
}
if ($scope.data.res2==$scope.data.correcta) {
  $("#res2").css("background-color", "#5FBA7D");
}
if ($scope.data.res3==$scope.data.correcta) {
  $("#res3").css("background-color", "#5FBA7D");
}
if ($scope.data.res1==$scope.data.correcta) {
  $("#res1").css("background-color", "#5FBA7D");
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
