import React, { Component } from 'react'
import { Row, Col, Table, Pagination, FormGroup, InputGroup, Button, FormControl } from 'react-bootstrap'
import { message_object } from "../Message"
import config from "../Config.json"
import moment from 'moment'
import "./analytics-deck.css"

class MCProConsoleAnalyticsDeckPage extends Component
{
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

    componentDidMount()
    {
        this.searchDeck();
    }

    searchCard()
    {

    }

    searchDeck(event)
    {
        message_object.doFetch("query deck count", config.serverHost + "analyze/deck/count?name=" + this.deckname.value + "&source=" + this.decksource.value, {}, function (result) {
           result.text().then(function (result) {
               let value = parseInt(result, 10);
               if (value && !isNaN(value)) this.setState({pageCount: value});
           }.bind(this));
           return "ok";
        }.bind(this));
        this.searchDeckPage(1);
        if (event) event.preventDefault();
    }

    searchDeckPage(page)
    {
        message_object.doFetch("query deck", config.serverHost + "analyze/deck?name=" + this.deckname.value + "&source=" + this.decksource.value + "&page=" + page, {}, function (result) {
            console.log(result);
            result.json().then(function (result) {
                console.log(result);
                this.setState({deckResult: result, activePage: page});
            }.bind(this));
            return 'ok';
        }.bind(this))
    }

    handleSelect(eventKey)
    {
        this.searchDeckPage(eventKey);
    }

    renderName(name)
    {
        let render = this.deckname.value;
        let index = name.indexOf(render);
        if (index < 0 || isNaN(index)) return name;
        else return (
            <div>{name.slice(0, index)}<span className="search-target">{render}</span>{name.slice(index + render.length, 99999)}</div>
        )
    }

    render()
    {
        return (<Row>
            <Col md={6} xs={12}>
                <form>
                    <FormGroup>
                        <InputGroup>
                            <InputGroup.Addon>卡组名</InputGroup.Addon>
                            <FormControl type="text" inputRef={ref => this.deckname = ref} placeholder="输入要查询的卡组" />
                            <InputGroup.Addon>来源名</InputGroup.Addon>
                            <FormControl type="text" inputRef={ref => this.decksource = ref} placeholder="来源" />
                            <InputGroup.Button>
                                <Button type="submit" onClick={this.searchDeck.bind(this)}>确定</Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </form>
            </Col>
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
        </Row>)
    }
}

export default MCProConsoleAnalyticsDeckPage;