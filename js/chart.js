let accuracyChart = new Chart("accuracy", {
    type: "line",
    data: {
        labels: accuracyListTries,
        datasets: [{
            fill: false,
            backgroundColor: "rgb(226, 183, 20, 1.0)",
            borderColor: "rgb(226, 183, 20, 0.5)",
            pointRadius: 3,
            pointHoverRadius: 6,
            stepped: false,
            tension: 0.1,
            data: accuracyList
        }]
    },
    options: {
        legend: {
            display: false
        },
        title: {
            display: true,
            text: "accuracy history"
        },
        scales: {
            yAxes: [{
                ticks: {
                    max: 110,
                    min: 0
                }
            }]
        },
        responsive: true

    }
});
let wpmChart = new Chart("wpm", {
    type: "line",
    data: {
        labels: wpmListTries,
        datasets: [{
            fill: false,
            backgroundColor: "rgb(209, 208, 197, 1.0)",
            borderColor: "rgb(209, 208, 197, 0.5)",
            pointRadius: 3,
            pointHoverRadius: 6,
            stepped: true,
            tension: 0.1,
            data: wpmList
        }]
    },
    options: {
        legend: {
            display: false
        },
        title: {
            display: true,
            text: "words per minute history"
        },
        responsive: true
    }
});