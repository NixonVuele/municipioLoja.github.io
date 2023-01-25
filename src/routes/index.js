import { Router } from "express";
import bodyParser from "body-parser"

const router = Router();

router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());

router.get("/", (req, res) => {
  res.render("index", { title: "Presupuesto Final" });
});


router.get("/calculadora", (req, res) => {
  res.render("calculadora", { title: "Hosting" });
});
router.get("/panelPrueba", (req, res) => {
  res.render("panelPrueba", { title: "Insertar Data" });
});

/**RECUPERSA LOS DATOS*/
router.post("/submit", (req, res) => {
  const a1 = req.body.inputA1;
  const a2 = req.body.inputA2;
  console.log(a1);
  console.log(a2);
  console.log("Ya envie los datos")
  
  res.redirect("/")
});
router.get("/ingreso", (req, res) => {
  res.render("ingreso", { title: "Insertar Data" });
});

router.get("/calculadoraVariables", (req, res) => {
  res.render("calculadoraVariables", { title: "Hosting" });
});

router.get("/contactos", (req, res) => {
  res.render("contacto", { title: "Hosting" });
});


router.get("/login", (req, res) => {
  res.render("login", { title: "Registro" });
});

router.get("/registro", (req, res) => {
  res.render("registro", { title: "Registro" });
});


router.get("/nuevaContrasena", (req, res) => {
  res.render("nuevaContrasena", { title: "Nueva contraseña" });
});

router.get("/panelControl", (req, res) => {
  res.render("panelControl", { title: "Nueva contraseña" });
});
router.get("/carga", (req, res) => {
  res.render("carga", { title: "Nueva contraseña" });
});
router.get("/visualizacion", (req, res) => {
  res.render("visualizacion", { title: "Nueva contraseña" });
});

router.get("/recuperarContrasena", (req, res) => {
  res.render("recuperarContrasena", { title: "Recuperar Contraseña" });
});

export default router;
