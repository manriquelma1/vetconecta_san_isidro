# VetconectaSanIsidro

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.6.

## Roles y gestion de citas (HU-07)

Esta aplicacion es un prototipo local: la sesion y las citas se guardan en
`localStorage`, sin backend ni validacion real de contrasenas. Los guards y los
controles del servicio organizan el flujo de la demo; no sustituyen la
autenticacion ni la autorizacion en un servidor.

| Perfil | Acceso de demostracion | Inicio |
| --- | --- | --- |
| Personal veterinario | `personal@vetconecta.pe` y cualquier clave no vacia | `/gestion-citas` |
| Propietario | Cualquier otro correo valido y cualquier clave no vacia | `/dashboard` |

El boton de Google conserva su cuenta ficticia de propietario. Para cambiar de
cuenta, abrir Mi perfil y cerrar sesion. El rol se conserva al recargar la pagina.

El personal tiene acceso a Gestion de citas desde el menu de escritorio y movil.
Puede consultar fecha, hora, mascota, propietario y servicio; filtrar por fecha
(hoy por defecto), ver todas las fechas y cambiar el estado a Pendiente, Atendida
o Cancelada. Cancelar conserva el registro y libera el horario. No se permite
reactivar una cita si su horario ya esta ocupado por otra reserva.

Las nuevas citas se asocian al correo y nombre de la sesion del propietario.
Agenda, Dashboard y los recordatorios de citas muestran solo sus citas. Las citas
anteriores que no tienen propietario se conservan en la vista del personal como
"Sin propietario registrado"; no se asignan automaticamente a otra cuenta.
Los datos de mascotas, recetas e historial del prototipo siguen siendo compartidos.

Para comprobar el flujo, registrar una cita como propietario, cerrar sesion,
ingresar con la cuenta del personal y consultar su fecha en Gestion de citas.
Las pruebas de roles, rutas, estados y filtros se ejecutan con `npm test -- --watch=false`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
