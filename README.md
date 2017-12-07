# custom-errors-factory

Construct custom error type

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

throw new UserEntityNotFoundError({someProperty: 'some additional property'});

new UserEntityNotFoundError() instanceof Error // true
new UserEntityNotFoundError() instanceof EntityNotFoundError // true
new UserEntityNotFoundError() instanceof TestError // false
```
