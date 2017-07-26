import React, { Component } from 'react'
import { Row, Col  } from 'react-bootstrap'

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
                <Col md="12">
                    <h2 className="page-header">数据库</h2>
                </Col>
                <Col md="12">
                    <h2 className="page-header">日志</h2>
                    <pre style={{height: '600px'}}>{this.state.logMessage}</pre>
                </Col>
            </Row>
        )
    }
}

export default MCProConsoleAnalyticsGeneralPage