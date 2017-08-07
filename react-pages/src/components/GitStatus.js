import React, { Component } from 'react'
import { Row, Col, ButtonGroup, Button } from 'react-bootstrap'
import {message_object} from './Message'

class MCProConsoleGitStatus extends Component {
    constructor() {
        super();
        this.state = {
            lastChangeTime: '2020-12-31',
            message: ''
        }
    }

    componentDidMount() {
        this.ajax('/state', function(result) {
            this.setState({message: result[0], lastChangeTime: result[1]});
            return 'ok';
        }, 'GET', 'json')
    }

    handlePull()
    {
        this.ajax('/pull', function (text) {
            return text;
        }, 'POST');
    }

    handlePush()
    {
        this.ajax('/push', function (text) {
            return text;
        }, 'POST');
    }

    // ajax git messages via fetch
    ajax(command, success, method = 'GET', response = 'text')
    {
        let url = this.props.uri + command;
        message_object.doFetch(url, url, {'method': method}, function (result) {
            return result[response].call(result).then(success.bind(this))
        }.bind(this));
    }

    render() {
        return (
            <Row>
                <Col md={12} style={{overflow: 'hidden'}}>
                    <Col md={1} xs={2}>
                        <p style={{'margin': '6px 0px 0px 0px'}}>{this.props.name}</p>
                    </Col>
                    <Col md={4} xs={4} style={{'margin': '6px 0px 10px 0px'}}>
                        <kbd>{this.state.lastChangeTime}</kbd>
                    </Col>
                    <Col md={7} xs={6}>
                        <ButtonGroup style={{'margin': '0px 0px 10px 0px'}}>
                            <Button onClick={this.handlePull.bind(this)}>拉取</Button>
                            <Button onClick={this.handlePush.bind(this)}>推送</Button>
                        </ButtonGroup>
                    </Col>
                </Col>
                <Col md={12} xs={12}>
                    <pre>{this.state.message}</pre>
                </Col>
            </Row>
        )
    }
}

MCProConsoleGitStatus.defaultProps = {
    name: 'Unknown Git repo',
    uri: 'http://'
};

export default MCProConsoleGitStatus