import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

import telegraphBold from "../assets/fonts/Telegraf_Bold.otf" 

interface letterDataStructure {
    letter: string
    position: { x: number, y: number, z: number }
    rotation: number
}

function Scene() {
    // const letterPNGs: Record<string, string> = import.meta.glob( "../assets/community/*.png", { query: '?raw', eager: true } )
    const characters = useRef<string[]>( "abcdefghijklmnopqrstuvwxyzabcdefg".split( "" ) )
    const [ letters, setLetters ] = useState<letterDataStructure[]>(
        new Array( 33 ).fill( null ).map( ( _, index ) => {
            // const x = 5 * Math.cos( 2 * Math.PI * index / 33 )
            // const z = 5 * Math.sin( 2 * Math.PI * index / 33 )

            // console.log( letterPNGs )

            return {
                letter: characters.current[ index ],
                position: { x: 0, y: 0, z: 0 },
                rotation: 0
            }
        } )
    ) 

    useFrame( ( { clock } ) => {
        const time = clock.getElapsedTime() * 0.25

        setLetters( current => {
            const newLetters = [ ...current ]

            for ( let i = 0; i < newLetters.length; i++ ) {
                newLetters[ i ].position.x = 6 * Math.cos( 2 * Math.PI * i / 33 - time )
                newLetters[ i ].position.y = 1.5 * Math.sin( 3.1 + 4 * Math.PI * i / 33 - time * 2 )
                newLetters[ i ].position.z = 6 * Math.sin( 2 * Math.PI * i / 33 - time )
            }

            return newLetters
        } )
    } )

    return ( <>
        {/* <gridHelper args={ [ 20, 20 ] }/> */}
        {/* <OrbitControls/> */}
        { letters.map( ( letter, index ) => (
            <mesh
                key={ index }
                position={ [ letter.position.x, letter.position.y, letter.position.z ] }
            >
                {/* <boxGeometry
                    args={ [ 1, 1, 1 ] }
                /> */}
                <Text
                    font={ telegraphBold }
                >
                    { letter.letter }
                </Text>
                <meshBasicMaterial
                    color={ "blue" }
                />
            </mesh>
        ) ) }
    </> )
}

export default function DesignIsCommunity() {
    return (
        <>
            {/* <h1>Design Is Community</h1> */}
            <Canvas id="canvas" camera={ { position: [ 0, 0, 10 ] } }>
                <Scene/>
            </Canvas>
        </>
    )
}