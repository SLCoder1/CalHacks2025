import requests
from bs4 import BeautifulSoup

def scrape_election(state, position):
    # Example: Only supports Hawaii gubernatorial for now
    if position.lower() == "governor":
        url = 'https://ballotpedia.org/'+state.lower()+'_gubernatorial_election,_2022'
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        try:
            table_content = soup.find_all('div', {'class': 'results_table_container'})[1] \
                .find('table', {'class': 'results_table'}).find('tbody') \
                .find_all('tr', {'class': 'results_row'})
            results = []
            for tr in table_content:
                columns = tr.find_all('td')
                if len(columns) > 0:
                    candidate_name = columns[2].get_text(strip=True)
                    results.append({
                        "candidate": candidate_name,
                    })
            return results
        except Exception as e:
            return {"error": str(e)}
    else:
        return {"error": "State/position not supported yet."}
    
def scrape_description(candidate_name):
    url = f'https://ballotpedia.org/{candidate_name.replace(" ", "_")}'
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    try:
        description = soup.find_all('div', {'style': 'height:400px;overflow:scroll;border:1px solid gray;margin:20px;padding:10px;'})
        if not description:
            return {"error": "Description not found"}
        d = "".join([desc.get_text(strip=True) for desc in description])
        return {"description": d}
    except Exception as e:
        return {"error": str(e)}
#print(scrape_election("Hawaii", "Governor"))
print(scrape_description("Joshua Green"))

