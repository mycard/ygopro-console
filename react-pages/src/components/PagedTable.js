import React, { Component } from 'react'
import { Row, Col, Table, Pagination} from 'react-bootstrap'
import { message_object } from "./Message"

class MCProConsolePagedTable extends Component
{
    constructor() {
        super();
        this.state = {
            data: null,
            pageCount: 1,
            activePage: 1
        };
    }

    handleSelect(eventKey)
    {
        this.setState({ activePage: eventKey });
        this.runForData(eventKey);
    }

    handleQuery()
    {
        this.runForCount();
        this.runForData(1);
    }

    runForData(page)
    {
        if (!page) page = 0;
        let uri = this.props.urlGenerator.call();
        uri.searchParams.set("page", page);
        message_object.doFetch(this.props.key, uri.toString(), {}, function (result) {
            return result.json().then(function (data) {
                this.setState({data: data});
                return data.length + " values";
            }.bind(this));
        }.bind(this));
    }

    runForCount()
    {
        let uri = this.props.urlGenerator.call();
        uri.pathname += "/count";
        message_object.doFetch(this.props.key + ' count', uri.toString(), {}, function (result) {
            return result.text().then(function (countStr) {
                let count = parseInt(countStr, 10);
                if (!isNaN(count))
                    this.setState({pageCount: count});
                return count + " pages";
            }.bind(this));
        }.bind(this));
    }

    render() {
        return <Row>
            <Col xs={12}
                 md={12}>
                <Table striped
                       bordered
                       hover>
                    <thead>
                    <tr>
                        {this.props.thead.map((name) => <td>{name}</td>)}
                    </tr>
                    </thead>
                    {
                        <tbody>
                        {
                            this.state.data == null ? <tr><td colSpan={this.props.thead.length}>无相关数据</td></tr>
                                : this.state.data.length === 0 ? <tr><td colSpan={this.props.thead.length}>{this.props.noDataDescription}</td></tr>
                                : this.state.data ? this.state.data.map(this.props.tbodyGenerator) : null
                        }
                        { this.props.children }
                        </tbody>
                    }
                </Table>
                {this.state.pageCount >= 2 ?
                    <div style={{textAlign: "center"}}>
                        <Pagination style={{marginLeft: "auto", marginRight: "auto"}}
                                    prev
                                    next
                                    first
                                    last
                                    ellipsis
                                    boundaryLinks
                                    items={this.state.pageCount}
                                    maxButtons={10}
                                    activePage={this.state.activePage}
                                    onSelect={this.handleSelect.bind(this)}/>
                    </div>
                    : null}
            </Col>
        </Row>
    }
}

MCProConsolePagedTable.defaultProps = {
    thead: [],
    tbodyGenerator: null,
    urlGenerator: null,
    noDataDescription: "数据为空",
    key: ''
};

export default MCProConsolePagedTable;