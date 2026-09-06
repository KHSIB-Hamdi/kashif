import React, { useContext } from 'react';
import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import Chart from "react-apexcharts";
import { WebSocketContext } from '../../WebSocketContext';

const CompliancePieChart = () => {
  const { allTransactions } = useContext(WebSocketContext);

  // Process data to count compliant and non-compliant transactions
  const processData = () => {
    let compliantCount = 0;
    let nonCompliantCount = 0;

    allTransactions.forEach(transaction => {
      if (transaction.IS_FRAUDULENT) {
        nonCompliantCount += 1;
      } else {
        compliantCount += 1;
      }
    });

    return {
      series: [compliantCount, nonCompliantCount],
      labels: ['Conforme', 'Non Conforme']
    };
  };

  const { series, labels } = processData();

  // Configure the pie chart
  const chartOptions = {
    series,
    options: {
      chart: {
        type: "pie",
      },
      labels,
      colors: ['#ec5444', '#f3b314'],
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`,
      },
      legend: {
        position: 'bottom',
      }
    },
  };

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h6">Transactions Conformes vs. Non-Conformes</CardTitle>
        
        <Chart
          type="pie"
          width="100%"
          height="210"
          options={chartOptions.options}
          series={chartOptions.series}
        ></Chart>
      </CardBody>
    </Card>
  );
};

export default CompliancePieChart;