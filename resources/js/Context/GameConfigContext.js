import React, {useState, createContext, useEffect} from 'react';
import {ConstantCollection} from "../constants";
import {fetchFromApi, fetchFromApiPromise} from "../Services/ApiFetcher";
import {flashBodyGreenColor, flashObjectGreenColor, flashBodyRedColor, shrinkWrapper, openWrapper} from "../Services/StyleActions";

export const GameConfigContext = createContext(null);

export const GameConfigProvider = ({children}) => {
    const defaultGameConfig = {
        player: {
            life: 3,
            isDead: false,
            objects: []
        },
        maxRoomNumber: 10,
        roomNumber: 1,
        currentRoomAction: {
            code: "",
            name: "",
            text: "",
            choices: []
        },
        alreadyPassedRoomsCodes: [],
    };

    const [gameConfig, setGameConfig] = useState({
        ...defaultGameConfig
    });

    useEffect(() => {
        fetchFromApi(ConstantCollection.API_BASE_URL + '/room/get-start', changeRoomFromResponse);

        // TODO fetch local stored config ? | sinon prend la première
    }, []);

    useEffect(() => {
        if (gameConfig.currentRoomAction.hasOwnProperty('looseLife')) {
            changeLife(gameConfig.currentRoomAction.looseLife)
        }

        if (gameConfig.currentRoomAction.hasOwnProperty('addItem')) {
            addItem(gameConfig.currentRoomAction.addItem)
        }
    }, [gameConfig.currentRoomAction]);

    function resetGameConfig() {
        fetchFromApi(ConstantCollection.API_BASE_URL + '/room/get-start', (response) => {
            const newConfig = {...defaultGameConfig};
            newConfig.currentRoomAction = response[0];

            setGameConfig(newConfig);
        });
    }

    function roomPassed() {
        const newConfig = {...gameConfig};

        newConfig.roomNumber++;
        if (newConfig.roomNumber === newConfig.maxRoomNumber) {
            console.log('should go to boss');
        }

        setGameConfig(newConfig);
    }

    const changeRoomFromResponse = (response) => {
        const newConfig = {...gameConfig};

        console.log(response[0]);
        newConfig.currentRoomAction = response[0];

        openWrapper();
        setGameConfig(newConfig);
    };

    function changeRoomAction(roomActionCode) {
        shrinkWrapper();
        if (!gameConfig.player.isDead) {
            fetchFromApi(ConstantCollection.API_BASE_URL + '/room-action/' + roomActionCode, changeRoomFromResponse)
        }
    }

    function goToBossRoom() {
        shrinkWrapper();
        fetchFromApi(ConstantCollection.API_BASE_URL + '/room/get-end', changeRoomFromResponse);
    }

    function goToNewRoom() {
        // TODO si dans blacklist, charge une autre salle
        // let room = null;
        //
        // while(room === null || gameConfig.alreadyPassedRoomsCodes.includes(room.code)) {
        //     fetchFromApi(ConstantCollection.API_BASE_URL + '/room/get-random', fetchRandomRoom);
        // }

        shrinkWrapper();
        if (!gameConfig.player.isDead) {
            fetchNewRoomFromApi().then((newConfig) => {
                openWrapper();
                setGameConfig(newConfig);
            });
        }
    }

    async function fetchNewRoomFromApi() {
        const url = ConstantCollection.API_BASE_URL + '/room/get-random';
        let roomCode = null;
        let valid = false;
        const newConfig = {...gameConfig};
        newConfig.roomNumber = newConfig.roomNumber + 1;

        while (!valid) {
            await fetchFromApiPromise(url).then((response) => {
                console.log(response[0]);

                return response[0];
            }).then((roomResponse) => {
                roomCode = roomResponse.code;
                if (!gameConfig.alreadyPassedRoomsCodes.includes(roomCode)) {
                    valid = true;
                    newConfig.currentRoomAction = roomResponse;
                    newConfig.alreadyPassedRoomsCodes.push(roomResponse.code);
                } else {
                    console.log('ALREADY PASSED ROOM');
                }
            });
        }

        return newConfig;
    }

    function changeLife(lifepoint) {
        const newConfig = {...gameConfig};

        console.log('changeLife');
        console.log(lifepoint);

        newConfig.player.life = newConfig.player.life - lifepoint;

        lifepoint > 0 ? flashBodyRedColor() : flashBodyGreenColor();

        if (newConfig.player.life <= 0) {
            newConfig.player.isDead = true;
        }

        setGameConfig(newConfig);
    }

    function addItem(item) {
        const newConfig = {...gameConfig};
        newConfig.player.objects.push(item);

        flashObjectGreenColor();

        setGameConfig(newConfig);
    }

    return(
        <GameConfigContext.Provider value={{
            gameConfig,
            setGameConfig,
            roomPassed,
            goToNewRoom,
            goToBossRoom,
            changeRoomAction,
            resetGameConfig,
            changeLife
        }}>
            {children}
        </GameConfigContext.Provider>
    );
};
