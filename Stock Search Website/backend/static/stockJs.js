
let allNews=[];
let companyInfo = {}, summaryInfo = {}, chartInfo = {}, newsInfo = [];

function resetSite() {
    let formElement = document.getElementById("form-id");
    formElement.reset();
    let navBarElement = document.getElementById("navbar");
    navBarElement.innerHTML = '';
    let resultElement = document.getElementById("result");
    resultElement.innerHTML = '';
}

function loadSite(){
    companyInfo = {}, summaryInfo = {}, chartInfo = {}, newsInfo = [];
    var ticker = document.getElementById("company_ticker").value.toUpperCase()
    getCompanyInfo(ticker);
}

function getCompanyInfo(ticker){
    fetch('/companyprofile?ticker=' + ticker)
    .then(response => response.json())
    .then(companyResponse => {
        companyInfo = companyResponse;
        getSummaryInfo(ticker);
        getCharts(ticker);
        getNews(ticker);
        renderNavBar();
        renderTable();
    });
    
    return false;
}

function renderNavBar(){
    let keys = Object.keys(companyInfo);
    let navBar=``;
    if(keys.length == 0){
        navBar = `<h2 class = "h2Error">Error : No record has been found, please enter a valid symbol</h2>`;
        document.getElementById('navbar').innerHTML = '';
        document.getElementById('result').innerHTML = navBar;
        return false;
    }
    else {
        navBar = `
            <nav>
            <ul>
                <li class="home active" onclick="renderTable();">Company</li>
                <li class="home" onclick="renderSummaryTable();">Stock Summary</li>
                <li class="home" onclick="renderCharts()">Charts</li>
                <li class="home" onclick="renderLatestNews()">Latest News</li>
            </ul>
            </nav>
        `;
        document.getElementById('navbar').innerHTML = navBar;
        const navElements = document.querySelectorAll(".home");
        navElements.forEach(navLinkElm => {
            navLinkElm.addEventListener('click', () =>{
                document.querySelector('.active')?.classList.remove('active');
                navLinkElm.classList.add('active');
            })
        });
        return true;
    }
}

function renderTable(){
    let keys = Object.keys(companyInfo);
    let table=``;
    if(keys.length == 0){
        return false;
    }
    else {
        table = `
            <table class="company-table">
                <tr id = "logo" class="table_row"><td align="center" colspan="2" class ="table_row"><div class="center"><img src="` + companyInfo['Company Logo'] + `" alt="logo icon" style="padding: 10px;"></div></td></tr> <tr class="table_row"><td class="table_key"> Company Name </td><td class="table_val">` + companyInfo['Company Name'] + `</td></tr> <tr class="table_row"><td class="table_key"> Stock Ticker Symbol </td><td class="table_val">` + companyInfo['Stock Ticker Symbol'] + `</td></tr> <tr class="table_row"><td class="table_key"> Stock Exchange Code </td><td class="table_val">` + companyInfo['Stock Exchange Code'] + `</td></tr> <tr class="table_row"><td class="table_key"> Company Start Date </td><td class="table_val">` + companyInfo['Company Start Date'] + `</td></tr> <tr class="table_row"><td class="table_key"> Category </td><td class="table_val">` + companyInfo['Category'] + `</td></tr>
            </table>
        `;
    }
    document.getElementById('result').innerHTML = table;
    return false;
}

function getSummaryInfo(ticker){
    fetch('/stocksummary?ticker=' + ticker)
    .then(response => response.json())
    .then(stockResponse => {
    summaryInfo = stockResponse;
    });
return false;
}

function renderSummaryTable(){
    let keys = Object.keys(summaryInfo);
    let table=``;
    let rec=``;
    if(keys.length == 0){
        table = ``
    }
    else if(keys.indexOf('Trading Day') != -1){
        let chanegImage = "static/img/GreenArrowUp.png";
        if(summaryInfo['Change'] < 0){
            chanegImage = "static/img/RedArrowDown.png";
        }
        let chanegPercImage = "static/img/GreenArrowUp.png";
        if(summaryInfo['Change Percent'] < 0){
            chanegPercImage = "static/img/RedArrowDown.png";
        }
        table = `
            <table class="company-table">
                <tr><td class="table_key" style="border-top: 1pt solid rgb(232 228 228);"> Stock Ticker Symbol </td><td class="table_val" style="border-top: 1pt solid rgb(232 228 228);">` + summaryInfo['Stock Ticker Symbol'] + `</td></tr> <tr><td class="table_key"> Trading Day </td><td class="table_val">` + summaryInfo['Trading Day'] + `</td></tr> <tr><td class="table_key"> Previous Closing Price </td><td class="table_val">` + summaryInfo['Previous Closing Price'] + `</td></tr> <tr><td class="table_key"> Opening Price </td><td class="table_val">` + summaryInfo['Opening Price'] + `</td></tr> <tr><td class="table_key"> High Price </td><td class="table_val">` + summaryInfo['High Price'] + `</td></tr> <tr><td class="table_key"> Low Price </td><td class="table_val">` + summaryInfo['Low Price'] + `</td></tr> <tr><td class="table_key"> Change </td><td class="table_val">` + summaryInfo['Change'] + `<img src="` + chanegImage +`" alt="arrow icon" class="resizeImage"></td></tr> <tr><td class="table_key"> Change Percent </td><td class="table_val">` + summaryInfo['Change Percent'] + `<img src="` + chanegPercImage + `" alt="arrow icon" class="resizeImage"></td></tr>
            </table>
            <div class="recommendation-bar center"> <div class="strong-sell">Strong Sell</div> <div id="rec-1" class="recNum">` + summaryInfo.strongSell + `</div> <div id="rec-2" class="recNum">` + summaryInfo.sell + `</div> <div id="rec-3" class="recNum">` + summaryInfo.hold + `</div> <div id="rec-4" class="recNum">` + summaryInfo.buy + `</div> <div id="rec-5" class="recNum">` + summaryInfo.strongBuy + `</div> <div class="strong-buy"> Strong Buy</div> </div>
            <div class ="center" style="text-align:center; padding:10px; letter-spacing: 0;font-size: 17px;color: #595858;"> Recommendation Trends</div>
        `;
    }
    document.getElementById('result').innerHTML = table;
}

function getCharts(ticker){
    fetch('/charts?ticker=' + ticker)
    .then(response => response.json())
    .then(chartResponse => {
        chartInfo = chartResponse;
    });
    
return false;
}

function renderCharts(){
    let keys = Object.keys(chartInfo);
    let table=``;
    if(keys.length == 0){
        table = ``
    }
    else{
        let stockPrice = [], volume = [], dataLength = chartInfo['data'].length, maxVol=0;
        for (let i = 0; i < dataLength; i += 1) {
            stockPrice.push([
                chartInfo.data[i]['Date'], 
                chartInfo.data[i]['Stock Price']
            ]);

            volume.push([
                chartInfo.data[i]['Date'],
                chartInfo.data[i]['Volume']
            ]);
            maxVol = Math.max(maxVol, chartInfo.data[i]['Volume']);
        }
        var titleName = 'Stock Price ' + chartInfo.ticker + ' ' + chartInfo.date;
        Highcharts.stockChart('result', {
            rangeSelector: {
                selected: 0,
                inputEnabled: false,
                buttons: [{
                    type: 'day',
                    count: 7,
                    text: '7d'
                }, {
                    type: 'day',
                    count: 15,
                    text: '15d'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }]
            },
            
            title: {
                text: titleName
            },

            subtitle: {
                text: `<a href="https://polygon.io/" target="_blank" class="subtitileLinkStyle"> Source: Polygon.io </a>`
            },
            xAxis:{
                gapGridLineWidth: 0
            },
            
            yAxis: [
            {
                title: {
                    text: 'Stock Price'
                },
                lineWidth: 0,
                opposite: false
            },
            {
                title: {
                    text: 'Volume'
                },
                max: 2*maxVol,
                min: 0,
                lineWidth: 0
            }],

            plotOptions: { 
                series: {
                    pointWidth: 5,
                    pointPlacement: 'on'
                }
            },

            series: [{
                type: 'area',
                name: 'Stock Price',
                panning: true,
                panKey: 'shift',
                yAxis: 0,
                data: stockPrice,
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                tooltip: {
                    valueDecimals: 2
                },
                threshold: null
            },{
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                color: '#000000'
            }]
        });
    }
}

function getNews(ticker){
    fetch('/latestnews?ticker=' + ticker)
    .then(response => response.json())
    .then(newResponse => {
    newsInfo = newResponse;
    });
    return false;
}

function renderLatestNews(){
    let table=``;
    if(newsInfo.length == 0){
        table = ``
    }
    table = `
        <table class="news-table" style="width: 1000px; border-spacing: 0 25px;">
        ${newsInfo.map(news => {
        return '<tr class="news-row"><td style="padding: 13px; width: 90px;"><img src="' + news.Image + '" alt = "news image" class="news-img"></td><td class="news-details"><p><span style="font-weight:bold;"> ' + news.Title + '</span></p><p style="margin:0; color:gray">' + news.Date + '</p><p><a href="' + news["Link to Original Post"] + '" target="_blank"> See Original Post </a></p></td></tr>';
        }).join("")}
        </table>
    `;
    document.getElementById('result').innerHTML = table;
}



