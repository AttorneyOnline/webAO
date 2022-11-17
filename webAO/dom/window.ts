declare global {
    interface Window {
        toggleShout: (shout: number) => void;
        toggleMenu: (menu: number) => void;
        updateBackgroundPreview: () => void;
        redHPP: () => void;
        addHPP: () => void;
        redHPD: () => void;
        addHPD: () => void;
        guilty: () => void;
        notguilty: () => void;
        initCE: () => void;
        initWT: () => void;
        callMod: () => void;
        randomCharacterOOC: () => void;
        changeRoleOOC: () => void;
        changeBackgroundOOC: () => void;
        updateActionCommands: (side: string) => void;
        updateEvidenceIcon: () => void;
        updateIniswap: () => void;
        resizeChatbox: () => void;
        setChatbox: (style: string) => void;
        getIndexFromSelect: (select_box: string, value: string) => Number;
        cancelEvidence: () => void;
        deleteEvidence: () => void;
        editEvidence: () => void;
        addEvidence: () => void;
        pickEvidence: (evidence: any) => void;
        pickEmotion: (emo: any) => void;
        pickChar: (ccharacter: any) => void;
        chartable_filter: (_event: any) => void;
        ReconnectButton: (_event: any) => void;
        opusCheck: (channel: HTMLAudioElement) => OnErrorEventHandlerNonNull;
        imgError: (image: any) => void;
        charError: (image: any) => void;
        changeCharacter: (_event: any) => void;
        switchChatOffset: () => void;
        switchAspectRatio: () => void;
        switchPanTilt: (addcheck: number) => void;
        iniedit: () => void;
        modcall_test: () => void;
        reloadTheme: () => void;
        changeCallwords: () => void;
        changeBlipVolume: () => void;
        changeMusicVolume: () => void;
        area_click: (el: any) => void;
        showname_click: (_event: any) => void;
        mutelist_click: (_event: any) => void;
        musiclist_click: (_event: any) => void;
        musiclist_filter: (_event: any) => void;
        resetOffset: (_event: any) => void;
        onEnter: (event: any) => void;
        onReplayGo: (_event: any) => void;
        onOOCEnter: (_event: any) => void;
        handleCredentialResponse: (_event: any) => void;
    }
}
export { }