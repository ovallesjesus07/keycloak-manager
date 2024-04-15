import * as express from "express";
import session from 'express-session';
import Keycloak, { Grant } from 'keycloak-connect';
import axios, { AxiosResponse } from 'axios';

interface KeycloakConfig {
  realm: string;
  'auth-server-url': string;
  'ssl-required': string;
  resource: string;
  'bearer-only': boolean;
  'confidential-port': number;
  credentials: {
    secret: string;
  };
}

interface Config {
  secret: string;
  keycloakConfig: KeycloakConfig;
}

export default class KeycloakManager {
  private app: express.Application;
  private keycloak: Keycloak.Keycloak;
  private grant: Keycloak.Grant;
  private accessToken: string;
  private nameEmployee: string;
  private isVerify: boolean = true;

  constructor(private config: Config) {
    this.app = express();
    
    this.app.use(session({ secret: this.config.secret }));

    this.keycloak = new Keycloak({ store: session }, this.config.keycloakConfig);

    this.app.use(this.keycloak.middleware());
  }

  async authenticateAndObtainGrant(username: string, password: string): Promise<Grant | undefined> {
    try {
      this.grant = await this.keycloak.grantManager.obtainDirectly(username, password);
      if(this.grant.access_token){
        this.accessToken = this.grant.access_token['token'];
      }
      await this.validateToken(this.accessToken);
      await this.userInfo(this.accessToken);
      return this.grant;
    } catch (error) {
      this.isVerify = false;
      console.error('Error obteniendo el grant:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<Grant | undefined> {
    try {
      this.grant = await this.keycloak.grantManager.ensureFreshness(this.grant);
      if(this.grant.access_token){
        this.accessToken = this.grant.access_token['token'];
      }
      await this.validateToken(this.accessToken);
      return this.grant;
    } catch (error) {
      console.error('Error al refrescar el token:', error);
    }
  }

  async validateToken(token: string): Promise<boolean | undefined> {
    try {
      const res = await this.keycloak.grantManager.validateAccessToken(token);
      if (!res) {
        await this.refreshToken();
      }
      console.log('Validate is', this.isVerify);
      return true;
    } catch (error) {
      this.isVerify = false;
      console.error('Error al validar el token:', error);
    }
  }

  async userInfo(token: string): Promise<unknown> {
    try {
      const res = await this.keycloak.grantManager.userInfo(token);
      if(res){
        this.nameEmployee = res['name'];
      }
      return res;
    } catch (error) {
      console.error('Error al extraer información:', error);
    }
  }

  async getRolesByUser(userId, token): Promise<unknown> {
    try {
        const url = `${this.config.keycloakConfig["auth-server-url"]}/admin/realms/${this.config.keycloakConfig.realm}/users/${userId}/role-mappings/clients/${this.config.keycloakConfig.resource}`;

        const headers = {
            Authorization: `Bearer ${token}`
        };

        // Realizar la solicitud GET con el encabezado de autorización
        const respuesta: AxiosResponse<unknown> = await axios.get(url, { headers });

        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        throw error;
    }
  }
}
