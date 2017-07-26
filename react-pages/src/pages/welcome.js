import React, { Component } from 'react'
import { Row, Col, PageHeader } from 'react-bootstrap'

class MCProConsoleWelcomePage extends Component
{
    render()
    {
        return (
            <Row>
                <Col md={12}>
                    <PageHeader>MCPro 后台管理系统</PageHeader>
                    <p>梦想世界，在你手中。</p>
                    <p>芳心自诩，不得始终。</p>
                </Col>
            </Row>
        )
    }
}

export default MCProConsoleWelcomePage