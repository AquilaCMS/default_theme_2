import React from 'react';

const Marker = (props) => {
    const { img, text } = props;
    return (
        <img src={img} alt="marker" className="marker"
            style={{ 
                cursor   : 'pointer', 
                transform: 'translate(-50%, -50%)',
            }}
            title={text}
        />
    );
};

export default Marker;