import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TarjetaComponent } from './tarjeta/tarjeta.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TarjetaComponent,
    MenuComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  contador = 0;
  i = 0;
  eventoSeleccionado: any = null;
  usuario = '';
  contrasena = '';
  admin = false;

  // BUSCAR
  busqueda = '';
  eventosBuscados: any[] | null = null;

  // LISTA GENERAL DE EVENTOS
  listaEventos: any[] = [];

  ngOnInit() {
    this.cargarEventos();
  }

  // Carga los eventos generales al iniciar la app
  cargarEventos() {
    fetch('http://https://sistemas-negocios-tp.onrender.com/eventos')
      .then(respuesta => respuesta.json())
      .then(datos => {
        this.listaEventos = datos;
      })
      .catch(error => {
        console.error('Error al cargar los eventos:', error);
      });
  }

  recibirDato(evento: any) {
    this.eventoSeleccionado = evento;
    this.i = 1;
  }

  cerrar() {
    this.i = 0;
    this.eventoSeleccionado = null;
  }

  cerrar_menu() {
    this.contador = 0;
  }

  abrir_menu() {
    if (this.contador == 1) {
      this.contador = 0;
    } else {
      this.contador = 1;
    }
  }

  abrirBuscar() {
    this.busqueda = '';
    this.eventosBuscados = null;
    this.i = 2;
  }

  buscarEvento() {
    console.log('Texto buscado:', this.busqueda);
    if (this.busqueda.trim() === '') {
      this.eventosBuscados = null;
      return;
    }

    const url =
      `http://https://sistemas-negocios-tp.onrender.com/eventos/buscar/${encodeURIComponent(this.busqueda.trim())}`;

    fetch(url)
      .then(respuesta => respuesta.json())
      .then(datos => {
        console.log('Resultados recibidos:', datos);
        // Filtramos los resultados de la búsqueda para que no muestre los vencidos
        this.eventosBuscados = datos.filter((evento: any) => this.eventoVigente(evento.fecha));
      })
      .catch(error => {
        console.error('Error en la búsqueda:', error);
        this.eventosBuscados = [];
      });
  }

  iniciarSesion() {
    if (this.usuario == 'admin' && this.contrasena == '12345') {
      console.log('Inicio de sesión correcto');
      this.admin = true;
      this.contador = 0;
    } else {
      alert('Cuenta incorrecta. Verifique el usuario y la contraseña.');
    }
  }

  cerrarAdmin() {
    this.admin = false;
  }

  abrirInicio() {
    this.i = 0;
    this.busqueda = '';
    this.eventosBuscados = null;
  }

  // --- FUNCIÓN PARA VALIDAR SI LA FECHA ESTÁ VIGENTE ---
  eventoVigente(fechaEvento: string): boolean {
    if (!fechaEvento) return true; // Si no tiene fecha, lo dejamos por seguridad

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Reseteamos las horas para comparar solo días

    // Asume formato 'DD/MM/YYYY' (ej: '09/10/2026')
    const partes = fechaEvento.split('/');
    if (partes.length !== 3) return true;

    const dia = Number(partes[0]);
    const mes = Number(partes[1]) - 1; // Los meses en JS van de 0 a 11
    const anio = Number(partes[2]);

    const fechaParsed = new Date(anio, mes, dia);

    // Retorna true si la fecha del evento es hoy o en el futuro
    // Retorna false si la fecha ya pasó
    return fechaParsed >= hoy;
  }

  // Getter para obtener solo los eventos que no han expirado en la lista principal
  get eventosVigentes() {
    return this.listaEventos.filter(evento => this.eventoVigente(evento.fecha));
  }
}