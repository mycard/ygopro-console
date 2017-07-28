import React, { Component } from 'react';
import { Alert } from 'react-bootstrap'

class MCProConsoleMessagePusher extends Component
{
    constructor()
    {
        super();
        this.messageLinks = new Map();
        this.state = {
            messages: []
        };
        message_object = this;
    }

    addMessage(key, message, level, timeout = -1)
    {
        if (this.messageLinks.has(key)) {
            this.replaceMessage(key, message, level, timeout);
            return;
        }
        let data = {
            'message': message,
            'level': level,
            'key': key
        };
        this.state.messages.push(data);
        this.messageLinks.set(key, data);
        if (timeout > 0)
            setTimeout(function() {this.removeMessage(key)}.bind(this), timeout);
        this.forceUpdate();
    }

    replaceMessage(key, message, level, timeout = -1)
    {
        if (!this.messageLinks.has(key))
            this.addMessage(key, message, level, timeout);
        else {
            let data = this.messageLinks.get(key);
            data.message = message;
            data.level = level;
            if (timeout > 0) setTimeout(function () {
                this.removeMessage(key)
            }.bind(this), timeout);
            this.forceUpdate();
        }
    }

    removeMessage(key)
    {
        let data = this.messageLinks.get(key);
        this.messageLinks.delete(key);
        let index = this.state.messages.indexOf(data);
        if (index >= 0)
            this.state.messages.splice(index, 1);
        this.forceUpdate();
    }

    removeMessageDismiss()
    {
        console.log(this);
        this.caller.removeMessage.call(this.caller, this.data.key);
    }

    doFetch(key, uri, parameters, callback)
    {
        let method = parameters.method;
        if (method === undefined) method = 'GET';
        // REMOVE QUERIES
        let originUri = uri;
        let index = originUri.indexOf('?');
        if (index > 0)
            originUri = originUri.slice(0, index);
        // USER AND SIGNATURE
        if (window.localStorage.token)
        {
            let url = new URL(uri);
            let params = url['searchParams'];
            params.set('sso', window.localStorage.token);
            params.set('sig', window.localStorage.signature);
            uri = url.toString();
        }
        this.addMessage(key, method + ' ' + originUri, 'info', 600000);
        return fetch(uri, parameters).then(function(result)
        {
            let inner_message = '';
            if (result.ok)
                inner_message = callback.call(this, result);
            else
                inner_message = result.statusText;
            let level = result.ok ? 'success' : 'danger';
            Promise.resolve(inner_message).then(function(inner) {
                let message = (
                    <div>
                        <strong>{result.status} - {method} {originUri}</strong><br />
                        {inner}
                    </div>
                );
                this.replaceMessage(key, message, level, 5000);
            }.bind(this))
        }.bind(this)).catch(function (fail) {
            let message = (
                <div>
                    <strong>Fail - {method} {originUri}</strong><br />
                </div>
            );
            this.replaceMessage(key, message, 'danger', 5000);
        }.bind(this));
    }

    render()
    {
        return (
            <div style={{width: '400px', height: '1000px', position: 'fixed', bottom: '25px', right: '25px', zIndex: 100, pointerEvents: 'none', display: navigator.userAgent.indexOf("Mobile") > 0 ? 'none' : 'flex', flexDirection: 'column-reverse'}}>
                {this.state.messages.map(function(data) { return (
                    <Alert bsStyle={data.level} onDismiss={this.removeMessageDismiss.bind({caller: this, 'data': data})}>
                        {data.message}
                    </Alert>
                )}.bind(this))}
            </div>
        )
    }
}

export default MCProConsoleMessagePusher
export let message_object = undefined;
export let messages = <MCProConsoleMessagePusher />;