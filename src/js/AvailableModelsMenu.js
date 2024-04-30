// AvailableModelsMenu.js
import React, { useState, useEffect } from "react";
import 'aframe';
import ApiTools from './Api';
import '../css/gui-tool-styles.css';

const AvailableModelsMenu = () => {
    const [buttons, setButtons] = useState('');
    const [dataLoaded, setDataLoaded] = useState('');

    useEffect(() => {
        // Call GetScene and handle the response using async/await
        async function fetchData() {
            try {
                const response = await ApiTools.GetFiles();
                if (response.status === 200) {
                    const data = response.data;
                    if (data === "") {
                        console.log("No models found");
                    } else {
                        // Map over data and create buttons directly
                        const buttons = data.map((item) => (
                            <button id={`model${item.file_id}`} key={`SpawnFile${item.file_id}`} onClick={() => SpawnModel(item)}>
                                Spawn {item.file_name}
                            </button>
                        ));
                        // Set the state contents with the mapped models
                        setButtons(buttons);
                        setDataLoaded(true); // Set dataLoaded to true after contents have been updated
                    }
                } else {
                    console.log("response.status = " + response.status);
                }
            } catch (error) {
                console.error("Error fetching models:", error);
            }
        }

        fetchData();
    }, []); // Empty dependency array to run only once on mount

    // Spawn model function
    function SpawnModel(modelData) {
        const sceneEl = document.querySelector('a-scene');
        if (sceneEl) {
            const player = sceneEl.camera.el;
            const position = player.getAttribute('position');

            const entity = document.createElement('a-entity');
            entity.setAttribute('gltf-model', `url(${modelData.file_url})`);
            entity.setAttribute('position', position);
            entity.setAttribute('scale', "0.01 0.01 0.01");
            entity.setAttribute('rotation', "0 0 0");

            sceneEl.appendChild(entity);
        }
    }

    const enterVR = () => {
        const sceneEl = document.querySelector('a-scene');
        if (sceneEl && sceneEl.enterVR) {
          sceneEl.enterVR();
        }
    };    

    // Return RenderEntities only after contents have been updated
    return (
        dataLoaded && 
        <>
        <div grabbable="true" className="spawner__menu">{buttons}</div>
        <button style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, padding: '10px', fontSize: '16px' }} onClick={enterVR}>
        Enter VR
        </button>
        </>
    );
}

export default AvailableModelsMenu;