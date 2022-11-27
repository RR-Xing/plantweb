<template>
  <div class="all col-12 col-lg-9">
    <view class="tiMu d">
      <text>AI护—城市净氧中心</text>
    </view>
    <view class="fu">
      <text class="alert alert-info col-11 col-lg-9">样板程序，仅供展示</text>
      <text class="alert alert-info col-11 col-lg-9">无浇水阈值设置，完整功能请联系作者</text>
    </view>
    <hr class='tou'>
    <view class="content d col-11 col-lg-7">
      <view>
        <text class='biaoTi'>土壤湿度：</text>
        <text class='jieGuo'>{{shiDu}}</text>
      </view>
      <view>
        <text class='biaoTi'>水槽水量情况：</text>
        <text class='jieGuo'>{{shuiCao}}</text>
      </view>
      <view>
        <text class='biaoTi'>烟雾浓度：</text>
        <text class='jieGuo'>{{yanWu}}</text>
      </view>
      <view>
        <text class='biaoTi'>小风扇状态：</text>
        <text class='jieGuo'>{{fengShan}}</text>
      </view>
      <view class="hao d">
        <text class='biaoTi'>最后更新时间：</text>
        <text class='jieGuo'>{{time}}</text>
      </view>
    </view>
  </div>
  <view class="copy">
    <hr class='di'>
    <text>Copyright ©2022 by RR-Xing</text>
    <text>(https://rr-xing.rth1.one)</text>
    <text id="xiao">开源：</text>
    <text>https://github.com/RR-Xing/plantweb</text>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        shiDu: '正在获取',
        time: '正在获取',
        shuiCao: '正在获取',
        yanWu: '正在获取',
        fengShan: '正在获取',
        jia: false
      }
    },

    onShow() {
      if (!this.jia) {
        this.huoQu()
        this.timer = setInterval(() => this.huoQu(), 60000)
        this.jia = true
      }
    },
    onUnload() {
      clearInterval(this.timer)
    },
    methods: {
      huoQu() {
        uni.showLoading({
          title: '正在获取最新数值……'
        });
        uni.request({
          url: 'https://iot_s1.dfrobot.com.cn/apiv2/messages?topic=9QOBcXG4g&order=desc&field=created&pnum=1&psize=1000&begin=&end=&token=d5cb32edc0f0b3d9915f03cf1d7ea97a&iname=wBE94qNnR&ipwd=wfE9VqHngz',
          method: 'GET',
          dataType: 'json',
          timeout: 30000,
          success: (res) => {
            uni.showToast({
              title: '更新成功！'
            });
            console.log(res)
            let shuJu = res.data.data.docs[0]
            let shu = shuJu.message.split('#')
            this.shiDu = shu[1] + '%'
            this.shuiCao = shu[2]
            this.yanWu = Math.floor(shu[3] / 1023 * 100) + '%'
            this.fengShan = shu[4]
            this.time = shuJu.created
          },
          fail: (err) => {
            clearInterval(this.timer)
            this.shiDu = '获取失败'
            this.shuiCao = "获取失败"
            this.time = '获取失败'
            this.yanWu = '获取失败'
            this.fengShan = '获取失败'
            uni.showModal({
              title: "获取失败" + err,
              confirmText: '重试',
              success: (res) => {
                if (res.confirm) {
                  this.timer = setInterval(() => this.huoQu(), 60000)
                }
              }
            })
          },
          complete: () => {
            uni.hideLoading()
          }
        })
      }
    }
  }
</script>

<style>
  @import url(https://cdn.staticfile.org/twitter-bootstrap/5.1.1/css/bootstrap.min.css);

  @font-face {
    font-family: 'tit';
    src: url(https://vkceyugu.cdn.bspapp.com/VKCEYUGU-9ca91e29-6a09-4cad-a876-ffa5f33086fc/1bc42c18-9119-40e8-be9d-8ad7deab7470.ttf);
    font-display: swap;
  }

  @font-face {
    font-family: 'gosh';
    src: url(https://vkceyugu.cdn.bspapp.com/VKCEYUGU-9ca91e29-6a09-4cad-a876-ffa5f33086fc/76f111de-5b80-498a-98f4-ffb2107858b9.ttf);
    font-display: swap;
  }

  .all {
    background-color: rgba(106, 107, 111, 0.4);
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .tiMu {
    display: flex;
    justify-content: center;
    color: #20a162;
  }

  .tiMu text {
    font-size: 75rpx;
    font-family: 'tit';
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(107, 108, 111, 0.35);
    border-radius: 10rpx;
    padding-top: 30rpx;
  }

  page {
    background-image: url(https://vkceyugu.cdn.bspapp.com/VKCEYUGU-9ca91e29-6a09-4cad-a876-ffa5f33086fc/742a1c36-1e06-428f-9708-f8bc33d84fb3.webp);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hao {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx;
  }

  .biaoTi {
    font-family: 'gosh';
    font-size: 55rpx;
  }

  .jieGuo {
    font-family: 'gosh';
    align-self: center;
    margin-bottom: auto;
    font-size: 45rpx;
  }

  .shuoMing {
    font-size: 35rpx;
    color: white;
  }

  .copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(39, 40, 51, 0.8);
    margin-top: auto;
    align-self: flex-end;
    width: 100%;
  }

  .copy text {
    margin: 10rpx 0;
    color: aliceblue;
    font-weight: lighter;
    font-size: 40rpx;
  }

  #xiao {
    font-size: 35rpx;
  }

  .di {
    color: #63bbd0;
    width: 100%;
    height: 3rpx;
    margin: 0;
  }

  .d {
    margin: 50rpx 0;
  }

  .fu {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
  }

  .alert {
    margin: 20rpx;
    padding-left: 1.5rem;
    opacity: 0.8;
  }

  .tou {
    height: 20rpx;
    color: #20a162;
    width: 35%;
    opacity: 0.75;
    margin-top: 40rpx;
  }
</style>
