import React, { Component } from 'react'
import { Row, Col } from 'react-bootstrap'

class MCProConsoleDatabasePage extends Component
{
    constructor()
    {
        super();
        this.state = {
          databaseLastChangeTime: '2017-06-01'
        };
    }

    componentDidMount()
    {
        fetch('https://api.github.com/repos/moecube/ygopro-database/commits').then(function(res) {
            if (res.ok) {
                res.json().then(function(data) {
                    console.log(data[0].commit.committer.date);
                    this.setState({databaseLastChangeTime: data[0].commit.committer.date});
                }.bind(this))
            }
        }.bind(this));
    }

    render()
    {
        return (
            <Row>
                <Col md={12}>
                    <h2 className="page-header">数据库状态</h2>
                    <p>数据库当前源为</p>
                    <p>最后更新于<kbd>{this.state.databaseLastChangeTime}</kbd></p>
                </Col>
                <Col md={12}>
                    点此更新数据库
                </Col>
            </Row>
        )
    }
}

export default MCProConsoleDatabasePage