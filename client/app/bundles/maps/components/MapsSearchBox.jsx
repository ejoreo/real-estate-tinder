/* global google */

import canUseDOM from "can-use-dom";

import raf from "raf";

import {
  default as React,
  Component,
} from "react";

import {
  withGoogleMap,
  GoogleMap,
  Marker,
  Circle,
  InfoWindow,
} from "react-google-maps/lib";

const geolocation = (
  canUseDOM && navigator.geolocation ?
  navigator.geolocation :
  ({
    getCurrentPosition(success, failure) {
      failure(`Your browser doesn't support geolocation.`);
    },
  })
);

import SearchBox from "react-google-maps/lib/places/SearchBox";


const INPUT_STYLE = {
  boxSizing: `border-box`,
  MozBoxSizing: `border-box`,
  border: `1px solid transparent`,
  width: `240px`,
  height: `32px`,
  marginTop: `27px`,
  padding: `0 12px`,
  borderRadius: `1px`,
  boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
  fontSize: `14px`,
  outline: `none`,
  textOverflow: `ellipses`,
};

const SearchBoxExampleGoogleMap = withGoogleMap(props => (
  <GoogleMap
    ref={props.onMapMounted}
    defaultZoom={13}
    center={props.center}
    onBoundsChanged={props.onBoundsChanged}
  >
    <SearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.bounds}
      controlPosition={google.maps.ControlPosition.CENTER}
      onPlacesChanged={props.onPlacesChanged}
      inputPlaceholder="Find your new Hôm"
      inputStyle={INPUT_STYLE}
    />
    {props.center && (
      <InfoWindow position={props.center}>
        <div>{props.content}</div>
      </InfoWindow>
    )}
    {props.center && (
      <Circle
        center={props.center}
        radius={props.radius}
        options={{
          fillColor: `red`,
          fillOpacity: 0.20,
          strokeColor: `red`,
          strokeOpacity: 1,
          strokeWeight: 1,
        }}
      />
    )}
    {props.markers.map((marker, index) => (
      <Marker position={marker.position} key={index} />
    ))}
  </GoogleMap>
));

/*
 * https://developers.google.com/maps/documentation/javascript/examples/places-searchbox
 *
 * Add <script src="https://maps.googleapis.com/maps/api/js"></script> to your HTML to provide google.maps reference
 */
export default class SearchBoxExample extends Component {
  state = {
    center: null,
    content: "Locating.",
    bounds: null,
    center: {
      lat: 37.7749,
      lng: -122.4194,
    },
    markers: [],
    priceRange: 'lowest',
    propertyType: 'apartment',
    rentals: []
  };

  isUnmounted = false;

  componentDidMount() {
    const tick = () => {
      if (this.isUnmounted) {
        return;
      }
      this.setState({ radius: Math.max(this.state.radius - 20, 0) });

      if (this.state.radius > 200) {
        raf(tick);
      }
    };
    geolocation.getCurrentPosition((position) => {
      if (this.isUnmounted) {
        return;
      }
      this.setState({
        center: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        content: `Location found.`,
      });

      raf(tick);
    }, (reason) => {
      if (this.isUnmounted) {
        return;
      }
      this.setState({
        center: {
          lat: 37.7749,
          lng: -122.4194,
        },
        content: `Error: The Geolocation service failed (${reason}).`,
      });
    });
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  handleMapMounted = this.handleMapMounted.bind(this);
  handleBoundsChanged = this.handleBoundsChanged.bind(this);
  handleSearchBoxMounted = this.handleSearchBoxMounted.bind(this);
  handlePlacesChanged = this.handlePlacesChanged.bind(this);
  handlePropertyTypeChange = this.handlePropertyTypeChange.bind(this);
  handlePriceRangeChange = this.handlePriceRangeChange.bind(this);
  handleSubmit = this.handleSubmit.bind(this);

  handleMapMounted(map) {
    this._map = map;
  }

  handleBoundsChanged() {
    this.setState({
      bounds: this._map.getBounds(),
      center: this._map.getCenter(),
    });
  }

  handleSearchBoxMounted(searchBox) {
    this._searchBox = searchBox;
  }

  handlePlacesChanged() {
    const places = this._searchBox.getPlaces();

    // Add a marker for each place returned from search bar
    const markers = places.map(place => ({
      position: place.geometry.location,
    }));

    // Set markers; set map center to first search result
    const mapCenter = markers.length > 0 ? markers[0].position : this.state.center;

    this.setState({
      center: mapCenter,
      markers,
      address: places[0].formatted_address,

    });
  }

  handlePropertyTypeChange(e) {
    this.setState({
      propertyType: e.target.value,
    });
  }

  handlePriceRangeChange(e) {
    this.setState({
      priceRange: e.target.value,
    });
  }

  handleSubmit() {
    // const { address, priceRange, propertyType } = this.state;
    $('.about-text').addClass('dont-show');
    $('.rental-card-carousel').removeClass('dont-show');
    

    // $.ajax({
    //   url: '/rentals/browse',
    //   method: 'get',
    //   data: {
    //     address,
    //     priceRange,
    //     propertyType,
    //   }
    // }).done(function(response) {
    //   // Render a list of search-appropriate rentals as cards
    //   console.log(response)
    // });
  }

  render() {
    return (
      <div>
        <SearchBoxExampleGoogleMap
          containerElement={
            <div style={{ height: `50vh` }} />
          }
          mapElement={
            <div className="mappy" style={{ height: `50vh` }} />
          }
          center={this.state.center}
          content={this.state.content}
          radius={this.state.radius}
          onMapMounted={this.handleMapMounted}
          onBoundsChanged={this.handleBoundsChanged}
          onSearchBoxMounted={this.handleSearchBoxMounted}
          bounds={this.state.bounds}
          onPlacesChanged={this.handlePlacesChanged}
          markers={this.state.markers}
        />
          <div className="rentalQueries">
            <select id="propertyType" onChange={this.handlePropertyTypeChange}>
              <option value="apartment">Studio/Apartment</option>
              <option value="room">Room</option>
            </select>
            <select id="priceRange" onChange={this.handlePriceRangeChange}>
              <option value="lowest">less than $1,000</option>
              <option value="low">$1,000 - $2,000</option>
              <option value="medium">$3,000 - $4,000</option>
              <option value="high">more than $4,000</option>
            </select>
            <button onClick={this.handleSubmit}>
              Search
            </button>
          </div>
      </div>
    );
  }
}
