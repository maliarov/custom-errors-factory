const { AssertionError } = require('assert');


describe('construct', () => {
    let customErrorsFactory;

    beforeAll(() => {
        delete process.env.CUSTOM_ERRORS_FACTORY__DEFINITION_FILE_PATH;
        process.env.CUSTOM_ERRORS_FACTORY__ENABLE_DEFINITION_FILE_LOAD = 'true';

        jest.mock('fs', () => ({
            existsSync: () => true,
            readFileSync: () => JSON.stringify({
                BadRequest: {
                    message: 'Bad Request',
                    code: 400
                },
                EntityNotFound: {
                    message: '[${entityType}] Entity Not Found'
                }
            })
        }));

        customErrorsFactory = require('../source/index.js');
    });

    it('should load predefined errors configuration', () => {
        expect(customErrorsFactory).toBeDefined();
        expect(customErrorsFactory).toHaveProperty('BadRequest'); 
        expect(customErrorsFactory).toHaveProperty('EntityNotFound'); 
    });

    describe('params validation', () => {
        it('should throw error if type name not defined', () => {
            expect(() => customErrorsFactory()).toThrow(AssertionError);
        });

        it('should throw error if type name pattern mismatch', () => {
            expect(() => customErrorsFactory('123asd')).toThrow(AssertionError);
            expect(() => customErrorsFactory('!123asd')).toThrow(AssertionError);
            expect(() => customErrorsFactory('+123asd')).toThrow(AssertionError);
            expect(() => customErrorsFactory(' 123asd')).toThrow(AssertionError);
            expect(() => customErrorsFactory('12 3asd')).toThrow(AssertionError);
            expect(() => customErrorsFactory('12.3asd')).toThrow(AssertionError);
        });

        it('should throw error if base error type not inherited from Error', () => {
            expect(() => customErrorsFactory('test', {}, Date)).toThrow(AssertionError);
        });
    });

    describe('define simple custom error type', () => {
        let CustomError;

        beforeAll(() => {
            CustomError = customErrorsFactory('CustomError');
        });

        it('should create custom error type', () => {
            expect(CustomError).toBeDefined();
        });

        describe('create instance of custom error type', () => {
            let error;
            let stack;

            beforeAll(() => {
                error = new CustomError();
                stack = (new Error().stack)
                    .replace('Error\n', 'CustomError\n')
                    .replace(/constructor.test.js:(\d)+\:(\d)+/, (match) => {
                        const parts = match.split(':');
                        parts[1] = (Number(parts[1]) - 1).toString();
                        return parts.join(':');
                    });
            });

            it('should create custom error', () => {
                expect(error).toBeDefined();
                expect(error).toHaveProperty('name', 'CustomError');
                expect(error).toHaveProperty('stack', stack);
                expect(error).toHaveProperty('innerError');
            });

            it('should inherit error', () => {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(CustomError);
            });
        });
    });

    describe('define custom error type with predefined properties', () => {
        let CustomError;

        beforeAll(() => {
            CustomError = customErrorsFactory('CustomError', {
                message: 'predefined message',
                propertyA: 'predefined propertyA',
                propertyB: 'predefined propertyB'
            });
        });

        describe('create instance of custom error', () => {
            let error;

            beforeAll(() => {
                error = new CustomError();
            });

            it('should create custom error with predefined properties', () => {
                expect(error).toBeDefined();
                expect(error).toHaveProperty('message', 'predefined message');
                expect(error).toHaveProperty('propertyA', 'predefined propertyA');
                expect(error).toHaveProperty('propertyB', 'predefined propertyB');
            });
        });
    });

    describe('define custom error type with predefined properties and overrided message', () => {
        let CustomError;

        beforeAll(() => {
            CustomError = customErrorsFactory('CustomError', {
                message: 'predefined message',
                propertyA: 'predefined propertyA',
                propertyB: 'predefined propertyB'
            });
        });

        describe('create instance of custom error', () => {
            let error;

            beforeAll(() => {
                error = new CustomError({ message: 'this is overrided message' });
            });

            it('should create custom error with predefined properties and overrided message', () => {
                expect(error).toBeDefined();
                expect(error).toHaveProperty('message', 'this is overrided message');
                expect(error).toHaveProperty('propertyA', 'predefined propertyA');
                expect(error).toHaveProperty('propertyB', 'predefined propertyB');
            });
        });
    });

    describe('define custom error type with template message', () => {
        let CustomError;

        beforeAll(() => {
            CustomError = customErrorsFactory('CustomError', {
                message: '${propertyA} and ${propertyB}'
            });
        });

        describe('create instance of custom error', () => {
            let error;

            beforeAll(() => {
                error = new CustomError({ propertyA: 'Value1', propertyB: 'Value2' });
            });

            it('should create custom error with resolved template in message', () => {
                expect(error).toBeDefined();
                expect(error).toHaveProperty('message', 'Value1 and Value2');
                expect(error).toHaveProperty('propertyA', 'Value1');
                expect(error).toHaveProperty('propertyB', 'Value2');
            });
        });

        describe('define custom error type with inner error', () => {
            let CustomError;

            beforeAll(() => {
                CustomError = customErrorsFactory('CustomError', {
                    message: 'Inner error container'
                });
            });

            describe('create instance of custom error', () => {
                const innerError = new Error('Inner error');

                let error;

                beforeAll(() => {
                    error = new CustomError().innerError(innerError);
                });

                it('should create custom error with inner error', () => {
                    expect(error).toBeDefined();
                    expect(error).toBeInstanceOf(CustomError);
                    expect(error).toHaveProperty('message', 'Inner error container');
                    expect(error).toHaveProperty('innerError', innerError);
                });
            });
        });
    });

    describe('define complex custom error type', () => {
        let Level1Error;
        let Level2Error;
        let AnotherError;
        let CustomError;

        beforeAll(() => {
            Level1Error = customErrorsFactory('Level1Error');
            Level2Error = customErrorsFactory('Level2Error', {}, Level1Error);
            AnotherError = customErrorsFactory('AnotherError');
            CustomError = customErrorsFactory('CustomError', {}, Level2Error);
        });

        describe('create instance of custom error type', () => {
            let error;

            beforeAll(() => {
                error = new CustomError();
            });

            it('should inherit errors stack', () => {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(Level1Error);
                expect(error).toBeInstanceOf(Level2Error);
                expect(error).not.toBeInstanceOf(AnotherError);
            });
        });
    });

    describe('define complex custom error type with template message', () => {
        let Level1Error;
        let Level2Error;
        let CustomError;

        beforeAll(() => {
            Level1Error = customErrorsFactory('Level1Error', { message: '${a} and ${b} and ${c}' });
            Level2Error = customErrorsFactory('Level2Error', { a: 'A' }, Level1Error);
            CustomError = customErrorsFactory('CustomError', { b: 'B' }, Level2Error);
        });

        describe('create instance of custom error type', () => {
            let error;

            beforeAll(() => {
                error = new CustomError();
            });

            it('should inherit errors stack', () => {
                expect(error).toHaveProperty('a', 'A');
                expect(error).toHaveProperty('b', 'B');
                expect(error).toHaveProperty('message', 'A and B and ${c}');
            });
        });
    });

    describe('define custom error types from data object', () => {
        let errors;

        beforeAll(() => {
            errors = customErrorsFactory.createFromConfig({
                BadRequest: {
                    message: 'Bad Request',
                    code: 400
                },
                EntityNotFound: {
                    message: '[${entityType}] Entity Not Found'
                }
            });
        });

        it('should create custom error types defined by config', () => {
            expect(errors).toBeDefined();
            expect(errors).toHaveProperty('BadRequest');
            expect(errors).toHaveProperty('EntityNotFound');
        });

        describe('create error', () => {
            describe('BadRequest', () => {
                let error;

                beforeAll(() => {
                    error = new errors.BadRequest();
                });

                it('should create BadRequest error', () => {
                    expect(error).toBeDefined();
                    expect(error).toHaveProperty('name', 'BadRequest');
                    expect(error).toHaveProperty('message', 'Bad Request');
                    expect(error).toHaveProperty('code', 400);
                });
            });

            describe('EntityNotFound', () => {
                let error;

                beforeAll(() => {
                    error = new errors.EntityNotFound({ entityType: 'File' });
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

    describe('define custom error types from json file', () => {
        let errors;

        beforeAll(() => {
            errors = customErrorsFactory.loadFromFile('.errors.json');
        });

        it('should create custom error types defined by config', () => {
            expect(errors).toBeDefined();
            expect(errors).toHaveProperty('BadRequest');
            expect(errors).toHaveProperty('EntityNotFound');
        });
    });
});