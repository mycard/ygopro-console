import React, { Component } from 'react'
import { Row, Col, Form, MenuItem, InputGroup, FormControl, DropdownButton, Button } from 'react-bootstrap'
import { Redirect } from 'react-router'
import MCProConsoleMycardUser from '../components/MCUser'
import MCProConsolePagedTable from '../components/PagedTable'
import MCProConsoleTimeRangePicker from '../components/Timerange'
import moment from 'moment'
import config from '../Config.json'
import './analytics-history.css'

class MCProConsoleAnalyticsHistoryPage extends Component {
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
        this.refs.table.handleQuery();
    }

    selectQueryType(eventKey)
    {
        this.setState({queryType: eventKey});
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

    handleUserClick()
    {
        this.caller.setState({jump: this.target});
    }

    render() {
        if (this.state.jump)
            return <Redirect push to={"/users/query?name=" + this.state.jump}/>;
        return (<Row>
            <Col md={12} xs={12}>
                <Form>
                    <InputGroup>
                        <InputGroup.Addon>时间</InputGroup.Addon>
                        <MCProConsoleTimeRangePicker ref="time"/>
                        <InputGroup.Addon>名称</InputGroup.Addon>
                        <FormControl type="text" placeholder="神秘决斗者" inputRef={ ref => this.queryName = ref }/>
                        <InputGroup.Addon>类别</InputGroup.Addon>
                        <InputGroup.Button>
                            <DropdownButton id="query_type" title={{all: '全部', entertain: '娱乐', athletic: '竞技'}[this.state.queryType]} onSelect={this.selectQueryType.bind(this)}>
                                <MenuItem eventKey="all">全部</MenuItem>
                                <MenuItem eventKey="entertain">娱乐</MenuItem>
                                <MenuItem eventKey="athletic">竞技</MenuItem>
                            </DropdownButton>
                            <Button type="submit" onClick={(event) => {this.refs.table.handleQuery(); event.preventDefault()}} bsStyle="primary">查询</Button>
                        </InputGroup.Button>
                    </InputGroup>
                </Form>
            </Col>
            <Col md={12} xs={12}>
                <div style={{margin: '10px 10px 10px 10px'}} />
                <MCProConsolePagedTable ref="table" key="query history" thead={["用户A", "用户B", "类别", "比分", "用户A变动", "用户B变动", "对局时间", "首胜"]} tbodyGenerator={data =>
                    <tr key={data.usernamea + "vs" + data.usernameb + " at " + data.start_time}>
                        <td className={data.userscorea > data.userscoreb ? "game-winner" : data.userscorea < 0 ? "game-runner" : "game-loser"}><MCProConsoleMycardUser username={data.usernamea} /></td>
                        <td className={data.userscoreb > data.userscorea ? "game-winner" : data.userscoreb < 0 ? "game-runner" : "game-loser"}><MCProConsoleMycardUser username={data.usernameb} /></td>

                        <td style={data.type === 'athletic' ? {fontWeight: "bold"} : {}}>{data.type === 'entertain' ? '娱乐' : '竞技'}</td>
                        <td>{data.userscorea}:{data.userscoreb}</td>
                        {
                            data.type === 'entertain' ?
                                (<td>{data.expa.toFixed(3)} ({MCProConsoleAnalyticsHistoryPage.toSignedNumber(data.expa - data.expa_ex)})</td>) :
                                (<td>{data.pta.toFixed(3)} ({MCProConsoleAnalyticsHistoryPage.toSignedNumber(data.pta - data.pta_ex)})</td>)
                        }
                        {
                            data.type === 'entertain' ?
                                (<td>{data.expb.toFixed(3)} ({MCProConsoleAnalyticsHistoryPage.toSignedNumber(data.expb - data.expb_ex)})</td>) :
                                (<td>{data.ptb.toFixed(3)} ({MCProConsoleAnalyticsHistoryPage.toSignedNumber(data.ptb - data.ptb_ex)})</td>)
                        }
                        <td>{this.formatTime(data)}</td>
                        <td>{data.isfirstwin ? "是" : ""}</td>
                    </tr>}
                    urlGenerator={function () {
                        let url = new URL(config.serverHost + "analyze/history");
                        let name = this.queryName.value;
                        let type = this.state.queryType;
                        url.searchParams.set("name", name);
                        url.searchParams.set("type", type);
                        this.refs.time.setUrl(url);
                        return url;
                    }.bind(this)}
                />
            </Col>
        </Row>)
    }
}

MCProConsoleAnalyticsHistoryPage.toSignedNumber = function (num) {
    if (num > 0)
        return <span className="positive-score-change">{"+" + num.toFixed(3)}</span>;
    else if (Math.abs(num) < 0.0004)
        return <span className="draw-score-change">±0.000</span>;
    else
        return <span className="negative-score-change">{num.toFixed(3)}</span>;
};

export default MCProConsoleAnalyticsHistoryPage;