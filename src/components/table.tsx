import * as React from 'react'
import _ from 'underscore'
import Line from './line'
import { GL, initGl, calculateImageData } from '../gl'

const width = 50
const height = 50
const speed = 5000
const gl: GL = initGl(width, height)

const Table = () => {
    const [imageData, setImageData] = React.useState(new Uint8Array())   
    useAnimation(setImageData)
    return (<div>
        {_.range(0, height).map((_, y: number) => 
            <Line key={y.toString()} imageData={imageData} y={y} width={width} />
        )}
    </div>)
}

function useAnimation(setImageData: React.Dispatch<React.SetStateAction<Uint8Array>>) {
    React.useEffect(() => {
        let queuedFrame: number
        const frame = () => {
            setImageData(calculateImageData(speed, gl))
            queuedFrame = requestAnimationFrame(frame)
        }
        frame()
        return () => cancelAnimationFrame(queuedFrame)
    }, [setImageData])
}

export default Table
