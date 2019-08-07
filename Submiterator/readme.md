# Supersubmiterator

A tool for managing external HITS on Amazon Mechanical Turk. This tool makes it easy to post external HITS and to download the data after participants completed the experiment. Supersubmiterator also supports automatic batching, i.e., splitting one HIT with a large number of assignments into several hits with fewer assignments per HIT. 

The behavior is similar to the [original Submiterator tool](https://github.com/erindb/Submiterator) by Dan Lassiter and Erin Bennett. However, this is a pure Python implementation which does not require the Mechanical Turk CLI tools (which are no longer supported).

## Setup

_(**Note**: supersubmiterator is written in Python 3. If your default Python command is python2, make sure to run `pip3` instead of `pip` and change the first line of `supersubmiterator.py` to `#!/usr/bin/env python3`.)_


1. If you do not already have an MTurk requester account, follow [these instructions](https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMechanicalTurkGettingStartedGuide/SetUp.html) to sign up as a requester and create an access key/secret pair on Amazon Mechanical Turk.


2. Install the `boto3` and the `xmltodict` packages:

```
pip install boto3
pip install xmltodict
```

3. In your Bash profile (e.g., `~/.bash_profile` on most Macs), add the following two 
environment variables with your MTurk access key and MTurk secret:

```
export MTURK_ACCESS_KEY=<YOUR MTURK ACCESS KEY>
export MTURK_SECRET=<YOUR MTURK SECRET>
```

Then once you open up a new terminal, you should be able to use the tool.


## How to use supersubmiterator mturk tools

To post the HIT, first setup the config file.

Give this config file a unique label as its name: `[LABEL].config`.

    {
    "liveHIT":"no",
    "title":"a title to show to turkers",
    "description":"a description to show to turkers",
    "experimentURL":"https://www.stanford.edu/~you/path/to/experiment.html",
    "keywords":"language research stanford fun cognitive science university explanations",
    "USonly?":"yes",
    "minPercentPreviousHITsApproved":"95",
    "frameheight":"650",
    "reward":"0.00",
    "numberofassignments":"10",
    "assignmentsperhit": "9",
    "assignmentduration":"1800",
    "hitlifetime":"2592000",
    "autoapprovaldelay":"60000",
    "doesNotHaveQualification": "<ID_TO_MTURK_QUALIFICATION> or none"
    }

The tool supports the following options:


| Option | Value | Description | 
| --- | --- | --- |
| liveHIT | "yes" or "no" | If set to "no", the HIT is posted to the sandbox (useful for debugging). |
| title |  _string_ |  A title that is shown to MTurk workers. |
| description | _string_ | A description that is shown to MTurk workers. |
| experimentURL | _string_ |A public **HTTPS** URL where your experiment is located. |
| keywords | _string_ | A list of keywords that is shown to MTurk workers. |
| USOnly? |  "yes" or "no" | If set to "yes", only MTurk workers with a US IP address can see and accept your HIT.|
| minPercentPreviousHITsApproved | _integer_ or "none" |If set to an integer _x_ between 0 and 100, only participants with at least _x_% previous HITs approved can see and accept your hit. |
| frameheight | _integer_ | The height (in pixel) of the iframe in which your experiment is displayed. Set this to at least the height of the largest trial in your experiment. |
|reward | _float_ | The reward (in USD) that MTurk workers get for completing your HIT. |
| numberofassignments | _integer_ | The total number of assignments (i.e., the total number of participants) for your experiment. |
| assignmentsperhit (optional) | _integer_ | The number of assignmets per HIT. If this is set to a lower number than _numberofassignments_, the tool will automatically create multiple HITs with at most _assignmentsperhit_ assignments per HIT.|
| assignmentduration | _integer_ | Maximum time (in seconds) for MTurk workers to complete your experiment. |
| hitlifetime | _integer_ | Lifetime (in seconds) of your HIT. After this period expires, MTurk workers can no longer see and accept your HIT.|
| autoapprovaldelay | _integer_ | Time (in seconds) after which completed assigments are automatically approved. |
| doesNotHaveQualification (optional) | _string_ | If set to a qualification ID, only MTurk workers without this qualification can see and accept your HIT. |
   
   
Once you have setup the config file, run the following command in the terminal:

    python supersubmiterator.py posthit [LABEL]

And then when you want to get the results:

    python supersubmiterator.py getresults [LABEL]

This will create a long-form table of your data (several `[LABEL]-*.csv` files).


##  How to make this even cooler

N.B. this will only work on unix.

If you want, you can make `submiterator` a system-wide command, so you can just type (for example):

    supersubmiterator posthit example
    supersubmiterator getresults example

To do this, save the Submiterator repo somewhere where it won't move, copy-paste and run the following command:

	chmod u+x supersubmiterator.py

Then make a directory called "bin" in your home folder and make sym-links to the Submiterator file:

	cd ~
	mkdir bin
	cd bin
	ln -s [PATH_TO_SUBMITERATOR_DIRECTORY]/supersubmiterator.py supersubmiterator

Then open up or create the file `.bash_profile` or `.bashrc` in your home directory and add the following line:

	PATH=$PATH:~/bin

Then once you open up a new terminal, you should be able to use the `supersubmiterator` command as above.
