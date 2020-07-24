export interface Content {
    mapJson: string,
    situations: { [key: string]: Situation }
}

export interface Situation {
    url: string;
    title: string;
    // todo: inner game config!?
}