describe('errors configuration initial load', () => {
    let customErrorsFactory;

    beforeAll(() => {
        process.env.CUSTOM_ERRORS_FACTORY__DEFINITION_FILE_PATH = 'test/config/errors.json';
        process.env.CUSTOM_ERRORS_FACTORY__ENABLE_DEFINITION_FILE_LOAD = 'true';

        customErrorsFactory = require('../source/index.js');
    });

    it('should not load default errors configuration', () => {
        expect(customErrorsFactory).toBeDefined();
        expect(customErrorsFactory).toHaveProperty('NotFound'); 
        expect(customErrorsFactory).toHaveProperty('EntityNotFound'); 
    });

    describe('create error', () => {
        describe('NotFound', () => {
            let error;

            beforeAll(() => {
                error = new customErrorsFactory.NotFound();
            });

            it('should create NotFound error', () => {
                expect(error).toBeDefined();
                expect(error).toHaveProperty('name', 'NotFound');
                expect(error).toHaveProperty('message', 'Not Found');
                expect(error).toHaveProperty('code', 404);
            });
        });

        describe('EntityNotFound', () => {
            let error;

            beforeAll(() => {
                error = new customErrorsFactory.EntityNotFound({ entityType: 'File' });
            });

            it('should create EntityNotFound error', () => {
                expect(error).toBeDefined();
                expect(error).toHaveProperty('name', 'EntityNotFound');
                expect(error).toHaveProperty('message', '[File] Entity Not Found');
                expect(error).toHaveProperty('entityType', 'File');
            });
        });
    });
});