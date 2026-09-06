import React, { useContext } from 'react';
import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import Chart from "react-apexcharts";
import { WebSocketContext } from '../../WebSocketContext';

const TransactionChart = () => {
  
  const { allTransactions } = useContext(WebSocketContext);
  const processData = () => {
    const dailyCounts = {};
    allTransactions.forEach(transaction => {
      const date = new Date(transaction.DATE_TRX).toLocaleDateString('fr-FR', { weekday: 'long' });
      if (!dailyCounts[date]) {
        dailyCounts[date] = { normal: 0, fraud: 0 };
      }
      if (transaction.IS_FRAUDULENT) {
        dailyCounts[date].fraud += 1;
      } else {
        dailyCounts[date].normal += 1;
      }
    });

    const categories = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
    const normalData = categories.map(day => dailyCounts[day]?.normal || 0);
    const fraudData = categories.map(day => dailyCounts[day]?.fraud || 0);

    return {
      series: [
        {
          name: "Transactions conformes",
          data: normalData
        },
        {
          name: "Transactions non conformes",
          data: fraudData
        }
      ],
      categories
    };
  };

  const { series, categories } = processData();

  const chartoptions = {
    series,
    options: {
      chart: {
        type: "area",
      },
      colors: ['#ec5444', '#f3b314'],
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
          text: 'Jour de la Semaine',
          style: {
            fontFamily: 'DIN Pro, sans-serif', // Use your custom font
            fontSize: '14px', // Customize the size
            fontWeight: 'bold', // Customize the weight
          }
        }
      },
      yaxis: {
        title: {
          text: 'Nombre de Transactions',
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
        <CardTitle tag="h5">Évolution des Transactions Conformes et Non Conformes</CardTitle>
        <CardSubtitle className="text-muted" tag="h6">
        Analyse hebdomadaire
        </CardSubtitle>
        <Chart
          type="area"
          width="100%"
          height="450"
          options={chartoptions.options}
          series={chartoptions.series}
        ></Chart>
      </CardBody>
    </Card>
  );
};

export default TransactionChart;
