var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const Login = require('../methods/login_method.js');
const Jwt = require('../methods/jwt_method.js');
let login_method = new Login();
let jwt_method = new Jwt();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/api/v1/register',async (req,res,next) => {
	let reqObj = req.body;
	console.log(JSON.stringify(reqObj))
	let resData = {status:0,msg:'',result:[]};
	if(reqObj.pwd !== reqObj.c_pwd){
		resData.msg = '密码确认错误'
		return res.send(resData);
	}
	try{
		let _exist = await login_method.isUserExist(reqObj.phone);
		console.log('haha',_exist)
		if(_exist){
			resData.msg = '用户已存在';
			return res.send(resData);
		}
		reqObj.pwd = crypto.createHash('md5').update(reqObj.pwd).digest('hex');
		await login_method.insertUser(reqObj);
		resData.status = 1;
		resData.msg = 'ok';
		res.status(200).send(resData);
	}catch(err){
		resData.msg = JSON.stringify(err)
		return res.status(500).send(resData)
	}
});
router.post('/api/v1/login',async (req,res,next) => {
	let reqObj = req.body;
	console.log(reqObj)
	if(!reqObj.phone || !reqObj.pwd){
		return res.send({status:0,msg:'wrong request data'});
	}
	try{
		let [user] = await login_method.findUser(reqObj);
		if(!user){
			return res.send({status:0,msg:'not find user',token:''});
		}
		let _pwd = crypto.createHash('md5').update(reqObj.pwd).digest('hex');
		if(_pwd !== user.password){
			return res.send({status:0,msg:'not correct password',token:''});
		}
		let dtl = await login_method.getUserDtl(user.id);
		let tokenObj = {user_id:user.id};
		let auth_token = await jwt_method.getAuthToken(tokenObj);
		return res.send({status:1,msg:'enjoy your token',token:auth_token,user:dtl});
	}catch(err){
		console.log(err);
		return res.status(500).send({status:0,msg:JSON.stringify(err)})
	}
});

router.post('/api/v1/add_friend',async (req,res,next)=>{
	let reqObj = req.body;
	console.log('reqreqreq',reqObj)
	if(!reqObj.phone){
		return res.send({status:0,msg:'wrong request data'});
	}
	let user = req.user_info.data;
	try{
		let bid = await login_method.getUserId(reqObj); 
		await login_method.addFriend(user.user_id,bid,parseInt(reqObj.status))
		if(reqObj.status == 1){
			console.log('req')
			await login_method.updateFriendStatus(bid,user.user_id);
		}
		return res.send({status:1,msg:'success'});
	}catch(err){
		console.log(err)
		return res.status(500).send({status:0,msg:JSON.stringify(err)})	
	}
});
router.get('/api/v1/get_req_friend',async (req,res,next) => {
	let session_user = req.user_info.data;
	try{
		let list = await login_method.getReqFriend(session_user.user_id);
		let _arr = await login_method.getReqIcon(list);
		return res.send({status:1,msg:'success',result:_arr});
	}catch(err){
		console.log(err)
		return res.status(500).send({status:0,msg:JSON.stringify(err)});
	}
})
router.get('/api/v1/getMyFriend',async (req,res,next)=>{
	let session_user = req.user_info.data;
	try{
		let list = await login_method.getMyFriend(session_user.user_id);
		return res.send({status:1,msg:'success',result:list})
	}catch(err){
		console.log(err)
		return res.status(500).send({status:0,msg:JSON.stringify(err)});
	}
})
router.get('/api/v1/getFriendDtl',async (req,res,next) => {
	let f_id = req.query.id;
	try{
		let dtl = await login_method.getFriendInfo(f_id);
		console.log(dtl)
		return res.send({status:1,msg:'success',result:dtl})
	}catch(err){
		console.log(err)
		return res.status(500).send({status:0,msg:JSON.stringify(err)});	
	}
})
router.get('/api/v1/getChatList',async (req,res,next)=>{
	let session_user = req.user_info.data.user_id;
	let o_id = req.query.id;
	try{
		let list = await login_method.getChatList(session_user,o_id);
		
		return res.send({status:1,msg:'success',result:list})
	}catch(err){
		console.log(err)
		return res.status(500).send({status:0,msg:JSON.stringify(err)});
	}
});
router.get('/api/v1/getRoomList',async (req,res,next)=>{
	let session_user = req.user_info.data.user_id;
	try{
		let list = await login_method.getRoomList(session_user);
		return res.send({status:1,msg:'success',result:list});
	}catch(err){
		console.log(err)
		return res.status(500).send({status:0,msg:JSON.stringify(err)});
	}
})
router.get('/api/v1/delchat',async (req,res,next)=>{
	let r_id = req.query.rId;
	let u_id = req.user_info.data.user_id;
	if(!r_id){
		return res.send({status:0,msg:'no query data!'})
	}
	try{
		await login_method.delRoomChat(r_id,u_id);
		return res.send({status:1,msg:'delete success'}) 
	}catch(err){
		console.log(err)
		return res.status(500).send({status:0,msg:JSON.stringify(err)});
	}
})
router.get('/api/v1/getMyInfo',async (req,res,next)=>{
	let session_user = req.user_info.data.user_id;
	try{
		let [info] = await login_method.getMyInfo(session_user);
		info.uid = session_user;
		return res.send({status:1,msg:'success',result:info});
	}catch(err){
		console.log(err)
		return res.status(500).send({status:0,msg:JSON.stringify(err)});
	}
});
module.exports = router;
