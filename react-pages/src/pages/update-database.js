import React, { Component } from 'react'
import { Row, Col, FormGroup, InputGroup, FormControl, DropdownButton, MenuItem, Button } from 'react-bootstrap'
import moment from 'moment'

class MCProConsoleDatabasePage extends Component
{
    constructor()
    {
        super();
        this.state = {
          databaseLastChangeTime: null
        };
    }

    componentDidMount()
    {
        this.getUpdateTime();
    }

    getUpdateTime()
    {
        fetch('https://api.github.com/repos/moecube/ygopro-database/commits').then(function(res) {
            if (res.ok) {
                res.json().then(function(data) {
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
                    <p>数据库当前源为 <kbd>Github</kbd></p>
                    <p>最后更新于 <kbd>{moment(this.state.databaseLastChangeTime).format('YYYY-MM-DD HH:mm:ss')}</kbd></p>
                </Col>
                <Col md={12}>
                    <h2 className='page-header'>卡片速查</h2>
                    <form>
                        <FormGroup>
                            <InputGroup>
                                <InputGroup.Addon>在数据库</InputGroup.Addon>
                                <InputGroup.Button>
                                    <DropdownButton
                                        componentClass={InputGroup.Button}
                                        id="input-dropdown-addon"
                                        title="zh-CN">
                                        <MenuItem key="1">zh-CN</MenuItem>
                                        <MenuItem key="2">en-US</MenuItem>
                                    </DropdownButton>
                                </InputGroup.Button>
                                <InputGroup.Addon>中查找</InputGroup.Addon>
                                <FormControl type="text" />
                                <InputGroup.Button>
                                    <Button>搜索</Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </FormGroup>
                    </form>
                </Col>
                <Col md={12}>
                    <h2 className='page-header'>更新</h2>
                </Col>
            </Row>
        )
    }
}

export default MCProConsoleDatabasePage