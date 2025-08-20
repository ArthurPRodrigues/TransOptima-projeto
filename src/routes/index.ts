import { Router } from "express";
import { transportadoras } from "./transportadoras";
import { documentos } from "./documentos";
import { frete } from "./frete";

export const routes = Router();
routes.use(transportadoras);
routes.use(documentos);
routes.use(frete);