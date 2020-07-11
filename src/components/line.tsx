import * as React from 'react'
import _ from 'underscore'
import Cell from './cell'

interface LineProps { key: String, imageData: Uint8Array, y: number; width: number }
type Render<T> = (props: T) => JSX.Element

const Line: Render<LineProps> = props =>
    <div id={"LINE:" + props.y}>
        {_.range(0, props.width).map((_, x: number) =>
            <Cell key={x + ":" + props.y} imageData={props.imageData} x={x} y={props.y} w={props.width} />
        )}
    </div>

export default Line
