from bs4 import BeautifulSoup
import re
import urllib.request as ur
from typing import List, Tuple


def get_challenges(link: str) -> List[Tuple[str, str, int]]:
    """Given a devpost url, returns a list of companies and their challenges"""
    sock = ur.urlopen(link)
    soup = BeautifulSoup(sock, "html.parser")

    prizes = soup.find("article",
                       {"id": "prizes"}).find("ul").findAll("li")[1:]
    prizes = list(map(lambda x: x.find("h6").text.strip(), prizes))
    prizes = [i for i in prizes if "-" in i]

    for i in range(len(prizes)):
        description = prizes[i]
        print(description)
        name = "-".join(description.split("-")[:-1]).strip()
        company = description.split("\n")[0].split("-")[-1].strip()
        num = 1
        if re.search("\(\d+\)", description):  # noqa
            num = int(description.split("(")[-1].strip(")"))
        prizes[i] = (name, company, num)

    return prizes
