/* Controlador para secretario */
var app = angular.module('secreto', [])
var url_server = 'http://159.203.128.165/';
//var url_server = 'http://159.203.128.165:8080/';
//var url_server = 'http://127.0.0.1:8080/';
var socket = io.connect(url_server);

$(document).on("click","#dependencias", function(){
    $("#inv").openModal()// Abrimos la ventana
});
$(document).on("click","#entregablebtn", function(){
    $("#entregable").openModal()// Abrimos la ventana
});
$(document).on("click","#terminarbtn", function(){
    $("#aviso").openModal()// Abrimos la ventana
});

$(document).on("click", ".logout", function(){
    localStorage.removeItem("usuario")
    window.location.href = '../index.html'
})

$(document).on("click","#cerrar", function(){
    $("#cerrandoAcuerdo").modal()// Abrimos la ventana
});

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(nombre, file, acuerdo, uploadUrl){
        var fd = new FormData();
        fd.append('photo', file);
        fd.append('nombre', nombre)
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(response){
            if(response.type){
                acuerdo.id = acuerdo._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
                delete acuerdo._id
                acuerdo.ACUSTA = 'Terminada';
                acuerdo.url_file = response.ruta;
                $http.put(url_server+"acuerdo/actualizar", acuerdo).success(function(response) {
                    $("#mensaje").empty();
                    $("#mensaje").append('<div class="chip col s12 m12 l12">Acuerdo finalizado. <i class="material-icons">Cerrar</i></div>');
                    $("#mensaje").css('color', '#FFF');
                    location.reload();
                })
                //$("#mensaje").html("Se ha subido el archivo <a href='empleado.html'>Volver</a>")
            }
            else
                $("#mensaje").html("Ocurrio un error al subir el archivo")
        })
        .error(function(){
            $("#mensaje").html("Ocurrio un error al subir el archivo")
        });
    }
}]);
app.controller('directivoController', ['$scope', '$http', 'fileUpload', function($scope, $http, fileUpload){
    var usuario = localStorage.getItem("usuario")
	//var empresa = localStorage.getItem("empresa")
	$scope.usuario = JSON.parse(usuario);
    var empresa = $scope.usuario.EMPIDC;
	$scope.acuerdos = {}
	$scope.personas = {}
	$scope.tarea = {}
    //alert("empresa "+empresa);
    total_juntas()

    getEmpresa();
    
    getPuesto();
    function getEmpresa(){
        $http.get(url_server+"empresa/find/"+empresa).success(function(response) {
            if(response.type) { // Si nos devuelve un OK la API...
                $scope.empresa = response.data[0];
                $scope.urlFinal = url_server+"Empresas/"+$scope.empresa.CIALOG; 
            }
        })
    }

    function getPuesto(){
        //alert("puesto")
        $http.get(url_server+"puesto/listar/"+empresa).success(function(response) {
            if(response.status == "OK") {
                //alert("en "+response.data[0].nombreP)
                $scope.puestos = response.data;
            }
        }) 
    }

	//Obtenemos los parametros de la url
    var edit = getUrlParameter('id');
    // Llamamos a la función para obtener la lista de usuario al cargar la pantalla
    if (edit == undefined) {
        total_acuerdos();
		getEmpleados();
    }else{
        total_acuerdos();
        getAcuerdoUnico();
        getEmpleados();
    }
    //get_cumpleanos()
	/* Obtenemos a todos los empleados */
	function getEmpleados() {
		$http.get(url_server+"user/usuario/3/"+empresa).success(function(response) {
	        if(response.type) { // Si nos devuelve un OK la API...
	        	$scope.personas = response.data;
	        }
	    });
	}

	$scope.entregable = function(filename, file) {
        if(filename == '' || file == undefined){
            $("#mensaje").html("Por favor seleccione el archivo y nombre.")
        }
        var uploadUrl = url_server+"guardar";
        fileUpload.uploadFileToUrl(filename, file, $scope.acuerdo, uploadUrl);
    }
    // Método para obtener información de un acuerdo específico
    function getAcuerdoUnico() {

        $http.get(url_server+"acuerdo/find/"+edit).success(function(response) {
            if(response.type) { // Si nos devuelve un OK la API...
                $scope.acuerdo = response.data[0];
                /*if ($scope.acuerdo.url_file) {
                    var params = $scope.acuerdo.url_file.split('/')
                    var type = params[params.length-1].split('.')
    				if (type[type.length-1] == 'pdf') {
    				    $scope.type_file = 'pdf'
    				}else{
    				    $scope.type_file = 'img'
    				}
                }*/
                $scope.estado_de_acuerdo = ''
                switch($scope.acuerdo.ACUSTA){
                    case 'A': $scope.estado_de_acuerdo = 'Asignado'
                        $scope.backgroud = "brown"
                    break;
                    case 'P': $scope.estado_de_acuerdo = 'En progreso'
                        $scope.backgroud = "green"
                    break;
                    case 'D': $scope.estado_de_acuerdo = 'En destiempo'
                        $scope.backgroud = "red"
                    break;
                    case 'T': $scope.estado_de_acuerdo = 'Terminado'
                        $scope.backgroud = "blue"
                    break;
                }
                today = get_today()
                var dias_diferencias = restaFechas(today, response.data[0].ACUTIM)
				if (dias_diferencias == 0) {
					$scope.dias_para_junta = "Hoy es el día límite para cumplir con este acuerdo."
				}else if (dias_diferencias == 1) {
					$scope.dias_para_junta = "Mañana es el día límite para cumplir con este acuerdo."
				}else if (dias_diferencias > 0) {
					$scope.dias_para_junta = "Faltan "+dias_diferencias+" días para cumplir con este acuerdo."
				}else if (dias_diferencias < 0) {
					$scope.dias_para_junta = "La fecha límite para cumplir con este acuerdo fue hace "+Math.abs(dias_diferencias)+" días"
				};
				getTareas($scope.acuerdo._id)
				/*if ($scope.acuerdo.ACUSTA == 'Terminada') {
                    var url = $scope.acuerdo.url_file.substring(2)
                    $scope.url_final = url_server+url;
                };*/
                //lastUsuarioAcuerdo = $scope.acuerdo.ACUCPE
            }
        });
    }

    function playBeep() {
        navigator.notification.beep(1);
    }
    // Vibrate for 2 seconds
    function vibrate() {
        navigator.notification.vibrate(2000);
    }
    
	// Funcion de escucha ante un nuevo acuerdo
	socket.on("nuevo_acuerdo", function (data) {
		//alert("nuevo EMP "+data.ACUEMP+" idUsuario "+$scope.usuario._id);
		//var myName = $("#nombre_usuario").val();
        var myName = $scope.usuario._id;
        if (myName == data.ACUEMP) {
        //if (myName == data.ACUCPE) {
            
            playBeep()
            vibrate()

            //cordova.plugins.backgroundMode.onactivate = function () {
            //                // Modify the currently displayed notification
            //                cordova.plugins.backgroundMode.configure({
            //                    text:'Nuevo acuerdo asignado'
            //                });
            //        }
            total_acuerdos()
            var notification = document.querySelector('.mdl-js-snackbar');
            var data = {
                message: "Nuevo Acuerdo Asignado",
                timeout: 4000
            };
            notification.MaterialSnackbar.showSnackbar(data);
		};
	});
    
    socket.on("cambio_status", function (idSup) {
    //socket.on("cambio_status", function () {
        
        playBeep()
        vibrate()
        //alert("idSup "+idSup+" $scope.usuario._id "+$scope.usuario._id)
        if($scope.usuario._id == idSup){
            if ($scope.acuerdo) {
                var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Se ha modificado el estado de una tarea.",
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
                getTareas($scope.acuerdo)
                getAcuerdoUnico()
                //var edit = getUrlParameter('id');
                //if (edit != null) 
                //    location.reload()
            }
        }
        
    });

	// Funcion de escucha ante una nueva junta
	socket.on("nueva_junta", function (idj, motivo, id) {
        
        //alert("idReceived = "+id+" IDUSER = "+$scope.usuario._id);
		//var myName = $("#nombre_usuario").val();
        var myName = $scope.usuario._id;
		if (myName == id) {
            
            playBeep()
            vibrate()
            
            total_juntas()
            var notification = document.querySelector('.mdl-js-snackbar');
            var data = {
                message: "Nueva Junta de Trabajo",
                timeout: 4000
            };
            notification.MaterialSnackbar.showSnackbar(data);
		};
	});

	// Metodo para obtener la cantidad de acuerdos del usuario
	function total_acuerdos(){
		var user = JSON.parse(usuario)
		var myName = user._id;
		$http.get(url_server+"acuerdo/buscar/"+myName).success(function(response) {
			if(response.type) { // Si nos devuelve un OK la API...
		        $scope.acuerdos = response.data;
		        /*var total_acuerdos = response.data.length;
		        $("#num-notifications").html(total_acuerdos);*/
		        total_juntas();
		    }
		});
	}
    
	// Metodo para obtener la cantidad de juntas del usuario
	function total_juntas(){
		var user = JSON.parse(usuario)
		var myName = user._id;
		$http.get(url_server+"invit/findInvitados/"+myName).success(function(response) {
			if(response.status == 'OK') { // Si nos devuelve un OK la API...
		        $scope.juntas = response.data;
                $scope.juntas_l = response.data;
                /*$("#none_juntas").remove()
                $("#ver_todas_juntas").remove()*/
                //$(".lista_de_juntas").append('<li class="mdl-menu__item" ><a href="junta.html?id='+response.data.INVJUN+'"> '+response.data.INVJNO+' <br> <span>'+response.data.INVFEC+' a las '+response.data.INVHOR+'hrs.</span></a></li>')
                /*$(".lista_de_juntas").append('<li id="none_juntas" class="mdl-menu__item" ng-if="juntas.length == 0">No tienes juntas asignadas</li>');
                $(".lista_de_juntas").append('<li id="ver_todas_juntas" class="mdl-menu__item all" ng-if="juntas.length > 0"><a href="juntas.html">Ver todas</a></li>');*/
		    }
		});
	}
    
	$scope.checkedDependencias = [];
    $scope.checkedIdEmp = [];
    $scope.checkedClave = [];
	//funcion que captura a las dependencias de tareas que selecciona para las juntas
    $scope.addDependencia = function(id,clave,descripcion) {
        //alert("idEmp "+id+" empleado "+empleado);
        var index = $scope.checkedDependencias.indexOf(descripcion);
        var indexID = $scope.checkedIdEmp.indexOf(id);
        var indexPuesto = $scope.checkedClave.indexOf(clave);
            
        if ( index != -1 ) {//ya esta agregado
            $scope.checkedDependencias.splice(index,1);
        }else{
            $scope.checkedDependencias.push(descripcion);
        }
            
        if ( indexID != -1 ) {//ya esta agregado
            $scope.checkedIdEmp.splice(indexID,1);
            $scope.checkedClave.splice(indexPuesto,1);
        }else{
            $scope.checkedIdEmp.push(id);
            $scope.checkedClave.push(clave);
        }
    };
	// Método para agregar una tarea
    $scope.nuevaTarea = function(acuerdo){
        //alert("acuerdo "+$scope.tarea.TARRES);
        if($scope.tarea.TARRES == undefined){
            $("#error").append("<div class='alert alert-danger'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a><i class='fa fa-user'></i> Para continuar, Seleccione un Empleado para esta tarea</div>");
            return;
        }
    	$scope.tarea.TARIDC = empresa;
    	$scope.tarea.TARACU = acuerdo._id;
        $scope.tarea.TARJUN = acuerdo.ACUJUN;
        $scope.tarea.TARPUN = acuerdo.ACUPUN;
        $scope.tarea.TARSUP = $scope.usuario._id;
        $scope.tarea.TARCON = ($scope.tareas.length + 1)
        $scope.tarea.TARHRE = 0
        $scope.tarea.TARREA = 0
        $scope.tarea.TARES1 = ''
        $scope.tarea.TARES2 = ''
        $scope.tarea.TARSTA = 'A'
        $scope.tarea.TARURL = ''
    	$scope.tarea.dependencias = $scope.checkedIdEmp;
    	$scope.tarea.dependencias_des = $scope.checkedDependencias;
        $scope.tarea.date = get_today()

    	$http.post(url_server+"tarea/crear", $scope.tarea).success(function(response) {
            if(response.status === "OK") { // Si nos devuelve un OK la API...
            	socket.emit("nueva_tarea", response.data);
            	var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Tarea creada",
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
                $(".card-reveal").fadeOut()
                $scope.tarea = {}; // Limpiamos el scope
                getAcuerdoUnico()
                //getTareas(response.data.acuerdo)
            }
        });
    }
    $scope.terminarAsignacion = function(){
        acuerdo = $scope.acuerdo
        acuerdo.ACUSTA = "P";
        //$scope.acuerdoN.ACUST1 = 0;
        //$scope.acuerdoN.ACUST2 = 0;
        //$scope.acuerdoN.ACUPUN = idO;
        $("#aviso").closeModal()
        var acuerdo = acuerdo;
        acuerdo.id = acuerdo._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
        delete acuerdo._id; // Lo borramos para evitar posibles intentos de modificación de un ID en la base de datos

        // Hacemos una petición PUT para hacer el update a un documento de la base de datos.
        $http.put(url_server+"acuerdo/actualizar", acuerdo).success(function(response) {
            if(response.status === "OK") {
                var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Bien, has terminado de asignar tareas",
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
                //$().toastmessage('showSuccessToast', "Información del Acuerdo actualizada exitosamente!");
                $(".card-reveal").fadeOut()
                $scope.tarea = {}; // Limpiamos el scope
                //getJuntaUnica(); // Actualizamos la lista de ToDo's
                getAcuerdoUnico();
                location.reload()
            }
        });
    }

    $scope.avisoOperadores = function(idAcuerdo){
    //$scope.avisoOperadores = function(){
        //alert("id Acuerdo "+idAcuerdo);
        //$scope.tareasByAcuerdo = {}
        $http.get(url_server+"tarea/tareasAcuerdo/"+idAcuerdo).success(function(response) {
            if(response.type){
                //alert("OK ---> "+response.data+" tam "+response.data.length);
                //$scope.tareasByAcuerdo = response.data;
                finalizarAviso(response.data)
            }
        });
    }
    
    function finalizarAviso(datosAcuerdo){
        //alert("finalizarAviso "+datosAcuerdo)
        var idsEmpleados = []
        for(var i = 0 ; i < datosAcuerdo.length ; i++){
            if(i == 0){
                idsEmpleados.push(datosAcuerdo[i].TARRES);
            }else{
                var index = 0;
                index = idsEmpleados.indexOf(datosAcuerdo[i].TARRES);
                if(index < 0){
                    //alert("No esta ese wey en el arreglo")
                    idsEmpleados.push(datosAcuerdo[i].TARRES);
                }else{
                    //alert("Ya esta ese wey en el arreglo")
                }
            }
        }
        //alert("idsEmpleados "+idsEmpleados)
        for( var i = 0 ; i < idsEmpleados.length ; i++ ){
            socket.emit("aviso_fin_tareas", idsEmpleados[i], "Ya no hay mas asignaciones.Pueden Empezar con sus Tareas. Gracias!");
        }
        //alert("finish");
        $http.get(url_server+'acuerdo/actualizarStatus', { params : {acuerdo: edit, status:'P'}}).success(function(datos){//A ---> Acordado --- cafe
            if(datos.type){
            //if(datos.status === 'OK'){
                //$().toastmessage('showSuccessToast', "Acuerdo en progreso");
                var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Bien, has terminado de asignar tareas",
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
                getAcuerdoUnico();
            }
        });
    }

    $scope.terminarAcuerdo = function(){
        //alert("fecha asignada "+$scope.acuerdo.ACUTIM+" fecha de finalización del acuerdo "+get_today())
        var hoy = get_today();
        //hoy = "19/05/2016";
        //alert(hoy)
        $http.get(url_server+"junta/find/"+$scope.acuerdo.ACUJUN).success(function(response) {
            if(response.type){
                //alert("response "+response.data[0].JUNIDE)
                var idE = response.data[0].JUNIDE;
                $http.get(url_server+"user/buscar/"+idE).success(function(response) {
                    //alert("response "+response.data.EMPNOM)
                    var email = response.data.EMPEMA;
                    var nombre = response.data.EMPNOM;
                    //, { params : {correo: $scope.usuarioL.email, pass: $scope.usuarioL.pass}}
                    $http.get(url_server+"acuerdo/avisarSecretario/", { params: { correo: email, secretario: nombre, responsable: $scope.usuario.EMPNOM }}).success(function(response) {
                        if(response.type){
                            //alert("se envio el email");
                            //acuerdo.ACUSTA = "T";
                            //$scope.acuerdoN.ACUST1 = 0;
                            //$scope.acuerdoN.ACUST2 = 0;
                            //$scope.acuerdoN.ACUPUN = idO;
                            acuerdo = $scope.acuerdo
                            if(hoy > acuerdo.ACUTIM){
                                //alert("aa-->Terminado En destiempo");
                                acuerdo.ACUSTA = "D";
                            }else{
                                //alert("bb-->Terminado En tiempo")
                                acuerdo.ACUSTA = "T";
                            }

                            var acuerdo = acuerdo;
                            acuerdo.id = acuerdo._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
                            delete acuerdo._id; // Lo borramos para evitar posibles intentos de modificación de un ID en la base de datos

                            // Hacemos una petición PUT para hacer el update a un documento de la base de datos.
                            $http.put(url_server+"acuerdo/actualizar", acuerdo).success(function(response) {
                                if(response.status === "OK") {
                                    var notification = document.querySelector('.mdl-js-snackbar');
                                    var data = {
                                        message: "Bien, has terminado este acuerdo",
                                        timeout: 4000
                                    };
                                    notification.MaterialSnackbar.showSnackbar(data);
                                    //socket.emit("fin_acuerd",acuerdo);
                                    //$().toastmessage('showSuccessToast', "Información del Acuerdo actualizada exitosamente!");
                                    $(".card-reveal").fadeOut()
                                    $scope.tarea = {}; // Limpiamos el scope
                                    //getJuntaUnica(); // Actualizamos la lista de ToDo's
                                    getAcuerdoUnico();
                                    //location.reload()
                                }
                            });
                        }
                    });
                })
            }
        });
        /*acuerdo = $scope.acuerdo
        //acuerdo.ACUSTA = "T";
        //$scope.acuerdoN.ACUST1 = 0;
        //$scope.acuerdoN.ACUST2 = 0;
        //$scope.acuerdoN.ACUPUN = idO;
        var acuerdo = acuerdo;
        acuerdo.id = acuerdo._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
        delete acuerdo._id; // Lo borramos para evitar posibles intentos de modificación de un ID en la base de datos

        // Hacemos una petición PUT para hacer el update a un documento de la base de datos.
        $http.put(url_server+"acuerdo/actualizar", acuerdo).success(function(response) {
            if(response.status === "OK") {
                var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Bien, has terminado este acuerdo",
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
                socket.emit("fin_acuerd",acuerdo);
                //$().toastmessage('showSuccessToast', "Información del Acuerdo actualizada exitosamente!");
                $(".card-reveal").fadeOut()
                $scope.tarea = {}; // Limpiamos el scope
                //getJuntaUnica(); // Actualizamos la lista de ToDo's
                getAcuerdoUnico();
                location.reload()
            }
        });*/
    }
    $scope.rechazar_tarea = function(tarea) {
        $scope.tarea_a_rechazar = tarea;
        $("#rechazar").openModal()
    }
    $scope.enviar_comentarios = function(){
        var tarea = $scope.tarea_a_rechazar
        tarea.TARSTA = "P";
        tarea.TARES1 = $("#comentario_de_rechazo").val()
        //$scope.tareaN.ACUST1 = 0;
        //$scope.tareaN.ACUST2 = 0;
        //$scope.tareaN.ACUPUN = idO;
        $("#rechazar").closeModal()
        var tarea = tarea;
        tarea.id = tarea._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
        delete tarea._id; // Lo borramos para evitar posibles intentos de modificación de un ID en la base de datos
        $http.put(url_server+"tarea/actualizar", tarea).success(function(response) {
            if(response.status === "OK") {
                var mensaje = "Se ha rechazado la tarea: "+tarea.TARDES;
                socket.emit("aviso_rechazar_tarea", tarea.TARRES, mensaje);
                var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Se han enviado las observaciones",
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
                //$().toastmessage('showSuccessToast', "Información del Acuerdo actualizada exitosamente!");
                $(".card-reveal").fadeOut()

                //getJuntaUnica(); // Actualizamos la lista de ToDo's
                getAcuerdoUnico();
                //socket.emit("notificacion_de_tarea", tarea)
                //location.reload()
            }
        });
    }
    $scope.validarTarea = function(tarea_validar){
        var tarea = tarea_validar
        tarea.id = tarea._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
        delete tarea._id
        tarea.TARSTA = 'T';
        tarea.TARES2 = get_today()
        $http.put(url_server+"tarea/actualizar", tarea).success(function(response) {
            var mensaje = "Se ha validado la tarea: "+tarea.TARDES;
            socket.emit("aviso_validar_tarea", tarea.TARRES, mensaje);
            var notification = document.querySelector('.mdl-js-snackbar');
            var data = {
                message: "Has validado esta tarea",
                timeout: 4000
            };
            notification.MaterialSnackbar.showSnackbar(data);
            getAcuerdoUnico()
        })
    }
    $scope.limpiar = function(){
    	$scope.checkedDependencias = [];
	    $scope.checkedIdEmp = [];
	    $scope.checkedClave = [];
    }

    // Método para obtener las tareas
    function getTareas(acuerdo){
        //alert("getTareas");
    	$scope.bloqueado = "true";
    	//$scope.tarea.empresa = empresa;
        $scope.tarea.TARIDC = empresa;

    	$http.get(url_server+"tarea/listar/"+acuerdo+"/"+empresa).success(function(response) {
            if(response.status === "OK") { // Si nos devuelve un OK la API...
            	$scope.tareas = response.data;
            	for (var i=0;i<$scope.tareas.length;i++){
                    var dep = $scope.tareas[i].TARSTA;
                    if ((dep != 'T') ) {
                    	$scope.bloqueado = "false";
                    };
                }
            }
        });
    }

    function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

    // Cada 8 horas verificamos si hay alguna junta proxima
	var fecha_juntas = setInterval(get_fecha_juntas, 3600000);
	var fecha_acuerdos = setInterval(get_fecha_acuerdos, 3600000);
	var fecha_cumple = setInterval(get_cumpleanos, 3600000);

	// Función para determinar cuantos dias faltan para las juntas
	function get_fecha_juntas(){
	    var today = get_today()
		for (var i=0; i<$scope.juntas.length;i++){
			// Obtenemos los dias de diferencia
			var dias_diferencias = restaFechas(today, $scope.juntas[i].JUTFEC)
			if (dias_diferencias == 0) {
				Materialize.toast("<a href='junta.html?id="+$scope.juntas[i]._id+"'>Hola "+$scope.usuario.nombreC+", hoy se llevará acabo la junta "+$scope.juntas[i].JUTCVE+" a la cual fuiste invitado, se llevará acabo en "+$scope.juntas[i].JUTLUG+" a las "+$scope.juntas[i].JUTHOR+" hrs.</a>", 10000)
                playBeep()
        vibrate()
			}else if (dias_diferencias == 1) {
				Materialize.toast("<a href='junta.html?id="+$scope.juntas[i]._id+"'>Hola "+$scope.usuario.nombreC+", mañana se llevará acabo la junta "+$scope.juntas[i].JUTCVE+" a la cual fuiste invitado, se llevará acabo en "+$scope.juntas[i].JUTLUG+" a las "+$scope.juntas[i].JUTHOR+" hrs.</a>", 10000)
                playBeep()
        vibrate()
			}else if (dias_diferencias < 3 && dias_diferencias > 0) {
				Materialize.toast("<a href='junta.html?id="+$scope.juntas[i]._id+"'>Hola "+$scope.usuario.nombreC+", te recordamos que tienes una junta en "+dias_diferencias+" dias, la junta es "+$scope.juntas[i].JUTCVE+" y se llevará acabo en "+$scope.juntas[i].JUTLUG+"</a>", 4000)
                playBeep()
        vibrate()
			};
		}
	}

	// Función para determinar que cuantos dias faltan para que el directivo cumpla con un acuerdo 
	function get_fecha_acuerdos(){
	    var today = get_today()
		for (var i=0; i<$scope.acuerdos.length;i++){
			// Obtenemos los dias de diferencia
			var dias_diferencias = restaFechas(today, $scope.acuerdos[i].ACUTIM)
			if (dias_diferencias == 0) {
				Materialize.toast("<a href='acuerdo.html?id="+$scope.acuerdos[i]._id+"'>Hola "+$scope.usuario.nombreC+", hoy es el día limite para cumplir con el acuerdo "+$scope.acuerdos[i].ACUNAC+" que te fue asignado.</a>", 10000)
                playBeep()
        vibrate()
			}else if (dias_diferencias == 1) {
				Materialize.toast("<a href='acuerdo.html?id="+$scope.acuerdos[i]._id+"'>Hola "+$scope.usuario.nombreC+", mañana es el día limite para cumplir con el acuerdo "+$scope.acuerdos[i].ACUNAC+" que te fue asignado.</a>", 10000)
                playBeep()
        vibrate()
			}else if (dias_diferencias < 3 && dias_diferencias > 0) {
				Materialize.toast("<a href='acuerdo.html?id="+$scope.acuerdos[i]._id+"'>Hola "+$scope.usuario.nombreC+", faltan "+dias_diferencias+" dias para cumplir con el acuerdo "+$scope.acuerdos[i].ACUNAC+" que te fue asignado.</a>", 10000)
                playBeep()
        vibrate()
			};
		}
	}

	// funcion para saber la fecha de cumpleaños del empleado
	function get_cumpleanos(){
		var today = get_today()
		var dias_diferencias = restaFechas(today, $scope.usuario.fecha_nac)
		if (dias_diferencias == 0) {
			$("#mensaje_cumple").html($scope.usuario.nombreC+" Felicidades hoy en tu cumpleaños!")
			$("#mensaje_cumple").addClass('card')
		};
	}

	// Funcion que obtiene la diferencia de dos fechas en dias
	function restaFechas(f1,f2){
		var aFecha1 = f1.split('/'); 
		var aFecha2 = f2.split('/'); 
		var fFecha1 = Date.UTC(aFecha1[2],aFecha1[1]-1,aFecha1[0]); 
		var fFecha2 = Date.UTC(aFecha2[2],aFecha2[1]-1,aFecha2[0]); 
		var dif = fFecha2 - fFecha1;
		var dias = Math.floor(dif / (1000 * 60 * 60 * 24)); 
		return dias;
	}

	function get_today(){
		// Obtenemos la fecha de hoy con el formato dd/mm/yyyy
		var today = new Date()
		var dd = today.getDate();
    	var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();
    	if(dd<10){
        	dd='0'+dd
    	} 
	    if(mm<10){
	        mm='0'+mm
	    } 
	    var today = dd+'/'+mm+'/'+yyyy;
	    return today;
	}
    socket.on("cancel_junta", function (idj, clave, id) {
        
        var myName = $scope.usuario._id;
        if (myName == id) {
            
            playBeep()
            vibrate()

            var numNotificaciones = parseInt($("#noti").text())
            numNotificaciones++;
            //$(".noti").html(numNotificaciones)
            $("#noti").html(numNotificaciones)
            //$("#nothing").empty();
            //var htmlText = '<li><a href="junta.html?id='+idj+'"><i class="mdi-social-notifications"></i> '+clave+'</a></li>'
            var htmlText = '<li><i class="fa fa-bell"></i>Se canceló la junta '+clave+'</li>'
            $("#notifications-dropdown").append(htmlText);
            var notification = document.querySelector('.mdl-js-snackbar');
            var data = {
                message: "Junta de Trabajo Cancelada",
                timeout: 4000
            };
            notification.MaterialSnackbar.showSnackbar(data);
        };
    });

    get_hour();

    function get_hour(){
        var tiempo = new Date();
        var hora = tiempo.getHours();
        if(hora >= 0 && hora <= 5){
            $("#saludo").empty();
            $("#saludo").append("Buena Madrugada ");         
        }else if(hora >= 6 && hora <= 11){
            $("#saludo").empty();
            $("#saludo").append("Buenos Días ");
        }else if(hora >= 12 && hora <= 18){
            $("#saludo").empty();
            $("#saludo").append("Buenas Tardes ");
        }else if(hora >= 19 && hora <= 23){
            $("#saludo").empty();
            $("#saludo").append("Buenas Noches ");
        }
    }
    
}]);
