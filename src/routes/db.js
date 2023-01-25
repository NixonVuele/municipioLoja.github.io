// db.js
import mysql from "mysql2"

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'syscalc'
});

connection.connect();
export default connection;

