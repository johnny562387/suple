const mysql = require('mysql');
const connection= mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "usuarios"
});
connection.connect((error)=>{
    if(error)
    {
        console.log('Error de conexion es: '+error);
        return;
    }else{
        console.log('Conectado a la BDD')
    }
});


module.exports = connection;