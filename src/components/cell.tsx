import * as React from 'react';
import { rgbToHex } from '../gl'

interface CellProps { key: String, imageData: Uint8Array, x: number; y: number; w: number }

function Cell(props: CellProps) {
    const dataIndex = (props.y * props.w * 4) + (props.x * 4)
    const r = props.imageData[dataIndex]
    const g = props.imageData[dataIndex + 1]
    const b = props.imageData[dataIndex + 2]
    //const a = props.imageData[dataIndex + 3]
    const cssColor = rgbToHex(r, g, b)
    const text = cssColor !== "#000000" ? Math.random().toString(36).substring(7, 9) : "__"
    return (<span style={{ background: cssColor }} className={"CELL:" + props.x + ":" + props.y}>{text}</span>)
}

export default Cell
