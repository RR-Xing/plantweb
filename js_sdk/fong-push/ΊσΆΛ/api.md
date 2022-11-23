

    //发送
    public MobileMessage sendMessage(Message message) throws Exception {
        MobileMessage msg = new MobileMessage();
        msg.setUserId(userId);
        msg.setContent(message.getContent());
        msg.setDocId(mailId);
        msg.setUrl(url);
        msg.setPayload(getPayload(mailId, message.getType().name(), message.getContent()));
        msg.setTitle("邮件提醒");
        msg.setType(message.getType());
        //构造消息Intent
        msg.setIntent(formatIntent(msg));
        msg.setClientId(message.getClientId());

        try {
            PushResult pushResult = pushToSingleOfNotify(client, msg);

        } catch (Exception e) {
            e.printStackTrace();
            //发送异常
        }

        return pushToUser(msg);
    }

    private static PushResult pushToSingleOfNotify(PushClient client, MobileMessage moMsg) {
        PushResult pushResult = new PushResult();
        pushResult.setClientId(client.getClientId());


        try {

            IGtPush push = new IGtPush(configProvider.get().getAppKey(), configProvider.get().getMasterSecret());

            SingleMessage message = new SingleMessage();
            if (client.getOs() == MobileOS.ANDROID) {

                message.setData(getTransmissionTemplate(client, moMsg));

                moMsg.setWay(MobileMessage.MobileMessageWay.TRANSMISSION);

                Integer time = configProvider.get().getAndroidOfflineExpireTime();
                if (time != null && time > 0) {
                    message.setOffline(true);
                    message.setOfflineExpireTime(time);
                }
            } else {
                message.setData(getTransmissionTemplate(client, moMsg));
                moMsg.setWay(MobileMessage.MobileMessageWay.TRANSMISSION);
                //ios要离线，才可以后台接收到推送
                message.setOffline(true);
                message.setOfflineExpireTime(3600 * 1000 * 4);
            }

            Target target = new Target();
            target.setAppId(configProvider.get().getAppId());
            target.setClientId(client.getClientId());

            IPushResult ret = null;
            try {
                ret = push.pushMessageToSingle(message, target);
            } catch (RequestException e) {
                e.printStackTrace();
                ret = push.pushMessageToSingle(message, target, e.getRequestId());
            }

            if (ret != null) {
                Tools.log(ret.getResponse().toString());

                String result = ret.getResponse().get("result").toString();
                Object status = ret.getResponse().get("status");
                pushResult.setResponseMsg(result);
                moMsg.setErrMsg(result);
                moMsg.setClientStatus("successed_offline".equals(status) ? MobileMessage.ClientStatus.OFFLINE : MobileMessage.ClientStatus.ONLINE);
                if ("ok".equals(result)) {
                    moMsg.setState(MessageState.SENDED);
                } else {
                    moMsg.setState(MessageState.FAIL);
                }
                return pushResult;
            } else {
                Tools.log("服务器响应异常");
                pushResult.setResponseMsg("server error");
                moMsg.setErrMsg("server error");
                moMsg.setState(MessageState.FAIL);
                return pushResult;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return pushResult;
    }

    //透传消息
    private static TransmissionTemplate getTransmissionTemplate(PushClient client, MobileMessage moMsg) {
        TransmissionTemplate template = new TransmissionTemplate();
        template.setAppId(configProvider.get().getAppId());
        template.setAppkey(configProvider.get().getAppKey());
        template.setTransmissionType(2);
        template.setTransmissionContent(moMsg.getPayload());

        APNPayload apnPayload = new APNPayload();
        //在已有数字基础上加1显示，设置为-1时，在已有数字上减1显示，设置为数字时，显示指定数字
        if (configProvider.get().getIosBadge())
            apnPayload.setAutoBadge("+1");
        apnPayload.setContentAvailable(1);
        //无声设置为"com.gexin.ios.silence"
        apnPayload.setSound(client.getSound() ? "default" : "com.gexin.ios.silence");
        APNPayload.DictionaryAlertMsg dictionaryAlertMsg = new APNPayload.DictionaryAlertMsg();
        dictionaryAlertMsg.setBody(moMsg.getContentString());
        //        if (title != null)
        dictionaryAlertMsg.setTitle(moMsg.getTitle() == null ? appName : moMsg.getTitle());

        apnPayload.setAlertMsg(dictionaryAlertMsg);
        apnPayload.addCustomMsg("type", moMsg.getType());
        apnPayload.addCustomMsg("id", moMsg.getDocId());

        template.setAPNInfo(apnPayload);
        Notify notify = new Notify();
        notify.setTitle(moMsg.getTitle());
        notify.setContent(moMsg.getContentString());
        notify.setIntent(moMsg.getIntent() == null
                ? "intent:#Intent;launchFlags=0x14000000;component=" + configProvider.get().getPackageName() + "/io.dcloud.PandoraEntry;end"
                : "intent:" + moMsg.getIntent());

        notify.setType(GtReq.NotifyInfo.Type._intent);
        template.set3rdNotifyInfo(notify);

        return template;
    }


    private String formatIntent(MobileMessage msg) throws UnsupportedEncodingException {

        return "#Intent;" +
                "launchFlags=0x14000000;" +
                "component=" + configProvider.get().getPackageName() + "/io.dcloud.PandoraEntry;" +
                "S.UP-OL-SU=true;" +
                "S.title=" + URLEncoder.encode(msg.getTitle(), "UTF-8") + ";" +
                "S.content=" + URLEncoder.encode(msg.getContentString(), "UTF-8") + ";" +
                "S.payload=" + URLEncoder.encode(msg.getPayload(), "UTF-8") + ";" +
                "end";
    }

    private String getPayload(String id, String type, String msg) {
        JSONObject payload = new JSONObject();
        payload.put("id", id);
        payload.put("type", type);
        payload.put("msg", msg);
        return payload.toString();
    }

    private String getPayloadUrl(String msg, String url) {
        JSONObject payload = new JSONObject();
        payload.put("id", "");
        payload.put("type", "URL");
        payload.put("msg", msg);
        payload.put("content", msg);
        payload.put("url", url);
        return payload.toString();
    }

