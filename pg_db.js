const Pool = require("pg").Pool;

const pool = new Pool({
	user: "datalligence",
	password: "datalligence",
	database: "postgres",
	host: "dai-db.c8dckbuhptbd.ap-south-1.rds.amazonaws.com",
	port: 5432
});


module.exports = pool;