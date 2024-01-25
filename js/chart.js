let accuracyChart = new Chart("accuracy", {
    type: "line",
    data: {
        labels: accuracyListTries,
        datasets: [{
            fill: false,
            backgroundColor: "rgba(209, 208, 197, 1.0)",
            borderColor: "rgba(226, 183, 20, 0.5)",
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: function(context) {
                let maximumValueIndex = context.dataset.data.indexOf(Math.max(...context.dataset.data));
                let minimumValueIndex = context.dataset.data.indexOf(Math.min(...context.dataset.data));
                let index = context.dataIndex;
                return maximumValueIndex == index ? "red" : minimumValueIndex == index ? "rgb(100, 102, 105, 1.0)" : "rgb(209, 208, 197, 1.0)";
            },
            stepped: false,
            tension: 0.3,
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
        responsive: true,
        maintainAspectRatio: true

    }
});
let wpmChart = new Chart("wpm", {
    type: "line",
    data: {
        labels: wpmListTries,
        datasets: [{
            fill: false,
            backgroundColor: "rgba(226, 183, 20, 1.0)",
            borderColor: "rgba(209, 208, 197, 0.5)",
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: function(context) {
                let maximumValueIndex = context.dataset.data.indexOf(Math.max(...context.dataset.data));
                let minimumValueIndex = context.dataset.data.indexOf(Math.min(...context.dataset.data));
                let index = context.dataIndex;
                return maximumValueIndex == index ? "red" : minimumValueIndex == index ? "rgb(100, 102, 105, 1.0)" : "rgb(226, 183, 20, 1.0)";
            },
            stepped: true,
            tension: 0.3,
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
        responsive: true,
        maintainAspectRatio: true
    }
});

// let logChart = new Chart("wpm_accuracy", {
//     type: "line",
//     data: {
//         labels: currentTimeStamps,
//         datasets: [{
//             fill: false,
//             backgroundColor: "rgba(226, 183, 20, 1.0)",
//             borderColor: "rgba(226, 183, 20, 0.5)",
//             pointRadius: 2,
//             pointHoverRadius: 5,
//             pointBackgroundColor: function(context) {
//                 let maximumValueIndex = context.dataset.data.indexOf(Math.max(...context.dataset.data));
//                 let minimumValueIndex = context.dataset.data.indexOf(Math.min(...context.dataset.data));
//                 let index = context.dataIndex;
//                 return maximumValueIndex == index ? "red" : minimumValueIndex == index ? "rgb(100, 102, 105, 1.0)" : "rgb(226, 183, 20, 1.0)";
//             },
//             stepped: true,
//             tension: 0.5,
//             data: currentWPM
//         }]
//     },
//     options: {
//         legend: {
//             display: false
//         },
//         title: {
//             display: false
//         },
//         scales: {
//             xAxes: [{
//                 ticks: {
//                     autoSkip: true,
//                     maxTicksLimit: 10
//                 }
//             }]
//         },
//         responsive: true,
//         maintainAspectRatio: true
//     }
// });