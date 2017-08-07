import React, { Component } from 'react'
import { Row, Col, Button, FormControl, FormGroup } from 'react-bootstrap'
import { Redirect } from 'react-router'
import {message_object} from "../components/Message"
import config from "../Config.json"

class MCProConsoleAnalyticsCustomSetPage extends Component
{
    constructor()
    {
        super();
        this.inputConfigArea = null;
        this.state = {
            redirect: false,
            validJson: null
        };
    }

    componentDidMount()
    {
        message_object.doFetch("analytics config get", config.serverHost + "analyze/custom/commands", {}, function (result) {
            result.text().then(function (result) {
                this.inputConfigArea.value = result;
            }.bind(this))
        }.bind(this))
    }

    commitCommands()
    {
        message_object.doFetch("analytics config set", config.serverHost + "analyze/custom/commands", {method: 'POST', body: this.inputConfigArea.value}, function (result) {
            this.setState({redirect: true});
            return 'ok';
        }.bind(this));
    }

    onTextChange()
    {
        try {
            JSON.parse(this.inputConfigArea.value);
            this.setState({validJson: "success"});
        }
        catch(e) {
            this.setState({validJson: "error"});
        }
    }

    render()
    {
        if (this.state.redirect)
            return <Redirect push to="/analytics/custom" />;
        return (<Row>
            <Col md={12} xs={12}>
                <h3 style={{overflow: 'hidden'}} className="page-header">
                    自定义查询 &nbsp;&nbsp;
                    <Button style={{float: 'right', margin: '1px'}} onClick={this.commitCommands.bind(this)}>提交</Button>
                </h3>
                <FormGroup  validationState={this.state.validJson}>
                    <FormControl style={{height: '500px'}} componentClass="textarea" placeholder="textarea" inputRef={ref => this.inputConfigArea = ref} onChange={this.onTextChange.bind(this)} />
                </FormGroup>
            </Col>
        </Row>)
    }
}

export default MCProConsoleAnalyticsCustomSetPage;