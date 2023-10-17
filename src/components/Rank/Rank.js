import React from "react";

const Rank = ({name, entries}) => {
    return (
        <div>
            <div className="white f3">
                {`${name}, your current entries are...`}
            </div>
            <div className="white f3">
                {entries/3}
            </div>
        </div>
    )
}

export default Rank;