from flask import Flask, jsonify, send_from_directory
from flask import request
from jsonmerge import merge
import requests
from datetime import datetime
from dateutil.relativedelta import relativedelta

app = Flask(__name__)


api_key_finnhub = 'cmvhu89r01qhorppk99gcmvhu89r01qhorppk9a0'
api_key_polygon = 'qg8w4A5qKVS7xRmfWmtCOC72XsZWzhEx'
symbol = None

# API endpoints URL
company_endpoint = 'https://finnhub.io/api/v1/stock/profile2'
stock_summary_endpoint = 'https://finnhub.io/api/v1/quote'
recommendation_endpoint = 'https://finnhub.io/api/v1/stock/recommendation'


finnhub_payload = {'symbol': symbol, 'token': api_key_finnhub}
@app.route("/")
def event():
    return send_from_directory('.', 'index.html')


@app.route("/companyprofile", methods=['GET'])
def get_company_profile():
    symbol = request.args.get('ticker')
    finnhub_payload['symbol'] = symbol
    # print(finnhub_payload)
    response = requests.get(company_endpoint, params = finnhub_payload)
    company_details = {}
    # Check if the request was successful (status code 200)
    # print(response.json())
    if response.status_code != 200 or 'error' in response.json():
        return company_details
    
    company_profile = response.json()
    if 'ticker' not in company_profile:
        return company_details
    company_details = {
        'Company Logo' : company_profile['logo'] if 'logo' in company_profile else None,
        'Company Name' : company_profile['name'] if 'name' in company_profile else None,
        'Stock Ticker Symbol' : company_profile['ticker'] if 'ticker' in company_profile else None,
        'Stock Exchange Code' : company_profile['exchange'] if 'exchange' in company_profile else None,
        'Company Start Date' : company_profile['ipo'] if 'ipo' in company_profile else None,
        'Category' : company_profile['finnhubIndustry'] if 'finnhubIndustry' in company_profile else None
    }
    # print(company_details)
    return jsonify(company_details)


@app.route("/stocksummary", methods=['GET'])
def get_stock_summary():
    symbol = request.args.get('ticker')
    response_summary = requests.get(stock_summary_endpoint, params = finnhub_payload)
    response_rec = requests.get(recommendation_endpoint, params = finnhub_payload)
    stock_summary = build_stock_summary(response_summary.json(),response_rec.json(), symbol)
    return stock_summary


@app.route("/charts", methods=['GET'])
def get_chart():
    symbol = request.args.get('ticker')
    multiplier = '1'
    timespan = 'day'
    to_date = datetime.now()
    from_date = (to_date + relativedelta(months=-6, days=-1)).strftime('%Y-%m-%d')
    to_date = to_date.strftime('%Y-%m-%d')
    polygon_endpoint = f'https://api.polygon.io/v2/aggs/ticker/{symbol}/range/{multiplier}/{timespan}/{from_date}/{to_date}?adjusted=true&sort=asc&apiKey={api_key_polygon}'
    response_polygon = requests.get(polygon_endpoint)
    if response_polygon.status_code != 200 or 'error' in response_polygon.json():
        return {}
    response_polygon = response_polygon.json()['results']
    output_polygon = []
    for i in range(len(response_polygon)):
        output = {
            'Date' : response_polygon[i]['t'] if 't' in response_polygon[i] else None,
            'Stock Price' : response_polygon[i]['c'] if 'c' in response_polygon[i] else None,
            'Volume' : response_polygon[i]['v'] if 'v' in response_polygon[i] else None
        }
        output_polygon.append(output)
    output_json = {
        'ticker' : symbol,
        'date' : to_date,
        'data' : output_polygon
    }
    # print(output_json)
    return jsonify(output_json)


@app.route("/latestnews", methods=['GET'])
def get_news():
    news_payload = {
        'symbol' : request.args.get('ticker'),
        'to' : datetime.now().strftime('%Y-%m-%d'),
        'from' : (datetime.now() + relativedelta(days=-30)).strftime('%Y-%m-%d'),
        'token' : api_key_finnhub
    }
    news_endpoint = 'https://finnhub.io/api/v1/company-news'
    response_news = requests.get(news_endpoint, params = news_payload)
    if response_news.status_code != 200 or 'error' in response_news.json():
        return {}
    response_news = response_news.json()
    # print(response_news)
    news = []
    count = 0
    for i in range(len(response_news)):
        if 'image' in response_news[i] and len(response_news[i]['image']) != 0 and 'headline' in response_news[i] and len(response_news[i]['headline']) != 0 and 'datetime' in response_news[i] and response_news[i]['datetime'] is not None and 'url' in response_news[i] and len(response_news[i]['url']) != 0:
            news_obj = {
                'Image' : response_news[i]['image'],
                'Title' : response_news[i]['headline'],
                'Date' : datetime.utcfromtimestamp(response_news[i]['datetime']).strftime('%d %B, %Y'),
                'Link to Original Post' : response_news[i]['url']
            }
            news.append(news_obj)
            count += 1
        if count >= 5:
            break
    # print(news)
    return jsonify(news)


def build_stock_summary(summary_json, rec_json, ticker):
    stock_summary_obj = {}
    stock_summary_obj = {
        # 'Stock Ticker Symbol' : company_profile['ticker'] if 'ticker' in company_profile else None,
        'Stock Ticker Symbol' : ticker,
        'Trading Day' : datetime.fromtimestamp(summary_json['t']).strftime('%d %B, %Y') if 't' in summary_json else None,
        'Previous Closing Price' : summary_json['pc'] if 'pc' in summary_json else None,
        'Opening Price' : summary_json['o'] if 'o' in summary_json else None,
        'High Price' : summary_json['h'] if 'h' in summary_json else None,
        'Low Price' : summary_json['l'] if 'l' in summary_json else None,
        'Change' : summary_json['d'] if 'd' in summary_json else None,
        'Change Percent' : summary_json['dp'] if 'dp' in summary_json else None,
        'strongSell' : rec_json[0]['strongSell'] if len(rec_json) > 0 and 'strongSell' in rec_json[0] else None,
        'sell' : rec_json[0]['sell'] if len(rec_json) > 0 and 'sell' in rec_json[0] else None,
        'hold' : rec_json[0]['hold'] if len(rec_json) > 0 and 'hold' in rec_json[0] else None,
        'buy' : rec_json[0]['buy'] if len(rec_json) > 0 and 'buy' in rec_json[0] else None,
        'strongBuy' : rec_json[0]['strongBuy'] if len(rec_json) > 0 and 'strongBuy' in rec_json[0] else None,
    }

    return jsonify(stock_summary_obj)

if __name__ == '__main__':
    app.run(debug=True)