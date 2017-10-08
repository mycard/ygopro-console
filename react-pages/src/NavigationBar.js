import React, { Component }  from 'react';
import { Row, Nav, Navbar, NavItem, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import MycardUser, { mycard_user, mycard_user_object } from './components/MycardUser.js';

class MCProConsoleNavigationBar extends Component
{
    constructor() {
        super();
        MycardUser.callbacks.push(function () {
            this.forceUpdate();
        }.bind(this));
    }

    render()
    {
        return(
            <Row>
                <Navbar collapseOnSelect>
                    <Navbar.Header>
                            <Navbar.Brand>
                                <LinkContainer to="/">
                                    <a>MCPro Console</a>
                                </LinkContainer>
                            </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    <Navbar.Collapse>
                        {
                            mycard_user_object && mycard_user_object.data ?
                            <Nav>
                                <NavDropdown title="用户">
                                    <LinkContainer to="/users/query"><NavItem>查询</NavItem></LinkContainer>
                                    <LinkContainer to="/users/messages"><NavItem>消息记录</NavItem></LinkContainer>
                                    <LinkContainer to="/users/vote"><NavItem>投票</NavItem></LinkContainer>
                                </NavDropdown>
                                <NavDropdown title="更新">
                                    <LinkContainer to="/update/database"><NavItem
                                        eventKey="update-database">数据库</NavItem></LinkContainer>
                                    <LinkContainer to="/update/package"><NavItem
                                        eventKey="update-package">打包</NavItem></LinkContainer>
                                </NavDropdown>
                                <NavDropdown title="卡图">
                                    <LinkContainer to="/image/state"><NavItem
                                        eventKey="image-state">状态</NavItem></LinkContainer>
                                    <LinkContainer to="/image/command"><NavItem
                                        eventKey="image-command">指令</NavItem></LinkContainer>
                                    <LinkContainer to="/image/single"><NavItem
                                        eventKey="image-single">单图</NavItem></LinkContainer>
                                    <LinkContainer to="/image/config"><NavItem
                                        eventKey="image-config">设置</NavItem></LinkContainer>
                                </NavDropdown>
                                <NavDropdown title="统计">
                                    <LinkContainer to="/analytics/general"><NavItem>概述</NavItem></LinkContainer>
                                    <LinkContainer to="/analytics/daily"><NavItem>日活</NavItem></LinkContainer>
                                    <LinkContainer to="/analytics/history"><NavItem>对战历史</NavItem></LinkContainer>
                                    <LinkContainer to="/analytics/custom"><NavItem>自定义统计</NavItem></LinkContainer>
                                    <LinkContainer to="/analytics/deck"><NavItem>卡组辨识</NavItem></LinkContainer>
                                </NavDropdown>
                            </Nav>
                                :
                                <Nav pullRight>
                                    <NavItem>
                                    管理员请先<b>登录</b>!
                                    </NavItem>
                                </Nav>
                        }
                        <Nav pullRight>
                            {mycard_user}
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </Row>
        )
    }
}

export default MCProConsoleNavigationBar