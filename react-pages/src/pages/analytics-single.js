import React, { Component } from 'react'
import { Row, Col, FormGroup, InputGroup, Button, FormControl } from 'react-bootstrap'
import MCProConsolePagedTable from "../components/PagedTable"
import MCProConsoleTimeRangePicker from "../components/Timerange"
import config from "../Config.json"

class MCProConsoleAnalyticsSinglePage extends Component {
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
                            <InputGroup.Addon>卡片ID</InputGroup.Addon>
                            <FormControl type="text" inputRef={ref => this.deckname = ref} placeholder="输入要查询的卡片ID"/>
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
                <MCProConsolePagedTable ref="table" key="query deck" thead={["卡片", "名称", "来源", "投入数", "投入频", "投入1枚", "投入2枚", "投入3枚", "+"]}
                                        tbodyGenerator={function (data) {
                                            console.log(data);
                                            return (
                                                <tr>
                                                    <td><img src={"https://ygo233.my-card.in/ygopro/pics/" + data.id.toString() + ".jpg!thumb"}></img></td>
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

export default MCProConsoleAnalyticsSinglePage;
