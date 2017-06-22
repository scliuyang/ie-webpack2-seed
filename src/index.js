/**
 * 组件显示方法,只支持jquery包裹一次的父节点缓存
 * 如果组件第一次显示则append到父节点
 * 如果组件不是第一次则$(xx).show()
 */
window.componentShow = (function () {
    const cache = {};
    return function (parent, dom, id) {
        if (!id) {
            id = Math.random();
        }
        if (!cache[id]) {
            cache[id] = true;
            $(parent).append(dom);
        }
        $(dom).show();
        return id;
    }
})();





$.ajaxSetup({
    timeout: 10000,
    cache: false,
    dataType: 'json',
    processData: false,
    success(result, status, xhr) {

        if (result.resultCode !== '00000') {
            components.dialog.open('错误:' + JSON.stringify(result) + '  path:' + xhr.setting.url);
            throw new Error(result.msg);
        }
    },
    error(xhr, text, error) {

        if (xhr.readyState !== 0) {
            console.error(xhr.setting, xhr, text, error);
            components.dialog.open('错误:' + error + '  path:' + xhr.setting.url);
        }

    },
    beforeSend(xhr, setting) {
        xhr.setting = setting;
        setting.url = '/jtalk' + setting.url;

        setting.contentType = setting.contentType === false ? setting.contentType : 'application/json; charset=utf-8';

        if (setting.contentType && setting.contentType.indexOf('json') > -1) {
            let data = setting.data || {};
            setting.data = JSON.stringify(data);
        }



        xhr.setRequestHeader('web_personal_key', window.webPersonalKey);

    }
});

// 必须保证先返回
$.ajax({
    url: '/message/login/key.htm',
    type: 'post',
    contentType: 'application/json; charset=utf-8'
}).then((result) => {
    window.jdPin = result.data.jdPin;
    window.webPersonalKey = result.data.webPersonalKey;
    window.userId = result.data.userId;
}).then(() => {
    init();
});


function init() {
    $(function () {
        // 注册头部
        components.header('.body-content');
        // 注册内容
        components.content('.body-content');
    });
}