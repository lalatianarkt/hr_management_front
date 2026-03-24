import React from "react";

// function Greet(){
//     return <h1>Hello Lalala</h1>
// }

const Greet = (props) => {
    // console.log('ato re anh');
    // console.log(props)
    return <h1>Hello {props.name}</h1>
}

export default Greet;
