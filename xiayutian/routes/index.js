var express = require('express');
var router = express.Router();
var User = require('../db/models/UserModel')
var sha1 = require('sha1')
var {sign} = require('../utils/sign')

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.redirect("http://www.hubwiz.com");
  res.render('dist/index', { title: 'Express' });
});

//验证消息的确来自微信服务器
// https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html
router.get('/auth', (req, res, next) => {
  let { signature, timestamp, nonce, echostr } = req.query

  // 自定token（需要保持和服务器配置一样）
  // https://mp.weixin.qq.com/advanced/advanced?action=interface&t=advanced/interface&token=1220981611&lang=zh_CN
  let token = 'testweixin'

  // 字典排序
  let array = [timestamp, nonce, token]
  array.sort()
  let str = array.join('')
  let resultStr = sha1(str) //对字符经行加密

  if (resultStr === signature) {
    //设置返回的结构为纯字符串，express的返回可能时html，不纯。所以设置
    // res.set('Content-Type','text/plain')
    res.set('Content-Type', 'application/json')
    res.send(echostr)
  } else {
    res.send('Error!!!')
  }

})

// 获取jsapi配置
router.get('/jsapi', async (req, res, next) => {
  //解码 url 应为前端encodeURIComponent处理了url ，防止乱码，所以这里要解码
  let url = decodeURIComponent(req.query.url)
  console.log("url", url)
  let config = await sign(url)
  res.send(config)
})


router.post('/reg', (req, res, next) => {
  let { user, pwd } = req.body;
  new User({
    user, pwd
  }).save().then(() => {
    res.send({ code: 1, msg: '注册成功' })
  })
})

module.exports = router;
