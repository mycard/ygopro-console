import React, { Component }  from 'react';
import { Row, Nav, Navbar, NavItem, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import MycardUser from './MycardUser.js';

class MCProConsoleNavigationBar extends Component
{
    onNavItemSelected(eventKey, event)
    {

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
                        <Nav>
                            <LinkContainer to="/user"><NavItem>用户</NavItem></LinkContainer>
                            <LinkContainer to="/update"><NavItem>更新</NavItem></LinkContainer>
                            <LinkContainer to="/database"><NavItem eventKey="database" onSelect={ this.onNavItemSelected }>数据库</NavItem></LinkContainer>
                            <NavDropdown title="卡图" id="basic-nav-dropdown-image">
                                <LinkContainer to="/image/state"><NavItem eventKey="image-state" onSelect={ this.onNavItemSelected }>状态</NavItem></LinkContainer>
                                <LinkContainer to="/image/command"><NavItem eventKey="image-command" onSelect={ this.onNavItemSelected }>指令</NavItem></LinkContainer>
                                <LinkContainer to="/image/single"><NavItem eventKey="image-single" onSelect={ this.onNavItemSelected }>单图</NavItem></LinkContainer>
                                <LinkContainer to="/image/config"><NavItem eventKey="image-config" onSelect={ this.onNavItemSelected }>设置</NavItem></LinkContainer>
                            </NavDropdown>
                            <NavDropdown title="统计" id="basic-nav-dropdown-analytics">
                                <LinkContainer to="/analytics/general"><NavItem>概述</NavItem></LinkContainer>
                                <LinkContainer to="/analytics/history"><NavItem>对战历史</NavItem></LinkContainer>
                                <LinkContainer to="/analytics/custom"><NavItem>自定义统计</NavItem></LinkContainer>
                                <LinkContainer to="/analytics/deck"><NavItem>卡组辨识</NavItem></LinkContainer>
                            </NavDropdown>
                        </Nav>
                        <Nav pullRight>
                            <MycardUser />
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </Row>
        )
    }
}

export default MCProConsoleNavigationBar