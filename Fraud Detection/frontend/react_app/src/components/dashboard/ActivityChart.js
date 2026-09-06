import React, { useContext } from 'react';
import { Card, CardBody, CardSubtitle, CardTitle } from 'reactstrap';
import Chart from 'react-apexcharts';
import { WebSocketContext } from '../../WebSocketContext';

const ActivityChart = () => {
    const { activities } = useContext(WebSocketContext);

    const processActivityData = () => {
        const activityCounts = {};
        activities.forEach(activity => {
            const date = new Date(activity.timestamp).toLocaleDateString('fr-FR', { weekday: 'long' });
            if (!activityCounts[date]) {
                activityCounts[date] = { login: 0, logout: 0 };
            }
            if (activity.action === 'login') {
                activityCounts[date].login += 1;
            } else if (activity.action === 'logout') {
                activityCounts[date].logout += 1;
            }
        });

        const categories = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
        const loginData = categories.map(day => activityCounts[day]?.login || 0);
        const logoutData = categories.map(day => activityCounts[day]?.logout || 0);

        return {
            series: [
                {
                    name: "Connexions",
                    data: loginData
                },
                {
                    name: "Déconnexions",
                    data: logoutData
                }
            ],
            categories
        };
    };

    const { series, categories } = processActivityData();

    const chartOptions = {
        series,
        
        options: {
            chart: {
                type: "line",
            },
            colors: ['#4CAF50', '#f44336'],
            dataLabels: {
                enabled: false,
            },
            grid: {
                show: false,
            },
            stroke: {
                curve: "smooth",
                width: 2,
            },
            xaxis: {
                categories,
                title: {
                    text: 'Jour de la semaine',
                    style: {
                      fontFamily: 'DIN Pro, sans-serif',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    },
                    offsetX: 0,  // Adjust this value to move the title closer to the y-axis
                    offsetY: -10
                  }
            },
            yaxis: {
                title: {
                  text: 'Nombre d`activités',
                  style: {
                    fontFamily: 'DIN Pro, sans-serif', // Use your custom font
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }
                },
                axisBorder: {
                  show: true, // This will show the y-axis line
                },
                axisTicks: {
                  show: true, // This will show the ticks on the y-axis
                },
                
              },
        },
    };

    return (
        <Card>
            <CardBody>
                <CardTitle tag="h5">Évolution de l'Activité des Utilisateurs</CardTitle>
                <CardSubtitle className="text-muted" tag="h6">
                    Analyse hebdomadaire
                </CardSubtitle>
                <Chart
                    type="line"
                    width="100%"
                    height="300"
                    options={chartOptions.options}
                    series={chartOptions.series}
                ></Chart>
            </CardBody>
        </Card>
    );
};

export default ActivityChart;
