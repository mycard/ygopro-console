import React, { Component } from 'react'
import { Row, Col, FormGroup, InputGroup, Button, FormControl } from 'react-bootstrap'
import MCProConsolePagedTable from "../components/PagedTable"
import MCProConsoleTimeRangePicker from "../components/Timerange"
import config from "../Config.json"
import moment from 'moment'
import "./analytics-deck.css"

class MCProConsoleAnalyticsDeckPage extends Component {
    constructor() {
        super();
        this.state = {
            activePage: 1,
            pageCount: 1,
            deckResult: []
        };
        this.deckname = null;
        this.decksource = null;
    }

    componentDidMount() {
        this.refs.table.handleQuery();
    }

    renderName(name) {
        let render = this.deckname.value;
        let index = name.indexOf(render);
        if (index < 0 || isNaN(index)) return name;
        else return (
            <div>{name.slice(0, index)}<span
                className="search-target">{render}</span>{name.slice(index + render.length, 99999)}</div>
        )
    }

    render() {
        return (<Row>
            <Col md={12} xs={12}>
                <form>
                    <FormGroup>
                        <InputGroup>
                            <InputGroup.Addon>时间</InputGroup.Addon>
                            <MCProConsoleTimeRangePicker ref="time"/>
                            <InputGroup.Addon>卡组名</InputGroup.Addon>
                            <FormControl type="text" inputRef={ref => this.deckname = ref} placeholder="输入要查询的卡组"/>
                            <InputGroup.Addon>来源名</InputGroup.Addon>
                            <FormControl type="text" inputRef={ref => this.decksource = ref} placeholder="来源"/>
                            <InputGroup.Button>
                                <Button type="submit" onClick={(event) => {
                                    this.refs.table.handleQuery();
                                    event.preventDefault();
                                }} bsStyle="primary">查询</Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </form>
            </Col>
            <Col md={12} xs={12}>
                <MCProConsolePagedTable ref="table" key="query deck" thead={["名称", "来源", "用量", "日期"]}
                                        tbodyGenerator={function (data) {
                                            return (
                                                <tr>
                                                    <td>{this.renderName(data.name)}</td>
                                                    <td>{data.source}</td>
                                                    <td>{data.sc}</td>
                                                    <td>{moment(data.time).format("YYYY-MM-DD")}</td>
                                                </tr>
                                            )
                                        }.bind(this)}
                                        urlGenerator={function () {
                                            let url = new URL(config.serverHost + "analyze/deck");
                                            url.searchParams.set('name', this.deckname.value);
                                            url.searchParams.set('source', this.decksource.value);
                                            this.refs.time.setUrl(url);
                                            return url;
                                        }.bind(this)}
                />
            </Col>
        </Row>)
    }
}

export default MCProConsoleAnalyticsDeckPage;
/*

            <Col md={12} xs = {12}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <td>名称</td>
                            <td>来源</td>
                            <td>用量</td>
                            <td>日期</td>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.deckResult.map(function(deckData) {
                            return(
                            <tr>
                                <td>{this.renderName(deckData.name)}</td>
                                <td>{deckData.source}</td>
                                <td>{deckData.count}</td>
                                <td>{moment(deckData.time).format("YYYY-MM-DD")}</td>
                            </tr>
                            )
                        }.bind(this))
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
 */