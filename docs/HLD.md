# High Level Design

Components:
- DataStore core (Map backed)
- TransactionProxy
- Logger interface
- Public API: create/get/update/delete/query/list/transaction

Data flow:
Client -> DataStore API -> internal Map
