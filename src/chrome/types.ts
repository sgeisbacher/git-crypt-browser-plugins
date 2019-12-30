export interface MessageResponse {
    cleartext?: string;
    error?: string;
}

export interface DecryptCommand {
    type: 'decrypt';
    payload: {
        rawUrl: string;
    };
}

export interface StoreMappingCommand {
    type: 'storeMapping';
    payload: {
        mapping: string;
    };
}

export interface LoadMappingCommand {
    type: 'loadMapping';
    payload: {};
}

export type Command = DecryptCommand | StoreMappingCommand | LoadMappingCommand;
