import React, { Component } from 'react'
import { Row, Col, FormGroup, InputGroup, FormControl, DropdownButton, MenuItem, Button, Panel } from 'react-bootstrap'
import moment from 'moment'
import Config from '../Config.json'
import { message_object } from "../components/Message";

class MCProConsoleDatabasePage extends Component
{
    constructor()
    {
        super();
        this.state = {
            databaseLastChangeTime: null,
            remoteLastPullTime: null,
            environmentName: "zh-CN",
            card: null
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
        message_object.doFetch("pull State", Config.serverHost + "updates/pull/last", {}, function (back) {
            back.text().then(function (text) {
                this.setState({remoteLastPullTime: text})
            }.bind(this))
        }.bind(this))
    }

    onEnvironmentChanged(eventKey) {
        this.setState({environmentName: eventKey});
    }

    queryCard(event) {
        let url = Config.serverHost + "updates/card/" + this.state.environmentName + "/" + this.queryName.value
        message_object.doFetch("update card", url, {}, function (back) {
            back.json().then(function (json) {
                this.setState({card: (json === null ? "查无此卡" : json)});
            }.bind(this))
        }.bind(this));
        event.preventDefault();
    }

    render()
    {
        return (
            <Row>
                <Col md={12}>
                    <h2 className="page-header">数据库状态</h2>
                    <p>数据库当前源为 <kbd>Github</kbd></p>
                    <p>最后更新于 <kbd>{moment(this.state.databaseLastChangeTime).format('YYYY-MM-DD HH:mm:ss')}</kbd></p>
                    <p>镜像最后更新于 <kbd>{moment(this.state.remoteLastPullTime).format('YYYY-MM-DD HH:mm:ss')}</kbd></p>
                </Col>
                <Col md={12}>
                    <h2 className='page-header'>卡片速查</h2>
                    <form>
                        <FormGroup>
                            <InputGroup>
                                <InputGroup.Addon>在数据库</InputGroup.Addon>
                                <InputGroup.Button>
                                    <DropdownButton componentClass={InputGroup.Button} title={this.state.environmentName} onSelect={this.onEnvironmentChanged.bind(this)} >
                                        <MenuItem eventKey="zh-CN">zh-CN</MenuItem>
                                        <MenuItem eventKey="en-US">en-US</MenuItem>
                                    </DropdownButton>
                                </InputGroup.Button>
                                <InputGroup.Addon>中查找</InputGroup.Addon>
                                <FormControl inputRef={(ref) => this.queryName = ref} type="text" />
                                <InputGroup.Button>
                                    <Button type="submit" onClick={this.queryCard.bind(this)}>搜索</Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </FormGroup>
                    </form>
                    { typeof(this.state.card) === 'string' ? "查无此卡!" : null }
                    { typeof(this.state.card) === 'object' && this.state.card !== null ?
                        <Panel header={this.state.card.name + " [" + this.state.card.id.toString() + "]"}>

                        </Panel>
                        : null }
                </Col>
                <Col md={12}>
                    <h2 className='page-header'>更新</h2>
                </Col>
            </Row>
        )
    }
}

export default MCProConsoleDatabasePage