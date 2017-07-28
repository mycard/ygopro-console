import React, { Component } from 'react'
import { Row, Col, Table, Form, FormGroup, FormControl, ControlLabel, Button, Pagination } from 'react-bootstrap'
import config from '../Config.json'
import {message_object} from "../Message"
import moment from 'moment'
import './analytics-history.css'

class MCProConsoleAnalyticsHistoryPage extends Component {
    constructor() {
        super();
        this.queryName = "";
        this.queryType = "";
        this.state = {
            historyData: [],
            pageCount: 1,
            activePage: 1
        }
    }

    componentDidMount()
    {
        this.queryHistory();
    }

    queryHistory(event) {
        let name = this.queryName.value;
        let type = this.queryType.value;
        message_object.doFetch("query history count", config.serverHost + "analyze/history/count?name=" + name + "&type=" + type, {}, function (result) {
            result.text().then(function (result) {
                this.setState({pageCount: Math.max(parseInt(result, 10), 1)});
            }.bind(this));
            return 'ok';
        }.bind(this));
        this.queryHistoryPage();
        if (event) event.preventDefault();
    }

    formatTime(data)
    {
        let start_time = moment(data.start_time);
        let end_time = moment(data.end_time);
        let timespan = end_time.diff(start_time, 'seconds');

        return <span>
            <kbd>{start_time.format("YYYY-MM-DD")}</kbd>&nbsp;&nbsp;
            {start_time.format("HH:mm:ss") + " - " + end_time.format("HH:mm:ss")}
            <span className={timespan < 180 ? "not-enough-time" : ""}>{' (' + Math.floor(timespan / 60) + 'min ' + timespan % 60 + 's)'}</span>
        </span>
    }

    handleSelect(eventKey)
    {
        this.queryHistoryPage(eventKey);
    }

    queryHistoryPage(page)
    {
        if (!page) page = 1;
        let name = this.queryName.value;
        let type = this.queryType.value;
        message_object.doFetch("query history" + name + type + page, config.serverHost + "analyze/history?name=" + name + "&type=" + type + "&page=" + page, {}, function (result) {
            result.json().then(function (result) {
                this.setState({historyData: result, activePage: page});
            }.bind(this));
            return 'ok';
        }.bind(this));
    }

    render() {
        return (<Row>
            <Col md={12} xs={12}>
                <Form inline>
                    <FormGroup controlId="formInlineName">
                        <ControlLabel>名称</ControlLabel>
                        <FormControl style={{margin: "0px 0px 0px 5px"}} type="text" placeholder="神秘决斗者" inputRef={ ref => this.queryName = ref }/>
                    </FormGroup>
                    <FormGroup controlId="formInlineEmail" style={{margin: "0px 0px 0px 20px"}}>
                        <ControlLabel>类别</ControlLabel>
                        <FormControl  style={{margin: "0px 0px 0px 5px"}} componentClass="select" placeholder="select" inputRef={ ref => this.queryType = ref }>
                            <option value="all">全部</option>
                            <option value="entertain">娱乐</option>
                            <option value="athletic">竞技</option>
                        </FormControl>
                    </FormGroup>
                    <Button type="submit" style={{margin: "0px 0px 0px 20px"}} onClick={this.queryHistory.bind(this)} bsStyle="primary">查询</Button>
                </Form>
            </Col>
            <Col md={12} xs={12}>
                <div style={{margin: '10px 10px 10px 10px'}} />
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <td>用户A</td>
                        <td>用户B</td>
                        <td>类别</td>
                        <td>比分</td>
                        <td>用户A 变动</td>
                        <td>用户B 变动</td>
                        <td>对局时间</td>
                        <td>首胜</td>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.historyData.map(data =>
                            <tr key={data.usernamea + "vs" + data.usernameb + data.start_time}>
                                <td className={data.userscorea > data.userscoreb ? "game-winner" : data.userscorea < 0 ? "game-runner" : "game-loser"}>{data.usernamea}</td>

                                <td className={data.userscoreb > data.userscorea ? "game-winner" : data.userscoreb < 0 ? "game-runner" : "game-loser"}>{data.usernameb}</td>

                                <td style={data.type === 'athletic' ? {fontWeight: "bold"} : {}}>{data.type === 'entertain' ? '娱乐' : '竞技'}</td>
                                <td>{data.userscorea}:{data.userscoreb}</td>
                                {
                                    data.type === 'entertain' ?
                                        (<td>{data.expb.toFixed(3)} ({(data.expb - data.expb_ex).toSignedNumber()})</td>) :
                                        (<td>{data.ptb.toFixed(3)} ({(data.ptb - data.ptb_ex).toSignedNumber()})</td>)
                                }
                                {
                                    data.type === 'entertain' ?
                                        (<td>{data.expa.toFixed(3)} ({(data.expa - data.expa_ex).toSignedNumber()})</td>) :
                                        (<td>{data.pta.toFixed(3)} ({(data.pta - data.pta_ex).toSignedNumber()})</td>)
                                }
                                <td>{this.formatTime(data)}</td>
                                <td>{data.isfirstwin ? "是" : ""}</td>
                            </tr>
                        )
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
        </Row>)
    }
}

Number.prototype.toSignedNumber = function () {
    let num = this;
    if (num > 0)
        return <span className="positive-score-change">{"+" + num.toFixed(3)}</span>;
    else if (Math.abs(num) < 0.0004)
        return <span className="draw-score-change">±0.000</span>;
    else
        return <span className="negative-score-change">{num.toFixed(3)}</span>;
};

export default MCProConsoleAnalyticsHistoryPage;