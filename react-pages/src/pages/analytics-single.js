import React, { Component } from 'react'
import { Row, Col, FormGroup, InputGroup, Button, FormControl } from 'react-bootstrap'
import MCProConsolePagedTable from "../components/PagedTable"
import MCProConsoleTimeRangePicker from "../components/Timerange"
import config from "../Config.json"
import {message_object} from "../components/Message";

class MCProConsoleAnalyticsSinglePage extends Component {
    constructor() {
        super();
        this.state = {
            activePage: 1,
            pageCount: 1,
            deckResult: [],
            count: null
        };
        this.deckname = null;
        this.decksource = null;
    }

    componentDidMount() {
        this.refs.table.handleQuery();
        this.queryCount();
    }

    renderName(name) {
        if (!this.deckname)
            return name;
        let render = this.deckname.value;
        let index = name.indexOf(render);
        if (index < 0 || isNaN(index)) return name;
        else return (
            <div>{name.slice(0, index)}<span
                className="search-target">{render}</span>{name.slice(index + render.length, 99999)}</div>
        )
    }

    queryCount() {
        let url = new URL(config.serverHost + "analyze/count");
        url.searchParams.set('source', this.decksource.value);
        this.refs.time.setUrl(url);
        message_object.doFetch("single count", url.toString(), {}, async function (result) {
            let count = await result.text();
            this.setState({count: count});
        }.bind(this))
    }

    render() {
        return (<Row>
            <Col md={12} xs={12}>
                <form>
                    <FormGroup>
                        <InputGroup>
                            <InputGroup.Addon>时间</InputGroup.Addon>
                            <MCProConsoleTimeRangePicker ref="time"/>
                            <InputGroup.Addon>卡片</InputGroup.Addon>
                            <FormControl type="text" inputRef={ref => this.deckname = ref} placeholder="输入要查询的卡片ID或名称（多种卡片只支持前50种）"/>
                            <InputGroup.Addon>来源名</InputGroup.Addon>
                            <FormControl type="text" inputRef={ref => this.decksource = ref} placeholder="来源"/>
                            { this.state.count != null ? <InputGroup.Addon>{this.state.count}</InputGroup.Addon> : <div></div>}
                            <InputGroup.Button>
                                <Button type="submit" onClick={(event) => {
                                    this.refs.table.handleQuery();
                                    this.queryCount();
                                    event.preventDefault();
                                }} bsStyle="primary">查询</Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </form>
            </Col>
            <Col md={12} xs={12}>
                <MCProConsolePagedTable ref="table" key="query single" thead={["卡片", "名称", "来源", "投入数", "投入频", "投入1枚", "投入2枚", "投入3枚", "+"]}
                                        tbodyGenerator={function (data) {
                                            return (
                                                <tr>
                                                    <td><a href={"https://www.ourocg.cn/search/" + data.id.toString()} target={"_blank"}><img src={"https://ygo233.my-card.in/ygopro/pics/" + data.id.toString() + ".jpg!thumb"}></img></a></td>
                                                    <td>{this.renderName(data.name)}</td>
                                                    <td>{data.source}</td>
                                                    <td>{data.sc}</td>
                                                    <td>{data.numbers}</td>
                                                    <td>{data.putone}</td>
                                                    <td>{data.puttwo}</td>
                                                    <td>{data.putthree}</td>
                                                    <td>{data.putoverthree}</td>
                                                </tr>
                                            )
                                        }.bind(this)}
                                        urlGenerator={function () {
                                            let url = new URL(config.serverHost + "analyze/single");
                                            url.searchParams.set('name', this.deckname ? this.deckname.value : "");
                                            url.searchParams.set('source', this.decksource ? this.decksource.value : "");
                                            this.refs.time.setUrl(url);
                                            return url;
                                        }.bind(this)}
                />
            </Col>
        </Row>)
    }
}

export default MCProConsoleAnalyticsSinglePage;
