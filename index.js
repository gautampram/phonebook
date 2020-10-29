const express = require('express');
const app = express();
const pool = require('./pg_db');
const sql = require('sql');
const cors = require('cors');
const PORT = 9000;

app.use(express.json());

app.use(cors());

app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
	next();
});

var comp_grp = sql.define({
  name: 'competency_group',
  columns: [
		'description',
		'tenant_id',
    'created_by',
		'created_on',
		'modified_by',
		'modified_on',
    'is_deleted'
  ]
});


app.get('/',async(req, res)=>{

	try{
		res.json("Welcome to Competence Group");
	}
	catch(err){
		console.error(err.message);
	}
});


//get all organizations
app.get('/organization',async(req, res)=>{

	try{

		const allOrganization = await pool.query("SELECT public.organization.id, public.organization.name FROM public.organization WHERE public.organization.is_deleted = 'false' ORDER BY public.organization.name");

		res.json(allOrganization.rows);
	}
	catch(err){
		console.error(err.message);
	}
});

//get all employees for a tenantID - login user
app.get('/employee/:tenant_id/',async(req, res)=>{

	try{
		const tenant_id = req.params.tenant_id;
		const allEmp = await pool.query("SELECT public.user.id, public.user.display_name FROM public.user WHERE public.user.tenant_id = $1 AND public.user.is_deleted = 'false' AND public.user.is_hidden = 'false' ORDER BY public.user.display_name",[tenant_id]);

		res.json(allEmp.rows);
	}
	catch(err){
		console.error(err.message);
	}
});

//get all
app.get('/compgroups/:tenant_id',async(req, res)=>{

	try{

		const allCompgrps = await pool.query("select id, description from competency_group where is_deleted = false and tenant_id = $1", [req.params.tenant_id]);

		res.json(allCompgrps.rows);
	}
	catch(err){
		console.error(err.message);
	}
});

app.put('/updatecompgrp/:id/:uid',async(req, res)=>{
	const cgid = req.params.id;
	var cDate = new Date();
	var currentdate = cDate.getFullYear() + "-" + String(parseInt(cDate.getMonth()) + 1) + "-" + cDate.getDate() + " " + String(cDate.getHours()).padStart(2,"0") + ":" + String(cDate.getMinutes()).padStart(2,"0") + ":" + String(cDate.getSeconds()).padStart(2,"0");

	try{

		var CompgrpId = await pool.query("UPDATE competency_group SET description = $1, modified_by = $2, modified_on = $4 WHERE id = $3 ", [req.body.description, req.params.uid, req.params.id, currentdate]);
		console.log("i am here");
		res.json("Record successfully updated");
	}
	catch(err){
		console.error(err.message);
	}
});

//Delete record
app.put('/deletecompgrp/:id/:uid',async(req, res)=>{
	const {id} = req.params;
	var cDate = new Date();
	var currentdate = cDate.getFullYear() + "-" + String(parseInt(cDate.getMonth()) + 1) + "-" + cDate.getDate() + " " + String(cDate.getHours()).padStart(2,"0") + ":" + String(cDate.getMinutes()).padStart(2,"0") + ":" + String(cDate.getSeconds()).padStart(2,"0");

	try{
		const CompId = await pool.query("UPDATE competency_group SET is_deleted = true, modified_by = $1, modified_on = $3 WHERE id = $2 ", [req.params.uid, req.params.id, currentdate]);
		res.json("Record successfully deleted");
	}
	catch(err){
		console.error(err.message);
	}
});

app.post('/newcompgrp/:tenant_id/:uid', async(req, res)=>{
	try {
		var arrCompGrp = [];
		var objCompGrp = {};
		var cDate = new Date();
		var currentdate = cDate.getFullYear() + "-" + String(parseInt(cDate.getMonth()) + 1) + "-" + cDate.getDate() + " " + String(cDate.getHours()).padStart(2,"0") + ":" + String(cDate.getMinutes()).padStart(2,"0") + ":" + String(cDate.getSeconds()).padStart(2,"0");

		objCompGrp.description = req.body.description;
		objCompGrp.tenant_id = req.params.tenant_id;
		objCompGrp.created_by = req.params.uid;
		objCompGrp.created_on = currentdate;
		objCompGrp.modified_by = req.params.uid;
		objCompGrp.modified_on = currentdate;
		objCompGrp.is_deleted = false;
		arrCompGrp.push(objCompGrp);


		var newCompGrpQry = comp_grp.insert(arrCompGrp).returning(comp_grp.description).toQuery();

		var {rowsGrp} = await pool.query(newCompGrpQry);

	res.json({status: true,
		  data: {
			 rowsGrp
			}
		});
	}
	catch (err){
		console.error(err.message);
	}
});

app.listen(PORT, ()=>{
	console.log("Server listening at Port " + PORT);
});
