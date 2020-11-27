export class MockAPNS {
    constructor() {
    }

    send(notification: any): Promise<any> {
        return Promise.resolve();
    }
}