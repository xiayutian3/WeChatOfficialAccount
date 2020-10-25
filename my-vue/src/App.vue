<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
      <input type="button" value="微信扫一扫" @click="scanCode" />
    </div>
    <router-view />
  </div>
</template>

<script>
// import axios from 'axios'
// import wx from 'weixin-js-sdk'
export default {
  name: 'app',
  data () {
    return {
    }
  },
  mounted () {
    // console.log('weixin', wx)
    // console.log('axios', axios)
    this.wxconfig()
  },
  methods: {
    wxconfig () {
      // 新浪云 http://xiayutian.applinzi.com/jsapi
      // http://localhost:3000/jsapi
      console.log('url', location.href.split('#')[0])
      axios
        .get('http://xiayutian.applinzi.com/jsapi', {
          params: {
            // 如果url有//#endregion号，不要#号后边的内容,  encodeURIComponent处理url编码
            url: encodeURIComponent(location.href.split('#')[0])
          }
        })
        .then((res) => {
          // console.log('res.data', res)
          const { appid, timestamp, noncestr, signature } = res

          wx.config({
            debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: appid, // 必填，公众号的唯一标识
            timestamp, // 必填，生成签名的时间戳
            nonceStr: noncestr, // 必填，生成签名的随机串
            signature, // 必填，签名
            jsApiList: ['scanQRCode'] // 必填，需要使用的JS接口列表
          })
        })
    },
    scanCode () {
      wx.scanQRCode({
        needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
        success: function (res) {
          var result = res.resultStr // 当needResult 为 1 时，扫码返回的结果
          console.log('scanCode -> result', result)
        }
      })
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
