import React, {useContext} from 'react'
import {GameConfigContext} from "../../../Context/GameConfigContext";

export default function RoomActionChoice({choiceText, targetRoomActionCode, isBackToMenu, chanceActions}) {
    const {gameConfig, changeRoomAction, goToBossRoom, goToNewRoom, resetGameConfig} = useContext(GameConfigContext);

    const goToRoomAction = () => {
        if (isBackToMenu) {
            console.log('-- Back to menu');
            resetGameConfig();
        }
        else if (chanceActions !== null) {
            const attempt = Math.floor(Math.random() * Math.floor(10));
            if (attempt <= chanceActions.chance) {
                console.log('-- Chance action success');
                changeRoomAction(chanceActions.successRoomActionCode);
            } else {
                console.log('-- Chance action failure');
                changeRoomAction(chanceActions.failureRoomActionCode);
            }
        }
        else if (gameConfig.roomNumber >= gameConfig.maxRoomNumber && targetRoomActionCode === false) {
            console.log('-- Go to boss room');
            goToBossRoom();
        }
        else if (targetRoomActionCode) {
            console.log('-- Go to roomAction');
            changeRoomAction(targetRoomActionCode);
        }
        else {
            console.log('-- Go to new room');
            goToNewRoom();
        }
    };

    return (
        <div className="room_choice bckg-grey" onClick={goToRoomAction}>
            <div className="fl">
                <img src="/img/fleche.png" alt=""/>
            </div>
            <div className="room_choice_txt">
                {choiceText}
            </div>
        </div>
    )
}
