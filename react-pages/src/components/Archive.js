import React, { Component } from 'react'
import { Row, Col, ButtonGroup, Button } from 'react-bootstrap'

class MCProConsoleArchive extends Component {
    constructor(props) {
        super(props);
        this.props = {
            name: 'Unknown Git repo',
            uri: 'http://'
        };
        this.state = {
            locale: 'zh-CN'
        }
    }

    handleProcess()
    {
        this.ajax('/process', function (result) {

        }, 'post');

    }

    handlePack()
    {
        this.ajax('/pack', function (result) {

        }, 'post');

    }

    handlePull()
    {
        this.ajax('/pull', function (result) {

        }, 'post');
    }

    handleFullPush()
    {
        this.ajax('/full_push', function (result) {

        }, 'post');

    }

    handlePush()
    {
        this.ajax('/push', function (result) {

        }, 'post');
    }

    // ajax git messages via fetch
    ajax(command, success, method = 'GET')
    {
        let url = this.props.uri + '/' + this.state.locale + command;
        fetch(url, {'method': method}).then(function (result) {
            result.json().then(success.bind(this));
        }.bind(this));
    }

    render() {
        return (
            <Row>
                <Col md={12} style={{overflow: 'hidden'}}>
                    <Col md={1} xs={2}>
                        <p style={{'margin': '6px 0px 0px 0px'}}>{this.props.name}</p>
                    </Col>
                    <Col md={2} xs={2} style={{'margin': '6px 0px 10px 0px'}}>
                        <kbd>{this.state.locale}</kbd>
                    </Col>
                    <Col md={9} xs={8}>
                        <ButtonGroup style={{'margin': '0px 0px 10px 0px'}}>
                            <Button bsStyle="warning" onClick={this.handlePull.bind(this)}>拉取</Button>
                            <Button bsStyle="warning" onClick={this.handleProcess.bind(this)}>处理</Button>
                            <Button bsStyle="warning" onClick={this.handlePack.bind(this)}>打包</Button>
                            <Button bsStyle="warning" onClick={this.handlePush.bind(this)}>上传</Button>
                            <Button onClick={this.handleFullPush.bind(this)} bsStyle="danger">一步上传</Button>
                        </ButtonGroup>
                    </Col>
                </Col>
            </Row>
        )
    }
}

export default MCProConsoleArchive
/*
 <Col md={12} xs={12}>
 <pre>{this.state.message}</pre>
 </Col>
 */