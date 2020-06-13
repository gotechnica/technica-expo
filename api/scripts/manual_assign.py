import re
import requests
import helpers


def table_to_number(table: str) -> int:
    letter = table[0].upper()
    num = table[1:]
    return (ord(letter) - 65) * 15 + int(num)


# numeric value to table number: 210 -> N15, 1 -> A1
def number_to_table(number: int) -> str:
    letter = chr((int(number) - 1)//15 + 65)
    num = int(number) - (int(number) - 1)//15 * 15
    return str(letter) + str(num)


def available_tables() -> None:
    all_tables = list(map(lambda x: number_to_table(x), list(range(1, 391))))
    r = requests.get("https://expo-api.gotechnica.org/api/projects")

    taken = re.findall('\"table_number\": \"(\w\d+)\"', r.text)  # noqa
    taken.sort()
    open_tables = list(set(all_tables) - set(taken))
    open_tables.sort()

    print("Available tables: ")
    print(open_tables)


def add_project(table_number: int,
                project_url: str,
                project_name: str,
                challenges) -> None:
    s = helpers.login()
    url = "https://expo-api.gotechnica.org/api/projects/add"
    info = {
        'table_number': table_number,
        'project_name': project_name,
        'project_url': project_url,
        'challenges': challenges,
        'challenges_won': ""
    }
    s.post(url, json=info)


def main() -> None:
    project_name = input('What is the project name? ')
    project_url = input('What is the project URL? ')
    challenges = input('What prizes are they signed up for? ')
    available_tables()
    table_number = input('Choose an open table: ')
    add_project(table_number, project_url, project_name, challenges)


if __name__ == "__main__":
    main()
