import React, { Component } from 'react'
import { Row, Col, Panel } from 'react-bootstrap'
import { message_object } from "../Message"
import config from '../Config.json'

class MCProConsoleAnalyticsCustomPage extends Component
{
    constructor()
    {
        super();
        this.state = {
            customResults: []
        }

    }

    componentDidMount()
    {
        message_object.doFetch("analyze custom", config.serverHost + 'analyze/custom', {}, function (result) {
            result.json().then(function (result) {
                this.setState({customResults: result})
            }.bind(this));
            return 'ok'
        }.bind(this));
    }

    renderCount(data)
    {
        return (
            <Col md={4} xs={12}>
                <Panel header={data.name}>{data.result[0].count}</Panel>
            </Col>
        )
    }

    renderTable(data)
    {
        <div></div>
    }

    render()
    {
        return (<Row>
            <Col md={12} xs={12}>
                {
                    this.state.customResults.map(function (data) {
                        if (data.result.length === 1 && data.result[0].count)
                            return this.renderCount(data);
                        else
                            return this.renderTable(data);
                    }.bind(this))
                }
            </Col>
        </Row>);
    }
}
export default MCProConsoleAnalyticsCustomPage;