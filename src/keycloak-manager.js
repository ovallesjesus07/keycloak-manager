"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var express_session_1 = require("express-session");
var keycloak_connect_1 = require("keycloak-connect");
var axios_1 = require("axios");
var KeycloakManager = /** @class */ (function () {
    function KeycloakManager(config) {
        this.config = config;
        this.isVerify = true;
        this.app = express();
        this.app.use(express_session_1({ secret: process.env.AUTH_SECRET }));
        const setAy = {
            realm: process.env.KEYCLOAK_REALM,
            'auth-server-url': process.env.KEYCLOAK_URL,
            'ssl-required': 'external',
            resource: process.env.AUTH_CLIENT_ID,
            'bearer-only': false,
            'confidential-port': 0,
            credentials: {
                secret: process.env.AUTH_SECRET
            }
        };
        this.keycloak = new keycloak_connect_1({ store: express_session_1 }, setAy);
        this.app.use(this.keycloak.middleware());
    }
    KeycloakManager.prototype.authenticateAndObtainGrant = function (username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.grant = yield this.keycloak.grantManager.obtainDirectly(username, password);
                this.accessToken = this.grant.access_token['token'];
                yield this.validateToken(this.accessToken);
                yield this.userInfo(this.accessToken);
                return this.grant;
            }
            catch (error) {
                this.isVerify = false;
                console.error('Error obteniendo el grant:', error);
                throw error;
            }
        });
    };
    KeycloakManager.prototype.refreshToken = function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.grant = yield this.keycloak.grantManager.ensureFreshness(this.grant);
                this.accessToken = this.grant.access_token['token'];
                this.roleName = this.grant.access_token['clientId'];
                yield this.validateToken(this.accessToken);
                return this.grant;
            }
            catch (error) {
                console.error('Error al refrescar el token:', error);
            }
        });
    };
    KeycloakManager.prototype.validateToken = function (token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.keycloak.grantManager.validateAccessToken(token);
                if (!res) {
                    yield this.refreshToken();
                }
                return res;
            }
            catch (error) {
                this.isVerify = false;
                console.error('Error al validar el token:', error);
            }
        });
    };
    KeycloakManager.prototype.userInfo = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var res, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.keycloak.grantManager.userInfo(token)];
                    case 1:
                        res = _a.sent();
                        if (res) {
                            this.nameEmployee = res['name'];
                        }
                        return [2 /*return*/, res];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Error al extraer información:', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    KeycloakManager.prototype.getRolesByUser = function (userId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = process.env.KEYCLOAK_URL + '/admin/realms/' + process.env.KEYCLOAK_REALM + '/users/' + userId + '/role-mappings/clients/' + process.env.AUTH_NRO_CLIENT;
                const headers = {
                    Authorization: `Bearer ${token}`
                };
                // Realizar la solicitud GET con el encabezado de autorización
                const respuesta = yield axios_1.default.get(url, { headers });
                return respuesta.data[0];
            }
            catch (error) {
                console.error('Error al obtener los datos:', error);
                throw error;
            }
        });
    };
    return KeycloakManager;
}());
exports.default = KeycloakManager;
