import React from 'react';

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
                <h1>
                    404!
                </h1>
            </div>
        );
    }
}

export default NotFoundPage;
