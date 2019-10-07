import React, { Component } from 'react';
import L from "leaflet";
import "leaflet-routing-machine";
import { withLeaflet } from "react-leaflet";
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

class MapRouting extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showConfirmStartPos : false,
            showNoRouteFound : false,
            start : props.routeFrom,
            end : props.routeTo,
            searchedPos : null,
            routing : this.createRoutingElement()
        };
        this.setShowStartPosConfirmationModal = this.setShowStartPosConfirmationModal.bind(this)
        this.setRoutingError = this.setRoutingError.bind(this)
    }

    //we are adding this leaflet routing element to the state so we can update it
    createRoutingElement() {

        const { routeFrom, routeTo} = this.props;
        const { map } = this.props.leaflet;
        let waypoints = [routeFrom, routeTo];
        let self = this;

        //create leaflet routing control element and add it to the map
        let routingControl = L.Routing.control({
            waypoints,
            showAlternatives: true,
            lineOptions: {
                styles: [{color: 'red', opacity: 0.5, weight: 6 }]
            },
            altLineOptions: {
                styles: [{color: '#000', opacity: 0.4, weight: 4}] },
            addWaypoints: true,
            draggableWaypoints: true,
            plan: L.Routing.plan(waypoints, {
                createMarker: function(i, wp) {
                    return L.marker(wp.latLng, {
                        draggable: true,
                    });
                },
                routeWhileDragging: true
            }),
        });
        routingControl.addTo(map);

        //If user enters an address, ask if they want if they want to use it itinerary start
        map.on('geosearch/showlocation', function(event) {
            let searchedPos = [Number(event.location.y), Number(event.location.x)];
            self.setShowStartPosConfirmationModal(true, searchedPos);
        });

        //If no itinerary is found, set routing error and display error message
        routingControl.on('routingerror', function() {
            self.setRoutingError(true);
        });

        return routingControl.getPlan();
    }

    //sets the routing error in the state
    setRoutingError(value) {
        this.setState({showNoRouteFound: value});
    }

    //shows a modal window thath asks if user wants to use this address as start position
    setShowStartPosConfirmationModal(show, pos) {
        this.setState({showConfirmStartPos: show});
        this.setState({searchedPos: pos});
    }

    //update start position with user-given address
    updateStartPosCloseModal() {
        let wayPoints = [this.state.searchedPos, this.state.end];
        this.state.routing.setWaypoints(wayPoints);
        this.setState({showConfirmStartPos: false})
    }

    displayConfirmationModal() {
        return (
            <Modal
                show={this.state.showConfirmStartPos}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Utiliser comme point de départ ?
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Voulez-vous utiliser cette adresse comme point de départ de l'ititinéraire jusqu'à l'hôpital ?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.setState({showConfirmStartPos: false})} variant="secondary">Non</Button>
                    <Button onClick={() => this.updateStartPosCloseModal()} variant="primary">Oui</Button>
                </Modal.Footer>
            </Modal>
        );
    };

    displayNoRouteFoundModal() {
        return (
            <Modal
                show={this.state.showNoRouteFound}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Pas d'itinéraire trouvé
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Aucun itinéraire n'a été trouvé entre l'hôpital et ce point de départ. Veuillez utiliser une autre adresse.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={(() => this.setState({showNoRouteFound: false}))} variant="primary">OK</Button>
                </Modal.Footer>
            </Modal>
        );
    };

    render() {
        return (
            <React.Fragment>
            {this.displayConfirmationModal()}
            {this.displayNoRouteFoundModal()}
            </React.Fragment>
        );
    }

}
export default withLeaflet(MapRouting);