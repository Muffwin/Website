import React, {useState} from 'react';
import {GoogleMap, Marker, Autocomplete, InfoWindow, DirectionsService, DirectionsRenderer} from '@react-google-maps/api'
import {mapOptions} from "./Shared/MapOptions";
import hospitalIcon from "../../Images/map_marker.png"
import userIcon from "../../Images/user_marker.png"
import "./Map.scss"
import {FaWalking, FaCar, FaBusAlt, FaHome} from "react-icons/all";
import Slider from '@material-ui/core/Slider';
import UberRidePopup from "./Shared/RequestUberPopup";
import NavBar from "../Landing/Components/Navbar";

/**
 * Ceci est le composant correspondant à la carte de Kwili. Il contient les focntions d'itinéraire,
 * d'affichage des hôpitaux, et toutes les autres fonctions relatives à l'usage de la carte.
 * Ce composant est écrit comme un composant fonctionnel.
 * Ce composant repose sur l'utilisation de l'{@link https://developers.google.com/maps/documentation/javascript/reference/map object Map} de l'API Google Maps.
 *
 * @Class
 * @requires GoogleMap
 * @see {@link https://developers.google.com/maps/documentation/javascript/ documentation API Google Maps}
 */
function Map() {

    //state declaration and management
    const [center] = useState({ lat: 48.8566, lng: 2.3522});
    const [mapRef, setMapRef] = useState(null);
    const [markerMap, setMarkerMap] = useState({});
    const [userPos, setUserPos] = useState({ lat: 48.8566, lng: 2.3522});
    const [searchRadius, setRadius] = useState(1500);
    const [zoom] = useState(15);
    const [hospitalMarkers, setHospitalMarkers] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [infoOpen, setInfoOpen] = useState(false);
    const [placeDetails, setPlaceDetails] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);
    const [userMarker, setUserMarker] = useState(null);
    const [userTravelMode, setTravelMode] = useState('DRIVING');
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [userDestination, setDestination] = useState(null);


    /**
     * Définit le centre de la carte et la position de l'utilisasateur à l'adresse saisie
     * lorsque l'utilisateur utilise la barre de recherche d'adressse.
     */
    const onPlaceSearched = () => {

        if (autocomplete !== null) {

            //set new map center and user position
            let newCenter = autocomplete.getPlace().geometry.location;
            mapRef.setCenter(newCenter);
            setUserPos(newCenter);
            userMarker.setPosition(newCenter);

            //reset destination or the directions update themselves
            setDestination(null);

            //delete old markers and update hospitals nearby
            setInfoOpen(false);
            setHospitalMarkers(null);
            findNearestHospitals(mapRef, newCenter);

        } else {
            console.log('Autocomplete is not loaded yet!')
        }
    };

    /**
     * Définit une référence à la barre d'automplétion d'adresseune fois l'autocomplétion chargée.
     * @param {Object} searchBar barre de recherche d'addresse
     */
    const onLoadAutocomplete = (searchBar) => {
        setAutocomplete(searchBar);
    };

    /**

     * Lorsque l'utilisateur clique sur le marqueur d'un hôpital, cette fonction en récupère les détails et ouvre
     * la boîte d'informations correspondante
     *
     * @async
     * @param {Event} event clickEvent sur le marqueur de l'hôpital
     * @param {Object} place hôpital sélectionné
     * @param {number} id hospital id de l'hôpital dans la liste des hôpitaux
     * @param {Object} map référence à l'object Map parent
     */
    const onMarkerClick = async (event, place, id, map) => {

        //update user destination if another hospital was previously selected
        if (!userDestination || userDestination !== place.geometry.location) {
            setDestination(place.geometry.location);
        }

        //if another info box is open, close it first
        //wait for hospital info actualization before opening info box
        await setInfoOpen(false);
        await requestHospitaldetails(id, map);
        await setSelectedPlace(place);

        setInfoOpen(true);

    };

    /**
     * Récupère les informations détaillées sur un hôpital à partir de son ID
     * @param {number} id hospital id de l'hôpital dans la liste des hôpitaux
     * @param {Object} map référence à l'object Map parent
     */
    const requestHospitaldetails = (id, map) => {

        let request = {
            placeId: id,
            fields: ['name', 'address_component', 'formatted_phone_number', 'geometry', 'rating', 'opening_hours']
        };
        let service = new window.google.maps.places.PlacesService(map);
        service.getDetails(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setPlaceDetails(results);
            }
            else setPlaceDetails(null);
        })
    };

    /**
     * Initialise les marqueurs pour tous les hôpitaux en leur associant leur ID dans l'API Google Places.
     * (L'id du marqueur créé est le même que l'ID du lieu dans l'API.)
     * @param {Object} marker composant basique utilisé pour le marqueur de chaque hôpital
     * @param {Object} place hôpital
     */
    const onMarkerLoad = (marker, place) => {
        return setMarkerMap(prevState => {
            return { ...prevState, [place.id]: marker };
        });
    };

    /**
     * Cette fonction récupère les hôpitaux les plus proches dans le rayon actuellement sélectionné
     * @todo récupérer plus de résultats : seuls les 20 résultats "les plus pertinents" selon l'API sont récupérés, ce qui résultse actuellement en des résultats imprévisibles avec un grand rayon
     * @param {Object} map référence à l'objet Map parent
     * @param {Object} position position de l'utilisateur (objet LatLng)
     */
    const findNearestHospitals = (map, position) => {
        let request = {
            location: position,
            radius: searchRadius,
            types: ["hospital"],
            keyword: "(emergency) AND ((medical centre) OR hospital)"
        };
        let service = new window.google.maps.places.PlacesService(map);
        service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                let markerList = [];
                for (let i = 0; i < results.length; i++) {
                    markerList.push(<Marker
                        key={results[i].id}
                        position={results[i].geometry.location}
                        icon={hospitalIcon}
                        onLoad={marker => onMarkerLoad(marker, results[i])}
                        onClick={event => onMarkerClick(event, results[i], results[i].place_id, map)}
                    />);
                }
                setHospitalMarkers(markerList);
            }
        })
    };

    /**
     * Mise à jour du rayon  puis des hôpitaux dans les environs en fonction du nouveau rayon
     * @async
     * @param {number} radius nouveau rayon sélectionné par l'utilisateur
     * @todo s'assurer de ne pas avoir de virgules dans l'affichage du rayon
     */
    const updateRadiusReloadHospitals = async (radius) => {
        await setRadius(radius);
        //await setInfoOpen(false);
        await findNearestHospitals(mapRef, userPos);
        setDestination(hospitalMarkers[0].position);
    };

    /**
     * Mise en place initiale de la map : stockage d'une référence à l'objet map dans le state.
     * (plusieurs appels à l'API Google Maps requièrent une référence à l'objet map)
     * La liste des hôpitaux près de la position initiale de l'utilisateur est également récupérée.
     * @param {Object} map référence à l'objet Map parent
     */
    const loadHandler = (map) => {
        setMapRef(map);
        //use geolocation if user allows it and set user position to geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async function(position) {
                let pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                await map.setCenter(pos);
                await setUserPos(pos);
                //use nearest hospitals to geolocated users
                findNearestHospitals(map, pos);
            }, function() {
            });
        } else {
            findNearestHospitals(map, userPos);
        }
    };

    /**
     * Callback pour définir l'itinéraire lorsque cela est nécéssaire.
     * @callback
     * @param {Object} réponse
     */
    const directionsCallback = (response) => {
        if (response !== null) {
            if (response.status === 'OK') {
                setDirectionsResponse(response);
            }
        }
    };

    /**
     * Rendering du composant carte et de ses sous-composants.
     * @returns {React.Fragment}
     */
    const renderMap = () => {

        let sidePanel = <div className={"directionsPanel"}> </div>;

        return <React.Fragment>
            <GoogleMap
                options={mapOptions}
                zoom={zoom}
                center={center}
                mapContainerStyle={{
                    height: "100vh",
                    width: "100vwh",
                    display: "flex",
                    alignItems: "center",
                    alignContent: "center",
                    justifyContent: "center",
                    justifyItems: "center",
                }}
                onLoad={map => loadHandler(map)}>

                <div className={"mapNavBarWrapper"}>
                    <NavBar />
                </div>

                <Marker
                    position={userPos}
                    icon={userIcon}
                    onLoad={(marker) => setUserMarker(marker)} />

                <Autocomplete
                    onLoad={(searchBar) => onLoadAutocomplete(searchBar)}
                    onPlaceChanged={() => onPlaceSearched()}>
                    <input type="text" placeholder="Rechercher une adresse..." className={"mapSearchBar"}                  />
                </Autocomplete>

                <a href={"/"} className={"homeButton"}>
                    <FaHome className={"homeIcon"}/>
                </a>

                {infoOpen && selectedPlace && (
                    <InfoWindow
                        anchor={markerMap[selectedPlace.id]}
                        onCloseClick={() => setInfoOpen(false)}>
                        <div>
                            {placeDetails ?
                                <div>
                                    <h3 className={"hospitalName"}>{placeDetails.name}</h3>
                                    <p><b>Addresse :</b> {placeDetails.address_components[0].short_name + ' ' + placeDetails.address_components[1].short_name }</p>
                                    <p><b>Téléphone :</b> {placeDetails.formatted_phone_number}</p>
                                    <p><b>Notation :</b> {placeDetails.rating ? placeDetails.rating : "inconnue"}</p>
                                    {placeDetails.opening_hours && placeDetails.opening_hours.isOpen() ?<p><b>Actuellement ouvert</b></p> : null}
                                </div> : <div>Chargement...</div>}
                        </div>
                    </InfoWindow>
                )}

                {hospitalMarkers}
                {userDestination && < DirectionsService
                    options={{
                        destination: userDestination,
                        origin: userPos,
                        travelMode: userTravelMode,
                    }}
                    callback={(response) => directionsCallback(response)}
                    panel={sidePanel}
                /> }

                {directionsResponse && userDestination && (<DirectionsRenderer
                    options={{
                        directions: directionsResponse,
                        polylineOptions: {
                            strokeColor: "#ff4d4d",
                            strokeOpacity: 0.8,
                            strokeWeight: 7
                        },
                        suppressMarkers: true,
                        draggable: true,
                        preserveViewport: true
                    }}/>)}

                <div className={"travelModeButtonsWrapper"}>
                    <div
                        className={userTravelMode === 'TRANSIT' ? "activeTravelModeButton" : "travelModeButton"}
                        onClick={() => setTravelMode('TRANSIT')}>
                        <FaBusAlt className={"travelModeIcon"}/>
                    </div>
                    <div
                        className={userTravelMode === 'WALKING' ? "activeTravelModeButton" : "travelModeButton"}
                        onClick={() => setTravelMode('WALKING')}>
                        <FaWalking className={"travelModeIcon"}/>
                    </div>
                    <div
                        className={userTravelMode === 'DRIVING' ? "activeTravelModeButton" : "travelModeButton"}
                        onClick={() => setTravelMode('DRIVING')}>
                        <FaCar className={"travelModeIcon"}/>
                    </div>
                    {selectedPlace && <UberRidePopup userPos={userPos} destination={{
                        lat: selectedPlace.geometry.location.lat(),
                        lng: selectedPlace.geometry.location.lng()
                    }}/>}
                </div>
                <div className={"sliderWrapper"}>
                    <h5 className={"sliderTitle"}>
                        {`Rayon de la recherche: ${searchRadius / 100} km`}
                    </h5>
                    <div className={"sliderBox"}>
                        <Slider
                            defaultValue={15}
                            aria-labelledby="discrete-slider"
                            valueLabelDisplay="auto"
                            step={5}
                            onChange={(e, val) => updateRadiusReloadHospitals(val * 100)}
                            min={10}
                            max={50}
                            className={"slider"}
                        />
                    </div>
                </div>

                )}

            </GoogleMap>
        </React.Fragment>
    };

    return renderMap();
}

export default Map;
