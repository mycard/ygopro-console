import React, { Component } from 'react'
import { Row, Col, FormControl, Button, ButtonGroup, Panel, InputGroup} from 'react-bootstrap'
import MCProConsoleLocaleList from '../LocaleList'
import Config from '../Config.json'
import {message_object} from '../Message'

class MCProConsoleImageManagerSinglePage extends Component {
    constructor()
    {
        super();
        this.state = {
            currentImageSource: '',
            generatedImageSource: ''
        };
    }

    handleIDSumbit()
    {
        let locale = this.refs.localeList.state.currentLocale;
        let archive_path = Config.imageServerHost + "archive/" + locale + "/" + this.cardID.value;
        let generated_path = Config.imageServerHost + "run/" + locale + "/" + this.cardID.value;
        /*message_object.doFetch(generated_path, generated_path, {}, function (result) {
            return result.text().then(function(data){
                this.refs.generatedImage.innerHTML = (data);
            }.bind(this));
        }.bind(this));*/
        this.setState({currentImageSource: archive_path, generatedImageSource: generated_path});
    }

    handleReplaceClick()
    {
        message_object.doFetch('image_single_replace_' + this.state.generatedImageSource, this.state.generatedImageSource, {method: 'POST'}, function (result) {
            return result.text();
        });
    }

    handleUploadMiddleClick(event)
    {
        let file = event.target.files[0];
        this.handleUpload(file, 'raw');
    }

    handleUploadFullClick(event)
    {
        let file = event.target.files[0];
        this.handleUpload(file, 'archive');
    }

    handleUpload(file, key)
    {
        if (this.cardID.value === '' || this.cardID.value === undefined)
        {
            alert ('Input card id first');
            return;
        }
        if (file.size > 512000)
        {
            alert('Max file size 500KB.');
            return;
        }
        let fileReader = new FileReader();
        let uri = Config.imageServerHost + key + '/' + this.refs.localeList.state.currentLocale + '/' + this.cardID.value;
        fileReader.onload = function(e)
        {
            message_object.doFetch('image_upload_' + uri, uri, { method: 'POST', body: e.target.result }, function (result) {
                return result.text();
            })
        }
        fileReader.readAsBinaryString(file);
    }

    render() {
        return (
            <Row>
                <Col md={6}>
                    <h2 className="page-header">
                        卡片&nbsp;&nbsp;&nbsp;
                        <MCProConsoleLocaleList ref="localeList" />
                    </h2>
                    <Col md={8}>
                        <InputGroup>
                            <InputGroup.Addon>操作卡片</InputGroup.Addon>
                            <FormControl inputRef={(ref) => this.cardID = ref} type="text" placeholder="输入卡片 ID" />
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <Button type="submit" onClick={this.handleIDSumbit.bind(this)}>提交</Button>
                    </Col>
                </Col>
                <Col md={12}>
                    <h2 className="page-header">操作</h2>
                    <ButtonGroup>
                        <label className="btn btn-default">上传中间图<input type="file" style={{display: 'none'}} onChange={this.handleUploadMiddleClick.bind(this)} /></label>
                        <label className="btn btn-default">上传全图<input type="file" style={{display: 'none'}} onChange={this.handleUploadFullClick.bind(this)} /></label>
                        <label className="btn btn-default" onClick={this.handleReplaceClick.bind(this)}>生成图置换</label>
                    </ButtonGroup>
                </Col>
                <Col md={12}>
                    <h2 className="page-header">对比</h2>
                    <Col md={6}>
                        <Panel header="当前图像">
                            <img src={this.state.currentImageSource} alt="" />
                        </Panel>
                    </Col>
                    <Col md={6}>
                        <Panel header="生成图像">
                            <img src={this.state.generatedImageSource} alt="" ref="generatedImage"/>
                        </Panel>
                    </Col>
                </Col>
            </Row>
        )
    }
}

export default MCProConsoleImageManagerSinglePage