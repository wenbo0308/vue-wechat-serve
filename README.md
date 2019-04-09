# 前言
该项目用于vue-wechat-demo前端的接口编写，主要功能使用websocket双通道通信实现即时聊天功能
# 技术栈
node.js + express + mysql + ws + jsonwebtoken
# 项目运行
·npm run start·
# 主要功能
    authToken 登录验证以及接口授权
    websocket 即时聊天功能
    搜索添加好友功能
# 项目结构
```
.
|——bin
|  |——www
|——comm
|  |——mysql.js
|——config
|  |——config.js
|——keys
|  |——rsa_priv_key.pem
|  |——rsa_public_key.pem
|——methods
|  |——common.js
|  |——jwt_method.js
|  |——login_method.js
|  |——ws_method.js
|——public
|——routers
|  |——index.js
|  |——users.js
|——views
|——.gitignore
|——package-lock.json
|——package.json
|——README.md
|——app.js
```