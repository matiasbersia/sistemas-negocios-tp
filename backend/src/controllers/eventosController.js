
const fs = require('fs');
const path = require('path');
const rutaEventos = path.join(__dirname, '..', 'eventos.json');

const rutaTemporal = process.env.VERCEL
    ? path.join('/tmp', 'eventos.json')
    : path.join(__dirname, '..', 'eventos.json');

// =====================================================
// LEER Y GUARDAR EVENTOS
// =====================================================

const leerEventos = () => {
    if (fs.existsSync(rutaTemporal)) {
        return JSON.parse(fs.readFileSync(rutaTemporal, 'utf8'));
    }

    const datos = fs.readFileSync(rutaEventos, 'utf8');
    const eventos = JSON.parse(datos);

    fs.writeFileSync(
        rutaTemporal,
        JSON.stringify(eventos, null, 2),
        'utf8'
    );

    return eventos;
};

const guardarEventos = (eventos) => {
    fs.writeFileSync(
        rutaTemporal,
        JSON.stringify(eventos, null, 2),
        'utf8'
    );
};

// =====================================================
// CREAR FECHA Y HORA DE UN EVENTO
// =====================================================

const crearFecha = (evento) => {
    if (!evento.fecha) {
        return new Date(0);
    }

    const [año, mes, dia] = evento.fecha.split('-').map(Number);
    let hora = 0;
    let minutos = 0;

    if (evento.horario) {
        const partesHora = evento.horario.split(':');
        hora = Number(partesHora[0]) || 0;
        minutos = Number(partesHora[1]) || 0;
    }

    return new Date(año, mes - 1, dia, hora, minutos);
};

// =====================================================
// ELIMINAR EVENTOS PASADOS
// =====================================================

const eliminarEventosPasados = (eventos) => {
    const ahora = new Date();

    return eventos.filter(evento => crearFecha(evento) >= ahora);
};

// =====================================================
// CREAR EVENTO
// =====================================================

const crearEvento = (req, res) => {
    try {
        const nuevoEvento = req.body;

        if (!nuevoEvento || !nuevoEvento.nombre || !nuevoEvento.fecha) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios del evento'
            });
        }

        const eventos = leerEventos();

        const nuevoId = eventos.reduce(
            (mayor, evento) => Math.max(mayor, Number(evento.id) || 0),
            0
        ) + 1;

        const eventoCreado = {
            ...nuevoEvento,
            id: nuevoId
        };

        eventos.push(eventoCreado);
        guardarEventos(eventos);

        return res.status(201).json({
            mensaje: 'Evento creado correctamente',
            evento: eventoCreado
        });
    } catch (error) {
        console.error('Error al crear evento:', error);

        return res.status(500).json({
            mensaje: 'Error al guardar el evento'
        });
    }
};

// =====================================================
// OBTENER EVENTOS
// =====================================================

const obtenerEventos = (req, res) => {
    try {
        const eventos = leerEventos();
        const eventosActualizados = eliminarEventosPasados(eventos);

        if (eventosActualizados.length !== eventos.length) {
            guardarEventos(eventosActualizados);
        }

        return res.json(eventosActualizados);
    } catch (error) {
        console.error('Error al obtener eventos:', error);

        return res.status(500).json({
            mensaje: 'Error al leer los eventos'
        });
    }
};

// =====================================================
// MODIFICAR EVENTO
// =====================================================

const modificarEvento = (req, res) => {
    try {
        const id = Number(req.params.id);
        const eventos = leerEventos();

        const indice = eventos.findIndex(evento => Number(evento.id) === id);

        if (indice === -1) {
            return res.status(404).json({
                mensaje: 'Evento no encontrado'
            });
        }

        eventos[indice] = {
            ...eventos[indice],
            ...req.body,
            id
        };

        guardarEventos(eventos);

        return res.json({
            mensaje: 'Evento modificado correctamente',
            evento: eventos[indice]
        });
    } catch (error) {
        console.error('Error al modificar evento:', error);

        return res.status(500).json({
            mensaje: 'Error al modificar el evento'
        });
    }
};

// =====================================================
// ELIMINAR EVENTO MANUALMENTE
// =====================================================

const eliminarEvento = (req, res) => {
    try {
        const id = Number(req.params.id);
        const eventos = leerEventos();

        const indice = eventos.findIndex(evento => Number(evento.id) === id);

        if (indice === -1) {
            return res.status(404).json({
                mensaje: 'Evento no encontrado'
            });
        }

        const eventoEliminado = eventos[indice];

        eventos.splice(indice, 1);
        guardarEventos(eventos);

        return res.json({
            mensaje: 'Evento eliminado correctamente',
            evento: eventoEliminado
        });
    } catch (error) {
        console.error('Error al eliminar evento:', error);

        return res.status(500).json({
            mensaje: 'Error al eliminar el evento'
        });
    }
};

// =====================================================
// BUSCAR EVENTO
// =====================================================

const buscarEvento = (req, res) => {
    try {
        const nombre = String(req.params.nombre || '').toLowerCase();

        const eventos = leerEventos();
        const eventosActualizados = eliminarEventosPasados(eventos);

        if (eventosActualizados.length !== eventos.length) {
            guardarEventos(eventosActualizados);
        }

        const resultados = eventosActualizados.filter(evento =>
            String(evento.nombre || '').toLowerCase().includes(nombre)
        );

        return res.json(resultados);
    } catch (error) {
        console.error('Error al buscar evento:', error);

        return res.status(500).json({
            mensaje: 'Error al buscar eventos'
        });
    }
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
