import React, {Component} from 'react'
import {Row, Col, FormGroup, InputGroup, FormControl, Button} from 'react-bootstrap'
import config from '../Config.json'
import moment from 'moment'
import MCProConsolePagedTable from '../components/PagedTable'

class MCProConsoleUserMessagePage extends Component {
    constructor() {
        super();
        this.keyword = null;
        this.level = -1;
        this.state = {
            pageCount: 1,
            activePage: 1,
            messages: []
        }
    }

    componentDidMount() {
        this.refs.table.handleQuery()
    }

    render() {
        return <Row>
            <Col md={6} xs={12}>
                <form>
                    <FormGroup>
                        <InputGroup>
                            <InputGroup.Addon>关键字</InputGroup.Addon>
                            <FormControl type="text" inputRef={ref => this.keyword = ref} placeholder="要查询的信息关键字"/>
                            <InputGroup.Addon>信息等级</InputGroup.Addon>
                            <FormControl type="number" inputRef={ref => this.level = ref} placeholder="0"/>
                            <InputGroup.Button>
                                <Button type="submit" onClick={(event) => {this.refs.table.handleQuery(); event.preventDefault();}}>确定</Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </form>
            </Col>
            <Col md={12} xs={12}>
                <MCProConsolePagedTable key="user message" ref="table"
                                        thead={["用户", "IP", "时间", "等级", "内容"]}
                                        tbodyGenerator={function (data) {
                                            return <tr>
                                                <td>{data.sender}</td>
                                                <td>{data.ip}</td>
                                                <td>{moment(data.time).format('YYYY-MM-DD HH:mm:ss')}</td>
                                                <td>{data.level}</td>
                                                <td>{data.content}</td>
                                            </tr>
                                        }}
                                        urlGenerator={function () {
                                            let keyword = this.keyword.value;
                                            let level = this.level.value;
                                            let uri = new URL(config.serverHost + 'user/message');
                                            uri.searchParams.set('keyword', keyword);
                                            uri.searchParams.set('level', level);
                                            return uri;
                                        }.bind(this)}/>
            </Col>
        </Row>
    }
}

export default MCProConsoleUserMessagePage;