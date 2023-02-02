import { Router } from "express";
import bodyParser from "body-parser";
import connection from './db.js';
import session from "express-session"
import fs from "fs";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const router = Router();
// Convertir la función de conexión a la base de datos en una función que devuelve una promesa
const query = (sql) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(session({
  secret: "yoursecretkey",
  resave: false,
  saveUninitialized: true
}));
// --------Parte del home ---------


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get("/", (req, res) => {
  connection.query("SELECT municipio, Anio FROM municipios", (err, rows) => {
    console.log(rows)
    if (err) throw err;
    res.render("home", { tareas: rows });
  });
});

router.get('/home', (req, res) => {
  connection.query("SELECT municipio, Anio FROM municipios", (err, rows) => {
    console.log(rows)
    if (err) throw err;
    res.render("home", { tareas: rows });
  });
});

router.post("/submit", (req, res) => {
  const a1 = req.body.selectMun;
  const a2 = req.body.selectAño;
  req.session.a1 = a1;
  req.session.a2 = a2;
  const submitType = req.body.submit;
  if (submitType === "submit1") {
    res.redirect("/indicadores");
  } else if (submitType === "submit2") {
    res.redirect("/indicadores#sectionVariables");
  }
});

//--------Fin de la parte del home---------

router.get("/indicadores", async (req, res) => {
  let a1 = req.session.a1 || "CATAMAYO"
  const a2 = req.session.a2 || "2020"
  a1 = a1.charAt(0).toUpperCase() + a1.slice(1).toLowerCase();
  console.log(a1)
  console.log(a2)
  var indicadores = []
  try {
    let sql = `SELECT COUNT(*) FROM indambiental WHERE municipio = '${a1}' AND anio = '${a2}'`;
    let result = await query(sql);
    if (result[0]['COUNT(*)'] > 0) {
      indicadores.push("Gestión Ambiental");
    }
    sql = `SELECT COUNT(*) FROM indisnttucion WHERE municipio = '${a1}' AND anio = '${a2}'`;
    result = await query(sql);
    if (result[0]['COUNT(*)'] > 0) {
      indicadores.push("Gestión Institucional");
    }
    sql = `SELECT COUNT(*) FROM economic WHERE municipio = '${a1}' AND anio = '${a2}'`;
    result = await query(sql);
    if (result[0]['COUNT(*)'] > 0) {
      indicadores.push("Gestión Económica");
    }
    sql = `SELECT COUNT(*) FROM indsocial WHERE municipio = '${a1}' AND anio = '${a2}'`;
    result = await query(sql);
    if (result[0]['COUNT(*)'] > 0) {
      indicadores.push("Gestión Social");
    }
    result = await query(sql);
  } catch (err) {
    console.log(err);
  }
  console.log(indicadores);
  const grafica = req.session.grafica;
  const labels = req.session.labels;
  const selectedIndicadores = req.session.selectedIndicadores || [
    'Gestión Ambiental',
    'Gestión Institucional',
    'Gestión Económica',
    'Gestión Social'
  ];
  res.render("indicadores", { a1, a2, indicadores, selectedIndicadores, grafica, labels });
});

router.post("/indicadores", async (req, res) => {
  const selectedIndicadores = req.body.indicadores;
  req.session.selectedIndicadores = selectedIndicadores;
  let a1 = req.session.a1 || "CATAMAYO"
  const a2 = req.session.a2 || "2020"
  a1 = a1.charAt(0).toUpperCase() + a1.slice(1).toLowerCase();
  console.log(a1)
  console.log(a2)
  let promediosIndicadores = []
  let labels = []
  // seleccion de los indicadores y calculo para cada uno de ellos
  for (let i = 0; i < selectedIndicadores.length; i++) {
    switch (selectedIndicadores[i]) {
      case "Gestión Ambiental":
        // acción para el valor1
        console.log("AM")
        try {
          let sql = `SELECT * FROM indambiental WHERE municipio = '${a1}' AND anio = '${a2}'`;
          let result = await query(sql);
          let sql2 = `SELECT * FROM indambiental WHERE anio = '${a2}'`;
          let result2 = await query(sql2);
          // saco los datos unicamente del municipio seleccionado
          //let resultado = Object.values(result[0]);
          //console.log(resultado)
          let json = JSON.stringify(result);
          let obj = JSON.parse(json);
          let listaInicial = obj.map(o => [
            o.areaRellenosSanitarios, o.numBotaderos, o.areaBotaderos,
            o.totalResiduo2012, o.totalResiduosSolidos, o.totalResiduosPeligrosos,
            o.totalResiduosOrganicos, o.totalResiduosInorganicos,
            o.totalTratadoResiduos, o.residuosUrbanosReciclaje,
            o.TotalResiduosUrbanos, o.totalResiduosTratSolidosPeligrosos,
            o.aguaSuperficialVolumen, o.aguaSubterráneaVolumen,
            o.volTotalSuperficialSubterráea, o.volBrutoAguaDulce,
            o.totalVolAguaRegistradaDistribuida, o.cantTotalAguaResRecolec,
            o.totalAguaResidualTrat, o.numPlantasAguaResidual, o.capPlantaAguaResidual,
            o.volTotalNoTratVert, o.cantResidualAlcantarillado,
            o.consumoAguaInstitución2012
          ]).flat();
          console.log(listaInicial)
          //saco todos los datos de todas las columnas para hacer uso de la formula en el rango 4 hasta la 220 o hasta la que exista
          let subi1 = result2.map(item => item.areaRellenosSanitarios);
          let subi2 = result2.map(item => item.numBotaderos);
          let subi3 = result2.map(item => item.areaBotaderos);
          let subi4 = result2.map(item => item.totalResiduo2012);
          let subi5 = result2.map(item => item.totalResiduosSolidos);
          let subi6 = result2.map(item => item.totalResiduosPeligrosos);
          let subi7 = result2.map(item => item.totalResiduosOrganicos);
          let subi8 = result2.map(item => item.totalResiduosInorganicos);
          let subi9 = result2.map(item => item.totalTratadoResiduos);
          let subi10 = result2.map(item => item.residuosUrbanosReciclaje);
          let subi11 = result2.map(item => item.TotalResiduosUrbanos);
          let subi12 = result2.map(item => item.totalResiduosTratSolidosPeligrosos);
          let subi13 = result2.map(item => item.aguaSuperficialVolumen);
          let subi14 = result2.map(item => item.aguaSubterráneaVolumen);
          let subi15 = result2.map(item => item.volTotalSuperficialSubterráea);
          let subi16 = result2.map(item => item.volBrutoAguaDulce);
          let subi17 = result2.map(item => item.totalVolAguaRegistradaDistribuida);
          let subi18 = result2.map(item => item.cantTotalAguaResRecolec);
          let subi19 = result2.map(item => item.totalAguaResidualTrat);
          let subi20 = result2.map(item => item.numPlantasAguaResidual);
          let subi21 = result2.map(item => item.capPlantaAguaResidual);
          let subi22 = result2.map(item => item.volTotalNoTratVert);
          let subi23 = result2.map(item => item.cantResidualAlcantarillado);
          let subi24 = result2.map(item => item.consumoAguaInstitución2012);
          // Ingreso todos los subindices en una matriz
          let listaSubIndices = [subi1, subi2, subi3, subi4, subi5, subi6, subi7, subi8,
            subi9, subi10, subi11, subi12, subi13, subi14, subi15, subi16, subi17, subi18,
            subi19, subi20, subi21, subi22, subi23, subi24];
          // ---NOTA---: la variable de la columna  'x' y 'y' no lo esta tomando en cuenta
          console.log("aaaaaaaaaaaaa")
          // esta funcion permite el calculo de todos los subindices

          // recivo el valor de todos los subindices
          let subIndices = calcSubindiceArray(listaSubIndices, listaInicial);

          console.log(subIndices);
          console.log(average(subIndices));
          promediosIndicadores.push(parseFloat(average(subIndices)))
          labels.push(selectedIndicadores[i])

        } catch (err) {
          console.log(err);
        }
        break;
      case "Gestión Institucional":
        try {
          let sql = `SELECT * FROM indisnttucion WHERE municipio = '${a1}' AND anio = '${a2}'`;
          let result = await query(sql);
          let sql2 = `SELECT * FROM indisnttucion WHERE anio = '${a2}'`;
          let result2 = await query(sql2);
          // saco los datos unicamente del municipio seleccionado
          //let resultado = Object.values(result[0]);
          //console.log(resultado)
          let json = JSON.stringify(result);
          let obj = JSON.parse(json);
          let listaInicial = obj.map(o => [
            o.funcionariosTrabajoTiempoCompleto, o.coberturaBarridoZonasPublicas, o.numPersonaServicioBarrido,
            o.numTotalEmpleadosGestionAmbiental, o.consumoEnergia2012, o.valorConsumoElectrico2012,
            o.cantidadCombustibleDiesel, o.cantidadCombustibleExtra,
            o.cantidadCombustibleSuper, o.numeroAdquiridoPapel,
            o.totalAguaSuspendidaMes
          ]).flat();
          console.log(listaInicial)
          //saco todos los datos de todas las columnas para hacer uso de la formula en el rango 4 hasta la 220 o hasta la que exista
          let subi1 = result2.map(item => item.funcionariosTrabajoTiempoCompleto);
          let subi2 = result2.map(item => item.coberturaBarridoZonasPublicas);
          let subi3 = result2.map(item => item.numPersonaServicioBarrido);
          let subi4 = result2.map(item => item.numTotalEmpleadosGestionAmbiental);
          let subi5 = result2.map(item => item.consumoEnergia2012);
          let subi6 = result2.map(item => item.valorConsumoElectrico2012);
          let subi7 = result2.map(item => item.cantidadCombustibleDiesel);
          let subi8 = result2.map(item => item.cantidadCombustibleExtra);
          let subi9 = result2.map(item => item.cantidadCombustibleSuper);
          let subi10 = result2.map(item => item.numeroAdquiridoPapel);
          let subi11 = result2.map(item => item.totalAguaSuspendidaMes);
          // Ingreso todos los subindices en una matriz
          let listaSubIndices = [subi1, subi2, subi3, subi4, subi5, subi6, subi7, subi8,
            subi9, subi10, subi11];

          console.log("aaaaaaaaaaaaa")
          console.log()
          // esta funcion permite el calculo de todos los subindices

          // recivo el valor de todos los subindices
          let subIndices = calcSubindiceArray(listaSubIndices, listaInicial);

          console.log(subIndices);
          console.log(average(subIndices));
          promediosIndicadores.push(parseFloat(average(subIndices)))
          labels.push(selectedIndicadores[i])
        } catch (err) {
          console.log(err);
        }
        // acción para el valor2
        console.log("Ins")
        break;
      case "Gestión Económica":
        try {
          let sql = `SELECT * FROM economic WHERE municipio = '${a1}' AND anio = '${a2}'`;
          let result = await query(sql);
          let sql2 = `SELECT * FROM economic WHERE anio = '${a2}'`;
          let result2 = await query(sql2);
          // saco los datos unicamente del municipio seleccionado
          //let resultado = Object.values(result[0]);
          //console.log(resultado)
          let json = JSON.stringify(result);
          let obj = JSON.parse(json);
          let listaInicial = obj.map(o => [
            o.presupuestoAnual, o.montoRecaudado, o.totalMontoRecaudado,
            o.presupuestoCaptacionAgua, o.ingresosRecursosFiscales, o.ingresosRecursosPreasignaciones,
            o.ingresosRecursosCredito, o.ingresosAsistenciaTecnica,
            o.ingresosAnticiposEjercicios, o.totalIngresosRecibidos,
            o.ingresosProtecciónAmbiental,
            o.ingresosPreasignacionesValor,
            o.totalingresoProtAmbiental
          ]).flat();
          console.log(listaInicial)
          //saco todos los datos de todas las columnas para hacer uso de la formula en el rango 4 hasta la 220 o hasta la que exista
          let subi1 = result2.map(item => item.presupuestoAnual);
          let subi2 = result2.map(item => item.montoRecaudado);
          let subi3 = result2.map(item => item.totalMontoRecaudado);
          let subi4 = result2.map(item => item.presupuestoCaptacionAgua);
          let subi5 = result2.map(item => item.ingresosRecursosFiscales);
          let subi6 = result2.map(item => item.ingresosRecursosPreasignaciones);
          let subi7 = result2.map(item => item.ingresosRecursosCredito);
          let subi8 = result2.map(item => item.ingresosAsistenciaTecnica);
          let subi9 = result2.map(item => item.ingresosAnticiposEjercicios);
          let subi10 = result2.map(item => item.totalIngresosRecibidos);
          let subi11 = result2.map(item => item.ingresosProtecciónAmbiental);
          let subi12 = result2.map(item => item.ingresosPreasignacionesValor);
          let subi13 = result2.map(item => item.totalingresoProtAmbiental);
          // Ingreso todos los subindices en una matriz
          let listaSubIndices = [subi1, subi2, subi3, subi4, subi5, subi6, subi7, subi8,
            subi9, subi10, subi11, subi12, subi13];
          console.log("aaaaaaaaaaaaa")
          console.log()
          // esta funcion permite el calculo de todos los subindices

          // recivo el valor de todos los subindices
          let subIndices = calcSubindiceArray(listaSubIndices, listaInicial);
          console.log(subIndices);
          console.log(average(subIndices));
          promediosIndicadores.push(parseFloat(average(subIndices)))
          labels.push(selectedIndicadores[i])
        } catch (err) {
          console.log(err);
        }
        console.log("Econ")
        // acción para el valor3
        break;
      case "Gestión Social":
        try {
          let sql = `SELECT * FROM indsocial WHERE municipio = '${a1}' AND anio = '${a2}'`;
          let result = await query(sql);
          let sql2 = `SELECT * FROM indsocial WHERE anio = '${a2}'`;
          let result2 = await query(sql2);
          // saco los datos unicamente del municipio seleccionado
          //let resultado = Object.values(result[0]);
          //console.log(resultado)
          let json = JSON.stringify(result);
          let obj = JSON.parse(json);
          let listaInicial = obj.map(o => [
            o.numAutosRecolectores, o.capAutosRecolectores, o.porcenServicioBarrido,
            o.kmServicioBarrido, o.porcenServisBarridoUrbanas, o.porcenServisBarridoRurales,
            o.porcenCoberturaResiduosInfecciosos, o.proyectosFuentesCapcionAgua,
            o.abastecimientoAguaPotableHoras, o.areaM2InstConst,
            o.areaVerdeParques,
            o.areaVerdePlazas,
            o.areaVerdeJardines,
            o.areaVerdeParterres, o.areaVerdeRiberas,
            o.areaVerdeEstadios,
            o.areaVerdeCanchasDep,
            o.areasVerdeOtrasUrbanas,
            o.areaUrbanaMunicpio
          ]).flat();
          console.log(listaInicial)
          //saco todos los datos de todas las columnas para hacer uso de la formula en el rango 4 hasta la 220 o hasta la que exista
          let subi1 = result2.map(item => item.numAutosRecolectores);
          let subi2 = result2.map(item => item.capAutosRecolectores);
          let subi3 = result2.map(item => item.porcenServicioBarrido);
          let subi4 = result2.map(item => item.kmServicioBarrido);
          let subi5 = result2.map(item => item.porcenServisBarridoUrbanas);
          let subi6 = result2.map(item => item.porcenServisBarridoRurales);
          let subi7 = result2.map(item => item.porcenCoberturaResiduosInfecciosos);
          let subi8 = result2.map(item => item.proyectosFuentesCapcionAgua);
          let subi9 = result2.map(item => item.abastecimientoAguaPotableHoras);
          let subi10 = result2.map(item => item.areaM2InstConst);
          let subi11 = result2.map(item => item.areaVerdeParques);
          let subi12 = result2.map(item => item.areaVerdePlazas);
          let subi13 = result2.map(item => item.areaVerdeJardines);
          let subi14 = result2.map(item => item.areaVerdeParterres);
          let subi15 = result2.map(item => item.areaVerdeRiberas);
          let subi16 = result2.map(item => item.areaVerdeEstadios);
          let subi17 = result2.map(item => item.areaVerdeCanchasDep);
          let subi18 = result2.map(item => item.areasVerdeOtrasUrbanas);
          let subi19 = result2.map(item => item.areaUrbanaMunicpio);
          // Ingreso todos los subindices en una matriz
          let listaSubIndices = [subi1, subi2, subi3, subi4, subi5, subi6, subi7, subi8,
            subi9, subi10, subi11, subi12, subi13, subi14, subi15, subi16, subi17, subi18,
            subi19,];
          console.log("aaaaaaaaaaaaa")
          console.log()
          // esta funcion permite el calculo de todos los subindices

          // recivo el valor de todos los subindices
          let subIndices = calcSubindiceArray(listaSubIndices, listaInicial);
          console.log(subIndices);
          console.log(average(subIndices));
          promediosIndicadores.push(parseFloat(average(subIndices)))
          labels.push(selectedIndicadores[i])
        } catch (err) {
          console.log(err);
        }
        break;
      default:
      // acción para cualquier otro valor
    }
    console.log(selectedIndicadores[i] + "uwu");
  }
  console.log(promediosIndicadores)
  console.log(selectedIndicadores);
  console.log(labels)
  // resto del código
  req.session.grafica = promediosIndicadores;
  req.session.labels = labels
  res.redirect("/indicadores");
});
/// ----- Funciones para el calculo de los indicadores

function calcSubindiceArray(subIndice, valueCalc) {
  return subIndice.map((row, i) => {
    row = row.filter(v => v !== undefined && v !== null && v !== "");
    row = row.map(v => {
      if (typeof v === 'string') {
        return parseFloat(v.replace(',', '.'))
      }
      return v;
    });
    let value = valueCalc[i];
    if (typeof value === "string") value = parseFloat(value.replace(',', '.'))
    let minValue = Math.min(...row);
    let maxValue = Math.max(...row);
    return isFinite(minValue) && isFinite(maxValue) && isFinite(value) ? ((9 * ((value - minValue) / (maxValue - minValue)) + 1).toFixed(2)) : null;
  });
}

function average(subIndices) {
  const sum = subIndices.reduce((a, b) => parseFloat(a) + parseFloat(b));
  return (sum / subIndices.length).toFixed(2);
}
// ---------- Terminacion del calculador de los indicadores --------------


router.get("/configuracion", (req, res) => {
  res.render("configuracion", { title: "Hosting" });
});

router.post("/eleccion") , async (req,res) => {
  console.log("entre en eleccion")
  let eleccion = req.body.selectInd
  console.log(eleccion)
  switch (eleccion) {
    case "Gestión Ambiental":
      console.log("entre en ambiental")
      res.redirect("/varAmb");
      break;
    case "Gestión Institucional":
      res.redirect("/opcion2");
      break;
    case "Gestión Económica":
      res.redirect("/opcion2");
      break;
    case "Gestión Social":
      res.redirect("/opcion2");
      break;
    default:
      res.redirect("/");
  }
  res.redirect("/varAmb")

}


router.get("/varAmb", async(req, res) => {
  let a1 = req.session.a1 || "CATAMAYO"
  const a2 = req.session.a2 || "2020"
  a1 = a1.charAt(0).toUpperCase() + a1.slice(1).toLowerCase();
  console.log(a1, 'uwu')
  console.log(a1)
  console.log(a2)
  console.log(a1, 'uwu')
  let tableName = 'indambiental';
  let variablesIndicadores = [];
  try {
    switch (tableName) {
      case 'indambiental':
        let sql = `SELECT * FROM ${tableName} WHERE municipio = '${a1}' AND anio = '${a2}'`;
        let result = await query(sql);
        console.log(result)
        let columnsWithData = Object.keys(result[0]).filter((column, index) => result[0][column] !== null && index !== 0 && index !== Object.keys(result[0]).length - 1);

        console.log(columnsWithData)
        let data = [
          {
            areaRellenosSanitarios: 'Área relleno sanitario',
            numBotaderos: 'Numero de botaderos',
            areaBotaderos: 'Área botaderos',
            totalResiduo2012: 'Residuos Recolectados 2012',
            totalResiduosSolidos: 'Recolección residuos solidos',
            totalResiduosPeligrosos: 'Residuos peligrosos sólidos',
            totalResiduosOrganicos: 'Residuos orgánicos',
            totalResiduosInorganicos: 'Residuos inorganicos',
            totalTratadoResiduos: 'Cantidad residuos tratados',
            residuosUrbanosReciclaje: 'Residuos urbanos reciclados',
            TotalResiduosUrbanos: 'Total de residuos urbanos',
            totalResiduosTratSolidosPeligrosos: 'Residuos sólidos y peligrosos',
            aguaSuperficialVolumen: 'Fuentes agua superficial',
            'aguaSubterráneaVolumen': 'Fuentes agua subterranea',
            'volTotalSuperficialSubterráea': 'Volumen agua superficial y subterranea',
            volBrutoAguaDulce: 'Volumen bruto agua dulce',
            totalVolAguaRegistradaDistribuida: 'Total agua registrada ',
            cantTotalAguaResRecolec: 'Cantidad agua residual recolectada',
            totalAguaResidualTrat: 'Total agua residual',
            numPlantasAguaResidual: 'Tratamiento agua residual',
            capPlantaAguaResidual: 'Número de plantas residual',
            cantTotalAguaNoTrat: 'Capacidad planta de tratamiento',
            volTotalAguaTratVert: 'Volumen agua vertida',
            volTotalNoTratVert: 'Volumen agua no vertida',
            cantResidualAlcantarillado: 'Cantidad sistema de alcantarillado',
            'consumoAguaInstitución2012': 'Consumo de agua institución',
          }
        ];
        req.session.data = data
        for (let key of columnsWithData) {
          variablesIndicadores.push(data[0][key]);
        }
        console.log(variablesIndicadores)
        console.log("variablesIndicadores")


        break;
      case 'option2':
        console.log('You chose option 2');
        break;
      case 'option3':
        console.log('You chose option 3');
        break;
      case 'option4':
        console.log('You chose option 3');
        break;
      default:
        console.log('Invalid option');
    }
  } catch (err) {
    console.log(err);
  }

  //const selectedVariables = req.session.selectedVariables || variablesIndicadores;
  console.log("estos son los selectedVariables")
  //console.log(variablesIndicadores);
  const graficaVariables = req.session.graficaVariables;
  const labelsVariables = req.session.labelsVariables;
  const selectedVariables = req.session.selectedVariables || variablesIndicadores;
  console.log(selectedVariables)
  res.render("varAmb", {
    a1, a2, variablesIndicadores, selectedVariables, graficaVariables, labelsVariables
  });
});

router.post("/varAmb", async (req, res) => {
  const selectedVariables = req.body.variablesIndicadores;
  console.log(selectedVariables)
  let a1 = req.session.a1 || "CATAMAYO"
  const a2 = req.session.a2 || "2020"
  const data = req.session.data
  let decimalValues =[]
  let result = [];
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (selectedVariables.includes(item[key])) {
        result.push(key);
      }
    });
  });
  console.log(result);
  try {
    let sql = `SELECT ${result.join(', ')} FROM indambiental WHERE municipio = '${a1}' AND anio = '${a2}'`;;
    let result2 = await query(sql);
    console.log(result2)
    const valuesOnly = Object.values(result2[0]);
    decimalValues = valuesOnly.map(value => parseFloat(value.replace(',', '.')));
    console.log(decimalValues);

  } catch (err) {
    console.log(err);
  }
  req.session.graficaVariables = decimalValues;
  req.session.labelsVariables = selectedVariables
  req.session.selectedVariables = selectedVariables;
  // resto del código

  res.render("varAmb");
});

router.get("/varEco", async (req, res) => {
  let a1 = req.session.a1 || "CATAMAYO"
  const a2 = req.session.a2 || "2020"
  a1 = a1.charAt(0).toUpperCase() + a1.slice(1).toLowerCase();
  console.log(a1, 'uwu')
  console.log(a1)
  console.log(a2)
  console.log(a1, 'uwu')
  let tableName = 'indambiental';
  let variablesIndicadores = [];
  try {
    switch (tableName) {
      case 'indambiental':
        let sql = `SELECT * FROM ${tableName} WHERE municipio = '${a1}' AND anio = '${a2}'`;
        let result = await query(sql);
        console.log(result)
        let columnsWithData = Object.keys(result[0]).filter((column, index) => result[0][column] !== null && index !== 0 && index !== Object.keys(result[0]).length - 1);

        console.log(columnsWithData)
        let data = [
          {
            areaRellenosSanitarios: 'Área relleno sanitario',
            numBotaderos: 'Numero de botaderos',
            areaBotaderos: 'Área botaderos',
            totalResiduo2012: 'Residuos Recolectados 2012',
            totalResiduosSolidos: 'Recolección residuos solidos',
            totalResiduosPeligrosos: 'Residuos peligrosos sólidos',
            totalResiduosOrganicos: 'Residuos orgánicos',
            totalResiduosInorganicos: 'Residuos inorganicos',
            totalTratadoResiduos: 'Cantidad residuos tratados',
            residuosUrbanosReciclaje: 'Residuos urbanos reciclados',
            TotalResiduosUrbanos: 'Total de residuos urbanos',
            totalResiduosTratSolidosPeligrosos: 'Residuos sólidos y peligrosos',
            aguaSuperficialVolumen: 'Fuentes agua superficial',
            'aguaSubterráneaVolumen': 'Fuentes agua subterranea',
            'volTotalSuperficialSubterráea': 'Volumen agua superficial y subterranea',
            volBrutoAguaDulce: 'Volumen bruto agua dulce',
            totalVolAguaRegistradaDistribuida: 'Total agua registrada ',
            cantTotalAguaResRecolec: 'Cantidad agua residual recolectada',
            totalAguaResidualTrat: 'Total agua residual',
            numPlantasAguaResidual: 'Tratamiento agua residual',
            capPlantaAguaResidual: 'Número de plantas residual',
            cantTotalAguaNoTrat: 'Capacidad planta de tratamiento',
            volTotalAguaTratVert: 'Volumen agua vertida',
            volTotalNoTratVert: 'Volumen agua no vertida',
            cantResidualAlcantarillado: 'Cantidad sistema de alcantarillado',
            'consumoAguaInstitución2012': 'Consumo de agua institución',
          }
        ];
        req.session.data = data
        for (let key of columnsWithData) {
          variablesIndicadores.push(data[0][key]);
        }
        console.log(variablesIndicadores)
        console.log("variablesIndicadores")


        break;
      case 'option2':
        console.log('You chose option 2');
        break;
      case 'option3':
        console.log('You chose option 3');
        break;
      case 'option4':
        console.log('You chose option 3');
        break;
      default:
        console.log('Invalid option');
    }
  } catch (err) {
    console.log(err);
  }

  //const selectedVariables = req.session.selectedVariables || variablesIndicadores;
  console.log("estos son los selectedVariables")
  //console.log(variablesIndicadores);
  const graficaVariables = req.session.graficaVariables;
  const labelsVariables = req.session.labelsVariables;
  const selectedVariables = req.session.selectedVariables || variablesIndicadores;
  console.log(selectedVariables)
  res.render("varEco", {
    a1, a2, variablesIndicadores, selectedVariables, graficaVariables, labelsVariables
  });
});


router.post("/varEco", async (req, res) => {
  const selectedVariables = req.body.variablesIndicadores;
  console.log(selectedVariables)
  let a1 = req.session.a1 || "CATAMAYO"
  const a2 = req.session.a2 || "2020"
  const data = req.session.data
  let decimalValues =[]
  let result = [];
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (selectedVariables.includes(item[key])) {
        result.push(key);
      }
    });
  });
  console.log(result);
  try {
    let sql = `SELECT ${result.join(', ')} FROM indambiental WHERE municipio = '${a1}' AND anio = '${a2}'`;;
    let result2 = await query(sql);
    console.log(result2)
    const valuesOnly = Object.values(result2[0]);
    decimalValues = valuesOnly.map(value => parseFloat(value.replace(',', '.')));
    console.log(decimalValues);

  } catch (err) {
    console.log(err);
  }
  req.session.graficaVariables = decimalValues;
  req.session.labelsVariables = selectedVariables
  req.session.selectedVariables = selectedVariables;
  // resto del código

  res.redirect("/varEco");
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
