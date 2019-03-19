const Sql = require('../comm/mysql');
let sql = new Sql();
let comm_method = require('./common.js');
const moment = require('moment');
const pinyin = require('node-pinyin');
class Login {
	constructor(){}
	async isUserExist(_val){
		let str = `select count(*) as count from vue_user where mobile=?`;
		try{
			let [num] = await sql.paramQuery(str,[_val]);
			console.log('hehe',num.count)
			return num.count;
		}catch(err){
			throw err;
		}
	}
	async insertUser(obj){
		let str = `insert into vue_user (id,nick_name,mobile,password) 
		values (?,?,?,?)`;
		let _id = comm_method.createId();
		let num = Math.round(Math.random()*(3)+1);
		let str_1 = `insert into vue_user_dtl (u_id,icon) value(?,?)`;
		const img = `icon_${num}.jpg`;
		try{
			await sql.paramQuery(str,[_id,obj.nickName,obj.phone,obj.pwd]);
			await sql.paramQuery(str_1,[_id,img]);
		}catch (err){
			console.log(err )
			throw err;
		}
	}
	async findUser(obj){
		let str = `select * from vue_user where mobile=?`;
		try{
			let result = await sql.paramQuery(str,[obj.phone]);
			return result;
		}catch(err){
			throw err;
		}
	}
	async getUserDtl(_id){
		let str = `select icon,area,city from vue_user_dtl where u_id=?`;
		try{
			let [dtl] = await sql.paramQuery(str,[_id]);
			return dtl;
		}catch(err){
			throw err;
		}
	}
	async getUserId(obj){
		let str = `select id from vue_user where mobile=?`;
		try{
			let [result] = await sql.paramQuery(str,[obj.phone]);
			return result.id;
		}catch(err){
			throw err;
		}
	}
	//检查是否被加为好友
	async updateFriendStatus(a_id,b_id){
		let str = 'update vue_friend_list set flag = 1 where p_id=? and c_id=?';
		try{
			await sql.paramQuery(str,[a_id,b_id]);
		}catch(err){throw err}
	}
	//添加好友
	async addFriend(a_id,b_id,stat){
		let str = `insert into vue_friend_list (room_id,p_id,c_id,create_time,flag,type)
		values (?,?,?,?,?,?)`;
		let r_id;
		let str_1 = `select nick_name from vue_user where id=?`;
		let str_2 = `select room_id from vue_friend_list where p_id=? and c_id=?`;
		let date = moment().format('YYYY-MM-DD HH:mm:ss');
		try{
			if(stat == 0){
				r_id = comm_method.createId();
			}else{
				let [room] = await sql.paramQuery(str_2,[b_id,a_id]);
				r_id = room.room_id;
			}
			let [user] = await sql.paramQuery(str_1,[b_id]);
			let [initial] = pinyin(user.nick_name,{style:'firstLetter'});
			await sql.paramQuery(str,[r_id,a_id,b_id,date,stat,initial[0][0]]);
		}catch(err){
			throw err
		}
	}
	async getReqFriend(_id){
		console.log('ididid',_id)
		let str = `select a.mobile as phone,a.nick_name as nickName,b.flag from vue_user as a join 
		(select p_id,flag from vue_friend_list where c_id = ?) as b on a.id = b.p_id`;
		try{
			let list = await sql.paramQuery(str,[_id]);
			return list;
		}catch(err){throw err;}
	}
	async getMyFriend(_id){
		let str = `select a.nick_name as nickName,b.c_id as id,b.type from vue_user as a join (select c_id,type from vue_friend_list where 
		p_id=? and flag = 1) as b on a.id = b.c_id order by type`;
		let str_1 = `select icon from vue_user_dtl where u_id=?`;
		try{
			let list = await sql.paramQuery(str,[_id]);
			for(let item of list){
				let [img] = await sql.paramQuery(str_1,[item.id]);
				item.icon = img.icon;
			}
			console.log(list)
			return list;
		}catch(err){throw err}
	}
	async getFriendInfo(_id){
		let str = `select nick_name as nickName,mobile as phone from vue_user where id=? or mobile=?`;
		try{
			let arr = await sql.paramQuery(str,[_id,_id])
			return arr;
		}catch(err){
			throw err
		}
	}
	async getChatList(id_1,id_2){
		let str = `select a.is_del as isDel,a.create_time as cTime from vue_chat_room a join 
		vue_friend_list b on a.room_id=b.room_id where b.p_id=? and b.c_id=? and a.u_id=?`;
		let str_2 = `update vue_chat_list set status=1 where id=?`;
		try{
			let [roomStat] = await sql.paramQuery(str,[id_1,id_2,id_1]);
			console.log('haha',roomStat)
			if(!roomStat){return []}
			if(roomStat.isDel){
				return [];
			}
			let str_1 = `select a.* from (select id,p_id,c_id,cont,create_time,status from vue_chat_list where 
			p_id=? and c_id=? union all select id,p_id,c_id,cont,create_time,status from vue_chat_list where 
			c_id=? and p_id=?) as a order by a.create_time`;
			let arr = await sql.paramQuery(str_1,[id_1,id_2,id_1,id_2,roomStat.cTime]);
			for(var item of arr){
				if(item.p_id == id_1){
					item["type"] = 'right'

				}else{
					item["type"] = 'left';
					if(!item.status){
						await sql.paramQuery(str_2,[item.id]);
					}
				}

			}
			return arr;
		}catch(err){throw err}
	}
	async getRoomList(_id){
		let str_1 = `select a.room_id,c.* from vue_chat_room as a join 
		(select a.* from vue_chat_list a join (select r_id,max(create_time) as time from vue_chat_list group by r_id) 
		b on a.create_time=b.time and a.r_id=b.r_id) 
		as c on a.room_id = c.r_id where a.u_id=? and is_del=0 order by c.create_time desc`;
		let str_2 = `select a.nick_name as nickName,b.icon as icon from vue_user as a join vue_user_dtl as b on a.id=b.u_id where a.id=?`;
		try{
			let list = await sql.paramQuery(str_1,[_id]);
			if(list.length!==0){
				for(let item of list){
					if(item.p_id == _id){
						let [name] = await sql.paramQuery(str_2,[item.c_id]);
						console.log(name)
						item.nickName = name.nickName;
						item.icon = name.icon;
						item.to_user = item.c_id;
						item.status = 1
					}else{
						let [name] = await sql.paramQuery(str_2,[item.p_id]);
						console.log(name)
						item.nickName = name.nickName;
						item.icon = name.icon;
						item.to_user = item.p_id;
					}
				}
			}
			return list
		}catch(err){
			throw err
		}
	}
	async delRoomChat(_id,uid){
		let currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
		let str = `update vue_chat_room set is_del=1,create_time=? where room_id=? and u_id=?`;
		console.log(str)
		try{
			await sql.paramQuery(str,[currentTime,_id,uid]);
		}catch(err){
			throw err
		}
	}
	async getMyInfo(_id){
		let str = `select nick_name as nickName,mobile as phone from vue_user where id=?`;
		try{
			let list = await sql.paramQuery(str,[_id]);
			return list
		}catch(err){
			throw err
		}
	}
}

module.exports = Login