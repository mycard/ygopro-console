import React, {Component} from 'react'
import {InputGroup, Button} from 'react-bootstrap'
import DateRangePicker from 'react-bootstrap-datetimerangepicker'
import moment from 'moment'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-daterangepicker/daterangepicker.css'

class MCProConsoleTimeRangePicker extends Component {
    constructor() {
        super();
        this.locale = {
            format: 'YYYY-MM-DD HH:mm',
            separator: ' - ',
            applyLabel: '提交',
            cancelLabel: '取消',
            fromLabel: '从',
            toLabel: '到',
            customRangeLabel: '自定义时间段',
            monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六']
        };
        this.state = {
            startDate: moment().set({hour: 0, minute: 0, second: 0}),
            endDate: moment().set({hour: 23, minute: 59, second: 59})
        }
    }

    componentDidMount()
    {
        this.setState({
            startDate: this.props.startDate,
            endDate: this.props.endDate
        });
    }

    onApply(event, picker)
    {
        console.log(picker.startDate);
        this.setState({
            startDate: picker.startDate,
            endDate: picker.endDate
        }, function () {
            if (this.props.onChanged)
                this.props.onChanged(event, this);
        }.bind(this));
    }

    setUrl(url)
    {
        url.searchParams.set('start_time', this.state.startDate.valueOf());
        url.searchParams.set('end_time', this.state.endDate.valueOf());
    }

    render() {
        let display = null;
        let startDate = this.state.startDate;
        let endDate = this.state.endDate;
        for (let name of Object.keys(this.props.ranges))
            if (startDate.isSame(this.props.ranges[name][0], 'minute') && endDate.isSame(this.props.ranges[name][1], 'minute'))
                display = name;
        if (!display)
            if (startDate.isSame(this.state.endDate, 'day'))
                display = startDate.format('YYYY-MM-DD HH:mm') + ' - ' + endDate.format('HH:mm');
            else
                display = startDate.format('YYYY-MM-DD') + " - " + endDate.format("YYYY-MM-DD");
        return <InputGroup.Button>
            <DateRangePicker startDate={startDate} endDate={endDate}
                             timePicker
                             timePicker24Hour
                             showDropdowns
                             ranges={this.props.ranges}
                             locale={this.locale}
                             onApply={this.onApply.bind(this)}
                             style={{width: '100%'}}>
                <Button style={{borderRadius: 0}}>
                    <span>{display}</span>
                    <span className="caret" style={{margin: "0 0 0 5px"}} />
                </Button>
            </DateRangePicker>
        </InputGroup.Button>
    }
}

let startDay = {hour: 0, minute: 0, second: 0};
let endDay = {hour: 23, minute: 59, second: 59};
MCProConsoleTimeRangePicker.defaultProps = {
    onChanged: null,
    ranges: {
        '今天': [moment().set(startDay), moment().set(endDay)],
        '昨天': [moment().subtract(1, 'days').set(startDay), moment().subtract(1, 'days').set(endDay)],
        '过去 7 天': [moment().subtract(7, 'days').set(startDay), moment().subtract(1, 'days').set(endDay)],
        '过去 15 天': [moment().subtract(15, 'days').set(startDay), moment().subtract(1, 'days').set(endDay)],
        '过去 30 天': [moment().subtract(30, 'days').set(startDay), moment().subtract(1, 'days').set(endDay)],
        '本月': [moment().startOf('month').set(startDay), moment().endOf('month').set(endDay)],
        '上月': [moment().subtract(1, 'month').startOf('month').set(startDay), moment().subtract(1, 'month').endOf('month').set(endDay)],
        '全部': [moment('1970-01-01 00:00:00'), moment().set(endDay)]
    },
    startDate: null,
    endDate: null
};

export default MCProConsoleTimeRangePicker;