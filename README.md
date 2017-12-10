# custom-errors-factory

Construct custom error type

## Examples
```javascript
const customErrorsFactory = requre('custom-errors-factory');

const EntityNotFoundError = customErrorsFactory('EntityNotFound', {
  message: '[${entityType}] entity not found', 
  entityType: 'Unknown'
});

const UserEntityNotFoundError = customErrorsFactory('UserEntityNotFound', {
  entityType: 'User'
}, EntityNotFoundError);

const TestError = customErrorsFactory('Test');

const EntityNotFoundError = customErrorsFactory('EntityNotFound', {
    message: '[${entityType}] entity not found', 
    entityType: 'Unknown'
});

const UserEntityNotFoundError = customErrorsFactory('UserEntityNotFound', {
    entityType: 'User'
}, EntityNotFoundError);

const AnotherCustomError = customErrorsFactory('CustomError');

const CustomWithInnerError = customErrorsFactory('CustomWithInnerError')
    .innerError(new Error('custom error'));


const customError = new UserEntityNotFoundError({someProperty: 'some additional property'});


console.log(customError instanceof Error); // true
console.log(customError instanceof EntityNotFoundError); // true
console.log(customError instanceof AnotherCustomError); // false
```

## Configuration

You can create custom errors map manually

```javascript
const customErrorsFactory = requre('custom-errors-factory');

// from config object (note: you can use it for async load from remote server, for instance)
const context = customErrorsFactory.createFromConfig({
    BadRequest: {
        message: 'Bad Request',
        code: 400
    },
    EntityNotFound: {
        message: '[${entityType}] Entity Not Found'
    }
});
``` 

Load custom errors configuration and use it like:

```json
// config/errors.json
{
    "NotFound": {
        "message": "Not Found",
        "code": 404
    },
    "EntityNotFound": {
        "message": "[${entityType}] Entity Not Found"
    }
}
```

```javascript
// source/errors.js
const customErrorsFactory = requre('custom-errors-factory');

// from config json file
module.exports = customErrorsFactory.loadFromFile('config/errors.json');
``` 

```javascript
// source/app.js
const errors = requre('./errors');

const customError = new errors.EntityNotFound({entityType: 'File', path: '/some-path-to-file'});
``` 

And you can also enable automatically configuration file load by setting *proces.env.CUSTOM_ERRORS_FACTORY__ENABLE_DEFINITION_FILE_LOAD* with 'true' value
And if there is *.errors.json* file in root folder of your project then it will be loaded during app start (use *process.env.CUSTOM_ERRORS_FACTORY__DEFINITION_FILE_PATH* to change default related path to configuration file, f.ex: config/errors.json)

### .errors.json
```json
{
    "NotFound": {
        "message": "Not Found",
        "code": 404
    },
    "EntityNotFound": {
        "message": "[${entityType}] Entity Not Found"
    }
}
``` 

Then you can use it like

```javascript
const customErrorsFactory = requre('custom-errors-factory');

const customError = new customErrorsFactory.EntityNotFound({entityType: 'File', path: '/some-path-to-file'});
```