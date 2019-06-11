import React from "react";
import Navbar from "../Components/Navbar";
import PrescriptionApi from "../Api/Prescription";
import CareApi from '../Api/api';
import NotLogged from "../Components/NotLogged";
import { Figure, Button, Col } from "react-bootstrap";
import ExifOrientationImg from 'react-exif-orientation-img'
import axios from 'axios';

import '../Public/Prescription.css';
import '../Public/Common.css'

export default class Prescription extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileZoom: false,
            fileNames: [],
            files: [],
            fileZoomed: null,
            image: "",
            selectedFile: null,
        };
        this.refreshFiles = (response) => {
            if (response != null) {
                this.setState({
                    fileNames: response.data,
                });
                if (this.state.fileNames != null) {
                    let fileNames = this.state.fileNames;
                    let docFiles = [];
                    if (fileNames !== null) {
                        fileNames.Files.forEach(function (item) {
                            docFiles.push(PrescriptionApi.getFile(item.name))
                        });
                    }
                    this.setState({
                        files: docFiles,
                    });
                }
                else
                    this.setState({
                        fileNames: [],
                    });
            }
            else {
                console.log("Error get")
            }
        };

        this.handleClick = this.handleClick.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }
    componentDidMount() {
        if (CareApi.isConnected()) {
            PrescriptionApi.getFileNames().then(this.refreshFiles);
        }
    }

    handleClick(e, data) {
        if (!this.state.fileZoom) {
            // attach/remove event handler
            document.addEventListener('click', this.handleOutsideClick, false);
            if (e != null)
            this.setState({
                fileZoomed: data
            });
        } else {
            document.removeEventListener('click', this.handleOutsideClick, false);
        }

        this.setState(prevState => ({
            fileZoom: !prevState.fileZoom,
        }));
    }

    handleOutsideClick(e) {
        // ignore clicks on the component itself
        if (this.node.contains(e.target)) {
            return;
        }
        document.getElementById("overlay").style.display = "none";
        this.handleClick();
    }

    Display() {
        console.log("CLICKED");
        document.getElementById("overlay").style.display = "block";
        return(
            <div
                style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <ExifOrientationImg
                    width="550"
                    alt="prescription"
                    src={this.state.fileZoomed}
                />
            </div>
        )
    }

    onChange(e) {
        this.setState({
            selectedFile: e.target.files[0]
        })
    }

    fileUploadHandler() {
        const fd = new FormData();
        console.log(this.state.selectedFile);
        fd.append("img", this.state.selectedFile);
        axios.post(PrescriptionApi.upload(), fd).then(res => {
            console.log(res);
        });
        window.location.reload();
    }


    render() {
        if (!CareApi.isConnected())
            return (<NotLogged/>);
        const items = [];
        for (const [index, value] of this.state.files.entries()) {
            items.push(
                <Button variant="light" key={index} id='toto' onClick={((e) => this.handleClick(e, value))}>
                    <Figure>
                        <Figure.Image
                            src={value}
                            width="200"
                            fluid
                        />
                    </Figure>
                </Button>
            )
        }

        return (
            <div>
                <div id="overlay">
                    {this.state.fileZoom && (
                        <div ref={node => { this.node = node; }}>
                            {this.Display()}
                        </div>
                    )}
                </div>
                <div>
                    <Navbar/>
                    <div className="container ">
                        <div className="row align-items-center">
                            <div className="image-upload">
                                <label htmlFor="file-input">
                                    <img src="http://www.pngall.com/wp-content/uploads/2/Upload-PNG.png" alt="upload"/>
                                </label>
                                <input id="file-input" type="file" name="file" style={{display:"none"}} onChange={(e)=>this.onChange(e)}/>
                            </div>
                            <Col xs={12} md={8}>
                                <Button size="lg" onClick={()=>this.fileUploadHandler()}>Confirm</Button>
                            </Col>
                        </div>

                    </div>
                    <br/>
                    <br/>
                    <div className="container ">
                        <div className="row">
                            {items}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
