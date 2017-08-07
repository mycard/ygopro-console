import React, { Component } from 'react'
import { Row, Col, Panel, Button } from 'react-bootstrap'
import Config from '../Config.json'
import MCProConsoleLogger from '../components/Logger'
import {message_object} from '../components/Message'

class MCProConsoleImageManagerStatePage extends Component {
    constructor() {
        super();
        this.state = {
            nativeStatus: '',
            appveyorStatus: '那我当然还没有做啊'
        };
    }

    componentDidMount() {
        fetch(Config.imageServerHost + 'run/state').then(function(result){
            return result.json()
        }).then(function (json) {
            let stateStr = json[0] ? (
                <div>
                    <p>任务 <kbd>{json[2]}</kbd> 开始于 <kbd>{json[1]}</kbd></p>
                    <Button onClick={this.onStopNativeClicked.bind(this)}>停止</Button>
                </div>
            ) : <div>闲置</div>;
            this.setState({
                nativeStatus: stateStr
            })
        }.bind(this));
    }

    onStopNativeClicked()
    {
        message_object.doFetch('stop-native', Config.imageServerHost + 'run/abort', { method: 'POST' }, function (result) {
            this.forceUpdate();
            return result.text();
        }.bind(this));
    }

    render() {
        return (
            <Row>
                <Col md={12}>
                    <h2 className="page-header">执行器状态</h2>
                    <Col md={6}>
                        <Panel header="本地" bsStyle="success">
                            <div>
                                {this.state.nativeStatus}
                            </div>
                        </Panel>
                    </Col>
                    <Col md={6}>
                        <Panel header="远端" bsStyle="success">
                            <div>
                                当然没有做啦
                            </div>
                        </Panel>
                    </Col>
                </Col>
                <Col md={12}>
                    <h2 className="page-header">日志</h2>
                    <MCProConsoleLogger source={Config.imageServerHost + 'log'}/>
                </Col>
            </Row>
        )
    }
}

export default MCProConsoleImageManagerStatePage