const {expect} = require('@playwright/test');

function assertEventFields(data, expectedSchema) {
    expect(data.event_name).toBe(expectedSchema.event_name);

    for (const key in Object.keys(expectedSchema)) {

        expect(data).toHaveProperty(key);

        if(expectedSchema[key] !== undefined && key !== 'event_name') {
            if (typeof expectedSchema[key] === 'function') {
                expect(expectedSchema[key](data[key])).toBe(true);
            }else{
                expect(data[key]).toBe(expectedSchema[key]);
            }
        }
    }
}

module.exports = {
    assertEventFields
}   