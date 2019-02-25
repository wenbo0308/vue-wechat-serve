const Sql = require('../comm/mysql');
const moment = require('moment');
const WebSocket = require('ws');
const Jwt = require('./jwt_method.js');
const jwt_method = new Jwt();

const sql = new Sql();
const WebSocketServer = WebSocket.Server;
class Ws {
	constructor(){
		this.webSockets = {};
	}
	socketVerify(info){
		return true;
	}
	msgWs(webSocket,user){
		webSocket.on('message',async (msg)=>{
			try{
				let currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
				console.log(`server received:${msg}`);
				let reqObj = JSON.parse(msg);
				let user_status = this.webSockets.hasOwnProperty(reqObj.u_id);
				let stat = 0 ;
				// let date = moment().format('YYYY-MM-DD HH:mm:ss');
				if(user_status){
					let user_ws = this.webSockets[reqObj.u_id]
					user_ws.send(msg,(err)=>{
						if(err){console.log(`server error: ${err}`)}
						else{console.log(`send success`)}
					})
					stat = 1;
				};
				let str_1 = `select room_id as r_id from vue_friend_list where p_id=? and c_id=?`;
				let str_2 = `select * from vue_chat_room where room_id=? and u_id=?`;
				let str_3 = `insert into vue_chat_room (room_id,u_id,type,create_time) values (?,?,?,?)`;
				let str_4 = `insert into vue_chat_list (r_id,p_id,c_id,cont,type,status) 
				values (?,?,?,?,?,?)`;
				let str_5 = `update vue_chat_room set is_del=0,create_time=? where room_id=? and u_id=?`
				let [room] = await sql.paramQuery(str_1,[user.user_id,reqObj.u_id]);
				let [arr] = await sql.paramQuery(str_2,[room.r_id,user.user_id]);
				if(!arr){
					await sql.paramQuery(str_3,[room.r_id,user.user_id,1,currentTime])
				}else{
					if(arr.is_del){
						await sql.paramQuery(str_5,[currentTime,room.r_id,arr.u_id])
					}
				}
				await sql.paramQuery(str_4,[room.r_id,user.user_id,reqObj.u_id,reqObj.cont,1,stat])
			}catch(err){
				console.log('ws error:' + err)
			}
		})
	}
	closeWs(webSocket,_id){
		webSocket.on('colse',()=>{
			delete this.webSockets[_id];
			console.log(`delete ${_id}`)
		})
	}
	connWs(wss){
		wss.on('connection',async (webSocket,req) => {
			if(!req.headers.cookie){return false;}
			var user = await jwt_method.getUserId(req.headers.cookie);
			this.webSockets[user.user_id] = webSocket;
			this.msgWs(webSocket,user);
			this.closeWs(webSocket,user.user_id);
		})
	}

	initWebsocket(server){
		let wss = new WebSocketServer({server,clientTracking:true,
			verifyClinet:this.socketVerify});
		this.connWs(wss)
	}
}
module.exports = Ws