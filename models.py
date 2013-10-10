from peewee import *

psql_db = PostgresqlDatabase('breaking', user='breaking', pass='breaking')

class PostgresqlModel(Model):
    class Meta:
        database = psql_db

class Event(PostgresqlModel):
    name = CharField()
    start_date = DateField()

    class Meta:
        database = psql_db
        db_table = 'events'

    def get_admin_url(self):
        return '/admin/events/%s/' % self.id


class Fact(PostgresqlModel):
    statement = TextField()
    attribution = TextField()
    timestamp = DateTimeField()
    # Status choices (enforced at the app level, sadly):
    # 0 - Has been confirmed as false.
    # 1 - Has been confirmed as true.
    # 2 - Neither confirmed nor denied nor checking.
    # 3 - Possibly true, checking.
    status = IntegerField(default=2)
    related_facts = ForeignKeyField('self', related_name='related_facts', null=True)

    class Meta:
        database = psql_db
        db_table = 'facts'