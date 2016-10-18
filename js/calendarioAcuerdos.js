var Script = function () {
    /* initialize the external events
     -----------------------------------------------------------------*/
    $('#external-events div.external-event').each(function() {
        // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
        // it doesn't need to have a start or end
        var eventObject = {
            title: $.trim($(this).text()) // use the element's text as the event title
        };
        // store the Event Object in the DOM element so we can get to it later
        $(this).data('eventObject', eventObject);
        // make the event draggable using jQuery UI
        $(this).draggable({
            zIndex: 999,
            revert: true,      // will cause the event to go back to its
            revertDuration: 0  //  original position after the drag
        });
    });
    /* initialize the calendar
     -----------------------------------------------------------------*/
    var datos;
    var url_server = 'http://159.203.128.165/'
    //var url_server = 'http://159.203.128.165:8080/'
    //var url_server = 'http://127.0.0.1:8080/'
    var user = localStorage.getItem("usuario")///nuevo
    var usuario = JSON.parse(user);//NUEVO
    var empresa = usuario.EMPIDC;
    $.ajax({
        method: "GET",
        url: url_server+"acuerdo/listar/"+empresa,
      }).done(function( resultado ) {  
        var acuerdos = [];
        resultado.data.forEach(function(o){
            if(o.ACUEMP == usuario._id){
                var fecha = o.ACUTIM.split("/");
                var aux = {
                    title: "Acuerdo: "+o.ACUDES,
                    start: fecha[2]+"-"+fecha[1]+"-"+fecha[0],
                    url: "acuerdo.html?id="+o._id
                }
                acuerdos[acuerdos.length] = aux;
            }
        })
        $.ajax({
            method: "GET",
            url: url_server+"invit/findInvitados/"+usuario._id,
          }).done(function( response ) {  
            response.data.forEach(function(o){
                if(o.INVEMP == usuario._id){
                    var fecha = o.INVFEC.split("/");
                    var aux = {
                        title: "Junta: "+o.INVJNO,
                        start: fecha[2]+"-"+fecha[1]+"-"+fecha[0],
                        url: "junta.html?id="+o.INVJUN
                    }
                    acuerdos[acuerdos.length] = aux;
                }
            })
            var eventos = acuerdos
            $('#calendar').fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,basicWeek,basicDay'
                },
                editable: true,
                droppable: true, // this allows things to be dropped onto the calendar !!!
                drop: function(date, allDay) { // this function is called when something is dropped

                    // retrieve the dropped element's stored Event Object
                    var originalEventObject = $(this).data('eventObject');

                    // we need to copy it, so that multiple events don't have a reference to the same object
                    var copiedEventObject = $.extend({}, originalEventObject);

                    // assign it the date that was reported
                    copiedEventObject.start = date;
                    copiedEventObject.allDay = allDay;

                    // render the event on the calendar
                    // the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
                    $('#calendar').fullCalendar('renderEvent', copiedEventObject, true);

                    // is the "remove after drop" checkbox checked?
                    if ($('#drop-remove').is(':checked')) {
                        // if so, remove the element from the "Draggable Events" list
                        $(this).remove();
                    }

                },
                events: eventos
            });
        });
      });
}();
