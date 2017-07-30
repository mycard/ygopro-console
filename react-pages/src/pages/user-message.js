import React, { Component } from 'react'
import { Row, Col, FormGroup, InputGroup, FormControl, Button, Table, Pagination } from 'react-bootstrap'
import {message_object} from "../Message"
import config from '../Config.json'
import moment from 'moment'

class MCProConsoleUserMessagePage extends Component
{
    constructor()
    {
        super();
        this.keyword = null;
        this.level = -1;
        this.state = {
            pageCount: 1,
            activePage: 1,
            messages: []
        }
    }

    componentDidMount()
    {
        this.onSearchMessage()
    }

    onSearchMessage(event)
    {
        this.searchMessageCount();
        this.searchMessage(1);
        if (event)
            event.preventDefault();
    }

    searchMessage(page)
    {
        let keyword = this.keyword.value;
        let level = this.level.value;
        let uri = config.serverHost + 'user/message?page=' + page + '&keyword=' + keyword + '&level=' + level;
        message_object.doFetch('user message query', uri, {}, function (result) {
            result.json().then(function (json) {
                this.setState({ messages: json });
            }.bind(this));
        }.bind(this))
    }

    searchMessageCount()
    {
        let keyword = this.keyword.value;
        let level = this.level.value;
        message_object.doFetch('user message count query', config.serverHost + 'user/message?keyword=' + keyword + '&level=' + level, {}, function (result) {
            result.text().then(function (text) {
                let page = parseInt(text);
                if (page)
                    this.setState({pageCount: page})
            }.bind(this));
        }.bind(this));
    }

    handleSelect(eventKey)
    {
        this.searchMessage(eventKey)
    }

    render()
    {
        return <Row>
            <Col md={6} xs={12}>
                <form>
                    <FormGroup>
                        <InputGroup>
                            <InputGroup.Addon>关键字</InputGroup.Addon>
                            <FormControl type="text" inputRef={ref => this.keyword = ref} placeholder="要查询的信息关键字" />
                            <InputGroup.Addon>信息等级</InputGroup.Addon>
                            <FormControl type="number" inputRef={ref => this.level = ref} placeholder="0" />
                            <InputGroup.Button>
                                <Button type="submit" onClick={this.onSearchMessage.bind(this)}>确定</Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </form>
            </Col>
            <Col md={12} xs={12}>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <td>发言用户</td>
                        <td>对局</td>
                        <td>发言时间</td>
                        <td>内容</td>
                        <td>等级</td>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.messages.map(function (message) {
                            return <tr>
                                <td>{message.sender}</td>
                                <td>{message.match}</td>
                                <td>{moment(message.time).format("YYYY-MM-DD HH:mm:ss")}</td>
                                <td>{message.content}</td>
                                <td>{message.level}</td>
                            </tr>
                        })
                    }
                    </tbody>
                </Table>

                <div style={{textAlign: "center"}}>
                    <Pagination style={{marginLeft: "auto", marginRight: "auto"}}
                                prev next first last ellipsis boundaryLinks
                                items={this.state.pageCount}
                                maxButtons={10}
                                activePage={this.state.activePage}
                                onSelect={this.handleSelect.bind(this)} />
                </div>
            </Col>
        </Row>
    }
}

export default MCProConsoleUserMessagePage;