import { Router } from "express";

import order from "./middlewares/order.js";
import hateoas from "./middlewares/hateoas.js";
import handler from "./middlewares/handlers.js";

import InternalServerError from "./routes/helper/500.js"
import NotFound from "./routes/helper/404.js";

import TranslationRouter from "./routes/translationRouter.js";


const routes = Router()
routes.use(order);
routes.use(hateoas);
routes.use(handler);

routes.use("/api/translations", TranslationRouter);

routes.use(InternalServerError);
routes.use(NotFound);

export default routes;
