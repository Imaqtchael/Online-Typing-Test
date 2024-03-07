let historyLogChart = new Chart("history-logs", {
    type: "line",
    data: {
        labels: logTries,
        datasets: [{
                label: "accuracy",
                fill: false,
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                borderColor: headerColor,
                pointRadius: 2,
                pointHoverRadius: 5,
                pointBackgroundColor: function(context) {
                    let maximumValueIndex = context.dataset.data.indexOf(Math.max(...context.dataset.data));
                    let minimumValueIndex = context.dataset.data.indexOf(Math.min(...context.dataset.data));
                    let index = context.dataIndex;
                    return maximumValueIndex == index ? "red" : minimumValueIndex == index ? "rgb(100, 102, 105, 1.0)" : headerColor;
                },
                tension: 0.3,
                data: accuracyList
            },
            {
                label: "wpm",
                fill: false,
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                borderColor: tertiaryColor,
                pointRadius: 2,
                pointHoverRadius: 5,
                pointBackgroundColor: function(context) {
                    let maximumValueIndex = context.dataset.data.indexOf(Math.max(...context.dataset.data));
                    let minimumValueIndex = context.dataset.data.indexOf(Math.min(...context.dataset.data));
                    let index = context.dataIndex;
                    return maximumValueIndex == index ? "red" : minimumValueIndex == index ? "rgb(100, 102, 105, 1.0)" : tertiaryColor;
                },
                tension: 0.3,
                data: wpmList
            }
        ]
    },
    options: {
        scales: {
            y: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 4
                }
            },
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        hover: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        }

    }
});

// let wpmChart = new Chart("wpm", {
//     type: "line",
//     data: {
//         labels: wpmListTries,
//         datasets: [{
//             label: "wpm",
//             fill: false,
//             backgroundColor: "rgba(226, 183, 20, 1.0)",
//             borderColor: "rgba(209, 208, 197, 0.5)",
//             pointRadius: 2,
//             pointHoverRadius: 5,
//             pointBackgroundColor: function(context) {
//                 let maximumValueIndex = context.dataset.data.indexOf(Math.max(...context.dataset.data));
//                 let minimumValueIndex = context.dataset.data.indexOf(Math.min(...context.dataset.data));
//                 let index = context.dataIndex;
//                 return maximumValueIndex == index ? "red" : minimumValueIndex == index ? "rgb(100, 102, 105, 1.0)" : "rgb(226, 183, 20, 1.0)";
//             },
//             tension: 0.3,
//             data: wpmList
//         }]
//     },
//     options: {
//         legend: {
//             display: false
//         },
//         title: {
//             display: true,
//             text: "words per minute history"
//         },
//         scales: {
//             x: {
//                 ticks: {
//                     autoSkip: true,
//                     maxTicksLimit: 10
//                 }
//             },
//             y: {
//                 ticks: {
//                     autoSkip: true,
//                     maxTicksLimit: 4
//                 }
//             }
//         },
//         tooltips: {
//             mode: 'index',
//             intersect: false
//         },
//         hover: {
//             mode: 'index',
//             intersect: false
//         },
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//             legend: {
//                 display: false
//             }
//         }
//     }
// });

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