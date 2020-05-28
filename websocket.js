'use strict'
/**
 * 
 * @param {*} url websocket address
 * @param {*} is_reconnect  Disconnect the reconnection
 * @param {*} protocol websocket protocol
 * @param {*} notify The background actively sends notifications to the front end
 */
function WebSocketObj(url, is_reconnect, protocol, notify) {
    this.url = url;
    this.protocol = protocol;
    this.is_reconnect = is_reconnect;
    this.scoketconnecttimeout = null;
    this.scoketconnectid = null;
    this.notify = notify;
    this.connect();
}
WebSocketObj.prototype = {
    connect:function(){
        var self = this;
        if (window.location.protocol.indexOf("https") > -1) {
            if (!self.protocol) {
                self.websocketintance = new WebSocket("wss://" + self.url + ":10086");
            } else {
                self.websocketintance = new WebSocket("wss://" + self.url + ":10086", self.protocol);
            }
        } else {
            if (!self.protocol) {
                self.websocketintance = new WebSocket("ws://" + self.url + ":10086");
            } else {
                self.websocketintance = new WebSocket("ws://" + self.url + ":10086", self.protocol);
            }
        }
        self.websocketintance.onmessage = function (result) {
            var data = JSON.parse(result.data);
            if (self.scoketconnecttimeout) {
                clearTimeout(self.scoketconnecttimeout);
                self.scoketconnecttimeout = null;
            }
            if (typeof self.notify === "function") {
                self.notify(data);
            }
        }
        self.websocketintance.onclose = function () {
            self.closeWebsocket();
            console.log("websoket is disconnect");
            if (self.is_reconnect) {
                self.reconnect();
            }
        }
    },
    sendMessage: function (message, callback) {
        var that = this;
        if (that.websocketintance.readyState === 0) {
            that.websocketintance.onopen = function () {
                if (message) {
                    if (typeof message === "string") {
                        that.websocketintance.send(message);
                    } else {
                        that.websocketintance.send(JSON.stringify(message));
                    }
                }
            }
        } else {
            if (message) {
                if (typeof message === "string") {
                    that.websocketintance.send(message);
                } else {
                    that.websocketintance.send(JSON.stringify(message));
                }
            }
        }
        that.websocketintance.onmessage = function (result) {
            var data = JSON.parse(result.data);
            if (this.scoketconnecttimeout) {
                clearTimeout(this.scoketconnecttimeout);
                this.scoketconnecttimeout = null;
            }
            if (callback && data) {
                callback(data);
            }
        }
    },
    closeWebsocket: function () {
        this.websocketintance.close();
    },
    reconnect: function () {
        var that = this;
        this.scoketconnecttimeout = setTimeout(function () {
            that.connect();
            that.notify();
        }, 5000)
    }
}