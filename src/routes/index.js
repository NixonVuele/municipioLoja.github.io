import { Router } from "express";
import bodyParser from "body-parser"

const router = Router();

router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());

router.get("/", (req, res) => {
  res.render("home", { title: "Presupuesto Final" });
});


router.get("/calculadora", (req, res) => {
  res.render("calculadora", { title: "Hosting" });
});
router.get("/panelEconomico", (req, res) => {
  res.render("panelEconomico", { title: "Panel Economico" });
});
router.get("/panelAmbiental", (req, res) => {
  res.render("panelAmbiental", { title: "Panel Ambiental" });
});

router.get("/panelSocial", (req, res) => {
  res.render("panelSocial", { title: "Panel social" });
});

router.get("/panelInstitucional", (req, res) => {
  res.render("panelInstitucional", { title: "Panel Institucional" });
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


router.get("/dashboard", (req, res) => {
  res.render("dashboard", { title: "Panel control" });
});

router.get("/calculadoraVariables", (req, res) => {
  res.render("calculadoraVariables", { title: "Hosting" });
});


router.get("/login", (req, res) => {
  res.render("login", { title: "Registro" });
});

router.get("/home", (req, res) => {
  res.render("home", { title: "Home" });
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
