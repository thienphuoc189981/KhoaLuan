$(function () {
    Highcharts.chart('container', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Thống kê lượt tìm kiếm 12/2016'
        },
        xAxis: {
            title: {
                text: 'Ngày trong tháng'
            },
            categories: ['01-06', '07-13', '14-21', '21-26', '27-31']
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Số lượt tìm kiêm'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        },
        legend: {
            align: 'right',
            x: -30,
            verticalAlign: 'top',
            y: 25,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                }
            }
        },
        series: [{
            name: 'developer',
            data: [15, 18, 14, 13, 16]
        }, {
                name: 'lập trình viên',
                data: [14, 16, 15, 10, 8]
            }, {
                name: 'nhân viên kế toán',
                data: [14, 17, 9, 14, 14]
        },
            {
                name: 'Nodejs deveoper',
                data: [15, 18, 18, 17, 16]
            }, {
                name: 'thu ngân',
                data: [19, 16, 15, 19, 15]
            }]
    });
});