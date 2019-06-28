#!/usr/bin/env python
# coding: utf-8

# In[1]:


from pymongo.collection import ReturnDocument
import pymongo as pm
import json
import pandas as pd


# ## Stimuli Upload
# `ratchet_id` refers to a set of rules to be queried for trials. Each collection of `ratchet_id` has a `_dev` version, except for `dev` collection itself.
# 
# Current Values:
# 1. `dev`: 2 single features rules, 2 conjunctive rules, 2 disjunctive rules, 2 conjunctive disjunction rules, & 2 disjunctive conjunction rules
# 2. `50_rules`: 10 single feature rules, 10 conjunctive rules, 10 disjunctive rules, 10 conjunctive disjunction rules, & 10 disjunctive conjunction rules

# In[3]:


# XXX: Specify your mongodb username (foo, bar, localhost)
def gen_vars(local_machine=True):
    if local_machine:
        pswd = "bar"
        user = "foo"
        host = "localhost"
    else:
        auth = pd.read_csv('auth.csv', header = None)
        pswd = auth.values[0][0].strip()
        user = 'sketchloop'
        host = 'localhost' 
    return user, pswd, host


# In[4]:


def get_creature_names(rule_type):
    d = {
        "SINGLE_FEATURE": ["morseth", "morseths"],
        "CONJUNCTION": ["oller", "ollers"],
        "DISJUNCTION": ["kwep", "kweps"],
        "CONJUNCTION_DISJUNCTION": ["zorb", "zorbs"],
        "DISJUNCTION_CONJUNCTION":["luzak", "luzaks"],        
    }
    return d[rule_type]


# In[5]:


def convert_concept_summary_into_db_data(data):
    db_data = {
        "SINGLE_FEATURE": [],
        "CONJUNCTION": [],
        "DISJUNCTION": [],
        "CONJUNCTION_DISJUNCTION": [],
        "DISJUNCTION_CONJUNCTION": [],
    }
    for rule_idx, rule in data.items():
        rule_type = rule["type"]
        speciesName = get_creature_names(rule_type)[0]
        speciesNamePlural = get_creature_names(rule_type)[1]
        db_data[rule_type].append({
            "rule_idx": int(rule_idx),
            "file_name": rule["name"],
            "name": rule["phrase"],
            "games": [],
            "numGames": 0,
            "speciesName": speciesName,
            "speciesNamePlural": speciesNamePlural,
        })
    return db_data


# In[6]:


def load_data_into_db(concept_summary_file, col_prefix):
    with open(concept_summary_file) as f:
        data = json.load(f)
        db_data = convert_concept_summary_into_db_data(data)
        for rule_type, rules in db_data.items():
            col = col_prefix.format(rule_type)
            for rule in rules:
                db[col].insert_one(rule)


# In[7]:


# Set Variables 
# XXX Log into mongo. If running this locally, set local_machine=True,
# otherwise keep it False.
# user, pswd, host = gen_vars(local_machine=False)
user, pswd, host = gen_vars(local_machine=True)

if user == '' or pswd == '':
    con_info = 'mongodb://{}'.format(host)   
else:
    con_info = 'mongodb://{}:{}@{}:27017'.format(user, pswd, host)

conn = pm.MongoClient(con_info)
db = conn['genGames']


# In[8]:


# Print Existing DB
print(sorted(db.list_collection_names()))


# In[9]:


# # Drop Existing Collections
# x = sorted(db.list_collection_names())
# exclude = ['mpGame3', 'mpGame4', 'system.indexes']
# for i in x:
#     if i not in exclude:
#         db[i].drop()


# In[10]:


# Print Existing DB
print(sorted(db.list_collection_names()))


# In[11]:


# # Load 50 Rules Data (Pilot)
# fifty_rules_col_prefix = 'pilot_fifty_rules_{}'
# fifty_rules_concept_summary_file = './fifty_rules/concept_summary.json'
# load_data_into_db(fifty_rules_concept_summary_file, fifty_rules_col_prefix)


# In[12]:


# # Load 50 Rules Data
# XXX Initialize fifty rules concepts into mongo database.
fifty_rules_col_prefix = 'fifty_rules_{}'
fifty_rules_concept_summary_file = './fifty_rules/concept_summary.json'
load_data_into_db(fifty_rules_concept_summary_file, fifty_rules_col_prefix)


# In[13]:


# sorted(db.list_collection_names())


# In[14]:


def update_num_games(db, distr):
    # Resetting numGames count for certain rules
    # so that get triggered (as we don't have complete data on these)
    # just yet.
    for (rule_type, rule_idx, num_games) in distr:
        record = db[rule_type].find_one({'rule_idx': rule_idx})
        print(record['name'], record['numGames'])
        updated_record = db[rule_type].find_one_and_update(
            {'_id': record['_id']},
            {'$set':
                 {'numGames': num_games}
            },
            return_document=ReturnDocument.AFTER
        )
        print(record['name'], record['numGames'], updated_record['numGames'])


# In[15]:


S = 'fifty_rules_SINGLE_FEATURE'
C = 'fifty_rules_CONJUNCTION'
D = 'fifty_rules_DISJUNCTION'
CD = 'fifty_rules_CONJUNCTION_DISJUNCTION'
DC = 'fifty_rules_DISJUNCTION_CONJUNCTION'

distr = [
#     (S, 0, 9),
#     (C, 10, 9),
#     (D, 20, 9),
#     (CD, 30, 9),
#     (DC, 40, 9),
    
#     (S, 4, 9),
#     (C, 14, 9),
#     (D, 24, 9),
#     (CD, 34, 9),
#     (DC, 44, 9),
    
#     (S, 8, 9),
#     (C, 18, 9),
#     (D, 28, 9),
#     (CD, 38, 9),
#     (DC, 48, 9),
    
#     (S, 9, 9),
    (C, 19, 9),
    (D, 29, 9),
    (CD, 39, 9),
    (DC, 49, 9)
]
# XXX: Not sure what this was...seems like Sahil was fixing stuff
# mid-experiment? Will ask, but we don't really need to worry about this kind
# of logic anyways since we're switching to causality
#  update_num_games(db, distr)


# In[ ]:




