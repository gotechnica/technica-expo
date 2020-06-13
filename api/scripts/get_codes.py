# Gets sponsor access codes
import helpers


def get_access_codes() -> None:
    s = helpers.login()

    url = "https://expo-api.gotechnica.org/api/companies"

    r2 = s.get(url)

    cs = set()

    for c in r2.json():
        cs.add(c['company_name'] + ' - ' + c['access_code'])

    for c in cs:
        print(c)


if __name__ == "__main__":
    get_access_codes()
