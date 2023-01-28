import { Router } from "express";
import bodyParser from "body-parser";
import fs from "fs";

const router = Router();

router.use(bodyParser.urlencoded({ extended: true }));
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


/** INGRESO LOGIN*/
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Aqui verifica si el usuario y contraseña son correctos
  if (username === "lili" && password === "1234") {
    //Redirige al dashboard
    res.redirect("/dashboard");
  } else {
    // Envía un mensaje de error al cliente
    res.status(401).send('Nombre de usuario o contraseña incorrectos');
  }
});





/**RECUPERSA LOS DATOS DE FORMULARIOS*/
router.post("/panelAmbiental", (req, res) => {
  let listaAmb = []
  for (let i = 1; i <= 25; i++) {
    const indAmb = `a${i}`;
    const value = req.body[`inputA${i}`];
    console.log(indAmb, value);
    listaAmb.push({ indAmb: value });
  }
  console.log("Se guardo Ind ambiental")
  console.log(listaAmb)
  res.redirect("/panelAmbiental")
});


/*   DATOS ECONOMICOS */
router.post("/panelEconomico", (req, res) => {
  let listaEco = []
  for (let i = 1; i <= 13; i++) {
    const indEco = `e${i}`;
    const value = req.body[`inputE${i}`];
    console.log(indEco, value);
    listaEco.push({ indEco: value });
  }
  console.log("Se guardo Ind economico")
  console.log(listaEco)
  res.redirect("/panelEconomico")
});

/*router.post("/panelEconomico", (req, res) => {
  let listaEco = []
  for (let i = 1; i <= 12; i++) {
    const indEco = `e${i}`;
    let value = req.body[`inputE${i}`];
    // Utilizar expresión regular para validar que el valor contenga decimales
    if (!value.match(/^\d+(\.\d*)?$/)) {
      console.log("Valor no valido, debe ser numerico con decimales");
      return res.status(400).send("Por favor ingrese un valor decimal válido");
    } else
      console.log(indEco, value);
    listaEco.push({ indEco: value });
  }
  console.log("Ya envie los datos")
  console.log(listaEco)
  res.redirect("/panelEconomico")
}); */

/*   DATOS INSTITUCIONALES */

router.post("/panelInstitucional", (req, res) => {
  let listaInst = []
  for (let i = 1; i <= 11; i++) {
    const indInst = `i${i}`;
    const value = req.body[`inputI${i}`];
    console.log(indInst, value);
    listaInst.push({ indInst: value });
  }
  console.log("Se guardo Ind Institucional")
  console.log(listaInst)
  res.redirect("/panelInstitucional")
});


/*   DATOS SOCIALES */


router.post("/panelSocial", (req, res) => {
  let listaSoc = []
  for (let i = 1; i <= 19; i++) {
    const indSoc = `s${i}`;
    const value = req.body[`inputS${i}`];
    console.log(indSoc, value);
    listaSoc.push({ indSoc: value });
  }
  console.log("Se guardo Ind social")
  console.log(listaSoc)
  res.redirect("/panelSocial")
});

/*AUTENTICACION D ELOGIN */

router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // Aqui verifica si el usuario y contraseña son correctos
  if (email === "llpuchaicela@gmail.com" && password === "1234") {
    //Redirige al dashboard
    console.log("datos correctos")
    res.redirect("/dashboard");
  } else {
    // Envía un mensaje de error al cliente
    res.status(401).send('Email o contraseña incorrectos');
  }
});

/**-------------------------- REGISTRO----------NO VALE AUN------------------------ */

/* VERIFICAR CAMPOS LLENOS */


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

router.get("/contactos", (req, res) => {
  res.render("contactos", { title: "Nueva contraseña" });
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
