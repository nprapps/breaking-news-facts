import datetime
import time

from peewee import *

from app_config import get_secrets

secrets = get_secrets()

psql_db = PostgresqlDatabase('breaking',
    user=secrets['APPS_USER'],
    password=secrets['APPS_PASS']
)


def delete_tables():
    try:
        Event.drop_table()
    except:
        pass

    try:
        Fact.drop_table()
    except:
        pass


def create_tables():
    Event.create_table()
    Fact.create_table()


class Event(Model):
    """
    An event with a series of facts.
    """
    name = CharField()
    start_date = DateField()

    class Meta:
        database = psql_db
        db_table = 'events'

    def get_admin_url(self):
        return '/admin/events/%s/' % self.id

    def __unicode__(self):
        return self.name

    def as_dict(self):
        output = {}
        output['name'] = self.name
        output['start_time'] = time.mktime(self.time.timetuple())
        return output

class Fact(Model):
    """
    An instance of a fact. Related to a master fact.
    """
    event = ForeignKeyField(Event, null=True)
    statement = TextField()
    attribution = TextField()
    timestamp = DateTimeField()
    # Status choices (enforced at the app level, sadly):
    # 0 - Has been confirmed as false.
    # 1 - Has been confirmed as true.
    # 2 - Neither confirmed nor denied nor checking.
    # 3 - Checking.
    status = IntegerField(default=2)
    related_facts = ForeignKeyField('self', null=True)
    public = BooleanField(default=False)
    approved = BooleanField(default=False)
    reporter = CharField()

    class Meta:
        database = psql_db
        db_table = 'facts'

    def __unicode__(self):
        return self.statement

    def as_dict(self):
        output = dict(self.__dict__['_data'])
        output['timestamp'] = time.mktime(output['timestamp'].timetuple())
        output['time_string'] = self.timestamp.isoformat()
        output.pop('event')
        output.pop('related_facts')
        return output