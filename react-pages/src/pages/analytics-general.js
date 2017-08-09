import React, { Component } from 'react'
import MCProConsoleLogger from '../components/Logger'
import { Row, Col  } from 'react-bootstrap'
import config from '../Config.json'

class MCProConsoleAnalyticsGeneralPage extends Component
{
    constructor()
    {
        super();
        this.state = {
           logMessage: ''
        };
    }

    render()
    {
        return (
            <Row>
                <Col md={12} xs={12}>
                    <h2 className="page-header">数据库</h2>
                </Col>
                <Col md={12} xs={12}>
                    <h2 className="page-header">日志</h2>
                    <MCProConsoleLogger source={config.analyticsServerHost + 'log'} />
                </Col>
            </Row>
        )
    }
}

export default MCProConsoleAnalyticsGeneralPage