import React, { Component } from 'react'
import { Row, Col, FormControl, Button } from 'react-bootstrap'
import { message_object } from '../components/Message'

class MCProConsoleImageConfigPage extends Component {
    constructor() {
        super();
        this.state = {
            MSEModel: '',
            MSECorpus: '',
            ImageConfig: ''
        }
    }

    componentDidMount() {
        fetch('http://localhost:4567/mse/model').then(function (result) {
            result.json().then(function (json) {
                this.setState({MSEModel: json[0], MSECorpus: json[1]})
            }.bind(this))
        }.bind(this));

        fetch('http://localhost:4567/config').then(function (result) {
            result.text().then(function (data) {
                this.setState({ImageConfig: data})
            }.bind(this))
        }.bind(this));
    }

    ajaxSetConfig(target, refName) {
        let content = this.refs[refName].props.value;
        if (!content || content === '')
            return;
        message_object.doFetch('image_mse_config_' + target, 'http://localhost:4567/mse/model',
            {
                method: 'POST',
                body: JSON.stringify({
                    target: target,
                    body: content
                })
            }, function (result) {
                return result.text()
        });
    }

    commitModel() {
        this.ajaxSetConfig('model', 'textareaMSEModel');
    }

    commitCorpus() {
        this.ajaxSetConfig('corpus', 'textareaMSECorpus');
    }

    commitConfig() {
        this.ajaxSetConfig('config', 'textareaImageConfig');
    }

    render()
    {
        return (
            <Row>
                <Col md={12}>
                    <h3 style={{overflow: 'hidden'}} className="page-header">
                        MSE 模板 &nbsp;&nbsp;
                        <Button style={{float: 'right', margin: '1px'}} onClick={this.commitModel.bind(this)}>提交</Button>
                    </h3>
                    <FormControl style={{height: '500px'}} componentClass="textarea" placeholder="textarea" ref="textareaMSEModel" value={this.state.MSEModel} />
                </Col>
                <Col md={12}>
                    <h3 style={{overflow: 'hidden'}} className="page-header">
                        MSE 语料库 &nbsp;&nbsp;
                        <Button style={{float: 'right', margin: '1px'}} onClick={this.commitCorpus.bind(this)}>提交</Button>
                    </h3>
                    <FormControl style={{height: '500px'}} componentClass="textarea" placeholder="textarea" ref="textareaMSECorpus" value={this.state.MSECorpus} />
                </Col>
                <Col md={12}>
                    <h3 style={{overflow: 'hidden'}} className="page-header">
                        程序配置表 &nbsp;&nbsp;
                        <Button style={{float: 'right', margin: '1px'}} onClick={this.commitConfig.bind(this)}>提交</Button>
                    </h3>
                    <FormControl style={{height: '500px'}} componentClass="textarea" placeholder="textarea" ref="textareaImageConfig" value={this.state.ImageConfig} />
                </Col>
            </Row>
        )
    }
}

export default MCProConsoleImageConfigPage
