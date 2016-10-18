var app = angular.module('secreto', [])
var url_server = 'http://159.203.128.165/';
//var url_server = 'http://159.203.128.165:8080/';
//var url_server = 'http://127.0.0.1:8080/';
var socket = io.connect(url_server);
//alert("socket"+socket)
//Para cerrar los modales
$(document).on("click","#open_Modal", function(){
	$("#abrir_Modal").openModal()// Abrimos la ventana
});

$(document).on("click", ".logout", function(){
    localStorage.removeItem("usuario")
    window.location.href = '../../index.html'
})

app.controller('acuerdoController', ['$scope', '$http', function($scope, $http) {
	var lista_ordenes = [];
	var usuario = localStorage.getItem("usuario")
	$scope.usuario = JSON.parse(usuario);
	//$scope.listOrden = {};
	//var empresa = $scope.usuario.empresa;
    var empresa = $scope.usuario.EMPIDC;
	var idO = getUrlParameter('idO');
	if(idO == undefined){

    }else{
		//getJuntaUnica();
		getOrdenUnica();
		getJuntaUnica();
		getAcuerdoByOrden();
	}
	var id = getUrlParameter('id');
    //alert("id ID "+id);
	//Llamamos a la función para obtener la lista de usuario al cargar la pantalla
	if (id == undefined) {
		//id = 
		//alert("id undefined|12213");
        //getOrden();
		//getJuntas();
	}else{
		//alert("id no undefinedasdsa");
		getOrdenUnica();
		//alert("fin getOrdenUnica");
		getJuntaUnica();
		getAcuerdoByOrden();
	}
	//getAcuerdos();	
	getAcuerdoByJunta();
	//alert("nnnn");
    getEmpresa()
    function getEmpresa(){
        $http.get(url_server+"empresa/find/"+empresa).success(function(response) {
            if(response.type) { // Si nos devuelve un OK la API...
                $scope.empresa = response.data[0];
                //$scope.urlFinal = url_server+"Empresas/"+$scope.empresa.pathImg; 
            }
        })
    }
	$scope.nuevoAcuerdo = function(){
        //alert("empresa "+empresa+" idJ "+id+" idO "+idO);
        $("#errorAcuerdo").empty();
        $scope.acuerdoN.ACUIDC = empresa;
        //$scope.acuerdoN.ACUIDE = $scope.usuario._id;
		$scope.acuerdoN.ACUPUN = idO;
		$scope.acuerdoN.ACUJUN = id;
        //$scope.acuerdoN.ACUSTA = 'A';//Asignada
        $scope.acuerdoN.ACUSTA = '';//Asignada
        $scope.acuerdoN.ACUENT = '';

        //alert("nuevo acuerdo");
		var fec_limiteAcuerdo = document.getElementById('fec').value;
        
        if($scope.acuerdoN.ACUEMP == undefined){
            $("#errorAcuerdo").append('<div class="alert alert-danger"><i class="fa fa-user"></i> Seleccione a un Encargado para el Acuerdo</div>');
            return;
        }

        if (fec_limiteAcuerdo == ""){
            //alert("->"+fec_limiteAcuerdo);
            $("#errorAcuerdo").append('<div class="alert alert-danger"><i class="fa fa-calendar"></i> Seleccione una Fecha Limite</div>');
            return;
        }
        //alert(fec_junta);
        $scope.acuerdoN.ACUTIM = fec_limiteAcuerdo;
        //alert($scope.juntaN.JUNFEC);
        //la fecha del acuerdo se transforma asi, esto para poder hacer los reportes, buscando mas facil la info. en un rango de datos
        var dat = $scope.acuerdoN.ACUTIM;
        var datII = dat.split("/");
        var dia = datII[1] - 1;
        var fechaISO = new Date(datII[2],dia,datII[0]).toISOString();//mes 
        //$scope.juntaN.fechaJ = fechaISO;
        $scope.acuerdoN.ACUFEC = fechaISO;
        $scope.acuerdoN.ACUST1 = 'C';//Azul --- en proceso
        $scope.acuerdoN.ACUST2 = 'C';//Azul --- en proceso
        //$scope.acuerdoN.ACUPUN = idO;
        $scope.acuerdoN.ACUCON = $scope.consecutivo;
        // Hacemos un POST a la API para dar de alta nuestro nuevo ToDo
        $http.post(url_server+"acuerdo/crear", $scope.acuerdoN).success(function(response) {
            if(response.status === "OK") { // Si nos devuelve un OK la API...
                //alert("s "+$scope.juntaN.JUTSTA);
                var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Se creo el Acuerdo "+$scope.acuerdoN.ACUCON,
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
                //$().toastmessage('showSuccessToast', "Se creo el Acuerdo "+$scope.acuerdoN.ACUCON);
                //$().toastmessage('showSuccessToast', "Para crear la Orden del dia de la Junta Nueva, vaya a Ver Todas las Juntas");
                $scope.acuerdoN = {}; // Limpiamos el scope
                getJuntaUnica();
                $("#abrir_Modal").closeModal()// Abrimos la ventana
                getAcuerdoByOrden();
                //window.location.href = "juntas_de_trabajo.html";
            }
        });

	}

	$scope.updateAcuerdo = function(acuerdo) {
		//alert("update "+acuerdo.ACUTIM)
		//var fec_limiteAcuerdo = document.getElementById('fecU').value;
        //alert(fec_junta);
        //$scope.acuerdo.ACUTIM = fec_limiteAcuerdo;
        //alert($scope.juntaN.JUNFEC);
        //la fecha del acuerdo se transforma asi, esto para poder hacer los reportes, buscando mas facil la info. en un rango de datos
        var dat = acuerdo.ACUTIM;
        var datII = dat.split("/");
        var dia = datII[1] - 1;
        var fechaISO = new Date(datII[2],dia,datII[0]).toISOString();//mes 
        //$scope.juntaN.fechaJ = fechaISO;
        acuerdo.ACUFEC = fechaISO;
        //$scope.acuerdoN.ACUST1 = 0;
        //$scope.acuerdoN.ACUST2 = 0;
        //$scope.acuerdoN.ACUPUN = idO;
        $("#"+acuerdo._id+"-Update").closeModal()
        var acuerdo = acuerdo;
        acuerdo.id = acuerdo._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
        delete acuerdo._id; // Lo borramos para evitar posibles intentos de modificación de un ID en la base de datos

        // Hacemos una petición PUT para hacer el update a un documento de la base de datos.
        $http.put(url_server+"acuerdo/actualizar", acuerdo).success(function(response) {
            if(response.status === "OK") {
                var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Informacion actualizada",
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
                //$().toastmessage('showSuccessToast', "Información del Acuerdo actualizada exitosamente!");
                $(".card-reveal").fadeOut()
                //getJuntaUnica(); // Actualizamos la lista de ToDo's
                getAcuerdoByOrden();
                getOrdenUnica();
            }
        });
    }

	$scope.openModalDelete = function(id){
		//alert("delete "+id)
        var idDelete = "#"+id+"-Delete";
        //$(idDelete).modal()// Abrimos la ventana
        $(idDelete).openModal()// Abrimos la ventana
    }

    $scope.openModalDelete2 = function(id,acupun){
        //alert("delete 2"+id+" acupun "+acupun);
        var idDelete = "#"+id+"-Delete";
        //$(idDelete).modal()// Abrimos la ventana
        $(idDelete).openModal()// Abrimos la ventana
        idO = acupun;
        //alert("idO "+idO)
    }

    $scope.openModalUpdate = function(id){
    	//alert("Update "+id)
		var idUpdate = "#"+id+"-Update";
		//$(idUpdate).modal()// Abrimos la ventana
		$(idUpdate).openModal()// Abrimos la ventana
	}

    $scope.deleteAcuerdo = function(idA) {
        //alert("delete id" + idA);
    	$http.delete(url_server+"acuerdo/eliminar", { params : {identificador: idA}}).success(function(response) {
			//console.log("function");
			if(response.status === "OK") { // Si la API nos devuelve un OK...
                var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Acuerdo eliminado",
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
				//$().toastmessage('showSuccessToast', 'Acuerdo Eliminado Correctamente');
				//$('#'+id+"-Delete").modal('hide');
				$('#'+id+"-Delete").closeModal();
				recorrerConsecutivo();
                //getAcuerdoByOrden();
                //getOrdenUnica();
			}
		});
    }
    
    $scope.enviarAcuerdos = function(sendAcuerdos){
    	//alert("1 --> send Acuerdos "+sendAcuerdos);
        $("#aviso").empty();
        for(var i = 0 ; i < $scope.listOrden.length ; i++){
            //alert("Orden._id "+$scope.listOrden[i]._id);
            actualizarStatusOrden($scope.listOrden[i]._id,"A");//A es asignada
        }
        //Actualizar el status del acuerdo para que pueda ser visualizado por el supervisor
        for(var i = 0 ; i < sendAcuerdos.length ; i++){
            actualizarStatusAcuerdo(sendAcuerdos[i]._id,"A");//A es asignada
        }
        //return;
        for(var i = 0 ; i < sendAcuerdos.length ; i++){
            socket.emit("nuevo_acuerdo", sendAcuerdos[i]);
        }
        $http.get(url_server+'junta/actualizarStatus', { params : {junta: id, status:'A'}}).success(function(datos){//A ---> Acordado --- cafe
            if(datos.type){
                var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Se enviaron los acuerdos",
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
                $("#aviso").append('<div class="alert alert-success">Se envió los acuerdos y se Cerró la junta <i class="icon-thumbs-up"></i></div>');
                getJuntaUnica();
            }
        });
        
    	
    }
    
    //NUEVO ---------------------- ************************* 58
    function actualizarStatusAcuerdo(id,status){
        $http.get(url_server+'acuerdo/actualizarStatus', { params : {acuerdo: id, status:status}}).success(function(datos){//A ---> Acordado --- cafe
            if(datos.type){
                console.log("actualizado con exito");
            }
        });   
    }
    //NUEVO ---------------------- ************************* 58

    $scope.cerrarJunta = function(){
        //alert("aa close "+id);
        for(var i = 0 ; i < $scope.listOrden.length ; i++){
            actualizarStatusOrden($scope.listOrden[i]._id,"O");//O es acordado
        }
        $http.get(url_server+'junta/actualizarStatus', { params : {junta: id, status:'O'}}).success(function(datos){//A ---> Acordado --- cafe
            if(datos.type){
                var notification = document.querySelector('.mdl-js-snackbar');
                var data = {
                    message: "Junta acordada",
                    timeout: 4000
                };
                notification.MaterialSnackbar.showSnackbar(data);
                //$().toastmessage('showSuccessToast', "Junta Acordada");
                getJuntaUnica();
            }
        })
    }
    function actualizarStatusOrden(id,status){
        $http.get(url_server+'orden/actualizarStatus', { params : {orden: id, status:status}}).success(function(datos){//A ---> Acordado --- cafe
            if(datos.type){
                console.log("actualizado con exito");
            }
        });   
    }
	getDirectivos();
	function getDirectivos() {
        //var invitados_lista = $scope.junta.JUTINV;
        $http.get(url_server+"user/usuario/2/"+empresa).success(function(response) {
            if(response.type) { // Si nos devuelve un OK la API...
                $scope.directivos = response.data;
            }
        })
        $http.get(url_server+"user/usuario/1/"+empresa).success(function(response) {
            if(response.type) { // Si nos devuelve un OK la API...
                $scope.director = response.data;
            }
        });
    }
	function getOrdenUnica() {
        //alert(idO);
        if(idO != undefined){
        	//alert("idO es no undefined")
            //para obtener los datos de un punto de la orden del dia en especifico
            $http.get(url_server+"orden/find/"+idO).success(function(response) {
                if(response.type) { // Si nos devuelve un OK la API...
                    //alert("response "+response.data[0].ORDCON)
                    if(response.data[0] != undefined){
                        //alert("no tiene nada")
                        $scope.orden = response.data[0];
                        id = response.data[0].ORDJUN;
                        //alert("junta = "+id)
                        getJuntaUnica();
                    }
                    //$scope.orden = response.data[0];
                    //getDirectivos();
                    //getJuntas();
                }else{
                    console.log("ERROR en getOrdenUnica")
                }
            });
        }
        if(id != undefined){
        	//alert("es no undefined")
            //para obtener toda la orden del dia (todos los puntos de la orden del dia) de una junta
            $http.get(url_server+"orden/byJunta/"+id).success(function(response) {
                if (response.status == "OK") {
                    //tamanio = response.data.length;
                    $scope.listOrden = response.data;
                    lista_ordenes = response.data;
                }
                getAcuerdos($scope.listOrden)
                
            });
		}
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
        
        //Método para obtener información de una junta específica
        function getJuntaUnica() {
            //alert("getJuntaUnica s");
            $http.get(url_server+"junta/find/"+id).success(function(response) {
                if(response.type) { // Si nos devuelve un OK la API...
                    $scope.junta = response.data[0];
                }
            });
        }

        function getAcuerdos(datos){
        	$http.get(url_server+"acuerdo/listar/"+empresa).success(function(response){
				var acuerdos_orden = [];
				for (var i = 0; i < datos.length ; i++) {
					for (var j = 0; j < response.data.length; j++) {
						if(response.data[j].ACUPUN == datos[i]._id){
							acuerdos_orden.push(response.data[j]);
						}
					}
				};
				$scope.allAcuerdosByEmpresa = acuerdos_orden;
			});
        }
        
        function getAcuerdoByOrden(){
        	//alert("getAcuerdoByOrden");
        	if(idO != undefined){
	        	$http.get(url_server+"acuerdo/findByOrden/"+idO).success(function(response){
					if (response.type) {
						if (response.data == 0) {
							nuevaClave = 1;
						}else{
							nuevaClave = getNewIndice(response.data);
						}
						$scope.acuerdoByOrden = response.data;
						//alert("nuevaClave "+nuevaClave+" scope "+$scope.acuerdoByOrden);
						$scope.consecutivo = nuevaClave;
					}else{
						console.log("Error en getAcuerdoByOrden");
					}			
				});
	        }
        }

        function getAcuerdoByJunta(){
        	//alert("getAcuerdoByJunta");
        	$http.get(url_server+"acuerdo/findByJunta/"+id).success(function(response){
        		if (response.type) {
        			//alert("response "+response.data+" tam "+response.data.length);
        			$scope.tamAcuerdosByJunta = response.data.length;
        		}else{
        			console.log("Error en getAcuerdoByJunta");
        		}
			});
        }

        //funcion que actualiza los consectuivos de los acuerdos cuando uno es eliminado
        function recorrerConsecutivo(){
            //var idJunta = $scope.junta._id;
            //alert("recorrerConsecutivo ---> "+idO);
            $http.get(url_server+"acuerdo/findByOrden/"+idO).success(function(response){
                //alert("entro")
                var datos = response.data;
                var indices = [];
                var tam = response.data.length;
                if(tam > 0){
                    var j = 0;
                    for( j = 0 ; j < tam ; j++){
                        //indices.push(datos[j].ORDCON);1434
                        indices.push(datos[j].ACUCON);
                    }
                    //alert("indices "+indices)
                    if(tam == 1){
                        if(datos[0].ACUCON != 1){
                            updateIndices(datos[0],1);
                        }
                    }else{
                        var index = 0;
                        var bandera = 0;
                        for(j = 0 ; j < tam ; j++){
                            index = indices.indexOf((j+1));
                            if(index < 0){
                                //alert("No encontro a "+(j+1)+" consecutivo "+datos[j].ORDCON)
                                updateIndices(datos[j],(j+1));
                                bandera = 1;
                            }else{
                                //alert("Eencontro a "+(j+1)+" consecutivo "+datos[j].ORDCON)
                                if(bandera == 1){
                                    //alert("se empezará actualizar todo man!")
                                    updateIndices(datos[j],(j+1));
                                }
                            }
                        }
                    }   
                }
                getAcuerdoByOrden();
                getOrdenUnica();
            });
        }

        function updateIndices(datos,ind){
            //alert("updateIndices "+datos._id+" ind "+ind);
            $http.get(url_server+'acuerdo/actualizarConsecutivo', { params : {acuerdo: datos._id, consec:ind}}).success(function(datos){//A ---> Acordado --- cafe
                if(datos.type){
                    console.log("Consecutivo Actualizado_A (Y)")
                    /*var notification = document.querySelector('.mdl-js-snackbar');
                    var data = {
                        message: "Junta cancelada",
                        timeout: 4000
                    };
                    notification.MaterialSnackbar.showSnackbar(data);*/
                }
            });
        }

        function getNewIndice(data){
            var contador = 1;
            var nuevaClave = -1;
            var booleano = true;
            var bandera;
            while(booleano){
                bandera = 0;
                for (var i = 0; i < data.length ; i++) {
                    if(data[i].ACUCON == contador){
                    //if(data[i].ORDNUM == contador){
                        bandera = 1;
                    }
                }
                if (bandera == 1) {
                    contador++;
                    booleano = true;
                }else{
                    booleano = false;
                }
            }
            return contador;
        }
}]);
