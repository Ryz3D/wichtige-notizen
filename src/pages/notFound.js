import React from 'react';
import * as mui from '@mui/material';
import Helmet from 'react-helmet';

class NotFoundPage extends React.Component {
    render() {
        const rootStyle = {
            backgroundColor: '#000',
            position: 'fixed',
            top: '0',
            left: '0',
            minWidth: '100vw',
            minHeight: '100vh',
            color: '#fff',
            textAlign: 'center',
        };

        return (
            <div style={rootStyle}>
                <Helmet>
                    <title>
                        Notizen?
                    </title>
                </Helmet>
                <mui.Typography style={{marginTop: '40vh'}} variant='h1'>
                    404!
                </mui.Typography>
            </div>
        );
    }
}

export default NotFoundPage;
