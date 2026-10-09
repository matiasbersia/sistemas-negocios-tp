const fs = require('fs');
const path = require('path');

const rutaEventos = path.join(__dirname, '..', 'eventos.json');


// =====================================================
// FUNCIÓN PARA CREAR LA FECHA Y HORA DE UN EVENTO
// =====================================================

const crearFecha = (evento) => {

    const [año, mes, dia] = evento.fecha.split('-').map(Number);

    let hora = 0;
    let minutos = 0;

    if (evento.horario) {

        const partesHora = evento.horario.split(':');

        hora = Number(partesHora[0]);
        minutos = Number(partesHora[1]);

    }

    return new Date(
        año,
        mes - 1,
        dia,
        hora,
        minutos
    );

};


// =====================================================
// ELIMINAR AUTOMÁTICAMENTE LOS EVENTOS PASADOS
// =====================================================

const eliminarEventosPasados = (eventos) => {

    const ahora = new Date();

    return eventos.filter(evento => {

        const fechaEvento = crearFecha(evento);

        return fechaEvento >= ahora;

    });

};


// =====================================================
// CREAR EVENTO
// =====================================================

const crearEvento = (req, res) => {

    const nuevoEvento = req.body;

    fs.readFile(rutaEventos, 'utf8', (error, datos) => {

        if (error) {

            return res.status(500).json({
                mensaje: 'Error al leer eventos.json'
            });

        }

        const eventos = JSON.parse(datos);

        nuevoEvento.id = eventos.length + 1;

        eventos.push(nuevoEvento);

        fs.writeFile(
            rutaEventos,
            JSON.stringify(eventos, null, 2),
            (error) => {

                if (error) {

                    return res.status(500).json({
                        mensaje: 'Error al guardar el evento'
                    });

                }

                res.status(201).json({
                    mensaje: 'Evento creado correctamente',
                    evento: nuevoEvento
                });

            }
        );

    });

};


// =====================================================
// OBTENER EVENTOS
// =====================================================

const obtenerEventos = (req, res) => {

    fs.readFile(rutaEventos, 'utf8', (error, datos) => {

        if (error) {

            console.log(error);

            return res.status(500).json({
                mensaje: 'Error al leer eventos.json'
            });

        }

        const eventos = JSON.parse(datos);


        // Eliminamos los eventos que ya pasaron

        const eventosActualizados = eliminarEventosPasados(eventos);


        // Si se eliminó algún evento,
        // actualizamos eventos.json

        if (eventosActualizados.length !== eventos.length) {

            fs.writeFile(
                rutaEventos,
                JSON.stringify(eventosActualizados, null, 2),
                (error) => {

                    if (error) {

                        return res.status(500).json({
                            mensaje: 'Error al actualizar eventos.json'
                        });

                    }

                    res.json(eventosActualizados);

                }
            );

        } else {

            res.json(eventosActualizados);

        }

    });

};


// =====================================================
// MODIFICAR EVENTO
// =====================================================

const modificarEvento = (req, res) => {

    const id = Number(req.params.id);

    const datosModificados = req.body;

    fs.readFile(rutaEventos, 'utf8', (error, datos) => {

        if (error) {

            return res.status(500).json({
                mensaje: 'Error al leer eventos.json'
            });

        }

        const eventos = JSON.parse(datos);

        const indice = eventos.findIndex(evento => evento.id === id);

        if (indice === -1) {

            return res.status(404).json({
                mensaje: 'Evento no encontrado'
            });

        }

        eventos[indice] = {
            ...eventos[indice],
            ...datosModificados,
            id: id
        };

        fs.writeFile(
            rutaEventos,
            JSON.stringify(eventos, null, 2),
            (error) => {

                if (error) {

                    return res.status(500).json({
                        mensaje: 'Error al modificar el evento'
                    });

                }

                res.json({
                    mensaje: 'Evento modificado correctamente',
                    evento: eventos[indice]
                });

            }
        );

    });

};


// =====================================================
// ELIMINAR EVENTO MANUALMENTE
// =====================================================

const eliminarEvento = (req, res) => {

    const id = Number(req.params.id);

    fs.readFile(rutaEventos, 'utf8', (error, datos) => {

        if (error) {

            return res.status(500).json({
                mensaje: 'Error al leer eventos.json'
            });

        }

        const eventos = JSON.parse(datos);

        const indice = eventos.findIndex(evento => evento.id === id);

        if (indice === -1) {

            return res.status(404).json({
                mensaje: 'Evento no encontrado'
            });

        }

        const eventoEliminado = eventos[indice];

        eventos.splice(indice, 1);

        fs.writeFile(
            rutaEventos,
            JSON.stringify(eventos, null, 2),
            (error) => {

                if (error) {

                    return res.status(500).json({
                        mensaje: 'Error al eliminar el evento'
                    });

                }

                res.json({
                    mensaje: 'Evento eliminado correctamente',
                    evento: eventoEliminado
                });

            }
        );

    });

};


// =====================================================
// BUSCAR EVENTO
// =====================================================

const buscarEvento = (req, res) => {

    const nombre = req.params.nombre.toLowerCase();

    fs.readFile(rutaEventos, 'utf8', (error, datos) => {

        if (error) {

            return res.status(500).json({
                mensaje: 'Error al leer eventos.json'
            });

        }

        const eventos = JSON.parse(datos);


        // Primero eliminamos los eventos pasados

        const eventosActualizados = eliminarEventosPasados(eventos);


        // Si se eliminó algún evento,
        // guardamos el JSON actualizado

        const guardarCambios = () => {

            const resultados = eventosActualizados.filter(evento =>
                evento.nombre.toLowerCase().includes(nombre)
            );

            res.json(resultados);

        };


        if (eventosActualizados.length !== eventos.length) {

            fs.writeFile(
                rutaEventos,
                JSON.stringify(eventosActualizados, null, 2),
                (error) => {

                    if (error) {

                        return res.status(500).json({
                            mensaje: 'Error al actualizar eventos.json'
                        });

                    }

                    guardarCambios();

                }
            );

        } else {

            guardarCambios();

        }

    });

};


// =====================================================
// EXPORTAR
// =====================================================

module.exports = {

    crearEvento,
    obtenerEventos,
    modificarEvento,
    eliminarEvento,
    buscarEvento

};