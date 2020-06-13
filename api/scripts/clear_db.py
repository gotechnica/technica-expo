import helpers


def delete_project() -> None:
    s = helpers.login()

    project_name = input('What is the project name? ')
    url = "https://expo-api.gotechnica.org/api/projects/delete"

    payload = {
        'project_name': project_name,
    }
    r = s.delete(url, json=payload)
    print(r.url)


def delete_all_projects() -> None:
    s = helpers.login()

    url = "https://expo-api.gotechnica.org/api/projects/deleteAll"
    s.delete(url)


def main() -> None:
    # delete_project()
    delete_all_projects()


if __name__ == "__main__":
    main()
