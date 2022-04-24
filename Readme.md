# File Service

## build docker (Server listening on port 3000)
* ```sudo docker build -t file-service .```

## normal run
* ```npm run start```

## dev
* ```npm run dev```

## used by docker
* ```npm run docker```

___

Not using other services so only build a docker image.

Use reader-writer lock to prevent concurrent request conflict.

___

## api path
* authorization
  * api
  ```
  POST /api/auth/login
  ```
  * body
  ```
  // For convenience just use fixed one
  {
    "username": "user01",
    "password": "abc24d5bf7a345f48d1d31e9b8066a2a9029785183a4e9284b362e06b83e5a5e"
  }
  ```
  * return
  ```
  {
    "user": {
        "username": "user01"
    },
    "token": string // jwtToken
  }
  ```

* file CRUD operations
``` 
/api/file/{localSystemFilePath}?orderBy={orderBy}&orderByDirection={orderByDirection}&filterByName={filterByName}
```