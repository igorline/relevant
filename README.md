# Relevant

This is the monorepo for the [Relevant app](https://relevant.community).
The repo includes server code, website and react-native apps.

### Running the Web Version:

install npm dependencies
```
npm install
```

rename `.envExample` file to `.env`

install [MongoDB](https://docs.mongodb.com/manual/administration/install-community/) to run a local version of the database

start the mongod instance
```
npm run startDB
```

uncomment `#SEED_DB` in .env in order to populate the database with some initial data on startup. (Don't forget to comment out the line, otherwise the database will be cleared each time)

run dev version (offers hot reloading):
```
npm run dev
```
navigate to `localhost:3000`

some user accounts you can use on the local db:
username / password
alice / test
bob / test
carol / test

(alice has global admin priveleges)

to stop the mongod instance, run
```
npm run stopDB
```

#### Production Build

build the production js bundle:
```
npm run build
```

test the build in production-like environment (client uses built bundle, offers faster server reloads, but client code won't reload)
```
npm run native
```

#### Tests

run tests (runs both client and server tests)
```
npm run test
```

run tests in watch mode (runs both client and server tests)
```
npm run test:watch
```

### Running Native Code:

install Relevant's packages
```
npm install
```
rename `app/.publicenvSample.js` file to `app/.publicenv`

install Pod files of ios
```
cd ios
pod install
```

start the app
```
npx react-native start
```

### Talking to contracts from react

This repo uses [Statesauce](https://github.com/statesauce/redux-saga-web3) for web3 managagement, contract interactions, caching, and side-effects. Initialized in `app/core/contracts.js` and consumed by files in `app/modules/contract/` which contain the reusable hocs, hooks, helpers, and propTypes for talking to Relevant Token contracts in a reliable way while staying synced to a strictly-defined reactive data store.

`app/modules/contract/contract` exports hooks and selectros that expose a RelevantToken-specific implementation of Statesauce's read/write semantics.

The mapDispatch function `cacheMethod` is used for pure contract methods that don't mutate contract state in anyway. It takes arguments `method` and `args`, and dispatches an action to announce a requested contract call, updating the store, and triggering the saga that makes the contract call that ultimately updates the store with the result.

The mapState function `methodCache` runs selector functions that derive state from the store for the method specified. It will force an update to the react component whenever any of the arguments or store keys change. It's the compliment to `cacheMethod` that tells you what's going on - it does reading, whereas `cacheMethod` does writing.
