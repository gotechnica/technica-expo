from requests import session, sessions


def login() -> sessions.Session:
    password = input("Password: ")
    s = session()

    url = "https://expo-api.gotechnica.org/api/login/admin"
    payload = {
        'access_code': password
    }

    r = s.post(url, json=payload)
    print(r.content)

    return s


# helper method for printing stuff
def pretty_print_POST(req) -> None:
    print('{}\n{}\n{}\n\n{}'.format(
        '-----------START-----------',
        req.method + ' ' + req.url,
        '\n'.join('{}: {}'.format(k, v) for k, v in req.headers.items()),
        req.body,
    ))


# prints it in the order shown above
def prettyPrint(assignments) -> None:
    for i in range(1, 26):
        start = (i - 1) * 15
        end = start + 15
        print(' '.join(assignments[start:end]))
