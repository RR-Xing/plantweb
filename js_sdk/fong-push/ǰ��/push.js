(function () {

    function pushReady() {

        function pushToPage(anc) {
            plus.nativeUI.toast('push jump：' + JSON.stringify(anc))
            const url = '/pushFilter?pushId=' + anc.id + '&pushType=' + anc.type + '&pushUrl=' + anc.url + '&title=' + (!anc.content ? anc.msg : anc.content)

            uni.navigateTo({
                url: url
            })

        }

        plus.nativeUI.toast('plus ready')

        plus.push.addEventListener('click', function (msg) {
            // IOS后台的消息是msg.payload对象,前台的消息是msg.payload字符串
            plus.nativeUI.toast('click:' + JSON.stringify(msg))
            if (msg.payload.id == null) {
                pushToPage(JSON.parse(msg.payload))
            } else {
                pushToPage(msg.payload)
            }
        })


        // 安卓的推送，点击后触发receive,IOS的通知点击的时候触发click监听器
        // ios使用透传，接收后触发receive
        plus.push.addEventListener('receive', function (msg) {
            plus.nativeUI.toast('receive:' + JSON.stringify(msg))
            let payload = msg.payload
            // IOS接收后创建本地消息,本地消息会再次触发receive,所以判断是否本地创建的,将其它数据封装在payload(需为字符串)中
            // 直发时，content = payload = {}
            if (plus.os.name !== 'Android' && msg.type === 'receive') {
                let content = payload.msg
                let tit = payload.title
                let pl = {
                    'title': tit,
                    'content': content,
                    'id': payload.id,
                    'type': payload.type,
                    'url': payload.url
                }
                plus.push.createMessage(content, JSON.stringify(pl), {'title': tit})
            }

            if (plus.os.name === 'Android' && msg.content.indexOf('{') === 0) {
                plus.nativeUI.toast('payload:' + payload)
                payload = JSON.parse(payload)
                let content = payload.msg
                let tit = payload.title
                let pl = {
                    'title': tit,
                    'content': content,
                    'id': payload.id,
                    'type': payload.type,
                    'url': payload.url
                }
                plus.nativeUI.toast(content + '_' + JSON.stringify(pl))
                plus.push.createMessage(content, JSON.stringify(pl), {'title': tit})
            }

            if (plus.os.name === 'Android' && msg.content.indexOf('{') === -1) {

                let anc = JSON.parse(msg.payload)

                let pl = {
                    'title': msg.title,
                    'content': msg.content,
                    'id': anc.id,
                    'type': anc.type,
                    'url': anc.url
                }
                plus.push.createMessage(msg.content, JSON.stringify(pl), {'title': msg.title})
            }
        })
    }

    //#ifdef APP-PLUS
    pushReady()
    //#endif
})()
