# Main server file
from flask import Flask, jsonify, request, session, current_app
from flask_pymongo import PyMongo
from pymongo import UpdateOne
from flask_cors import CORS
from bson.objectid import ObjectId
from bson import json_util
import logging
import random
import json
import io
import datetime
import re
import csv
from loggingAnalytics import logged_message
from seed_db import delete_projects, format_challenges, \
    parse_csv_internal
from devpost_scraper import get_challenges


app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config.from_object('config')
mongo = PyMongo(app)

# Global variables
publish_winners = False # Flag that admin can flip to show winner status in '/'  # noqa
is_published = False


# Auth Decorators
def is_sponsor_or_admin(func):
    def function_wrapper(*args, **kwargs):
        print("Checking if logged in as sponsor before calling " +
              func.__name__)
        if 'user_type' in session and (session['user_type'] == 'sponsor'
                                       or session['user_type'] == 'admin'):
            return func(*args, **kwargs)
        else:
            return ('Error: You are not authorized to complete that request.',
                    403)
    # Renaming the function name:
    function_wrapper.__name__ = func.__name__
    return function_wrapper


def is_admin(func):
    def function_wrapper(*args, **kwargs):
        print("Checking if logged in as admin before calling " + func.__name__)
        if 'user_type' in session and session['user_type'] == 'admin':
            return func(*args, **kwargs)
        else:
            return ('Error: You are not authorized to complete that request.',
                    403)
    # Renaming the function name:
    function_wrapper.__name__ = func.__name__
    return function_wrapper


@app.route('/')
def hello():
    return get_all_projects()


# Public routes ##############################################################
# All endpoints under the public routes should not require any authentication.


@app.route('/api/projects', methods=['GET'])
def get_all_projects():
    projects = mongo.db.projects
    logged_message("endpoint = /api/projects, method = GET, params = NONE, type = public")  # noqa

    projects_list = []
    for p in projects.find():
        challenges_won = p['challenges_won']
        challenges = p['challenges']
        # Hide winners from public endpoint before winners are
        # published
        if not publish_winners:
            challenges_won = []
            for i in range(len(challenges)):
                challenges[i]['won'] = False

        temp_project = {
            'project_id': str(p['_id']),
            'table_number': p['table_number'],
            'project_name': p['project_name'],
            'project_url': p['project_url'],
            'challenges': challenges,
            'challenges_won': challenges_won
        }
        projects_list.append(temp_project)

    output = {
        'publish_winners': publish_winners,
        'is_published': is_published,
        'projects': projects_list
    }
    return jsonify(output)


@app.route('/api/projects_and_winners', methods=['GET'])
@is_sponsor_or_admin
def get_all_projects_with_winners():
    projects = mongo.db.projects
    logged_message("endpoint = /api/projects_and_winners, method = GET, params = NONE, type = sponsor or admin")  # noqa

    projects_list = []
    for p in projects.find():
        temp_project = {
            'project_id': str(p['_id']),
            'table_number': p['table_number'],
            'project_name': p['project_name'],
            'project_url': p['project_url'],
            'challenges': p['challenges'],
            'challenges_won': p['challenges_won']
        }
        projects_list.append(temp_project)

    output = {
        'publish_winners': publish_winners,
        'is_published': is_published,
        'projects': projects_list
    }
    return jsonify(output)


@app.route('/api/projects/id/<project_id>', methods=['GET'])
def get_project(project_id):
    projects = mongo.db.projects
    logged_message(f'endpoint = /api/projects/id/{project_id}, method = GET, params = {project_id}, type = public')  # noqa
    project_obj = projects.find_one({'_id': ObjectId(project_id)})
    temp_project = {
        'project_id': str(project_obj['_id']),
        'table_number': project_obj['table_number'],
        'project_name': project_obj['project_name'],
        'project_url': project_obj['project_url'],
        'challenges': project_obj['challenges'],
        'challenges_won': project_obj['challenges_won']
    }

    return jsonify(temp_project)


@app.route('/api/projects/generate_projects_list_csv', methods=['GET'])
def generate_projects_list_csv():
    projects = mongo.db.projects
    companies = mongo.db.companies
    logged_message(f'endpoint = /api/projects/generate_projects_list_csv, method = GET, type = public')  # noqa

    challenges_list = []
    for curr_company in companies.find():
        if curr_company['challenges']:
            for curr_challenge_id, curr_challenge \
                    in curr_company['challenges'].items():
                challenges_list.append((curr_challenge_id,
                                        curr_company['company_name'],
                                        curr_challenge['challenge_name']))

    projects_str = '<table>'
    projects_str += '<tr><th>Challenge Name</th><th>Company Name</th><th>Table Number</th><th>Project Name</th><th>Project URL</th></tr>'  # noqa
    all_projects = list(projects.find())
    for (_, company_name, challenge_name) in challenges_list:
        for p in all_projects:
            for attempted_challenges in p['challenges']:
                # print(attempted_challenges['challenge_name'] + '==' + challenge_name  + ' and ' +  attempted_challenges['company'] + '==' + company_name)  # noqa
                if (attempted_challenges['challenge_name'] == challenge_name
                        and attempted_challenges['company'] == company_name):
                    # This current project is competing in this
                    # current challenge
                    projects_str += '<tr>'
                    projects_str += ('<td>' + challenge_name + '</td>')
                    projects_str += ('<td>' + company_name + '</td>')
                    projects_str += ('<td>' + str(p['table_number']) + '</td>')
                    projects_str += ('<td>' + p['project_name'] + '</td>')
                    projects_str += ('<td>' + p['project_url'] + '</td>')
                    projects_str += '</tr>'

    projects_str += '</table>'
    return projects_str


@app.route('/api/challenges', methods=['GET'])
def get_all_challenges():
    companies = mongo.db.companies
    logged_message(f'endpoint = /api/challenges, method = GET, params = NONE, type = public')  # noqa
    output = {}
    for curr_company in companies.find():
        if not curr_company['challenges']:
            output[curr_company['company_name']] = []
        else:
            curr_challenges_list = []
            for curr_challenge_id, curr_challenge in \
                    curr_company['challenges'].items():
                curr_challenges_list.append(
                    curr_challenge['challenge_name'])
            output[curr_company['company_name']] = curr_challenges_list
    return jsonify(output)


@app.route('/api/publish_winners_status', methods=['GET'])
def get_publish_winners_flag():
    global publish_winners  # Use the var defined at top of file
    logged_message(f'endpoint = /api/publish_winners_status, method = GET, params = NONE, type = public')  # noqa
    return str(publish_winners)


@app.route('/api/is_published_status', methods=['GET'])
def get_is_published_flag():
    global is_published  # Use the var defined at top of file
    logged_message(f'endpoint = /api/is_published_status, method = GET, params = NONE, type = public')  # noqa
    return str(is_published)


@app.route('/api/expo_length', methods=['GET'])
def get_expo_length():
    logged_message(f'endpoint = /api/expo_length, method = GET, params = NONE, type = public')  # noqa
    return str(current_app.config['EXPO_LENGTH'])


# Admin routes #############################################################
# All endpoints under the Admin routes should require admin authorization.


# MONGODB SCHEMA:
# Project (data from Devpost)
    # Table Number
    # Project Name
    # Project URL
    # Attempted Challenges
    # Challenges Won


@app.route('/test/seed_db', methods=['GET'])
@is_admin
def csv_tester():
    logged_message(f'endpoint = /test/seed_db, method = GET, params = NONE, type = admin')  # noqa
    return """
        <html>
            <body>
                <h1>Devpost CSV DB Seeder</h1>
                <h2>(Testing Page)</h2>

                <form action="/parse_csv" method="post"
                enctype="multipart/form-data">
                    <input type="file" name="projects_csv" />
                    <input type="submit" />
                </form>
            </body>
        </html>
    """


@app.route('/parse_csv', methods=['POST'])
@is_admin
def parse_csv():
    # print("Loading file...")
    file = request.files['projects_csv']

    logged_message(f'endpoint = /parse_csv, method = POST, params = NONE, type = admin')  # noqa
    if not file:
        return "No file"
    with file.stream as temp_file:
        fd = temp_file.fileno()
        reader = csv.DictReader(io.open(fd, "rt",
                                        encoding="utf8",
                                        errors='ignore'))

        moving, not_moving = parse_csv_internal(reader, current_app.config['CUSTOM_DEVPOST_STAY_AT_TABLE_QUESTION'])  # noqa

        bulk_add_projects_internal(get_project_list(not_moving))
        bulk_add_projects_internal(get_project_list(moving))
    # TODO(timothychen01): Just return the integer
    return "Seeded DB with " + str(len(moving) + len(not_moving)) + " projects"


def get_project_list(projects_obj):
    project_data = []
    logged_message(f'endpoint = /parse_csv, method = POST, params = NONE, type = admin')  # noqa
    for project_name in projects_obj:
        info = {
            'table_number': projects_obj[project_name].table_number,
            'project_name': project_name,
            'project_url': projects_obj[project_name].project_url,
            'challenges': projects_obj[project_name].challenges,
            'challenges_won': []
        }
        project_data.append(info)
    return project_data


def bulk_add_projects_internal(packet):
    if len(packet) != 0:
        projects = mongo.db.projects
        result = projects.insert_many(packet)
        return result


@app.route('/api/projects/assign_tables', methods=['POST'])
@is_admin
def assign_remaining_table_numbers():
    projects = mongo.db.projects
    all_projects = projects.find()
    logged_message(f'endpoint = /api/projects/assign_tables, method = POST, params = NONE, type = admin')  # noqa
    # Get all used table assignments
    used_tables_array = []
    for p in all_projects.clone():
        if p['table_number'] != '':
            used_tables_array.append(p['table_number'])

    # Check for existing duplicates
    used_tables_set = set(used_tables_array)
    if (len(used_tables_array) != len(used_tables_set)):
        duplicates = list(set([x for x in used_tables_array
                               if used_tables_array.count(x) > 1]))
        return f'Error: there exists {len(duplicates)} duplicate table number(s) in the DB. Please resolve duplicate before continuing.\n{duplicates}'  # noqa

    available_tables_list = get_available_table_numbers(request.json,
                                                        used_tables_set,
                                                        all_projects.count())
    i = 0
    db_update_operations = []
    for p in all_projects:
        # If table number hasn't been assigned yet, assign next available one
        if p['table_number'] == '' and i < len(available_tables_list):
            db_update_operations.append(UpdateOne(
                {'_id': ObjectId(p['_id'])},
                {'$set': {'table_number': available_tables_list[i]}}
            ))
            i += 1
    if (len(db_update_operations) > 0):
        result = projects.bulk_write(db_update_operations)
        print(result.bulk_api_result)
        num_modified = result.bulk_api_result.get('nModified')
        return f'{num_modified} projects have been assigned tables. {len(used_tables_array)} projects maintain their old table.'  # noqa
    else:
        return 'No projects have been assigned new tables.'


# Valid schemas: 'numeric', 'evens', 'odds', 'custom'
def get_available_table_numbers(request_params, used_tables_set, num_projects):
    logged_message(f'endpoint = /api/projects/assign_tables, method = POST, params = {request_params},{used_tables_set},{num_projects}, type = admin')  # noqa
    table_assignment_schema = request_params['table_assignment_schema']
    max_table_numbers_list = []
    num_tables_needed = num_projects + len(used_tables_set)
    if table_assignment_schema == 'evens':
        max_table_numbers_list = range(2, num_tables_needed * 2 + 2, 2)
    elif table_assignment_schema == 'odds':
        max_table_numbers_list = range(1, num_tables_needed * 2 + 1, 2)
    elif table_assignment_schema == 'numeric':
        max_table_numbers_list = range(1, num_tables_needed + 1)
    elif table_assignment_schema == 'custom':
        for letter in char_range(request_params['table_start_letter'],
                                 request_params['table_end_letter']):
            for number in range(request_params['table_start_number'],
                                request_params['table_end_number'] + 1):
                max_table_numbers_list.append(letter + str(number))
        if request_params['skip_every_other_table']:
            max_table_numbers_list = max_table_numbers_list[::2]
    # Remove used table numbers
    for table in max_table_numbers_list:
        if table in used_tables_set:
            max_table_numbers_list.remove(table)
    print(max_table_numbers_list)
    return max_table_numbers_list


def char_range(c1, c2):
    """Generates the characters from `c1` to `c2`, inclusive."""
    for c in range(ord(c1), ord(c2)+1):
        yield chr(c)


@app.route('/api/projects/clear_table_assignments', methods=['POST'])
@is_admin
def remove_all_table_numbers():
    projects = mongo.db.projects
    all_projects = projects.find()
    logged_message(f'endpoint = /api/projects/clear_table_assignments, method = POST, params = NONE, type = admin')  # noqa
    db_update_operations = []
    for p in all_projects:
        db_update_operations.append(UpdateOne(
            {'_id': ObjectId(p['_id'])},
            {'$set': {'table_number': ''}}
        ))
    if (len(db_update_operations) > 0):
        result = projects.bulk_write(db_update_operations)
        num_modified = result.bulk_api_result.get('nModified')
        if current_app.config['CUSTOM_DEVPOST_STAY_AT_TABLE_QUESTION']:
            return f'Cleared table assignments from {num_modified} projects. Remember to manually assign table numbers to projects requesting a specific table.'  # noqa
        else:
            return f'Cleared {num_modified} projects of table assignments.'
    else:
        return 'No table assignments were cleared.'


@app.route('/api/publish_winners_status', methods=['POST'])
@is_admin
def update_publish_winners_flag():
    logged_message(f'endpoint = /api/publish_winners_status, method = POST, params = NONE, type = admin')  # noqa
    global publish_winners  # Use the var defined at top of file
    publish_winners = request.json['publish_winners']
    return str(publish_winners)


@app.route('/api/is_published_status', methods=['POST'])
@is_admin
def update_is_published_flag():
    logged_message(f'endpoint = /api/is_published_status, method = POST, params = NONE, type = admin')  # noqa
    global is_published  # Use the var defined at top of file
    is_published = request.json['is_published']
    return str(is_published)


@app.route('/api/projects/add', methods=['POST'])
@is_admin
def add_project():
    projects = mongo.db.projects
    logged_message(f'endpoint = /api/projects/add, method = POST, params = NONE, type = admin')  # noqa
    table_number = request.json['table_number']
    project_name = request.json['project_name']
    project_url = request.json['project_url']
    try:
        challenges = format_challenges(request.json['challenges'])
    except:  # noqa
        challenges = []

    project = {
        'table_number': table_number,
        'project_name': project_name,
        'project_url': project_url,
        'challenges': challenges,
        'challenges_won': []
    }

    project_id = projects.insert(project)
    return str(project_id)


@app.route('/api/projects/bulk_add', methods=['POST'])
@is_admin
def bulk_add_project():
    logged_message(f'endpoint = /api/projects/bulk_add, method = POST, params = NONE, type = admin')  # noqa
    packet = request.json['projects']
    return bulk_add_projects_internal(packet)


@app.route('/api/projects/id/<project_id>', methods=['POST'])
@is_admin
def update_project(project_id):
    projects = mongo.db.projects
    logged_message(f'endpoint = /api/projects/id/{project_id}, method = POST, params = {project_id}, type = admin')  # noqa
    updated_project_obj = {
        'table_number': request.json['table_number'],
        'project_name': request.json['project_name'],
        'project_url': request.json['project_url'],
        'challenges': request.json['challenges'],
        # 'challenges_won': []  // Don't update challenges_won array
    }

    old_project_obj = projects.find_one_and_update(
        {'_id': ObjectId(project_id)},
        {'$set': updated_project_obj}
    )

    return "The following project data was overridden: " + \
        json.dumps(old_project_obj, default=json_util.default)


def get_all_attempted_challenge_strings(project_obj):
    output = []
    for challenge_obj in project_obj['challenges']:
        output.append(challenge_obj['challenge_name'] + ' - ' +
                      challenge_obj['company'])
    return output


# Note: this helper not currently used
def get_all_possible_challenges():
    companies = mongo.db.companies
    output = []
    for curr_company in companies.find():
        output.append(format_company_obj_to_old_schema(curr_company))
    companies_list = [y for x in output for y in x]

    challenges = []
    for comp in companies_list:
        try:
            challenges.append(comp['challenge_name'])
        except:  # noqa
            # Do nothing if no challenge in that comp
            None
    return challenges


@app.route('/api/projects/id/<project_id>', methods=['DELETE'])
@is_admin
def delete_project(project_id):
    logged_message(f'endpoint = /api/projects/id/{project_id}, method = DELETE, params = {project_id}, type = admin')  # noqa

    projects = mongo.db.projects
    result = projects.delete_one({'_id': ObjectId(project_id)})
    if result.deleted_count == 1:
        return "Deleted project " + project_id
    else:
        return "Did not find project " + project_id


@app.route('/api/projects/deleteAll', methods=['DELETE'])
@is_admin
def delete_all_projects():
    projects = mongo.db.projects
    logged_message(f'endpoint = /api/projects/deleteAll, method = DELETE, params = NONE, type = admin')  # noqa

    projects.delete_many({})
    delete_projects()  # clear dictionary from seed_db
    return jsonify({'Delete': 'all'})


# Company (defined by organizers in admin dash)
    # Company Name
    # Access code
    # Challenge Name
    # Number of prizes they can choose per challenge
    # ProjectID that won the challenge
@app.route('/api/seed-challenges-from-devpost', methods=['POST'])
@is_admin
def import_challenges():
    companies = mongo.db.companies

    devpost_url = request.json['devpostUrl']
    if "http" not in devpost_url:
        devpost_url = "https://" + devpost_url

    prize_list = get_challenges(devpost_url)
    company_list = []
    company_names = list(set([prize[1] for prize in prize_list]))

    for company_name in company_names:
        challenge_info = [[prize[0], prize[2]] for prize in prize_list
                          if prize[1] == company_name]

        # Autogenerate access_code
        access_code = generate_random_access_code(8)
        company_obj = companies.find_one({'access_code':
                                         {'$eq': access_code.upper()}})
        # Keep generating codes until unique
        while company_obj is not None:
            access_code = generate_random_access_code(8)
            company_obj = companies.find_one({'access_code':
                                             {'$eq': access_code.upper()}})

        alphanumeric_company_name_no_spaces = re.sub(r'\W+', '', company_name)
        challenges_obj = {}

        # Go through all challenges
        for challenge_name, num_winners in challenge_info:
            alphanumeric_challenge_name_no_spaces = re.sub(r'\W+', '',
                                                           challenge_name)
            challenge_id = alphanumeric_company_name_no_spaces + \
                '_challenge' + \
                datetime.datetime.now().strftime('%Y%m%d%H%M%S') + \
                '_' + alphanumeric_challenge_name_no_spaces

            challenges_obj[challenge_id] = {
                'challenge_name': challenge_name,
                'num_winners': num_winners,
                'winners': []
            }

        company_list.append({
            'company_name': company_name,
            'access_code': access_code.upper(),
            'challenges': challenges_obj
        })

    companies.insert_many(company_list)
    return str(prize_list)


@app.route('/api/companies/add', methods=['POST'])
@is_admin
def add_company():
    companies = mongo.db.companies
    logged_message(f'endpoint = /api/companies/add, method = POST, params = NONE, type = admin')  # noqa

    company_name = request.json['company_name']
    access_code = request.json['access_code'].upper()

    # Autogenerate 8-character access code if blank one was sent
    if access_code == '':
        access_code = generate_random_access_code(8)
        company_obj = companies.find_one({'access_code':
                                         {'$eq': access_code.upper()}})
        # Keep generating codes until unique
        while company_obj is not None:
            access_code = generate_random_access_code(8)
            company_obj = companies.find_one({'access_code':
                                             {'$eq': access_code.upper()}})
    else:
        # Check if user-defined access code is already used
        company_obj = companies.find_one({'access_code':
                                         {'$eq': access_code.upper()}})
        if company_obj is not None:
            return "Access code already in use."

    company = {
        'company_name': company_name,
        'access_code': access_code.upper(),
        'challenges': {}
    }
    company_id = str(companies.insert(company))
    return company_id


def generate_random_access_code(length):
    # Only allow characters that are not ambiguous (I, L, O, 1, 0)
    return ''.join(random.choice('ABCDEFGHJKMNPQRTUVWXYZ2346789')
                   for _ in range(length))


@app.route('/api/companies/id/<company_id>', methods=['POST'])
@is_admin
def update_company_name_or_code(company_id):
    companies = mongo.db.companies
    logged_message(f'endpoint = /api/companies/id/{company_id}, method = POST, params = {company_id}, type = admin')  # noqa

    # winners_arr = []
    # if request.json.get('winners') != None:
    #     winners_arr = request.json.get('winners').split()

    # Both fields must be present in the POST request body
    updated_company = {
        'company_name': request.json['company_name'],
        'access_code': request.json['access_code'].upper()
    }
    updated_company_obj = companies.find_one_and_update(
        {'_id': ObjectId(company_id)},
        {'$set': updated_company}
    )

    return "The following company data was overridden: " + \
        json.dumps(updated_company_obj, default=json_util.default)


@app.route('/api/companies/id/<company_id>', methods=['DELETE'])
@is_admin
def delete_company(company_id):
    companies = mongo.db.companies
    logged_message(f'endpoint = /api/companies/id/{company_id}, method = DELETE, params = {company_id}, type = admin')  # noqa

    result = companies.delete_one({'_id': ObjectId(company_id)})
    # TODO(timothychen01): Explore adding additional side effect for challenges
    if result.deleted_count == 1:
        return "Deleted company " + company_id
    else:
        return "Did not find company " + company_id


@app.route('/api/companies/deleteAll', methods=['DELETE'])
@is_admin
def delete_all_companies():
    logged_message(f'endpoint = /api/companies/deleteAll, method = DELETE, params = NONE, type = admin')  # noqa
    companies = mongo.db.companies
    companies.delete_many({})
    return jsonify({'Delete': 'all companies'})


@app.route('/api/companies/id/<company_id>/challenges/add', methods=['POST'])
@is_admin
def add_challenge_to_company(company_id):
    companies = mongo.db.companies
    logged_message(f'endpoint = api/companies/id/<company_id>/challenges/add, method = POST, params = NONE, type = admin')  # noqa

    company_obj = companies.find_one({'_id': ObjectId(company_id)})
    challenges_obj = company_obj['challenges']

    # TODO: Come up with better id creation method
    company_name_no_spaces = "".join(company_obj['company_name'].split())
    challenge_id = company_name_no_spaces + '_challenge' + \
        datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    challenges_obj[challenge_id] = {
        'challenge_name': request.json['challenge_name'],
        'num_winners': int(request.json['num_winners']),
        'winners': []
    }

    updated_company = {
        'challenges': challenges_obj
    }
    updated_company_obj = companies.find_one_and_update(
        {'_id': ObjectId(company_id)},
        {'$set': updated_company}
    )

    return "The following company data was overridden: " + \
        json.dumps(updated_company_obj, default=json_util.default)


@app.route('/api/companies/id/<company_id>/challenges/<challenge_id>', methods=['POST', 'DELETE'])  # noqa
@is_admin
def update_company_challenge(company_id, challenge_id):
    companies = mongo.db.companies
    logged_message(f'endpoint = /api/companies/id/{company_id}/challenges/{challenge_id}, method = POST, DELETE, params = NONE, type = admin')  # noqa

    company_obj = companies.find_one({'_id': ObjectId(company_id)})
    challenges_obj = company_obj['challenges']

    if request.method == 'DELETE':
        try:
            # Check if there are any winners assigned yet
            if len(challenges_obj[challenge_id]['winners']) == 0:
                del challenges_obj[challenge_id]
            else:
                return "Cannot delete challenge " + challenge_id + \
                    " because winners have already been selected"
        except:  # noqa
            return "Error deleting challenge " + challenge_id
    elif request.method == 'POST':
        challenges_obj[challenge_id]['challenge_name'] = \
            request.json['challenge_name']
        challenges_obj[challenge_id]['num_winners'] = \
            int(request.json['num_winners'])

    updated_company = {
        'challenges': challenges_obj
    }
    updated_company_obj = companies.find_one_and_update(
        {'_id': ObjectId(company_id)},
        {'$set': updated_company}
    )

    if request.method == 'DELETE':
        return challenge_id + " has been deleted from " + \
            company_obj['company_name']
    return "The following company data was overridden: " + \
        json.dumps(updated_company_obj, default=json_util.default)


@app.route('/api/companies/id/<company_id>', methods=['GET'])
@is_admin
def get_company(company_id):
    companies = mongo.db.companies
    logged_message(f'endpoint = /api/companies/id/{company_id}, method = GET, params = NONE, type = admin')  # noqa

    company_obj = companies.find_one({'_id': ObjectId(company_id)})
    return jsonify(format_company_obj_to_old_schema(company_obj))


@app.route('/api/companies', methods=['GET'])
@is_admin
def get_all_companies():
    companies = mongo.db.companies
    logged_message(f'endpoint =/api/companies, method = GET, params = NONE, type = admin')  # noqa
    output = []
    for curr_company in companies.find():
        output.append(format_company_obj_to_old_schema(curr_company))
    flattened_output = [y for x in output for y in x]
    return jsonify(flattened_output)


def format_company_obj_to_old_schema(company_obj):
    output = []
    if not company_obj['challenges']:
        return [{
            'company_id': str(company_obj['_id']),
            'company_name': company_obj['company_name'],
            'access_code': company_obj['access_code'],
        }]
    for curr_challenge_id, curr_challenge in company_obj['challenges'].items():
        company_old_schema = {
            'company_id': str(company_obj['_id']),
            'company_name': company_obj['company_name'],
            'access_code': company_obj['access_code'],
            'challenge_id': curr_challenge_id,
            'challenge_name': curr_challenge['challenge_name'],
            'num_winners': curr_challenge['num_winners'],
            'winners': curr_challenge['winners']
        }
        output.append(company_old_schema)
    return output


# Second version of the company endpoints with cleaner output
# Note: v2 is not used by frontend
@app.route('/api/v2/companies/id/<company_id>', methods=['GET'])
@is_admin
def get_company_cleaner_schema(company_id):
    companies = mongo.db.companies
    logged_message(f'endpoint =/api/v2/companies/id/{company_id}, method = GET, params = NONE, type = admin')  # noqa
    company_obj = companies.find_one({'_id': ObjectId(company_id)})
    output = {
        'company_id': str(company_obj['_id']),
        'company_name': company_obj['company_name'],
        'access_code': company_obj['access_code'],
        'challenges': company_obj['challenges']
    }
    return jsonify(output)


@app.route('/api/v2/companies', methods=['GET'])
@is_admin
def get_all_companies_cleaner_schema():
    companies = mongo.db.companies
    logged_message(f'endpoint =/api/v2/companies/id/{company_id}, method = GET, params = NONE, type = admin')  # noqa
    output = []
    for c in companies.find():
        temp_company = {
            'company_id': str(c['_id']),
            'company_name': c['company_name'],
            'access_code': c['access_code'],
            'challenges': c['challenges']
        }
        output.append(temp_company)

    return jsonify(output)


# Private / sponsor routes ###################################################
# All endpoints under the private routes should require the access token.


# Second version of the company endpoints with cleaner output
# Note: v2 is not used by frontend
@app.route('/api/v2/companies/current_sponsor', methods=['GET'])
def get_logged_in_company_cleaner_schema():
    if 'user_type' in session and session['user_type'] == 'sponsor':
        companies = mongo.db.companies
        logged_message(f'endpoint =/api/v2/companies/current_sponsor, method = GET, params = NONE, type = sponsor')  # noqa
        company_obj = companies.find_one({'company_name':
                                         {'$eq': session['name']}})
        output = {
            'company_id': str(company_obj['_id']),
            'company_name': company_obj['company_name'],
            'access_code': company_obj['access_code'],
            'challenges': company_obj['challenges']
        }
        return jsonify(output)
    else:
        return 'Error: You are not authorized to complete that request.', 403


@app.route('/api/projects/id/<project_id>/challenge_status', methods=['POST'])
@is_sponsor_or_admin
def update_project_challenge_status(project_id):
    projects = mongo.db.projects
    logged_message(f'endpoint =/api/projects/id/{project_id}/challenge_status, method = POST, params = {project_id}, type = sponsor')  # noqa

    company_name = request.json['company_name']
    challenge_name = request.json['challenge_name']
    is_winner = request.json['is_winner']     # boolean

    project_obj = projects.find_one(
        {'_id': ObjectId(project_id)}
    )
    challenges = project_obj['challenges']

    for ind, challenge in enumerate(challenges):
        if challenge['company'] == company_name and \
                challenge['challenge_name'] == challenge_name:
            print(str(ind), challenge)
            challenges[ind]['won'] = is_winner
            print(is_winner)
            print(challenges[ind]['won'])

    updated_project_obj = projects.find_one_and_update(
        {'_id': ObjectId(project_id)},
        {'$set': project_obj}
    )

    return "The following project data was overridden: " + \
        json.dumps(updated_project_obj, default=json_util.default)


# NOTE: THIS API FORCES US TO NEVER NAME A CHALLENGE AS
#       A SUBSTRING OF ANOTHER CHALLENGE
def update_win_status(project_challenge_obj, company_name,
                      challenge_name, didWin):
    if (project_challenge_obj['company'] == company_name
            and project_challenge_obj['challenge_name'] in challenge_name):
        project_challenge_obj['won'] = didWin
    return project_challenge_obj


@app.route('/api/projects/id/<project_id>/makeWinner', methods=['POST'])
@is_sponsor_or_admin
def make_winner(project_id):
    projects = mongo.db.projects
    logged_message(f'endpoint =/api/projects/id/{project_id}/makeWinner, method = POST, params = {project_id}, type = sponsor')  # noqa
    companies = mongo.db.companies
    company_id = request.json['company_id']
    challenge_id = request.json['challenge_id']

    project_obj = projects.find_one({'_id': ObjectId(project_id)})
    company_obj = companies.find_one({'_id': ObjectId(company_id)})
    challenge_obj = company_obj['challenges'][challenge_id]
    challenge_name = challenge_obj['challenge_name']

    # Check if project has already won the same challenge
    # (prevent duplicate form entry)
    if project_id in challenge_obj['winners']:
        return "Error: Project " + project_id + " is already winner for " + \
               challenge_name

    # Error if the challenge cannot accept more winners
    challenge_winners_cap = challenge_obj['num_winners']
    curr_num_winners = len(challenge_obj['winners'])
    if curr_num_winners >= int(challenge_winners_cap):
        return "Error: Challenge " + challenge_id + \
               " is capped at " + str(challenge_winners_cap) + " winner(s)"

    # Modify company object
    company_obj['challenges'][challenge_id]['winners'].append(project_id)
    companies.find_one_and_update(
        {'_id': ObjectId(company_id)},
        {'$set': company_obj}
    )

    # Modify project object
    company_name = company_obj['company_name']
    updated_challenges_list = \
        list(map(lambda challenge_obj:
                 update_win_status(challenge_obj, company_name, challenge_name,
                                   True),
                 project_obj['challenges']))
    project_obj['challenges'] = updated_challenges_list
    project_obj['challenges_won'].append(challenge_id)
    projects.find_one_and_update(
        {'_id': ObjectId(project_id)},
        {'$set': project_obj}
    )

    return "Updated project " + project_id


@app.route('/api/projects/id/<project_id>/makeNonWinner', methods=['POST'])
@is_sponsor_or_admin
def make_non_winner(project_id):
    projects = mongo.db.projects
    logged_message(f'endpoint =/api/projects/id/{project_id}/makeNonWinner, method = POST, params = {project_id}, type = sponsor')  # noqa
    companies = mongo.db.companies
    company_id = request.json['company_id']
    challenge_id = request.json['challenge_id']

    project_obj = projects.find_one({'_id': ObjectId(project_id)})
    company_obj = companies.find_one({'_id': ObjectId(company_id)})
    challenge_obj = company_obj['challenges'][challenge_id]
    challenge_name = challenge_obj['challenge_name']

    # Modify company object
    old_winners_list = challenge_obj['winners']
    company_obj['challenges'][challenge_id]['winners'] = \
        list(filter(lambda winner_id: winner_id != project_id,
                    old_winners_list))
    companies.find_one_and_update(
        {'_id': ObjectId(company_id)},
        {'$set': company_obj}
    )

    # Modify project object
    if project_obj is None:
        return "Project does not exist, exiting early."
    company_name = company_obj['company_name']
    updated_challenges_list = \
        list(map(lambda challenge_obj:
                 update_win_status(challenge_obj, company_name, challenge_name,
                                   False),
                 project_obj['challenges']))
    project_obj['challenges'] = updated_challenges_list
    old_challenges_won_list = project_obj['challenges_won']
    project_obj['challenges_won'] = \
        list(filter(lambda c_id: c_id != challenge_id,
                    old_challenges_won_list))
    projects.find_one_and_update(
        {'_id': ObjectId(project_id)},
        {'$set': project_obj}
    )

    return "Updated project " + project_id


@app.route('/api/companies/id/<company_id>/challenges/<challenge_id>/resetWinners', methods=['PUT'])  # noqa
def resetChallenges(company_id, challenge_id):
    projects = mongo.db.projects
    companies = mongo.db.companies
    company_obj = companies.find_one({'_id': ObjectId(company_id)})
    challenge_obj = company_obj['challenges'][challenge_id]
    print(challenge_obj)
    challenge_name = challenge_obj['challenge_name']

    for project_id in company_obj['challenges'][challenge_id]['winners']:
        project_obj = projects.find_one({'_id': ObjectId(project_id)})
        if project_obj is None:
            continue
        company_name = company_obj['company_name']
        updated_challenges_list = \
            list(map(lambda challenge_obj:
                     update_win_status(challenge_obj, company_name,
                                       challenge_name, False),
                     project_obj['challenges']))
        project_obj['challenges'] = updated_challenges_list
        old_challenges_won_list = project_obj['challenges_won']
        project_obj['challenges_won'] = list(
                filter(lambda c_id: c_id != challenge_id,
                       old_challenges_won_list))
        projects.find_one_and_update(
            {'_id': ObjectId(project_id)},
            {'$set': project_obj}
        )
        print(project_obj)

    # Modify company object
    # old_winners_list = challenge_obj['winners']
    company_obj['challenges'][challenge_id]['winners'] = []
    companies.find_one_and_update(
        {'_id': ObjectId(company_id)},
        {'$set': company_obj}
    )
    return "Reset Challenge winners " + str(company_obj)


# Auth routes ################################################################
# Modifies the user's session


@app.route('/api/whoami', methods=['GET'])
def return_session_info():
    logged_message(f'endpoint =/api/whoami, method = GET, params = NONE, type = auth')  # noqa
    if 'user_type' in session:
        return json.dumps({
            'user_type': session['user_type'],  # sponsor or admin
            'name': session['name'],            # company name or "admin"
            'id': session['id']
        }, default=json_util.default)
    return "{}"  # Return empty object if not logged in


@app.route('/api/login/sponsor', methods=['POST'])
def sponsor_login():
    companies = mongo.db.companies
    logged_message(f'endpoint =/api/login/sponsor, method = POST, params = NONE, type = auth')  # noqa
    attempted_access_code = request.json['access_code'].upper()
    if attempted_access_code == '':
        return "Access denied."
    company_obj = companies.find_one({'access_code':
                                      {'$eq': attempted_access_code.upper()}})
    if company_obj is None:
        return "Access denied."
    else:
        session['user_type'] = 'sponsor'
        session['name'] = company_obj['company_name']
        session['id'] = str(company_obj['_id'])
        return "Logged in as " + company_obj['company_name']


@app.route('/api/login/admin', methods=['POST'])
def admin_login():
    attempted_access_code = request.json['access_code'].upper()
    logged_message(f'endpoint =/api/login/admin, method = POST, params = NONE, type = auth')  # noqa
    if attempted_access_code != \
            current_app.config['ADMIN_ACCESS_CODE'].upper():
        return "Access denied."
    else:
        session['user_type'] = 'admin'
        session['name'] = 'Admin'
        session['id'] = 'admin'
        return "Logged in as admin"


@app.route('/api/logout', methods=['POST'])
def logout():
    logged_message(f'endpoint =/api/logout, method = POST, params = NONE, type = auth')  # noqa
    session.pop('user_type', None)
    session.pop('name', None)
    session.pop('id', None)
    return "Logged out"


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')


if __name__ != '__main__':
    gunicorn_logger = logging.getLogger('gunicorn.debug')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)
