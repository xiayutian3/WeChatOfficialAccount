var { appid, secret } = require('../config')
var axios = require('axios')
var sha1 = require('sha1')
// var ticketModel = require('../db/models/ticketModel')

// 文档 https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
// 获取Access_token
// https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET


//获取 jsapi_ticket (有数据库)
async function getTicket() {

  let ticket_data = await ticketModel.find() //里边永远只存一条数据
  let access_token = ''
  let ticket = ''
  let time = new Date().getTime() //当前时间
  if (ticket_data.length > 0) { //判断数据库是否存过ticket
    let t = new Date().getTime() - ticket_data[0].token_time;
    if (t > 7000000) { // 是否过期
      // 重新获取
      await loadData()
      //更新数据中的信息
      await ticketModel.update({},{
        access_token,
        token_time:time,
        jsapi_ticket: ticket,
        ticket_time: time
      })
    } else {
      access_token = ticket_data[0].access_token
      ticket = ticket_data[0].jsapi_ticket
    }
  } else {
    // 重新获取
    await loadData()
    //存储到数据库中(第一次)
    await new ticketModel({
      access_token,
      token_time:time,
      jsapi_ticket: ticket,
      ticket_time: time
    }).save()
  }

  return {
    access_token,
    ticket
  }

  //封装获取access_token jsapi_ticket
  async function loadData() {
    let tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
    let token_data = await axios.get(tokenUrl)
    // console.log('token_data',token_data.data.access_token)
    //得到access_token
    access_token = token_data.data.access_token
  
    //获取jsapi_ticket
    // 文档 https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
    // https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi
  
    let ticketUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`
    //得到jsapi_ticket
    let ticket_data = await axios.get(ticketUrl)
    // console.log('ticket_data',ticket_data.data.ticket)
    ticket = ticket_data.data.ticket

    // console.log('结果',access_token,ticket)
    
  }



  // let tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
  // let token_data = await axios.get(tokenUrl)
  // // console.log('token_data',token_data.data.access_token)
  // //得到access_token
  // let access_token = token_data.data.access_token

  // //获取jsapi_ticket
  // // 文档 https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
  // // https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi

  // let ticketUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`
  // //得到jsapi_ticket
  // let ticket_data = await axios.get(ticketUrl)
  // // console.log('ticket_data',ticket_data.data.ticket)
  // return ticket_data.data.ticket

}

//获取 jsapi_ticket (不用 数据库)
async function getTicketNoSql() {

 let tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
  let token_data = await axios.get(tokenUrl)
  // console.log('token_data',token_data.data.access_token)
  //得到access_token
  let access_token = token_data.data.access_token

  //获取jsapi_ticket
  // 文档 https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
  // https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi

  let ticketUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`
  //得到jsapi_ticket
  let ticket_data = await axios.get(ticketUrl)
  // console.log('ticket_data',ticket_data.data.ticket)
  // return ticket_data.data.ticket

  return {
    access_token,
    ticket:ticket_data.data.ticket
  }

}


// 生成随机字符串
var createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15)
}

//生成时间戳
var createTimestamp = function () {
  return parseInt(new Date().getTime() / 1000) + ''
}

// 处理数据格式方法 -生成签名的string
var row = function (obj) {
  var keys = Object.keys(obj)
  keys.sort()//字典排序
  var newObj = {}
  keys.forEach(key => {
    newObj[key] = obj[key]
  })
  var string = ''
  for (var k in newObj) {
    string += `&${k}=${newObj[k]}`
  }
  string = string.substr(1)  //裁剪第一个 &
  return string
}


//生成signature 及其他数据方法
var sign = async function (url) {
  // const jsapi_ticket = await getTicket()  //有数据库的时候（请求+缓存）
  const jsapi_ticket = await getTicketNoSql()  //没有-数据库的时候（直接请求）
  // console.log("jsapi_ticket", jsapi_ticket)
  var obj = {
    jsapi_ticket:jsapi_ticket.ticket,
    noncestr: createNonceStr(),
    timestamp: createTimestamp(),
    url
  }
  var str = row(obj)
  //生成签名
  var signature = sha1(str)
  obj.signature = signature
  //添加appid
  obj.appid = appid
  return obj

  // https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
  // 签名生成规则如下：
  // 1、参与签名的字段包括noncestr（随机字符串）, 有效的jsapi_ticket, timestamp（时间戳）, url（当前网页的URL，不包含#及其后面部分） 。
  // 2、对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1。
  // 3、这里需要注意的是所有参数名均为小写字符。对string1作sha1加密，字段名和字段值都采用原始值，不进行URL 转义。

}

module.exports = {
  sign,
  getTicket
}