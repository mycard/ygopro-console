import React, { Component } from 'react';
import { Row, Col, Table, FormGroup, InputGroup, FormControl, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import ReactDOM from 'react-dom'
import { message_object } from '../Message'
import config from '../Config.json'

// 用户查询、DP异动
// 删除用户
class MCUserManagePage extends Component {
    constructor() {
        super();
        this.user = null;
        this.state = {
            userData: null,
            selectingUsers: null
        };
    }

    searchUser() {
        let text = ReactDOM.findDOMNode(this.refs.username).value;
        message_object.doFetch("search user " + text, config.serverHost + "user/" + text, {}, function (result) {
            result.json().then(function (result) {
                if (result.username) {
                    this.user = result.username;
                    this.setState({
                        userData: result,
                        selectingUsers: null
                    });
                }
                else{
                    this.setState({
                        userData: null,
                        selectingUsers: result
                    })
                }
            }.bind(this));
            return 'ok';
        }.bind(this));
    }

    onNameClicked() {
        let text = ReactDOM.findDOMNode(this.source.refs.username);
        text.value = this.user;
        this.source.searchUser.call(this.source);
    }

    setUserDp() {
        let dp = parseInt(ReactDOM.findDOMNode(this.refs.userDp).value);
        if (isNaN(dp) || !this.user) return;
        let data = this.state.userData;
        data.pt = dp;
        this.setState({ userData: data });
        message_object.doFetch("set Dp " + this.user, config.serverHost + "user/" + this.user + "/dp/" + dp.toString(), { method: 'POST' }, function (result) {
            return 'ok';
        })
    }

    render() {
        return (
            <Row>
                <Col md={6} xs={12}>
                    <FormGroup>
                        <InputGroup>
                            <InputGroup.Addon>操作用户</InputGroup.Addon>
                            <FormControl type="text" ref="username" placeholder="输入要查询的用户" />
                            <InputGroup.Button>
                                <Button onClick={this.searchUser.bind(this)}>确定</Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </Col>
                { (this.state.selectingUsers != null) ? <Col md={12} xs={12} /> : ""}
                { (this.state.selectingUsers != null) ?
                        <Col md={6} xs={12}>
                            <ListGroup>
                                {
                                    this.state.selectingUsers.map(name => <ListGroupItem onClick={this.onNameClicked.bind({source: this, user: name})}>{name}</ListGroupItem>)
                                }
                            </ListGroup>
                        </Col>
                    : ""
                }
                { (this.state.userData != null) ?
                    <Col md={6} xs={12}>
                        <FormGroup>
                            <InputGroup>
                                <InputGroup.Addon>指定 DP</InputGroup.Addon>
                                <FormControl type="text" ref="userDp" placeholder="500"/>
                                <InputGroup.Button>
                                    <Button onClick={this.setUserDp.bind(this)}>确定</Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </FormGroup>
                    </Col>
                    : ""
                }
                { (this.state.userData != null) ?
                    <Col md={6} xs={12}>
                        <h2 className="page-header">公共信息</h2>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>名称</th>
                                <th>值</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>ID</td>
                                <td>{this.state.userData.id}</td>
                            </tr>
                            <tr>
                                <td>用户名</td>
                                <td>{this.state.userData.username}</td>
                            </tr>
                            <tr>
                                <td>昵称</td>
                                <td>{this.state.userData.name}</td>
                            </tr>
                            <tr>
                                <td>邮箱</td>
                                <td>{this.state.userData.email}</td>
                            </tr>
                            <tr>
                                <td>管理员</td>
                                <td>{this.state.userData.admin ? '是' : '否'}</td>
                            </tr>
                            <tr>
                                <td>语言</td>
                                <td>{this.state.userData.locale}</td>
                            </tr>
                            <tr>
                                <td>注册IP</td>
                                <td>{this.state.userData.registration_ip_address}</td>
                            </tr>
                            <tr>
                                <td>最后登录IP</td>
                                <td>{this.state.userData.ip_address}</td>
                            </tr>
                            <tr>
                                <td>创建时间</td>
                                <td>{this.state.userData.created_at}</td>
                            </tr>
                            <tr>
                                <td>最后变动时间</td>
                                <td>{this.state.userData.updated_at}</td>
                            </tr>
                            </tbody>
                        </Table>
                    </Col>
                    : ""
                }
                { (this.state.userData != null) ?
                    <Col md={6} xs={12}>
                        <h2 className="page-header">YGO 数据</h2>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>名称</th>
                                <th>值</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>用户名</td>
                                <td>{this.state.userData.username}</td>
                            </tr>
                            <tr>
                                <td>经验</td>
                                <td>{this.state.userData.exp}</td>
                            </tr>
                            <tr>
                                <td>DP</td>
                                <td>{this.state.userData.pt}</td>
                            </tr>
                            <tr>
                                <td>娱乐场</td>
                                <td>{this.state.userData.entertain_win}/{this.state.userData.entertain_draw}/{this.state.userData.entertain_lose}</td>
                            </tr>
                            <tr>
                                <td>竞技场</td>
                                <td>{this.state.userData.athletic_win}/{this.state.userData.athletic_draw}/{this.state.userData.athletic_lose}</td>
                            </tr>
                            </tbody>
                        </Table>
                    </Col>
                    : ""
                }
            </Row>
        )
    }
}

export default MCUserManagePage