import React from 'react';

const Marker = (props) => {
    const { img, text } = props;
    return (
        <div className="marker"
            style={{ backgroundImage: `URL(${img})`,backgroundRepeat: 'no-repeat', cursor: 'pointer' }}
            title={text}
        />
    );
};

export default Marker;