export const sleep = (time: number): Promise<void> => new Promise<void>(
    (resolve: Function): void => { setTimeout(() => resolve(), time); },
);
