import React from 'react';
import { Row, Col, Card,Breadcrumb,
  BreadcrumbItem  } from "reactstrap";
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

const PowerBI = () => {
    // Power BI embed configuration. All three values come from the environment
    // (see .env.example); nothing sensitive is committed to the repository.
    // NOTE: REACT_APP_* variables are baked into the JavaScript bundle and are
    // therefore visible to every visitor. The access token is short-lived and
    // must be refreshed per session -- see README > Troubleshooting for the
    // recommended backend token-endpoint approach.
    const reportId = process.env.REACT_APP_POWERBI_REPORT_ID;
    const embedConfig = {
        type: 'report', 
        id: reportId, 
        embedUrl: process.env.REACT_APP_POWERBI_EMBED_URL,
        accessToken: process.env.REACT_APP_POWERBI_ACCESS_TOKEN,
        tokenType: models.TokenType.Aad, 
        settings: {
          layoutType: models.LayoutType.Master,
          panes: {
              filters: {
                  expanded: false,
                  visible: false
              }
          }
      }
      };
    
      const eventHandlers = new Map([
        ['loaded', function () {
        }],
        ['rendered', function () {
        }],
        ['error', function (event) {
          console.error('Power BI embed error:', event.detail);
        }]
      ]);
    
      const getEmbeddedComponent = (embeddedReport) => {
        window.report = embeddedReport;
      };
  return (
    <Row style={{ width: '100%', height: '100%' }}>
            <Col style={{ height: '600px' }}>
            <Breadcrumb>
          <BreadcrumbItem active>Analytique</BreadcrumbItem>
        </Breadcrumb>
                <Card style={{ width: '100%', height: '100%' }}>
                <div className="report-container" style={{ width: '100%', height: '600px' }}>
                        <PowerBIEmbed
                            embedConfig={embedConfig}
                            eventHandlers={eventHandlers}
                            cssClassName="report-style-class"
                            getEmbeddedComponent={embeddedReport => {
                              window.report = embeddedReport;
                              const iframe = embeddedReport?.iframe;
                              if (iframe) {
                                  iframe.style.width = '100%';
                                  iframe.style.height = '600px';
                              }
                          }}
                            
                        />
                    </div>
                </Card>
            </Col>
        </Row>
  );
};

export default PowerBI;
