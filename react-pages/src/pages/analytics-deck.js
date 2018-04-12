import React, { Component } from 'react'
import { Row, Col, FormGroup, InputGroup, Button, FormControl } from 'react-bootstrap'
import MCProConsolePagedTable from "../components/PagedTable"
import MCProConsoleTimeRangePicker from "../components/Timerange"
import config from "../Config.json"
import moment from 'moment'
import "./analytics-deck.css"
import {message_object} from "../components/Message";

class MCProConsoleAnalyticsDeckPage extends Component {
    constructor() {
        super();
        this.state = {
            activePage: 1,
            pageCount: 1,
            focusDeckName: null,
            count: null
        };
        this.deckname = null;
        this.decksource = null;
        this.bufferDeckData = null;
    }

    componentDidMount() {
        this.refs.table.handleQuery();
        this.queryCount();
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

    openTag(name) {
        message_object.doFetch("query deck", this.generateURL("%" + name + "%").toString(), {}, async function (result) {
           let json = await result.json();
           this.refs.table.setState({data: json});
        }.bind(this));
        this.setState({focusDeckName: name}, () => {this.refs.tagTable.handleQuery();})
    }

    closeTag() {
        this.setState({focusDeckName: null});
        this.refs.table.handleQuery();
    }

    generateURL(name, source) {
        let url = new URL(config.serverHost + "analyze/deck");
        url.searchParams.set('name', name ? name : (this.deckname ? this.deckname.value : ""));
        url.searchParams.set('source', source ? source : (this.decksource ? this.decksource.value : ""));
        this.refs.time.setUrl(url);
        return url;
    }

    render() {
        return (<Row>
            <Col md={12}
                 xs={12}>
                <form>
                    <FormGroup>
                        <InputGroup>
                            <InputGroup.Addon>时间</InputGroup.Addon>
                            <MCProConsoleTimeRangePicker ref="time"/>
                            <InputGroup.Addon>卡组名</InputGroup.Addon>
                            <FormControl type="text"
                                         inputRef={ref => this.deckname = ref}
                                         placeholder="输入要查询的卡组"/>
                            <InputGroup.Addon>来源名</InputGroup.Addon>
                            <FormControl type="text"
                                         inputRef={ref => this.decksource = ref}
                                         placeholder="来源"/>
                            {this.state.count != null ? <InputGroup.Addon>{this.state.count}</InputGroup.Addon> :
                                <div></div>}
                            <InputGroup.Button>
                                <Button type="submit"
                                        onClick={(event) => {
                                            this.refs.table.handleQuery();
                                            this.setState({focusDeckName: null});
                                            this.queryCount();
                                            event.preventDefault();
                                        }}
                                        bsStyle="primary">查询</Button>
                                {this.state.focusDeckName != null ? <Button onClick={this.closeTag.bind(this)}>返回</Button> : ""}
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </form>
            </Col>
            <Col md={12}
                 xs={12}>
                <MCProConsolePagedTable ref="table"
                                        key="query deck"
                                        thead={["名称", "来源", "用量", "日期"]}
                                        tbodyGenerator={function (data) {
                                            return (
                                                <tr>
                                                    <td onClick={this.openTag.bind(this, data.name)}>{this.renderName(data.name)}</td>
                                                    <td>{data.source}</td>
                                                    <td>{data.sc}</td>
                                                    <td>{moment(data.time).format("YYYY-MM-DD")}</td>
                                                </tr>
                                            )
                                        }.bind(this)}
                                        urlGenerator={this.generateURL.bind(this)}
                />
            </Col>
            {
                this.state.focusDeckName != null ?
                    <Col md={12}
                         xs={12}>
                        <MCProConsolePagedTable ref="tagTable"
                                                key="query tag"
                                                thead={["名称", "来源", "用量"]}
                                                tbodyGenerator={function (data) {
                                                    return (
                                                        <tr>
                                                            <td>{data.name.slice(this.state.focusDeckName.length + 1, 99999)}</td>
                                                            <td>{data.source}</td>
                                                            <td>{data.sc}</td>
                                                        </tr>
                                                    )
                                                }.bind(this)}
                                                urlGenerator={function () {
                                                    let url = new URL(config.serverHost + "analyze/tag");
                                                    url.searchParams.set('name', this.state.focusDeckName);
                                                    url.searchParams.set('source', this.decksource ? this.decksource.value : "");
                                                    this.refs.time.setUrl(url);
                                                    return url;
                                                }.bind(this)}
                        />
                    </Col> : <div></div>
            }

        </Row>)
    }
}

export default MCProConsoleAnalyticsDeckPage;
