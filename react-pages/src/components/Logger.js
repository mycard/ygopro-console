import React, { Component } from 'react'
import moment from 'moment'

class MCProConsoleLogger extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            logMessage: '',
            inDOM: false
        };
    }

    componentDidMount()
    {
        if (!(MCProConsoleLogger.map.has(this.props.source)))
            this.createListener();
        let data = MCProConsoleLogger.map.get(this.props.source);
        this.setState({ logMessage: data.message, inDOM: true });
        data.source.addEventListener('message', this.updateMessage.bind(this));
    }

    updateMessage()
    {
        if (this.state.inDOM)
            this.setState({logMessage: MCProConsoleLogger.map.get(this.props.source).message});
    }

    componentWillUnmount()
    {
        MCProConsoleLogger.map.get(this.props.source).source.removeEventListener('message', this.updateMessage);
        this.setState({inDOM: false});
    }

    createListener()
    {
        let logSource = new EventSource(this.props.source,{ withCredentials: true });
        let message = 'Message listener started on [' + moment().format('YYYY-MM-DD HH:mm:ss') + ']';
        let data = {
            'message': message,
            'source': logSource
        };
        logSource.addEventListener('message', function (e) {
            // console.log("message", e);
            data.message = data.message + "\n" + e.data;
        });
/*
        logSource.addEventListener('error', function (e) {
            console.log("error", e);
        });

        logSource.addEventListener('open', function (e) {
            console.log("open", e);
        });
        */
        MCProConsoleLogger.map.set(this.props.source, data);
    }

    render()
    {
        return (
            <pre style={{height: '700px'}}>{this.state.logMessage}</pre>
        );
    }
}

MCProConsoleLogger.defaultProps = {
    source: ''
};
MCProConsoleLogger.map = new Map();

export default MCProConsoleLogger