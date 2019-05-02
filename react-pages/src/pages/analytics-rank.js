import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { Row, Col, Form, InputGroup, Button, FormControl } from 'react-bootstrap'
import MCProConsolePagedTable from "../components/PagedTable"
import moment from 'moment'
import config from "../Config.json"


class MCProConsoleAnalyticsRankPage extends Component {
    constructor() {
        super();
        this.queryName = "";
        this.queryType = "";
        this.state = {
            queryType: 'all',
            jump: null
        }
    }

    componentDidMount()
    {
    }

    calculateDefaultTime() {
        let base = moment().subtract(1, 'months')
        let start_time = moment(base).startOf('month')
        let end_time = moment(base).endOf('month').hour(22).minute(0).second(0)
        return [start_time, end_time]
    }

    render() {
        let defaultTime = this.calculateDefaultTime()
        let count = 1
        return (<Row>
            <Col md={12} xs={12}>
                <Form>
                    <InputGroup>
                        <InputGroup.Addon>开始时间</InputGroup.Addon>
                        <FormControl type="text" ref="start_time" placeholder={defaultTime[0].format('YYYY-MM-DD HH:mm:ss')}/>
                        <InputGroup.Addon>结束时间</InputGroup.Addon>
                        <FormControl type="text" ref="end_time" placeholder={defaultTime[1].format('YYYY-MM-DD HH:mm:ss')}/>
                        <InputGroup.Addon>今天咕了</InputGroup.Addon>
                        <InputGroup.Button>
                            <Button type="submit" onClick={(event) => {this.refs.table.handleQuery(); event.preventDefault()}} bsStyle="primary">查询</Button>
                        </InputGroup.Button>
                    </InputGroup>
                </Form>
            </Col>
            <Col md={12} xs={12}>
                <div style={{margin: '10px 10px 10px 10px'}} />
                <MCProConsolePagedTable ref="table" key="query history" thead={["排名", "用户名", "PT", "最后决斗时间"]} tbodyGenerator={ data => 
                    <tr key={data.username}>
                        <td>{(count++) - 100}</td>
                        <td>{data.username}</td>
                        <td>{data.pt.toFixed(3)}</td>
                        <td>{moment(data.end_time).format('YYYY-MM-DD HH:mm:ss')}</td>
                    </tr>}
                    urlGenerator={function () {
                        let url = new URL(config.serverHost + "analyze/rank");
                        url.searchParams.set('__start_time', ReactDOM.findDOMNode(this.refs.start_time).value || ReactDOM.findDOMNode(this.refs.start_time).placeholder);
                        url.searchParams.set('__end_time', ReactDOM.findDOMNode(this.refs.end_time).value || ReactDOM.findDOMNode(this.refs.end_time).placeholder);
                        return url;
                    }.bind(this)}
                />
            </Col>
        </Row>)
    }
}

export default MCProConsoleAnalyticsRankPage