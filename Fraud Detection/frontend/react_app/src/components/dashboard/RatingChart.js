import React, { useContext } from 'react';
import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import Chart from "react-apexcharts";
import { WebSocketContext } from '../../WebSocketContext';

const RatingChart = () => {
  const { allRatings } = useContext(WebSocketContext);
  
  const processData = () => {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    allRatings.forEach(rating => {
      if (rating.rating >= 1 && rating.rating <= 5) {
        ratingCounts[rating.rating] += 1;
      }
    });

    const categories = ['Très mauvais', 'Mauvais', 'Moyen', 'Bon', 'Excellent'];
    const data = [ratingCounts[1], ratingCounts[2], ratingCounts[3], ratingCounts[4], ratingCounts[5]];

    return {
      series: data,
      labels: categories
    };
  };

  const { series, labels } = processData();

  const chartOptions = {
    series,
    options: {
      chart: {
        type: "donut",
      },
      labels,
      colors: ['#f44336', '#ff9800', '#ffc107', '#8bc34a', '#4caf50'],
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`,
      },
      legend: {
        position: 'bottom',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '55%', // Adjust the size of the donut hole
          }
        }
      }
    },
  };

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h6">Répartition des Avis sur le Modèle IA</CardTitle>
        
        <Chart
          type="donut"
          width="100%"
          height="210"
          options={chartOptions.options}
          series={chartOptions.series}
        ></Chart>
      </CardBody>
    </Card>
  );
};

export default RatingChart;
