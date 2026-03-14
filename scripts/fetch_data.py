import requests
import json
import os
from datetime import datetime, timedelta

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1"


def fetch_data():
    if not os.path.exists("data"):
        os.makedirs("data")

    print("Fetching Actuals...")
    actuals_url = f"{BASE_URL}/datasets/FUELHH/stream?settlementDateFrom=2024-01-01&settlementDateTo=2024-01-31&fuelType=WIND"
    r = requests.get(actuals_url)
    if r.status_code == 200:
        with open("data/actuals_jan_2024.json", "w") as f:
            json.dump(r.json(), f)
        print("Actuals saved.")
    else:
        print(f"Failed to fetch actuals: {r.status_code}")

    print("Fetching Forecasts...")
    pub_from = "2023-12-30T00:00:00Z"
    pub_to = "2024-02-01T00:00:00Z"
    forecasts_url = f"{BASE_URL}/datasets/WINDFOR/stream?publishDateTimeFrom={pub_from}&publishDateTimeTo={pub_to}"
    r = requests.get(forecasts_url)
    if r.status_code == 200:
        with open("data/forecasts_jan_2024.json", "w") as f:
            json.dump(r.json(), f)
        print("Forecasts saved.")
    else:
        print(f"Failed to fetch forecasts: {r.status_code}")


if __name__ == "__main__":
    fetch_data()
