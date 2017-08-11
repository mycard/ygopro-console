import React, {Component} from 'react'
import {Row, Col, DropdownButton, MenuItem, Jumbotron} from 'react-bootstrap'
import {message_object} from "../components/Message"
import config from "../Config.json"
import moment from "moment"
import {LineChart} from 'rd3'

class MCProConsoleAnalyticsDailyPage extends Component {
    constructor() {
        super();
        this.state = {
            dailyCounts: null,
            queryType: "all"
        };
    }

    componentDidMount() {
        this.callData();
    }

    callData(event) {
        this.setState({dailyCounts: null});
        message_object.doFetch("daily count", config.serverHost + 'analyze/daily?type=' + this.state.queryType, {}, function (result) {
            result.json().then(function (daily) {
                this.setState({dailyCounts: daily});
            }.bind(this));
            return 'ok'
        }.bind(this));
        if (event) event.preventDefault();
    }

    selectQueryType(eventKey) {
        this.setState({queryType: eventKey}, this.callData.bind(this));
    }

    render() {
        if (!this.state.dailyCounts) return <div>
            <Jumbotron>
                <h2>正在查询分类 <kbd>{{all: '全部', entertain: '娱乐', athletic: '竞技'}[this.state.queryType]}</kbd> 的日活信息 ...
                </h2>
                <p>出于计算规模的原因，日活的查询非常的缓慢，视乎数据库繁忙程度需要10秒到1分钟不等的时间。</p>
            </Jumbotron>

            {this.c}
        </div>;
        return <Row>
            <Col md={4} xs={12}>
                <DropdownButton id="query_type"
                                title={{all: '全部', entertain: '娱乐', athletic: '竞技'}[this.state.queryType]}
                                onSelect={this.selectQueryType.bind(this)}>
                    <MenuItem eventKey="all">全部</MenuItem>
                    <MenuItem eventKey="entertain">娱乐</MenuItem>
                    <MenuItem eventKey="athletic">竞技</MenuItem>
                </DropdownButton>
            </Col>
            <Col md={12} xs={12}>
                <LineChart
                    data={[{name: "", values: this.state.dailyCounts}]}
                    width='100%'
                    height={400}
                    viewBoxObject={{
                        x: 0,
                        y: 0,
                        width: 700,
                        height: 400
                    }}
                    xAccessor={d => new Date(d.day)}
                    yAccessor={d => parseFloat(d.day_active_users)}
                    title="日活走势"
                    yAxisLabel="日活跃指数"
                    xAxisLabel="日期"
                    domain={{y: [0,]}}
                    xAxisFormatter={x => moment(x).format("MM-DD")}
                    xAxisTickInterval={{interval: 7}}
                    gridHorizontal={true}
                    gridVerticalStrokeDash={"1,0"}
                    tooltipFormat={function (v) {
                        return <div style={{whiteSpace: "nowrap"}}>
                                <p><b>{moment(v.xValue).format("M月D日")}</b></p>
                                <p>日间活跃量</p>
                                <p>{v.yValue}</p>
                            </div>
                    }}
                />
            </Col>

        </Row>
    }

    /*
                <form>
                    <InputGroup>
                        <InputGroup.Button>
                        </InputGroup.Button>
                    </InputGroup>
                </form>*/
    // <InputGroup.Addon>类别</InputGroup.Addon>
    // <Button type="submit" onClick={this.callData.bind(this)} bsStyle="primary">查询</Button>
}

export default MCProConsoleAnalyticsDailyPage;

// FUCK LINE CHART
