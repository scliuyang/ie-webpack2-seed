import jquery from 'jquery';
import globalVar from 'globalVar';
import moment from 'moment';
import * as Constants from './talkConstants';
import botParse from './botContentParse';
/**
* {
       msgType:"01",//消息类型，参照ImmediateMsgTypeEnum。必填项
       userA:"sunyinjie", //用户1的userId，当msgType！=02时，必填。
       userB:"liwei", //用户2的userId，当msgType！=02时，必填。
       groupId:"12545",//群组ID，当msgType==02时，必填。
       pageSize:10,//页面大小
       currentPage:1,//查询页数
       startDate:起始时间,
       endDate:结束时间
   }

   ONLINE("1","上线"),
   TALK("2","即时消息"),
   ROBOT_TALK("3","即时消息机器人"),
   FILE("4","文件"),
   OFFLINE("9","下线");
*/
export function historyMsg(data) {

    data.userA = globalVar.targetServiceId;
    data.userB = globalVar.userId;
    data.msgType = globalVar.targetServiceId === globalVar.botId ? 3 : 2;
    return $.ajax({
        url: '/webpage/records/get.htm',
        contentType: 'application/json; charset=utf-8',
        type: 'post',
        data
    })
}

// 查询客服ID
export function queryServiceId(groupId) {
    return $.ajax({
        type: 'post',
        url: '/IncomingLine/selectCustomerServiceInGroup.htm',
        contentType: 'application/json; charset=utf-8',
        data: {
            groupId,
            initSource: '03'
        },
    });
}

// 长轮训10S
export function pollMsg() {
    return $.ajax({
        type: 'post',
        timeout: 60000,
        contentType: 'application/x-www-form-urlencoded; charset=utf-8',
        url: `/message/conn?type=conn&time=${Date.now()}`,
        errorIgnore: true,
        data: `jtalkUserId=${globalVar.userId}&webUniqueKey=${globalVar.uuid}`
    });
}

// 获取离线消息
export function getOfflineMsg(params) {
    return $.ajax({
        type: 'post',
        url: '/message/offlinemsg/get.htm',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
    });
}


/**
 * 发送消息
 * @param {string} targetUserId 接收用户ID
 * @param {object} data {content:'xx'} 发送内容
 * @param {object} ext
 * {
 *  type:'request_text',
 *  sceneCode:'ask',
 *  sceneItem: id,
 *  msgId: 123
 * }
 */
export function sendMsg(targetUserId, data = {}, ext = {}) {
    data.time = moment().format('YYYY-MM-DD HH:mm:ss:SSS');

    data.type = globalVar.msgType;
    data.dialogId = globalVar.dialogId;
    console.log('发送消息==>', data.content);
    if (data.type === Constants.MSG_TYPE_BOT) {
        let extendData = {
            identityId: globalVar.jdPin,
            currentUser: globalVar.userId,
            terminalType: 'pc',
            msgId: '123',
            interactionType: ext.type
        };

        // request_text（文本）question必填
        if (ext.type === Constants.INTERACTION_TEXT) {
            extendData.question = data.content;
        }

        // request_normal_select||request_feedback_select sceneCode、sceneItem必填；
        if (ext.type === Constants.INTERACTION_FEEDBACK_SELECT || ext.type === Constants.INTERACTION_NORMAL_SELECT) {
            extendData.sceneCode = ext.sceneCode;
            extendData.sceneItem = ext.sceneItem;
            extendData.msgId = ext.msgId;
        }

        data.content = JSON.stringify(extendData);

    }

    return $.ajax({
        url: `/message/onlinemsg/send.htm?targetUserId=${targetUserId}`,
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data
    });
}

// 获取分组列表
export function getServiceList(data = {
    source: '03'
}) {
    return $.ajax({
        type: 'post',
        url: '/IncomingLine/selectShownBusiness.htm',
        contentType: 'application/json; charset=utf-8',
        data,
    });
}

/**
 * 消息回执
 * @param {*} params
 * "msgId": "asdf", //消息ID
 * "toUserId": "10231233111", //对方用户ID
 * "packetId": "322345" //包ID，用户PC端
 */
export function msgReceipt(params) {
    return $.ajax({
        type: 'post',
        url: '/message/ack/handler.htm',
        contentType: 'application/json; charset=utf-8',
        data: {
            msgId: params.msgId,
            toUserId: params.toUserId,
            packetId: params.packetId
        }
    });
}


export function inlineInit() {
    return jquery.ajax({
        url: '/IncomingLine/incomingLine.htm',
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        noParse: true,
        data: {
            initSource: '03'
        }
    }).then((result) => {
        const data = result.data;

        if (data.queueLength) {
            return globalVar.queueLength = data.queueLength;
        }

        globalVar.dialogId = data.currentDialogId;
        globalVar.targetServiceId = data.toUserId;
        globalVar.msgType = data.currentDialogType == 1 ? Constants.MSG_TYPE_BOT : Constants.MSG_TYPE_SERVICE;
        if (data.content) {
            let botContent = botParse(data.content);
            globalVar.welcomeWords = botContent.answer;
        }


    });
}

/**
 * 获取智能提示的文案
 * @param {*} inputText 输入文案
 */
export function autoComplete(inputText) {
    return new Promise((resolve) => {
        setTimeout(function () {
            let data = [{
                text: '提示1'
            }, {
                text: '提示2'
            }];
            data.push({
                text: Math.random()
            })

            resolve({
                data
            });
        }, Math.ceil(Math.random() * 2000));
    });

}
