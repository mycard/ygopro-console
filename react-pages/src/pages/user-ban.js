import React, { Component } from 'react'
import { Button, Col, FormControl, FormGroup, InputGroup, Row } from 'react-bootstrap'
import config from "../Config";
import MCProConsolePagedTable from "../components/PagedTable";
import moment from 'moment'
import { message_object } from '../components/Message'

class MCProConsoleUserBanPage extends Component {
    constructor() {
        super();
        this.queryUserTextbox = null;
        this.banUserDaysTextbox = null;
        this.banUserReasonTextbox = null;
    }


    componentDidMount() {
        this.refs.table.handleQuery();
    }

    submitBanUser(event) {
        let url = config.serverHost + "user/ban/" + this.queryUserTextbox.value + "?length=" + this.banUserDaysTextbox.value;
        message_object.doFetch("user ban post", url, { method: 'POST', body: this.banUserReasonTextbox.value }, function () {
            this.submitUser();
            return 'ok';
        }.bind(this));
        event.preventDefault();
    }

    submitUser(event) {
        this.refs.table.handleQuery();
        if (event)
            event.preventDefault();
    }

    render() {
        return (
            <Row>
                <Col md={6} xs={12}>
                    <form>
                        <FormGroup>
                            <InputGroup>
                                <InputGroup.Addon>用户名</InputGroup.Addon>
                                <FormControl type="text" ref="username" inputRef={ref => { this.queryUserTextbox = ref; }} placeholder="输入要查询的用户" />
                                <InputGroup.Button>
                                    <Button type="submit" onClick={this.submitUser.bind(this)}>确定</Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </FormGroup>
                    </form>
                </Col>
                <Col md={6} xs={12}>
                    <form>
                        <FormGroup>
                            <InputGroup>
                                <InputGroup.Addon>封禁</InputGroup.Addon>
                                <FormControl type="text" ref="username" inputRef={ref => { this.banUserDaysTextbox = ref; }} placeholder="输入要封禁的天数" />
                                <InputGroup.Button>
                                    <Button type="submit" onClick={this.submitBanUser.bind(this)}>确定</Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </FormGroup>
                    </form>
                </Col>
                <Col md={12} xs={12}>
                    <form>
                        <FormGroup>
                            <InputGroup>
                                <InputGroup.Addon>原因</InputGroup.Addon>
                                <FormControl type="text" ref="reason" inputRef={ref => { this.banUserReasonTextbox = ref; }} placeholder="输入封禁原因" />
                            </InputGroup>
                        </FormGroup>
                    </form>
                </Col>
                <Col md={12} xs={12}>
                    <MCProConsolePagedTable ref="table" key="query ban" thead={["用户", "封禁自", "封禁至", "原因", "操作者"]} tbodyGenerator={data =>
                        <tr key={data.username + "v" + data.from}>
                            <td>{data.id == null ? "" : data.id + " - "}{data.username}</td>
                            <td>{moment(data.from).format('YYYY-MM-DD hh:mm:ss')}</td>
                            <td>{moment(data.until).format('YYYY-MM-DD hh:mm:ss')}</td>
                            <td>{data.reason}</td>
                            <td>{data.operator}</td>
                        </tr>} urlGenerator={() => new URL(config.serverHost + "user/ban" + (this.queryUserTextbox.value.length === 0 ? "" : "/" + this.queryUserTextbox.value))}
                    />
                </Col>
            </Row>
        )
    }
}

export default MCProConsoleUserBanPage