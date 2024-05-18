document.addEventListener("DOMContentLoaded", function() {
    const balanceElement = document.getElementById('current-balance');
    const netLiqElement = document.getElementById('net-liq');
    const stockTable = document.getElementById('stock-table').getElementsByTagName('tbody')[0];
    const timerElement = document.getElementById('countdown');
    const transactionList = document.getElementById('transaction-list');
    let balance = 500;
    let countdown = 10; // Initial countdown time in seconds
    let netLiqValues = [500];

    const prefixes = [
        'Global', 'Tech', 'Innovative', 'United', 'Prime', 'Dynamic', 'Next', 'Future', 'Sky', 'Quantum',
        'Vision', 'Core', 'Bright', 'Pioneer', 'Elite', 'Advanced', 'Integrated', 'Pro', 'Infinite', 'Ultimate'
    ];

    const suffixes = [
        'Systems', 'Solutions', 'Industries', 'Technologies', 'Corporation', 'Enterprises', 'Holdings', 'Dynamics', 'Innovations', 'Logistics',
        'Networks', 'Ventures', 'Group', 'Partners', 'Labs', 'Works', 'Services', 'Consulting', 'Software', 'Energy'
    ];

    function getRandomStockName() {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${prefix} ${suffix}`;
    }

    function getRandomStockPrice() {
        return (Math.random() * 198 + 2).toFixed(2); // Random price between $2 and $200
    }

    const stocks = Array.from({ length: 20 }, () => ({
        name: getRandomStockName(),
        price: parseFloat(getRandomStockPrice()),
        owned: 0
    }));

    function renderStocks() {
        stockTable.innerHTML = '';
        stocks.forEach((stock, index) => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = stock.name;
            row.appendChild(nameCell);
            
            const priceCell = document.createElement('td');
            priceCell.textContent = `$${stock.price.toFixed(2)}`;
            row.appendChild(priceCell);
            
            const ownedCell = document.createElement('td');
            ownedCell.textContent = stock.owned;
            row.appendChild(ownedCell);
            
            const buyCell = document.createElement('td');
            const buyButton = document.createElement('button');
            buyButton.textContent = 'Buy';
            buyButton.disabled = balance < stock.price;
            buyButton.addEventListener('click', () => buyStock(index));
            buyCell.appendChild(buyButton);
            row.appendChild(buyCell);
            
            const sellCell = document.createElement('td');
            const sellButton = document.createElement('button');
            sellButton.textContent = 'Sell';
            sellButton.classList.add('sell');
            sellButton.disabled = stock.owned === 0;
            sellButton.addEventListener('click', () => sellStock(index));
            sellCell.appendChild(sellButton);
            row.appendChild(sellCell);
            
            stockTable.appendChild(row);
        });
    }

    function updatePrices() {
        countdown -= 1; // Decrement countdown timer
        timerElement.textContent = countdown; // Update displayed time
        
        // If countdown reaches 0, update prices and reset timer
        if (countdown === 0) {
            countdown = 10; // Reset countdown timer
            stocks.forEach(stock => {
                const change = (Math.random() * 0.06 - 0.03).toFixed(4); // Random change between -3% and 3%
                stock.price += stock.price * change;
                if (stock.price < 0.01) stock.price = 0.01; // Ensure price doesn't drop below $0.01
            });
            renderStocks();
        }
    }

    function buyStock(index) {
        const stock = stocks[index];
        if (balance >= stock.price) {
            const transactionAmount = stock.price;
            const transactionBalance = balance;
            
            balance -= transactionAmount;
            stock.owned += 1;
            balanceElement.textContent = balance.toFixed(2);
            renderStocks();

            recordTransaction(stock.name, 'Buy', transactionAmount, transactionBalance);
            updateBalanceAndChart(); // Update balance and chart after transaction
        }
    }

    function sellStock(index) {
        const stock = stocks[index];
        if (stock.owned > 0) {
            const transactionAmount = stock.price;
            const transactionBalance = balance;

            balance += transactionAmount;
            stock.owned -= 1;
            balanceElement.textContent = balance.toFixed(2);
            renderStocks();

            recordTransaction(stock.name, 'Sell', transactionAmount, transactionBalance);
            updateBalanceAndChart(); // Update balance and chart after transaction
        }
    }

    function recordTransaction(stockName, action, amount, balance) {
        const transactionItem = document.createElement('li');
        transactionItem.textContent = `${action}: ${stockName} - $${amount.toFixed(2)} | Balance: $${balance.toFixed(2)}`;
        transactionList.appendChild(transactionItem);
    }

    function updateBalanceAndChart() {

        // Update current balance
        balanceElement.textContent = balance.toFixed(2);
        document.getElementById('current-balance').textContent = balance.toFixed(2);

        const totalStockValue = stocks.reduce((total, stock) => total + stock.price * stock.owned, 0);
        const netLiq = balance + totalStockValue;
        netLiqElement.textContent = (netLiq).toFixed(2);

        netLiqValues.push(netLiq);
        if (netLiqValues.length > 200) {
            netLiqValues.shift();
        }

        // Update chart
        const labels = stocks.map(stock => stock.name);
        const data = stocks.map(stock => stock.price * stock.owned);
        updateChart(labels, data);
        updateNetLiqChart(netLiqValues);
    }

    function updateNetLiqChart(netLiqValues) {
        if (!window.netLiqChart) {
            const ctx = document.getElementById('net-liq-chart').getContext('2d');
            window.netLiqChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array.from({length: netLiqValues.length}, (_, i) => i + 1),
                    datasets: [{
                        label: 'Net Liquidation Value',
                        data: netLiqValues,
                        fill: false,
                        borderColor: 'rgba(255, 99, 132, 1)'
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } else {
            window.netLiqChart.data.labels = Array.from({length: netLiqValues.length}, (_, i) => i + 1);
            window.netLiqChart.data.datasets[0].data = netLiqValues;
            window.netLiqChart.update();
        }
    }

    function updateChart(labels, data) {
        if (!window.chart) {
            const ctx = document.getElementById('stock-chart').getContext('2d');
            window.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Value of Stocks',
                        data: data,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } else {
            window.chart.data.datasets[0].data = data;
            window.chart.update();
        }
    }

    function startGame() {
        renderStocks();
        setInterval(updatePrices, 1000); // Update timer every second
        updateBalanceAndChart(); // Update the balance and chart
    }

    startGame();
});

