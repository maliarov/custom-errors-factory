describe('errors configuration initial load', () => {
    let customErrorsFactory;

    beforeAll(() => {
        delete process.env.CUSTOM_ERRORS_FACTORY__DEFINITION_FILE_PATH;
        delete process.env.CUSTOM_ERRORS_FACTORY__ENABLE_DEFINITION_FILE_LOAD;

        customErrorsFactory = require('../source/index.js');
    });

    it('should not load default errors configuration', () => {
        expect(customErrorsFactory).toBeDefined();
        expect(customErrorsFactory).not.toHaveProperty('BadRequest'); 
        expect(customErrorsFactory).not.toHaveProperty('EntityNotFound'); 
    });
});