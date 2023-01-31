import { Router } from "express";
import bodyParser from "body-parser";
import fs from "fs";

const router = Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get("/", (req, res) => {
  res.render("home", { title: "Presupuesto Final" });
});

router.get("/indicadores", (req, res) => {
  res.render("indicadores", { title: "Hosting" });
});
router.get("/configuracion", (req, res) => {
  res.render("configuracion", { title: "Hosting" });
});


router.get("/varAmb", (req, res) => {
  res.render("varAmb", { title: "Hosting" });
});

router.get("/varEco", (req, res) => {
  res.render("varEco", { title: "Hosting" });
});

router.get("/varInst", (req, res) => {
  res.render("varInst", { title: "Hosting" });
});

router.get("/varSoc", (req, res) => {
  res.render("varSoc", { title: "Hosting" });
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

router.post("/register", (req, res) => {
  
  const { name, email, password } = req.body;

  console.log(name, email, password);
  // Hashea la contraseña antes de guardarla en la base de datos
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Crea una consulta para insertar los datos en la tabla
  const query = `INSERT INTO usuarios (name, email, contrasena) VALUES ('${name}', '${email}', '${hashedPassword}')`;
  
  // Ejecuta la consulta
  connection.query(query, (error, results) => {
      if (error) {
        console.log(error)
      } else {
        console.log("todo esta bien :)");
      }
  });
  res.redirect("/login")
  });


/** INGRESO LOGIN*/
router.post("/login", (req, res) => {

  const { email, password } = req.body;

  const query = `SELECT * FROM usuarios WHERE email = '${email}'`;

  connection.query(query, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      if (results.length > 0) {
        const user = results[0];

        const isPasswordValid = bcrypt.compareSync(password, user.contrasena);
        if (isPasswordValid) {
          res.redirect("/dashboard");
        } else {
          res.send("Contraseña incorrecta");
        }
      } else {
        res.send("Usuario no encontrado");
      }
    }
  });
});

router.post("/reset", (req, res) => {
  
  const {email} = req.body;
  // Validar el correo electrónico
  if (!validateEmail(email)) {
    return res.status(400).send('El correo electrónico no es válido');
  }

  // Buscar el usuario con ese correo electrónico en la base de datos
  connection.query(`SELECT * FROM usuarios WHERE email = '${email}'`, (err, result) => {
  if (err) {
      return res.status(500).send('Error al buscar el usuario en la base de datos');
  }

  if (result.length === 0) {
      return res.status(404).send('No se ha encontrado un usuario con ese correo electrónico');
  } 

  res.redirect("/login")
});


function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function generateToken() {
    // Aquí podrías usar una librería como crypto para generar un token único
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}     
});



/**RECUPERSA LOS DATOS DE FORMULARIOS*/
router.post("/panelAmbiental", (req, res) => {
  let listaAmb = []
  for (let i = 1; i <= 26; i++) {
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

router.get("/notificacion", (req, res) => {
  res.render("notificacion", { title: "Nueva contraseña" });
});

router.get("/profile", (req, res) => {
  res.render("profile", { title: "Nueva contraseña" });
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
