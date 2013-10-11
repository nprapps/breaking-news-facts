#!/usr/bin/env python

import json
from mimetypes import guess_type
import time
import urllib

import envoy
from flask import Flask, Markup, abort, render_template

import app_config
import copytext
import data
import models
from render_utils import flatten_app_config, make_context

app = Flask(app_config.PROJECT_NAME)

@app.route('/admin/api/events/fact/<int:fact_id>/<string:verb>/', methods=['POST'])
def _admin_api_fact_detail(fact_id, verb):
    if verb:
        if verb == 'read':
            fact = models.Fact.select().where(models.Fact.id == fact_id)[0]
            return json.dumps(fact.as_dict())

@app.route('/events.json')
def events_json():
    output = []
    events = models.Event.select()
    for event in events:
        output.append(event.as_dict())
    return json.dumps(output)


@app.route('/event-<int:event_id>.json')
def facts_json(event_id):
    """
    Outputs a list of lists.
    The outer list is all facts in this event.
    The inner lists are the sets of related facts.
    Inner lists are sorted newest -> oldest.
    Outer list is also sorted newest -> oldest.
    """
    output = []

    event = models.Event.select().where(models.Event.id == event_id)[0]

    primary_facts = event.primary_facts()

    for fact in primary_facts:
        fact_node = []
        fact_node.append(fact.as_dict())

        if fact.get_related_facts():
            related_facts = fact.get_related_facts()

            for related_fact in related_facts:
                fact_node.append(related_fact.as_dict())

            fact_node = sorted(fact_node, key=lambda f: f['timestamp'], reverse=True)
        output.append(fact_node)

    return json.dumps(output)

@app.route('/admin/events/')
def _admin_event_list():
    return render_template('admin_event_list.html', events=models.Event.select())


@app.route('/admin/events/<int:event_id>/')
def _admin_event_detail(event_id):
    context = {}
    context['event'] = models.Event.select().where(models.Event.id == event_id)[0]
    context['primary_facts'] = context['event'].primary_facts()

    return render_template('admin_event_detail.html', **context)

@app.route('/')
@app.route('/index.html')
def index():
    """
    Example view demonstrating rendering a simple HTML page.
    """
    return render_template('index.html', **make_context())

@app.route('/_form.html')
def form():
    return render_template('_form.html', **make_context())

@app.route('/board-public.html')
def form():
    return render_template('board-public.html', **make_context())


@app.route('/board-internal.html')
def form():
    return render_template('board-internal.html', **make_context())

@app.route('/email-internal.html')
def form():
    return render_template('email-internal.html', **make_context())


# Boston Marathon pages
@app.route('/<string:filename>')
def messages(filename):
    return render_template(filename, **make_context())

@app.route('/widget.html')
def widget():
    """
    Embeddable widget example page.
    """
    return render_template('widget.html', **make_context())

@app.route('/test_widget.html')
def test_widget():
    """
    Example page displaying widget at different embed sizes.
    """
    return render_template('test_widget.html', **make_context())

@app.route('/test/test.html')
def test_dir():
    return render_template('index.html', **make_context())

# Render LESS files on-demand
@app.route('/less/<string:filename>')
def _less(filename):
    try:
        with open('less/%s' % filename) as f:
            less = f.read()
    except IOError:
        abort(404)

    r = envoy.run('node_modules/bin/lessc -', data=less)

    return r.std_out, 200, { 'Content-Type': 'text/css' }

# Render JST templates on-demand
@app.route('/js/templates.js')
def _templates_js():
    r = envoy.run('node_modules/bin/jst --template underscore jst')

    return r.std_out, 200, { 'Content-Type': 'application/javascript' }

# Render application configuration
@app.route('/js/app_config.js')
def _app_config_js():
    config = flatten_app_config()
    js = 'window.APP_CONFIG = ' + json.dumps(config)

    return js, 200, { 'Content-Type': 'application/javascript' }

# Render copytext
@app.route('/js/copy.js')
def _copy_js():
    copy = 'window.COPY = ' + copytext.Copy().json()

    return copy, 200, { 'Content-Type': 'application/javascript' }

# Server arbitrary static files on-demand
@app.route('/<path:path>')
def _static(path):
    try:
        with open('www/%s' % path) as f:
            return f.read(), 200, { 'Content-Type': guess_type(path)[0] }
    except IOError:
        abort(404)

@app.template_filter('urlencode')
def urlencode_filter(s):
    """
    Filter to urlencode strings.
    """
    if type(s) == 'Markup':
        s = s.unescape()

    s = s.encode('utf8')
    s = urllib.quote_plus(s)

    return Markup(s)

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port')
    args = parser.parse_args()
    server_port = 8000

    if args.port:
        server_port = int(args.port)

    app.run(host='0.0.0.0', port=server_port, debug=app_config.DEBUG)
