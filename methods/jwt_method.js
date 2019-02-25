const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

class Jwt {
	constructor(){}
	async getAuthToken(data){
		try{
			let n_time = Math.floor(Date.now() / 1000);
			let cert = fs.readFileSync(path.resolve(__dirname,'../keys/rsa_priv_key.pem'));
			let token = jwt.sign({
				data,
				exp: n_time+60*60*24
			},cert,{algorithm: 'RS256'});
			return token;
		}catch(err){throw err};
	}
	async verifyAuthToken(req,res,token){
		try{
			let cert = fs.readFileSync(path.resolve(__dirname,'../keys/rsa_public_key.pem'));
			let result = jwt.verify(token,cert,{algorithm: ['RS256']},(err,decode) => {
				if(err){
					return false;
				}
				req.user_info = decode;
				return true;
			})
			return result;
		}catch(err){
			throw err;
		}
	}
	async getUserId(cookie){
		try{
			if(!cookie){
				return false;
			}
			let token = cookie.split('=')[1];
			let cert = fs.readFileSync(path.resolve(__dirname,'../keys/rsa_public_key.pem'));
			let result = jwt.verify(token,cert,{algorithm: ['RS256']},(err,decode) => {
				if(err){
					throw err;
				}
				return decode.data;
			})
			return result;
		}catch(err){throw err}
	}
}

module.exports = Jwt;