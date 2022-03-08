import React from 'react';
import * as mui from '@mui/material';

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
                <mui.Typography variant='h1' marginTop='30vh'>
                    404
                </mui.Typography>
            </div>
        );
    }
}

export default NotFoundPage;
