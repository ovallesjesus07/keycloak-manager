# Librería para integración con Keycloak (keycloak-connect)
  
# Descripción

Librería NPM para la integración con cualquier aplicativo basado en Keycloak

Para la integración desde JS a cualquier aplicativo basado en [KEYCLOAK](https://www.keycloak.org/) podremos utilizar la libreria [KEYCLOAK-MANAGER](https://www.npmjs.com/package/keycloak-manager)

La librería KeycloakManager facilita la gestión de autenticación y autorización utilizando Keycloak en aplicaciones Express.js. Permite autenticar usuarios, obtener tokens de acceso, refrescar tokens y validar la integridad de los tokens. Además, proporciona funciones para obtener información del usuario y roles asociados al usuario por ClientId.

Se inicializa con una configuración que incluye la URL del servidor de autenticación Keycloak, el reino, y otros parámetros relevantes. Luego, ofrece métodos para autenticar usuarios mediante nombre de usuario y contraseña, así como para refrescar tokens de acceso. También incluye funciones para validar tokens y obtener información del usuario y sus roles.

La librería utiliza las dependencias express, express-session, keycloak-connect, y axios para realizar solicitudes HTTP a la API de Keycloak. Con estas funcionalidades, facilita la integración de la autenticación basada en Keycloak en aplicaciones Express.js.

# Integración
1. Debemos instalar la libreria [KEYCLOAK-MANAGER](https://www.npmjs.com/package/keycloak-manager) a nuestro proyecto, podemos hacerlo mediante el comando:

```markdown
npm install keycloak-manager
```

2. Una vez instalada la libreria, debemos importarla en nuestro proyecto:

```markdown
import { KeycloakManager } from 'keycloak-manager';
```

3. Debemos configurar nuestras variables de entorno en nuestro enviroment (.env)

```markdown
AUTH_SECRET='CLIENT SECRET'
AUTH_CLIENT_ID='CLIENT ID NAME'
AUTH_NRO_CLIENT='CLIENT ID NUMBER CODE'
KEYCLOAK_REALM=REINO
KEYCLOAK_URL='URL DE NUESTRO APLICATIVO BASADO EN KEYCLOAK'
KEYCLOAK_USER="USUARIO AGREGADO AL CLIENT ID PARA APLICAR EL SSO"
KEYCLOAK_PASSWORD="PASSWORD DEL USUARIO AGREGADO AL CLIENT ID PARA APLICAR EL SSO"
```

4. Instanciación de la clase KeycloakManager, se crea un nuevo objeto de la clase KeycloakManager utilizando el operador new. Esto implica asignar espacio en memoria para el objeto y ejecutar el constructor de la clase para inicializar sus propiedades:

```markdown
const keycloakManager = new KeycloakManager();
```
### Autenticación de usuario

5. Autenticación y obtención del token de acceso: Se llama al método authenticateAndObtainGrant de keycloakManager, pasando el nombre de usuario y la contraseña como parámetros (this.username y this.password respectivamente que pueden ser obtenidos por el .env).

```markdown
keycloakManager.authenticateAndObtainGrant(this.username, this.password)
      .then((grant) => {
        console.log('KEYCLOAK-MANAGER: Authentication successful');
        access_token = grant.access_token["token"];
        idUserAuth = grant.access_token["content"].sub;
      })
      .catch((error) => {
        console.error('KEYCLOAK-MANAGER: Authentication failed:', error);
      });
```

Aqui en este paso podemos obtener el access_token, grant, y idUserAuth(Id de usuario) que sera utilizado para listar roles.

El término "grant" se refiere a un objeto que contiene información sobre la autorización que ha sido concedida a una aplicación cliente después de que un usuario ha sido autenticado correctamente. En el contexto de Keycloak y la autenticación OAuth 2.0, un "grant" representa un token de acceso que ha sido emitido por el servidor de autorización después de que un usuario ha proporcionado credenciales válidas y ha dado su consentimiento para que la aplicación acceda a sus recursos protegidos.

El objeto "grant" generalmente contiene información como el token de acceso, información del usuario autenticado y cualquier otro detalle relacionado con la autorización. En el código proporcionado, el "grant" se utiliza para acceder al token de acceso (grant.access_token) y a información adicional del usuario autenticado, como su identificador único (grant.access_token["content"].sub).

### Validar Tóken de acceso

6. Llamada al método validateToken: Se llama al método validateToken de la instancia keycloakManager, pasando el token de acceso (access_token) como parámetro.

```markdown
await keycloakManager.validateToken(access_token)
        .then(res => {
          if(res){
            access_token = res;
            console.log('KEYCLOAK-MANAGER: Token validado');
          } else {
            console.log('KEYCLOAK-MANAGER: Token NO validado');
          }
        }).catch(error => {
          console.log('FAIL - KEYCLOAK-MANAGER: ValidateToken', error);
        });
```

Este metodo devolvera 'false' si no fue validado el token, y devolvera el token en caso de que si ha sido validado el acceso. De igual manera debe agregar el metodo refreshToken del paso 9 para refrescar el token en caso de que haya expirado.

### Obtener información de usuario

7. Llamada al método userInfo: Utiliza await para llamar al método userInfo de la instancia keycloakManager, pasando el token de acceso (access_token) como parámetro.

```markdown
await keycloakManager.userInfo(access_token)
        .then(res => {
          // 'res' contiene un objeto con la informacion del usuario
        }).catch(error => {
          console.log('FAIL - KEYCLOAK-MANAGER: Busqueda de usuario info', error);
        });
```

### Obtener Roles de usuario por ClientId

8. Llamada al método getRolesByUser: Utiliza await para llamar al método getRolesByUser de la instancia keycloakManager, pasando el idUserAuth (identificador único del usuario autenticado) y el access_token (token de acceso) como parámetros.

```markdown
await keycloakManager.getRolesByUser(idUserAuth, access_token)
        .then(res => {
          // 'res' sera el objeto con el rol asignado al usuario por clienId
        }).catch(error => {
          console.log('FAIL - KEYCLOAK-MANAGER: Busqueda de ROLES', error);
        });
```

### Refrescar Grant

9. Llamada al método refreshToken: Utiliza await para llamar al método refreshToken de la instancia keycloakManager. Este método intenta refrescar el token de acceso utilizando el token actual almacenado en la instancia KeycloakManager.

```markdown
 await keycloakManager.refreshToken()
        .then(res => {
        	// 'res' tendra el nuevo grant de session con los datos de autenticacion del usuario
        }).catch(error => {
          console.log('FAIL - KEYCLOAK-MANAGER: ValidateToken', error);
        });
```
