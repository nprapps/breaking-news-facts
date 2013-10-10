import csv
import datetime

from dateutil.parser import *
from peewee import DeleteQuery
from pytz import timezone
import requests

import models


def load_test_event():
    if models.Event.select().where(models.Event.name=='Boston Marathon bombing').count() == 0:
        e = models.Event(name='Boston Marathon bombing', start_date=datetime.date(2013,4,15))
        e.save()


def delete_facts():
    DeleteQuery(models.Fact).execute()

def load_test_facts():
    eastern = timezone('US/Eastern')
    r = requests.get('https://docs.google.com/spreadsheet/pub?hl=en&hl=en&key=0AjWpFWKpoFHqdEJLdldXLWFPNUFSZFlTVXp4ODJscUE&output=csv')

    with open('data/facts.csv', 'wb') as writefile:
        writefile.write(r.content)

    with open('data/facts.csv', 'rb') as readfile:
        csvfile = csv.DictReader(readfile)

        for row in csvfile:
            row['timestamp'] = eastern.localize(parse(row['timestamp'], ignoretz=True))
            row['statement'] = row['statement'].decode('utf-8')
            row['attribution'] = row['attribution'].decode('utf-8')
            row['related_facts'] = None
            row['reporter'] = 'Rachel Lushinsky'

            if models.Fact.select().where(models.Fact.statement == row['statement']).count() == 0:
                m = models.Fact(**row)
                m.save()

    with open('data/facts.csv', 'rb') as readfile:
        csvfile = csv.DictReader(readfile)

        for row in csvfile:
            if row['related_facts'] != '':
                if models.Fact.select().where(models.Fact.statement == row['related_facts']).count() > 0:
                    fact = models.Fact.select().where(models.Fact.statement == row['statement'])[0]
                    fact.related_facts = models.Fact.select().where(models.Fact.statement == row['related_facts'])[0]
                    fact.save()
