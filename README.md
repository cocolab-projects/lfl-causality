# lfl-causality

Learning from language (cultural ratchet) for causality

Read on for instructions on how to set up this experiment.

## Setting up your environment

1. Install [node](https://nodejs.org/en/) (the javascript runtime that hosts the web server) and [mongodb](https://docs.mongodb.com/manual/administration/install-community/) (the database that will help us store results).
2. Initialize a folder, `path/to/data/db/`, which will be used to store your Mongo database. I used my home dir (`~/data/db`)
3. Run a mongodb server: `mongod --dbpath path/to/data/db` in some terminal window. (Or use `&` to run it in the background)
4. In a separate terminal window, connect to the mongo instance: `mongo` Then
   run the commands below to create a new user for the db

```
> use admin
> db.createUser({'user': 'foo', 'pwd': 'bar', 'roles': [{'role': 'readWrite', 'db': 'admin'}]})
```

## Initializing the experiment

### Start the database client (TODO: is this step needed?)

1. Navigate to `experiments/mp-game-6/` directory
2. Run `node store.js` in a terminal window.

### Initialize the database

Here we are initializing the database that keeps track of which concepts have
been shown to which people so we can keep a relatively equal spread of concepts

1. Navigate to `experiments/mp-game-6/stimuli`
2. Run `python upload_stimuli.py` (should work).

### Start the experiment server

1. Navigate to `experiments/`
2. Run `node app.js --expname mp-game-6`.

## Running an experiment and analyzing results

### Run an experiment

Visit `http://localhost:8888/` on two separate windows of a browser. Here you can play both ends of the experiment to see how it works. Try playing both ends of the experiment. It's a little tedious, but will be needed to see how results are saved.

### Saving results

When both players complete an experiment their results will be logged to (1) mongo, in the database `cultural_ratchet` and collection `mp-game-6`, (2) to csv files in the directory `data/mp-game-6/{chatMessage,logScores,logSubjInfo,logTest,logTimes}`. They have some files already and it may be worth cleaning these folders out. But regardless, your files will be timestamped much later than the existing ones. I would just use the CSV files and ignore mongo.

Description of the CSV folders are as follows:

- chatMessage contains the messages sent for each round
- logScores are the teacher/student accuracies
- logSubjInfo contains subject demographics
- logTest has individual predictions for each stimuli on the test set
- logTimes contains amount of time spent on each phase of the experiment

Seems like you can use the `clean.py` script to generate the data files that Sahil has from these raw folders.
