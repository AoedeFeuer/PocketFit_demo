import React from "react";
export default function Header({ title, right=null, left=null }){
  return (<header><div className="hwrap">{left || <div style={{width:36}}/>}<div className="title">{title}</div>{right || <div style={{width:36}}/>}</div></header>);
}
