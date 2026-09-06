import React, { useContext } from 'react';
import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import Chart from "react-apexcharts";
import { WebSocketContext } from '../../WebSocketContext';

const AlertChart = () => {
  const { allAlerts } = useContext(WebSocketContext);

  const processData = () => {
    const dailyCounts = {};
    allAlerts.forEach(alert => {
      const date = new Date(alert.timestamp).toLocaleDateString('fr-FR', { weekday: 'long' });
      if (!dailyCounts[date]) {
        dailyCounts[date] = { high: 0, medium: 0, low: 0 };
      }

      if (alert.severity === 'high') {
        dailyCounts[date].high += 1;
      } else if (alert.severity === 'medium') {
        dailyCounts[date].medium += 1;
      } else {
        dailyCounts[date].low += 1;
      }
    });

    const categories = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
    const highData = categories.map(day => dailyCounts[day]?.high || 0);
    const mediumData = categories.map(day => dailyCounts[day]?.medium || 0);
    const lowData = categories.map(day => dailyCounts[day]?.low || 0);

    return {
      series: [
        {
          name: "Alertes d'une importance élevée",
          data: highData
        },
        {
          name: "Alertes d'une importance moyenne",
          data: mediumData
        },
        {
          name: "Alertes d'une importance faible",
          data: lowData
        }
      ],
      categories
    };
  };

  const { series, categories } = processData();

  const chartOptions = {
    series,
    options: {
      chart: {
        type: "bar",
      },
      colors: ['#f44336', '#ff9800', '#4caf50'], 
      dataLabels: {
        enabled: false,
      },
      grid: {
        show: false,
      },
      stroke: {
        curve: "smooth",
        width: 1,
      },
      xaxis: {
        categories,
        title: {
          text: 'Jour de la semaine',
          style: {
            fontFamily: 'DIN Pro, sans-serif', // Use your custom font
            fontSize: '14px',
            fontWeight: 'bold',
          },
          offsetX: 0,  // Adjust this value to move the title closer to the y-axis
        offsetY: -10
        }
      },
      yaxis: {
        title: {
          text: 'Nombre d`alertes',
          style: {
            fontFamily: 'DIN Pro, sans-serif', // Use your custom font
            fontSize: '14px',
            fontWeight: 'bold',
          },
          
        },
        axisBorder: {
          show: true, // This will show the y-axis line
        },
        axisTicks: {
          show: true, // This will show the ticks on the y-axis
        },
        
      }
    },
  };

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Évolution des Alertes</CardTitle>
        <CardSubtitle className="text-muted" tag="h6">
          Analyse hebdomaire
        </CardSubtitle>
        <Chart
          type="bar"
          width="100%"
          height="300"
          options={chartOptions.options}
          series={chartOptions.series}
        ></Chart>
      </CardBody>
    </Card>
  );
};

export default AlertChart;
