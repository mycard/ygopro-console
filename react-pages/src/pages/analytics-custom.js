import React, { Component } from 'react'
import { Row, Col, Panel } from 'react-bootstrap'
import { message_object } from "../components/Message"
import config from '../Config.json'
import { LinkContainer } from 'react-router-bootstrap'
import MCProConsoleTimeRangePicker from "../components/Timerange"

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
        this.getData();
    }

    getData()
    {
        let url = new URL(config.serverHost + 'analyze/custom');
        this.refs.time.setUrl(url);
        message_object.doFetch("analyze custom", url.toString(), {}, function (result) {
            return result.json().then(function (result) {
                this.setState({customResults: result});
                return result.length + ' objects';
            }.bind(this));
        }.bind(this));
    }

    renderCount(data)
    {
        let tag = data.tag || {};
        let style = tag.type || 'default';
        return (
            <Col md={4} xs={6}>
                <Panel header={data.name} bsStyle={style}>{data.result[0].count}</Panel>
            </Col>
        )
    }

    renderTable(data)
    {
        return <div></div>
    }

    render()
    {
        return (
        <Row>
            <Col md={3} xs={12}>
                <div style={{margin: "10px 10px 10px 15px"}}>
                    <MCProConsoleTimeRangePicker ref="time" onChanged={this.getData.bind(this)} />
                </div>
            </Col>
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
            <Col md={12} xs={12} style={{textAlign: "center"}}>
                <LinkContainer to="/analytics/custom-set"><a>点此进行设置</a></LinkContainer>
            </Col>
        </Row>);
    }
}
export default MCProConsoleAnalyticsCustomPage;