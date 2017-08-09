import React, { Component } from 'react';
import { Row, Col, Table, FormGroup, InputGroup, FormControl, Button, DropdownButton, ListGroup, ListGroupItem, MenuItem } from 'react-bootstrap';
import ReactDOM from 'react-dom'
import { message_object } from '../components/Message'
import config from '../Config.json'
import moment from 'moment'

// 用户查询、DP异动
// 删除用户
class MCProConsoleUserManagePage extends Component {
    constructor() {
        super();
        this.user = null;
        this.state = {
            userData: null,
            selectingUsers: null,
            searchBy: 'user'
        };
    }

    searchUser(event) {
        let text = ReactDOM.findDOMNode(this.refs.username).value;
        let target_url = {user: 'user/', ip: 'user/ip/'}[this.state.searchBy];
        message_object.doFetch("search user", config.serverHost + target_url + text, {}, function (result) {
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
            }.bind(this), fail => { console.log(fail); });
            return 'ok';
        }.bind(this));
        if (event) event.preventDefault();
    }

    onNameClicked() {
        this.source.setState({ searchBy: 'user' });
        this.source.state.searchBy = 'user';
        let text = ReactDOM.findDOMNode(this.source.refs.username);
        text.value = this.user;
        this.source.searchUser.call(this.source);
    }

    setUserDp(event) {
        let dp = parseInt(ReactDOM.findDOMNode(this.refs.userDp).value, 10);
        if (isNaN(dp) || !this.user) return;
        let data = this.state.userData;
        data.pt = dp;
        this.setState({ userData: data });
        message_object.doFetch("set Dp", config.serverHost + "user/" + this.user + "/dp/" + dp.toString(), { method: 'POST' }, function (result) {
            return 'ok';
        });
        if (event) event.preventDefault();
    }

    setSearchMode(eventKey)
    {
        this.setState({ searchBy: eventKey })
    }

    onUserIpClicked(event)
    {
        if (event) event.preventDefault();
        let ip = this.state.userData.ip_address;
        if (ip.startsWith('127.0.0.1'))
        {
            alert("127.0.0.1 是用户中心上线前的用户的统一注册地址，\n搜索它没有意义！");
            return;
        }
        let index = ip.indexOf('/');
        if (index > 0) ip = ip.slice(0, index);
        ReactDOM.findDOMNode(this.refs.username).value = ip.toString();
        this.setState({searchBy: 'ip'}, this.searchUser.bind(this));
    }

    render() {
        if (this.state.selectingUsers != null)
            console.log(this.state.selectingUsers);
        return (
            <Row>
                <Col md={6} xs={12}>
                    <form>
                        <FormGroup>
                            <InputGroup>
                                <InputGroup.Button>
                                    <DropdownButton id="searchBy" title={{user: '用户', ip: 'IP 地址'}[this.state.searchBy]} onSelect={this.setSearchMode.bind(this)}>
                                        <MenuItem eventKey="user">用户</MenuItem>
                                        <MenuItem eventKey="ip">IP 地址</MenuItem>
                                    </DropdownButton>
                                </InputGroup.Button>
                                <FormControl type="text" ref="username" placeholder="输入要查询的用户" />
                                <InputGroup.Button>
                                    <Button type="submit" onClick={this.searchUser.bind(this)}>确定</Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </FormGroup>
                    </form>
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
                        <form>
                            <FormGroup>
                                <InputGroup>
                                    <InputGroup.Addon>指定 DP</InputGroup.Addon>
                                    <FormControl type="text" ref="userDp" placeholder="500"/>
                                    <InputGroup.Button>
                                        <Button type="submit" onClick={this.setUserDp.bind(this)}>确定</Button>
                                    </InputGroup.Button>
                                </InputGroup>
                            </FormGroup>
                        </form>
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
                                <td><a onClick={this.onUserIpClicked.bind(this)}>{this.state.userData.ip_address}</a></td>
                            </tr>
                            <tr>
                                <td>创建时间</td>
                                <td>{moment(this.state.userData.created_at).format('YYYY-MM-DD HH:mm:ss')}</td>
                            </tr>
                            <tr>
                                <td>最后变动时间</td>
                                <td>{moment(this.state.userData.updated_at).format('YYYY-MM-DD HH:mm:ss')}</td>
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
                            {

                                this.state.userData.exp ?
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
                                        <td>{this.state.userData.entertain_win}/{this.state.userData.entertain_draw}/{this.state.userData.entertain_lose}（胜率 {(this.state.userData.entertain_win / this.state.userData.entertain_all * 100).toFixed(3)}%）</td>
                                    </tr>
                                    <tr>
                                        <td>竞技场</td>
                                        <td>{this.state.userData.athletic_win}/{this.state.userData.athletic_draw}/{this.state.userData.athletic_lose}（胜率 {(this.state.userData.athletic_win / this.state.userData.athletic_all * 100).toFixed(3)}%）</td>
                                    </tr>
                                    </tbody>
                                    :
                                    <tbody>
                                    <tr>
                                        <td colSpan="2">{this.state.userData.username} 没有参加过任何匹配游戏</td>
                                    </tr>
                                    </tbody>
                            }
                        </Table>
                    </Col>
                    : ""
                }
            </Row>
        )
    }
}

export default MCProConsoleUserManagePage