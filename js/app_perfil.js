var app = angular.module('secreto', [])
var url_server = 'http://159.203.128.165:8080/';
//var url_server = 'http://127.0.0.1:8080/';
//var socket = io.connect(url_server);

$(document).on("click", ".logout", function(){
    localStorage.removeItem("usuario")
    window.location.href = '../index.html'
})

app.controller('perfilController', ['$scope', '$http', function($scope, $http) {
	//----------------------------------------------------
    var usuario = localStorage.getItem("usuario")///nuevo|
    $scope.usuario = JSON.parse(usuario);//NUEVO         |
    // ---------------------------------------------------
    //var empresa = $scope.usuario.empresa;
    var empresa = $scope.usuario.EMPIDC;
    var oldCel = $scope.usuario.EMPCEE
    var idEmpleado = $scope.usuario._id;
    //alert("USUARIO 1 "+usuario)
    //alert("empresa "+empresa);
    
    getEmpleado();
    getEmpresa();

    function getEmpresa(){
        $http.get(url_server+"empresa/find/"+empresa).success(function(response) {
            if(response.type) { // Si nos devuelve un OK la API...
                $scope.empresa = response.data[0];
                $scope.urlFinal = url_server+"Empresas/"+$scope.empresa.CIALOG; 
            }
        })
    }
    
    function getEmpleado(){
        //alert("entro 1");
        $http.get(url_server+"user/buscar/"+idEmpleado).success(function(response) {
            if(response.type) { // Si nos devuelve un OK la API...
                $scope.pass = response.pass;
                $scope.usuario = response.data;
                localStorage.setItem("usuario", JSON.stringify(response.data));
            }
        });
    }

    $scope.updateEmpleado = function() {
        //alert("nuevo cel "+$scope.usuario.EMPCEE+" viejo cel "+oldCel)
        //alert("$scope.usuario nombre nuevo "+$scope.usuario.EMPNOM)
    	//alert("pass nuevo "+$scope.pass)
        //return;
    	$scope.usuario.EMPPAS = $scope.pass;

    	//var user = $scope.usuario;
        //user.id = user._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
        //delete user._id; // Lo borramos para evitar posibles intentos de modificación de un ID en la base de datos

        if($scope.usuario.EMPCEE == oldCel){
            //alert("--> es el mismo celular");
            var user = $scope.usuario;
            user.id = user._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
            delete user._id; // Lo borramos para evitar posibles intentos de modificación de un ID en la base de datos
            executeUpdate(user);
        }else{
            //alert("---> cambio de celular")
            $http.get(url_server+"user/buscarCelular/"+$scope.usuario.EMPCEE).success(function(response) {
                if(response.status === 'OK'){
                    //alert("OK "+response.data);
                    //alert("TAM "+response.data.length);
                    if(response.data.length == 0){
                        var user = $scope.usuario;
                        user.id = user._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
                        delete user._id; // Lo borramos para evitar posibles intentos de modificación de un ID en la base de datos
                        //alert("parece que no existe el celular");
                        executeUpdate(user);
                        //$("#nuevo_empleado_modal").modal('hide')
                    }else{
                        $("#mensaje").html('<div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Este número de celular ya existe, ingrese otro.</div>')
                        return false;
                    }
                }
            });
        }

        /*$http.get(url_server+"user/buscarCelular/"+$scope.usuario.EMPCEE).success(function(response) {
            if(response.status === 'OK'){
                //alert("OK "+response.data);
                //alert("TAM "+response.data.length);
                if(response.data.length == 0){
                    executeUpdate(user);
                    //$("#nuevo_empleado_modal").modal('hide')
                }else{
                    $("#mensaje").html('<div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Este número de celular ya existe, ingrese otro.</div>')
                    return false
                }
            }
        });*/

        // Hacemos una petición PUT para hacer el update a un documento de la base de datos.
        /*$http.put(url_server+"user/actualizar", user).success(function(response) {
            if(response.status === "OK") {
            	//alert("actiualizado")
                var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Informacion actualizada",
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
                getEmpleado();
                //$().toastmessage('showSuccessToast', "Información de la Junta actualizada exitosamente!");
                //$(".card-reveal").fadeOut()
                //getJuntaUnica(); // Actualizamos la lista de ToDo's
            }
        });*/

    }

    function executeUpdate(data){
        //alert("data "+data.EMPNOM);
        $http.put(url_server+"user/actualizar", data).success(function(response) {
            if(response.status === "OK") {
                //alert("actiualizado")
                var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Informacion actualizada",
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
                getEmpleado();
                //$().toastmessage('showSuccessToast', "Información de la Junta actualizada exitosamente!");
                //$(".card-reveal").fadeOut()
                //getJuntaUnica(); // Actualizamos la lista de ToDo's
            }
        });
    }

    $scope.redireccionar = function(){
    	//alert("redireccionar ")
    	//alert("$scope.usuario nom "+$scope.usuario.EMPNOM);
    	//alert("$scope.usuario tip "+$scope.usuario.EMPTIP);
    	if($scope.usuario.EMPTIP === 2){
			window.location.href = '../gerente/inicio.html';
		}else if ($scope.usuario.EMPTIP === 3) {
			window.location.href = '../operador/inicio.html'
		}else if ($scope.usuario.EMPTIP === 4) {
			window.location.href = '../secretario/inicio.html'
		}
    }

}]);