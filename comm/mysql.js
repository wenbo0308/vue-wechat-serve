const conf = require('../config/config');
const mysql = require('mysql');

const pool = mysql.createPool({
	host: conf.mysql.host,
	port: conf.mysql.port,
	user: conf.mysql.user,
	password: conf.mysql.password,
	database: conf.mysql.database,
	debug: false,
	dateString: true
}) 

class Sql {
	constructor(){
		
	}
	getConnection(){
		return new Promise((res,rej)=>{
			pool.getConnection((err,connection)=>{
				if(err){rej(err)}
				else{res(connection)}
			})
		})
	}
	query(sql){
		return new Promise((res,rej)=>{
			if(!sql) return rej('no sql string');
			pool.query(sql,(err,result)=>{
				if(err){rej(err)}
				else{res(result)}
			})
		})
	}
	paramQuery(sql,param){
		return new Promise((res,rej)=>{
			if(!sql) return rej('no sql string');
			pool.query(sql,param,(err,result)=>{
				if(err){rej(err)}
				else{res(result)}
			})
		})
	}
};

module.exports = Sql;