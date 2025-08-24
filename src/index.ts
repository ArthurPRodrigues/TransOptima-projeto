import express from "express";
import cors from "cors";
import router from "./routes"; // IMPORT CORRETO do default export
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));


// Router é um middleware. NÃO usar parênteses.
// NÃO usar objeto errado. Apenas:
app.use(router);

const PORT = 8080;
app.listen(PORT, () => console.log(`API ouvindo em http://localhost:${PORT}`));
