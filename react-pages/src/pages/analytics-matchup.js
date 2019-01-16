import React, { Component } from 'react'
import { Row, Col, Form, MenuItem, InputGroup, FormControl, DropdownButton, Button } from 'react-bootstrap'
import moment from 'moment'
import config from '../Config.json'
import MCProConsolePagedTable from "../components/PagedTable";

class MCProConsoleAnalyticsMatchupPage extends Component {
    constructor(props) {
        super(props);
        this.queryDeckA = null;
        this.queryDeckB = null;
        this.queryPeriod = null;
        this.state = {
            queryType: "athletic"
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

    render() {
        return (<Row>
            <Col md={12} xs={12}>
                <Form>
                    <InputGroup>
                        <InputGroup.Addon>时间</InputGroup.Addon>
                        <FormControl type="text" placeholder={moment().format("YYYY-MM")} inputRef={ ref => this.queryPeriod = ref }/>
                        <InputGroup.Addon>卡组A</InputGroup.Addon>
                        <FormControl type="text" placeholder="迷之卡组" inputRef={ ref => this.queryDeckA = ref }/>
                        <InputGroup.Addon>卡组B</InputGroup.Addon>
                        <FormControl type="text" placeholder="迷之卡组" inputRef={ ref => this.queryDeckB = ref }/>
                        <InputGroup.Addon>类别</InputGroup.Addon>
                        <InputGroup.Button>
                            <DropdownButton id="query_type" title={{all: '全部', entertain: '娱乐', athletic: '竞技'}[this.state.queryType]} onSelect={this.selectQueryType.bind(this)}>
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
                <MCProConsolePagedTable ref="table" key="query matchup" thead={["卡组A", "卡组B", "时间", "来源", "胜", "平", "负"]} tbodyGenerator={data =>
                    <tr>
                        <td>{data.decka}</td>
                        <td>{data.deckb}</td>
                        <td>{data.period}</td>
                        <td>{data.source}</td>
                        <td>{data.win}（{(data.win * 100 / (data.win + data.draw + data.lose)).toFixed(2)}%）</td>
                        <td>{data.draw}（{(data.draw * 100 / (data.win + data.draw + data.lose)).toFixed(2)}%）</td>
                        <td>{data.lose}（{(data.lose * 100 / (data.win + data.draw + data.lose)).toFixed(2)}%）</td>
                    </tr>}
                    urlGenerator={function () {
                        let url = new URL(config.serverHost + "analyze/matchup");
                        if (this.queryPeriod.value.length > 0)
                            url.searchParams.set("period", this.queryPeriod.value);
                        url.searchParams.set("deckA", this.queryDeckA.value);
                        url.searchParams.set("deckB", this.queryDeckB.value);
                        url.searchParams.set("source", this.state.queryType);
                        return url;
                    }.bind(this)}
        />
            </Col>
        </Row>)
    }
}

export default MCProConsoleAnalyticsMatchupPage;