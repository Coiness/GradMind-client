import React,{memo} from "react";
import type{FC,ReactNode} from "react";

interface IProps{
    children?:ReactNode
}

const VisualizationPage:FC<IProps> = () =>{
    return <div>VisualizationPage</div>
}

export default memo(VisualizationPage);