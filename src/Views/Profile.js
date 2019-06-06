//import '../Public/Profile.css';
import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import CareApi from '../api';
import NotLogged from "../Components/NotLogged";

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
        };
        this.refreshInfo = (response) => {
            if (response != null) {
                console.log(response.data.user);
                this.setState({
                    user: response.data.user,
                });
            }
        };
    }
    componentWillMount() {
        CareApi.getProfileInfo().then(this.refreshInfo);
    }

    loadingScreenPage() {
        return (
            <div className="center-screen">
                <h1>Loading ...</h1>
            </div>
        );
    }
    render() {
        if (!CareApi.isConnected())
            return (<NotLogged/>);
        if (!this.state.user)
            return this.loadingScreenPage();
        return (
            <div>
                <div className="jumbotron">
                    <h1 className="display-4">{this.state.user.name}</h1>
                    <p className="lead">{this.state.user.last_name}</p>
                    <p className="lead">{this.state.user.email}</p>
                    <hr className="my-4" />
                    <p>{this.state.user.type}</p>
                    <p className="lead">
                        <Link className="btn btn-lg btn-danger" to="/login" onClick={CareApi.logout}>Logout</Link>
                    </p>
                </div>
            </div>
        );
    }
}