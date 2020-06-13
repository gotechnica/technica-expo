import csv
import re
import requests
from typing import Dict, List

"""
Assumption: Given A1 -> N15
 A1 ............ N15            1  16 ........ 196
 A2              N2             2  17          197
 .               .              .  .           .
 .               .       --->   .  .           .
 .               .              .  .           .
 A15 ..........  N15            15 30 ........ 210

Global variables:
moving -> list of projects that can move
not_moving -> list of projects that can't move
spots -> dict that goes table number:hack name
assignments -> list of spots that are taken

"""

moving, not_moving = {}, {}

num_tables = 26
"""int: number of tables available"""

spots_per_table = 10
"""int: assuming 10 spots per table"""

assignments = ["None | "] * (num_tables * spots_per_table)
"""list(str): tabling assignments"""


class Project:
    """Project class to hold certain metadata regarding a given project."""
    def __init__(self, project_url: str, challenges: List[str]):
        self.project_url = project_url
        self.challenges = challenges
        self.table_number = ""

    def __str__(self) -> str:
        return str(self.table_number) + " " + str(self.project_url)


def table_to_number(table: str) -> int:
    """Converts a table number into an integer
    Examples:
    * 'A1' -> 1
    * 'O10' -> 150

    Each table number is prefixed with a letter A-Z, and has a numeric suffix
    from 1-10, since there are 26 tables with 10 seats each.

    """
    letter = table[0].upper()
    num = table[1:]
    return (ord(letter) - 65) * spots_per_table + int(num)


def number_to_table(number: int) -> str:
    """Converts an integer into a table number.
    Examples:
    * 150 -> 'O10'
    * 1 -> 'A1'

    Args:
        number: int between 1 and (spots_per_table * num_tables).

    Returns:
        String encoding of table number.

    """
    letter = chr((int(number) - 1)//spots_per_table + 65)
    num = int(number) - (int(number) - 1)//spots_per_table * spots_per_table
    return str(letter) + str(num)


def check_if_needs_to_stay(response: str):
    """Checks if a string matches a table number. Used for a hacker's response
    if they reply with a table number, either purely numerical or prefixed with
    A-Z.

    Args:
        response: str table number

    Returns:
        Any found regular expression matches from the arg.

    """
    return re.search('([a-zA-Z]*\d+)', response)  # noqa


def format_challenges(challenges) -> List[Dict[any, any]]:
    """Parses a string of challenge titles into a list of prizes a hacker may
    win.

    The string is of the format
    'Company1 - Challenge1, Company2 - Challenge2, ...'

    Args:
        challenges: str of company challenge titles

    Returns:
        list of dicts with 'company', 'challenge_name',
        and if it has been 'won'

    """
    challenges_list = []
    if challenges:
        challenges = challenges.split(',')
        for challenge in challenges:
            # TODO: possibly look into creating a hash from companies DB
            # instead of hard coding the dash separator rule
            data = str.strip(challenge).split(' - ')
            prize = {
                'company': data[1],
                'challenge_name': data[0],
                'won': False
            }
            challenges_list.append(prize)
    return challenges_list


# not used but just still here
def already_in_db():
    r = requests.get("http://127.0.0.1:5000/api/projects")
    data = re.findall('\"project_name\": \"(.+)\"', r.text)
    projects = list(map(lambda x: x.strip(), data))
    return projects


# clear moving, not_moving
def delete_projects():
    moving.clear()
    not_moving.clear()

    # print("size of moving: ", len(moving))
    # print("size of not moving: ", len(not_moving))


def parse_csv_internal(reader, not_moving_question=None):
    """Parses a CSV exported from DevPort and seperates hackers based on if
    their hack needs to be stationary (i.e. can't move from table) or not.

    If users cannot move, we assign them a table and spot and add them to a
    not_moving list. If they can move their project, then they are not assigned
    a space and are added to the moving list.

    Args:
        reader: CSV object
        not_moving_question: str question to determine hackers'
                             project mobility

    Returns:
        tuple (moving, not_moving) of dicts mapping project names -> Project()
        objects.

    """
    # already_stored = already_in_db()
    for row in reader:
        project_name = row["Submission Title"].strip()
        project_url = row["Submission Url"].strip()
        challenges = format_challenges(row["Desired Prizes"])

        # Skip iteration if current project is not valid
        if project_name == "" and project_url == "":
            continue

        if not_moving_question is None:
            needs_to_stay = None
            response = None
        else:
            # If config file has a question string defined for Devpost question
            # asking if project shouldn't move, then get curr row's response
            response = row[not_moving_question]
            needs_to_stay = check_if_needs_to_stay(response)

        if needs_to_stay is not None:
            not_moving[project_name] = Project(project_url, challenges)
            assignments[table_to_number(needs_to_stay.group(0))] = \
                project_name + " | "
            not_moving[project_name].table_number = needs_to_stay.group(0)
        else:
            moving[project_name] = Project(project_url, challenges)

    return moving, not_moving


def fancy_seed_hackers() -> None:
    """Evenly spreads out hackers amongst available seats."""
    place = 0
    skip = 391//len(moving)
    for hacker in moving:
        while (assignments[place] != "None | "):
            place = (place + 1) % 391
        assignments[place] = hacker + " | "
        moving[hacker].table_number = number_to_table(place)
        place = (place + skip) % 391


def seed_hackers() -> None:
    """Sortof spreads out hackers amongst available seats."""
    place = 0
    for hacker in moving:
        while (assignments[place] != "None | "):
            place = place + 1
        assignments[place] = hacker + " | "
        moving[hacker].table_number = number_to_table(place)


def bulk_add_projects_local(projects) -> None:
    """Adds multiple projects from a dict of project names mapped to Project
    objects."""
    url = 'http://127.0.0.1:5000/api/projects/bulk_add'
    project_data = []
    for project_name in projects:
        info = {
            'table_number': projects[project_name].table_number,
            'project_name': project_name,
            'project_url': projects[project_name].project_url,
            'challenges': projects[project_name].challenges,
            'challenges_won': []
        }
        project_data.append(info)
    packet = {
        'projects': project_data
    }
    requests.post(url, json=packet)


def main() -> None:
    reader = csv.DictReader(open("sample-devpost-submissions-export.csv", "rt",
                                 encoding="utf8", errors='ignore'))

    parse_csv_internal(reader)
    seed_hackers()
    # fancy_seed_hackers()
    bulk_add_projects_local(not_moving)
    bulk_add_projects_local(moving)


if __name__ == "__main__":
    main()
