import GoogleMapReact from 'google-map-react';
import Marker         from './Marker';

export default function SimpleMap({ latitude, longitude, urlkeys, marker, title}) {
             
    return (
        // Important! Always set the container height explicitly
        <div style={{ height: '50vh', width: '100%' }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: urlkeys }}
                defaultCenter={{
                    lat: Number(latitude),
                    lng: Number(longitude)
                }}
                defaultZoom={15}
            >
                <Marker
                    lat={Number(latitude)}
                    lng={Number(longitude)}
                    text={title}
                    img={marker}
                />
            </GoogleMapReact>
        </div>
    );
}    
