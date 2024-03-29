export interface DecryptCommandResponse {
    type: 'decrypt';
    error?: string;
    payload?: {
        cleartext: string;
    };
}

export interface DiffCommandResponse {
    type: 'diff';
    error?: string;
    payload?: {
        cleartext: string;
    };
}

export interface StoreMappingCommandResponse {
    type: 'storeMapping';
    error?: string;
    payload?: {
        success: boolean;
    };
}

export interface LoadMappingCommandResponse {
    type: 'loadMapping';
    error?: string;
    payload?: {
        mapping?: string;
    };
}

export type MessageResponse =
    | DecryptCommandResponse
    | DiffCommandResponse
    | LoadMappingCommandResponse
    | StoreMappingCommandResponse;

export interface DecryptCommand {
    type: 'decrypt';
    payload: {
        rawUrl: string;
    };
}

export interface DiffCommand {
    type: 'diff';
    payload: {
        fromRawUrl: string;
        toRawUrl: string;
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

export type Command = DecryptCommand | DiffCommand | StoreMappingCommand | LoadMappingCommand;
