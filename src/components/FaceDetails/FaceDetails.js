import React from "react";

const FaceDetails = ({colors, imageType}) => {
    return (
        <div className="">
            <p>{imageType}</p>
            <p>{colors}</p>
        </div>
    )
}

export default FaceDetails;