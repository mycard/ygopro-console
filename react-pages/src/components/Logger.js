import React, { Component } from 'react'

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
        console.log(data);
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
        MCProConsoleLogger.map.get(this.props.source).source.removeEventListener('message', this.updateMessage)
        this.setState({inDOM: false});
    }

    createListener()
    {
        let logSource = new EventSource(this.props.source,{ withCredentials: true });
        let message = 'Message listener started on [' + Date.now() + ']';
        let data = {
            'message': message,
            'source': logSource
        };
        logSource.addEventListener('message', function (e) {
            data.message = data.message + "\n" + e.data;
        });
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
    src: ''
};
MCProConsoleLogger.map = new Map();

export default MCProConsoleLogger